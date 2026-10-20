# Testing & Quality Assurance Guide (TESTING_AND_QA.md)
## Bajaj Enterprises — Automated Test Suites & QA Protocols

---

### 1. Testing Strategy Overview

The testing methodology ensures commercial reliability across both backend database operations and customer-facing responsive interfaces.

```
┌────────────────────────────────────────────────────────┐
│               End-to-End & Manual QA                   │
│   (Showroom Booking Flow, Mobile OTP, Browser Tests)   │
├────────────────────────────────────────────────────────┤
│             Frontend Build & Typechecks                │
│    (tsc --noEmit, Vite Bundle Checks, Zero Lint Bugs)  │
├────────────────────────────────────────────────────────┤
│             Backend Pytest Test Suite                  │
│  (Auth, RBAC, Catalog CRUD, Attribute EAV, Order Flow) │
└────────────────────────────────────────────────────────┘
```

---

### 2. Backend Automated Test Suite (Pytest)

The backend includes a comprehensive automated test suite in `backend/tests/` running against an isolated SQLite test database.

#### Running Backend Tests:
```powershell
# In Windows PowerShell:
.\.venv\Scripts\Activate.ps1
cd backend
pytest -v
```

#### Test Suite Structure:
- `tests/test_auth.py`: Tests password hashing, JWT generation, login success, bad credentials, and session expiry.
- `tests/test_products.py`: Tests bicycle CRUD, SKU uniqueness, and category filtering.
- `tests/test_attributes.py`: Tests dynamic field creation and value assignment.
- `tests/test_enquiries.py`: Tests anti-spam honeypot rejection and lead submission.
- `tests/test_orders.py`: Tests order reservation and status progression.

---

### 3. Frontend Typechecking & Compilation Testing

The React application uses strict TypeScript configurations to prevent runtime crashes.

#### Compilation Command:
```powershell
cd frontend
npm run build
```
This executes:
1. `tsc`: Validates all TypeScript types across all 15 admin pages and public components.
2. `vite build`: Verifies asset bundling, tree-shaking, CSS minification, and gzip compression.

---

### 4. Core QA Test Cases Matrix

| Test ID | Module | Scenario | Expected Outcome |
|---|---|---|---|
| **TC-01** | **Auth** | Unauthenticated user navigates to `/admin` | Redirected to `/admin/login`. |
| **TC-02** | **Auth** | Admin enters valid credentials (`admin@...` / `Admin@Bajaj2026`) | Enters dashboard, JWT stored in localStorage. |
| **TC-03** | **Auth** | Admin requests OTP for registered mobile `9414138662` | 6-digit OTP generated and returned in mock payload. |
| **TC-04** | **Auth** | Admin submits valid OTP and sets new password | Password updated, subsequent logins accept new password. |
| **TC-05** | **Storefront**| Customer filters catalogue by brand `AVON` | Only AVON bicycles displayed in grid. |
| **TC-06** | **Storefront**| Customer clicks "Inquire on WhatsApp" | Opens `wa.me` with pre-populated bicycle model and SKU. |
| **TC-07** | **Storefront**| Customer submits order reservation (`BE-REQ-XXXXX`) | Booking code generated, stored in DB without card gateway error. |
| **TC-08** | **Admin** | Admin adjusts bicycle stock with `+1` / `-1` stepper | Stock count updates in DB and live card immediately. |
| **TC-09** | **Admin** | Admin changes enquiry status to `RESOLVED` | Status badge turns green, staff private notes saved. |
| **TC-10** | **Admin** | Admin clicks "Print / PDF Catalogue" | Layout reformats into clean 2-column A4 print sheet. |

---

### 5. Manual QA Checklist for Showroom Launch

- [x] Verify phone number `+91 94141 38662` is dialable on mobile.
- [x] Verify Google Maps directions link leads to Alakh Sagar Road, Kote Gate, Bikaner.
- [x] Test adding multiple bicycles to Cart and booking showroom reservation.
- [x] Test Admin auto-fill credentials on live Vercel URL.
- [x] Verify that page refresh on `/admin`, `/shop`, `/cart` does not return 404.
- [x] Confirm that regular visitors cannot see any "Admin Portal" link in header or footer.
