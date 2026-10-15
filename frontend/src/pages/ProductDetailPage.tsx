import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, ShoppingBag, MessageSquare, Share2, 
  ShieldCheck, MapPin, Truck, Check, ArrowLeft, AlertCircle 
} from 'lucide-react';
import { Product } from '../types';
import { apiRequest } from '../utils/api';
import { ImageGallery } from '../components/product/ImageGallery';
import { DynamicSpecsTable } from '../components/product/DynamicSpecsTable';
import { ProductCard } from '../components/product/ProductCard';
import { QuickEnquiryModal } from '../components/modals/QuickEnquiryModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await apiRequest<Product>(`/products/${slug}`);
        setProduct(prod);

        // Fetch related products
        const relRes = await apiRequest<{ items: Product[] }>(
          `/products?category_id=${prod.category_id}&page_size=4`
        );
        setRelatedProducts(relRes.items.filter(p => p.id !== prod.id));
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading bicycle specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Bicycle Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for is no longer available or was archived.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-emerald-600">Bicycles</Link>
        <span>/</span>
        {product.brand && (
          <>
            <Link to={`/brand/${product.brand.slug}`} className="hover:text-emerald-600">
              {product.brand.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Key Info & Purchase/Enquiry Box */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Demo Notice */}
            {product.is_demo && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Sample Demo Product:</strong> Illustrative demonstration record for showcase. Confirm inventory before purchasing.
                </span>
              </div>
            )}

            {/* Brand & Category badges */}
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <Link
                  to={`/brand/${product.brand.slug}`}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wide hover:bg-emerald-100 transition"
                >
                  {product.brand.name}
                </Link>
              )}
              {product.category && (
                <Link
                  to={`/category/${product.category.slug}`}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
              {product.model_number && (
                <span>Model: <strong className="text-slate-700">{product.model_number}</strong></span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              {product.selling_price !== null && product.selling_price !== undefined ? (
                <>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{product.selling_price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp && product.mrp > product.selling_price && (
                    <span className="text-base text-slate-400 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {product.discount_percentage && product.discount_percentage > 0 ? (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-xs font-extrabold">
                      {product.discount_percentage}% OFF
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-base font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                  Contact for price & current offer
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              * Inclusive of assembly and initial inspection at Bajaj Enterprises showroom. Delivery charges applicable for out-of-town requests.
            </p>
          </div>

          {/* Stock / Availability Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Availability:</span>
            {product.availability_status === 'OUT_OF_STOCK' ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold">
                Currently Out of Stock
              </span>
            ) : product.availability_status === 'ON_ENQUIRY' ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                Available on Store Enquiry
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock_quantity} available)</span>
              </span>
            )}
          </div>

          {/* Actions: Add to Cart & Quick Enquire */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2.5 text-sm font-bold text-slate-800 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.availability_status === 'OUT_OF_STOCK'}
                className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Save to Wishlist"
                className={`p-3 rounded-xl border transition ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Enquiry Button */}
            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Inquire / Request Best Price Quote</span>
            </button>

            {copiedToast && (
              <p className="text-center text-xs text-emerald-600 font-semibold">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Showroom & Store Details */}
          <div className="border-t border-slate-200 pt-4 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Showroom Collection:</strong> Alakh Sagar Road, Kote Gate, Bikaner.</span>
            </div>
            {product.warranty_info && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Warranty:</strong> {product.warranty_info}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{product.delivery_info || 'Store pickup available. Delivery options on request.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-3 border-b border-slate-100 pb-2">
              Product Overview
            </h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || 'Full model overview and frame inspection available at Bajaj Enterprises showroom.'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <DynamicSpecsTable
            attributes={product.attributes}
            sku={product.sku}
            modelNumber={product.model_number}
          />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Related Bicycles
            </h2>
            <Link to="/shop" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All Bicycles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Enquiry Modal */}
      <QuickEnquiryModal
        product={product}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
      />
    </div>
  );
};
