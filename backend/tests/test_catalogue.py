import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_brands():
    response = client.get("/api/v1/brands")
    assert response.status_code == 200
    brands = response.json()
    brand_names = [b["name"] for b in brands]
    assert "AVON" in brand_names
    assert "HERCULES" in brand_names

def test_get_categories():
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    cat_names = [c["name"] for c in categories]
    assert "City Bicycle" in cat_names
    assert "Geared Bicycle" in cat_names

def test_get_products_list():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    skus = [p["sku"] for p in data["items"]]
    assert "DEMO-AVON-001" in skus
    assert "DEMO-HERCULES-001" in skus

def test_filter_products_by_brand():
    response = client.get("/api/v1/products?brand_slug=avon")
    assert response.status_code == 200
    data = response.json()
    assert any(p["sku"] == "DEMO-AVON-001" for p in data["items"])
    assert not any(p["sku"] == "DEMO-HERCULES-001" for p in data["items"])

def test_get_product_detail_and_dynamic_attributes():
    response = client.get("/api/v1/products/avon-sample-city-bicycle-demo")
    assert response.status_code == 200
    product = response.json()
    assert product["name"] == "AVON Sample City Bicycle"
    assert product["is_demo"] is True
    assert len(product["images"]) > 0
    # Dynamic attributes test
    attrs = {a["attribute_key"]: a["value"] for a in product["attributes"]}
    assert attrs.get("wheel_size") == "26 inches"
    assert attrs.get("colour") == "Red"

def test_create_and_update_dynamic_attribute():
    import uuid
    # Login as admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "AdminPass123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    unique_key = f"frame_size_{uuid.uuid4().hex[:6]}"
    # Create dynamic attribute
    attr_res = client.post(
        "/api/v1/admin/attributes",
        json={
            "name": "Frame Size",
            "key": unique_key,
            "field_type": "dropdown",
            "options_json": ["16 inch", "18 inch", "20 inch"],
            "unit": "inches",
            "show_in_specs": True,
            "show_in_filters": True
        },
        headers=headers
    )
    assert attr_res.status_code == 201
    attr_data = attr_res.json()
    attr_id = attr_data["id"]
    assert attr_data["name"] == "Frame Size"
    assert attr_data["unit"] == "inches"

    # Update attribute
    update_res = client.put(
        f"/api/v1/admin/attributes/{attr_id}",
        json={"unit": "in"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["unit"] == "in"
