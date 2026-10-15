import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { items, calculation, loading, updateQuantity, removeFromCart, clearCart, refreshCalculation } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Bicycle Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          You haven't added any bicycles or accessories yet. Explore our AVON and HERCULES collections.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition"
        >
          <span>Explore All Bicycles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const calcItems = calculation?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} Items)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your selected bicycles. Prices and stock are verified directly with Bajaj Enterprises database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {calcItems.map((item) => (
              <div key={item.product_id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-slate-100">
                  <img
                    src={item.image_url || '/uploads/demo_avon_city_001.svg'}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    SKU: {item.sku}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="font-black text-slate-900 text-sm">
                      ₹{item.unit_price.toLocaleString('en-IN')}
                    </span>
                    {item.mrp && item.mrp > item.unit_price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {!item.in_stock && (
                    <p className="text-[11px] text-rose-600 font-semibold">
                      Out of stock or exceeds showroom availability.
                    </p>
                  )}
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-l-xl font-bold"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-r-xl font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-extrabold text-slate-900 text-sm min-w-[5rem] text-right">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              onClick={clearCart}
              className="text-rose-600 hover:text-rose-700 font-semibold"
            >
              Clear Entire Cart
            </button>
            <button
              onClick={refreshCalculation}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Calculations</span>
            </button>
          </div>
        </div>

        {/* Right: Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Order Request Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">
                ₹{(calculation?.subtotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {calculation?.discount_total ? (
              <div className="flex justify-between text-emerald-600 text-xs font-semibold">
                <span>Total Savings (MRP Discount)</span>
                <span>-₹{calculation.discount_total.toLocaleString('en-IN')}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-slate-600 text-xs">
              <span>Showroom Assembly</span>
              <span className="text-emerald-700 font-bold uppercase">Included Free</span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-base">Estimated Total</span>
              <span className="font-black text-2xl text-slate-900">
                ₹{(calculation?.estimated_total || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
            <p>
              • <strong>Verified Prices:</strong> Recalculated securely on server.
            </p>
            <p>
              • <strong>No Unverified Gateway:</strong> Pay upon showroom pickup or confirmed fulfillment.
            </p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            disabled={calculation?.has_out_of_stock_items}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Order Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
