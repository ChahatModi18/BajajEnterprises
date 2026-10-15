from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.entities import User
from app.schemas.settings import StoreSettingsResponse, StoreSettingsUpdate
from app.services.settings_service import get_all_settings, update_settings

router = APIRouter(tags=["Store Settings"])

@router.get("/settings", response_model=StoreSettingsResponse)
def get_public_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch store identity, contact info, hours, and location."""
    return get_all_settings(db)

@router.get("/admin/settings", response_model=StoreSettingsResponse)
def get_admin_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to fetch settings."""
    return get_all_settings(db)

@router.put("/admin/settings", response_model=StoreSettingsResponse)
def update_admin_settings(
    settings_data: StoreSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to update Bajaj Enterprises store settings."""
    return update_settings(db, settings_data)

@router.post("/admin/demo-data/seed")
def seed_demo_data_endpoint(
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to seed demo bicycles, enquiries, orders, and schemes for showroom structure and testing."""
    from app.cli.seed_demo_data import seed_database
    seed_database(clear_demo_only=False)
    return {"status": "success", "message": "Demo data seeded successfully with products, enquiries, orders, and schemes."}

@router.post("/admin/demo-data/clear")
def clear_demo_data_endpoint(
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to clear demo records before going live."""
    from app.cli.seed_demo_data import seed_database
    seed_database(clear_demo_only=True)
    return {"status": "success", "message": "All demo records successfully removed from the database."}
