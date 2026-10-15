from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.brand import BrandResponse
from app.schemas.category import CategoryResponse
from app.schemas.attribute import AttributeValueInput, AttributeValueResponse

class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool
    sort_order: int
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    sku: str
    model_number: Optional[str] = None
    brand_id: int
    category_id: int
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    is_discounted: bool = False
    stock_quantity: int = 0
    availability_status: str = "IN_STOCK" # IN_STOCK, LOW_STOCK, OUT_OF_STOCK, ON_ENQUIRY
    description: Optional[str] = None
    warranty_info: Optional[str] = None
    delivery_info: Optional[str] = None
    is_featured: bool = False
    is_new_arrival: bool = False
    is_bestseller: bool = False
    is_published: bool = True
    is_demo: bool = False
    is_archived: bool = False
    sort_order: int = 0

class ProductCreate(ProductBase):
    slug: Optional[str] = None
    attributes: Optional[List[AttributeValueInput]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    sku: Optional[str] = None
    model_number: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    is_discounted: Optional[bool] = None
    stock_quantity: Optional[int] = None
    availability_status: Optional[str] = None
    description: Optional[str] = None
    warranty_info: Optional[str] = None
    delivery_info: Optional[str] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_published: Optional[bool] = None
    is_demo: Optional[bool] = None
    is_archived: Optional[bool] = None
    sort_order: Optional[int] = None
    attributes: Optional[List[AttributeValueInput]] = None

class ProductResponse(ProductBase):
    id: int
    slug: str
    brand: Optional[BrandResponse] = None
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    attributes: List[AttributeValueResponse] = []
    discount_percentage: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
