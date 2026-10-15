from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services import catalogue_service

router = APIRouter(tags=["Categories"])

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return catalogue_service.get_categories(db, only_active=True)

@router.get("/categories/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = catalogue_service.get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# Admin endpoints
@router.get("/admin/categories", response_model=List[CategoryResponse])
def admin_list_categories(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return catalogue_service.get_categories(db, only_active=False)

@router.post("/admin/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def admin_create_category(data: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return catalogue_service.create_category(db, data)

@router.put("/admin/categories/{category_id}", response_model=CategoryResponse)
def admin_update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    category = catalogue_service.update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/admin/categories/{category_id}")
def admin_delete_category(category_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = catalogue_service.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
