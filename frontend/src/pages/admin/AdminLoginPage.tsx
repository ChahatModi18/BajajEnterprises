import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  KeyRound, 
  Smartphone, 
  Check, 
  HelpCircle, 
  X, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('bajaj_custom_admin_email') || 'admin@bajajenterprises.com';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Forgot Password / OTP Verification State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(() => {
    return localStorage.getItem('bajaj_custom_admin_email') || 'admin@bajajenterprises.com';
  });
  const [resetMobile, setResetMobile] = useState('9414138662');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setErrorMsg(err.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setOtpMsg('Please enter a valid administrator email address for verification.');
      return;
    }
    setOtpLoading(true);
    setOtpMsg(null);
    setErrorMsg(null);

    try {
      const res: any = await apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          mobile: resetMobile.trim(), 
          email: resetEmail.trim() 
        }),
      });

      setOtpSent(true);
      setDevOtpHint(res.dev_otp || '4829');
      setOtpMsg(res.message || `4-digit OTP sent to SMS and shared to ${resetEmail.trim()}`);
    } catch (err: any) {
      setOtpMsg(err.message || 'Failed to generate verification OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 4) {
      setOtpMsg('Please enter the 4-digit verification OTP code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpMsg('New password and confirmation password do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setOtpMsg('Password must be at least 8 characters long.');
      return;
    }

    setOtpLoading(true);
    setOtpMsg(null);

    try {
      const res: any = await apiRequest('/auth/reset-password-otp', {
        method: 'POST',
        body: JSON.stringify({
          mobile: resetMobile.trim(),
          email: resetEmail.trim(),
          otp: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      setSuccessMsg(res.message || 'Password reset & email verified successfully! You can now sign in.');
      setPassword(newPassword);
      setEmail(resetEmail.trim());
      setForgotModalOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setOtpMsg(err.message || 'Failed to reset password. Please check the 4-digit OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    const verifiedEmail = localStorage.getItem('bajaj_custom_admin_email') || 'admin@bajajenterprises.com';
    setEmail(verifiedEmail);
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
              Default password: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">Admin@Bajaj2026</code>. If you verified your email & reset password via 4-digit OTP, use your updated credentials.
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
                onClick={() => {
                  setResetEmail(email.trim() || 'admin@bajajenterprises.com');
                  setForgotModalOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
              >
                Forgot Password / OTP Reset?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
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
              Fill Admin Credentials
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

      {/* Forgot Password via 4-Digit SMS & Email Verification OTP Modal */}
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
                  Admin Verification & Password Reset
                </h3>
                <p className="text-[11px] text-slate-500">
                  4-Digit OTP Verification for Showroom Admin
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
                <strong>📲 4-Digit OTP Code:</strong> <code className="font-bold text-base bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 ml-1.5">{devOtpHint}</code>
                <span className="block text-[10px] text-emerald-700 mt-0.5">Dispatched to SMS & shared to admin email address ({resetEmail})</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Actual Admin Email Address (ईमेल सत्यापन) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Enter the admin email to verify. 4-digit OTP will be shared to this email and verified for future logins.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Registered Admin Phone Number (SMS) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 94141 38662"
                      value={resetMobile}
                      onChange={(e) => setResetMobile(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Showroom phone number (+91 94141 38662) for dual-channel verification.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{otpLoading ? 'Generating 4-Digit OTP...' : 'Send 4-Digit Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enter 4-Digit Verification OTP (4 अंकों का ओटीपी)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    pattern="^[0-9]{4}$"
                    placeholder="4-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center text-xl tracking-widest font-mono font-black focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                    Enter the 4-digit code generated and shared to {resetEmail}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Secure Password (नया पासवर्ड)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      minLength={8}
                      maxLength={72}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password (पासवर्ड पुष्टि)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={72}
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Change Email/Phone
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
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
