import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.entities import User
from app.core.security import get_password_hash

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_admin_user():
    db = SessionLocal()
    # Check if admin exists
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

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "AdminPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" == "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["email"] == "testadmin@bajajenterprises.com"

def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "WrongPassword"}
    )
    assert response.status_code == 401

def test_get_public_store_settings():
    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["store_name"] == "Bajaj Enterprises"
    assert "Bikaner" in data["store_address"]

def test_admin_settings_update():
    # Login first
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "AdminPass123!"}
    )
    token = login_res.json()["access_token"]
    
    # Update settings
    update_res = client.put(
        "/api/v1/admin/settings",
        json={"store_phone": "+91 9876543210", "announcement_text": "Festive Bicycle Schemes Active!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["store_phone"] == "+91 9876543210"
    assert updated_data["announcement_text"] == "Festive Bicycle Schemes Active!"
