import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Bike, BookOpen, FileEdit, Sliders, Tag, FolderTree, 
  Image as ImageIcon, Sparkles, UploadCloud, MessageSquare, 
  ShoppingBag, Settings, LogOut, ExternalLink, HelpCircle, Star,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHelp } from '../../context/HelpContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isHelpMode, toggleHelpMode } = useHelp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        Verifying administrator authorization...
      </div>
    );
  }

  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  const navLinks = [
    { to: '/admin', label: 'Overview (डैशबोर्ड)', icon: LayoutDashboard, exact: true },
    { to: '/admin/catalogue-studio', label: 'Catalogue Studio (सचित्र कैटलॉग)', icon: BookOpen },
    { to: '/admin/content', label: 'Website Content (वेबसाइट सामग्री)', icon: FileEdit },
    { to: '/admin/products', label: 'Products & Bicycles', icon: Bike },
    { to: '/admin/attributes', label: 'Manage Custom Fields', icon: Sliders },
    { to: '/admin/brands', label: 'Brands (ब्रांड्स)', icon: Tag },
    { to: '/admin/categories', label: 'Categories (श्रेणियां)', icon: FolderTree },
    { to: '/admin/bulk-catalogues', label: 'Bulk Catalogues & Files (थोक कैटलॉग)', icon: UploadCloud },
    { to: '/admin/feedback', label: 'Customer Reviews & Ratings (समीक्षाएं)', icon: Star },
    { to: '/admin/enquiries', label: 'Customer Enquiries', icon: MessageSquare },
    { to: '/admin/orders', label: 'Order Requests', icon: ShoppingBag },
    { to: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
    { to: '/admin/schemes', label: 'Promotional Schemes', icon: Sparkles },
    { to: '/admin/settings', label: 'Store Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Identity */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-sm tracking-tight">BAJAJ ENTERPRISES</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Showroom Admin</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-190px)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact 
              ? location.pathname === link.to 
              : location.pathname.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'hover:bg-slate-800 hover:text-white text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Actions Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/90">
        <div className="flex items-center justify-between text-xs">
          <div className="truncate mr-2">
            <span className="text-white font-bold block truncate">{user?.full_name || 'Admin'}</span>
            <span className="text-slate-400 text-[10px] truncate">{user?.email || 'admin@bajajenterprises.com'}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[9px] border border-emerald-800 flex-shrink-0">
            {user?.role || 'ADMIN'}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/"
            target="_blank"
            className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center text-[11px] font-semibold flex items-center justify-center gap-1 transition"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/40"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top App Bar (Visible on < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
            aria-label="Open admin navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs tracking-tight text-white leading-tight">BAJAJ ENTERPRISES</span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Showroom Admin</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="View live storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <span className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </span>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 shadow-2xl h-full flex flex-col animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sticky Sidebar (Visible on >= md) */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex-col justify-between h-screen sticky top-0 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl min-w-0">
        {/* Top Utility Bar with Help Mode Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="text-xs text-slate-500 font-medium truncate">
            Bajaj Enterprises • Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan
          </div>

          {/* Help Mode Toggle */}
          <button
            type="button"
            onClick={toggleHelpMode}
            className={`self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition flex-shrink-0 ${
              isHelpMode 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle simple Hindi/English explanations"
          >
            <HelpCircle className={`w-4 h-4 ${isHelpMode ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Help Mode: {isHelpMode ? 'ON (सहायता चालू)' : 'OFF'}</span>
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};
