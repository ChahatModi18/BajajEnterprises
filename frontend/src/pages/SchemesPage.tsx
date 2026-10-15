import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { Scheme } from '../types';
import { apiRequest } from '../utils/api';

export const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const data = await apiRequest<Scheme[]>('/schemes');
        setSchemes(data);
      } catch (err) {
        console.error('Failed to load schemes', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Promotional Schemes & Deals
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Current Schemes & Offers
        </h1>
        <p className="text-sm text-slate-600">
          Official store discounts, seasonal campaigns, and festive bicycle schemes managed directly by Bajaj Enterprises, Bikaner.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Checking active promotional schemes...</p>
        </div>
      ) : schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              {scheme.banner_url && (
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={scheme.banner_url}
                    alt={scheme.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full">
                    Active Scheme
                  </span>
                  {scheme.discount_value && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      {scheme.discount_type === 'PERCENT' ? `${scheme.discount_value}% OFF` : `₹${scheme.discount_value} OFF`}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {scheme.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {scheme.description}
                </p>

                {scheme.eligibility && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <strong>Eligibility:</strong> {scheme.eligibility}
                  </div>
                )}

                {scheme.terms && (
                  <div className="text-xs text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-700">Terms & Conditions:</span>
                    <p className="italic">{scheme.terms}</p>
                  </div>
                )}

                {scheme.end_date && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Valid until: <strong>{new Date(scheme.end_date).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              <div className="p-6 pt-0">
                <Link
                  to="/shop"
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow transition"
                >
                  <span>Explore Eligible Bicycles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Active Promotional Schemes</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no active public discount schemes. Check back during upcoming festive occasions or visit our Kote Gate showroom for everyday competitive retail pricing.
          </p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
          >
            Browse Catalogue
          </Link>
        </div>
      )}
    </div>
  );
};
