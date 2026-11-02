import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Bike, BookOpen, FileEdit, Sliders, Tag, FolderTree, 
  Image as ImageIcon, Sparkles, UploadCloud, MessageSquare, 
  ShoppingBag, Settings, LogOut, ExternalLink, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHelp } from '../../context/HelpContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isHelpMode, toggleHelpMode } = useHelp();
  const location = useLocation();
  const navigate = useNavigate();

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
    { to: '/admin/import', label: 'Bulk Catalogue Import', icon: UploadCloud },
    { to: '/admin/enquiries', label: 'Customer Enquiries', icon: MessageSquare },
    { to: '/admin/orders', label: 'Order Requests', icon: ShoppingBag },
    { to: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
    { to: '/admin/schemes', label: 'Promotional Schemes', icon: Sparkles },
    { to: '/admin/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between">
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
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact 
                ? location.pathname === link.to 
                : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
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
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-white font-bold block truncate">{user?.full_name || 'Admin'}</span>
              <span className="text-slate-400 text-[10px] truncate">{user?.email || 'admin@bajajenterprises.com'}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[9px] border border-emerald-800">
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
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        {/* Top Utility Bar with Help Mode Toggle */}
        <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Bajaj Enterprises • Alakh Sagar Road, Kote Gate, Bikaner
          </div>

          {/* Help Mode Toggle */}
          <button
            type="button"
            onClick={toggleHelpMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
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
