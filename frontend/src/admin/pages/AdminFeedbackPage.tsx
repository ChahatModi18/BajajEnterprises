import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Trash2, CheckCircle2, 
  XCircle, Sparkles, Filter, RefreshCw, ThumbsUp, 
  User, Phone, Bike, Search, AlertCircle 
} from 'lucide-react';
import { Feedback } from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Feedback[]>('/admin/feedback');
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin feedbacks:', err);
      // Fallback
      const raw = localStorage.getItem('bajaj_feedbacks');
      if (raw) setFeedbacks(JSON.parse(raw));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleToggleFeature = async (id: number) => {
    setActionLoadingId(id);
    try {
      const updated = await apiRequest<Feedback>(`/admin/feedback/${id}/toggle-feature`, {
        method: 'PATCH',
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_featured: updated.is_featured } : f))
      );
      setSuccessMsg(`Review feature status updated!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleApproval = async (id: number) => {
    setActionLoadingId(id);
    try {
      const updated = await apiRequest<Feedback>(`/admin/feedback/${id}/toggle-approval`, {
        method: 'PATCH',
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_approved: updated.is_approved } : f))
      );
      setSuccessMsg('Review approval status toggled.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle approval.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer feedback?')) return;
    setActionLoadingId(id);
    try {
      await apiRequest(`/admin/feedback/${id}`, { method: 'DELETE' });
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      setSuccessMsg('Customer review deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete review.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered list
  const filtered = feedbacks.filter((f) => {
    if (filterRating !== null && f.rating !== filterRating) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchComment = f.comment?.toLowerCase().includes(q);
      const matchBike = f.bicycle_model?.toLowerCase().includes(q);
      if (!matchName && !matchComment && !matchBike) return false;
    }
    return true;
  });

  const totalReviews = feedbacks.length;
  const avgRating = totalReviews > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const featuredCount = feedbacks.filter((f) => f.is_featured).length;
  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Showroom Reputation Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Customer Reviews & Ratings (समीक्षाएं)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage feedback submitted by showroom visitors, moderate reviews, and choose top testimonials to feature on the homepage.
          </p>
        </div>

        <button
          onClick={fetchFeedbacks}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Average Showroom Rating</span>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-3xl font-black text-slate-900">{avgRating}</span>
            <div className="flex items-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block">Out of 5.0 Stars</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Reviews</span>
          <div className="text-3xl font-black text-slate-900 pt-1">{totalReviews}</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">{fiveStarCount} 5-Star Reviews</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Featured on Homepage</span>
          <div className="text-3xl font-black text-emerald-600 pt-1">{featuredCount}</div>
          <span className="text-[11px] text-slate-400 block">Showcased in reviews section</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">5-Star Satisfaction</span>
          <div className="text-3xl font-black text-slate-900 pt-1">
            {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100}%
          </div>
          <span className="text-[11px] text-slate-400 block">Customer satisfaction rate</span>
        </div>
      </div>

      {/* Search & Rating Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, comment, or bike..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterRating === null
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Ratings ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = feedbacks.filter((f) => f.rating === star).length;
            return (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  filterRating === star
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-3 h-3 ${filterRating === star ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
          Loading customer reviews...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No reviews found matching your filters</h4>
          <p className="text-xs text-slate-500">Try adjusting your star filter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 bg-white border rounded-2xl shadow-sm transition hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                rev.is_featured ? 'border-amber-400/60 ring-1 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              {/* Left Column: Customer & Content */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-slate-900">{rev.name}</span>

                  {rev.phone && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" />
                      <span>{rev.phone}</span>
                    </span>
                  )}

                  {rev.is_featured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured on Homepage</span>
                    </span>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>

                {/* Tags (Category & Bicycle model) */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold">
                    Category: {rev.service_type || 'Showroom Purchase'}
                  </span>
                  {rev.bicycle_model && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                      <Bike className="w-3 h-3 text-emerald-600" />
                      <span>{rev.bicycle_model}</span>
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px] ml-auto">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex md:flex-col items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 flex-shrink-0">
                <button
                  type="button"
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleToggleFeature(rev.id)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    rev.is_featured
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600'
                  }`}
                  title="Toggle featured testimonial on public website"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{rev.is_featured ? 'Remove Feature' : 'Feature on Home'}</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleToggleApproval(rev.id)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    rev.is_approved
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                  }`}
                >
                  {rev.is_approved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Unapproved</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleDelete(rev.id)}
                  className="w-full px-3.5 py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  title="Permanently delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

