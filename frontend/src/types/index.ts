export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  key: string;
  field_type: string;
  options_json?: string[] | null;
  unit?: string | null;
  is_required: boolean;
  show_in_card: boolean;
  show_in_filters: boolean;
  show_in_specs: boolean;
  show_in_comparison: boolean;
  sort_order: number;
  is_active: boolean;
  category_ids: number[];
}

export interface AttributeValue {
  attribute_id: number;
  attribute_name: string;
  attribute_key: string;
  field_type: string;
  unit?: string | null;
  show_in_card: boolean;
  show_in_filters: boolean;
  show_in_specs: boolean;
  show_in_comparison: boolean;
  value: any;
}

export interface ProductImage {
  id: number;
  image_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  model_number?: string;
  brand_id: number;
  category_id: number;
  selling_price?: number | null;
  mrp?: number | null;
  is_discounted: boolean;
  discount_percentage?: number | null;
  stock_quantity: number;
  availability_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ON_ENQUIRY' | string;
  description?: string;
  warranty_info?: string;
  delivery_info?: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_published: boolean;
  is_demo: boolean;
  is_archived: boolean;
  sort_order: number;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  attributes: AttributeValue[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text: string;
  is_active: boolean;
  sort_order: number;
}

export interface Scheme {
  id: number;
  title: string;
  slug: string;
  description?: string;
  banner_url?: string;
  discount_type?: string;
  discount_value?: number;
  eligibility?: string;
  terms?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  product_ids: number[];
  category_ids: number[];
}

export interface CartItem {
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface CartCalculationItem {
  product_id: number;
  name: string;
  sku: string;
  image_url?: string;
  unit_price: number;
  mrp?: number;
  quantity: number;
  subtotal: number;
  in_stock: boolean;
  stock_quantity: number;
}

export interface CartCalculation {
  items: CartCalculationItem[];
  subtotal: number;
  discount_total: number;
  estimated_total: number;
  total_items_count: number;
  has_out_of_stock_items: boolean;
}

export interface Enquiry {
  id: number;
  reference_no: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  product_id?: number;
  product_name?: string;
  message: string;
  preferred_contact: string;
  status: string;
  internal_notes?: string;
  created_at: string;
}

export interface OrderRequestItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRequest {
  id: number;
  reference_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_preference: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  status: string;
  total_amount: number;
  internal_notes?: string;
  created_at: string;
  items: OrderRequestItem[];
}

export interface StoreSettings {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_whatsapp: string;
  store_email: string;
  opening_hours: string;
  google_maps_url: string;
  instagram_url: string;
  facebook_url: string;
  logo_url?: string;
  currency_symbol: string;
  announcement_text?: string;

  // Homepage Content
  homepage_hero_title?: string;
  homepage_hero_subtitle?: string;
  homepage_hero_cta?: string;
  homepage_trust_badge_1_title?: string;
  homepage_trust_badge_1_desc?: string;
  homepage_trust_badge_2_title?: string;
  homepage_trust_badge_2_desc?: string;
  homepage_trust_badge_3_title?: string;
  homepage_trust_badge_3_desc?: string;
  homepage_trust_badge_4_title?: string;
  homepage_trust_badge_4_desc?: string;

  // About Us Content
  about_title?: string;
  about_intro?: string;
  about_mission?: string;
  about_experience?: string;

  // Contact Content
  contact_intro?: string;
  contact_response_time?: string;

  // Policies Content
  policy_privacy?: string;
  policy_terms?: string;
  policy_returns?: string;
  policy_warranty?: string;
  policy_delivery?: string;
}
