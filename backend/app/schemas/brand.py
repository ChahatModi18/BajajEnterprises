from typing import Optional
from pydantic import BaseModel, ConfigDict

class BrandBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class BrandResponse(BrandBase):
    id: int
    slug: str
    model_config = ConfigDict(from_attributes=True)
