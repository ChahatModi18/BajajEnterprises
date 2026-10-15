import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, MapPin, Truck, Store, ArrowLeft, 
  Send, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { apiRequest } from '../utils/api';
import { OrderRequest } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, calculation, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Bikaner');
  const [state, setState] = useState('Rajasthan');
  const [postalCode, setPostalCode] = useState('334001');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0 && !confirmedOrder) {
    navigate('/cart');
    return null;
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter customer full name and mobile number.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        delivery_preference: deliveryPreference,
        address_line1: deliveryPreference === 'DELIVERY' ? addressLine1.trim() : undefined,
        address_line2: deliveryPreference === 'DELIVERY' ? addressLine2.trim() : undefined,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        notes: notes.trim() || undefined,
        honeypot: honeypot || undefined,
        items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
      };

      const res = await apiRequest<OrderRequest>('/order-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setConfirmedOrder(res);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Request Successfully Logged
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Thank You, {confirmedOrder.customer_name}!
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Your bicycle order request has been received by Bajaj Enterprises showroom.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Request Reference ID:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{confirmedOrder.reference_no}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Preference:</span>
              <span className="font-semibold text-slate-800">
                {confirmedOrder.delivery_preference === 'PICKUP' ? 'Store Pickup (Kote Gate, Bikaner)' : 'Home Delivery'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Total Estimated:</span>
              <span className="font-black text-slate-900 text-base">₹{confirmedOrder.total_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Status:</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                {confirmedOrder.status}
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 max-w-md mx-auto text-left leading-relaxed">
            <strong>What happens next?</strong><br />
            1. Our store manager will review bicycle stock in showroom.<br />
            2. We will contact you at <strong>{confirmedOrder.customer_phone}</strong> to confirm your order and schedule pickup or delivery.<br />
            3. Payment is settled securely at showroom pickup or verified upon delivery.
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition"
            >
              Continue Browsing Bicycles
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bicycle Order Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide your details to submit an order request for verified fulfillment at Bajaj Enterprises.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info & Delivery Options */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Honeypot field */}
          <input
            type="text"
            name="b_extra"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
          />

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-2">
              1. Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Bajaj"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp No *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-2">
              2. Fulfillment Preference
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setDeliveryPreference('PICKUP')}
                className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  deliveryPreference === 'PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Store className={`w-5 h-5 mb-2 ${deliveryPreference === 'PICKUP' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">Showroom Pickup</span>
                  <span className="text-[11px] text-slate-500">Alakh Sagar Road, Kote Gate</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryPreference('DELIVERY')}
                className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  deliveryPreference === 'DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Truck className={`w-5 h-5 mb-2 ${deliveryPreference === 'DELIVERY' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">Home Delivery</span>
                  <span className="text-[11px] text-slate-500">Subject to store confirmation</span>
                </div>
              </button>
            </div>

            {deliveryPreference === 'DELIVERY' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address / House No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Plot No, Colony, Landmark"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Order Notes & Custom Preferences (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Fitting requests, preferred pickup day/time, accessory additions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Right: Order Summary & Confirmation CTA */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Bicycles in this Request
          </h3>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {calculation?.items.map((it) => (
              <div key={it.product_id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{it.name}</span>
                  <span className="text-slate-400">Qty: {it.quantity} × ₹{it.unit_price.toLocaleString('en-IN')}</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  ₹{it.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
            <span className="font-black text-slate-900 text-sm">Estimated Total</span>
            <span className="font-black text-2xl text-slate-900">
              ₹{(calculation?.estimated_total || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs space-y-1 border border-amber-100">
            <p className="font-bold">Transparent Business Policy:</p>
            <p>
              Submitting this request does not charge your card. We verify showroom availability and contact you directly to schedule assembly and handover.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Request...' : 'Confirm Order Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
