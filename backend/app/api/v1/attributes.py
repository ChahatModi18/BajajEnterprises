from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User
from app.schemas.attribute import AttributeCreate, AttributeUpdate, AttributeResponse
from app.services import catalogue_service

router = APIRouter(tags=["Dynamic Attributes"])

def format_attr_response(attr) -> dict:
    return {
        "id": attr.id,
        "name": attr.name,
        "key": attr.key,
        "field_type": attr.field_type,
        "options_json": attr.options_json,
        "unit": attr.unit,
        "is_required": attr.is_required,
        "show_in_card": attr.show_in_card,
        "show_in_filters": attr.show_in_filters,
        "show_in_specs": attr.show_in_specs,
        "show_in_comparison": attr.show_in_comparison,
        "sort_order": attr.sort_order,
        "is_active": attr.is_active,
        "category_ids": [c.id for c in attr.categories] if attr.categories else []
    }

@router.get("/attributes", response_model=List[AttributeResponse])
def list_public_attributes(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    attrs = catalogue_service.get_attributes(db, category_id=category_id, only_active=True)
    return [format_attr_response(a) for a in attrs]

# Admin endpoints
@router.get("/admin/attributes", response_model=List[AttributeResponse])
def admin_list_attributes(category_id: Optional[int] = None, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    attrs = catalogue_service.get_attributes(db, category_id=category_id, only_active=False)
    return [format_attr_response(a) for a in attrs]

@router.post("/admin/attributes", response_model=AttributeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_attribute(data: AttributeCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    attr = catalogue_service.create_attribute(db, data)
    return format_attr_response(attr)

@router.put("/admin/attributes/{attr_id}", response_model=AttributeResponse)
def admin_update_attribute(attr_id: int, data: AttributeUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    attr = catalogue_service.update_attribute(db, attr_id, data)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return format_attr_response(attr)

@router.delete("/admin/attributes/{attr_id}")
def admin_delete_attribute(attr_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = catalogue_service.delete_attribute(db, attr_id)
    if not success:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return {"message": "Attribute deleted successfully"}
