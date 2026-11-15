import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FolderTree, Plus, Edit2, Trash2, Check, X, Layers } from 'lucide-react';
import { Category, CustomBoxItem } from '../../types';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const AdminCategoriesPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [customBoxes, setCustomBoxes] = useState<CustomBoxItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Category[]>('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setSortOrder(categories.length + 1);
    setCustomBoxes([]);
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIsActive(c.is_active);
    setSortOrder(c.sort_order);
    setCustomBoxes(Array.isArray(c.custom_boxes) ? c.custom_boxes.map((item, idx) => ({
      id: item.id || `box_${Date.now()}_${idx}`,
      label: item.label || `Detail ${idx + 1}`,
      value: item.value || ''
    })) : []);
    setModalOpen(true);
  };

  const handleAddBox = () => {
    const newId = `box_${Date.now()}`;
    setCustomBoxes(prev => [
      ...prev,
      { id: newId, label: `Category Detail / श्रेणी विवरण ${prev.length + 1}`, value: '' }
    ]);
  };

  const handleRenameBoxLabel = (id: string | number, newLabel: string) => {
    setCustomBoxes(prev => prev.map(b => b.id === id ? { ...b, label: newLabel } : b));
  };

  const handleUpdateBoxValue = (id: string | number, newValue: string) => {
    setCustomBoxes(prev => prev.map(b => b.id === id ? { ...b, value: newValue } : b));
  };

  const handleDeleteBox = (id: string | number) => {
    setCustomBoxes(prev => prev.filter(b => b.id !== id));
  };

  const handleCleanDuplicates = () => {
    const seen = new Set<string>();
    const deduped: CustomBoxItem[] = [];
    for (const b of customBoxes) {
      const key = b.label.trim().toLowerCase();
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        deduped.push(b);
      }
    }
    setCustomBoxes(deduped);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const validCustomBoxes = customBoxes.filter(b => b.label.trim());

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
      custom_boxes: validCustomBoxes,
    };

    try {
      if (editingCategory) {
        await apiRequest(`/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Category "${name}" updated.`);
      } else {
        await apiRequest('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Category "${name}" created.`);
      }
      setModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await apiRequest(`/admin/categories/${c.id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
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
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Bicycle Classifications
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Manage Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize inventory by riding type (MTB, City, Roadster, Kids).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Category Name</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Custom Boxes</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                  {c.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">
                  {c.slug}
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                  {c.description || '—'}
                </td>
                <td className="py-3.5 px-4">
                  {c.custom_boxes && c.custom_boxes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.custom_boxes.slice(0, 2).map((cb, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {cb.label}: {cb.value || '—'}
                        </span>
                      ))}
                      {c.custom_boxes.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          +{c.custom_boxes.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    title="Edit category and custom boxes"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mountain Bicycles (MTB)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left empty"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              {/* Custom Information Boxes Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Custom Information Boxes (कस्टम जानकारी बॉक्स)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Add custom boxes (e.g. Riding Terrain, Target Age, Highlights) for this category.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {customBoxes.length > 1 && (
                      <button
                        type="button"
                        onClick={handleCleanDuplicates}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        title="Remove duplicate box labels"
                      >
                        Clean Duplicates
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddBox}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200/80 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Box</span>
                    </button>
                  </div>
                </div>

                {customBoxes.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    No custom boxes yet. Click <strong>+ Add Box</strong> to create custom category metadata.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {customBoxes.map((box) => (
                      <div key={box.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Box Label (e.g. Riding Surface / इलाके की स्थिति)"
                            value={box.label}
                            onChange={(e) => handleRenameBoxLabel(box.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteBox(box.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Delete this box"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Box Content / Value (e.g. Rough trails, Desert roads, City streets)"
                          value={box.value}
                          onChange={(e) => handleUpdateBoxValue(box.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold">
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
