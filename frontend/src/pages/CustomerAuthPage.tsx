import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export const CustomerAuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const register = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, loading, signIn, signUp } = useCustomerAuth();
  const navigate = useNavigate();
  if (loading) return <div className="min-h-screen bg-stone-50" />;
  if (user) return <Navigate to="/account" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (register && name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < (register ? 10 : 1)) return setError(register ? 'Use at least 10 characters for a stronger password.' : 'Enter your password.');
    setBusy(true);
    try { register ? await signUp(name.trim(), email.trim(), password) : await signIn(email.trim(), password); navigate('/account'); }
    catch (err) { setError(err instanceof Error ? err.message : 'We could not sign you in. Please try again.'); }
    finally { setBusy(false); }
  };

  return <main className="customer-auth min-h-[calc(100vh-80px)] bg-[#f7f7f4] px-4 py-10 sm:py-16">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_22px_80px_rgba(18,36,30,.12)] md:grid-cols-[1fr_1fr]">
      <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#153d32] p-8 text-white sm:p-11 md:min-h-[620px]">
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full border border-white/10"/><div className="absolute -right-7 top-36 h-48 w-48 rounded-full border border-white/10"/>
        <Link to="/" className="relative flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d1f269] text-[#153d32]"><Bike size={23}/></span><span className="text-sm font-black tracking-wide">BAJAJ <span className="text-[#d1f269]">ENTERPRISES</span></span></Link>
        <div className="relative mt-12 max-w-sm"><div className="mb-5 inline-flex rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#d1f269]">Your next ride starts here</div><h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">Ride into<br/>something <span className="text-[#d1f269]">better.</span></h1><p className="mt-5 max-w-xs text-sm leading-6 text-white/65">A little account makes every visit smoother. Save your favourites and pick up where you left off.</p></div>
        <div className="relative mt-10 flex items-center gap-3 text-xs text-white/55"><span className="h-2 w-2 rounded-full bg-[#d1f269]"/> The ride is yours. We’ll help you find it.</div>
      </section>
      <section className="flex items-center px-6 py-10 sm:px-12 sm:py-14"><div className="mx-auto w-full max-w-sm">
        <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#527a5e]">{register ? 'Join our community' : 'Welcome back'}</p><h2 className="text-3xl font-black tracking-tight text-[#17231e]">{register ? 'Create your account' : 'Sign in to your account'}</h2><p className="mt-2 text-sm text-slate-500">{register ? 'It takes less than a minute.' : 'Your favourites are waiting for you.'}</p></div>
        {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={submit} noValidate className="space-y-4">
          {register && <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Your name</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={80} className="auth-input" placeholder="e.g. Aditi Sharma" aria-label="Your name"/></span>{name.length > 0 && name.trim().length < 2 && <span className="mt-1 block text-xs text-rose-600">Please enter at least 2 characters.</span>}</label>}
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Email address</span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="auth-input" placeholder="you@example.com" aria-label="Email address"/></span>{email.length>0&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&<span className="mt-1 block text-xs text-rose-600">That email address doesn’t look quite right.</span>}</label>
          <label className="block"><span className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700"><span>Password</span>{!register&&<span className="text-[11px] font-medium text-slate-400">Secure sign in</span>}</span><span className="relative block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input type={showPassword?'text':'password'} autoComplete={register?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={register?10:1} maxLength={72} className="auth-input pr-12" placeholder={register?'At least 10 characters':'Enter your password'} aria-label="Password"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span>{register&&password.length>0&&password.length<10&&<span className="mt-1 block text-xs text-rose-600">Use at least 10 characters ({password.length}/10).</span>}</label>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193f33] py-3.5 text-sm font-bold text-white transition hover:bg-[#245b46] disabled:cursor-wait disabled:opacity-60">{busy?(register?'Creating account…':'Signing in…'):(register?'Create account':'Sign in')} {!busy&&<ArrowRight size={17}/>}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">{register?'Already have an account?':'New around here?'} <Link className="font-bold text-[#245b46] hover:underline" to={register?'/login':'/register'}>{register?'Sign in':'Create an account'}</Link></p>
        <p className="mt-7 text-center text-[11px] leading-5 text-slate-400">Your password is encrypted and never stored in plain text.<br/>By continuing, you agree to our <Link to="/policies/privacy" className="underline">privacy policy</Link>.</p>
      </div></section>
    </div>
  </main>;
};
