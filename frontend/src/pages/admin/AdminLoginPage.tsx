import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, KeyRound, Smartphone, Check, HelpCircle, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Forgot Password / Mobile OTP Reset State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetMobile, setResetMobile] = useState('9414138662');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionExpired = location.search.includes('session_expired=true');

  if (isAuthenticated && user?.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const role = (res.role || res.user?.role || 'ADMIN').toUpperCase();
      const userEmail = res.email || res.user?.email || email.trim() || 'admin@bajajenterprises.com';
      const fullName = res.full_name || res.user?.full_name || 'Store Owner';

      login(res.access_token, {
        email: userEmail,
        full_name: fullName,
        role: role,
      });

      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpMsg(null);
    setErrorMsg(null);

    try {
      const res: any = await apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile: resetMobile.trim(), email: email.trim() || 'admin@bajajenterprises.com' }),
      });

      setOtpSent(true);
      setDevOtpHint(res.dev_otp || '123456');
      setOtpMsg(res.message || 'OTP sent successfully to registered mobile number.');
    } catch (err: any) {
      setOtpMsg(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setOtpMsg('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setOtpMsg('Password must be at least 6 characters long.');
      return;
    }

    setOtpLoading(true);
    setOtpMsg(null);

    try {
      const res: any = await apiRequest('/auth/reset-password-otp', {
        method: 'POST',
        body: JSON.stringify({
          mobile: resetMobile.trim(),
          otp: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      setSuccessMsg(res.message || 'Password reset successful! Please sign in with your new password.');
      setPassword(newPassword);
      setEmail('admin@bajajenterprises.com');
      setForgotModalOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setOtpMsg(err.message || 'Failed to reset password. Please check the OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@bajajenterprises.com');
    const customPass = localStorage.getItem('bajaj_custom_admin_password');
    setPassword(customPass || 'Admin@Bajaj2026');
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

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Hint Banner */}
        {showHint && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Password Hint (First-Time Setup):</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Default password pattern: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">Admin@Bajaj2026</code> (Capital 'A', '@' symbol, year 2026). If you reset it via mobile OTP below, enter your newly chosen password.
            </p>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Secure Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
              >
                Forgot Password / OTP Reset?
              </button>
            </div>
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

        {/* Quick Tools & Hint Footer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="font-bold text-emerald-700 hover:text-emerald-800 underline text-[11px]"
            >
              Auto-fill Credentials
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="font-bold text-slate-600 hover:text-slate-800 text-[11px] flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-slate-400" />
              <span>{showHint ? 'Hide Hint' : 'Show Password Hint'}</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-700">
            &larr; Back to Public Storefront
          </Link>
        </div>
      </div>

      {/* Forgot Password via Mobile OTP Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setOtpSent(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Reset Password via Mobile OTP
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bajaj Enterprises Showroom Admin Recovery
                </p>
              </div>
            </div>

            {otpMsg && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs rounded-xl text-slate-700">
                {otpMsg}
              </div>
            )}

            {devOtpHint && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs rounded-xl text-emerald-900">
                <strong>📲 Mobile OTP:</strong> <code className="font-bold text-sm bg-emerald-100 px-1.5 py-0.5 rounded">{devOtpHint}</code>
                <span className="block text-[10px] text-emerald-700 mt-0.5">(Valid for 10 minutes on registered mobile)</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Registered Admin Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94141 38662"
                    value={resetMobile}
                    onChange={(e) => setResetMobile(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Enter the showroom registered phone number (+91 94141 38662).
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{otpLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-center text-lg tracking-widest font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    {otpLoading ? 'Verifying...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
