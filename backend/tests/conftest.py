import os
import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import Base, engine, SessionLocal
from app.models.entities import User
from app.core.security import get_password_hash

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
    db.close()
    yield

