import os
import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import app.models
from app.core.database import Base, engine, SessionLocal
from app.models.entities import User, Banner, Product
from app.core.security import get_password_hash
from app.cli.seed_demo_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    # Ensure all database tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "testadmin@bajajenterprises.com").first()
    if not admin:
        admin = User(
            email="testadmin@bajajenterprises.com",
            full_name="Admin User",
            hashed_password=get_password_hash("AdminPass123!"),
            role="ADMIN",
            is_active=True
        )
        db.add(admin)
        db.commit()
    
    banner_count = db.query(Banner).count()
    product_count = db.query(Product).count()
    db.close()

    if banner_count == 0 or product_count == 0:
        seed_database()
    yield

