import os
import uuid
from typing import Tuple, Optional
from PIL import Image, UnidentifiedImageError
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.entities import ProductImage, Product

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def save_uploaded_image(file: UploadFile) -> Tuple[str, Optional[str]]:
    filename = file.filename or "image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    file_bytes = file.file.read(max_bytes + 1)
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    try:
        from io import BytesIO
        with Image.open(BytesIO(file_bytes)) as img:
            expected_format = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP"}[ext]
            if img.format != expected_format:
                raise HTTPException(status_code=400, detail="Image contents do not match the file extension")
            img.verify()
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid supported image")

    unique_id = uuid.uuid4().hex
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    out_filename = f"{unique_id}{ext}"
    out_path = os.path.join(settings.UPLOAD_DIR, out_filename)

    image_url = f"/uploads/{out_filename}"
    thumb_filename = f"{unique_id}_thumb{ext}"
    thumb_path = os.path.join(settings.UPLOAD_DIR, thumb_filename)
    try:
        with open(out_path, "wb") as f:
            f.write(file_bytes)
        with Image.open(out_path) as img:
            img.thumbnail((300, 300))
            img.save(thumb_path)
    except Exception:
        for path in (out_path, thumb_path):
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
        raise

    return image_url, f"/uploads/{thumb_filename}"

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
    try:
        db.commit()
        db.refresh(new_img)
    except Exception:
        db.rollback()
        for path in (image_url, thumb_url):
            try:
                os.remove(os.path.join(settings.UPLOAD_DIR, os.path.basename(path)))
            except FileNotFoundError:
                pass
        raise
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
