import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../../types';

interface HeroCarouselProps {
  banners: Banner[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // If no banners provided, fallback gracefully
  const slides = banners.length > 0 ? banners : [
    {
      id: 1,
      title: 'Welcome to Bajaj Enterprises',
      subtitle: 'Alakh Sagar Road, Kote Gate, Bikaner. Discover trusted AVON, HERCULES & commuter bicycles.',
      image_url: '/uploads/demo_avon_city_001.svg',
      link_url: '/shop',
      button_text: 'Explore Catalogue',
      is_active: true,
      sort_order: 1,
    }
  ];

  // Configurable Autoplay with pause-on-hover and reduced motion check
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Carousel"
    >
      <div 
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div 
            key={slide.id || idx}
            className="w-full flex-shrink-0 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] relative flex items-center bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800"
          >
            {/* Background Graphic / Image */}
            <div className="absolute inset-0 opacity-25 md:opacity-35 mix-blend-luminosity overflow-hidden">
              <img 
                src={slide.image_url} 
                alt={slide.title}
                className="w-full h-full object-cover object-center filter blur-[1px]" 
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>

            {/* Slide Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span>Bajaj Enterprises • Bikaner</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to={slide.link_url || "/shop"}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-95 transition transform"
                  >
                    {slide.button_text || 'Explore Now'}
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
                  >
                    Store Directions
                  </Link>
                </div>
              </div>

              {/* Bicycle Visual Feature Card */}
              <div className="hidden md:flex md:col-span-5 justify-center items-center">
                <div className="w-full max-w-sm aspect-[4/3] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition transform duration-500">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10 opacity-70 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10 opacity-70 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx 
                    ? 'w-7 bg-emerald-500' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
