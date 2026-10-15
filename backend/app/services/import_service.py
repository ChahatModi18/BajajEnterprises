import os
import csv
import io
import openpyxl
from typing import Dict, Any, List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import (
    CatalogueImport, Product, Brand, Category, 
    ProductAttribute, ProductAttributeValue
)
from app.services.catalogue_service import slugify

def parse_uploaded_file(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    ext = os.path.splitext(filename)[1].lower()
    rows: List[Dict[str, Any]] = []

    if ext == ".csv":
        text_stream = io.StringIO(file_bytes.decode('utf-8-sig', errors='replace'))
        reader = csv.DictReader(text_stream)
        for r in reader:
            # strip whitespaces in keys and values
            cleaned_row = {str(k).strip(): (str(v).strip() if v is not None else "") for k, v in r.items() if k}
            rows.append(cleaned_row)
    elif ext in {".xlsx", ".xls"}:
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
        sheet = wb.active
        headers = []
        for col_idx, cell in enumerate(sheet[1]):
            val = str(cell.value).strip() if cell.value is not None else f"col_{col_idx}"
            headers.append(val)
        
        for row_cells in sheet.iter_rows(min_row=2, values_only=True):
            if not any(row_cells):
                continue
            row_dict = {}
            for col_idx, cell_value in enumerate(row_cells):
                if col_idx < len(headers):
                    val = str(cell_value).strip() if cell_value is not None else ""
                    row_dict[headers[col_idx]] = val
            rows.append(row_dict)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only CSV and Excel (.xlsx) files are supported."
        )
    return rows

def create_import_record(db: Session, file: UploadFile) -> CatalogueImport:
    filename = file.filename or "catalogue.csv"
    ext = os.path.splitext(filename)[1].lower()
    file_bytes = file.file.read()
    
    rows = parse_uploaded_file(file_bytes, filename)
    if not rows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file contains no rows.")

    total_rows = len(rows)
    preview = rows[:10] # first 10 rows for preview

    import_rec = CatalogueImport(
        filename=filename,
        file_type=ext.replace(".", ""),
        total_rows=total_rows,
        valid_rows=0,
        error_rows=0,
        status="UPLOADED",
        preview_data_json=rows, # save full parsed data for validation/commit
        errors_json=[]
    )
    db.add(import_rec)
    db.commit()
    db.refresh(import_rec)
    return import_rec

def validate_import_data(db: Session, import_id: int, column_mapping: Optional[Dict[str, str]] = None) -> CatalogueImport:
    import_rec = db.query(CatalogueImport).filter(CatalogueImport.id == import_id).first()
    if not import_rec:
        raise HTTPException(status_code=404, detail="Catalogue import not found")

    rows = import_rec.preview_data_json or []
    errors: List[Dict[str, Any]] = []
    valid_count = 0

    existing_skus = {p.sku.upper() for p in db.query(Product.sku).all()}
    seen_file_skus = set()

    # Pre-cache brands, categories, and attributes
    brands_by_name = {b.name.lower(): b for b in db.query(Brand).all()}
    cats_by_name = {c.name.lower(): c for c in db.query(Category).all()}

    mapping = column_mapping or {}

    for idx, row in enumerate(rows, start=1):
        row_errors = []
        
        # Resolve mapped keys or default names
        name = row.get(mapping.get("name", "Name")) or row.get("name") or row.get("Product Name") or ""
        sku = row.get(mapping.get("sku", "SKU")) or row.get("sku") or row.get("Model Code") or ""
        brand_name = row.get(mapping.get("brand", "Brand")) or row.get("brand") or ""
        cat_name = row.get(mapping.get("category", "Category")) or row.get("category") or ""
        price_val = row.get(mapping.get("price", "Selling Price")) or row.get("price") or row.get("Price") or ""
        mrp_val = row.get(mapping.get("mrp", "MRP")) or row.get("mrp") or ""

        if not name:
            row_errors.append("Product name is required.")
        if not sku:
            row_errors.append("SKU / Model Code is required.")
        else:
            sku_upper = sku.upper()
            if sku_upper in existing_skus:
                row_errors.append(f"SKU '{sku}' already exists in live catalogue.")
            if sku_upper in seen_file_skus:
                row_errors.append(f"Duplicate SKU '{sku}' found within uploaded file.")
            seen_file_skus.add(sku_upper)

        if not brand_name:
            row_errors.append("Brand name is required.")
        elif brand_name.lower() not in brands_by_name:
            # Note: will be auto-created during commit or flagged
            pass

        if not cat_name:
            row_errors.append("Category is required.")

        if price_val:
            try:
                p = float(price_val.replace("₹", "").replace(",", "").strip())
                if p < 0:
                    row_errors.append("Price cannot be negative.")
            except ValueError:
                row_errors.append(f"Invalid numeric price '{price_val}'.")

        if row_errors:
            errors.append({
                "row_number": idx,
                "sku": sku,
                "name": name,
                "errors": row_errors
            })
        else:
            valid_count += 1

    import_rec.valid_rows = valid_count
    import_rec.error_rows = len(errors)
    import_rec.errors_json = errors
    import_rec.status = "VALIDATED" if len(errors) == 0 else "VALIDATED_WITH_ERRORS"
    db.commit()
    db.refresh(import_rec)
    return import_rec

def commit_import_data(db: Session, import_id: int, column_mapping: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    import_rec = db.query(CatalogueImport).filter(CatalogueImport.id == import_id).first()
    if not import_rec:
        raise HTTPException(status_code=404, detail="Catalogue import not found")

    rows = import_rec.preview_data_json or []
    mapping = column_mapping or {}

    created_products = 0
    brands_by_name = {b.name.lower(): b for b in db.query(Brand).all()}
    cats_by_name = {c.name.lower(): c for c in db.query(Category).all()}
    attrs_by_key = {a.key: a for a in db.query(ProductAttribute).all()}
    attrs_by_name = {a.name.lower(): a for a in db.query(ProductAttribute).all()}

    # Check error rows
    error_row_numbers = {e["row_number"] for e in (import_rec.errors_json or [])}

    for idx, row in enumerate(rows, start=1):
        if idx in error_row_numbers:
            continue # skip invalid rows

        name = row.get(mapping.get("name", "Name")) or row.get("name") or row.get("Product Name") or ""
        sku = row.get(mapping.get("sku", "SKU")) or row.get("sku") or row.get("Model Code") or ""
        brand_name = row.get(mapping.get("brand", "Brand")) or row.get("brand") or ""
        cat_name = row.get(mapping.get("category", "Category")) or row.get("category") or ""
        price_val = row.get(mapping.get("price", "Selling Price")) or row.get("price") or row.get("Price") or ""
        mrp_val = row.get(mapping.get("mrp", "MRP")) or row.get("mrp") or ""
        desc = row.get(mapping.get("description", "Description")) or row.get("description") or ""

        if not name or not sku:
            continue

        # Get or create brand
        b_key = brand_name.lower().strip()
        brand = brands_by_name.get(b_key)
        if not brand and brand_name:
            brand = Brand(name=brand_name.strip(), slug=slugify(brand_name))
            db.add(brand)
            db.flush()
            brands_by_name[b_key] = brand

        # Get or create category
        c_key = cat_name.lower().strip()
        cat = cats_by_name.get(c_key)
        if not cat and cat_name:
            cat = Category(name=cat_name.strip(), slug=slugify(cat_name))
            db.add(cat)
            db.flush()
            cats_by_name[c_key] = cat

        selling_price = None
        if price_val:
            try:
                selling_price = float(price_val.replace("₹", "").replace(",", "").strip())
            except ValueError:
                pass

        mrp = None
        if mrp_val:
            try:
                mrp = float(mrp_val.replace("₹", "").replace(",", "").strip())
            except ValueError:
                pass

        slug = f"{slugify(name)}-{slugify(sku)}"
        prod = Product(
            name=name,
            slug=slug,
            sku=sku,
            brand_id=brand.id if brand else 1,
            category_id=cat.id if cat else 1,
            selling_price=selling_price,
            mrp=mrp,
            description=desc,
            stock_quantity=5, # default initial import stock
            availability_status="IN_STOCK",
            is_published=True,
            is_demo=False
        )
        db.add(prod)
        db.flush()

        # Check for dynamic attributes in the row
        for col_name, col_val in row.items():
            if not col_val:
                continue
            attr = attrs_by_name.get(col_name.lower().strip())
            if not attr:
                attr = attrs_by_key.get(slugify(col_name).replace("-", "_"))
            if attr:
                pav = ProductAttributeValue(product_id=prod.id, attribute_id=attr.id)
                if attr.field_type in ('number', 'decimal'):
                    try:
                        pav.value_number = float(str(col_val).replace(",", "").strip())
                    except ValueError:
                        pav.value_text = str(col_val)
                elif attr.field_type == 'boolean':
                    pav.value_boolean = str(col_val).lower() in ("true", "yes", "1")
                else:
                    pav.value_text = str(col_val)
                db.add(pav)

        created_products += 1

    import_rec.status = "COMMITTED"
    db.commit()
    return {
        "status": "success",
        "imported_products_count": created_products,
        "import_id": import_rec.id
    }
