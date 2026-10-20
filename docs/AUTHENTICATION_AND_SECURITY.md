# Authentication & Security Architecture (AUTHENTICATION_AND_SECURITY.md)
## Bajaj Enterprises — Security Controls, Access Protection & Recovery

---

### 1. Threat Model & Security Posture

The platform is designed to protect commercial pricing, wholesale customer leads, and inventory data against unauthorized tampering, automated credential stuffing, and bot scraping.

```mermaid
graph TD
    UserReq[Inbound Request] --> RBAC{Is Request for /admin/* ?}
    RBAC -->|No: Public Storefront| SAN[Input Sanitization & Honeypot Check]
    SAN --> Storefront[Serve Public Catalog & Forms]

    RBAC -->|Yes: Admin Route| Guard[Defense-in-Depth Route Guard]
    Guard --> AuthCheck{Valid JWT Bearer Token & Role == 'ADMIN'?}
    AuthCheck -->|No| Redirect[/admin/login Redirect]
    AuthCheck -->|Yes| AdminView[Serve Admin Portal / Execute Mutation]
```

---

### 2. Cryptographic Password Hashing (Bcrypt)

All user passwords are encrypted using **Bcrypt** with a work factor (cost) of 12 rounds before writing to the database:
- **Salt Generation:** Each hash incorporates a cryptographically secure 128-bit random salt, defeating rainbow table attacks.
- **Timing Attack Resistance:** Password validation uses `bcrypt.checkpw()` which runs in constant time relative to input length.

```python
# app/core/security.py
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False
```

---

### 3. Stateless JWT Bearer Token Architecture

- **Algorithm:** `HS256` (HMAC with SHA-256) using a 64-character server secret key.
- **Payload Structure:**
  ```json
  {
    "sub": "admin@bajajenterprises.com",
    "exp": 1776518400,
    "iat": 1745000000
  }
  ```
- **Transmission:** Clients include the token in the HTTP `Authorization` header:
  `Authorization: Bearer <TOKEN>`
- **Automatic Session Expiry Handling:** If the backend responds with `401 Unauthorized`, the client interceptor clears local credentials and forwards to `/admin/login?session_expired=true`.

---

### 4. Defense-in-Depth Route Guards

Security is enforced across **three independent layers**:

#### Layer 1: Public Interface Hiding
The public storefront (`Navbar.tsx` and `Footer.tsx`) does not display any visible "Admin Portal" or "Owner Login" buttons to regular customers or scrapers. The admin login is accessible solely via direct URL (`/admin/login`).

#### Layer 2: Client-Side Route Protection (`ProtectedAdminRoute`)
In `App.tsx`, all admin routes are wrapped in a high-order route guard:
```tsx
const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};
```

#### Layer 3: Component-Level In-Page Verification
Every single administrative page component in `frontend/src/pages/admin/` (Overview, Products, Enquiries, Settings, etc.) executes an independent guard check upon mounting:
```tsx
const { isAuthenticated, user, loading: authLoading } = useAuth();
if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
  return <Navigate to="/admin/login" replace />;
}
```

#### Layer 4: Backend Dependency Guard (`require_admin`)
At the FastAPI routing layer, API endpoints check the decoded token claims:
```python
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Administrator permissions required")
    return current_user
```

---

### 5. Password Recovery via Mobile OTP & Master Hint

#### 5.1 Initial Master Password Hint
To prevent store owners from being locked out during initial manual showroom management, the login page features an on-demand hint:
> *"Default showroom master password format: `Admin@Bajaj2026` (Capital 'A', '@' symbol, Year 2026)."*

#### 5.2 Mobile OTP Recovery Workflow
1. Admin clicks **"Forgot Password / OTP Reset?"**.
2. Enters the verified showroom registered mobile number (`+91 94141 38662`).
3. Endpoint `POST /auth/request-otp`:
   - Validates that the number matches registered records.
   - Generates a cryptographically random 6-digit OTP code with a 10-minute expiry timestamp.
4. Admin submits the 6-digit OTP along with their new password.
5. Endpoint `POST /auth/reset-password-otp`:
   - Validates OTP and timestamp.
   - Re-hashes the new password with Bcrypt and commits to the database.
   - In offline/demo mode, saves to `localStorage.setItem('bajaj_custom_admin_password', newPassword)`.

---

### 6. Anti-Spam Honeypot Protection

To prevent automated spam submissions on public quote and inquiry forms without burdening real customers with frustrating CAPTCHAs:
- Public forms include a hidden input field named `website_url` styled with `display: none; tabIndex: -1`.
- Human visitors never see or populate this field.
- Automated bots scan the DOM and populate all form fields.
- If the backend receives an enquiry with `website_url != ""`, it quietly drops the request as spam.
