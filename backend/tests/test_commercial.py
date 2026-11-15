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


def test_hero_banner_photo_upload_and_storefront_visibility():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a simulated hero banner image in 1920x600 format
    import io
    from PIL import Image
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (1920, 600), color=(16, 185, 129))  # Emerald green brand theme
    image.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    # 2. Upload photograph to admin endpoint
    files = {"file": ("hero_banner_bikaner.jpg", img_byte_arr, "image/jpeg")}
    upload_res = client.post("/api/v1/admin/upload-image", headers=headers, files=files)
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert "image_url" in upload_data
    uploaded_image_url = upload_data["image_url"]
    assert uploaded_image_url.startswith("/uploads/")

    # 3. Create hero banner with the uploaded photograph
    banner_payload = {
        "title": "Grand Festive Bicycle Carnival Bikaner",
        "subtitle": "Exciting Exchange & Showroom Offers at Kote Gate",
        "image_url": uploaded_image_url,
        "link_url": "/shop?brand=AVON",
        "button_text": "Explore Festive Range",
        "is_active": True,
        "sort_order": 1
    }
    create_res = client.post("/api/v1/admin/banners", json=banner_payload, headers=headers)
    assert create_res.status_code == 201
    created_banner = create_res.json()
    banner_id = created_banner["id"]
    assert created_banner["image_url"] == uploaded_image_url

    # 4. Check Storefront Visibility via public endpoint
    storefront_res = client.get("/api/v1/banners")
    assert storefront_res.status_code == 200
    storefront_banners = storefront_res.json()
    matching_banner = next((b for b in storefront_banners if b["id"] == banner_id), None)
    assert matching_banner is not None, "Hero banner must be visible on the public storefront"
    assert matching_banner["image_url"] == uploaded_image_url
    assert matching_banner["title"] == "Grand Festive Bicycle Carnival Bikaner"
    assert matching_banner["is_active"] is True

    # 5. Update banner with updated photo
    update_byte_arr = io.BytesIO()
    updated_image = Image.new("RGB", (1920, 600), color=(245, 158, 11))  # Amber/Orange theme
    updated_image.save(update_byte_arr, format="JPEG")
    update_byte_arr.seek(0)
    update_files = {"file": ("hero_banner_updated.jpg", update_byte_arr, "image/jpeg")}
    update_upload_res = client.post("/api/v1/admin/upload-image", headers=headers, files=update_files)
    assert update_upload_res.status_code == 200
    new_image_url = update_upload_res.json()["image_url"]

    patch_res = client.put(
        f"/api/v1/admin/banners/{banner_id}",
        json={"image_url": new_image_url, "title": "Updated Festive Bicycle Range"},
        headers=headers
    )
    assert patch_res.status_code == 200

    # 6. Verify storefront immediately reflects updated photo
    storefront_res_updated = client.get("/api/v1/banners")
    assert storefront_res_updated.status_code == 200
    updated_storefront_banner = next((b for b in storefront_res_updated.json() if b["id"] == banner_id), None)
    assert updated_storefront_banner is not None
    assert updated_storefront_banner["image_url"] == new_image_url
    assert updated_storefront_banner["title"] == "Updated Festive Bicycle Range"

    # 7. Cleanup
    del_res = client.delete(f"/api/v1/admin/banners/{banner_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify removed from storefront
    storefront_after_del = client.get("/api/v1/banners")
    assert not any(b["id"] == banner_id for b in storefront_after_del.json())


def test_bicycle_photo_upload_and_storefront_visibility():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch a product to attach new photo to
    prods_res = client.get("/api/v1/products")
    prods = prods_res.json()["items"]
    assert len(prods) > 0
    prod = prods[0]
    prod_id = prod["id"]

    # 1. Create a simulated bicycle photograph (800x600 format)
    import io
    from PIL import Image
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (800, 600), color=(30, 41, 59))  # Slate dark bike frame
    image.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    # 2. Upload photo directly to product images
    files = {"file": ("new_bicycle_side_angle.jpg", img_byte_arr, "image/jpeg")}
    upload_res = client.post(
        f"/api/v1/admin/products/{prod_id}/images",
        headers=headers,
        data={"alt_text": "Side view high resolution", "is_primary": "true"},
        files=files
    )
    assert upload_res.status_code == 200
    img_data = upload_res.json()
    assert "image_url" in img_data
    photo_url = img_data["image_url"]
    photo_id = img_data["id"]

    # 3. Verify public storefront displays this bicycle with the new photograph
    pub_res = client.get(f"/api/v1/products/{prod['slug']}")
    assert pub_res.status_code == 200
    pub_prod = pub_res.json()
    images = pub_prod.get("images", [])
    assert any(img["image_url"] == photo_url for img in images), "Uploaded photo must be in storefront product images"

    # Also check public product list
    list_res = client.get(f"/api/v1/products?search={prod['sku']}")
    assert list_res.status_code == 200
    matching = next((p for p in list_res.json()["items"] if p["id"] == prod_id), None)
    assert matching is not None
    assert any(img["image_url"] == photo_url for img in matching.get("images", []))

    # 4. Clean up the uploaded image
    del_res = client.delete(f"/api/v1/admin/products/{prod_id}/images/{photo_id}", headers=headers)
    assert del_res.status_code == 200
