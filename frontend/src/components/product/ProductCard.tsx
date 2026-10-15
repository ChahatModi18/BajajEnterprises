import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, MessageSquare, Check, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickEnquire?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickEnquire }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const primaryImg = product.images?.find(i => i.is_primary)?.image_url 
    || product.images?.[0]?.image_url 
    || '/uploads/demo_avon_city_001.svg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  // Find dynamic attribute chips to display on card (e.g. wheel_size, gear_count)
  const cardSpecs = product.attributes?.filter(a => a.show_in_card) || [];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Demo Badge */}
      {product.is_demo && (
        <div className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white font-bold text-[10px] tracking-wide uppercase shadow">
          Demo Listing
        </div>
      )}

      {/* Discount Badge */}
      {product.discount_percentage && product.discount_percentage > 0 ? (
        <div className={`absolute ${product.is_demo ? 'top-8' : 'top-3'} left-3 z-20 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow`}>
          {product.discount_percentage}% OFF
        </div>
      ) : null}

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        aria-label="Save to Wishlist"
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-sm ${
          isFavorited 
            ? 'bg-rose-50 text-rose-600 border border-rose-200' 
            : 'bg-white/80 text-slate-500 hover:text-rose-600 hover:bg-white border border-slate-200'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Area */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Availability Badge */}
        <div className="absolute bottom-2 left-2">
          {product.availability_status === 'OUT_OF_STOCK' ? (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-semibold">
              Out of Stock
            </span>
          ) : product.availability_status === 'ON_ENQUIRY' ? (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
              Availability on Enquiry
            </span>
          ) : product.stock_quantity <= 2 ? (
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-semibold border border-orange-200">
              Only {product.stock_quantity} left
            </span>
          ) : null}
        </div>
      </Link>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category line */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-700 tracking-wide uppercase">
              {product.brand?.name || 'Bajaj'}
            </span>
            <span className="text-slate-400">
              {product.category?.name}
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition">
              {product.name}
            </h3>
          </Link>

          {/* Dynamic spec chips */}
          {cardSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {cardSpecs.slice(0, 3).map((spec) => (
                <span
                  key={spec.attribute_id}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                >
                  {spec.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 mt-3">
          <div className="flex items-baseline gap-2 mb-3">
            {product.selling_price !== null && product.selling_price !== undefined ? (
              <>
                <span className="text-lg font-black text-slate-900">
                  ₹{product.selling_price.toLocaleString('en-IN')}
                </span>
                {product.mrp && product.mrp > product.selling_price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Contact for price
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.availability_status === 'OUT_OF_STOCK'}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm ${
                addedAnimation
                  ? 'bg-emerald-700 text-white'
                  : product.availability_status === 'OUT_OF_STOCK'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => onQuickEnquire ? onQuickEnquire(product) : null}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
