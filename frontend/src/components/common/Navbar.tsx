import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Search, MapPin, Phone, 
  Menu, X, ShieldCheck, ChevronDown, MessageSquare
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { settings } = useSettings();
  const { totalCount: cartCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{settings.store_address}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {settings.store_phone ? (
              <a href={`tel:${settings.store_phone}`} className="flex items-center gap-1 hover:text-white transition">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.store_phone}</span>
              </a>
            ) : (
              <span className="text-slate-400 italic">Call / WhatsApp: (Store contact placeholder)</span>
            )}

            {settings.opening_hours && (
              <span className="hidden md:inline-block border-l border-slate-700 pl-3 text-slate-300">
                Hours: {settings.opening_hours}
              </span>
            )}

            <Link 
              to="/admin" 
              className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-white border-l border-slate-700 pl-3 transition"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo / Brand Name */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition transform">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <circle cx="5.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8.5 10H12l3.5 4h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5.5 17.5L8.5 10l5-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
              BAJAJ <span className="text-emerald-600">ENTERPRISES</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase -mt-1">
              Authorized Bicycle Store • Bikaner
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search bicycles by name, brand (AVON, HERCULES), model, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/90 text-sm pl-4 pr-10 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Contact/Enquiry */}
          <Link
            to="/contact"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Enquire / Quote</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-semibold text-sm transition"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-emerald-600 md:hidden rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Primary Navigation Menu */}
      <nav className="border-t border-slate-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-6 py-2.5 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
          <Link to="/shop" className="hover:text-emerald-600 transition font-semibold text-emerald-700">All Bicycles</Link>
          
          {/* Brands dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-emerald-600 transition py-1">
              <span>Brands</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition" />
            </button>
            <div className="absolute top-full left-0 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
              <Link to="/brand/avon" className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold">
                AVON Cycles
              </Link>
              <Link to="/brand/hercules" className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold">
                HERCULES Bicycles
              </Link>
              <Link to="/shop" className="block px-4 py-2 border-t border-slate-100 text-xs text-slate-500 hover:text-emerald-600">
                View All Brands &rarr;
              </Link>
            </div>
          </div>

          {/* Bicycle Categories */}
          <Link to="/category/city-bicycle" className="hover:text-emerald-600 transition">City & Commuter</Link>
          <Link to="/category/geared-bicycle" className="hover:text-emerald-600 transition">Geared Bicycles</Link>
          <Link to="/category/kids-bicycles" className="hover:text-emerald-600 transition">Kids' Bicycles</Link>
          <Link to="/category/mountain-bicycles" className="hover:text-emerald-600 transition">Mountain (MTB)</Link>
          <Link to="/schemes" className="hover:text-emerald-600 transition text-amber-600 font-semibold flex items-center gap-1">
            <span>Current Schemes & Offers</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </Link>
          <Link to="/about" className="hover:text-emerald-600 transition">About Store</Link>
          <Link to="/contact" className="hover:text-emerald-600 transition">Contact & Location</Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search bicycles, brands, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-sm pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-600 text-white rounded-md flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-100">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md font-semibold text-emerald-700 hover:bg-emerald-50">All Bicycles Catalogue</Link>
            <div className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-slate-400">Featured Brands</div>
            <Link to="/brand/avon" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">AVON Cycles</Link>
            <Link to="/brand/hercules" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">HERCULES Bicycles</Link>
            
            <div className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-slate-400">Categories</div>
            <Link to="/category/city-bicycle" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">City & Commuter</Link>
            <Link to="/category/geared-bicycle" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">Geared Bicycles</Link>
            <Link to="/category/kids-bicycles" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">Kids' Bicycles</Link>
            <Link to="/category/mountain-bicycles" onClick={() => setMobileMenuOpen(false)} className="px-5 py-1.5 text-xs hover:bg-slate-50">Mountain Bicycles</Link>

            <Link to="/schemes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md font-bold text-amber-600 hover:bg-amber-50">Schemes & Offers</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-100">About Bajaj Enterprises</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-100">Store Directions & Contact</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md bg-slate-100 text-slate-800 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
