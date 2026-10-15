import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import (
    auth, settings as settings_api, brands, 
    categories, attributes, products, media_and_imports, commercial
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)
app.include_router(brands.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(attributes.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(media_and_imports.router, prefix=settings.API_V1_STR)
app.include_router(commercial.router, prefix=settings.API_V1_STR)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Bajaj Enterprises API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
