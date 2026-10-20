# API Specification & Endpoint Reference (API.md)
## Bajaj Enterprises — RESTful Service Endpoints

---

### 1. General API Specifications

- **Base URL (Local):** `http://127.0.0.1:8000/api/v1`
- **Base URL (Production):** Managed via `VITE_API_URL` environment variable
- **Interactive Documentation (Swagger):** `http://127.0.0.1:8000/docs`
- **Alternative Documentation (ReDoc):** `http://127.0.0.1:8000/redoc`
- **Format:** All requests and responses use `application/json` (unless handling multipart file uploads).
- **Authentication Scheme:** HTTP Bearer token via `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

---

### 2. Authentication & Admin Security Endpoints

#### `POST /auth/login`
Authenticates store administrator and issues a stateless JWT Bearer token.
- **Request Body:**
  ```json
  {
    "email": "admin@bajajenterprises.com",
    "password": "Admin@Bajaj2026"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "role": "ADMIN",
    "email": "admin@bajajenterprises.com",
    "full_name": "Store Administrator"
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "detail": "Incorrect email or password"
  }
  ```

#### `POST /auth/request-otp`
Sends a 6-digit verification recovery OTP to the store owner's registered phone.
- **Request Body:**
  ```json
  {
    "mobile": "9414138662",
    "email": "admin@bajajenterprises.com"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Verification OTP sent successfully to registered mobile +91 94141 ***62.",
    "masked_mobile": "+91 94141 ***62",
    "dev_otp": "748291"
  }
  ```

#### `POST /auth/reset-password-otp`
Validates 6-digit OTP and commits a newly hashed password to the database.
- **Request Body:**
  ```json
  {
    "mobile": "9414138662",
    "otp": "748291",
    "new_password": "NewSecurePassword2026"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Password successfully updated. You can now log in with your new credentials."
  }
  ```

#### `GET /auth/me` *(Protected: Bearer Token required)*
Returns identity and permission role of currently logged-in administrator.
- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "email": "admin@bajajenterprises.com",
    "full_name": "Store Administrator",
    "role": "ADMIN",
    "is_active": true
  }
  ```

---

### 3. Public Storefront Endpoints

#### `GET /products`
Searches, paginates, and multi-filters the live bicycle catalogue.
- **Query Parameters:**
  - `search` *(string)*: Substring match against name, sku, or description.
  - `brand_id` *(int)*: Filter by manufacturer ID.
  - `category_id` *(int)*: Filter by segment ID.
  - `min_price`, `max_price` *(float)*: Price boundaries in ₹.
  - `page` *(int, default: 1)*: Page number.
  - `page_size` *(int, default: 24)*: Items per page.
- **Success Response (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "AVON Buena 26T City Bicycle",
        "slug": "avon-buena-26t",
        "sku": "AVON-BUE-26-001",
        "selling_price": 5200.0,
        "mrp": 5800.0,
        "stock_quantity": 8,
        "availability_status": "IN_STOCK",
        "brand": { "id": 1, "name": "AVON", "slug": "avon" },
        "category": { "id": 1, "name": "City & Commuter", "slug": "city-bicycle" },
        "images": [
          { "id": 1, "image_url": "/uploads/avon_buena.png", "is_primary": true }
        ],
        "attributes": [
          { "attribute_name": "Wheel Size", "value": "26 inches" },
          { "attribute_name": "Gear Count", "value": "Single Speed" }
        ]
      }
    ],
    "total": 42,
    "page": 1,
    "page_size": 24,
    "total_pages": 2
  }
  ```

#### `GET /products/{slug_or_id}`
Returns complete details and multi-angle photo gallery for a specific bicycle.

#### `GET /brands`
Returns all active manufacturer brands for header dropdowns and logo showcases.

#### `GET /categories`
Returns active bicycle segment taxonomies.

#### `GET /schemes`
Returns active promotional offers and discount rules to display on the public storefront.

#### `POST /enquiries`
Submits a customer question or quote request with anti-spam honeypot protection.
- **Request Body:**
  ```json
  {
    "name": "Ramesh Kumar",
    "phone": "+91 98290 12345",
    "email": "ramesh@example.com",
    "product_id": 1,
    "message": "Looking for 10 units for local delivery in Bikaner.",
    "website_url": ""  // Anti-spam honeypot (must be blank)
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "id": 18,
    "reference_no": "BE-ENQ-91823",
    "message": "Enquiry submitted successfully. Showroom staff will contact you shortly."
  }
  ```

#### `POST /order-requests`
Creates an order reservation and issues an official tracking reference code.
- **Request Body:**
  ```json
  {
    "customer_name": "Sunil Sharma",
    "customer_phone": "+91 94140 54321",
    "customer_address": "Rani Bazar, Bikaner, Rajasthan",
    "delivery_preference": "STORE_PICKUP",
    "items": [
      { "product_id": 1, "quantity": 2, "unit_price": 5200.0 }
    ],
    "total_amount": 10400.0
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "id": 9,
    "reference_no": "BE-REQ-48192",
    "total_amount": 10400.0,
    "status": "RECEIVED",
    "message": "Showroom booking confirmed under reference BE-REQ-48192."
  }
  ```

---

### 4. Protected Administration Endpoints *(Bearer Token Required)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/products` | Create a new bicycle model |
| `PUT` | `/admin/products/{id}` | Update specifications, prices, or stock counts |
| `DELETE`| `/admin/products/{id}` | Archive or delete a bicycle |
| `POST` | `/admin/products/{id}/duplicate` | Clone an existing bicycle configuration |
| `POST` | `/admin/products/{id}/images` | Upload camera photo or attachment |
| `GET` | `/admin/attributes` | Fetch all custom field definitions |
| `POST` | `/admin/attributes` | Create a new custom field (e.g. `Suspension`) |
| `POST` | `/admin/catalogue-imports/upload` | Ingest distributor CSV / Excel spreadsheet |
| `POST` | `/admin/catalogue-imports/{id}/commit` | Atomically commit validated rows to live store |
| `GET` | `/admin/enquiries` | Fetch customer enquiries with status filter |
| `PATCH`| `/admin/enquiries/{id}` | Update enquiry status (`RESOLVED`, `CLOSED`) & add notes |
| `GET` | `/admin/order-requests` | Fetch customer booking requests |
| `PATCH`| `/admin/order-requests/{id}` | Progress order lifecycle (`CONFIRMED`, `DELIVERED`) |
| `GET` | `/admin/settings` | Read showroom operating hours, phone, WhatsApp & policies |
| `PUT` | `/admin/settings` | Update showroom contact and policy details |
