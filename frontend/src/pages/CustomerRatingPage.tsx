import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, MessageSquare, CheckCircle2, ShieldCheck, 
  Bike, Award, Phone, Mail, User, Send, Filter,
  Sparkles, ThumbsUp, ArrowRight, MapPin, Clock
} from 'lucide-react';
import { Feedback, FeedbackSummary } from '../types';
import { apiRequest } from '../utils/api';
import { useSettings } from '../context/SettingsContext';

const RATING_MOODS: Record<number, { title: string; desc: string; color: string }> = {
  5: {
    title: '5/5 - Exceptional 5-Star Experience! (अत्यंत उत्कृष्ट अनुभव)',
    desc: 'Outstanding showroom service, pricing, and genuine bicycle quality at Bajaj Enterprises.',
    color: 'text-amber-500',
  },
  4: {
    title: '4/5 - Very Good Service (बहुत बढ़िया सेवा व मार्गदर्शन)',
    desc: 'Great customer assistance and prompt guidance on cycle sizing and accessories.',
    color: 'text-emerald-600',
  },
  3: {
    title: '3/5 - Good & Satisfactory (संतोषजनक अनुभव)',
    desc: 'Good collection of AVON & HERCULES bicycles and helpful store staff.',
    color: 'text-blue-600',
  },
  2: {
    title: '2/5 - Fair Experience (सामान्य अनुभव)',
    desc: 'Decent experience with scope for service or stock improvements.',
    color: 'text-orange-500',
  },
  1: {
    title: '1/5 - Needs Improvement (सुधार की आवश्यकता)',
    desc: 'Please let us know how Bajaj Enterprises can improve your experience.',
    color: 'text-rose-500',
  },
};

export const CustomerRatingPage: React.FC = () => {
  const { settings } = useSettings();

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bicycleModel, setBicycleModel] = useState('');
  const [serviceType, setServiceType] = useState('Showroom Purchase');
  const [comment, setComment] = useState('');
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState<Feedback | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Live Ratings Feed States
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [filterStar, setFilterStar] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  // Load reviews from API / localStorage
  const loadReviews = async () => {
    setLoadingFeedbacks(true);
    try {
      const summary = await apiRequest<FeedbackSummary>('/feedback');
      if (summary && Array.isArray(summary.items)) {
        setFeedbacks(summary.items);
      } else {
        const raw = localStorage.getItem('bajaj_feedbacks');
        if (raw) setFeedbacks(JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Could not load feedback summary, reading local storage:', err);
      const raw = localStorage.getItem('bajaj_feedbacks');
      if (raw) setFeedbacks(JSON.parse(raw));
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें (Please enter your name).');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('कृपया अपना अनुभव या समीक्षा कम से कम 5 अक्षरों में लिखें (Please enter a review of at least 5 characters).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      rating,
      comment: comment.trim(),
      bicycle_model: bicycleModel.trim() || undefined,
      service_type: serviceType,
    };

    try {
      const newReview = await apiRequest<Feedback>('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessSubmitted(newReview);
      setFeedbacks((prev) => [newReview, ...prev]);

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setBicycleModel('');
      setComment('');
      setRating(5);

      // Auto scroll to success message
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'समीक्षा सबमिट करने में असमर्थ। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = feedbacks.filter((f) => {
    if (filterStar !== null && f.rating !== filterStar) return false;
    return true;
  });

  const totalReviews = feedbacks.length;
  const avgRating = totalReviews > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1)
    : '4.9';
  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/90 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Customer Reputation & Showroom Ratings • Bikaner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Rate Your Experience with <span className="text-emerald-400">Bajaj Enterprises</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            अपनी साइकिल खरीद, सर्विसिंग व शोरूम अनुभव की समीक्षा दें। Your feedback helps riders across Bikaner find the perfect AVON & HERCULES bicycle!
          </p>

          {/* Quick Stats Overview */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-medium">Average Rating</span>
              <div className="flex items-center gap-1.5 pt-1 text-2xl sm:text-3xl font-black text-amber-400">
                <span>{avgRating}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400">Out of 5.0 Stars</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-medium">Verified Reviews</span>
              <div className="pt-1 text-2xl sm:text-3xl font-black text-white">
                {totalReviews}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{fiveStarCount} 5-Star Ratings</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-medium">Bikaner Showroom</span>
              <div className="pt-1 text-sm sm:text-base font-bold text-white flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kote Gate</span>
              </div>
              <span className="text-[10px] text-slate-400">Alakh Sagar Road</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-medium">Customer Support</span>
              <div className="pt-1 text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Owner Backed</span>
              </div>
              <span className="text-[10px] text-slate-400">Genuine Frames & Spares</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Success Alert Banner */}
        {successSubmitted && (
          <div className="p-6 bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl shadow-xl space-y-2 animate-fade-in text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-black text-white">
                धन्यवाद! {successSubmitted.name}, आपकी रेटिंग सफलतापूर्वक दर्ज हो गई है!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200">
                Your rating and review has been saved in the showroom repository. Store admin will review and feature it on the official homepage!
              </p>
            </div>
            <button
              onClick={() => setSuccessSubmitted(null)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Close
            </button>
          </div>
        )}

        {/* Rating Submission Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-slate-700 pb-6 mb-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Share Your Experience • अपनी समीक्षा दें
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Customer Rating & Review Form
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Please choose a star rating from 1 to 5 and describe your purchase or showroom visit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interactive Star Rating Selector */}
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-700/70 text-center space-y-3">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                Select Your Overall Rating (रेटिंग चुनें) *
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 sm:p-2 transition transform hover:scale-125 active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-600 fill-transparent hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Mood Description */}
              <div className="min-h-[44px] flex flex-col items-center justify-center">
                <span className={`text-sm sm:text-base font-black ${RATING_MOODS[activeRating]?.color || 'text-amber-400'}`}>
                  {RATING_MOODS[activeRating]?.title}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {RATING_MOODS[activeRating]?.desc}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name / ग्राहक का पूरा नाम *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar / अमित शर्मा"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mobile / WhatsApp Number (वैकल्पिक)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 94140 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Bicycle Model / खरीदी गई साइकिल
                </label>
                <div className="relative">
                  <Bike className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. AVON City Star 26T / HERCULES Roadeo"
                    value={bicycleModel}
                    onChange={(e) => setBicycleModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Service / Experience Type (सेवा का प्रकार)
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Showroom Purchase">Showroom Purchase (नई साइकिल खरीद)</option>
                  <option value="Bicycle Service & Tuning">Bicycle Tuning / Free Service (साइकिल सर्विस)</option>
                  <option value="Accessories & Spares">Accessories & Spares (कैरियर, घंटी, ताले आदि)</option>
                  <option value="Showroom Visit & Advice">Showroom Visit & Sizing Advice (दुकान विज़िट)</option>
                </select>
              </div>
            </div>

            {/* Comment / Review Box */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Your Review & Feedback / अपना अनुभव विस्तार से लिखें *
              </label>
              <textarea
                required
                rows={4}
                placeholder="बजाज एंटरप्राइजेज के साथ आपका अनुभव कैसा रहा? (How was the staff behaviour, pricing, frame quality, and warranty support?)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Minimum 5 characters. Authentic customer reviews are showcased directly to the showroom owner.
              </span>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Saved to Bajaj Enterprises showroom database & admin portal.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>{submitting ? 'Submitting Rating...' : 'Submit Customer Rating (रेटिंग सबमिट करें)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Ratings & Testimonials Feed */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Customer Reviews Feed</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {totalReviews} Ratings
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real feedback and ratings submitted by bicycle enthusiasts and families in Bikaner.
              </p>
            </div>

            {/* Star Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterStar(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterStar === null
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                All ({totalReviews})
              </button>
              {[5, 4, 3].map((star) => {
                const count = feedbacks.filter((f) => f.rating === star).length;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterStar(filterStar === star ? null : star)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                      filterStar === star
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3 h-3 ${filterStar === star ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loadingFeedbacks ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-800/40 rounded-2xl border border-slate-800">
              Loading verified reviews...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-slate-800/40 rounded-2xl border border-slate-800">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No reviews found for this star filter</h4>
              <p className="text-xs text-slate-500">Be the first to leave a review above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-5 bg-slate-800/80 border rounded-2xl flex flex-col justify-between space-y-4 transition hover:-translate-y-1 shadow-md ${
                    rev.is_featured
                      ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                      : 'border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Stars & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      {rev.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Customer Info & Tags */}
                  <div className="pt-3 border-t border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-emerald-400" />
                        <span>{rev.name}</span>
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 font-semibold border border-slate-700/50">
                        {rev.service_type || 'Showroom Purchase'}
                      </span>
                      {rev.bicycle_model && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <Bike className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{rev.bicycle_model}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CustomerRatingPage;
