# BAJAJ ENTERPRISES — FULL-STACK BICYCLE E-COMMERCE & SHOWROOM MANAGEMENT PLATFORM

[![Production Deployment](https://img.shields.io/badge/Vercel-Live_Storefront-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://bajajenterprises.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-ChahatModi18%2FBajajEnterprises-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ChahatModi18/BajajEnterprises)
[![Backend](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=for-the-badge&logo=fastapi&logoColor=white)](http://127.0.0.1:8000/docs)
[![Frontend](https://img.shields.io/badge/React_18-TypeScript_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](http://localhost:5173)

> **Official Showroom Location:** Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India  
> **Dealership Portfolio:** AVON, HERCULES, and custom multi-category bicycles.  
> **Production Website:** [https://bajajenterprises.vercel.app](https://bajajenterprises.vercel.app)  
> **Admin Portal Login:** [https://bajajenterprises.vercel.app/admin/login](https://bajajenterprises.vercel.app/admin/login)

---

## 📖 Complete Documentation Suite (`/docs`)

This repository includes a comprehensive, production-grade technical and architectural documentation suite:

| Document | Title & Focus Area |
|---|---|
| **[PRD.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/PRD.md)** | **Product Requirements Document:** Business problem statement, retail & wholesale user personas, functional specifications, and KPIs. |
| **[DESIGN.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/DESIGN.md)** | **UI/UX Design Specification:** Design tokens, Tailwind palettes, typography (Outfit & Inter), bilingual Hindi/English guidance, and component patterns. |
| **[ARCHITECTURE.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/ARCHITECTURE.md)** | **Technical Architecture:** Decoupled SPA + FastAPI architecture, Mermaid flowcharts, and the Resilient Hybrid Fallback Engine (`api.ts`). |
| **[DATABASE.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/DATABASE.md)** | **Database Schema & Models:** Relational ER diagram, table schemas, dynamic custom attributes (EAV pattern), indexing, and Alembic migrations. |
| **[API.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/API.md)** | **REST API Reference:** Public storefront & protected admin endpoints, request/response models, Bearer JWT authentication, and status codes. |
| **[IMPLEMENTATION_AND_SETUP.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/IMPLEMENTATION_AND_SETUP.md)** | **Installation & Setup Guide:** Environment variables matrix, step-by-step local setup (Windows PowerShell & Linux), Docker Compose, and build commands. |
| **[FEATURE_DEVELOPMENT.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/FEATURE_DEVELOPMENT.md)** | **Feature Deep Dive:** Catalogue Studio, bulk Excel/CSV ingestion pipeline (scaled for 10k items), promotional schemes, and order reservations (`BE-REQ-XXXXX`). |
| **[AUTHENTICATION_AND_SECURITY.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/AUTHENTICATION_AND_SECURITY.md)** | **Security & Access Control:** Bcrypt (cost 12), stateless JWT tokens, defense-in-depth route guards, mobile OTP password reset, and honeypot spam protection. |
| **[MCP_AND_INTEGRATIONS.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/MCP_AND_INTEGRATIONS.md)** | **Integrations & MCP Connection:** Model Context Protocol (MCP) tooling, WhatsApp click-to-chat API, Google Maps routing, and Cloudflare R2 / S3 storage. |
| **[TESTING_AND_QA.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/TESTING_AND_QA.md)** | **Quality Assurance & Testing:** Pytest test suite, Vitest frontend verification, test cases matrix, and pre-launch showroom checklist. |
| **[DEBUGGING_AND_TROUBLESHOOTING.md](file:///c:/Users/Lenovo/Desktop/BAJAJ%20ENTERPRISES%20WEBSITE%202/docs/DEBUGGING_AND_TROUBLESHOOTING.md)** | **Debugging Recipes:** Port conflict resolution, PowerShell execution policies, SPA 404 rewrite handling, and the login bounce bug diagnostic resolution. |

---

## ⚡ Quick Start & Local Development

### 1. Prerequisites
- Node.js `18+` & `npm`
- Python `3.11+`
- Git

### 2. Backend Setup
```powershell
# In project root:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

cd backend
pip install -r requirements.txt
alembic upgrade head

# Seed initial admin and demo bicycles:
python -m app.cli.create_admin --email admin@bajajenterprises.com --password Admin@Bajaj2026 --name "Store Administrator"
python -m app.cli.seed_demo_data

# Start backend server (Port 8000):
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```powershell
# In a new terminal:
cd frontend
npm install

# Start Vite development server (Port 5173):
npm run dev
```

- **Local Storefront:** [http://localhost:5173/](http://localhost:5173/)
- **Local Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔐 Administrator Access & Credentials

- **Admin Login URL:** `https://bajajenterprises.vercel.app/admin/login`
- **Default Seeded Account:**
  - **Email:** `admin@bajajenterprises.com`
  - **Password:** `Admin@Bajaj2026`
- **Password Hint:** Click **"Show Password Hint"** on the login page anytime during manual showroom setup.
- **Mobile OTP Recovery:** Click **"Forgot Password / OTP Reset?"**, confirm phone `+91 94141 38662`, and submit the 6-digit verification OTP to update credentials.

---

## 📦 Containerized Deployment (Docker)

To run the entire full-stack platform using Docker Compose:

```powershell
docker-compose up --build -d
```
- Frontend served at: `http://localhost`
- Backend API served at: `http://localhost:8000`
- MySQL 8.0 running on port `3306` with persistent volume.

---

## 📄 License & Attribution

&copy; 2026 **Bajaj Enterprises**. All rights reserved.  
Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India.  
*Independent bicycle retail dealership and wholesale distributor. AVON and HERCULES are trademarks of their respective owners.*