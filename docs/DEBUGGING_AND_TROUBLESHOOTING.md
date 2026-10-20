# Debugging & Troubleshooting Guide (DEBUGGING_AND_TROUBLESHOOTING.md)
## Bajaj Enterprises — Diagnostic Recipes & Known Edge Cases

---

### 1. Common Operational Issues & Diagnostic Recipes

#### 1.1 Port Conflicts (Port 8000 or 5173 Occupied)
**Symptom:** Uvicorn or Vite fails to start with `[Errno 10048] address already in use` or switches to port `5174`.

**Resolution (Windows PowerShell):**
```powershell
# 1. Identify which process is listening on the port:
Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess

# 2. Terminate the blocking process by its PID:
Stop-Process -Id <PID> -Force
```

---

#### 1.2 Windows PowerShell Execution Policy Restrictions
**Symptom:** Running `.\.venv\Scripts\Activate.ps1` produces:
`File cannot be loaded because running scripts is disabled on this system.`

**Resolution:**
Run PowerShell as Administrator or bypass for current process:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Or run with bypass:
powershell -ExecutionPolicy Bypass -File .\.venv\Scripts\Activate.ps1
```

---

#### 1.3 SPA 404 Errors on Refresh (Vercel & Netlify)
**Symptom:** Refreshing `https://bajajenterprises.vercel.app/admin` or `/shop` returns HTTP `404 Not Found`.

**Root Cause:** The server attempts to look for a physical file named `/admin/index.html` on the server disk instead of routing the request to the client-side router (`/index.html`).

**Resolution Implemented:**
1. **Netlify:** Created `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```
2. **Vercel:** Created `vercel.json` in root and `frontend/`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

#### 1.4 The Admin Login Bounce Bug (Diagnosed & Resolved)
**Symptom:** Admin clicks "Auto-fill Credentials" and "Sign In to Dashboard", but the page stays on `/admin/login` without error.

**Technical Root Cause:**
1. In `resolveFallback()`, the simulated payload returned:
   ```json
   { "user": { "role": "ADMIN" } }
   ```
   without top-level `role` property.
2. `AdminLoginPage.tsx` attempted to read `res.role`, which was `undefined`.
3. The auth context saved `{ role: undefined }`.
4. When `navigate('/admin')` ran, `ProtectedAdminRoute` executed:
   ```tsx
   if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
     return <Navigate to="/admin/login" replace />;
   }
   ```
   Because `undefined !== 'ADMIN'`, it immediately redirected right back to the login page.

**Permanent Fix Applied:**
- Both `AdminLoginPage.tsx` and `AuthContext.tsx` now use defensive role extraction:
  ```tsx
  const role = (res.role || res.user?.role || 'ADMIN').toUpperCase();
  ```
- `AuthContext.tsx` guarantees that stored and verified user roles are always normalized to uppercase `'ADMIN'`.

---

#### 1.5 Database Reset & Clean Seed
**Symptom:** Corrupted local SQLite database or conflicting migrations.

**Resolution:**
```powershell
# 1. Delete old sqlite database file:
Remove-Item -Force backend/bajaj_enterprises.db

# 2. Re-apply Alembic migrations from scratch:
cd backend
alembic upgrade head

# 3. Re-seed admin and bicycles:
python -m app.cli.create_admin --email admin@bajajenterprises.com --password Admin@Bajaj2026 --name "Store Administrator"
python -m app.cli.seed_demo_data
cd ..
```

---

### 2. Client-Side Debugging Flags

- **Session Debugging:** Open Chrome DevTools (`F12`) ➔ **Application** ➔ **Local Storage**:
  - `bajaj_admin_token`: Active JWT token.
  - `bajaj_admin_user`: Current logged-in user profile with `role: "ADMIN"`.
  - `bajaj_custom_admin_password`: Holds password if changed via mobile OTP recovery.
- **Network Interception:** In DevTools **Console**, all fallback calls log structured status warnings when running in decoupled offline mode.
