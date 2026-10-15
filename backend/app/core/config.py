import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Bajaj Enterprises Bicycles"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "bajaj-enterprises-secure-dev-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 365 # 365 days (1 year persistent session - never times out)
    
    # Database
    DATABASE_URL: str = "sqlite:///./bajaj_enterprises.db"
    
    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://www.bajajenterprises.com",
        "https://bajajenterprises.com",
        "https://*.vercel.app",
        "*"
    ]
    
    # Store settings defaults
    STORE_NAME: str = "Bajaj Enterprises"
    STORE_ADDRESS: str = "Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India"
    STORE_PHONE: str = ""
    STORE_WHATSAPP: str = ""
    STORE_EMAIL: str = ""
    
    # Email settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@bajajenterprises.local"
    SMTP_ENABLED: bool = False
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
