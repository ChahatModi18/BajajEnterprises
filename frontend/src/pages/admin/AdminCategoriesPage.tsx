import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Category } from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

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
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIsActive(c.is_active);
    setSortOrder(c.sort_order);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Catalogue Taxonomies
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Manage Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure bicycle segments (City, Geared, Kids', Mountain, Road, Accessories).
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
              <th className="py-3.5 px-4">Slug Identifier</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{c.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{c.slug}</td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{c.description || '—'}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5">
                  <button onClick={() => openEditModal(c)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
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
                  placeholder="e.g. Geared Bicycles"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
