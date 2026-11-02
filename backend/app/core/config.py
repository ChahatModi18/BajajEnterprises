from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Bajaj Enterprises Bicycles"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "development-only-signing-key-change-before-deployment"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite:///./bajaj_enterprises.db"
    
    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    MAX_REQUEST_SIZE_MB: int = 12
    MAX_IMPORT_ROWS: int = 10000
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT_SECONDS: int = 30
    DB_POOL_RECYCLE_SECONDS: int = 1800
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://www.bajajenterprises.com",
        "https://bajajenterprises.com",
        "https://bajajenterprises.vercel.app",
        "https://bajaj-frontend.onrender.com"
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

    @model_validator(mode="after")
    def validate_production_security(self):
        if self.ENVIRONMENT.lower() == "production":
            if (self.SECRET_KEY in {
                    "development-only-signing-key-change-before-deployment",
                    "generate-a-strong-random-secret-key-for-production-min-32-chars",
                } or len(self.SECRET_KEY) < 32 or len(set(self.SECRET_KEY)) < 10):
                raise ValueError("Production requires a unique SECRET_KEY of at least 32 characters")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("Production CORS_ORIGINS must list explicit origins")
            if self.DATABASE_URL.lower().startswith("sqlite:"):
                raise ValueError("Production requires a shared persistent database; SQLite is development-only")
        if self.ACCESS_TOKEN_EXPIRE_MINUTES < 1:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be at least 1")
        if min(self.MAX_UPLOAD_SIZE_MB, self.MAX_REQUEST_SIZE_MB, self.MAX_IMPORT_ROWS,
               self.DB_POOL_SIZE, self.DB_POOL_TIMEOUT_SECONDS, self.DB_POOL_RECYCLE_SECONDS) < 1:
            raise ValueError("Upload, import, and database pool limits must be positive")
        if self.DB_MAX_OVERFLOW < 0 or self.MAX_REQUEST_SIZE_MB < self.MAX_UPLOAD_SIZE_MB:
            raise ValueError("Database overflow must be non-negative and request limit must cover uploads")
        return self
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
