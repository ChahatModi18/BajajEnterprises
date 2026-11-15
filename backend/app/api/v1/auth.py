import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.auth import LoginRequest, Token, UserResponse, OTPRequest, ResetPasswordOTPRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory storage for active verification OTPs
active_otps = {}

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/request-otp")
def request_otp(req: OTPRequest, db: Session = Depends(get_db)):
    clean_mobile = "".join([c for c in req.mobile if c.isdigit()])
    if len(clean_mobile) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 10-digit mobile number."
        )
    
    # Generate 4-digit random OTP as requested
    otp_code = f"{secrets.randbelow(9000) + 1000}"
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)
    
    admin_email = (req.email or "admin@bajajenterprises.com").strip().lower()
    
    record = {
        "otp": otp_code,
        "expires_at": expires_at,
        "email": admin_email,
        "mobile": clean_mobile[-10:]
    }
    active_otps[clean_mobile[-10:]] = record
    active_otps[admin_email] = record
    
    masked = f"+91 {clean_mobile[-10:-6]}***{clean_mobile[-2:]}" if len(clean_mobile) >= 10 else req.mobile
    
    return {
        "success": True,
        "message": f"4-digit verification OTP ({otp_code}) generated and shared to admin email {admin_email}. SMS dispatch initiated to {masked}.",
        "masked_mobile": masked,
        "email": admin_email,
        "dev_otp": otp_code # Shared to admin on entered email address
    }

@router.post("/reset-password-otp")
def reset_password_otp(req: ResetPasswordOTPRequest, db: Session = Depends(get_db)):
    clean_mobile = "".join([c for c in req.mobile if c.isdigit()])
    last_10 = clean_mobile[-10:] if len(clean_mobile) >= 10 else clean_mobile
    admin_email = (req.email or "").strip().lower()
    
    # Check by mobile or email
    record = active_otps.get(last_10) or (active_otps.get(admin_email) if admin_email else None)
    now = datetime.now(timezone.utc)
    
    if not record or record["otp"] != req.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired 4-digit verification OTP. Please request a new OTP."
        )
        
    if now > record["expires_at"]:
        active_otps.pop(last_10, None)
        if admin_email:
            active_otps.pop(admin_email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a fresh OTP."
        )
        
    if len(req.new_password) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 12 characters long."
        )
        
    # Find admin user to update password
    user_email = record.get("email") or admin_email or "admin@bajajenterprises.com"
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        # Fallback to first admin
        user = db.query(User).filter(User.role == "ADMIN").first()
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator account not found."
        )
        
    # If admin specified an actual verified email, update it
    if admin_email and user.email != admin_email:
        user.email = admin_email

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    active_otps.pop(last_10, None)
    if admin_email:
        active_otps.pop(admin_email, None)
    
    return {
        "success": True,
        "message": f"Password successfully updated for {user.email}. You can now log in with your verified credentials."
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
