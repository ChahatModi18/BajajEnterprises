import React, { useState } from 'react';
import { Banner } from '../../types';
import { apiRequest } from '../../utils/api';
import { Image as ImageIcon, Camera, Upload, Check, X, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface CarouselBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
  onSaved: (banner: Banner) => void;
}

export const CarouselBannerModal: React.FC<CarouselBannerModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSaved,
}) => {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(banner?.image_url || '/uploads/demo_avon_city_001.svg');
  const [linkUrl, setLinkUrl] = useState(banner?.link_url || '/shop');
  const [buttonText, setButtonText] = useState(banner?.button_text || 'Explore Bicycles');
  const [isActive, setIsActive] = useState(banner ? banner.is_active : true);
  const [sortOrder, setSortOrder] = useState(banner?.sort_order || 1);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if banner changes
  React.useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setImageUrl(banner.image_url);
      setLinkUrl(banner.link_url || '/shop');
      setButtonText(banner.button_text || 'Explore Bicycles');
      setIsActive(banner.is_active);
      setSortOrder(banner.sort_order);
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('/uploads/demo_avon_city_001.svg');
      setLinkUrl('/shop');
      setButtonText('Explore Bicycles');
      setIsActive(true);
      setSortOrder(1);
    }
  }, [banner, isOpen]);

  const handleImageFile = async (file: File) => {
    setUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest('/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (res && res.image_url) {
        setImageUrl(res.image_url);
      }
    } catch (err: any) {
      console.warn('Image upload error:', err);
      // Fallback object URL if offline
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setErrorMsg('Banner title and an image are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || '/shop',
      button_text: buttonText.trim() || 'Explore Bicycles',
      is_active: isActive,
      sort_order: Number(sortOrder) || 1,
    };

    try {
      let savedBanner: Banner;
      if (banner && banner.id) {
        savedBanner = await apiRequest(`/admin/banners/${banner.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        savedBanner = await apiRequest('/admin/banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSaved(savedBanner);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save promotional banner.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {banner ? 'Edit Hero Carousel Banner' : 'Create Hero Carousel Banner'}
                </h3>
                <p className="text-xs text-slate-400">
                  Customise top-of-the-page showroom announcements, festival offers, and bicycle showcases.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Live Hero Banner Preview Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Live Carousel Preview
              </label>
              <div className="relative w-full min-h-[160px] sm:min-h-[190px] rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border border-slate-700 p-6 flex flex-col justify-end shadow-inner">
                {/* Background image preview */}
                <div className="absolute inset-0 opacity-40 mix-blend-luminosity overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/demo_avon_city_001.svg';
                    }}
                  />
                </div>
                <div className="relative z-10 space-y-1 max-w-lg">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/80 text-slate-950 rounded">
                    Featured Slide
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                    {title || 'Your Promotional Banner Headline'}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {subtitle || 'Describe the special offer, showroom bicycle arrival, or seasonal scheme.'}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg">
                      {buttonText || 'Explore Now'}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Selection Controls */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Banner Photograph / Visual</span>
                <span className="text-[11px] text-slate-500">16:9 Landscape Recommended</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload File */}
                <label className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl cursor-pointer flex items-center gap-3 transition group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {uploading ? 'Uploading...' : 'Upload Image File'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, SVG</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                {/* Direct Camera Capture */}
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Direct Showroom Camera</span>
                    <span className="text-[10px] text-slate-400">Snap bicycle from showroom</span>
                  </div>
                </button>
              </div>

              {/* Direct Image URL input */}
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/uploads/your_banner_image.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Authorized Dealership: AVON & HERCULES Cycles"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Explore city commuters, geared bikes, and kids cycles on Alakh Sagar Road, Kote Gate, Bikaner."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Button Text & Target Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Button CTA Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Explore Bicycles"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Button Target Link
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/shop or /category/geared-bicycle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Display Order & Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Slide Sequence (Sort Order)
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Active on Homepage</span>
                  <span className="text-[10px] text-slate-400">Display this slide in carousel</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Slide...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Carousel Banner</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleImageFile}
        title="Snap Bicycle Photograph for Banner"
        subtitle="Hold camera in landscape orientation to capture full bicycle profile for carousel slide."
      />
    </>
  );
};

