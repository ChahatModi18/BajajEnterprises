# Bajaj Enterprises — Full-Stack Bicycle E-Commerce Platform
## Architectural Blueprint & Phased Execution Plan

**Business Name:** Bajaj Enterprises  
**Location:** Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India  
**System Architecture:** Decoupled High-Performance E-Commerce Platform (FastAPI + SQLAlchemy 2.0 + MySQL 8.0 / SQLite dual-mode + React 18 TypeScript + Tailwind CSS)

---

### 1. Technology Stack & Environment Inspection Findings

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, React Hook Form, Zod, Lucide React icons.
- **Backend:** Python 3.11 (`.venv`), FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, Argon2id/Bcrypt for password hashing, JWT/HTTP-only secure cookies.
- **Database:** MySQL 8.0 (Windows service `MySQL80` running locally on port 3306; SQLite fallback/testing mode supported via universal SQLAlchemy dialect configuration).
- **Storage:** Local static uploads directory with safe filename hashing and MIME validation; modular adapter for future object storage (S3/Cloudflare R2).
- **Communication:** Configurable SMTP mailer with HTML templates, fallback logger for development, retry & audit logging.

---

### 2. Phased Implementation Roadmap

1. **Phase 1: Architecture, Environment & Dependencies** — Done.
2. **Phase 2: Project Setup & Database Migrations** — Setup `backend/` and `frontend/`, configure database connection with MySQL 8.0 / SQLite dual engine support, Alembic migrations.
3. **Phase 3: Auth, RBAC & Store Settings** — Secure authentication (Argon2id/Bcrypt, JWT), first-admin CLI setup, store settings for Bajaj Enterprises (Bikaner).
4. **Phase 4: Products, Brands, Categories & Dynamic Attributes** — Brand & Category management, dynamic custom product fields engine (EAV/JSON hybrid), seed 2 demo bicycles.
5. **Phase 5: Media Uploads & Bulk Catalogue Import** — Multi-image upload with thumbnail generator, CSV/XLSX catalogue import pipeline with column mapping, preview, and error reports.
6. **Phase 6: Storefront, Navigation, Search & Filters** — Hero carousel, brand/category showcases, multi-facet filtering (brand, category, price, wheel size, gear count, custom specs), product detail page with dynamic specifications.
7. **Phase 7: Schemes, Cart, Wishlist & Order Requests** — Promotional schemes, local/server wishlist, backend-validated cart, order request flow (`BE-REQ-XXXXX`), enquiry form with honeypot spam protection.
8. **Phase 8: Email Notifications, Security & SEO** — Email delivery service with logs, rate limiting, security headers, robots.txt, sitemap.xml, Schema.org Bicycle markup.
9. **Phase 9: Comprehensive Testing & Production Readiness** — Pytest backend test suite, Vitest/frontend build verification, deployment guide, backup/restore instructions, production-launch checklist.
