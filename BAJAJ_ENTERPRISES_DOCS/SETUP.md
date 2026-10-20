# Setup & Installation Guide — Bajaj Enterprises

> **Target Project:** Bajaj Enterprises — Full-Stack Bicycle Platform  

---

## 1. Environment & Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- SQLite 3 or PostgreSQL 14+
- Docker & Docker Compose (Optional)

---

## 2. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

---

## 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

---

## 4. Docker Deployment
```powershell
docker-compose up --build
```
