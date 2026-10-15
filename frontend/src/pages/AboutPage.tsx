import React from 'react';
import { MapPin, ShieldCheck, Wrench, Phone, Store, Award } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Retail Dealership Profile
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {settings.about_title || 'About Bajaj Enterprises'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {settings.about_intro || 'Authorized bicycle retailer located on Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan, serving city commuters, fitness enthusiasts, and families.'}
        </p>
      </div>

      {/* Main Profile Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-600 pl-3">
            Our Business Overview
          </h2>
          <p>
            {settings.about_intro || 'Bajaj Enterprises operates an independent bicycle dealership situated in the bustling commercial hub of Kote Gate on Alakh Sagar Road in Bikaner. We supply customers with authentic, brand-new cycles from celebrated Indian bicycle brands including AVON and HERCULES, with a catalogue spanning kids cycles, city commuters, multi-speed geared models, and mountain bicycles.'}
          </p>
        </div>

        {settings.about_mission && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-600 pl-3">
              Our Mission & Customer Commitment
            </h2>
            <p>{settings.about_mission}</p>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-600 pl-3">
            Showroom Location & Verified Premises
          </h2>
          <p>
            {settings.about_experience || `Our physical store is situated on ${settings.store_address || 'Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001'}. Customers can inspect bicycle frames, verify rider fit and saddle height, test gear shifts, and receive their bicycles pre-tuned and ready for immediate riding.`}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-600 pl-3">
            Core Retail Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Authorised Bicycle Sales</span>
              </h4>
              <p className="text-xs text-slate-600">
                Direct authorized retail of commuter, road, mountain, geared, and kids' bicycles.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Showroom Assembly & Tuning</span>
              </h4>
              <p className="text-xs text-slate-600">
                Brake calibration, gear indexing, tyre pressure checks, and handlebar alignment before delivery.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Warranty Facilitation</span>
              </h4>
              <p className="text-xs text-slate-600">
                Direct coordination with manufacturers for verified frame and component warranty terms.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Genuine Spares & Accessories</span>
              </h4>
              <p className="text-xs text-slate-600">
                Bicycle bells, locks, helmets, water cages, replacement tubes, and wear-and-tear spares.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p>
            <em>* Notice: Business credentials, founding archives, historical milestones, and specific operating hours are kept editable via store administration. Unverified claims or fabricated histories are strictly avoided.</em>
          </p>
        </div>
      </div>
    </div>
  );
};
