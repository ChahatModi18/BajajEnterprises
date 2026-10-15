import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Wrench, Award, 
  MapPin, Phone, Sparkles, Tag, ChevronRight 
} from 'lucide-react';
import { Banner, Brand, Category, Product, Scheme } from '../types';
import { apiRequest } from '../utils/api';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { ProductCard } from '../components/product/ProductCard';
import { QuickEnquiryModal } from '../components/modals/QuickEnquiryModal';
import { useSettings } from '../context/SettingsContext';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [bannersData, brandsData, catsData, prodsData, schemesData] = await Promise.all([
          apiRequest<Banner[]>('/banners'),
          apiRequest<Brand[]>('/brands'),
          apiRequest<Category[]>('/categories'),
          apiRequest<{ items: Product[] }>('/products?page_size=8'),
          apiRequest<Scheme[]>('/schemes'),
        ]);
        const bannersArr = Array.isArray(bannersData) ? bannersData : [];
        const brandsArr = Array.isArray(brandsData) ? brandsData : [];
        const catsArr = Array.isArray(catsData) ? catsData : [];
        const schemesArr = Array.isArray(schemesData) ? schemesData : [];
        setBanners(bannersArr);
        setBrands(brandsArr);
        setCategories(catsArr);
        setSchemes(schemesArr);

        const items = (prodsData && Array.isArray(prodsData.items)) ? prodsData.items : [];
        setFeaturedProducts(items.filter(p => p.is_featured));
        setNewArrivals(items.filter(p => p.is_new_arrival));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {settings.homepage_trust_badge_1_title || '100% Genuine Brands'}
              </h4>
              <p className="text-xs text-slate-500">
                {settings.homepage_trust_badge_1_desc || 'Authorized AVON & HERCULES'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {settings.homepage_trust_badge_2_title || 'Ready Assembled'}
              </h4>
              <p className="text-xs text-slate-500">
                {settings.homepage_trust_badge_2_desc || 'Precision tuned before handover'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {settings.homepage_trust_badge_3_title || 'Official Warranty'}
              </h4>
              <p className="text-xs text-slate-500">
                {settings.homepage_trust_badge_3_desc || 'Manufacturer backed guarantees'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {settings.homepage_trust_badge_4_title || 'Bikaner Showroom'}
              </h4>
              <p className="text-xs text-slate-500">
                {settings.homepage_trust_badge_4_desc || 'Alakh Sagar Road, Kote Gate'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop By Brand */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Authorized Dealerships
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Shop by Bicycle Brand
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brand/${brand.slug}`}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 p-5 text-center shadow-sm hover:shadow-md transition flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 text-slate-800 group-hover:text-emerald-700 flex items-center justify-center font-black text-lg transition mb-3">
                {brand.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700 transition">
                {brand.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Explore range &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Find Your Riding Style
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Bicycle Categories
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'Discover models and specifications in this category.'}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition transform">
                <span>Browse Models</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Bicycles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Handpicked by Bajaj Enterprises
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Featured Bicycles
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickEnquire={(prod) => setEnquiryProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">Featured bicycles will appear once marked by the store owner.</p>
          </div>
        )}
      </section>

      {/* Promotional Schemes Banner */}
      {schemes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-extrabold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Store Scheme</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                {schemes[0].title}
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                {schemes[0].description}
              </p>
              <div className="pt-2">
                <Link
                  to="/schemes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-orange-700 font-extrabold text-sm shadow hover:bg-orange-50 transition"
                >
                  <span>View All Active Schemes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Fresh Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              New Arrivals
            </h2>
          </div>
          <Link to="/shop?sort_by=newest" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View Newest</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickEnquire={(prod) => setEnquiryProduct(prod)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* Why Shop Bajaj Enterprises */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Local Excellence in Bikaner
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Shop with Bajaj Enterprises?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We combine the convenience of online catalogue browsing with trusted in-person dealership advice at Kote Gate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Expert Consultation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you need a daily commuter bicycle, a junior bike for your child, or a 21-speed geared mountain bike, our team helps you choose the right frame size and geometry.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Inspection & Assembly</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every bicycle is assembled and pre-tuned by experienced mechanics before you ride away from our Kote Gate showroom. No confusing assembly boxes or missing parts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Genuine Spares & Support</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We stand behind our bicycles with authentic spares, tyre replacements, chain tuning, and honest warranty guidance verified directly with the manufacturers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Location & Directions CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Visit our Bikaner Showroom
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Test Ride Your Next Bicycle Today
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience the ride in person on <strong>Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001</strong>. Feel free to enquire online or request an order reservation before you visit.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition"
              >
                <span>Store Hours & Directions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setEnquiryProduct(null)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
              >
                Submit Online Enquiry
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-xs space-y-3">
            <h4 className="font-bold text-sm text-white">Bajaj Enterprises</h4>
            <p className="text-slate-300">{settings.store_address}</p>
            {settings.store_phone ? (
              <p className="text-emerald-400 font-semibold">Phone: {settings.store_phone}</p>
            ) : (
              <p className="text-slate-400 italic">Phone: (Store phone placeholder)</p>
            )}
            {settings.opening_hours && (
              <p className="text-slate-300">Timings: {settings.opening_hours}</p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Enquiry Modal */}
      <QuickEnquiryModal
        product={enquiryProduct}
        isOpen={enquiryProduct !== null}
        onClose={() => setEnquiryProduct(null)}
      />
    </div>
  );
};
