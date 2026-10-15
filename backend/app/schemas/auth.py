from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

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
    password: str

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
