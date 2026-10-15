import re
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc
from app.models.entities import (
    Brand, Category, Product, ProductAttribute, 
    ProductAttributeValue, ProductImage, category_attributes
)
from app.schemas.brand import BrandCreate, BrandUpdate
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.attribute import AttributeCreate, AttributeUpdate, AttributeValueResponse
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

# --- BRANDS ---
def get_brands(db: Session, only_active: bool = False) -> List[Brand]:
    query = db.query(Brand)
    if only_active:
        query = query.filter(Brand.is_active == True)
    return query.order_by(Brand.sort_order.asc(), Brand.name.asc()).all()

def get_brand_by_id(db: Session, brand_id: int) -> Optional[Brand]:
    return db.query(Brand).filter(Brand.id == brand_id).first()

def get_brand_by_slug(db: Session, slug: str) -> Optional[Brand]:
    return db.query(Brand).filter(Brand.slug == slug).first()

def create_brand(db: Session, data: BrandCreate) -> Brand:
    slug = data.slug or slugify(data.name)
    existing = db.query(Brand).filter(Brand.slug == slug).first()
    if existing:
        slug = f"{slug}-{db.query(Brand).count() + 1}"
    brand = Brand(**data.model_dump(exclude={'slug'}), slug=slug)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

def update_brand(db: Session, brand_id: int, data: BrandUpdate) -> Optional[Brand]:
    brand = get_brand_by_id(db, brand_id)
    if not brand:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(brand, field, value)
    db.commit()
    db.refresh(brand)
    return brand

def delete_brand(db: Session, brand_id: int) -> bool:
    brand = get_brand_by_id(db, brand_id)
    if not brand:
        return False
    db.delete(brand)
    db.commit()
    return True

# --- CATEGORIES ---
def get_categories(db: Session, only_active: bool = False) -> List[Category]:
    query = db.query(Category)
    if only_active:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.sort_order.asc(), Category.name.asc()).all()

def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_slug(db: Session, slug: str) -> Optional[Category]:
    return db.query(Category).filter(Category.slug == slug).first()

def create_category(db: Session, data: CategoryCreate) -> Category:
    slug = data.slug or slugify(data.name)
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        slug = f"{slug}-{db.query(Category).count() + 1}"
    category = Category(**data.model_dump(exclude={'slug'}), slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Optional[Category]:
    category = get_category_by_id(db, category_id)
    if not category:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category

def delete_category(db: Session, category_id: int) -> bool:
    category = get_category_by_id(db, category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True

# --- DYNAMIC PRODUCT ATTRIBUTES ---
def get_attributes(db: Session, category_id: Optional[int] = None, only_active: bool = False) -> List[ProductAttribute]:
    query = db.query(ProductAttribute).options(joinedload(ProductAttribute.categories))
    if only_active:
        query = query.filter(ProductAttribute.is_active == True)
    if category_id:
        query = query.filter(
            or_(
                ProductAttribute.categories.any(Category.id == category_id),
                ~ProductAttribute.categories.any() # attributes that apply to all categories
            )
        )
    return query.order_by(ProductAttribute.sort_order.asc(), ProductAttribute.name.asc()).all()

def get_attribute_by_id(db: Session, attr_id: int) -> Optional[ProductAttribute]:
    return db.query(ProductAttribute).options(joinedload(ProductAttribute.categories)).filter(ProductAttribute.id == attr_id).first()

def get_attribute_by_key(db: Session, key: str) -> Optional[ProductAttribute]:
    return db.query(ProductAttribute).filter(ProductAttribute.key == key).first()

def create_attribute(db: Session, data: AttributeCreate) -> ProductAttribute:
    key = data.key or slugify(data.name).replace("-", "_")
    existing = db.query(ProductAttribute).filter(ProductAttribute.key == key).first()
    if existing:
        if not data.key:
            key = f"{key}_{db.query(ProductAttribute).count() + 1}"
        else:
            raise HTTPException(status_code=400, detail=f"Attribute with key '{key}' already exists.")
    attr = ProductAttribute(
        name=data.name,
        key=key,
        field_type=data.field_type,
        options_json=data.options_json,
        unit=data.unit,
        is_required=data.is_required,
        show_in_card=data.show_in_card,
        show_in_filters=data.show_in_filters,
        show_in_specs=data.show_in_specs,
        show_in_comparison=data.show_in_comparison,
        sort_order=data.sort_order,
        is_active=data.is_active
    )
    if data.category_ids:
        categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()
        attr.categories = categories
    db.add(attr)
    db.commit()
    db.refresh(attr)
    return attr

def update_attribute(db: Session, attr_id: int, data: AttributeUpdate) -> Optional[ProductAttribute]:
    attr = get_attribute_by_id(db, attr_id)
    if not attr:
        return None
    dump = data.model_dump(exclude_unset=True)
    if 'category_ids' in dump:
        category_ids = dump.pop('category_ids')
        if category_ids is not None:
            attr.categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
    for field, value in dump.items():
        setattr(attr, field, value)
    db.commit()
    db.refresh(attr)
    return attr

def delete_attribute(db: Session, attr_id: int) -> bool:
    attr = get_attribute_by_id(db, attr_id)
    if not attr:
        return False
    # Soft disable or remove
    db.delete(attr)
    db.commit()
    return True

# --- PRODUCTS ---
def format_product_response(product: Product) -> Dict[str, Any]:
    # Extract dynamic attributes
    attr_list: List[AttributeValueResponse] = []
    if product.attribute_values:
        for pav in product.attribute_values:
            attr = pav.attribute
            if not attr:
                continue
            # determine raw value based on type
            val: Any = None
            if attr.field_type in ('number', 'decimal'):
                val = pav.value_number
            elif attr.field_type == 'boolean':
                val = pav.value_boolean
            elif attr.field_type in ('dropdown', 'multiselect'):
                val = pav.value_json if pav.value_json is not None else pav.value_text
            else:
                val = pav.value_text

            attr_list.append(AttributeValueResponse(
                attribute_id=attr.id,
                attribute_name=attr.name,
                attribute_key=attr.key,
                field_type=attr.field_type,
                unit=attr.unit,
                show_in_card=attr.show_in_card,
                show_in_filters=attr.show_in_filters,
                show_in_specs=attr.show_in_specs,
                show_in_comparison=attr.show_in_comparison,
                value=val
            ))

    discount_pct: Optional[int] = None
    if product.mrp and product.selling_price and product.mrp > product.selling_price:
        discount_pct = int(round(((product.mrp - product.selling_price) / product.mrp) * 100))

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "sku": product.sku,
        "model_number": product.model_number,
        "brand_id": product.brand_id,
        "category_id": product.category_id,
        "selling_price": product.selling_price,
        "mrp": product.mrp,
        "is_discounted": product.is_discounted or (discount_pct is not None and discount_pct > 0),
        "discount_percentage": discount_pct,
        "stock_quantity": product.stock_quantity,
        "availability_status": product.availability_status,
        "description": product.description,
        "warranty_info": product.warranty_info,
        "delivery_info": product.delivery_info,
        "is_featured": product.is_featured,
        "is_new_arrival": product.is_new_arrival,
        "is_bestseller": product.is_bestseller,
        "is_published": product.is_published,
        "is_demo": product.is_demo,
        "is_archived": product.is_archived,
        "sort_order": product.sort_order,
        "brand": product.brand,
        "category": product.category,
        "images": product.images or [],
        "attributes": attr_list
    }

def get_products(
    db: Session,
    page: int = 1,
    page_size: int = 12,
    search: Optional[str] = None,
    brand_id: Optional[int] = None,
    brand_slug: Optional[str] = None,
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    availability: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    is_bestseller: Optional[bool] = None,
    include_unpublished: bool = False,
    sort_by: str = "newest", # newest, price_asc, price_desc, name_asc
    attribute_filters: Optional[Dict[str, Any]] = None
) -> Tuple[List[Dict[str, Any]], int]:
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.attribute_values).joinedload(ProductAttributeValue.attribute)
    ).filter(Product.is_archived == False)

    if not include_unpublished:
        query = query.filter(Product.is_published == True)

    if brand_id:
        query = query.filter(Product.brand_id == brand_id)
    elif brand_slug:
        query = query.join(Product.brand).filter(Brand.slug == brand_slug)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category_slug:
        query = query.join(Product.category).filter(Category.slug == category_slug)

    if min_price is not None:
        query = query.filter(Product.selling_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.selling_price <= max_price)

    if availability:
        query = query.filter(Product.availability_status == availability)

    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_new_arrival is not None:
        query = query.filter(Product.is_new_arrival == is_new_arrival)
    if is_bestseller is not None:
        query = query.filter(Product.is_bestseller == is_bestseller)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.sku.ilike(search_pattern),
                Product.model_number.ilike(search_pattern),
                Product.description.ilike(search_pattern)
            )
        )

    # Dynamic attribute filters (e.g. wheel_size, gear_count)
    if attribute_filters:
        for attr_key, attr_val in attribute_filters.items():
            if attr_val:
                attr = db.query(ProductAttribute).filter(ProductAttribute.key == attr_key).first()
                if attr:
                    subquery = db.query(ProductAttributeValue.product_id).filter(
                        ProductAttributeValue.attribute_id == attr.id
                    )
                    if attr.field_type in ('number', 'decimal'):
                        try:
                            subquery = subquery.filter(ProductAttributeValue.value_number == float(attr_val))
                        except ValueError:
                            pass
                    else:
                        subquery = subquery.filter(
                            or_(
                                ProductAttributeValue.value_text == str(attr_val),
                                ProductAttributeValue.value_text.ilike(f"%{attr_val}%")
                            )
                        )
                    query = query.filter(Product.id.in_(subquery))

    total = query.count()

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.selling_price.asc().nullslast())
    elif sort_by == "price_desc":
        query = query.order_by(Product.selling_price.desc().nullslast())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    else: # newest
        query = query.order_by(Product.created_at.desc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    formatted = [format_product_response(p) for p in items]
    return formatted, total

def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.attribute_values).joinedload(ProductAttributeValue.attribute)
    ).filter(Product.id == product_id).first()

def get_product_by_slug(db: Session, slug: str) -> Optional[Dict[str, Any]]:
    product = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.attribute_values).joinedload(ProductAttributeValue.attribute)
    ).filter(Product.slug == slug, Product.is_archived == False).first()
    if not product:
        return None
    return format_product_response(product)

def create_product(db: Session, data: ProductCreate) -> Product:
    slug = data.slug or slugify(data.name)
    existing = db.query(Product).filter(Product.slug == slug).first()
    if existing:
        slug = f"{slug}-{data.sku.lower()}"

    prod_dict = data.model_dump(exclude={'slug', 'attributes'})
    product = Product(**prod_dict, slug=slug)
    db.add(product)
    db.flush()

    # Save dynamic attributes
    if data.attributes:
        for attr_input in data.attributes:
            attr = None
            if attr_input.attribute_id:
                attr = db.query(ProductAttribute).filter(ProductAttribute.id == attr_input.attribute_id).first()
            elif attr_input.attribute_key:
                attr = db.query(ProductAttribute).filter(ProductAttribute.key == attr_input.attribute_key).first()
            if not attr:
                continue

            pav = ProductAttributeValue(product_id=product.id, attribute_id=attr.id)
            val = attr_input.value
            if attr.field_type in ('number', 'decimal'):
                try:
                    pav.value_number = float(val) if val is not None else None
                except (ValueError, TypeError):
                    pass
            elif attr.field_type == 'boolean':
                pav.value_boolean = bool(val) if val is not None else None
            elif attr.field_type in ('dropdown', 'multiselect'):
                if isinstance(val, (list, dict)):
                    pav.value_json = val
                else:
                    pav.value_text = str(val) if val is not None else None
            else:
                pav.value_text = str(val) if val is not None else None
            db.add(pav)

    db.commit()
    db.refresh(product)
    return product

def update_product(db: Session, product_id: int, data: ProductUpdate) -> Optional[Product]:
    product = get_product_by_id(db, product_id)
    if not product:
        return None

    dump = data.model_dump(exclude_unset=True)
    attributes_data = dump.pop('attributes', None)

    for field, value in dump.items():
        setattr(product, field, value)

    if attributes_data is not None:
        for attr_input in attributes_data:
            attr = None
            attr_id = attr_input.get('attribute_id')
            attr_key = attr_input.get('attribute_key')
            val = attr_input.get('value')
            if attr_id:
                attr = db.query(ProductAttribute).filter(ProductAttribute.id == attr_id).first()
            elif attr_key:
                attr = db.query(ProductAttribute).filter(ProductAttribute.key == attr_key).first()
            if not attr:
                continue

            pav = db.query(ProductAttributeValue).filter(
                ProductAttributeValue.product_id == product.id,
                ProductAttributeValue.attribute_id == attr.id
            ).first()
            if not pav:
                pav = ProductAttributeValue(product_id=product.id, attribute_id=attr.id)
                db.add(pav)

            if attr.field_type in ('number', 'decimal'):
                try:
                    pav.value_number = float(val) if val is not None else None
                except (ValueError, TypeError):
                    pav.value_number = None
            elif attr.field_type == 'boolean':
                pav.value_boolean = bool(val) if val is not None else None
            elif attr.field_type in ('dropdown', 'multiselect'):
                if isinstance(val, (list, dict)):
                    pav.value_json = val
                else:
                    pav.value_text = str(val) if val is not None else None
            else:
                pav.value_text = str(val) if val is not None else None

    db.commit()
    db.refresh(product)
    return product

def duplicate_product(db: Session, product_id: int) -> Optional[Product]:
    source = get_product_by_id(db, product_id)
    if not source:
        return None
    new_sku = f"{source.sku}-COPY-{db.query(Product).count() + 1}"
    new_name = f"{source.name} (Copy)"
    new_slug = f"{source.slug}-copy-{db.query(Product).count() + 1}"

    new_prod = Product(
        name=new_name,
        slug=new_slug,
        sku=new_sku,
        model_number=source.model_number,
        brand_id=source.brand_id,
        category_id=source.category_id,
        selling_price=source.selling_price,
        mrp=source.mrp,
        is_discounted=source.is_discounted,
        stock_quantity=source.stock_quantity,
        availability_status=source.availability_status,
        description=source.description,
        warranty_info=source.warranty_info,
        delivery_info=source.delivery_info,
        is_published=False, # drafts by default
        is_featured=False,
        is_demo=False
    )
    db.add(new_prod)
    db.flush()

    for pav in source.attribute_values:
        new_pav = ProductAttributeValue(
            product_id=new_prod.id,
            attribute_id=pav.attribute_id,
            value_text=pav.value_text,
            value_number=pav.value_number,
            value_boolean=pav.value_boolean,
            value_json=pav.value_json
        )
        db.add(new_pav)

    db.commit()
    db.refresh(new_prod)
    return new_prod

def delete_product(db: Session, product_id: int, hard_delete: bool = False) -> bool:
    product = get_product_by_id(db, product_id)
    if not product:
        return False
    if hard_delete:
        db.delete(product)
    else:
        product.is_archived = True
        product.is_published = False
    db.commit()
    return True
