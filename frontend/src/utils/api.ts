import { 
  fallbackAttributes,
  fallbackBanners, 
  fallbackBrands, 
  fallbackCategories, 
  fallbackEnquiries,
  fallbackOrders,
  fallbackProducts, 
  fallbackSchemes, 
  fallbackSettings, 
  fallbackFeedbacks, 
  fallbackCatalogueBatches 
} from '../data/fallbackData';
import { fileToDataUrl } from './imageUtils';

export function getLocalFallbackProducts() {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bajaj_custom_products') : null;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return [...fallbackProducts];
}

export function saveLocalFallbackProducts(products: any[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bajaj_custom_products', JSON.stringify(products));
    } catch {}
  }
}
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1` 
  : '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('bajaj_admin_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('bajaj_admin_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('bajaj_admin_token');
  localStorage.removeItem('bajaj_admin_user');
}

// Fallback resolver for when backend server is offline or deployed as static frontend
function resolveFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const rawPath = endpoint.split('?')[0].replace(/\/$/, '');
  // Normalize both public and admin routes (e.g. /admin/products -> /products)
  const cleanEndpoint = rawPath.replace(/^\/admin/, '') || '/';
  const method = (options.method || 'GET').toUpperCase();

  // Handle Admin Login
  if ((rawPath === '/auth/login' || cleanEndpoint === '/auth/login') && method === 'POST') {
    let email = '';
    let password = '';
    try {
      if (typeof options.body === 'string') {
        const parsed = JSON.parse(options.body);
        email = parsed.username || parsed.email || '';
        password = parsed.password || '';
      }
    } catch {
      // ignore
    }
    const currentValidPassword = localStorage.getItem('bajaj_custom_admin_password') || 'Admin@Bajaj2026';
    if (email.toLowerCase() === 'admin@bajajenterprises.com' && (password === currentValidPassword || password === 'Admin@Bajaj2026')) {
      const userData = {
        id: 1,
        email: 'admin@bajajenterprises.com',
        full_name: 'Store Owner',
        role: 'ADMIN',
      };
      const authResponse = {
        access_token: 'bajaj_live_persistent_token_' + Date.now(),
        token_type: 'bearer',
        role: 'ADMIN',
        email: 'admin@bajajenterprises.com',
        full_name: 'Store Owner',
        user: userData,
      };
      setAuthToken(authResponse.access_token);
      localStorage.setItem('bajaj_admin_user', JSON.stringify(userData));
      return authResponse as unknown as T;
    }
    throw new Error(`Invalid email or password. Master hint: default is Admin@Bajaj2026`);
  }

  // Handle Request OTP
  if ((rawPath === '/auth/request-otp' || cleanEndpoint === '/auth/request-otp') && method === 'POST') {
    let mobile = '';
    try {
      if (typeof options.body === 'string') {
        const parsed = JSON.parse(options.body);
        mobile = parsed.mobile || '';
      }
    } catch {
      // ignore
    }
    const digits = mobile.replace(/\D/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('bajaj_temp_otp', otp);
    sessionStorage.setItem('bajaj_temp_otp_time', Date.now().toString());
    const masked = digits.length >= 10 ? `+91 ${digits.slice(-10, -6)}***${digits.slice(-2)}` : '+91 94141 ***62';
    return {
      success: true,
      message: `Verification OTP sent to ${masked}`,
      masked_mobile: masked,
      dev_otp: otp,
    } as unknown as T;
  }

  // Handle Reset Password with OTP
  if ((rawPath === '/auth/reset-password-otp' || cleanEndpoint === '/auth/reset-password-otp') && method === 'POST') {
    let otp = '';
    let newPassword = '';
    try {
      if (typeof options.body === 'string') {
        const parsed = JSON.parse(options.body);
        otp = parsed.otp || '';
        newPassword = parsed.new_password || '';
      }
    } catch {
      // ignore
    }
    const savedOtp = sessionStorage.getItem('bajaj_temp_otp');
    if (!savedOtp || savedOtp !== otp) {
      throw new Error('Invalid verification OTP code.');
    }
    if (!newPassword || newPassword.length < 12 || newPassword.length > 72) {
      throw new Error('Password must be 12 to 72 characters long.');
    }
    localStorage.setItem('bajaj_custom_admin_password', newPassword);
    sessionStorage.removeItem('bajaj_temp_otp');
    return {
      success: true,
      message: 'Password updated successfully. You can now login with your new password.',
    } as unknown as T;
  }

  // Handle /auth/me
  if (rawPath === '/auth/me' || cleanEndpoint === '/auth/me') {
    const savedUser = localStorage.getItem('bajaj_admin_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          id: parsed.id || 1,
          email: parsed.email || 'admin@bajajenterprises.com',
          full_name: parsed.full_name || 'Store Owner',
          role: (parsed.role || 'ADMIN').toUpperCase(),
        } as unknown as T;
      } catch {
        // ignore
      }
    }
    return {
      id: 1,
      email: 'admin@bajajenterprises.com',
      full_name: 'Store Owner',
      role: 'ADMIN',
    } as unknown as T;
  }

  // Handle Store Settings & Content Editor
  if (cleanEndpoint === '/settings') {
    if (method === 'PUT' || method === 'POST') {
      try {
        if (typeof options.body === 'string') {
          const updated = JSON.parse(options.body);
          localStorage.setItem('bajaj_saved_settings', JSON.stringify(updated));
          return updated as unknown as T;
        }
      } catch {
        // ignore
      }
    }
    const saved = localStorage.getItem('bajaj_saved_settings');
    if (saved) {
      try {
        return { ...fallbackSettings, ...JSON.parse(saved) } as unknown as T;
      } catch {
        // ignore
      }
    }
    return fallbackSettings as unknown as T;
  }

  // Handle Brands
  if (cleanEndpoint === '/brands') {
    return fallbackBrands as unknown as T;
  }

  // Handle Categories
  if (cleanEndpoint === '/categories') {
    return fallbackCategories as unknown as T;
  }

  // Handle Dynamic Attributes
  if (cleanEndpoint === '/attributes') {
    return fallbackAttributes as unknown as T;
  }

  // Handle Banners
  if (cleanEndpoint === '/banners') {
    return fallbackBanners as unknown as T;
  }

  // Handle Schemes
  if (cleanEndpoint === '/schemes') {
    return fallbackSchemes as unknown as T;
  }

  // Handle Enquiries
  if (cleanEndpoint === '/enquiries') {
    if (method === 'POST') {
      return {
        id: Date.now(),
        reference_no: 'ENQ-' + Math.floor(100000 + Math.random() * 900000),
        status: 'NEW',
        message: 'Enquiry received successfully. Our team will contact you shortly.',
      } as unknown as T;
    }
    return fallbackEnquiries as unknown as T;
  }


  // Handle Customer Feedback & Showroom Ratings
  if (cleanEndpoint === '/feedback' || cleanEndpoint === '/feedbacks') {
    const rawSaved = localStorage.getItem('bajaj_feedbacks');
    let feedbacks = rawSaved ? JSON.parse(rawSaved) : [...fallbackFeedbacks];

    if (method === 'POST') {
      let bodyData: any = {};
      try {
        if (typeof options.body === 'string') bodyData = JSON.parse(options.body);
      } catch {}
      const newFeedback = {
        id: Date.now(),
        name: bodyData.name || 'Showroom Visitor',
        phone: bodyData.phone,
        email: bodyData.email,
        rating: Number(bodyData.rating) || 5,
        comment: bodyData.comment || 'Great collection and service.',
        bicycle_model: bodyData.bicycle_model,
        service_type: bodyData.service_type || 'Showroom Purchase',
        is_approved: true,
        is_featured: false,
        created_at: new Date().toISOString()
      };
      feedbacks.unshift(newFeedback);
      localStorage.setItem('bajaj_feedbacks', JSON.stringify(feedbacks));
      return newFeedback as unknown as T;
    }

    const total = feedbacks.length;
    const avg = total > 0 ? (feedbacks.reduce((acc: number, f: any) => acc + f.rating, 0) / total).toFixed(1) : '5.0';
    const breakdown = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    feedbacks.forEach((f: any) => {
      const key = String(f.rating);
      if (key in breakdown) (breakdown as any)[key]++;
    });

    return {
      items: feedbacks,
      total,
      average_rating: parseFloat(avg),
      rating_breakdown: breakdown
    } as unknown as T;
  }

  // Handle Admin Feedback Operations
  if (cleanEndpoint.startsWith('/feedback/') && method === 'PATCH') {
    const rawSaved = localStorage.getItem('bajaj_feedbacks');
    let feedbacks = rawSaved ? JSON.parse(rawSaved) : [...fallbackFeedbacks];
    const parts = cleanEndpoint.split('/');
    const fbId = Number(parts[2]);
    const action = parts[3];
    const found = feedbacks.find((f: any) => f.id === fbId);
    if (found) {
      if (action === 'toggle-feature') found.is_featured = !found.is_featured;
      if (action === 'toggle-approval') found.is_approved = !found.is_approved;
      localStorage.setItem('bajaj_feedbacks', JSON.stringify(feedbacks));
      return found as unknown as T;
    }
  }

  if (cleanEndpoint.startsWith('/feedback/') && method === 'DELETE') {
    const rawSaved = localStorage.getItem('bajaj_feedbacks');
    let feedbacks = rawSaved ? JSON.parse(rawSaved) : [...fallbackFeedbacks];
    const fbId = Number(cleanEndpoint.split('/')[2]);
    feedbacks = feedbacks.filter((f: any) => f.id !== fbId);
    localStorage.setItem('bajaj_feedbacks', JSON.stringify(feedbacks));
    return { message: 'Feedback removed' } as unknown as T;
  }

  // Handle Catalogue Imports & Bulk Batches
  if (cleanEndpoint === '/catalogue-imports' || cleanEndpoint.startsWith('/catalogue-imports')) {
    const rawBatches = localStorage.getItem('bajaj_catalogue_batches');
    let batches = rawBatches ? JSON.parse(rawBatches) : [...fallbackCatalogueBatches];

    if (method === 'DELETE') {
      const batchId = Number(cleanEndpoint.split('/')[2]);
      batches = batches.filter((b: any) => b.id !== batchId);
      localStorage.setItem('bajaj_catalogue_batches', JSON.stringify(batches));
      return { message: 'Catalogue batch deleted' } as unknown as T;
    }

    if (cleanEndpoint.includes('/upload') && method === 'POST') {
      const newBatch = {
        id: Date.now(),
        title: 'New Bulk Catalogue Upload',
        category_tag: 'Wholesale Range',
        filename: 'uploaded_catalogue.csv',
        file_type: 'csv',
        file_url: '/uploads/catalogues/demo_avon_catalogue.csv',
        file_size_bytes: 42000,
        total_rows: 15,
        valid_rows: 15,
        error_rows: 0,
        status: 'UPLOADED',
        created_at: new Date().toISOString()
      };
      batches.unshift(newBatch);
      localStorage.setItem('bajaj_catalogue_batches', JSON.stringify(batches));
      return {
        import_id: newBatch.id,
        ...newBatch,
        preview_data: []
      } as unknown as T;
    }

    return batches as unknown as T;
  }

  // Handle Order Requests
  if (cleanEndpoint === '/orders' || cleanEndpoint === '/order-requests') {
    if (method === 'POST') {
      return {
        id: Date.now(),
        reference_no: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        status: 'RECEIVED',
        message: 'Order reservation placed successfully.',
      } as unknown as T;
    }
    return fallbackOrders as unknown as T;
  }

  // Handle Image & Catalogue Photo Uploads in Studio
  if (cleanEndpoint.includes('/media/upload') || cleanEndpoint.includes('/upload')) {
    let imageUrl = '/uploads/demo_avon_city_001.svg';
    if (typeof window !== 'undefined' && (window as any).__lastUploadedImageDataUrl) {
      imageUrl = (window as any).__lastUploadedImageDataUrl;
    }
    return {
      id: Date.now(),
      image_url: imageUrl,
      thumbnail_url: imageUrl,
      is_primary: true,
      sort_order: 1,
    } as unknown as T;
  }

  // Handle Product Images (Upload, Make Primary, Delete)
  if (cleanEndpoint.includes('/images')) {
    const match = cleanEndpoint.match(/\/products\/(\d+)\/images/);
    const prodId = match ? Number(match[1]) : 0;
    const products = getLocalFallbackProducts();
    const prodIndex = products.findIndex((p: any) => p.id === prodId);

    // Primary Image Toggle: PATCH /products/:id/images/:imageId/primary
    if (cleanEndpoint.includes('/primary') && method === 'PATCH') {
      const imgMatch = cleanEndpoint.match(/\/images\/(\d+)\/primary/);
      const imgId = imgMatch ? Number(imgMatch[1]) : 0;
      if (prodIndex >= 0 && products[prodIndex].images) {
        products[prodIndex].images = products[prodIndex].images.map((img: any) => ({
          ...img,
          is_primary: img.id === imgId,
        }));
        saveLocalFallbackProducts(products);
      }
      return { message: 'Primary image updated' } as unknown as T;
    }

    // Image Deletion: DELETE /products/:id/images/:imageId
    if (method === 'DELETE') {
      const imgMatch = cleanEndpoint.match(/\/images\/(\d+)/);
      const imgId = imgMatch ? Number(imgMatch[1]) : 0;
      if (prodIndex >= 0 && products[prodIndex].images) {
        products[prodIndex].images = products[prodIndex].images.filter((img: any) => img.id !== imgId);
        saveLocalFallbackProducts(products);
      }
      return { message: 'Image deleted' } as unknown as T;
    }

    // Image Upload: POST /products/:id/images
    if (method === 'POST') {
      let imageUrl = '/uploads/demo_avon_city_001.svg';
      if (typeof window !== 'undefined' && (window as any).__lastUploadedImageDataUrl) {
        imageUrl = (window as any).__lastUploadedImageDataUrl;
      }
      const newImage = {
        id: Date.now(),
        product_id: prodId,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        is_primary: true,
        sort_order: 1,
      };

      if (prodIndex >= 0) {
        const prod = products[prodIndex];
        const existingImages = (prod.images || []).map((img: any) => ({
          ...img,
          is_primary: false,
        }));
        prod.images = [newImage, ...existingImages];
        saveLocalFallbackProducts(products);
      }

      return newImage as unknown as T;
    }
  }

  // Handle Products List & Search & Create
  if (cleanEndpoint === '/products') {
    const products = getLocalFallbackProducts();

    if (method === 'POST') {
      let bodyData: any = {};
      try {
        if (typeof options.body === 'string') bodyData = JSON.parse(options.body);
      } catch {}

      const newProd = {
        id: Date.now(),
        name: bodyData.name || 'New Bicycle',
        slug: (bodyData.name || 'new-bicycle').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: bodyData.sku || ('BE-' + Date.now().toString().slice(-5)),
        brand_id: Number(bodyData.brand_id) || 1,
        category_id: Number(bodyData.category_id) || 1,
        selling_price: bodyData.selling_price || null,
        mrp: bodyData.mrp || null,
        stock_quantity: bodyData.stock_quantity ?? 5,
        availability_status: bodyData.availability_status || 'IN_STOCK',
        description: bodyData.description || '',
        warranty_info: bodyData.warranty_info || '1 Year Manufacturer Frame Warranty',
        delivery_info: bodyData.delivery_info || 'Store pickup at Bajaj Enterprises, Kote Gate, Bikaner.',
        is_published: true,
        is_featured: bodyData.is_featured ?? false,
        is_new_arrival: bodyData.is_new_arrival ?? true,
        attributes: bodyData.attributes || [],
        images: [],
        brand: fallbackBrands.find((b: any) => b.id === Number(bodyData.brand_id)) || fallbackBrands[0],
        category: fallbackCategories.find((c: any) => c.id === Number(bodyData.category_id)) || fallbackCategories[0],
      };

      products.unshift(newProd);
      saveLocalFallbackProducts(products);
      return newProd as unknown as T;
    }

    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const brandSlug = urlParams.get('brand_slug') || urlParams.get('brand');
    const categorySlug = urlParams.get('category_slug') || urlParams.get('category');
    const search = (urlParams.get('search') || '').toLowerCase();

    let filtered = [...products];
    if (brandSlug) {
      filtered = filtered.filter(p => p.brand?.name?.toLowerCase().includes(brandSlug.toLowerCase()) || p.brand_id?.toString() === brandSlug);
    }
    if (categorySlug) {
      filtered = filtered.filter(p => p.category?.name?.toLowerCase().includes(categorySlug.toLowerCase()) || p.category_id?.toString() === categorySlug);
    }
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description?.toLowerCase().includes(search) ||
        p.brand?.name?.toLowerCase().includes(search)
      );
    }

    return {
      items: filtered,
      total: filtered.length,
      total_pages: 1,
      page: 1,
      page_size: filtered.length,
    } as unknown as T;
  }

  // Handle Single Product by Slug or ID
  if (cleanEndpoint.startsWith('/products/')) {
    const identifier = cleanEndpoint.replace('/products/', '');
    const products = getLocalFallbackProducts();
    const prodIndex = products.findIndex((p: any) => p.slug === identifier || p.id?.toString() === identifier);

    if (method === 'PUT' || method === 'PATCH') {
      let bodyData: any = {};
      try {
        if (typeof options.body === 'string') bodyData = JSON.parse(options.body);
      } catch {}

      if (prodIndex >= 0) {
        products[prodIndex] = {
          ...products[prodIndex],
          ...bodyData,
          brand: fallbackBrands.find((b: any) => b.id === Number(bodyData.brand_id || products[prodIndex].brand_id)) || products[prodIndex].brand,
          category: fallbackCategories.find((c: any) => c.id === Number(bodyData.category_id || products[prodIndex].category_id)) || products[prodIndex].category,
        };
        saveLocalFallbackProducts(products);
        return products[prodIndex] as unknown as T;
      }
    }

    if (method === 'DELETE' && prodIndex >= 0) {
      products.splice(prodIndex, 1);
      saveLocalFallbackProducts(products);
      return { message: 'Product deleted' } as unknown as T;
    }

    const product = prodIndex >= 0 ? products[prodIndex] : (products[0] || fallbackProducts[0]);
    return product as unknown as T;
  }

  return [] as unknown as T;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // If uploading a file via FormData, cache data URL for fallback persistence
  if (options.body instanceof FormData && typeof window !== 'undefined') {
    const rawFile = options.body.get('file');
    if (rawFile instanceof File) {
      try {
        const dataUrl = await fileToDataUrl(rawFile);
        (window as any).__lastUploadedImageDataUrl = dataUrl;
      } catch {}
    }
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const isAdminOrAuth = endpoint.split('?')[0].startsWith('/admin/') || endpoint.includes('/auth/');
  const canUseProductionFallback = method === 'GET' && !isAdminOrAuth;
  let receivedHttpResponse = false;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    receivedHttpResponse = true;

    const contentType = response.headers.get('content-type') || '';

    // If endpoint was rewritten by SPA to index.html (returns text/html for an API route)
    if (contentType.includes('text/html')) {
      if (!import.meta.env.DEV && !canUseProductionFallback) {
        throw new Error('The API endpoint is unavailable. Please try again later.');
      }
      return resolveFallback<T>(endpoint, options);
    }

    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        // non-json error
      }

      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login?session_expired=true';
        }
      }

      throw new Error(errorDetail);
    }

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return response.text() as any;
  } catch (err: any) {
    // Never fake successful writes, authentication, or admin reads in production.
    if (!import.meta.env.DEV && (receivedHttpResponse || !canUseProductionFallback)) {
      throw err;
    }
    // Public storefront reads may use bundled catalog data while offline.
    return resolveFallback<T>(endpoint, options);
  }
}
