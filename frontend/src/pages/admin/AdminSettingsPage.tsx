import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, AlertCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { StoreSettings } from '../../types';
import { apiRequest } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState<StoreSettings>({
    store_name: 'Bajaj Enterprises',
    store_address: 'Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India',
    store_phone: '',
    store_whatsapp: '',
    store_email: '',
    opening_hours: '',
    google_maps_url: '',
    instagram_url: '',
    facebook_url: '',
    currency_symbol: '₹',
    announcement_text: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest<StoreSettings>('/admin/settings');
        setFormData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await refreshSettings();
      setSuccessMsg('Store settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Store Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Bajaj Enterprises Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Maintain verified showroom address, phone, WhatsApp number, opening hours, and location links without modifying source code.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm text-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Showroom Identity & Address
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                name="store_name"
                required
                value={formData.store_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Showroom Address *</label>
              <textarea
                rows={2}
                name="store_address"
                required
                value={formData.store_address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <span className="text-[10px] text-slate-400">
                Verified location: Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India.
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Verified Contact Channels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Showroom Phone Number
              </label>
              <input
                type="tel"
                name="store_phone"
                placeholder="e.g. +91 94140XXXXX"
                value={formData.store_phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400">Leave blank until verified by proprietor.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official WhatsApp Number
              </label>
              <input
                type="tel"
                name="store_whatsapp"
                placeholder="e.g. +91 94140XXXXX"
                value={formData.store_whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Business Email Address
              </label>
              <input
                type="email"
                name="store_email"
                placeholder="e.g. contact@bajajenterprises.com"
                value={formData.store_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                name="opening_hours"
                placeholder="e.g. Mon-Sat: 10:00 AM - 8:30 PM"
                value={formData.opening_hours}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Digital Links & Maps Navigation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Google Maps Navigation URL
              </label>
              <input
                type="url"
                name="google_maps_url"
                placeholder="https://maps.google.com/?q=..."
                value={formData.google_maps_url}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  placeholder="https://instagram.com/..."
                  value={formData.instagram_url}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  name="facebook_url"
                  placeholder="https://facebook.com/..."
                  value={formData.facebook_url}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Storefront Announcement Banner
          </h3>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Top Announcement Text (Optional)
            </label>
            <input
              type="text"
              name="announcement_text"
              placeholder="e.g. Showroom open 7 days a week for festive bicycle bookings!"
              value={formData.announcement_text || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Settings...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>

      {/* Demo Records Management Widget */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Demo Data & Structure Tools (डेमो डेटा व संरचना नियंत्रण)
            </h3>
            <p className="text-xs text-slate-500">
              Populate sample bicycles, customer inquiries, order requests, and schemes to test how the admin dashboard functions.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg self-start sm:self-auto">
            Pre-Launch Testing
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The demo dataset seeds illustrative bicycles (AVON City, HERCULES 21-Speed, MTB, Kids 20T, Road Commuter), customer enquiries with varying statuses (`NEW`, `CONTACTED`, `RESOLVED`), itemized order requests, and seasonal promotional schemes. You can clear them at any time with one click before publishing real inventory.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Re-seed sample bicycles, enquiries, orders, and schemes for testing?')) {
                try {
                  const res = await apiRequest<{ message: string }>('/admin/demo-data/seed', { method: 'POST' });
                  alert(res.message || 'Demo data loaded successfully!');
                  window.location.reload();
                } catch (err: any) {
                  alert(err.message || 'Failed to seed demo data.');
                }
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <span>Load / Refresh Demo Data (डेमो डेटा जोड़ें)</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (confirm('Are you sure you want to remove all demo products, enquiries, and orders from the database?')) {
                try {
                  const res = await apiRequest<{ message: string }>('/admin/demo-data/clear', { method: 'POST' });
                  alert(res.message || 'Demo records cleared!');
                  window.location.reload();
                } catch (err: any) {
                  alert(err.message || 'Failed to clear demo data.');
                }
              }
            }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <span>Purge Demo Records (डेमो डेटा हटाएं)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
