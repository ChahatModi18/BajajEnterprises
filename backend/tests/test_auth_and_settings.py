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


def test_admin_forgot_password_4digit_otp_and_email_verification():
    # 1. Request OTP with admin email & phone
    req_res = client.post(
        "/api/v1/auth/request-otp",
        json={"mobile": "+91 94141 38662", "email": "testadmin@bajajenterprises.com"}
    )
    assert req_res.status_code == 200
    data = req_res.json()
    assert data["success"] is True
    otp_code = data["dev_otp"]
    # Verify it is a 4-digit code as requested
    assert len(otp_code) == 4
    assert otp_code.isdigit()
    assert "testadmin@bajajenterprises.com" in data["message"]

    # 2. Reset password using the 4-digit OTP
    new_pwd = "AdminNewPass2026!"
    reset_res = client.post(
        "/api/v1/auth/reset-password-otp",
        json={
            "mobile": "+91 94141 38662",
            "email": "testadmin@bajajenterprises.com",
            "otp": otp_code,
            "new_password": new_pwd
        }
    )
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

    # 3. Verify admin can now login with new password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": new_pwd}
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Clean up: reset back to default password
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "testadmin@bajajenterprises.com").first()
    if admin:
        admin.hashed_password = get_password_hash("AdminPass123!")
        db.commit()
    db.close()
