import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Sliders, Plus, Edit2, Trash2, Check, X, 
  Eye, EyeOff, Save, AlertCircle, Sparkles 
} from 'lucide-react';
import { ProductAttribute, Category } from '../../types';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const AdminAttributesPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<ProductAttribute | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [optionsStr, setOptionsStr] = useState('');
  const [unit, setUnit] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [showInCard, setShowInCard] = useState(false);
  const [showInFilters, setShowInFilters] = useState(true);
  const [showInSpecs, setShowInSpecs] = useState(true);
  const [showInComparison, setShowInComparison] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const [attrsData, catsData] = await Promise.all([
        apiRequest<ProductAttribute[]>('/admin/attributes'),
        apiRequest<Category[]>('/admin/categories'),
      ]);
      setAttributes(attrsData);
      setCategories(catsData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load attributes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const openCreateModal = () => {
    setEditingAttr(null);
    setName('');
    setKey('');
    setFieldType('text');
    setOptionsStr('');
    setUnit('');
    setIsRequired(false);
    setShowInCard(false);
    setShowInFilters(true);
    setShowInSpecs(true);
    setShowInComparison(true);
    setSortOrder(attributes.length + 1);
    setSelectedCatIds([]);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (attr: ProductAttribute) => {
    setEditingAttr(attr);
    setName(attr.name);
    setKey(attr.key);
    setFieldType(attr.field_type);
    setOptionsStr(attr.options_json ? attr.options_json.join(', ') : '');
    setUnit(attr.unit || '');
    setIsRequired(attr.is_required);
    setShowInCard(attr.show_in_card);
    setShowInFilters(attr.show_in_filters);
    setShowInSpecs(attr.show_in_specs);
    setShowInComparison(attr.show_in_comparison);
    setSortOrder(attr.sort_order);
    setSelectedCatIds(attr.category_ids || []);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Field name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const optionsList = ['dropdown', 'multiselect'].includes(fieldType)
      ? optionsStr.split(',').map(s => s.trim()).filter(Boolean)
      : null;

    const payload = {
      name: name.trim(),
      key: key.trim() || undefined,
      field_type: fieldType,
      options_json: optionsList,
      unit: unit.trim() || null,
      is_required: isRequired,
      show_in_card: showInCard,
      show_in_filters: showInFilters,
      show_in_specs: showInSpecs,
      show_in_comparison: showInComparison,
      sort_order: Number(sortOrder) || 0,
      category_ids: selectedCatIds,
    };

    try {
      if (editingAttr) {
        await apiRequest(`/admin/attributes/${editingAttr.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Attribute "${name}" updated successfully.`);
      } else {
        await apiRequest('/admin/attributes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Attribute "${name}" created successfully.`);
      }
      setModalOpen(false);
      fetchAttributes();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving dynamic attribute.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActiveStatus = async (attr: ProductAttribute) => {
    try {
      await apiRequest(`/admin/attributes/${attr.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !attr.is_active }),
      });
      fetchAttributes();
    } catch (err: any) {
      alert(err.message || 'Failed to update field status.');
    }
  };

  const handleDelete = async (attr: ProductAttribute) => {
    if (!window.confirm(`Are you sure you want to remove field "${attr.name}"?`)) return;
    try {
      await apiRequest(`/admin/attributes/${attr.id}`, { method: 'DELETE' });
      fetchAttributes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete attribute.');
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Custom Product Columns & Specifications
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Manage Product Fields
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure dynamic bicycle attributes (frame sizes, wheel sizes, gears, brakes, suspension) that adapt across catalogue filters, cards, and specifications without code changes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Product Field</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Attributes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Field Name / Label</th>
                <th className="py-3.5 px-4">Internal Key</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4 text-center">In Card</th>
                <th className="py-3.5 px-4 text-center">In Filters</th>
                <th className="py-3.5 px-4 text-center">In Specs</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {attr.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {attr.key}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {attr.field_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {attr.unit || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {attr.show_in_card ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {attr.show_in_filters ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {attr.show_in_specs ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleActiveStatus(attr)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                        attr.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {attr.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(attr)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Edit Field"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(attr)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      title="Delete Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Field Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingAttr ? 'Edit Product Field' : 'Create Custom Product Column'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Define the specification label, data type, options, and catalogue visibility rules.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Field Label / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frame Material"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Internal Identifier (Key)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. frame_material (auto-generated if empty)"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Field Data Type *
                  </label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="number">Integer Number</option>
                    <option value="decimal">Decimal / Float</option>
                    <option value="dropdown">Dropdown (Select One)</option>
                    <option value="multiselect">Multi-Select List</option>
                    <option value="boolean">Boolean (Yes / No)</option>
                    <option value="date">Date</option>
                    <option value="longtext">Long Text / Paragraph</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unit of Measurement (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. inches, gears, kg, cm"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {['dropdown', 'multiselect'].includes(fieldType) && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dropdown Options (Comma-Separated) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Steel, Alloy 6061, Carbon Fibre"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate choices with commas.</p>
                </div>
              )}

              {/* Visibility Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs">Catalogue Visibility & Usage</span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInCard}
                      onChange={(e) => setShowInCard(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Show on Product Cards</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInFilters}
                      onChange={(e) => setShowInFilters(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Enable as Catalogue Filter</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInSpecs}
                      onChange={(e) => setShowInSpecs(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Show in Specifications Table</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInComparison}
                      onChange={(e) => setShowInComparison(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Include in Comparison Matrix</span>
                  </label>
                </div>
              </div>

              {/* Category Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Applicable Categories (Leave empty for All Categories)
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        setSelectedCatIds(prev =>
                          prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        selectedCatIds.includes(c.id)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingAttr ? 'Update Field' : 'Create Field'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
