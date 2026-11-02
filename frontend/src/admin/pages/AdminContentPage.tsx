import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  FileEdit, Save, Check, HelpCircle, Eye, 
  Home, Info, PhoneCall, ShieldAlert, Share2, Sparkles, AlertCircle 
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useHelp } from '../../context/HelpContext';

export const AdminContentPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { refreshSettings } = useSettings();
  const { isHelpMode } = useHelp();
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'contact' | 'policies' | 'social'>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<StoreSettings>({
    store_name: 'Bajaj Enterprises',
    store_address: 'Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India',
    store_phone: '',
    store_whatsapp: '',
    store_email: '',
    opening_hours: '10:00 AM - 08:30 PM (Mon-Sat)',
    google_maps_url: '',
    instagram_url: '',
    facebook_url: '',
    currency_symbol: '₹',
    announcement_text: '',
    homepage_hero_title: '',
    homepage_hero_subtitle: '',
    homepage_hero_cta: '',
    homepage_trust_badge_1_title: '',
    homepage_trust_badge_1_desc: '',
    homepage_trust_badge_2_title: '',
    homepage_trust_badge_2_desc: '',
    homepage_trust_badge_3_title: '',
    homepage_trust_badge_3_desc: '',
    homepage_trust_badge_4_title: '',
    homepage_trust_badge_4_desc: '',
    about_title: '',
    about_intro: '',
    about_mission: '',
    about_experience: '',
    contact_intro: '',
    contact_response_time: '',
    policy_privacy: '',
    policy_terms: '',
    policy_returns: '',
    policy_warranty: '',
    policy_delivery: '',
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await apiRequest<StoreSettings>('/admin/settings');
        setFormData(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Failed to load content settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await refreshSettings();
      setSuccessMsg('Website content updated successfully! Changes are live on your website.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading website content editor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileEdit className="w-6 h-6 text-emerald-600" />
            <span>Website Content & Pages (वेबसाइट सामग्री संपादक)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Change any headline, description, about section, policy or contact text across Bajaj Enterprises website.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Live Website (लाइव देखें)</span>
        </a>
      </div>

      {/* Help Banner for Non-Tech Store Owner */}
      {isHelpMode && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">
              💡 Non-Tech Owner Guide (सरल मार्गदर्शन):
            </strong>
            <p>
              यहाँ से आप अपनी वेबसाइट के हर हिस्से की भाषा और संदेश अपनी पसंद अनुसार बदल सकते हैं। 
              जो भी आप इन बॉक्स में लिखेंगे, वह तुरंत आपकी वेबसाइट पर दिखने लगेगा। 
              लिखने के बाद नीचे <strong>"Save Content (बदलाव सुरक्षित करें)"</strong> बटन पर क्लिक करना न भूलें!
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'home'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>1. Homepage (होमपेज)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'about'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>2. About Us (दुकान के बारे में)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'contact'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>3. Contact & Store (संपर्क एवं पता)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'policies'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>4. Policies & Terms (नियम व शर्तें)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'social'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>5. Social Links (सोशल मीडिया)</span>
        </button>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* TAB 1: HOMEPAGE CONTENT */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Homepage Main Sections (होमपेज का मुख्य हिस्सा)</h3>
              <p className="text-xs text-slate-500">Edit the top announcement message, hero banner text, and trust guarantee cards.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Top Announcement Bar Notice (वेबसाइट के सबसे ऊपर दिखने वाला संदेश)
              </label>
              {isHelpMode && (
                <span className="block text-[11px] text-slate-500 mb-1.5">
                  उदाहरण: "बजाज एंटरप्राइजेज में आपका स्वागत है — नई साइकिलों व स्पेयर पार्ट्स के लिए कोट गेट पधारें!"
                </span>
              )}
              <input
                type="text"
                name="announcement_text"
                value={formData.announcement_text || ''}
                onChange={handleChange}
                placeholder="e.g. Welcome to Bajaj Enterprises — Quality Bicycles at Kote Gate, Bikaner!"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Hero Main Headline (बड़ा मुख्य शीर्षक)
                </label>
                <input
                  type="text"
                  name="homepage_hero_title"
                  value={formData.homepage_hero_title || ''}
                  onChange={handleChange}
                  placeholder="e.g. Discover Quality Bicycles in Bikaner"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Hero Button Label (बटन का नाम)
                </label>
                <input
                  type="text"
                  name="homepage_hero_cta"
                  value={formData.homepage_hero_cta || ''}
                  onChange={handleChange}
                  placeholder="e.g. Browse All Bicycles"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Hero Subtitle / Description (शीर्षक के नीचे का विवरण)
              </label>
              <textarea
                rows={2}
                name="homepage_hero_subtitle"
                value={formData.homepage_hero_subtitle || ''}
                onChange={handleChange}
                placeholder="e.g. Explore our curated collection of AVON, HERCULES, commuter, geared and kids bicycles with dependable local service."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                "Why Shop with Bajaj Enterprises" — 4 Trust Cards (4 भरोसे के कार्ड)
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                These four cards appear directly below the main banner on the homepage to assure customers of your quality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-emerald-700 text-xs block">Card 1: Genuine Brands</span>
                  <input
                    type="text"
                    name="homepage_trust_badge_1_title"
                    value={formData.homepage_trust_badge_1_title || ''}
                    onChange={handleChange}
                    placeholder="Title: e.g. Genuine Bicycle Brands"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    name="homepage_trust_badge_1_desc"
                    value={formData.homepage_trust_badge_1_desc || ''}
                    onChange={handleChange}
                    placeholder="Description: e.g. Authorised partner for AVON, HERCULES"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                  />
                </div>

                {/* Card 2 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-blue-700 text-xs block">Card 2: Assembly & Tuning</span>
                  <input
                    type="text"
                    name="homepage_trust_badge_2_title"
                    value={formData.homepage_trust_badge_2_title || ''}
                    onChange={handleChange}
                    placeholder="Title: e.g. Full Assembly & Tuning"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    name="homepage_trust_badge_2_desc"
                    value={formData.homepage_trust_badge_2_desc || ''}
                    onChange={handleChange}
                    placeholder="Description: e.g. Assembled and tuned before delivery"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                  />
                </div>

                {/* Card 3 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-amber-700 text-xs block">Card 3: Honest Pricing</span>
                  <input
                    type="text"
                    name="homepage_trust_badge_3_title"
                    value={formData.homepage_trust_badge_3_title || ''}
                    onChange={handleChange}
                    placeholder="Title: e.g. Clear & Honest Pricing"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    name="homepage_trust_badge_3_desc"
                    value={formData.homepage_trust_badge_3_desc || ''}
                    onChange={handleChange}
                    placeholder="Description: e.g. Transparent rates & helpful advice"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                  />
                </div>

                {/* Card 4 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-purple-700 text-xs block">Card 4: Store Pickup & Support</span>
                  <input
                    type="text"
                    name="homepage_trust_badge_4_title"
                    value={formData.homepage_trust_badge_4_title || ''}
                    onChange={handleChange}
                    placeholder="Title: e.g. Convenient Store Pickup"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    name="homepage_trust_badge_4_desc"
                    value={formData.homepage_trust_badge_4_desc || ''}
                    onChange={handleChange}
                    placeholder="Description: e.g. Alakh Sagar Road showroom in Bikaner"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABOUT US PAGE */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">About Us Page Content (दुकान का परिचय)</h3>
              <p className="text-xs text-slate-500">Edit the profile, background story, and customer promise of Bajaj Enterprises.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                About Page Main Headline (पेज का मुख्य शीर्षक)
              </label>
              <input
                type="text"
                name="about_title"
                value={formData.about_title || ''}
                onChange={handleChange}
                placeholder="e.g. Bajaj Enterprises — Your Trusted Bicycle Destination in Bikaner"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Showroom Story & Background (दुकान का विवरण व परिचय)
              </label>
              {isHelpMode && (
                <span className="block text-[11px] text-slate-500 mb-1.5">
                  यहाँ अपनी दुकान, उपलब्ध ब्रांड्स (Avon, Hercules आदि) और बीकानेर के ग्राहकों के लिए अपने अनुभव के बारे में लिखें।
                </span>
              )}
              <textarea
                rows={4}
                name="about_intro"
                value={formData.about_intro || ''}
                onChange={handleChange}
                placeholder="Describe your bicycle showroom, history, and commitment to genuine cycles..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Mission Statement (हमारा उद्देश्य / लक्ष्य)
              </label>
              <textarea
                rows={3}
                name="about_mission"
                value={formData.about_mission || ''}
                onChange={handleChange}
                placeholder="e.g. Our mission is to support healthy, active, and accessible cycling for commuters, students, and families..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Showroom Experience & Services (दुकान की सुविधाएं)
              </label>
              <textarea
                rows={3}
                name="about_experience"
                value={formData.about_experience || ''}
                onChange={handleChange}
                placeholder="e.g. Visit our showroom to inspect bicycles in person, consult with our friendly team..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT & STORE */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Contact Details & Showroom (संपर्क एवं पता)</h3>
              <p className="text-xs text-slate-500">Update phone, WhatsApp, opening hours, address, and Google Maps directions link.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Business Name (व्यापारिक नाम)
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Showroom Opening Hours (दुकान खुलने का समय)
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours || ''}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM - 08:30 PM (Mon-Sat)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Showroom Address (दुकान का पूरा पता)
              </label>
              <input
                type="text"
                name="store_address"
                value={formData.store_address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Phone Number (फोन नंबर)
                </label>
                <input
                  type="text"
                  name="store_phone"
                  value={formData.store_phone || ''}
                  onChange={handleChange}
                  placeholder="e.g. +91 98290 XXXXX"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  WhatsApp Number (व्हाट्सएप नंबर)
                </label>
                <input
                  type="text"
                  name="store_whatsapp"
                  value={formData.store_whatsapp || ''}
                  onChange={handleChange}
                  placeholder="e.g. +91 98290 XXXXX"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Store Email (ईमेल)
                </label>
                <input
                  type="email"
                  name="store_email"
                  value={formData.store_email || ''}
                  onChange={handleChange}
                  placeholder="e.g. bajajenterprises.bikaner@gmail.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Google Maps Directions Link (गूगल मैप्स लिंक)
                </label>
                <input
                  type="url"
                  name="google_maps_url"
                  value={formData.google_maps_url || ''}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Customer Reply Time Notice (जवाब देने का वादा)
                </label>
                <input
                  type="text"
                  name="contact_response_time"
                  value={formData.contact_response_time || ''}
                  onChange={handleChange}
                  placeholder="e.g. We usually respond within 24 business hours."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: POLICIES & TERMS */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Policies & Support Guidelines (दुकान के नियम व शर्तें)</h3>
              <p className="text-xs text-slate-500">Edit the text for warranty, returns, privacy, terms, and store pickup.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Warranty Information Policy (वारंटी की शर्तें)
              </label>
              {isHelpMode && (
                <span className="block text-[11px] text-slate-500 mb-1.5">
                  यहाँ लिखें कि AVON व HERCULES साइकिलों पर कंपनी की ओर से क्या वारंटी मिलती है और ग्राहक कैसे क्लेम कर सकते हैं।
                </span>
              )}
              <textarea
                rows={3}
                name="policy_warranty"
                value={formData.policy_warranty || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Store Pickup & Delivery Guidelines (साइकिल डिलीवरी व पिकअप नियम)
              </label>
              <textarea
                rows={3}
                name="policy_delivery"
                value={formData.policy_delivery || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Returns & Cancellations Policy (वापसी व कैंसलेशन नियम)
              </label>
              <textarea
                rows={3}
                name="policy_returns"
                value={formData.policy_returns || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Terms of Use (वेबसाइट उपयोग के नियम)
              </label>
              <textarea
                rows={3}
                name="policy_terms"
                value={formData.policy_terms || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Privacy Notice (गोपनीयता नीति)
              </label>
              <textarea
                rows={3}
                name="policy_privacy"
                value={formData.policy_privacy || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 5: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Social Media & Currency (सोशल मीडिया)</h3>
              <p className="text-xs text-slate-500">Configure official social media links and currency symbol.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Instagram Profile Link
                </label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/bajajenterprises"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">
                  Facebook Page Link
                </label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/bajajenterprises"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Currency Symbol (मुद्रा चिह्न)
              </label>
              <input
                type="text"
                name="currency_symbol"
                value={formData.currency_symbol || '₹'}
                onChange={handleChange}
                className="w-32 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Submit Button Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>All text changes update instantly across Bajaj Enterprises website.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Content (बदलाव सुरक्षित करें)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
