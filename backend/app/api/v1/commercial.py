import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User, Feedback
from app.schemas.commercial import (
    FeedbackCreate, FeedbackResponse, FeedbackSummaryResponse,
    BannerResponse, BannerCreate, BannerUpdate,
    SchemeResponse, SchemeCreate, SchemeUpdate,
    EnquiryResponse, EnquiryCreate, EnquiryStatusUpdate,
    CartItemInput, CartCalculationResponse,
    OrderRequestResponse, OrderRequestPageResponse, OrderRequestCreate, OrderRequestStatusUpdate,
    EnquiryPageResponse
)
from app.services import commercial_service

router = APIRouter(tags=["Store Commercials"])

def _csv_safe(value):
    if isinstance(value, str) and value.lstrip(" \t\r\n").startswith(("=", "+", "-", "@")):
        return "'" + value
    return value

def _stream_csv(headers, rows, filename: str):
    def generate():
        buffer = io.StringIO(newline="")
        writer = csv.writer(buffer)
        writer.writerow(headers)
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)
        for row in rows:
            writer.writerow([_csv_safe(value) for value in row])
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

    return StreamingResponse(
        generate(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

# --- BANNERS ---
@router.get("/banners", response_model=List[BannerResponse])
def get_public_banners(db: Session = Depends(get_db)):
    return commercial_service.get_banners(db, only_active=True)

@router.get("/admin/banners", response_model=List[BannerResponse])
def get_admin_banners(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return commercial_service.get_banners(db, only_active=False)

@router.post("/admin/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
def admin_create_banner(data: BannerCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return commercial_service.create_banner(db, data)

@router.put("/admin/banners/{banner_id}", response_model=BannerResponse)
def admin_update_banner(banner_id: int, data: BannerUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    banner = commercial_service.update_banner(db, banner_id, data)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner

@router.delete("/admin/banners/{banner_id}")
def admin_delete_banner(banner_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = commercial_service.delete_banner(db, banner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted successfully"}

# --- SCHEMES ---
@router.get("/schemes", response_model=List[SchemeResponse])
def get_public_schemes(db: Session = Depends(get_db)):
    schemes = commercial_service.get_schemes(db, only_active=True)
    return [{
        **s.__dict__,
        "product_ids": [p.id for p in s.products] if s.products else [],
        "category_ids": [c.id for c in s.categories] if s.categories else []
    } for s in schemes]

@router.get("/schemes/{slug}", response_model=SchemeResponse)
def get_scheme_by_slug(slug: str, db: Session = Depends(get_db)):
    scheme = commercial_service.get_scheme_by_slug(db, slug)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {
        **scheme.__dict__,
        "product_ids": [p.id for p in scheme.products] if scheme.products else [],
        "category_ids": [c.id for c in scheme.categories] if scheme.categories else []
    }

@router.get("/admin/schemes", response_model=List[SchemeResponse])
def get_admin_schemes(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    schemes = commercial_service.get_schemes(db, only_active=False)
    return [{
        **s.__dict__,
        "product_ids": [p.id for p in s.products] if s.products else [],
        "category_ids": [c.id for c in s.categories] if s.categories else []
    } for s in schemes]

@router.post("/admin/schemes", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_scheme(data: SchemeCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    scheme = commercial_service.create_scheme(db, data)
    return {
        **scheme.__dict__,
        "product_ids": [p.id for p in scheme.products] if scheme.products else [],
        "category_ids": [c.id for c in scheme.categories] if scheme.categories else []
    }

@router.put("/admin/schemes/{scheme_id}", response_model=SchemeResponse)
def admin_update_scheme(scheme_id: int, data: SchemeUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    scheme = commercial_service.update_scheme(db, scheme_id, data)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {
        **scheme.__dict__,
        "product_ids": [p.id for p in scheme.products] if scheme.products else [],
        "category_ids": [c.id for c in scheme.categories] if scheme.categories else []
    }

@router.delete("/admin/schemes/{scheme_id}")
def admin_delete_scheme(scheme_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = commercial_service.delete_scheme(db, scheme_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"message": "Scheme deleted successfully"}

# --- ENQUIRIES ---
@router.post("/enquiries", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_enquiry(data: EnquiryCreate, db: Session = Depends(get_db)):
    enquiry = commercial_service.create_enquiry(db, data)
    return {
        **enquiry.__dict__,
        "product_name": enquiry.product.name if enquiry.product else None
    }

@router.get("/admin/enquiries", response_model=EnquiryPageResponse)
def get_admin_enquiries(
    status: Optional[str] = Query(None, max_length=50),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    enquiries = commercial_service.get_enquiries(db, status, limit=page_size, offset=(page - 1) * page_size)
    return {
        "items": [{
            **e.__dict__,
            "product_name": e.product.name if e.product else None
        } for e in enquiries],
        "total": commercial_service.count_enquiries(db, status),
        "counts": commercial_service.count_enquiries_by_status(db),
        "page": page,
        "page_size": page_size,
    }

@router.patch("/admin/enquiries/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry_status(
    enquiry_id: int, 
    data: EnquiryStatusUpdate, 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    enquiry = commercial_service.update_enquiry_status(db, enquiry_id, data)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {
        **enquiry.__dict__,
        "product_name": enquiry.product.name if enquiry.product else None
    }

@router.get("/admin/enquiries/export")
def export_enquiries_csv(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    def rows():
        for e in commercial_service.iter_enquiries(db):
            yield [
            e.reference_no,
            e.created_at.strftime("%Y-%m-%d %H:%M:%S") if e.created_at else "",
            e.name,
            e.phone,
            e.email or "",
            e.category,
            e.status,
            e.message,
            e.internal_notes or ""
            ]
    return _stream_csv(["Reference No", "Date", "Name", "Phone", "Email", "Category", "Status", "Message", "Internal Notes"], rows(), "bajaj_enquiries.csv")

# --- CART CALCULATION ---
@router.post("/cart/calculate", response_model=CartCalculationResponse)
def calculate_cart(items: List[CartItemInput] = Body(..., max_length=50), db: Session = Depends(get_db)):
    return commercial_service.calculate_cart_totals(db, items)

# --- ORDER REQUESTS ---
@router.post("/order-requests", response_model=OrderRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_order_request(data: OrderRequestCreate, db: Session = Depends(get_db)):
    order = commercial_service.create_order_request(db, data)
    return order

@router.get("/admin/order-requests", response_model=OrderRequestPageResponse)
def get_admin_order_requests(
    status: Optional[str] = Query(None, max_length=50),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    return {
        "items": commercial_service.get_order_requests(db, status, limit=page_size, offset=(page - 1) * page_size),
        "total": commercial_service.count_order_requests(db, status),
        "counts": commercial_service.count_order_requests_by_status(db),
        "page": page,
        "page_size": page_size,
    }

@router.patch("/admin/order-requests/{order_id}", response_model=OrderRequestResponse)
def update_order_request_status(
    order_id: int, 
    data: OrderRequestStatusUpdate, 
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    order = commercial_service.update_order_request_status(db, order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order request not found")
    return order

@router.get("/admin/order-requests/export")
def export_order_requests_csv(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    def rows():
        for o in commercial_service.iter_order_requests(db):
            yield [
            o.reference_no,
            o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "",
            o.customer_name,
            o.customer_phone,
            o.customer_email or "",
            o.delivery_preference,
            o.city or "",
            o.total_amount,
            o.status,
            o.internal_notes or ""
            ]
    return _stream_csv(["Reference No", "Date", "Customer Name", "Phone", "Email", "Delivery Preference", "City", "Total Amount (INR)", "Status", "Internal Notes"], rows(), "bajaj_order_requests.csv")


# --- FEEDBACK & RATINGS ---
@router.get("/feedback", response_model=FeedbackSummaryResponse)
def get_public_feedback(db: Session = Depends(get_db)):
    return commercial_service.get_feedback_summary(db)

@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    return commercial_service.create_feedback(db, data)

@router.get("/admin/feedback")
def get_admin_feedback(
    only_approved: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(Feedback)
    if only_approved is not None:
        query = query.filter(Feedback.is_approved == only_approved)
    return query.order_by(Feedback.created_at.desc()).all()

@router.patch("/admin/feedback/{feedback_id}/toggle-feature", response_model=FeedbackResponse)
def admin_toggle_feedback_feature(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    fb = commercial_service.toggle_feedback_feature(db, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb

@router.patch("/admin/feedback/{feedback_id}/toggle-approval", response_model=FeedbackResponse)
def admin_toggle_feedback_approval(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    fb = commercial_service.toggle_feedback_approval(db, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb

@router.delete("/admin/feedback/{feedback_id}")
def admin_delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = commercial_service.delete_feedback(db, feedback_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback deleted successfully"}
