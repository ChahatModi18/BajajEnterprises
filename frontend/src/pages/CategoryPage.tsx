import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Category, Product } from '../types';
import { apiRequest } from '../utils/api';
import { ProductCard } from '../components/product/ProductCard';
import { QuickEnquiryModal } from '../components/modals/QuickEnquiryModal';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadCategoryData() {
      if (!slug) return;
      setLoading(true);
      try {
        const [catData, prodsData] = await Promise.all([
          apiRequest<Category>(`/categories/${slug}`),
          apiRequest<{ items: Product[] }>(`/products?category_slug=${slug}&page_size=24`),
        ]);
        setCategory(catData);
        setProducts(prodsData.items);
      } catch (err) {
        console.error('Failed to load category data', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading category catalogue...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Category Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested category is not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-emerald-600 font-bold text-sm">
          &larr; Return to All Bicycles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Hero Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {category.name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {category.description || `Browse quality ${category.name} available at Bajaj Enterprises showroom on Alakh Sagar Road, Kote Gate, Bikaner.`}
          </p>
        </div>
      </div>

      {/* Product List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {category.name} ({products.length} Models)
          </h2>
          <span className="text-xs text-slate-500">
            Showroom Stock in Bikaner
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
            Currently no bicycles listed in this category. Visit Bajaj Enterprises at Kote Gate or enquire for upcoming shipments.
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
