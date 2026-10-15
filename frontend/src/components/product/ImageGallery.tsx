import React, { useState } from 'react';
import { ProductImage } from '../../types';
import { ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const displayImages = images.length > 0 
    ? images 
    : [{ id: 0, image_url: '/uploads/demo_avon_city_001.svg', is_primary: true, sort_order: 1 }];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const currentImg = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden shadow-sm group">
        <img
          src={currentImg.image_url}
          alt={currentImg.alt_text || productName}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        <button
          onClick={() => setModalOpen(true)}
          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl shadow-md border border-slate-200 opacity-80 group-hover:opacity-100 transition"
          aria-label="Enlarge image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 rounded-xl border-2 p-1 bg-white flex-shrink-0 transition overflow-hidden ${
                selectedIndex === idx
                  ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbnail_url || img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Enlarged Modal View */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImg.image_url}
              alt={productName}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
