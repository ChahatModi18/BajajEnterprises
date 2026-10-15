import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, 
    ForeignKey, Table, JSON, Enum, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

# Junction tables
category_attributes = Table(
    'category_attribute_assignments',
    Base.metadata,
    Column('category_id', Integer, ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True),
    Column('attribute_id', Integer, ForeignKey('product_attributes.id', ondelete='CASCADE'), primary_key=True)
)

scheme_products = Table(
    'scheme_product_assignments',
    Base.metadata,
    Column('scheme_id', Integer, ForeignKey('schemes.id', ondelete='CASCADE'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete='CASCADE'), primary_key=True)
)

scheme_categories = Table(
    'scheme_category_assignments',
    Base.metadata,
    Column('scheme_id', Integer, ForeignKey('schemes.id', ondelete='CASCADE'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="ADMIN", nullable=False) # ADMIN, STAFF
    is_active = Column(Boolean, default=True, nullable=False)

class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    products = relationship("Product", back_populates="brand", cascade="all, delete-orphan")

class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")
    attributes = relationship("ProductAttribute", secondary=category_attributes, back_populates="categories")

class ProductAttribute(Base, TimestampMixin):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g., "Wheel Size"
    key = Column(String(100), unique=True, index=True, nullable=False) # e.g., "wheel_size"
    field_type = Column(String(50), default="text", nullable=False) # text, number, decimal, dropdown, multiselect, boolean, date, longtext
    options_json = Column(JSON, nullable=True) # list of options for dropdown/multiselect
    unit = Column(String(50), nullable=True) # e.g., "inches", "gears", "kg"
    is_required = Column(Boolean, default=False, nullable=False)
    show_in_card = Column(Boolean, default=False, nullable=False)
    show_in_filters = Column(Boolean, default=True, nullable=False)
    show_in_specs = Column(Boolean, default=True, nullable=False)
    show_in_comparison = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    categories = relationship("Category", secondary=category_attributes, back_populates="attributes")
    values = relationship("ProductAttributeValue", back_populates="attribute", cascade="all, delete-orphan")

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(280), unique=True, index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    model_number = Column(String(100), nullable=True, index=True)
    
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    
    selling_price = Column(Float, nullable=True) # None = "Contact for price"
    mrp = Column(Float, nullable=True)
    is_discounted = Column(Boolean, default=False, nullable=False)
    
    stock_quantity = Column(Integer, default=0, nullable=False)
    availability_status = Column(String(50), default="IN_STOCK", nullable=False) # IN_STOCK, LOW_STOCK, OUT_OF_STOCK, ON_ENQUIRY
    
    description = Column(Text, nullable=True)
    warranty_info = Column(String(255), nullable=True)
    delivery_info = Column(String(255), nullable=True)
    
    is_featured = Column(Boolean, default=False, index=True, nullable=False)
    is_new_arrival = Column(Boolean, default=False, index=True, nullable=False)
    is_bestseller = Column(Boolean, default=False, index=True, nullable=False)
    is_published = Column(Boolean, default=True, index=True, nullable=False)
    is_demo = Column(Boolean, default=False, index=True, nullable=False)
    is_archived = Column(Boolean, default=False, index=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    attribute_values = relationship("ProductAttributeValue", back_populates="product", cascade="all, delete-orphan")
    schemes = relationship("Scheme", secondary=scheme_products, back_populates="products")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="images")

class ProductAttributeValue(Base, TimestampMixin):
    __tablename__ = "product_attribute_values"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    attribute_id = Column(Integer, ForeignKey("product_attributes.id", ondelete="CASCADE"), nullable=False)
    
    value_text = Column(Text, nullable=True)
    value_number = Column(Float, nullable=True)
    value_boolean = Column(Boolean, nullable=True)
    value_json = Column(JSON, nullable=True) # for multi-select or structured tags

    product = relationship("Product", back_populates="attribute_values")
    attribute = relationship("ProductAttribute", back_populates="values")

    __table_args__ = (
        UniqueConstraint('product_id', 'attribute_id', name='uq_product_attribute'),
    )

class Scheme(Base, TimestampMixin):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(280), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)
    discount_type = Column(String(50), nullable=True) # PERCENT, FIXED, OFFER
    discount_value = Column(Float, nullable=True)
    eligibility = Column(Text, nullable=True)
    terms = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, index=True, nullable=False)

    products = relationship("Product", secondary=scheme_products, back_populates="schemes")
    categories = relationship("Category", secondary=scheme_categories)

class Banner(Base, TimestampMixin):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500), nullable=True)
    button_text = Column(String(100), default="Explore Now", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

class Cart(Base, TimestampMixin):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base, TimestampMixin):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

class Wishlist(Base, TimestampMixin):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    wishlist_id = Column(Integer, ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    wishlist = relationship("Wishlist", back_populates="items")
    product = relationship("Product")

class OrderRequest(Base, TimestampMixin):
    __tablename__ = "order_requests"

    id = Column(Integer, primary_key=True, index=True)
    reference_no = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    delivery_preference = Column(String(50), default="PICKUP", nullable=False) # PICKUP, DELIVERY
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), default="Bikaner", nullable=True)
    state = Column(String(100), default="Rajasthan", nullable=True)
    postal_code = Column(String(20), default="334001", nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="RECEIVED", nullable=False) # RECEIVED, UNDER_REVIEW, CONFIRMED, FULFILLED, CANCELLED
    total_amount = Column(Float, default=0.0, nullable=False)
    internal_notes = Column(Text, nullable=True)

    items = relationship("OrderRequestItem", back_populates="order_request", cascade="all, delete-orphan")

class OrderRequestItem(Base):
    __tablename__ = "order_request_items"

    id = Column(Integer, primary_key=True, index=True)
    order_request_id = Column(Integer, ForeignKey("order_requests.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    subtotal = Column(Float, nullable=False)

    order_request = relationship("OrderRequest", back_populates="items")
    product = relationship("Product")

class Enquiry(Base, TimestampMixin):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    reference_no = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    category = Column(String(100), default="General", nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    preferred_contact = Column(String(50), default="Phone", nullable=False)
    status = Column(String(50), default="NEW", nullable=False) # NEW, CONTACTED, AWAITING_CUSTOMER, RESOLVED, CLOSED
    internal_notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)

    product = relationship("Product")

class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # CREATE, UPDATE, DELETE, IMPORT, LOGIN
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class CatalogueImport(Base):
    __tablename__ = "catalogue_imports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # csv, xlsx
    total_rows = Column(Integer, default=0, nullable=False)
    valid_rows = Column(Integer, default=0, nullable=False)
    error_rows = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="UPLOADED", nullable=False) # UPLOADED, VALIDATED, COMMITTED, FAILED
    errors_json = Column(JSON, nullable=True)
    preview_data_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
