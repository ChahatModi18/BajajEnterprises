import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, Check, X, Upload } from 'lucide-react';
import { Banner } from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [buttonText, setButtonText] = useState('Explore Now');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Banner[]>('/admin/banners');
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('/uploads/demo_avon_city_001.svg');
    setLinkUrl('/shop');
    setButtonText('Explore Bicycles');
    setIsActive(true);
    setSortOrder(banners.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.image_url);
    setLinkUrl(b.link_url || '/shop');
    setButtonText(b.button_text || 'Explore Now');
    setIsActive(b.is_active);
    setSortOrder(b.sort_order);
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiRequest('/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      setImageUrl(res.image_url);
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || undefined,
      button_text: buttonText.trim(),
      is_active: isActive,
      sort_order: Number(sortOrder) || 1,
    };

    try {
      if (editingBanner) {
        await apiRequest(`/admin/banners/${editingBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Banner updated.');
      } else {
        await apiRequest('/admin/banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Banner created.');
      }
      setModalOpen(false);
      fetchBanners();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm('Delete this carousel banner?')) return;
    try {
      await apiRequest(`/admin/banners/${b.id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Storefront Presentation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Hero Carousel Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage high-impact slides, call to action buttons, and promotional bicycle graphics on homepage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="aspect-[16/9] bg-slate-900 relative">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                b.is_active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {b.is_active ? 'Active on Storefront' : 'Draft'}
              </span>
            </div>

            <div className="p-6 space-y-2 flex-1">
              <h3 className="font-black text-slate-900 text-base leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{b.subtitle}</p>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                Button: "{b.button_text}" &rarr; {b.link_url}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Order: {b.sort_order}</span>
              <div className="space-x-2">
                <button onClick={() => openEditModal(b)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100">
                  Edit Slide
                </button>
                <button onClick={() => handleDelete(b)} className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg font-bold text-rose-600 hover:bg-rose-100">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-4">
              {editingBanner ? 'Edit Banner Slide' : 'New Banner Slide'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Slide Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welcome to Bajaj Enterprises"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bikaner's trusted bicycle dealership on Alakh Sagar Road, Kote Gate..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image URL or Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1 font-bold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-bold text-slate-800">Active on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold">
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
