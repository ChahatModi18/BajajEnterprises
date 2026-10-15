import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Brand, Product } from '../types';
import { apiRequest } from '../utils/api';
import { ProductCard } from '../components/product/ProductCard';
import { QuickEnquiryModal } from '../components/modals/QuickEnquiryModal';

export const BrandPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadBrandData() {
      if (!slug) return;
      setLoading(true);
      try {
        const [brandData, prodsData] = await Promise.all([
          apiRequest<Brand>(`/brands/${slug}`),
          apiRequest<{ items: Product[] }>(`/products?brand_slug=${slug}&page_size=24`),
        ]);
        setBrand(brandData);
        setProducts(prodsData.items);
      } catch (err) {
        console.error('Failed to load brand data', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrandData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading brand catalogue...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Brand Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The brand you are looking for is not configured in Bajaj Enterprises store catalogue.</p>
        <Link to="/shop" className="mt-4 inline-block text-emerald-600 font-bold text-sm">
          &larr; Return to All Bicycles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Brand Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Bicycles</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Retailer • Bajaj Enterprises Bikaner</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {brand.name} Cycles & Bicycles
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {brand.description || `Discover authentic ${brand.name} bicycles with verified frame warranty and showroom assembly at Bajaj Enterprises, Kote Gate, Bikaner.`}
          </p>
        </div>
      </div>

      {/* Product List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Available Models ({products.length})
          </h2>
          <span className="text-xs text-slate-500">
            Alakh Sagar Road Showroom Stock
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickEnquire={(prod) => setEnquiryProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            Currently no published bicycles in stock for {brand.name}. Please contact Bajaj Enterprises showroom for custom orders.
          </div>
        )}
      </div>

      <QuickEnquiryModal
        product={enquiryProduct}
        isOpen={enquiryProduct !== null}
        onClose={() => setEnquiryProduct(null)}
      />
    </div>
  );
};
