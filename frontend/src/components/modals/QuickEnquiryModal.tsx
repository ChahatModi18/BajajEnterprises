import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';
import { apiRequest } from '../../utils/api';

interface QuickEnquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickEnquiryModal: React.FC<QuickEnquiryModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState('Phone');
  const [message, setMessage] = useState(
    product ? `Hello Bajaj Enterprises, I am interested in inquiring about ${product.name} (SKU: ${product.sku}). Please share availability and current store offer.` : ''
  );
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please enter your Name, Phone Number, and Message.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          category: 'Product Enquiry',
          product_id: product?.id,
          message: message.trim(),
          preferred_contact: preferredContact,
          honeypot: honeypot || undefined,
        }),
      });
      setSuccessRef(res.reference_no);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {successRef ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Enquiry Received!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Thank you for contacting Bajaj Enterprises. Your reference number is:
            </p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl text-emerald-800 font-extrabold text-base border border-slate-200">
              {successRef}
            </div>
            <p className="text-xs text-slate-500">
              Our store representative will contact you via {preferredContact} shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Bajaj Enterprises • Kote Gate, Bikaner
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {product ? `Inquire About ${product.name}` : 'Customer Store Enquiry'}
              </h3>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Honeypot field (hidden from legitimate humans) */}
              <input
                type="text"
                name="b_details"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp No *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Phone', 'WhatsApp', 'Email'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPreferredContact(method)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                        preferredContact === method
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Query Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Send Enquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
