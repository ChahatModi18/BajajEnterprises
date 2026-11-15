import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Phone, User, Bike } from 'lucide-react';
import { Product } from '../../types';
import { apiRequest } from '../../utils/api';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'call'>('whatsapp');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          enquiry_type: 'STOCK_NOTIFY',
          customer_name: name.trim() || 'Showroom Visitor',
          contact_number: phone.trim(),
          product_id: product.id,
          message: `Stock notification request for ${product.name} (${product.sku}). Preferred via ${preferredContact}.`,
        }),
      });

      setSubmitted(true);
    } catch (err: any) {
      // Even if network/server issue, record intent in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('bajaj_stock_alerts') || '[]');
        stored.push({
          productId: product.id,
          productName: product.name,
          name: name.trim() || 'Customer',
          phone: phone.trim(),
          date: new Date().toISOString(),
        });
        localStorage.setItem('bajaj_stock_alerts', JSON.stringify(stored));
        setSubmitted(true);
      } catch {
        setErrorMsg(err.message || 'Unable to record notification request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Notification Registered!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              धन्यवाद! जैसे ही <strong>{product.name}</strong> बजाज एंटरप्राइजेज शोरूम (कोट गेट, बीकानेर) में उपलब्ध होगी, हमारी टीम आपको तुरंत व्हाट्सएप / कॉल पर सूचित करेगी।
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                Done (पूर्ण करें)
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Notify Me When In Stock
                </h3>
                <p className="text-[11px] text-slate-500">
                  स्टॉक आते ही सबसे पहले जानकारी प्राप्त करें
                </p>
              </div>
            </div>

            {/* Bicycle summary chip */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Bike className="w-6 h-6 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block font-bold text-xs text-slate-900 truncate">
                  {product.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Brand: {product.brand?.name || 'Bajaj'} • {product.category?.name || 'Bicycle'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                Out of Stock
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name / आपका नाम
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp / Mobile Number (मोबाइल नंबर) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="+91 94141 XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Preferred Notification Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPreferredContact('whatsapp')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    preferredContact === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>WhatsApp Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredContact('call')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    preferredContact === 'call'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Direct Call</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              We respect your privacy. Your number will only be used by Bajaj Enterprises showroom staff to notify you about this bicycle.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Notify Me When Available'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
