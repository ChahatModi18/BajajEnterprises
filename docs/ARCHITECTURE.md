# Technical Architecture Document (ARCHITECTURE.md)
## Bajaj Enterprises — System Architecture & Component Interactions

---

### 1. High-Level Architectural Blueprint

The platform implements a **Decoupled Modern Web Architecture** consisting of an independent Single Page Application (SPA) frontend, a high-performance RESTful API backend, and a dual-dialect database engine.

```mermaid
graph TD
    subgraph Client Tier ["Client Tier (Browser)"]
        SF[Public Storefront SPA<br/>React 18 + Vite]
        AP[Admin Control Portal<br/>Role Guarded SPA]
    end

    subgraph CDN ["Edge & Routing Layer (Vercel / Netlify)"]
        RWR[SPA Rewrites & Security Headers<br/>_redirects / vercel.json]
    end

    subgraph Service Tier ["Application Tier (FastAPI)"]
        API[FastAPI Gateway / REST API<br/>Port 8000]
        AUTH[Auth & JWT Engine<br/>Bcrypt + OTP Store]
        CAT[Catalogue & Inventory Service]
        COMM[Orders & Enquiry Service]
        MEDIA[Media Ingestion & Thumbnail Pipeline]
    end

    subgraph Storage Tier ["Data Tier"]
        DB[(Dual Engine Database<br/>SQLite Dev / MySQL 8.0 Prod)]
        UPL[Local File Storage / Cloudflare R2<br/>Static Bicycle Uploads]
    end

    SF --> RWR
    AP --> RWR
    RWR --> SF
    RWR --> AP

    SF -.->|JSON / REST| API
    AP -.->|Bearer JWT / REST| API

    API --> AUTH
    API --> CAT
    API --> COMM
    API --> MEDIA

    AUTH --> DB
    CAT --> DB
    COMM --> DB
    MEDIA --> UPL
```

---

### 2. Client-Tier Architecture & The Resilient Fallback Engine

A standout architectural design pattern of this application is the **Resilient Hybrid Fallback Engine** (`api.ts` + `fallbackData.ts`).

#### The Problem It Solves
Free-tier cloud deployments (such as Render, Railway, or Heroku) frequently sleep after inactivity, leading to 30–50 second cold starts or temporary connection drops. Standard web applications crash or display empty blank screens.

#### The Architectural Solution
1. **Network Interceptor:** Every API request through `apiRequest()` attempts to fetch live data from `${VITE_API_URL}/api/v1`.
2. **HTML Detection Guard:** If a static CDN rewrites a missing backend route to `index.html` (MIME `text/html`), the interceptor immediately catches the response before JSON parsing fails.
3. **Transparent Fallback Switch:** If a network failure occurs, the engine transparently routes the request to `resolveFallback()`.
4. **Local State Persistence:** Admin actions (updating settings, resetting passwords, adjusting inventory) during offline mode are saved into browser `localStorage`, ensuring seamless uninterrupted demonstrations and zero broken links.

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Interceptor as apiRequest() Wrapper
    participant LiveAPI as FastAPI Backend
    participant Fallback as resolveFallback Engine
    participant Cache as localStorage

    UI->>Interceptor: apiRequest('/products')
    Interceptor->>LiveAPI: fetch('http://.../api/v1/products')
    alt Backend Online (Status 200 OK)
        LiveAPI-->>Interceptor: JSON response {items: [...]}
        Interceptor-->>UI: Live Database Data
    else Backend Sleeping / Offline / HTML 404
        LiveAPI--xInterceptor: Network Error or 404 HTML
        Interceptor->>Fallback: resolveFallback('/products')
        Fallback->>Cache: Read local updates / fallbackData
        Fallback-->>Interceptor: Valid Typed Response
        Interceptor-->>UI: Complete Data (Zero Crash)
    end
```

---

### 3. Backend Application Tier Architecture

The backend is built with **FastAPI** (Python 3.11), leveraging asynchronous handling and Pydantic v2 data models for rigorous schema validation.

#### Modular Package Structure
```
backend/
├── app/
│   ├── api/v1/          # Route Controllers
│   │   ├── auth.py              # Login, Logout, /me, OTP request & reset
│   │   ├── products.py          # Bicycle CRUD, duplicate, filters, specs
│   │   ├── brands.py            # Manufacturer brand entities (AVON, Hercules)
│   │   ├── categories.py        # Segment taxonomies (City, MTB, Kids)
│   │   ├── attributes.py        # Dynamic custom field definitions
│   │   ├── commercial.py        # Schemes, Enquiries & Order Requests
│   │   ├── media_and_imports.py # Multi-image upload & CSV/Excel parser
│   │   └── settings.py          # Store address, hours, WhatsApp & policies
│   ├── core/            # Infrastructure
│   │   ├── config.py            # Pydantic BaseSettings (.env loading)
│   │   ├── database.py          # SQLAlchemy SessionFactory & Base
│   │   ├── dependencies.py      # get_current_user & require_admin guards
│   │   └── security.py          # Bcrypt hashing & PyJWT token generator
│   ├── models/          # SQLAlchemy ORM Models
│   └── schemas/         # Pydantic v2 Request/Response Schemas
```

---

### 4. Database Dual-Engine Architecture

The data access layer utilizes **SQLAlchemy 2.0 ORM** configured with universal dialect support:
- **Development & Testing Mode:** SQLite (`sqlite:///./bajaj_enterprises.db`) — zero-configuration, instant execution, zero external server requirement.
- **Production Mode:** MySQL 8.0 (`mysql+pymysql://user:pass@host/dbname`) — enterprise transaction pooling, foreign key cascading, and native JSON indexing.
- **Schema Migrations:** Managed through **Alembic**, enabling revision tracking, safe forward upgrades, and rollback capabilities.

---

### 5. Deployment Topology

The system supports multiple enterprise deployment configurations:

#### Option A: Serverless Edge (Current Live Setup)
- **Frontend:** Hosted on **Vercel** (`https://bajajenterprises.vercel.app`) with automatic edge bundling, asset minification, and gzip compression.
- **Backend:** Python FastAPI service containerized via Docker on Render/Railway.
- **Routing:** Direct client-side proxy via `VITE_API_URL`.

#### Option B: Unified Containerized Setup (`docker-compose.yml`)
For self-hosted showroom servers or on-premise deployments:
- **`frontend` service:** Nginx alpine serving static Vite build on port 80/443.
- **`backend` service:** Uvicorn ASGI server on port 8000.
- **`db` service:** MySQL 8.0 container with persistent data volume.

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```
