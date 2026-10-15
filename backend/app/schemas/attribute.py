from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

class AttributeBase(BaseModel):
    name: str # e.g. "Wheel Size"
    key: str # e.g. "wheel_size"
    field_type: str = "text" # text, number, decimal, dropdown, multiselect, boolean, date, longtext
    options_json: Optional[List[str]] = None
    unit: Optional[str] = None # e.g. "inches", "kg", "gears"
    is_required: bool = False
    show_in_card: bool = False
    show_in_filters: bool = True
    show_in_specs: bool = True
    show_in_comparison: bool = True
    sort_order: int = 0
    is_active: bool = True
    category_ids: Optional[List[int]] = []

class AttributeCreate(AttributeBase):
    pass

class AttributeUpdate(BaseModel):
    name: Optional[str] = None
    key: Optional[str] = None
    field_type: Optional[str] = None
    options_json: Optional[List[str]] = None
    unit: Optional[str] = None
    is_required: Optional[bool] = None
    show_in_card: Optional[bool] = None
    show_in_filters: Optional[bool] = None
    show_in_specs: Optional[bool] = None
    show_in_comparison: Optional[bool] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    category_ids: Optional[List[int]] = None

class AttributeResponse(AttributeBase):
    id: int
    category_ids: List[int] = []
    model_config = ConfigDict(from_attributes=True)

class AttributeValueInput(BaseModel):
    attribute_id: Optional[int] = None
    attribute_key: Optional[str] = None
    value: Any

class AttributeValueResponse(BaseModel):
    attribute_id: int
    attribute_name: str
    attribute_key: str
    field_type: str
    unit: Optional[str] = None
    show_in_card: bool
    show_in_filters: bool
    show_in_specs: bool
    show_in_comparison: bool
    value: Any
