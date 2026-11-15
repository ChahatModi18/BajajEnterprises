"""
Google Form Ingestion & Bicycle Details Mapping Service

Allows store administrators to create and fill a Google Form for new bicycle inventory,
and parse the submitted responses (CSV export, Google Sheet, or JSON webhook) to
automatically populate bicycle details, pricing, warranty, and custom specification boxes.

Note: Kept non-intrusive and modular so that public storefront deployments remain untouched.
"""

import csv
import io
import re
from typing import Dict, Any, List, Optional


def generate_google_form_template() -> Dict[str, Any]:
    """
    Returns the recommended question schema and structure for Bajaj Enterprises Google Form.
    Admin can use this structure to create their Google Form in Google Drive.
    """
    return {
        "form_title": "Bajaj Enterprises - Bicycle Details & Catalogue Ingestion Form",
        "description": "Fill out new or showroom bicycle details to automatically generate catalogue listings.",
        "questions": [
            {
                "title": "Bicycle Name / साइकिल का नाम",
                "type": "SHORT_ANSWER",
                "required": True,
                "example": "AVON City Commuter 26T"
            },
            {
                "title": "Brand / ब्रांड",
                "type": "MULTIPLE_CHOICE",
                "options": ["AVON", "HERCULES", "HERO", "BSA", "Other"],
                "required": True
            },
            {
                "title": "Category / श्रेणी",
                "type": "MULTIPLE_CHOICE",
                "options": ["City Bicycles", "Geared Bicycles", "Mountain Bicycles (MTB)", "Kids Bicycles", "Road Bicycles"],
                "required": True
            },
            {
                "title": "Selling Price (₹) / बिक्री कीमत",
                "type": "SHORT_ANSWER",
                "required": True,
                "example": "6499"
            },
            {
                "title": "MRP (₹) / अधिकतम खुदरा मूल्य",
                "type": "SHORT_ANSWER",
                "required": False,
                "example": "7199"
            },
            {
                "title": "Stock Quantity / उपलब्ध संख्या",
                "type": "SHORT_ANSWER",
                "required": False,
                "default": "5"
            },
            {
                "title": "Wheel Size / पहिए का आकार",
                "type": "MULTIPLE_CHOICE",
                "options": ["20T", "24T", "26T", "27.5T", "29T", "700C"],
                "required": False
            },
            {
                "title": "Gear Count / गियर की संख्या",
                "type": "MULTIPLE_CHOICE",
                "options": ["Single Speed", "7-Speed Shimano", "21-Speed Shimano", "24-Speed Shimano"],
                "required": False
            },
            {
                "title": "Brake Type / ब्रेक का प्रकार",
                "type": "MULTIPLE_CHOICE",
                "options": ["Caliper Brakes", "V-Brakes", "Mechanical Disc Brakes", "Hydraulic Disc Brakes", "Rod Brakes"],
                "required": False
            },
            {
                "title": "Frame Material / फ्रेम सामग्री",
                "type": "SHORT_ANSWER",
                "example": "High Tensile Steel / Alloy 6061"
            },
            {
                "title": "Frame Size / फ्रेम आकार",
                "type": "SHORT_ANSWER",
                "example": "18 inch"
            },
            {
                "title": "Warranty / वारंटी",
                "type": "SHORT_ANSWER",
                "default": "1 Year Manufacturer Frame Warranty"
            },
            {
                "title": "Description & Features / विवरण",
                "type": "PARAGRAPH",
                "required": False
            },
            {
                "title": "Custom Specifications / अतिरिक्त विशेषताएं (e.g. Carrier, Battery, Weight)",
                "type": "PARAGRAPH",
                "required": False,
                "example": "Carrier: Heavy Duty Steel, Battery: 36V 250W, Weight: 14.5 kg"
            }
        ]
    }


def clean_currency_or_number(value_str: Any) -> Optional[float]:
    """Helper to convert strings like '₹ 11,500', 'Rs. 8,999.50', '11500.00' or 11500 to a float."""
    if value_str is None or value_str == "":
        return None
    if isinstance(value_str, (int, float)):
        return float(value_str)
    # Strip currency words like Rs, Rs., INR, etc.
    s = re.sub(r"(?i)\b(rs\.?|inr)\b", "", str(value_str))
    # Match first valid numeric sequence
    match = re.search(r"(\d[\d,]*\.?\d*)", s)
    if not match:
        return None
    cleaned = match.group(1).replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def map_google_form_row_to_bicycle(
    row: Dict[str, str],
    brand_map: Optional[Dict[str, int]] = None,
    category_map: Optional[Dict[str, int]] = None,
) -> Dict[str, Any]:
    """
    Takes a dictionary representing a row from Google Form responses
    and normalizes it into a bicycle details dictionary.
    """
    brand_map = brand_map or {"avon": 1, "hercules": 2, "hero": 3, "bsa": 4}
    category_map = category_map or {
        "city": 1, "geared": 2, "mountain": 3, "mtb": 3, "kids": 4, "road": 5
    }

    def find_val(candidates: List[str], default: Any = "") -> Any:
        for c in candidates:
            c_norm = re.sub(r"[^a-zA-Z0-9\u0900-\u097F]", "", c.lower())
            for r_key, r_val in row.items():
                r_norm = re.sub(r"[^a-zA-Z0-9\u0900-\u097F]", "", r_key.lower())
                if c_norm and (c_norm == r_norm or c_norm in r_norm or r_norm in c_norm):
                    if r_val is not None and str(r_val).strip() != "":
                        return str(r_val).strip()
        return default

    # Extract standard fields
    raw_name = find_val(["Bicycle Name", "साइकिल का नाम", "Cycle Name", "Model", "Name"], "New Bicycle")
    raw_brand = str(find_val(["Brand", "ब्रांड", "Manufacturer"], "AVON")).strip()
    raw_category = str(find_val(["Category", "श्रेणी", "Type"], "City Bicycles")).strip()

    # Match brand_id
    matched_brand_id = 1
    for b_key, b_id in brand_map.items():
        if b_key in raw_brand.lower():
            matched_brand_id = b_id
            break

    # Match category_id
    matched_cat_id = 1
    for c_key, c_id in category_map.items():
        if c_key in raw_category.lower():
            matched_cat_id = c_id
            break

    selling_price = clean_currency_or_number(find_val(["Selling Price", "बिक्री कीमत", "Price"]))
    mrp = clean_currency_or_number(find_val(["MRP", "अधिकतम खुदरा मूल्य"]))
    stock_raw = clean_currency_or_number(find_val(["Stock Quantity", "उपलब्ध संख्या", "Stock", "Quantity"]))
    stock_quantity = int(stock_raw) if stock_raw is not None else 5

    warranty = find_val(
        ["Warranty", "वारंटी", "Warranty Info"],
        "1 Year Manufacturer Frame Warranty"
    )
    if not warranty:
        warranty = "1 Year Manufacturer Frame Warranty"

    description = find_val(["Description", "विवरण", "Features", "Notes"], "")

    # Extract and normalize dynamic specifications
    attributes: List[Dict[str, Any]] = []

    spec_mappings = [
        ("Wheel Size", ["Wheel Size", "पहिए का आकार", "Wheel", "Tyre Size"]),
        ("Gear Count", ["Gear Count", "गियर की संख्या", "Gears", "Speed"]),
        ("Brake Type", ["Brake Type", "ब्रेक का प्रकार", "Brakes", "Brake"]),
        ("Frame Material", ["Frame Material", "फ्रेम सामग्री", "Material"]),
        ("Frame Size", ["Frame Size", "फ्रेम आकार", "Frame"]),
        ("Suspension", ["Suspension", "सस्पेंशन", "Shock Absorber"]),
        ("Colour", ["Colour", "Color", "रंग"]),
        ("Rider Age / Height", ["Rider Fit", "Rider Age", "Height", "उपयुक्त आयु"]),
    ]

    for label, aliases in spec_mappings:
        val = find_val(aliases, "")
        if val:
            attributes.append({
                "attribute_name": label,
                "attribute_key": re.sub(r"[^a-z0-9]", "_", label.lower()),
                "value": str(val),
                "show_in_specs": True,
                "show_in_card": True,
            })

    # Check for custom specifications column (e.g. "Carrier: Steel, Battery: 36V")
    custom_raw = find_val(["Custom Specifications", "अतिरिक्त विशेषताएं", "Additional Specifications", "Extra Specs"], "")
    if custom_raw:
        items = re.split(r"[,;\n]", str(custom_raw))
        for item in items:
            if ":" in item:
                k, v = item.split(":", 1)
                k_clean = k.strip()
                v_clean = v.strip()
                if k_clean and v_clean:
                    attributes.append({
                        "attribute_name": k_clean,
                        "attribute_key": re.sub(r"[^a-z0-9]", "_", k_clean.lower()),
                        "value": v_clean,
                        "show_in_specs": True,
                        "show_in_card": True,
                    })

    # Ensure clean SKU
    clean_slug = re.sub(r"[^a-z0-9]+", "-", raw_name.lower()).strip("-")
    sku = f"GF-{clean_slug[:10].upper()}-{abs(hash(raw_name)) % 10000:04d}"

    return {
        "name": raw_name,
        "slug": clean_slug,
        "sku": sku,
        "brand_id": matched_brand_id,
        "brand_name": raw_brand,
        "category_id": matched_cat_id,
        "category_name": raw_category,
        "selling_price": selling_price,
        "mrp": mrp,
        "stock_quantity": stock_quantity,
        "availability_status": "IN_STOCK" if stock_quantity > 0 else "OUT_OF_STOCK",
        "warranty_info": warranty,
        "description": description,
        "attributes": attributes,
        "is_published": True,
        "is_new_arrival": True,
    }


def parse_google_form_csv(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parses a downloaded Google Form responses CSV string into a list of bicycle payload dicts.
    """
    bicycles: List[Dict[str, Any]] = []
    f = io.StringIO(csv_content)
    reader = csv.DictReader(f)

    for row in reader:
        if not any(row.values()):
            continue
        bicycle = map_google_form_row_to_bicycle(row)
        bicycles.append(bicycle)

    return bicycles


def parse_google_form_response_json(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses a single Google Form webhook / response JSON payload
    where answers are mapped by question title or IDs.
    """
    flat_row: Dict[str, str] = {}

    if "answers" in payload and isinstance(payload["answers"], dict):
        for q_title, ans_val in payload["answers"].items():
            if isinstance(ans_val, dict) and "text" in ans_val:
                flat_row[q_title] = str(ans_val["text"])
            elif isinstance(ans_val, list):
                flat_row[q_title] = ", ".join(str(x) for x in ans_val)
            else:
                flat_row[q_title] = str(ans_val)
    elif "responses" in payload and isinstance(payload["responses"], list) and len(payload["responses"]) > 0:
        return parse_google_form_response_json(payload["responses"][0])
    else:
        for k, v in payload.items():
            flat_row[k] = str(v)

    return map_google_form_row_to_bicycle(flat_row)
