from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User, CatalogueImport
from app.schemas.product import ProductImageResponse
from app.services import image_service, import_service

router = APIRouter(tags=["Media & Imports"])

# General image upload for banners/schemes/logos
@router.post("/admin/upload-image")
def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    image_url, thumb_url = image_service.save_uploaded_image(file)
    return {
        "image_url": image_url,
        "thumbnail_url": thumb_url
    }

# Product-specific image management
@router.post("/admin/products/{product_id}/images", response_model=ProductImageResponse)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    is_primary: bool = Form(False),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    img = image_service.add_product_image(
        db=db,
        product_id=product_id,
        file=file,
        alt_text=alt_text,
        is_primary=is_primary
    )
    return img

@router.patch("/admin/products/{product_id}/images/{image_id}/primary", response_model=ProductImageResponse)
def make_primary_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return image_service.set_primary_image(db, product_id, image_id)

@router.delete("/admin/products/{product_id}/images/{image_id}")
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = image_service.delete_product_image(db, product_id, image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}

# Catalogue Bulk Import
@router.post("/admin/catalogue-imports/upload")
def upload_catalogue_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    import_rec = import_service.create_import_record(db, file)
    return {
        "import_id": import_rec.id,
        "filename": import_rec.filename,
        "total_rows": import_rec.total_rows,
        "status": import_rec.status,
        "preview_data": import_rec.preview_data_json[:10] if import_rec.preview_data_json else []
    }

@router.get("/admin/catalogue-imports")
def list_catalogue_imports(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    imports = db.query(CatalogueImport).order_by(CatalogueImport.created_at.desc()).all()
    return [{
        "id": i.id,
        "filename": i.filename,
        "file_type": i.file_type,
        "total_rows": i.total_rows,
        "valid_rows": i.valid_rows,
        "error_rows": i.error_rows,
        "status": i.status,
        "created_at": i.created_at
    } for i in imports]

@router.get("/admin/catalogue-imports/{import_id}")
def get_catalogue_import_detail(
    import_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    import_rec = db.query(CatalogueImport).filter(CatalogueImport.id == import_id).first()
    if not import_rec:
        raise HTTPException(status_code=404, detail="Import not found")
    return {
        "id": import_rec.id,
        "filename": import_rec.filename,
        "total_rows": import_rec.total_rows,
        "valid_rows": import_rec.valid_rows,
        "error_rows": import_rec.error_rows,
        "status": import_rec.status,
        "errors": import_rec.errors_json or [],
        "preview_data": import_rec.preview_data_json[:10] if import_rec.preview_data_json else []
    }

@router.post("/admin/catalogue-imports/{import_id}/validate")
def validate_catalogue_import(
    import_id: int,
    column_mapping: Optional[Dict[str, str]] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    import_rec = import_service.validate_import_data(db, import_id, column_mapping)
    return {
        "import_id": import_rec.id,
        "status": import_rec.status,
        "valid_rows": import_rec.valid_rows,
        "error_rows": import_rec.error_rows,
        "errors": import_rec.errors_json or []
    }

@router.post("/admin/catalogue-imports/{import_id}/commit")
def commit_catalogue_import(
    import_id: int,
    column_mapping: Optional[Dict[str, str]] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return import_service.commit_import_data(db, import_id, column_mapping)
