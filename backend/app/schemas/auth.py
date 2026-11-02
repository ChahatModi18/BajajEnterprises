from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str
    full_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return value

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "STAFF" # ADMIN or STAFF

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class OTPRequest(BaseModel):
    mobile: str = Field(min_length=7, max_length=32)
    email: Optional[EmailStr] = "admin@bajajenterprises.com"

class ResetPasswordOTPRequest(BaseModel):
    mobile: str = Field(min_length=7, max_length=32)
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(min_length=12, max_length=72)

    @field_validator("new_password")
    @classmethod
    def reset_password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return value
