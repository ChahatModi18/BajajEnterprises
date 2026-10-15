from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    slug: str
    model_config = ConfigDict(from_attributes=True)
