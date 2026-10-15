import io
from fastapi.testclient import TestClient
from app.main import app
from PIL import Image

client = TestClient(app)

def get_admin_token():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@bajajenterprises.com", "password": "AdminPass123!"}
    )
    return login_res.json()["access_token"]

def test_image_upload_and_thumbnail():
    token = get_admin_token()
    
    # Create simple in-memory PNG image
    img = Image.new("RGB", (100, 100), color="blue")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    files = {"file": ("test_bicycle.png", img_bytes.getvalue(), "image/png")}
    response = client.post(
        "/api/v1/admin/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "image_url" in data
    assert "thumbnail_url" in data
    assert data["image_url"].startswith("/uploads/")

def test_catalogue_csv_upload_validate_and_commit():
    import uuid
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    sku1 = f"TEST-CSV-{uuid.uuid4().hex[:6].upper()}"
    sku2 = f"TEST-CSV-{uuid.uuid4().hex[:6].upper()}"

    csv_content = f"""Name,SKU,Brand,Category,Selling Price,MRP,Wheel Size,Colour
Test City Bicycle,{sku1},AVON,City Bicycle,5200,5800,26 inches,Blue
Test Mountain Bicycle,{sku2},HERCULES,Mountain Bicycles (MTB),11500,12999,27.5 inches,Green
"""
    files = {"file": ("test_import.csv", csv_content.encode("utf-8"), "text/csv")}
    upload_res = client.post(
        "/api/v1/admin/catalogue-imports/upload",
        files=files,
        headers=headers
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    import_id = upload_data["import_id"]
    assert upload_data["total_rows"] == 2

    # Validate
    val_res = client.post(
        f"/api/v1/admin/catalogue-imports/{import_id}/validate",
        headers=headers
    )
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["valid_rows"] == 2
    assert val_data["error_rows"] == 0

    # Commit
    commit_res = client.post(
        f"/api/v1/admin/catalogue-imports/{import_id}/commit",
        headers=headers
    )
    assert commit_res.status_code == 200
    commit_data = commit_res.json()
    assert commit_data["imported_products_count"] == 2

    # Verify products are present in public catalogue
    prod_res = client.get(f"/api/v1/products?search={sku1}")
    assert prod_res.status_code == 200
    assert any(p["sku"] == sku1 for p in prod_res.json()["items"])
