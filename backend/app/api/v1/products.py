from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services import catalogue_service

router = APIRouter(tags=["Products"])

@router.get("/products", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
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
    sort_by: str = Query("newest", pattern="^(newest|price_asc|price_desc|name_asc)$"),
    wheel_size: Optional[str] = None,
    gear_count: Optional[str] = None,
    db: Session = Depends(get_db)
):
    attr_filters = {}
    if wheel_size:
        attr_filters["wheel_size"] = wheel_size
    if gear_count:
        attr_filters["gear_count"] = gear_count

    items, total = catalogue_service.get_products(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        brand_id=brand_id,
        brand_slug=brand_slug,
        category_id=category_id,
        category_slug=category_slug,
        min_price=min_price,
        max_price=max_price,
        availability=availability,
        is_featured=is_featured,
        is_new_arrival=is_new_arrival,
        is_bestseller=is_bestseller,
        include_unpublished=False,
        sort_by=sort_by,
        attribute_filters=attr_filters
    )
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/products/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = catalogue_service.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Admin endpoints
@router.get("/admin/products", response_model=ProductListResponse)
def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    brand_id: Optional[int] = None,
    category_id: Optional[int] = None,
    sort_by: str = Query("newest"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    items, total = catalogue_service.get_products(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        brand_id=brand_id,
        category_id=category_id,
        include_unpublished=True, # admins see drafts and unpublished
        sort_by=sort_by
    )
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/admin/products/{product_id}", response_model=ProductResponse)
def admin_get_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    product = catalogue_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return catalogue_service.format_product_response(product)

@router.post("/admin/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def admin_create_product(data: ProductCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    product = catalogue_service.create_product(db, data)
    return catalogue_service.format_product_response(product)

@router.put("/admin/products/{product_id}", response_model=ProductResponse)
def admin_update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    product = catalogue_service.update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return catalogue_service.format_product_response(product)

@router.post("/admin/products/{product_id}/duplicate", response_model=ProductResponse)
def admin_duplicate_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    product = catalogue_service.duplicate_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return catalogue_service.format_product_response(product)

@router.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = catalogue_service.delete_product(db, product_id, hard_delete=False)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product archived successfully"}
