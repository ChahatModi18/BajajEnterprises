import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ExternalLink, Shield } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                BAJAJ <span className="text-emerald-400">ENTERPRISES</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Authorized bicycle retail dealership in Bikaner. Offering genuine AVON, HERCULES and multi-category bicycles, specifications, and owner-backed support.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{settings.store_address}</span>
              </div>
              {settings.store_phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <a href={`tel:${settings.store_phone}`} className="hover:text-white transition">
                    {settings.store_phone}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 italic">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>Phone: (Store number placeholder)</span>
                </div>
              )}
              {settings.store_email ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <a href={`mailto:${settings.store_email}`} className="hover:text-white transition">
                    {settings.store_email}
                  </a>
                </div>
              ) : null}
              {settings.opening_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{settings.opening_hours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Catalogue Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Bicycle Catalogue
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/brand/avon" className="hover:text-emerald-400 transition">AVON Cycles</Link></li>
              <li><Link to="/brand/hercules" className="hover:text-emerald-400 transition">HERCULES Bicycles</Link></li>
              <li><Link to="/category/city-bicycle" className="hover:text-emerald-400 transition">City & Commuter Bicycles</Link></li>
              <li><Link to="/category/geared-bicycle" className="hover:text-emerald-400 transition">Geared & Multi-speed Bicycles</Link></li>
              <li><Link to="/category/kids-bicycles" className="hover:text-emerald-400 transition">Kids' & Junior Cycles</Link></li>
              <li><Link to="/category/mountain-bicycles" className="hover:text-emerald-400 transition">Mountain Bicycles (MTB)</Link></li>
              <li><Link to="/shop" className="hover:text-emerald-400 transition font-semibold text-emerald-400">All Bicycles &rarr;</Link></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Store Support & Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition">About Bajaj Enterprises</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Store Location & Directions</Link></li>
              <li><Link to="/schemes" className="hover:text-emerald-400 transition">Current Schemes & Offers</Link></li>
              <li><Link to="/policies/warranty" className="hover:text-emerald-400 transition">Warranty & Service Policy</Link></li>
              <li><Link to="/policies/returns" className="hover:text-emerald-400 transition">Returns & Cancellations</Link></li>
              <li><Link to="/policies/shipping" className="hover:text-emerald-400 transition">Store Pickup & Delivery</Link></li>
              <li><Link to="/policies/privacy" className="hover:text-emerald-400 transition">Privacy Notice</Link></li>
              <li><Link to="/policies/terms" className="hover:text-emerald-400 transition">Terms of Use</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-400 transition">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Visit & Directions */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Visit Showroom
            </h4>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 mb-4 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-white mb-1">Bajaj Enterprises Bikaner</p>
              <p>Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India.</p>
              <div className="mt-3">
                <a
                  href={settings.google_maps_url || "https://maps.google.com/?q=Alakh+Sagar+Road+Kote+Gate+Bikaner+Rajasthan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Link
                to="/admin"
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Authorized Owner Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Bajaj Enterprises. All rights reserved. Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan.
          </p>
          <p className="text-slate-400 text-center sm:text-right">
            Independent retail bicycle dealership. AVON and HERCULES are trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};
