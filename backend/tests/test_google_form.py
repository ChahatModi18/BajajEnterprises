import pytest
from app.services.google_form_service import (
    generate_google_form_template,
    clean_currency_or_number,
    map_google_form_row_to_bicycle,
    parse_google_form_csv,
    parse_google_form_response_json,
)


def test_generate_google_form_template():
    template = generate_google_form_template()
    assert "Bajaj Enterprises" in template["form_title"]
    assert len(template["questions"]) >= 10
    titles = [q["title"] for q in template["questions"]]
    assert any("Bicycle Name" in t for t in titles)
    assert any("Selling Price" in t for t in titles)
    assert any("Wheel Size" in t for t in titles)


def test_clean_currency_or_number():
    assert clean_currency_or_number("12000") == 12000.0
    assert clean_currency_or_number("₹ 14,500") == 14500.0
    assert clean_currency_or_number("Rs. 8,999.50") == 8999.50
    assert clean_currency_or_number(6499) == 6499.0
    assert clean_currency_or_number("") is None
    assert clean_currency_or_number(None) is None


def test_map_google_form_row_english_and_hindi():
    sample_row = {
        "Bicycle Name / साइकिल का नाम": "AVON Spark City Pro 26T",
        "Brand / ब्रांड": "AVON",
        "Category / श्रेणी": "City Bicycles",
        "Selling Price (₹) / बिक्री कीमत": "₹ 6,499",
        "MRP (₹) / अधिकतम खुदरा मूल्य": "7,199",
        "Stock Quantity / उपलब्ध संख्या": "8",
        "Wheel Size / पहिए का आकार": "26T",
        "Gear Count / गियर की संख्या": "Single Speed",
        "Brake Type / ब्रेक का प्रकार": "V-Brakes",
        "Warranty / वारंटी": "1 Year Manufacturer Frame Warranty",
        "Description & Features / विवरण": "Durable commuter bicycle for daily use across Bikaner.",
    }

    result = map_google_form_row_to_bicycle(sample_row)
    assert result["name"] == "AVON Spark City Pro 26T"
    assert result["brand_id"] == 1
    assert result["category_id"] == 1
    assert result["selling_price"] == 6499.0
    assert result["mrp"] == 7199.0
    assert result["stock_quantity"] == 8
    assert result["availability_status"] == "IN_STOCK"
    assert result["warranty_info"] == "1 Year Manufacturer Frame Warranty"

    # Check extracted dynamic specifications
    specs = {a["attribute_name"]: a["value"] for a in result["attributes"]}
    assert specs["Wheel Size"] == "26T"
    assert specs["Gear Count"] == "Single Speed"
    assert specs["Brake Type"] == "V-Brakes"


def test_parse_google_form_csv():
    csv_data = """Timestamp,Bicycle Name,Brand,Category,Selling Price,MRP,Stock,Wheel Size,Brake Type
2026/11/15 10:15:20 AM,Hercules Roadeo Hardliner,Hercules,Mountain Bicycles,14999,16999,6,27.5T,Mechanical Disc
2026/11/15 11:20:45 AM,Avon Junior Star 20T,Avon,Kids Bicycles,3999,4499,10,20T,Caliper Brakes
"""
    bicycles = parse_google_form_csv(csv_data)
    assert len(bicycles) == 2

    mtb = bicycles[0]
    assert mtb["name"] == "Hercules Roadeo Hardliner"
    assert mtb["brand_id"] == 2
    assert mtb["selling_price"] == 14999.0
    assert mtb["stock_quantity"] == 6

    kids = bicycles[1]
    assert kids["name"] == "Avon Junior Star 20T"
    assert kids["brand_id"] == 1
    assert kids["category_id"] == 4
    assert kids["selling_price"] == 3999.0


def test_parse_google_form_response_json():
    webhook_payload = {
        "answers": {
            "Bicycle Name": {"text": "Hero Sprint Pro 29T"},
            "Brand": {"text": "Hero"},
            "Category": {"text": "Mountain Bicycles (MTB)"},
            "Selling Price": {"text": "13500"},
            "MRP": {"text": "14999"},
            "Stock Quantity": {"text": "4"},
            "Wheel Size": {"text": "29T"},
            "Gear Count": {"text": "21-Speed Shimano"},
            "Warranty": {"text": "1 Year Manufacturer Frame Warranty"}
        }
    }
    bike = parse_google_form_response_json(webhook_payload)
    assert bike["name"] == "Hero Sprint Pro 29T"
    assert bike["brand_id"] == 3
    assert bike["selling_price"] == 13500.0
    assert bike["warranty_info"] == "1 Year Manufacturer Frame Warranty"
    assert any(a["attribute_name"] == "Wheel Size" and a["value"] == "29T" for a in bike["attributes"])


def test_custom_specifications_extraction():
    row = {
        "Bicycle Name": "Avon E-Commuter Deluxe",
        "Brand": "AVON",
        "Selling Price": "28500",
        "Custom Specifications / अतिरिक्त विशेषताएं": "Battery: 36V 7.8Ah Li-ion, Motor: 250W BLDC, Carrier: Heavy Duty Rear Stand, Weight: 18.5 kg"
    }
    bike = map_google_form_row_to_bicycle(row)
    specs = {a["attribute_name"]: a["value"] for a in bike["attributes"]}
    assert specs["Battery"] == "36V 7.8Ah Li-ion"
    assert specs["Motor"] == "250W BLDC"
    assert specs["Carrier"] == "Heavy Duty Rear Stand"
    assert specs["Weight"] == "18.5 kg"


def test_google_form_edge_cases():
    # Empty or minimal row
    row = {
        "Bicycle Name": "Generic Road Bike",
    }
    bike = map_google_form_row_to_bicycle(row)
    assert bike["name"] == "Generic Road Bike"
    assert bike["warranty_info"] == "1 Year Manufacturer Frame Warranty"
    assert bike["stock_quantity"] == 5
    assert bike["is_published"] is True
