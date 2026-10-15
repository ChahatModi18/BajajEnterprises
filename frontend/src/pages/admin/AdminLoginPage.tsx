import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionExpired = location.search.includes('session_expired=true');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      login(res.access_token, {
        email: res.email,
        full_name: res.full_name,
        role: res.role,
      });

      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@bajajenterprises.com');
    setPassword('Admin@Bajaj2026');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Admin Login
          </h1>
          <p className="text-xs text-slate-500">
            Bajaj Enterprises Management Portal • Bikaner
          </p>
        </div>

        {isSessionExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Your admin session expired. Please sign in below to continue.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@bajajenterprises.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Fill Credentials */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-center space-y-1.5">
          <span className="text-slate-500 block text-[11px]">Seeded Administrator Account:</span>
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="font-bold text-emerald-700 hover:text-emerald-800 underline"
          >
            Auto-fill Default Admin Credentials
          </button>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-700">
            &larr; Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
