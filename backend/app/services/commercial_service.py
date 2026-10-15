import uuid
import datetime
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models.entities import (
    Banner, Scheme, Enquiry, OrderRequest, 
    OrderRequestItem, Product, Category, scheme_products, scheme_categories
)
from app.schemas.commercial import (
    BannerCreate, BannerUpdate, SchemeCreate, SchemeUpdate,
    EnquiryCreate, EnquiryStatusUpdate, CartItemInput, CartCalculationResponse,
    OrderRequestCreate, OrderRequestStatusUpdate
)
from app.services.catalogue_service import slugify

# --- BANNERS ---
DEFAULT_BANNERS = [
    {
        "title": "Welcome to Bajaj Enterprises",
        "subtitle": "Bikaner's Premier Bicycle Destination on Alakh Sagar Road, Kote Gate. Discover Top Brands Like AVON & HERCULES.",
        "image_url": "/uploads/demo_avon_city_001.svg",
        "link_url": "/shop",
        "button_text": "Explore Bicycles",
        "sort_order": 1
    },
    {
        "title": "Rugged Performance & Geared Bicycles",
        "subtitle": "Tackle every terrain with premium alloy frames, disc brakes, and multi-speed gearing.",
        "image_url": "/uploads/demo_hercules_geared_001.svg",
        "link_url": "/category/geared-bicycle",
        "button_text": "View Geared Bikes",
        "sort_order": 2
    }
]

def get_banners(db: Session, only_active: bool = True) -> List[Banner]:
    query = db.query(Banner)
    if only_active:
        query = query.filter(Banner.is_active == True)
    banners = query.order_by(Banner.sort_order.asc()).all()
    if not banners and only_active:
        # Seed default initial banners for instant storefront wow
        for b_data in DEFAULT_BANNERS:
            b = Banner(**b_data, is_active=True)
            db.add(b)
        db.commit()
        banners = db.query(Banner).filter(Banner.is_active == True).order_by(Banner.sort_order.asc()).all()
    return banners

def create_banner(db: Session, data: BannerCreate) -> Banner:
    banner = Banner(**data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner

def update_banner(db: Session, banner_id: int, data: BannerUpdate) -> Optional[Banner]:
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(banner, k, v)
    db.commit()
    db.refresh(banner)
    return banner

def delete_banner(db: Session, banner_id: int) -> bool:
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        return False
    db.delete(banner)
    db.commit()
    return True

# --- SCHEMES ---
def get_schemes(db: Session, only_active: bool = True) -> List[Scheme]:
    query = db.query(Scheme).options(joinedload(Scheme.products), joinedload(Scheme.categories))
    if only_active:
        now = datetime.datetime.utcnow()
        query = query.filter(
            Scheme.is_active == True,
            (Scheme.end_date == None) | (Scheme.end_date >= now)
        )
    return query.order_by(Scheme.created_at.desc()).all()

def get_scheme_by_slug(db: Session, slug: str) -> Optional[Scheme]:
    return db.query(Scheme).options(
        joinedload(Scheme.products), 
        joinedload(Scheme.categories)
    ).filter(Scheme.slug == slug).first()

def create_scheme(db: Session, data: SchemeCreate) -> Scheme:
    slug = data.slug or slugify(data.title)
    existing = db.query(Scheme).filter(Scheme.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    dump = data.model_dump(exclude={'product_ids', 'category_ids', 'slug'})
    scheme = Scheme(**dump, slug=slug)

    if data.product_ids:
        scheme.products = db.query(Product).filter(Product.id.in_(data.product_ids)).all()
    if data.category_ids:
        scheme.categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()

    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme

def update_scheme(db: Session, scheme_id: int, data: SchemeUpdate) -> Optional[Scheme]:
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        return None

    dump = data.model_dump(exclude_unset=True)
    p_ids = dump.pop('product_ids', None)
    c_ids = dump.pop('category_ids', None)

    if p_ids is not None:
        scheme.products = db.query(Product).filter(Product.id.in_(p_ids)).all()
    if c_ids is not None:
        scheme.categories = db.query(Category).filter(Category.id.in_(c_ids)).all()

    for k, v in dump.items():
        setattr(scheme, k, v)

    db.commit()
    db.refresh(scheme)
    return scheme

def delete_scheme(db: Session, scheme_id: int) -> bool:
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        return False
    db.delete(scheme)
    db.commit()
    return True

# --- ENQUIRIES ---
def create_enquiry(db: Session, data: EnquiryCreate) -> Enquiry:
    if data.honeypot:
        # Silently reject bot submissions
        raise HTTPException(status_code=400, detail="Submission rejected")

    ref_no = f"BE-ENQ-{datetime.datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:5].upper()}"
    enquiry = Enquiry(
        reference_no=ref_no,
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=str(data.email).strip() if data.email else None,
        category=data.category,
        product_id=data.product_id,
        message=data.message.strip(),
        preferred_contact=data.preferred_contact,
        status="NEW"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    # Send notifications (graceful, non-blocking)
    try:
        from app.services.email_service import notify_new_enquiry
        notify_new_enquiry(
            enquiry_ref=enquiry.reference_no,
            customer_name=enquiry.name,
            phone=enquiry.phone,
            message=enquiry.message,
            customer_email=enquiry.email
        )
    except Exception:
        pass

    return enquiry

def get_enquiries(db: Session, status: Optional[str] = None) -> List[Enquiry]:
    query = db.query(Enquiry).options(joinedload(Enquiry.product))
    if status:
        query = query.filter(Enquiry.status == status)
    return query.order_by(Enquiry.created_at.desc()).all()

def update_enquiry_status(db: Session, enquiry_id: int, data: EnquiryStatusUpdate) -> Optional[Enquiry]:
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(enquiry, k, v)
    db.commit()
    db.refresh(enquiry)
    return enquiry

# --- CART CALCULATION ---
def calculate_cart_totals(db: Session, items: List[CartItemInput]) -> CartCalculationResponse:
    if not items:
        return CartCalculationResponse(
            items=[],
            subtotal=0.0,
            discount_total=0.0,
            estimated_total=0.0,
            total_items_count=0,
            has_out_of_stock_items=False
        )

    product_ids = [it.product_id for it in items]
    products = db.query(Product).options(joinedload(Product.images)).filter(Product.id.in_(product_ids)).all()
    prod_map = {p.id: p for p in products}

    calc_items = []
    subtotal = 0.0
    discount_total = 0.0
    has_oos = False
    total_qty = 0

    for item_input in items:
        prod = prod_map.get(item_input.product_id)
        if not prod:
            continue

        qty = max(1, item_input.quantity)
        total_qty += qty

        # price lookup directly from DB
        unit_price = prod.selling_price if prod.selling_price is not None else 0.0
        line_total = unit_price * qty
        subtotal += line_total

        if prod.mrp and prod.mrp > unit_price:
            discount_total += (prod.mrp - unit_price) * qty

        in_stock = (prod.stock_quantity >= qty) and (prod.availability_status != "OUT_OF_STOCK")
        if not in_stock:
            has_oos = True

        first_img = prod.images[0].image_url if prod.images else None

        calc_items.append({
            "product_id": prod.id,
            "name": prod.name,
            "sku": prod.sku,
            "image_url": first_img,
            "unit_price": unit_price,
            "mrp": prod.mrp,
            "quantity": qty,
            "subtotal": line_total,
            "in_stock": in_stock,
            "stock_quantity": prod.stock_quantity
        })

    return CartCalculationResponse(
        items=calc_items,
        subtotal=round(subtotal, 2),
        discount_total=round(discount_total, 2),
        estimated_total=round(subtotal, 2),
        total_items_count=total_qty,
        has_out_of_stock_items=has_oos
    )

# --- ORDER REQUESTS ---
def create_order_request(db: Session, data: OrderRequestCreate) -> OrderRequest:
    if data.honeypot:
        raise HTTPException(status_code=400, detail="Submission rejected")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order request must contain at least one bicycle or accessory.")

    cart_calc = calculate_cart_totals(db, data.items)
    if not cart_calc.items:
        raise HTTPException(status_code=400, detail="No valid items found in order request.")

    ref_no = f"BE-REQ-{datetime.datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

    order = OrderRequest(
        reference_no=ref_no,
        customer_name=data.customer_name.strip(),
        customer_phone=data.customer_phone.strip(),
        customer_email=str(data.customer_email).strip() if data.customer_email else None,
        delivery_preference=data.delivery_preference,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city or "Bikaner",
        state=data.state or "Rajasthan",
        postal_code=data.postal_code or "334001",
        notes=data.notes,
        status="RECEIVED",
        total_amount=cart_calc.estimated_total
    )
    db.add(order)
    db.flush()

    for item in cart_calc.items:
        order_item = OrderRequestItem(
            order_request_id=order.id,
            product_id=item.product_id,
            product_name=item.name,
            product_sku=item.sku,
            unit_price=item.unit_price,
            quantity=item.quantity,
            subtotal=item.subtotal
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    # Send notifications (graceful, non-blocking)
    try:
        from app.services.email_service import notify_new_order_request
        notify_new_order_request(
            order_ref=order.reference_no,
            customer_name=order.customer_name,
            phone=order.customer_phone,
            total_amount=order.total_amount,
            customer_email=order.customer_email
        )
    except Exception:
        pass

    return order

def get_order_requests(db: Session, status: Optional[str] = None) -> List[OrderRequest]:
    query = db.query(OrderRequest).options(joinedload(OrderRequest.items))
    if status:
        query = query.filter(OrderRequest.status == status)
    return query.order_by(OrderRequest.created_at.desc()).all()

def update_order_request_status(db: Session, order_id: int, data: OrderRequestStatusUpdate) -> Optional[OrderRequest]:
    order = db.query(OrderRequest).filter(OrderRequest.id == order_id).first()
    if not order:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(order, k, v)
    db.commit()
    db.refresh(order)
    return order
