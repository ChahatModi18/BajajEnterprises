import React, { useState } from 'react';
import { Star, X, Check, Heart, MessageSquare, Bike, ThumbsUp, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Feedback } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (feedback: Feedback) => void;
  bicycleName?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good & Satisfactory',
  4: 'Very Good Service',
  5: 'Exceptional 5-Star Experience!'
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
  bicycleName = '',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bicycleModel, setBicycleModel] = useState(bicycleName);
  const [serviceType, setServiceType] = useState('Showroom Purchase');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (bicycleName) setBicycleModel(bicycleName);
  }, [bicycleName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please provide a brief comment or review (min 5 characters).');
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
      honeypot: honeypot || undefined,
    };

    try {
      const res = await apiRequest<Feedback>('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted(res);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setName('');
        setComment('');
        setPhone('');
        setEmail('');
      }, 2600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Rate & Share Feedback</h3>
              <p className="text-xs text-slate-400">Bajaj Enterprises, Kote Gate, Bikaner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Dhanyawaad! Thank You!</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your rating and review has been received. Your honest feedback helps fellow cyclists across Rajasthan make the right choice!
              </p>
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-400 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Honeypot for spam bots */}
            <input
              type="text"
              name="honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Star Rating Selector */}
            <div className="text-center py-2 space-y-1.5 bg-slate-800/40 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                How was your experience?
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = (hoverRating !== null ? hoverRating : rating) >= s;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 focus:outline-none transition transform hover:scale-125"
                      title={`${s} Stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-amber-400 transition">
                {RATING_LABELS[hoverRating !== null ? hoverRating : rating]}
              </p>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rameshwar Gehlot"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contact / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94141 XXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Bicycle Model & Service Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bicycle Model (Optional)
                </label>
                <input
                  type="text"
                  value={bicycleModel}
                  onChange={(e) => setBicycleModel(e.target.value)}
                  placeholder="e.g. AVON City Star or Hercules Roadeo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Experience Category
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition"
                >
                  <option value="Showroom Purchase">Showroom Bicycle Purchase</option>
                  <option value="Tuning & Service">Mechanical Tuning & Service</option>
                  <option value="Kids / Youth Bicycle">Kids / School Bicycle</option>
                  <option value="Accessories & Spares">Accessories & Spares</option>
                  <option value="General Store Visit">General Store Visit</option>
                </select>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Review / Showroom Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding customer service, bicycle tuning, pricing, or showroom collection..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{submitting ? 'Submitting Review...' : 'Submit Rating & Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

