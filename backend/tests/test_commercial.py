import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_admin_token():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "AdminPass123!"}
    )
    return login_res.json()["access_token"]

def test_banners_endpoint():
    response = client.get("/api/v1/banners")
    assert response.status_code == 200
    banners = response.json()
    assert len(banners) >= 2
    assert any("AVON" in b["title"] or "HERCULES" in b["title"] or "Bajaj" in b["title"] for b in banners)

def test_cart_calculation_server_side():
    # Fetch demo products to get their actual IDs
    prods_res = client.get("/api/v1/products")
    prods = prods_res.json()["items"]
    assert len(prods) >= 2
    p1 = prods[0]
    p2 = prods[1]

    # Post cart calculation request
    items = [
        {"product_id": p1["id"], "quantity": 1},
        {"product_id": p2["id"], "quantity": 2}
    ]
    calc_res = client.post("/api/v1/cart/calculate", json=items)
    assert calc_res.status_code == 200
    calc = calc_res.json()
    assert calc["total_items_count"] == 3
    expected_subtotal = (p1["selling_price"] * 1) + (p2["selling_price"] * 2)
    assert calc["subtotal"] == round(expected_subtotal, 2)
    assert len(calc["items"]) == 2

def test_enquiry_submission_and_admin_workflow():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    enq_payload = {
        "name": "Ramesh Kumar",
        "phone": "+91 9414012345",
        "email": "ramesh@example.com",
        "category": "Product Enquiry",
        "message": "Interested in purchasing the AVON City bicycle for daily commute in Bikaner.",
        "preferred_contact": "WhatsApp"
    }
    submit_res = client.post("/api/v1/enquiries", json=enq_payload)
    assert submit_res.status_code == 201
    enq_data = submit_res.json()
    assert enq_data["reference_no"].startswith("BE-ENQ-")
    enq_id = enq_data["id"]

    # Admin view
    admin_enqs = client.get("/api/v1/admin/enquiries", headers=headers)
    assert admin_enqs.status_code == 200
    enq_list = admin_enqs.json() if isinstance(admin_enqs.json(), list) else admin_enqs.json().get("items", [])
    assert any(e["id"] == enq_id for e in enq_list)

    # Admin update status
    patch_res = client.patch(
        f"/api/v1/admin/enquiries/{enq_id}",
        json={"status": "CONTACTED", "internal_notes": "Spoke on WhatsApp, customer visiting store tomorrow."},
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "CONTACTED"

    # CSV Export
    csv_res = client.get("/api/v1/admin/enquiries/export", headers=headers)
    assert csv_res.status_code == 200
    assert "Reference No" in csv_res.text
    assert "Ramesh Kumar" in csv_res.text

def test_order_request_submission_and_admin_workflow():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    prods_res = client.get("/api/v1/products")
    p1 = prods_res.json()["items"][0]

    order_payload = {
        "customer_name": "Sunita Verma",
        "customer_phone": "+91 9829054321",
        "customer_email": "sunita@example.com",
        "delivery_preference": "PICKUP",
        "city": "Bikaner",
        "notes": "Will collect from Kote Gate store on Saturday morning.",
        "items": [
            {"product_id": p1["id"], "quantity": 1}
        ]
    }
    order_res = client.post("/api/v1/order-requests", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["reference_no"].startswith("BE-REQ-")
    assert order_data["status"] == "RECEIVED"
    assert order_data["total_amount"] == p1["selling_price"]
    order_id = order_data["id"]

    # Admin view
    admin_orders = client.get("/api/v1/admin/order-requests", headers=headers)
    assert admin_orders.status_code == 200
    order_list = admin_orders.json() if isinstance(admin_orders.json(), list) else admin_orders.json().get("items", [])
    assert any(o["id"] == order_id for o in order_list)

    # Admin update status
    patch_res = client.patch(
        f"/api/v1/admin/order-requests/{order_id}",
        json={"status": "CONFIRMED", "internal_notes": "Stock reserved for Saturday pickup."},
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "CONFIRMED"

    # CSV Export
    csv_res = client.get("/api/v1/admin/order-requests/export", headers=headers)
    assert csv_res.status_code == 200
    assert "Sunita Verma" in csv_res.text


def test_feedback_flow():
    # Public submit feedback
    fb_payload = {
        "name": "Manish Sharma",
        "phone": "+91 9414199999",
        "email": "manish@example.com",
        "rating": 5,
        "comment": "Outstanding bicycle showroom experience! Great guidance on frame sizes.",
        "bicycle_model": "AVON City Star 26T",
        "service_type": "Showroom Purchase"
    }
    res = client.post("/api/v1/feedback", json=fb_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Manish Sharma"
    assert data["rating"] == 5
    fb_id = data["id"]

    # Public get feedback summary
    summary_res = client.get("/api/v1/feedback")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total"] >= 1
    assert "average_rating" in summary
    assert "rating_breakdown" in summary

    # Admin view and toggle
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    admin_res = client.get("/api/v1/admin/feedback", headers=headers)
    assert admin_res.status_code == 200

    toggle_res = client.patch(f"/api/v1/admin/feedback/{fb_id}/toggle-feature", headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_featured"] is True
