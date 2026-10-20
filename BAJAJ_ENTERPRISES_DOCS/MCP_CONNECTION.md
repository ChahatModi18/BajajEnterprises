# Model Context Protocol (MCP) Integration — Bajaj Enterprises

> **Target Project:** Bajaj Enterprises  

---

## 1. MCP Server Configuration & Tools

# Integrations & MCP Connection Guide (MCP_AND_INTEGRATIONS.md)
## Bajaj Enterprises — External Services, Communication Protocols & MCP Tooling

---

### 1. Model Context Protocol (MCP) & Agent Architecture

The platform is designed to connect with **Model Context Protocol (MCP)** servers to allow autonomous agents and store management AI to safely interact with inventory, order queues, and customer inquiries.

```mermaid
graph LR
    Agent[AI Agent / Antigravity] <-->|MCP Protocol (JSON-RPC)| MCPServer[Bajaj Enterprises MCP Server]
    MCPServer <-->|Internal API| DB[(Inventory & Enquiries DB)]
    MCPServer --> Tools[Tools: get_low_stock, create_discount, resolve_enquiry]
```

#### Supported MCP Tool Definitions:
1. `list_inventory(brand_slug, min_stock)`: Queries available showroom stock.
2. `get_enquiries(status)`: Fetches unresolved customer leads.
3. `update_enquiry_status(id, status, notes)`: Resolves customer enquiries.
4. `generate_dealer_pdf_catalogue(brand_slug)`: Compiles an exportable product sheet.

---

### 2. WhatsApp Business Click-to-Chat Integration

Bicycle wholesale and showroom retail in regional India heavily rely on WhatsApp for quote confirmation, frame sizing guidance, and transport Bilti sharing.

#### URL Generation Pattern:
```typescript
export function getWhatsAppProductInquiryUrl(productName: string, sku: string, phone: string = "919414138662") {
  const message = encodeURIComponent(
    `Hello Bajaj Enterprises Bikaner,\nI am interested in buying the bicycle:\nModel: ${productName}\nSKU: ${sku}\nPlease share current availability and wholesale/retail price.`
  );
  return `https://wa.me/${phone}?text=${message}`;
}
```

#### Storefront Placement:
- Product Detail Pages: **"Inquire on WhatsApp"** button with pre-filled model name and SKU.
- Mobile Sticky Navigation: Floating WhatsApp direct dial icon.
- Header Top Bar: Clickable showroom helpline (`+91 94141 38662`).

---

### 3. Google Maps Showroom Routing Integration

- **Showroom Address:** Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India.
- **Routing URL:** Configurable via **Store Settings** (`/admin/settings`) so changing store location or adding GPS coordinates does not require code recompilation.
- **Direct Navigation Link:**
  `https://maps.google.com/?q=Alakh+Sagar+Road+Kote+Gate+Bikaner+Rajasthan`
- **Showroom Contact Page:** Integrated directions widget with one-tap navigation for mobile shoppers.

---

### 4. SMTP Email Notification Service

The backend features an asynchronous background mailer to notify showroom staff upon receipt of fresh customer enquiries and order reservations (`BE-REQ-XXXXX`).

#### Fallback Design Pattern:
```python
# app/services/mailer.py
def send_enquiry_alert(enquiry_data: dict):
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        # Development / Fallback mode: Print formatted alert to system logs
        logger.info(f"[MOCK_EMAIL] New Lead: {enquiry_data['name']} ({enquiry_data['phone']})")
        return
    
    # Production SMTP delivery:
    msg = MIMEText(f"Customer {enquiry_data['name']} submitted enquiry for {enquiry_data['message']}")
    msg['Subject'] = f"New Enquiry: {enquiry_data['reference_no']}"
    # Send via smtplib.SMTP_SSL
```

---

### 5. Object Storage Adapter (Cloudflare R2 / AWS S3)

To scale beyond local disk storage and support 10,000+ bicycle photos without server bloat:
- **Protocol:** S3-compatible REST API.
- **Provider:** Cloudflare R2 (zero egress fees, high global bandwidth) or AWS S3.
- **Upload Pipeline:** The `/admin/upload-image` endpoint uploads the source image, utilizes `Pillow` to generate an optimized WebP thumbnail, and writes both objects to the storage bucket.
