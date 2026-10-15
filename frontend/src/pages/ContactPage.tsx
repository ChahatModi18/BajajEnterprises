import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, 
  CheckCircle2, ExternalLink, AlertCircle 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { apiRequest } from '../utils/api';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Enquiry');
  const [modelInterest, setModelInterest] = useState('');
  const [message, setMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState('Phone');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please enter your full name, phone number, and message.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please consent to our privacy terms to submit your enquiry.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const fullMessage = modelInterest.trim() 
        ? `[Model of Interest: ${modelInterest.trim()}]\n\n${message.trim()}`
        : message.trim();

      const res = await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          category,
          message: fullMessage,
          preferred_contact: preferredContact,
          honeypot: honeypot || undefined,
        }),
      });

      setReferenceNo(res.reference_no);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setModelInterest('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Store Contact & Directions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Visit or Inquire with Bajaj Enterprises
        </h1>
        <p className="text-sm text-slate-600">
          We welcome inquiries for bicycle models, pricing quotes, bulk institutional purchases, and showroom visits in Bikaner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Info & Showroom Map Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Showroom Details
            </h3>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Showroom Address</span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {settings.store_address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Contact Phone / WhatsApp</span>
                  {settings.store_phone ? (
                    <a href={`tel:${settings.store_phone}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                      {settings.store_phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">(Store phone placeholder)</span>
                  )}
                </div>
              </div>

              {settings.store_email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Store Email</span>
                    <a href={`mailto:${settings.store_email}`} className="text-xs text-emerald-600 hover:underline">
                      {settings.store_email}
                    </a>
                  </div>
                </div>
              )}

              {settings.opening_hours && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Opening Timings</span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {settings.opening_hours}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Google Maps External Directions */}
            <div className="pt-2">
              <a
                href={settings.google_maps_url || "https://maps.google.com/?q=Alakh+Sagar+Road+Kote+Gate+Bikaner+Rajasthan"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>Open Directions in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Enquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {referenceNo ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Enquiry Submitted!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your message has been saved in the Bajaj Enterprises database. Reference Number:
              </p>
              <div className="inline-block bg-slate-100 px-5 py-2.5 rounded-xl font-mono text-emerald-800 font-black text-lg border border-slate-200">
                {referenceNo}
              </div>
              <p className="text-xs text-slate-500">
                Our store staff will reach out to you via your selected contact method.
              </p>
              <button
                onClick={() => setReferenceNo(null)}
                className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                Customer Query & Quote Request Form
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                All inquiries are received directly by Bajaj Enterprises admin staff.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="user_confirm"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9414012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="ramesh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Query Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Product Availability">Product Availability</option>
                      <option value="Price & Scheme Quote">Price & Scheme Quote</option>
                      <option value="Bulk / Institutional Order">Bulk / Institutional Order</option>
                      <option value="Warranty & Spares">Warranty & Spares</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bicycle or Model of Interest (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AVON City 26, HERCULES 21-Speed MTB..."
                    value={modelInterest}
                    onChange={(e) => setModelInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Phone', 'WhatsApp', 'Email'].map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPreferredContact(method)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
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
                    Your Message / Specific Question *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your question, frame size query, or required delivery timeline..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent-box"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <label htmlFor="consent-box" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                    I consent to Bajaj Enterprises contacting me regarding this bicycle enquiry in accordance with the store privacy notice.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Customer Query'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
