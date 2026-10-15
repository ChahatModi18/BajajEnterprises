from sqlalchemy.orm import Session
from app.models.entities import StoreSetting
from app.schemas.settings import StoreSettingsResponse, StoreSettingsUpdate

DEFAULT_SETTINGS = {
    "store_name": "Bajaj Enterprises",
    "store_address": "Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India",
    "store_phone": "",
    "store_whatsapp": "",
    "store_email": "",
    "opening_hours": "10:00 AM - 08:30 PM (Mon-Sat)",
    "google_maps_url": "",
    "instagram_url": "",
    "facebook_url": "",
    "logo_url": "",
    "currency_symbol": "₹",
    "announcement_text": "Welcome to Bajaj Enterprises — Quality Bicycles & Genuine Spares at Kote Gate, Bikaner!",
    # Homepage Content Defaults
    "homepage_hero_title": "Discover Quality Bicycles in Bikaner",
    "homepage_hero_subtitle": "Explore our curated collection of AVON, HERCULES, commuter, geared and kids bicycles with dependable local service.",
    "homepage_hero_cta": "Browse All Bicycles",
    "homepage_trust_badge_1_title": "Genuine Bicycle Brands",
    "homepage_trust_badge_1_desc": "Authorised retail partner for AVON, HERCULES and leading Indian cycle brands.",
    "homepage_trust_badge_2_title": "Full Assembly & Tuning",
    "homepage_trust_badge_2_desc": "Every bicycle is precision-assembled and tuned by experienced technicians before delivery.",
    "homepage_trust_badge_3_title": "Clear & Honest Pricing",
    "homepage_trust_badge_3_desc": "Transparent pricing, verified MRP discounts and dedicated advice for your riding needs.",
    "homepage_trust_badge_4_title": "Convenient Store Pickup",
    "homepage_trust_badge_4_desc": "Visit our showroom on Alakh Sagar Road, Kote Gate, Bikaner for after-sales care.",
    # About Us Page Defaults
    "about_title": "Bajaj Enterprises — Your Trusted Bicycle Destination in Bikaner",
    "about_intro": "Located on Alakh Sagar Road, Kote Gate, Bajaj Enterprises is dedicated to bringing reliable, durable, and comfortable bicycles to riders across Bikaner.",
    "about_mission": "Our mission is to support healthy, active, and accessible cycling for commuters, students, fitness enthusiasts, and children with genuine brand bicycles.",
    "about_experience": "Visit our showroom to inspect bicycles in person, consult with our friendly team, and select the ideal frame and gear setup for your height and terrain.",
    # Contact & Inquiries Defaults
    "contact_intro": "Have questions about our current bicycle inventory, price schemes, or spare parts? Reach out or visit our shop at Kote Gate.",
    "contact_response_time": "We typically review customer inquiries and order requests within 24 business hours.",
    # Policies Defaults
    "policy_privacy": "We respect customer privacy. Any personal contact details provided through online enquiries or order requests are used exclusively to communicate regarding your bicycle purchase.",
    "policy_terms": "All bicycle specifications and illustrative demo prices shown on this website are subject to final store confirmation. Orders are processed as reservation requests until confirmed.",
    "policy_returns": "Bicycles inspected and collected from our Bikaner showroom are eligible for technical assistance and initial tuning support. Please discuss return guidelines with store staff.",
    "policy_warranty": "Brand warranties (frame and components) are provided as per the manufacturer's official warranty terms (AVON, HERCULES). Store staff assists with warranty documentation.",
    "policy_delivery": "Customers can choose convenient store pickup at Bajaj Enterprises, Kote Gate, Bikaner, or inquire about local Bikaner delivery options."
}

def get_all_settings(db: Session) -> StoreSettingsResponse:
    settings_records = db.query(StoreSetting).all()
    current_dict = DEFAULT_SETTINGS.copy()
    
    for record in settings_records:
        current_dict[record.key] = record.value or ""
        
    return StoreSettingsResponse(**current_dict)

def update_settings(db: Session, update_data: StoreSettingsUpdate) -> StoreSettingsResponse:
    data_dict = update_data.model_dump(exclude_unset=True)
    
    for key, value in data_dict.items():
        record = db.query(StoreSetting).filter(StoreSetting.key == key).first()
        val_str = str(value) if value is not None else ""
        if record:
            record.value = val_str
        else:
            record = StoreSetting(key=key, value=val_str)
            db.add(record)
            
    db.commit()
    return get_all_settings(db)
