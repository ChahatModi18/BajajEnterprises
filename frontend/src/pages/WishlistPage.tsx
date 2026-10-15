import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Save your favourite bicycles to compare specifications and track store availability.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition"
        >
          <span>Explore Bicycles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Saved Bicycles ({wishlist.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Items saved in your browser session. Add to cart whenever you are ready.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((prod) => {
          const img = prod.images?.[0]?.image_url || '/uploads/demo_avon_city_001.svg';
          return (
            <div key={prod.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-sm space-y-3">
              <div>
                <div className="relative aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden p-3 flex items-center justify-center">
                  <img src={img} alt={prod.name} className="max-h-full max-w-full object-contain" />
                  <button
                    onClick={() => removeFromWishlist(prod.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-rose-600 shadow"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">{prod.brand?.name}</span>
                  <Link to={`/product/${prod.slug}`} className="block font-bold text-sm text-slate-800 hover:text-emerald-600 line-clamp-1">
                    {prod.name}
                  </Link>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {prod.selling_price ? `₹${prod.selling_price.toLocaleString('en-IN')}` : 'Contact for price'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    addToCart(prod, 1);
                    removeFromWishlist(prod.id);
                  }}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Move to Cart</span>
                </button>
                <Link
                  to={`/product/${prod.slug}`}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
