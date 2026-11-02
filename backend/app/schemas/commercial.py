import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict, Field

# --- BANNERS ---
class BannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    button_text: str = "Explore Now"
    is_active: bool = True
    sort_order: int = 0

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    button_text: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class BannerResponse(BannerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMES ---
class SchemeBase(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    discount_type: Optional[str] = None # PERCENT, FIXED, OFFER
    discount_value: Optional[float] = None
    eligibility: Optional[str] = None
    terms: Optional[str] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    is_active: bool = True

class SchemeCreate(SchemeBase):
    product_ids: Optional[List[int]] = []
    category_ids: Optional[List[int]] = []

class SchemeUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    eligibility: Optional[str] = None
    terms: Optional[str] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    is_active: Optional[bool] = None
    product_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None

class SchemeResponse(SchemeBase):
    id: int
    slug: str
    product_ids: List[int] = []
    category_ids: List[int] = []
    model_config = ConfigDict(from_attributes=True)

# --- ENQUIRIES ---
class EnquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=7, max_length=32)
    email: Optional[EmailStr] = None
    category: str = Field(default="General", max_length=80)
    product_id: Optional[int] = Field(default=None, gt=0)
    message: str = Field(min_length=1, max_length=5000)
    preferred_contact: str = Field(default="Phone", max_length=20) # Phone, WhatsApp, Email
    honeypot: Optional[str] = Field(default=None, max_length=255) # Spam prevention

class EnquiryStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50) # NEW, CONTACTED, AWAITING_CUSTOMER, RESOLVED, CLOSED
    internal_notes: Optional[str] = Field(default=None, max_length=5000)
    follow_up_date: Optional[datetime.datetime] = None

class EnquiryResponse(BaseModel):
    id: int
    reference_no: str
    name: str
    phone: str
    email: Optional[str] = None
    category: str
    product_id: Optional[int] = None
    message: str
    preferred_contact: str
    status: str
    internal_notes: Optional[str] = None
    follow_up_date: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    product_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EnquiryPageResponse(BaseModel):
    items: List[EnquiryResponse]
    total: int
    counts: Dict[str, int]
    page: int
    page_size: int

# --- CART & ORDER REQUEST ---
class CartItemInput(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1, le=100)

class CartCalculationItem(BaseModel):
    product_id: int
    name: str
    sku: str
    image_url: Optional[str] = None
    unit_price: float
    mrp: Optional[float] = None
    quantity: int
    subtotal: float
    in_stock: bool
    stock_quantity: int

class CartCalculationResponse(BaseModel):
    items: List[CartCalculationItem]
    subtotal: float
    discount_total: float
    estimated_total: float
    total_items_count: int
    has_out_of_stock_items: bool

class OrderRequestItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    product_sku: str
    unit_price: float
    quantity: int
    subtotal: float
    model_config = ConfigDict(from_attributes=True)

class OrderRequestCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: str = Field(min_length=7, max_length=50)
    customer_email: Optional[EmailStr] = None
    delivery_preference: str = "PICKUP" # PICKUP, DELIVERY
    address_line1: Optional[str] = Field(default=None, max_length=255)
    address_line2: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default="Bikaner", max_length=100)
    state: Optional[str] = Field(default="Rajasthan", max_length=100)
    postal_code: Optional[str] = Field(default="334001", max_length=20)
    notes: Optional[str] = Field(default=None, max_length=5000)
    items: List[CartItemInput] = Field(min_length=1, max_length=50)
    honeypot: Optional[str] = None

class OrderRequestStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50) # RECEIVED, UNDER_REVIEW, CONFIRMED, FULFILLED, CANCELLED
    internal_notes: Optional[str] = Field(default=None, max_length=5000)

class OrderRequestResponse(BaseModel):
    id: int
    reference_no: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    delivery_preference: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    notes: Optional[str] = None
    status: str
    total_amount: float
    internal_notes: Optional[str] = None
    created_at: datetime.datetime
    items: List[OrderRequestItemResponse]
    model_config = ConfigDict(from_attributes=True)

class OrderRequestPageResponse(BaseModel):
    items: List[OrderRequestResponse]
    total: int
    counts: Dict[str, int]
    page: int
    page_size: int


# --- FEEDBACK & RATINGS ---
class FeedbackCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=120)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=5000)
    bicycle_model: Optional[str] = Field(default=None, max_length=150)
    service_type: Optional[str] = Field(default="Showroom Purchase", max_length=50)
    honeypot: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    name: str
    rating: int
    comment: str
    bicycle_model: Optional[str] = None
    service_type: Optional[str] = None
    is_approved: bool
    is_featured: bool
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class FeedbackSummaryResponse(BaseModel):
    items: List[FeedbackResponse]
    total: int
    average_rating: float
    rating_breakdown: Dict[str, int]
