# Project Implementation Guide — Bajaj Enterprises

> **Target Project:** Bajaj Enterprises — Bicycle E-Commerce & Showroom Platform  
> **Architecture:** FastAPI (Backend) + React 18 / TypeScript / Tailwind CSS (Frontend) + SQLite / PostgreSQL  

---

## 1. Project Implementation Overview

# Project Implementation & Setup Guide (IMPLEMENTATION_AND_SETUP.md)
## Bajaj Enterprises — Environment, Installation & Deployment Setup

---

### 1. Prerequisites

Before installing, ensure the host machine has the following tools installed:
- **Python:** Version `3.11` or higher
- **Node.js:** Version `18.x` or higher (Node v20+ LTS recommended)
- **Package Managers:** `pip` and `npm`
- **Git:** Version `2.x`
- **Database Engine (Optional for Prod):** MySQL 8.0 (SQLite is included by default for zero-config local development).

---

### 2. Environment Variables Specification

Create or verify `.env` files in both backend and frontend directories:

#### Backend Configuration (`backend/.env`)
```ini
# Environment Mode
ENVIRONMENT=development
DEBUG=True

# Database Connection (Switch between SQLite and MySQL)
# SQLite (Zero-config local mode):
DATABASE_URL=sqlite:///./bajaj_enterprises.db
# MySQL Production (Docker / Cloud):
# DATABASE_URL=mysql+pymysql://bajaj_admin:password@localhost:3306/bajaj_enterprises

# Cryptographic Keys (Change in production!)
SECRET_KEY=bajaj_enterprises_production_secret_key_bikaner_2026_super_secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 Days persistent session

# CORS Whitelist (Comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://bajajenterprises.vercel.app

# Storage Paths
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=15

# SMTP Email Configuration (Optional fallback to console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
STORE_NOTIFICATION_EMAIL=chahatmodi17@gmail.com
```

#### Frontend Configuration (`frontend/.env`)
```ini
# Base backend URL for production API calls
# Leave empty for local development (uses Vite proxy) or set to your live backend service:
VITE_API_URL=http://localhost:8000
```

---

### 3. Step-by-Step Installation (Windows PowerShell)

#### Step 1: Clone Repository & Create Virtual Environment
```powershell
# In project root: c:\Users\Lenovo\Desktop\BAJAJ ENTERPRISES WEBSITE 2
python -m venv .venv

# Activate the virtual environment:
.\.venv\Scripts\Activate.ps1
```

#### Step 2: Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

#### Step 3: Run Database Migrations
```powershell
alembic upgrade head
```

#### Step 4: Seed Initial Administrator & Demo Data
```powershell
# Create first store administrator:
python -m app.cli.create_admin --email admin@bajajenterprises.com --password Admin@Bajaj2026 --name "Store Administrator"

# Seed official AVON and HERCULES demo catalogue:
python -m app.cli.seed_demo_data

# Return to root directory:
cd ..
```

#### Step 5: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

### 4. Running the Development Servers

#### Terminal 1 — Start FastAPI Backend:
```powershell
# From project root:
.\.venv\Scripts\Activate.ps1
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Base:* `http://127.0.0.1:8000/api/v1`  
*Swagger UI:* `http://127.0.0.1:8000/docs`

#### Terminal 2 — Start Vite React Frontend:
```powershell
# From project root:
cd frontend
npm run dev
```
*Local Storefront:* `http://localhost:5173/`  
*Admin Login:* `http://localhost:5173/admin/login`

---

### 5. Production Compilation & Static Hosting Verification

To verify that the frontend compiles cleanly with 0 TypeScript or bundling errors:

```powershell
cd frontend
npm run build
```
The compiled, minified production assets will be output to `frontend/dist/`.

---

### 6. Containerized Deployment with Docker Compose

To run the complete full-stack environment in Docker:

```powershell
# Build and run containers in background:
docker-compose up --build -d

# View real-time container logs:
docker-compose logs -f

# Stop and remove containers:
docker-compose down
```
This provisions:
1. `backend`: FastAPI Python 3.11 service.
2. `frontend`: Nginx container serving optimized Vite static bundle.
3. `db`: MySQL 8.0 server with persistent volume storage.
