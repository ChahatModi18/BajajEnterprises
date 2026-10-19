import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles, Plus, Edit2, Trash2, Check, X, Calendar, Tag } from 'lucide-react';
import { Scheme } from '../../types';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const AdminSchemesPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [terms, setTerms] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Scheme[]>('/admin/schemes');
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const openCreateModal = () => {
    setEditingScheme(null);
    setTitle('');
    setDescription('');
    setDiscountType('PERCENT');
    setDiscountValue('10');
    setEligibility('Applicable on selected commuter and kids bicycles.');
    setTerms('Valid until stocks last at Bajaj Enterprises Kote Gate showroom.');
    setEndDate('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (s: Scheme) => {
    setEditingScheme(s);
    setTitle(s.title);
    setDescription(s.description || '');
    setDiscountType(s.discount_type || 'PERCENT');
    setDiscountValue(s.discount_value ? s.discount_value.toString() : '');
    setEligibility(s.eligibility || '');
    setTerms(s.terms || '');
    setEndDate(s.end_date ? s.end_date.slice(0, 10) : '');
    setIsActive(s.is_active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      discount_type: discountType,
      discount_value: discountValue ? parseFloat(discountValue) : null,
      eligibility: eligibility.trim() || undefined,
      terms: terms.trim() || undefined,
      end_date: endDate ? `${endDate}T23:59:59` : null,
      is_active: isActive,
    };

    try {
      if (editingScheme) {
        await apiRequest(`/admin/schemes/${editingScheme.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Scheme updated.');
      } else {
        await apiRequest('/admin/schemes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Scheme created.');
      }
      setModalOpen(false);
      fetchSchemes();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Scheme) => {
    if (!window.confirm('Delete this promotional scheme?')) return;
    try {
      await apiRequest(`/admin/schemes/${s.id}`, { method: 'DELETE' });
      fetchSchemes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete scheme.');
    }
  };

  if (authLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Verifying admin authorization...
      </div>
    );
  }

  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Store Marketing & Offers
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Promotional Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish, edit, and schedule seasonal campaigns and discount offers. Expired schemes hide automatically.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Promotional Scheme</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {s.is_active ? 'Active' : 'Disabled'}
                </span>
                {s.end_date && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expires: {new Date(s.end_date).toLocaleDateString()}</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-snug">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

              {s.eligibility && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700">
                  <strong>Eligibility:</strong> {s.eligibility}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button onClick={() => openEditModal(s)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">
                Edit Scheme
              </button>
              <button onClick={() => handleDelete(s)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-4">
              {editingScheme ? 'Edit Promotional Scheme' : 'New Promotional Scheme'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Bicycle Upgrade Scheme 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the offer, discount or gift scheme..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Flat Discount (₹)</option>
                    <option value="OFFER">Free Accessory / Scheme</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active_scheme"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <label htmlFor="active_scheme" className="font-bold text-slate-800">
                  Publish Scheme on Storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold">
                  {saving ? 'Saving...' : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
