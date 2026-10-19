import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Bike, AlertCircle, EyeOff, MessageSquare, 
  ShoppingBag, Sparkles, ArrowRight, UploadCloud, Plus 
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Product, Enquiry, OrderRequest, Scheme } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useHelp } from '../../context/HelpContext';
import { BookOpen, FileEdit, HelpCircle } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { isHelpMode } = useHelp();
  const [stats, setStats] = useState({
    activeProducts: 0,
    lowStockProducts: 0,
    unpublishedProducts: 0,
    newEnquiries: 0,
    pendingOrders: 0,
    activeSchemes: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [prodsData, enqsData, ordersData, schemesData] = await Promise.all([
          apiRequest<{ items: Product[]; total: number }>('/admin/products?page_size=100'),
          apiRequest<Enquiry[]>('/admin/enquiries'),
          apiRequest<OrderRequest[]>('/admin/order-requests'),
          apiRequest<Scheme[]>('/admin/schemes'),
        ]);

        const allProds = prodsData.items || [];
        const active = allProds.filter(p => p.is_published && !p.is_archived).length;
        const lowStock = allProds.filter(p => p.stock_quantity <= 2 && p.stock_quantity > 0).length;
        const unpublished = allProds.filter(p => !p.is_published).length;
        const newEnq = enqsData.filter(e => e.status === 'NEW').length;
        const pendingOrd = ordersData.filter(o => o.status === 'RECEIVED' || o.status === 'UNDER_REVIEW').length;
        const actSchemes = schemesData.filter(s => s.is_active).length;

        setStats({
          activeProducts: active,
          lowStockProducts: lowStock,
          unpublishedProducts: unpublished,
          newEnquiries: newEnq,
          pendingOrders: pendingOrd,
          activeSchemes: actSchemes,
        });

        setRecentEnquiries(enqsData.slice(0, 5));
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Bajaj Enterprises • Live Showroom Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Store Administration Dashboard (मुख्य नियंत्रण कक्ष)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Alakh Sagar Road, Kote Gate, Bikaner — Live statistics for bicycles, customer inquiries, and showroom orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/catalogue-studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>Catalogue Studio (सचित्र कैटलॉग)</span>
          </Link>
          <Link
            to="/admin/content"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <FileEdit className="w-4 h-4 text-emerald-400" />
            <span>Edit Website Content (सामग्री बदलें)</span>
          </Link>
        </div>
      </div>

      {/* Non-Tech Guidance Box */}
      {isHelpMode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">
              💡 Owner Quick Tips (सरल दुकानदार निर्देश):
            </strong>
            <p>
              नीचे दिए गए 6 कार्ड आपकी दुकान का वास्तविक डेटा दिखा रहे हैं। किसी भी संख्या पर क्लिक करके आप सीधे उस काम को कर सकते हैं। 
              नया साइकिल मॉडल फोटो सहित जोड़ने के लिए ऊपर <strong>"Catalogue Studio"</strong> पर जाएं, और दुकान का पता, फोन नंबर या कोई भी लिखावट बदलने के लिए <strong>"Edit Website Content"</strong> पर जाएं।
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid with Bilingual Labels */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Active Products */}
        <Link to="/admin/catalogue-studio" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-emerald-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <Bike className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.activeProducts}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Active Bicycles</span>
            <span className="text-[10px] text-slate-400 block">वेबसाइट पर चालू साइकिलें</span>
          </div>
        </Link>

        {/* Low Stock */}
        <Link to="/admin/products" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-orange-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.lowStockProducts}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Low Stock Alert</span>
            <span className="text-[10px] text-slate-400 block">कम स्टॉक (&le; 2 बची)</span>
          </div>
        </Link>

        {/* Unpublished Drafts */}
        <Link to="/admin/products" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-slate-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
            <EyeOff className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.unpublishedProducts}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Drafts / Inactive</span>
            <span className="text-[10px] text-slate-400 block">अप्रकाशित ड्राफ्ट</span>
          </div>
        </Link>

        {/* New Enquiries */}
        <Link to="/admin/enquiries" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-blue-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.newEnquiries}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">New Inquiries</span>
            <span className="text-[10px] text-slate-400 block">ग्राहकों की नई पूछताछ</span>
          </div>
        </Link>

        {/* Pending Order Requests */}
        <Link to="/admin/orders" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-purple-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.pendingOrders}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Pending Orders</span>
            <span className="text-[10px] text-slate-400 block">लंबित ऑर्डर अनुरोध</span>
          </div>
        </Link>

        {/* Active Schemes */}
        <Link to="/admin/schemes" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-amber-500 transition group">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stats.activeSchemes}</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Active Schemes</span>
            <span className="text-[10px] text-slate-400 block">चालू ऑफर्स व स्कीमें</span>
          </div>
        </Link>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Recent Customer Enquiries</h3>
            <Link to="/admin/enquiries" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All &rarr;
            </Link>
          </div>

          {recentEnquiries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">{enq.name} ({enq.phone})</span>
                    <span className="text-slate-500 line-clamp-1">{enq.message}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{new Date(enq.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    enq.status === 'NEW' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No customer enquiries received yet.</p>
          )}
        </div>

        {/* Recent Order Requests */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Recent Order Requests</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All &rarr;
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.customer_name} ({ord.customer_phone})</span>
                    <span className="text-slate-500 font-mono text-[11px]">{ord.reference_no} • {ord.delivery_preference}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total: ₹{ord.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    ord.status === 'RECEIVED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No order requests received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
