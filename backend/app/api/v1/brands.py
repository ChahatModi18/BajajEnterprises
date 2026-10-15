from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from app.services import catalogue_service

router = APIRouter(tags=["Brands"])

@router.get("/brands", response_model=List[BrandResponse])
def list_brands(db: Session = Depends(get_db)):
    return catalogue_service.get_brands(db, only_active=True)

@router.get("/brands/{slug}", response_model=BrandResponse)
def get_brand(slug: str, db: Session = Depends(get_db)):
    brand = catalogue_service.get_brand_by_slug(db, slug)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

# Admin endpoints
@router.get("/admin/brands", response_model=List[BrandResponse])
def admin_list_brands(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return catalogue_service.get_brands(db, only_active=False)

@router.post("/admin/brands", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def admin_create_brand(data: BrandCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return catalogue_service.create_brand(db, data)

@router.put("/admin/brands/{brand_id}", response_model=BrandResponse)
def admin_update_brand(brand_id: int, data: BrandUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    brand = catalogue_service.update_brand(db, brand_id, data)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.delete("/admin/brands/{brand_id}")
def admin_delete_brand(brand_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = catalogue_service.delete_brand(db, brand_id)
    if not success:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted successfully"}
