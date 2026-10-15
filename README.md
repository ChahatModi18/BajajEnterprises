# BAJAJ ENTERPRISES — FULL-STACK BICYCLE E-COMMERCE PLATFORM

> **Official Store Location:** Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India  
> **Dealership Portfolio:** AVON, HERCULES, and administrator-managed bicycle brands.

---

## 1. System Overview

A full-stack, production-oriented multi-page bicycle e-commerce and retail management platform built for **Bajaj Enterprises** in Bikaner.

The platform provides a responsive customer storefront alongside an administration control panel. The store owner can manage products, bicycle specifications (via a dynamic custom attributes system), photographs, bulk catalogues, promotional schemes, stock status, customer enquiries, order reservations, and store contact info without modifying source code.

### Core Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6.
- **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, Bcrypt, PyJWT.
- **Database:** Dual-Engine architecture supporting MySQL 8.0 (with JSON attributes and transactions) and SQLite (zero-config local dev & automated testing).
- **Security:** Password hashing with Bcrypt (cost factor 12), JWT Bearer tokens, CORS controls, honeypot spam protection, parameterised SQL queries.

---

## 2. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.11+

### Step 1: Clone & Environment Setup

```bash
# In the project root directory
python -m venv .venv

# Activate Virtual Environment (Windows PowerShell):
.\.venv\Scripts\Activate.ps1

# (Linux / macOS):
# source .venv/bin/activate
```

### Step 2: Install Backend Dependencies & Run Migrations

```bash
cd backend
pip install -r requirements.txt

# Run Alembic Database Migrations
alembic upgrade head
```

### Step 3: Seed First Admin & Demo Products

```bash
# Create the first store administrator:
python -m app.cli.create_admin --email admin@bajajenterprises.com --password Admin@Bajaj2026 --name "Store Administrator"

# Seed the two sample demo bicycles (AVON & HERCULES):
python -m app.cli.seed_demo_data
```

### Step 4: Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://127.0.0.1:8000/api/v1`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/api/v1/docs`

### Step 5: Install Frontend & Start Dev Server

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
- Storefront URL: `http://localhost:5173`
- Admin Control Panel: `http://localhost:5173/admin`
  - Default Admin Email: `admin@bajajenterprises.com`
  - Default Admin Password: `Admin@Bajaj2026`

---

## 3. Demo Products Management

The platform comes with exactly two sample demonstration products seeded in accordance with business guidelines:
1. **AVON Sample City Bicycle** (`DEMO-AVON-001`, Red, 26 inches, ₹4,999 illustrative placeholder)
2. **HERCULES Sample Geared Bicycle** (`DEMO-HERCULES-001`, Black, 21 gears, ₹8,999 illustrative placeholder)

Both records are tagged with `is_demo=True` and display clear "Demo Listing — Illustrative Only" notices.

To remove all demo listings prior to official launch:
```bash
cd backend
python -m app.cli.seed_demo_data --clear-demo
```

---

## 4. Key Functional Modules

### A. Dynamic Product Fields / Custom Columns Engine
Bicycles differ across brands and categories. Under `/admin/attributes`, the administrator can:
- Create custom fields (`Wheel Size`, `Gear Count`, `Brake Type`, `Frame Material`, `Suspension`, `Rider Height`, etc.).
- Choose types: text, integer, decimal, dropdown, multi-select, boolean, date, long text.
- Configure dropdown options, units (inches, gears, kg), and required/optional status.
- Toggle where fields appear: Product Cards, Catalogue Filters, Specifications Tables, or Comparison Matrix.
- Apply fields to specific categories or all bicycles.
- Disable a field without losing historical product records.

### B. Bulk Catalogue Import Pipeline
Under `/admin/import`, administrators can upload CSV or Excel (`.xlsx`) files:
1. **Upload:** Parse rows and inspect file structure.
2. **Validation:** Checks for missing names, duplicate SKUs, invalid prices, and unrecognised columns.
3. **Preview:** Displays first 10 rows and row-level error reports.
4. **Commit:** Transactional database commit with automatic rollback on fatal errors.

### C. Order Request & Enquiry Workflow
- **Customer Shopping Cart:** Recalculates real prices and stock availability on backend (never trusts client prices).
- **Order Request:** Generates a unique tracking reference (`BE-REQ-YYYY-XXXXX`). Collects pickup vs delivery preference. Avoids collecting CVVs or making false claims of confirmed payment.
- **Enquiries:** Honeypot-protected inquiry form generates reference numbers (`BE-ENQ-YYYY-XXXXX`) and notifies store management.
- **Admin Management:** Status tracking, private internal notes, and one-click CSV export.

---

## 5. Automated Testing

### Backend Test Suite (Pytest)
```bash
cd backend
pytest
```
- Includes 17 automated tests covering: Health checks, Authentication & JWT verification, Store settings persistence, Brand & Category CRUD, Product listing & dynamic attribute filtering, Image uploads, Bulk CSV validation and commit, Cart server-side calculation, and Enquiry & Order request workflows.

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
- Validates full TypeScript compilation, Vite bundling, and CSS asset generation.

---

## 6. Docker Deployment

A multi-container setup with MySQL 8.0, FastAPI backend, and Nginx frontend is provided:

```bash
docker-compose up --build -d
```

---

## 7. Database Backup & Restore Procedures

### MySQL 8.0 Backup
```bash
mysqldump -u bajaj_user -p bajaj_enterprises > backup_bajaj_$(date +%Y%m%d).sql
```

### MySQL 8.0 Restore
```bash
mysql -u bajaj_user -p bajaj_enterprises < backup_bajaj_YYYYMMDD.sql
```

### SQLite Backup / Restore
Simply copy `backend/bajaj_enterprises.db` to a secure backup storage location.

---

## 8. Business Owner Requirements Checklist (Pending Items)

Before switching from development to public production:
1. **Store Contact Details:** Update verified showroom phone number, WhatsApp number, and business email via `/admin/settings`.
2. **Opening Hours:** Enter exact showroom operating hours.
3. **Google Maps URL:** Paste verified Google Business location link.
4. **Social Links:** Enter official Instagram and Facebook URLs (unset links are automatically hidden).
5. **Real Inventory:** Upload actual AVON and HERCULES bicycles using `/admin/import` or the product manager.
6. **Remove Demo Records:** Execute `python -m app.cli.seed_demo_data --clear-demo`.
7. **Policy Approvals:** Review and approve the draft terms under `/policies`.
8. **SMTP Credentials:** Supply SMTP host, port, user, and password in `.env` if automatic email alerts are desired.





New Features
Both services remain active in the background:

Customer Website: http://127.0.0.1:5173/
Admin Dashboard: http://127.0.0.1:5173/admin
Catalogue Studio (With Photos): http://127.0.0.1:5173/admin/catalogue-studio
Website Content Editor: http://127.0.0.1:5173/admin/content
Backend API & Swagger Docs: http://127.0.0.1:8000/docs
Admin Login Credentials: admin@bajajenterprises.com / Admin@Bajaj2026