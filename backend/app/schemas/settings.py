from typing import Optional
from pydantic import BaseModel

class StoreSettingsResponse(BaseModel):
    store_name: str
    store_address: str
    store_phone: str
    store_whatsapp: str
    store_email: str
    opening_hours: str
    google_maps_url: str
    instagram_url: str
    facebook_url: str
    logo_url: Optional[str] = None
    currency_symbol: str = "₹"
    announcement_text: Optional[str] = None

    # Homepage Content
    homepage_hero_title: Optional[str] = None
    homepage_hero_subtitle: Optional[str] = None
    homepage_hero_cta: Optional[str] = None
    homepage_trust_badge_1_title: Optional[str] = None
    homepage_trust_badge_1_desc: Optional[str] = None
    homepage_trust_badge_2_title: Optional[str] = None
    homepage_trust_badge_2_desc: Optional[str] = None
    homepage_trust_badge_3_title: Optional[str] = None
    homepage_trust_badge_3_desc: Optional[str] = None
    homepage_trust_badge_4_title: Optional[str] = None
    homepage_trust_badge_4_desc: Optional[str] = None

    # About Us Page Content
    about_title: Optional[str] = None
    about_intro: Optional[str] = None
    about_mission: Optional[str] = None
    about_experience: Optional[str] = None

    # Contact & Support Content
    contact_intro: Optional[str] = None
    contact_response_time: Optional[str] = None

    # Policies Content
    policy_privacy: Optional[str] = None
    policy_terms: Optional[str] = None
    policy_returns: Optional[str] = None
    policy_warranty: Optional[str] = None
    policy_delivery: Optional[str] = None


class StoreSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    store_whatsapp: Optional[str] = None
    store_email: Optional[str] = None
    opening_hours: Optional[str] = None
    google_maps_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    logo_url: Optional[str] = None
    currency_symbol: Optional[str] = None
    announcement_text: Optional[str] = None

    # Homepage Content
    homepage_hero_title: Optional[str] = None
    homepage_hero_subtitle: Optional[str] = None
    homepage_hero_cta: Optional[str] = None
    homepage_trust_badge_1_title: Optional[str] = None
    homepage_trust_badge_1_desc: Optional[str] = None
    homepage_trust_badge_2_title: Optional[str] = None
    homepage_trust_badge_2_desc: Optional[str] = None
    homepage_trust_badge_3_title: Optional[str] = None
    homepage_trust_badge_3_desc: Optional[str] = None
    homepage_trust_badge_4_title: Optional[str] = None
    homepage_trust_badge_4_desc: Optional[str] = None

    # About Us Page Content
    about_title: Optional[str] = None
    about_intro: Optional[str] = None
    about_mission: Optional[str] = None
    about_experience: Optional[str] = None

    # Contact & Support Content
    contact_intro: Optional[str] = None
    contact_response_time: Optional[str] = None

    # Policies Content
    policy_privacy: Optional[str] = None
    policy_terms: Optional[str] = None
    policy_returns: Optional[str] = None
    policy_warranty: Optional[str] = None
    policy_delivery: Optional[str] = None
