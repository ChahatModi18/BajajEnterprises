import os
import uuid
from typing import Tuple, Optional
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.entities import ProductImage, Product

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}

def save_uploaded_image(file: UploadFile) -> Tuple[str, Optional[str]]:
    filename = file.filename or "image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    file_bytes = file.file.read()
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    unique_id = uuid.uuid4().hex
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    out_filename = f"{unique_id}{ext}"
    out_path = os.path.join(settings.UPLOAD_DIR, out_filename)

    with open(out_path, "wb") as f:
        f.write(file_bytes)

    image_url = f"/uploads/{out_filename}"
    thumb_url = image_url

    # Generate thumbnail for raster images
    if ext in {".jpg", ".jpeg", ".png", ".webp"}:
        try:
            thumb_filename = f"{unique_id}_thumb{ext}"
            thumb_path = os.path.join(settings.UPLOAD_DIR, thumb_filename)
            with Image.open(out_path) as img:
                img.thumbnail((300, 300))
                img.save(thumb_path)
            thumb_url = f"/uploads/{thumb_filename}"
        except Exception:
            pass

    return image_url, thumb_url

def add_product_image(
    db: Session,
    product_id: int,
    file: UploadFile,
    alt_text: Optional[str] = None,
    is_primary: bool = False
) -> ProductImage:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image_url, thumb_url = save_uploaded_image(file)

    # Check if primary or first image
    existing_images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    if not existing_images:
        is_primary = True

    if is_primary:
        # unset other primary images
        for img in existing_images:
            img.is_primary = False

    sort_order = len(existing_images) + 1
    new_img = ProductImage(
        product_id=product_id,
        image_url=image_url,
        thumbnail_url=thumb_url,
        alt_text=alt_text or product.name,
        is_primary=is_primary,
        sort_order=sort_order
    )
    db.add(new_img)
    db.commit()
    db.refresh(new_img)
    return new_img

def set_primary_image(db: Session, product_id: int, image_id: int) -> ProductImage:
    img = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found for this product")

    db.query(ProductImage).filter(ProductImage.product_id == product_id).update({"is_primary": False})
    img.is_primary = True
    db.commit()
    db.refresh(img)
    return img

def delete_product_image(db: Session, product_id: int, image_id: int) -> bool:
    img = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()
    if not img:
        return False
    db.delete(img)
    db.commit()
    return True
