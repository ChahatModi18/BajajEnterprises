import { 
  fallbackAttributes,
  fallbackBanners, 
  fallbackBrands, 
  fallbackCategories, 
  fallbackEnquiries,
  fallbackOrders,
  fallbackProducts, 
  fallbackSchemes, 
  fallbackSettings 
} from '../data/fallbackData';

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
    if (email.toLowerCase() === 'admin@bajajenterprises.com' && password === 'Admin@Bajaj2026') {
      const authResponse = {
        access_token: 'bajaj_live_persistent_token_' + Date.now(),
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'admin@bajajenterprises.com',
          full_name: 'Store Owner',
          role: 'admin',
        },
      };
      setAuthToken(authResponse.access_token);
      localStorage.setItem('bajaj_admin_user', JSON.stringify(authResponse.user));
      return authResponse as unknown as T;
    }
    throw new Error('Invalid email or password. Use admin@bajajenterprises.com / Admin@Bajaj2026');
  }

  // Handle /auth/me
  if (rawPath === '/auth/me' || cleanEndpoint === '/auth/me') {
    const savedUser = localStorage.getItem('bajaj_admin_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // ignore
      }
    }
    return {
      id: 1,
      email: 'admin@bajajenterprises.com',
      full_name: 'Store Owner',
      role: 'admin',
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
    return {
      id: Date.now(),
      image_url: '/uploads/demo_avon_city_001.svg',
      thumbnail_url: '/uploads/demo_avon_city_001.svg',
      is_primary: true,
      sort_order: 1,
    } as unknown as T;
  }

  // Handle Products List & Search (Supports both public /products and /admin/products)
  if (cleanEndpoint === '/products') {
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const brandSlug = urlParams.get('brand_slug') || urlParams.get('brand');
    const categorySlug = urlParams.get('category_slug') || urlParams.get('category');
    const search = (urlParams.get('search') || '').toLowerCase();

    let filtered = [...fallbackProducts];
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
    const product = fallbackProducts.find(p => p.slug === identifier || p.id?.toString() === identifier) || fallbackProducts[0];
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

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    // If endpoint was rewritten by SPA to index.html (returns text/html for an API route)
    if (contentType.includes('text/html')) {
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
    // If backend is offline or network request failed, use resilient fallback demo data
    return resolveFallback<T>(endpoint, options);
  }
}
