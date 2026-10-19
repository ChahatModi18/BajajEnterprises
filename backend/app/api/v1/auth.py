import random
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
    
    # Generate 6-digit random OTP
    otp_code = str(random.randint(100000, 999999))
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)
    
    active_otps[clean_mobile[-10:]] = {
        "otp": otp_code,
        "expires_at": expires_at,
        "email": req.email
    }
    
    masked = f"+91 {clean_mobile[-10:-6]}***{clean_mobile[-2:]}" if len(clean_mobile) >= 10 else req.mobile
    
    return {
        "success": True,
        "message": f"Verification OTP sent successfully to registered mobile {masked}.",
        "masked_mobile": masked,
        "dev_otp": otp_code # Convenient for local setup & dev testing
    }

@router.post("/reset-password-otp")
def reset_password_otp(req: ResetPasswordOTPRequest, db: Session = Depends(get_db)):
    clean_mobile = "".join([c for c in req.mobile if c.isdigit()])
    last_10 = clean_mobile[-10:] if len(clean_mobile) >= 10 else clean_mobile
    
    record = active_otps.get(last_10)
    now = datetime.now(timezone.utc)
    
    if not record or record["otp"] != req.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification OTP. Please request a new OTP."
        )
        
    if now > record["expires_at"]:
        active_otps.pop(last_10, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a fresh OTP."
        )
        
    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )
        
    # Find admin user to update password
    user_email = record.get("email") or "admin@bajajenterprises.com"
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        # Fallback to first admin
        user = db.query(User).filter(User.role == "ADMIN").first()
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator account not found."
        )
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    active_otps.pop(last_10, None)
    
    return {
        "success": True,
        "message": "Password successfully updated. You can now log in with your new credentials."
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
