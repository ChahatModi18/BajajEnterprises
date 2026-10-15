import os
import datetime
import argparse
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.entities import (
    Brand, Category, Product, ProductAttribute, 
    ProductAttributeValue, ProductImage, StoreSetting,
    Enquiry, OrderRequest, OrderRequestItem, Scheme, Banner
)

def create_svg_placeholder(filename: str, title: str, subtitle: str, color: str):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg_{color.replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg_{color.replace('#', '')})"/>
  <rect x="40" y="40" width="720" height="520" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <g transform="translate(400, 260)">
    <!-- Bicycle Wheels -->
    <circle cx="-160" cy="60" r="90" fill="none" stroke="#334155" stroke-width="12"/>
    <circle cx="-160" cy="60" r="16" fill="#64748b"/>
    <circle cx="160" cy="60" r="90" fill="none" stroke="#334155" stroke-width="12"/>
    <circle cx="160" cy="60" r="16" fill="#64748b"/>
    <!-- Spokes -->
    <line x1="-160" y1="-30" x2="-160" y2="150" stroke="#94a3b8" stroke-width="3"/>
    <line x1="-250" y1="60" x2="-70" y2="60" stroke="#94a3b8" stroke-width="3"/>
    <line x1="160" y1="-30" x2="160" y2="150" stroke="#94a3b8" stroke-width="3"/>
    <line x1="70" y1="60" x2="250" y2="60" stroke="#94a3b8" stroke-width="3"/>
    <!-- Frame -->
    <polyline points="-160,60 -30,60 100,-70 -50,-70 -160,60" fill="none" stroke="{color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="-30,60 160,60 100,-70" fill="none" stroke="{color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Handlebar & Fork -->
    <line x1="160" y1="60" x2="110" y2="-90" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
    <line x1="90" y1="-95" x2="135" y2="-95" stroke="#1e293b" stroke-width="16" stroke-linecap="round"/>
    <!-- Seat -->
    <line x1="-30" y1="60" x2="-65" y2="-85" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
    <path d="M -100 -95 C -100 -105, -50 -105, -30 -90" fill="none" stroke="#0f172a" stroke-width="18" stroke-linecap="round"/>
    <!-- Pedal Crank -->
    <circle cx="-30" cy="60" r="22" fill="#0f172a"/>
  </g>
  <rect x="250" y="440" width="300" height="32" rx="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="461" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#b45309" text-anchor="middle">DEMO PRODUCT — ILLUSTRATIVE ONLY</text>
  <text x="400" y="505" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">{title}</text>
  <text x="400" y="530" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">{subtitle}</text>
</svg>'''
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)
    return f"/uploads/{filename}"

def seed_database(clear_demo_only: bool = False):
    db = SessionLocal()
    try:
        if clear_demo_only:
            # 1. Clear demo order requests & items
            demo_orders = db.query(OrderRequest).filter(OrderRequest.reference_no.like("DEMO-%")).all()
            for o in demo_orders:
                db.delete(o)
            
            # 2. Clear demo enquiries
            demo_enquiries = db.query(Enquiry).filter(Enquiry.reference_no.like("DEMO-%")).all()
            for e in demo_enquiries:
                db.delete(e)

            # 3. Clear demo products & attached images/values
            demo_products = db.query(Product).filter(Product.is_demo == True).all()
            for p in demo_products:
                db.delete(p)

            # 4. Clear demo schemes
            demo_schemes = db.query(Scheme).filter(Scheme.slug.like("demo-%")).all()
            for s in demo_schemes:
                db.delete(s)

            db.commit()
            print(f"Success: Purged demo records (products, orders, enquiries, schemes).")
            return

        # ----------------------------------------------------
        # 1. Brands
        # ----------------------------------------------------
        avon = db.query(Brand).filter(Brand.slug == "avon").first()
        if not avon:
            avon = Brand(
                name="AVON",
                slug="avon",
                description="AVON cycles — Renowned Indian manufacturer known for dependable commuter and everyday bicycles.",
                is_active=True,
                sort_order=1
            )
            db.add(avon)

        hercules = db.query(Brand).filter(Brand.slug == "hercules").first()
        if not hercules:
            hercules = Brand(
                name="HERCULES",
                slug="hercules",
                description="HERCULES bicycles — Iconic rugged performance and geared bicycles for all terrains.",
                is_active=True,
                sort_order=2
            )
            db.add(hercules)

        db.flush()

        # ----------------------------------------------------
        # 2. Categories
        # ----------------------------------------------------
        categories_data = [
            ("City Bicycle", "city-bicycle", "Comfortable, efficient bicycles designed for urban commuting and paved roads."),
            ("Geared Bicycle", "geared-bicycle", "Multi-speed geared bicycles for effortless riding across varying elevations."),
            ("Kids' Bicycles", "kids-bicycles", "Safe, vibrant bicycles built specifically for children and young riders."),
            ("Mountain Bicycles (MTB)", "mountain-bicycles", "Sturdy suspension and knobby tires for off-road trails and rough paths."),
            ("Road Bicycles", "road-bicycles", "Lightweight aerodynamic bicycles for high-speed endurance cycling."),
            ("Non-geared Bicycles", "non-geared-bicycles", "Low-maintenance single-speed bicycles for reliable everyday travel."),
            ("Accessories & Spares", "accessories-spare-parts", "Helmets, locks, bells, lights, pumps and genuine spare parts.")
        ]
        cat_map = {}
        for idx, (cname, cslug, cdesc) in enumerate(categories_data):
            cat = db.query(Category).filter(Category.slug == cslug).first()
            if not cat:
                cat = Category(
                    name=cname,
                    slug=cslug,
                    description=cdesc,
                    is_active=True,
                    sort_order=idx + 1
                )
                db.add(cat)
                db.flush()
            cat_map[cslug] = cat

        # ----------------------------------------------------
        # 3. Dynamic Product Attributes
        # ----------------------------------------------------
        attrs_data = [
            ("Wheel Size", "wheel_size", "dropdown", ["20 inches", "24 inches", "26 inches", "27.5 inches", "29 inches", "700C"], "inches", True, True, True, 1),
            ("Gear Count", "gear_count", "dropdown", ["Single Speed", "7 Speed", "18 Speed", "21 Speed", "24 Speed"], "gears", True, True, True, 2),
            ("Brake Type", "brake_type", "dropdown", ["V-Brakes", "Mechanical Disc Brakes", "Hydraulic Disc Brakes", "Caliper Brakes"], None, False, True, True, 3),
            ("Frame Material", "frame_material", "dropdown", ["Steel", "Alloy (Aluminium 6061)", "Carbon Fibre"], None, False, True, True, 4),
            ("Suspension", "suspension", "dropdown", ["Rigid", "Front Suspension", "Dual Suspension"], None, False, True, True, 5),
            ("Colour", "colour", "text", None, None, True, True, True, 6),
            ("Rider Age / Height", "rider_fit", "text", None, None, False, True, True, 7)
        ]
        attr_map = {}
        for (aname, akey, atype, aoptions, aunit, incard, infreq, inspec, asort) in attrs_data:
            attr = db.query(ProductAttribute).filter(ProductAttribute.key == akey).first()
            if not attr:
                attr = ProductAttribute(
                    name=aname,
                    key=akey,
                    field_type=atype,
                    options_json=aoptions,
                    unit=aunit,
                    show_in_card=incard,
                    show_in_filters=infreq,
                    show_in_specs=inspec,
                    show_in_comparison=True,
                    sort_order=asort,
                    is_active=True
                )
                db.add(attr)
                db.flush()
            attr_map[akey] = attr

        # ----------------------------------------------------
        # 4. Generate SVG Placeholder Images
        # ----------------------------------------------------
        img_avon_city = create_svg_placeholder(
            "demo_avon_city_001.svg", 
            "AVON Sample City Bicycle", 
            "26 Inch Wheel • Red • Single Speed", 
            "#dc2626"
        )
        img_hercules_geared = create_svg_placeholder(
            "demo_hercules_geared_001.svg", 
            "HERCULES Sample Geared Bicycle", 
            "21 Speed • Black • Alloy Suspension", 
            "#1e293b"
        )
        img_hercules_mtb = create_svg_placeholder(
            "demo_hercules_mtb_002.svg",
            "HERCULES Sample Roadeo Trail MTB",
            "27.5 Inch • Matte Green • Dual Disc Brakes",
            "#15803d"
        )
        img_avon_kids = create_svg_placeholder(
            "demo_avon_junior_002.svg",
            "AVON Sample Junior Star 20T",
            "Kids 20T • Sky Blue • Trainer Wheels",
            "#0284c7"
        )
        img_avon_commuter = create_svg_placeholder(
            "demo_avon_speedster_003.svg",
            "AVON Sample Speedster Commuter",
            "700C • 7 Speed • Alloy Commuter",
            "#d97706"
        )

        # ----------------------------------------------------
        # 5. Seed Demo Bicycles
        # ----------------------------------------------------
        demo_products_data = [
            {
                "sku": "DEMO-AVON-001",
                "name": "AVON Sample City Bicycle",
                "slug": "avon-sample-city-bicycle-demo",
                "model_number": "AVON-CITY-26",
                "brand_id": avon.id,
                "category_id": cat_map["city-bicycle"].id,
                "selling_price": 4999.0,
                "mrp": 5499.0,
                "stock": 10,
                "image": img_avon_city,
                "desc": "Illustrative sample listing for an AVON classic city bicycle. Engineered for daily commuting on urban streets with durable steel tubing and ergonomic geometry. (Fictional demo record; not confirmed shop inventory).",
                "warranty": "1 Year Frame Warranty (Subject to owner verification)",
                "featured": True,
                "new_arr": True,
                "bestseller": False,
                "specs": [
                    ("wheel_size", "26 inches"),
                    ("gear_count", "Single Speed"),
                    ("colour", "Red"),
                    ("frame_material", "Steel"),
                    ("brake_type", "V-Brakes"),
                    ("suspension", "Rigid"),
                    ("rider_fit", "5'2\" - 5'10\" / 14+ Years")
                ]
            },
            {
                "sku": "DEMO-HERCULES-001",
                "name": "HERCULES Sample Geared Bicycle",
                "slug": "hercules-sample-geared-bicycle-demo",
                "model_number": "HERC-GEAR-21",
                "brand_id": hercules.id,
                "category_id": cat_map["geared-bicycle"].id,
                "selling_price": 8999.0,
                "mrp": 9999.0,
                "stock": 8,
                "image": img_hercules_geared,
                "desc": "Illustrative sample listing for a HERCULES geared bicycle. Features 21-speed gears, front suspension fork and disc brakes for dynamic riding. (Fictional demo record; not confirmed shop inventory).",
                "warranty": "2 Year Frame Warranty (Subject to owner verification)",
                "featured": True,
                "new_arr": True,
                "bestseller": True,
                "specs": [
                    ("wheel_size", "26 inches"),
                    ("gear_count", "21 Speed"),
                    ("colour", "Black"),
                    ("frame_material", "Alloy (Aluminium 6061)"),
                    ("brake_type", "Mechanical Disc Brakes"),
                    ("suspension", "Front Suspension"),
                    ("rider_fit", "5'3\" - 6'0\" / 15+ Years")
                ]
            },
            {
                "sku": "DEMO-HERCULES-002",
                "name": "HERCULES Sample Roadeo Trail MTB",
                "slug": "hercules-sample-roadeo-trail-mtb-demo",
                "model_number": "HERC-ROA-275",
                "brand_id": hercules.id,
                "category_id": cat_map["mountain-bicycles"].id,
                "selling_price": 11499.0,
                "mrp": 12999.0,
                "stock": 4,
                "image": img_hercules_mtb,
                "desc": "Illustrative sample mountain bicycle with rugged 27.5-inch knobby tyres, dual disc brakes, and progressive front suspension. Perfect for semi-urban tracks and off-road exploring. (Demo record).",
                "warranty": "2 Year Frame Warranty (Subject to owner verification)",
                "featured": True,
                "new_arr": True,
                "bestseller": False,
                "specs": [
                    ("wheel_size", "27.5 inches"),
                    ("gear_count", "21 Speed"),
                    ("colour", "Matte Green"),
                    ("frame_material", "Alloy (Aluminium 6061)"),
                    ("brake_type", "Mechanical Disc Brakes"),
                    ("suspension", "Front Suspension"),
                    ("rider_fit", "5'4\" - 6'2\" / All Heights")
                ]
            },
            {
                "sku": "DEMO-AVON-002",
                "name": "AVON Sample Junior Star 20T Kids Bicycle",
                "slug": "avon-sample-junior-star-20t-demo",
                "model_number": "AVON-JR-20",
                "brand_id": avon.id,
                "category_id": cat_map["kids-bicycles"].id,
                "selling_price": 3799.0,
                "mrp": 4299.0,
                "stock": 6,
                "image": img_avon_kids,
                "desc": "Vibrant and safe children's bicycle featuring sturdy training wheels, enclosed chain cover, and comfortable padded saddle. Ideal for young learners aged 6 to 9 years. (Demo record).",
                "warranty": "1 Year Frame Warranty",
                "featured": False,
                "new_arr": True,
                "bestseller": True,
                "specs": [
                    ("wheel_size", "20 inches"),
                    ("gear_count", "Single Speed"),
                    ("colour", "Sky Blue"),
                    ("frame_material", "Steel"),
                    ("brake_type", "Caliper Brakes"),
                    ("suspension", "Rigid"),
                    ("rider_fit", "Ages 6-9 / Height 3'8\"-4'6\"")
                ]
            },
            {
                "sku": "DEMO-AVON-003",
                "name": "AVON Sample Speedster Urban Commuter",
                "slug": "avon-sample-speedster-urban-commuter-demo",
                "model_number": "AVON-SPD-700",
                "brand_id": avon.id,
                "category_id": cat_map["road-bicycles"].id,
                "selling_price": 6499.0,
                "mrp": 7199.0,
                "stock": 5,
                "image": img_avon_commuter,
                "desc": "Sleek and lightweight fast commuter bicycle with 700C high-speed tyres, 7-speed Shimano gears, and responsive V-Brakes for effortless fitness and daily riding. (Demo record).",
                "warranty": "1 Year Frame Warranty",
                "featured": True,
                "new_arr": False,
                "bestseller": False,
                "specs": [
                    ("wheel_size", "700C"),
                    ("gear_count", "7 Speed"),
                    ("colour", "Silver / Orange"),
                    ("frame_material", "Alloy (Aluminium 6061)"),
                    ("brake_type", "V-Brakes"),
                    ("suspension", "Rigid"),
                    ("rider_fit", "5'5\" - 6'1\"")
                ]
            }
        ]

        saved_products = {}
        for p_data in demo_products_data:
            prod = db.query(Product).filter(Product.sku == p_data["sku"]).first()
            if not prod:
                prod = Product(
                    name=p_data["name"],
                    slug=p_data["slug"],
                    sku=p_data["sku"],
                    model_number=p_data["model_number"],
                    brand_id=p_data["brand_id"],
                    category_id=p_data["category_id"],
                    selling_price=p_data["selling_price"],
                    mrp=p_data["mrp"],
                    is_discounted=True,
                    stock_quantity=p_data["stock"],
                    availability_status="IN_STOCK",
                    description=p_data["desc"],
                    warranty_info=p_data["warranty"],
                    delivery_info="Store pickup available at Bajaj Enterprises, Kote Gate, Bikaner.",
                    is_featured=p_data["featured"],
                    is_new_arrival=p_data["new_arr"],
                    is_bestseller=p_data["bestseller"],
                    is_published=True,
                    is_demo=True,
                    sort_order=len(saved_products) + 1
                )
                db.add(prod)
                db.flush()

                # Add primary photograph
                db.add(ProductImage(
                    product_id=prod.id,
                    image_url=p_data["image"],
                    thumbnail_url=p_data["image"],
                    alt_text=f"{p_data['name']} placeholder image",
                    is_primary=True,
                    sort_order=1
                ))

                # Add dynamic attributes
                for attr_key, val_str in p_data["specs"]:
                    if attr_key in attr_map:
                        db.add(ProductAttributeValue(
                            product_id=prod.id,
                            attribute_id=attr_map[attr_key].id,
                            value_text=val_str
                        ))
            saved_products[p_data["sku"]] = prod

        db.flush()

        # ----------------------------------------------------
        # 6. Seed Sample Customer Enquiries (for Admin CRM View)
        # ----------------------------------------------------
        sample_enquiries = [
            {
                "reference_no": "DEMO-ENQ-001",
                "name": "Rajesh Vyas",
                "phone": "+91 94141 23456",
                "email": "rajesh.bikaner@example.com",
                "category": "Bicycle Inquiry",
                "product_id": saved_products.get("DEMO-AVON-001", None).id if "DEMO-AVON-001" in saved_products else None,
                "message": "Inquiring about frame size and test ride for Avon City 26T for daily office commute around Kote Gate.",
                "preferred_contact": "Phone",
                "status": "NEW",
                "internal_notes": "Customer called about evening showroom visit. Staff to keep 26T tuned for demo.",
                "follow_up_date": datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            {
                "reference_no": "DEMO-ENQ-002",
                "name": "Sunita Sharma",
                "phone": "+91 98292 34567",
                "email": "sunita.sharma@example.com",
                "category": "Geared Bicycles",
                "product_id": saved_products.get("DEMO-HERCULES-001", None).id if "DEMO-HERCULES-001" in saved_products else None,
                "message": "Need a durable 21-speed bicycle for my teenage son with disc brakes. Please suggest between Hercules and Avon.",
                "preferred_contact": "WhatsApp",
                "status": "CONTACTED",
                "internal_notes": "Explained frame height fit over WhatsApp. She will visit showroom this Saturday.",
                "follow_up_date": datetime.datetime.utcnow() + datetime.timedelta(days=2)
            },
            {
                "reference_no": "DEMO-ENQ-003",
                "name": "Manoj Joshi",
                "phone": "+91 96101 45678",
                "email": "m.joshi.bkn@example.com",
                "category": "Kids Bicycle",
                "product_id": saved_products.get("DEMO-AVON-002", None).id if "DEMO-AVON-002" in saved_products else None,
                "message": "Do you have training wheels available with the 20-inch Junior cycle in sky blue color?",
                "preferred_contact": "Phone",
                "status": "RESOLVED",
                "internal_notes": "Customer visited Kote Gate store; purchased Avon Junior 20T with assembled trainer wheels.",
                "follow_up_date": None
            },
            {
                "reference_no": "DEMO-ENQ-004",
                "name": "Anil Bishnoi",
                "phone": "+91 97840 56789",
                "email": None,
                "category": "Spare Parts & Service",
                "product_id": None,
                "message": "Are 26x1.95 replacement tyres and heavy-duty bicycle tubes in stock at the showroom?",
                "preferred_contact": "Phone",
                "status": "AWAITING_CUSTOMER",
                "internal_notes": "Confirmed stock availability via call; waiting for customer pickup.",
                "follow_up_date": datetime.datetime.utcnow() + datetime.timedelta(days=3)
            }
        ]

        for enq_data in sample_enquiries:
            existing_enq = db.query(Enquiry).filter(Enquiry.reference_no == enq_data["reference_no"]).first()
            if not existing_enq:
                enq = Enquiry(**enq_data)
                db.add(enq)

        db.flush()

        # ----------------------------------------------------
        # 7. Seed Sample Customer Order Requests (for Admin Orders View)
        # ----------------------------------------------------
        sample_orders = [
            {
                "reference_no": "DEMO-REQ-2026-1001",
                "customer_name": "Virendra Singh",
                "customer_phone": "+91 94140 11223",
                "customer_email": "virendra.singh@example.com",
                "delivery_preference": "Store Pickup (Kote Gate showroom)",
                "address_line1": "Near Junagarh Fort Road",
                "city": "Bikaner",
                "state": "Rajasthan",
                "postal_code": "334001",
                "notes": "Please keep handlebar adjusted for rider height 5'9\".",
                "status": "CONFIRMED",
                "total_amount": 4999.0,
                "internal_notes": "Showroom bicycle tuned and ready for collection on Thursday afternoon.",
                "item_sku": "DEMO-AVON-001",
                "item_qty": 1,
                "item_price": 4999.0
            },
            {
                "reference_no": "DEMO-REQ-2026-1002",
                "customer_name": "Pooja Agarwal",
                "customer_phone": "+91 98294 22334",
                "customer_email": "pooja.agarwal@example.com",
                "delivery_preference": "Local Bikaner Delivery",
                "address_line1": "Flat 302, Sudarshna Nagar",
                "city": "Bikaner",
                "state": "Rajasthan",
                "postal_code": "334003",
                "notes": "Please call before delivery.",
                "status": "RECEIVED",
                "total_amount": 8999.0,
                "internal_notes": "New online reservation received. Call customer to verify delivery address and time slot.",
                "item_sku": "DEMO-HERCULES-001",
                "item_qty": 1,
                "item_price": 8999.0
            },
            {
                "reference_no": "DEMO-REQ-2026-1003",
                "customer_name": "Amit Kumar",
                "customer_phone": "+91 96105 33445",
                "customer_email": "amit.kumar@example.com",
                "delivery_preference": "Store Pickup (Kote Gate showroom)",
                "address_line1": "Gangashahr Main Road",
                "city": "Bikaner",
                "state": "Rajasthan",
                "postal_code": "334401",
                "notes": "Gift for son's 7th birthday.",
                "status": "FULFILLED",
                "total_amount": 3799.0,
                "internal_notes": "Collected in-person with warranty card, bell, and store invoice.",
                "item_sku": "DEMO-AVON-002",
                "item_qty": 1,
                "item_price": 3799.0
            }
        ]

        for ord_data in sample_orders:
            existing_ord = db.query(OrderRequest).filter(OrderRequest.reference_no == ord_data["reference_no"]).first()
            if not existing_ord:
                p_item = saved_products.get(ord_data["item_sku"], None)
                order = OrderRequest(
                    reference_no=ord_data["reference_no"],
                    customer_name=ord_data["customer_name"],
                    customer_phone=ord_data["customer_phone"],
                    customer_email=ord_data["customer_email"],
                    delivery_preference=ord_data["delivery_preference"],
                    address_line1=ord_data["address_line1"],
                    city=ord_data["city"],
                    state=ord_data["state"],
                    postal_code=ord_data["postal_code"],
                    notes=ord_data["notes"],
                    status=ord_data["status"],
                    total_amount=ord_data["total_amount"],
                    internal_notes=ord_data["internal_notes"]
                )
                db.add(order)
                db.flush()

                # Add item
                db.add(OrderRequestItem(
                    order_request_id=order.id,
                    product_id=p_item.id if p_item else None,
                    product_name=p_item.name if p_item else "Demo Bicycle",
                    product_sku=ord_data["item_sku"],
                    unit_price=ord_data["item_price"],
                    quantity=ord_data["item_qty"],
                    subtotal=ord_data["item_price"] * ord_data["item_qty"]
                ))

        db.flush()

        # ----------------------------------------------------
        # 8. Seed Sample Promotional Schemes
        # ----------------------------------------------------
        sample_schemes = [
            {
                "title": "Bikaner Showroom Festive Dhamaka — Free Lock & Bell",
                "slug": "demo-festive-dhamaka",
                "description": "Receive a complimentary heavy-duty cable lock and steel chime bell with the purchase of any AVON or HERCULES multi-speed geared bicycle from our Kote Gate showroom.",
                "banner_url": img_hercules_geared,
                "discount_type": "FREE_ACCESSORY",
                "discount_value": 0.0,
                "start_date": datetime.datetime.utcnow() - datetime.timedelta(days=5),
                "end_date": datetime.datetime.utcnow() + datetime.timedelta(days=25),
                "terms": "Valid exclusively for in-store collection at Bajaj Enterprises, Alakh Sagar Road, Kote Gate, Bikaner. Cannot be combined with other cash discounts.",
                "is_active": True
            },
            {
                "title": "Student Mobility Scheme — Special ₹500 Discount",
                "slug": "demo-student-special",
                "description": "Special ₹500 savings on all commuter and city bicycles for school and college students in Bikaner upon showing a valid student identification card.",
                "banner_url": img_avon_city,
                "discount_type": "FLAT_DISCOUNT",
                "discount_value": 500.0,
                "start_date": datetime.datetime.utcnow() - datetime.timedelta(days=2),
                "end_date": datetime.datetime.utcnow() + datetime.timedelta(days=45),
                "terms": "Subject to in-person verification of student ID at Bajaj Enterprises showroom. Applicable on selected city and commuter models.",
                "is_active": True
            }
        ]

        for s_data in sample_schemes:
            existing_scheme = db.query(Scheme).filter(Scheme.slug == s_data["slug"]).first()
            if not existing_scheme:
                db.add(Scheme(**s_data))

        # ----------------------------------------------------
        # 9. Seed Hero Banners (if none exist)
        # ----------------------------------------------------
        if db.query(Banner).count() == 0:
            db.add(Banner(
                title="Authorised Dealership: AVON & HERCULES Cycles",
                subtitle="Explore city commuters, multi-speed geared bikes, and kids cycles on Alakh Sagar Road, Kote Gate, Bikaner.",
                image_url=img_hercules_geared,
                link_url="/shop",
                button_text="Browse All Bicycles",
                is_active=True,
                sort_order=1
            ))
            db.add(Banner(
                title="Precision Assembly & Ready to Ride",
                subtitle="Every bicycle is tuned by skilled mechanics with manufacturer warranty support.",
                image_url=img_avon_city,
                link_url="/contact",
                button_text="Visit Showroom",
                is_active=True,
                sort_order=2
            ))

        db.commit()
        print("Success: Database comprehensively seeded with demo bicycles, enquiries, orders, schemes, banners, and dynamic attributes!")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Bajaj Enterprises catalog with sample demo data")
    parser.add_argument("--clear-demo", action="store_true", help="Remove all demo bicycles and records from the database")
    args = parser.parse_args()
    seed_database(clear_demo_only=args.clear_demo)
