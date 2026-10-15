import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Brand, Category, Product, ProductListResponse } from '../types';
import { apiRequest } from '../utils/api';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { QuickEnquiryModal } from '../components/modals/QuickEnquiryModal';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);

  // URL query params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const brandSlug = searchParams.get('brand') || '';
  const categorySlug = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort_by') || 'newest';
  const wheelSize = searchParams.get('wheel_size') || '';
  const gearCount = searchParams.get('gear_count') || '';
  const availability = searchParams.get('availability') || '';

  // Load brands and categories once
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [b, c] = await Promise.all([
          apiRequest<Brand[]>('/brands'),
          apiRequest<Category[]>('/categories'),
        ]);
        setBrands(b);
        setCategories(c);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('page_size', '12');
        if (search) params.set('search', search);
        if (brandSlug) params.set('brand_slug', brandSlug);
        if (categorySlug) params.set('category_slug', categorySlug);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (sortBy) params.set('sort_by', sortBy);
        if (wheelSize) params.set('wheel_size', wheelSize);
        if (gearCount) params.set('gear_count', gearCount);
        if (availability) params.set('availability', availability);

        const res = await apiRequest<ProductListResponse>(`/products?${params.toString()}`);
        setProducts(res.items);
        setTotalCount(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Failed to fetch catalogue', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const selectedBrand = brands.find(b => b.slug === brandSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {selectedBrand ? `${selectedBrand.name} Bicycles` : categorySlug ? 'Bicycle Catalogue' : 'All Bicycles & Cycles'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{totalCount}</strong> bicycles at Bajaj Enterprises showroom (Alakh Sagar Road, Bikaner).
          </p>
        </div>

        {/* Controls: Sorting and Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort_by', e.target.value)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 text-xs font-semibold rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            brands={brands}
            categories={categories}
            selectedBrandId={selectedBrand?.id}
            selectedCategorySlug={categorySlug}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedWheelSize={wheelSize}
            selectedGearCount={gearCount}
            availability={availability}
            onBrandChange={(id) => {
              const b = brands.find(x => x.id === id);
              updateParam('brand', b?.slug);
            }}
            onCategoryChange={(slug) => updateParam('category', slug)}
            onPriceChange={(min, max) => {
              const next = new URLSearchParams(searchParams);
              if (min) next.set('min_price', min); else next.delete('min_price');
              if (max) next.set('max_price', max); else next.delete('max_price');
              next.set('page', '1');
              setSearchParams(next);
            }}
            onWheelSizeChange={(ws) => updateParam('wheel_size', ws)}
            onGearCountChange={(gc) => updateParam('gear_count', gc)}
            onAvailabilityChange={(st) => updateParam('availability', st)}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden col-span-1">
            <FilterSidebar
              brands={brands}
              categories={categories}
              selectedBrandId={selectedBrand?.id}
              selectedCategorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              selectedWheelSize={wheelSize}
              selectedGearCount={gearCount}
              availability={availability}
              onBrandChange={(id) => {
                const b = brands.find(x => x.id === id);
                updateParam('brand', b?.slug);
                setMobileFilterOpen(false);
              }}
              onCategoryChange={(slug) => {
                updateParam('category', slug);
                setMobileFilterOpen(false);
              }}
              onPriceChange={(min, max) => {
                const next = new URLSearchParams(searchParams);
                if (min) next.set('min_price', min); else next.delete('min_price');
                if (max) next.set('max_price', max); else next.delete('max_price');
                next.set('page', '1');
                setSearchParams(next);
              }}
              onWheelSizeChange={(ws) => {
                updateParam('wheel_size', ws);
                setMobileFilterOpen(false);
              }}
              onGearCountChange={(gc) => {
                updateParam('gear_count', gc);
                setMobileFilterOpen(false);
              }}
              onAvailabilityChange={(st) => {
                updateParam('availability', st);
                setMobileFilterOpen(false);
              }}
              onClearAll={() => {
                handleClearAll();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickEnquire={(prod) => setEnquiryProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Bicycles Match Your Criteria</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Try widening your price range, selecting another brand or category, or clearing active filters.
              </p>
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', (page - 1).toString())}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-3">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => updateParam('page', (page + 1).toString())}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Enquiry Modal */}
      <QuickEnquiryModal
        product={enquiryProduct}
        isOpen={enquiryProduct !== null}
        onClose={() => setEnquiryProduct(null)}
      />
    </div>
  );
};
