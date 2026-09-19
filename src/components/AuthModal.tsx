import React, { useState, useEffect } from 'react';
import {
  X, Mail, ArrowRight, CheckCircle2, User, LogIn, UserPlus,
  Eye, EyeOff, Lock, Phone, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabaseLogin, supabaseRegister } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

type AuthStep = 'form' | 'otp';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, onLoginSuccess, initialMode = 'register'
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>(initialMode);
  const [step, setStep] = useState<AuthStep>('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetAll = () => {
    setEmail(''); setName(''); setPhone(''); setPassword('');
    setOtp(''); setErrorMsg(null); setStep('form');
  };

  useEffect(() => {
    if (!isOpen) { resetAll(); }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await supabaseLogin(email.trim(), password);
    setLoading(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else if (res.message && /confirm|verification|unverified/i.test(res.message)) {
      setStep('otp');
      setResendCooldown(60);
    } else {
      setErrorMsg(res.message || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const res = await supabaseRegister(email.trim(), password, name.trim());
    setLoading(false);
    if (res.success && res.user) {
      // Check if email confirmation is pending (message contains hint)
      if (res.message && /confirm|otp|inbox/i.test(res.message)) {
        setStep('otp');
        setResendCooldown(60);
      } else {
        onLoginSuccess(res.user);
        onClose();
      }
    } else {
      if (res.message?.includes('already registered')) {
        setAuthMode('login');
        setErrorMsg('This email is already registered. Please sign in.');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'signup',
      });
      setLoading(false);
      if (error || !data.user) {
        setErrorMsg(error?.message || 'Invalid or expired code.');
        return;
      }
      // Re-login to get full profile
      const res = await supabaseLogin(email.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg('Verified! Please sign in with your credentials.');
        setStep('form');
        setAuthMode('login');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Verification failed.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
    } catch {}
    setLoading(false);
    setResendCooldown(60);
    setErrorMsg(null);
  };

  const inputBase = "w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D5] bg-white text-sm text-[#1A1A1A] placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1E3932]/30 focus:border-[#1E3932] transition-colors";
  const labelBase = "block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D5]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>

        {/* Hero Banner */}
        <div className="relative bg-[#1E3932] px-8 pt-8 pb-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #C5A880 0%, transparent 60%)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center">
                <span className="text-[#C5A880] font-bold text-sm">M</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C5A880]/70">Mayflower Sanctuary</span>
            </div>
            {step === 'otp' ? (
              <>
                <h2 className="text-2xl font-semibold text-white leading-tight">Verify Your Email</h2>
                <p className="text-sm text-stone-300 mt-1">
                  We sent a 6-digit code to <span className="text-[#C5A880] font-medium">{email}</span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white leading-tight">
                  {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-stone-300 mt-1">
                  {authMode === 'register'
                    ? 'Join Mayflower and start earning rewards.'
                    : 'Sign in to access your reservations and dashboard.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mode Tabs (only on form step) */}
        {step === 'form' && (
          <div className="flex bg-[#F0EBE3] p-1 mx-6 mt-5 rounded-xl">
            {(['register', 'login'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { setAuthMode(mode); setErrorMsg(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === mode
                    ? 'bg-white text-[#1E3932] shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {mode === 'register' ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                {mode === 'register' ? 'Register' : 'Sign In'}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          {/* Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className={labelBase}>6-Digit Verification Code</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="e.g. 482910"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={inputBase + " tracking-[0.4em] text-center font-bold text-lg"}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1E3932] hover:bg-[#152d26] text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : <><CheckCircle2 className="w-4 h-4" /> Verify & Continue</>}
              </button>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1 text-[#1E3932] font-semibold disabled:text-stone-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setErrorMsg(null); }}
                className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                ← Back to {authMode === 'register' ? 'registration' : 'sign in'}
              </button>
            </form>
          )}

          {/* Login Form */}
          {step === 'form' && authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelBase}>Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="email" required placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className={inputBase} autoFocus />
                </div>
              </div>
              <div>
                <label className={labelBase}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputBase + " pr-10"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-300 hover:text-stone-500 cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1E3932] hover:bg-[#152d26] text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Signing In...' : <><LogIn className="w-4 h-4" /> Sign In<ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {step === 'form' && authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelBase}>Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input type="email" required placeholder="you@example.com" value={email}
                      onChange={e => setEmail(e.target.value)} className={inputBase} autoFocus />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input type="text" placeholder="Your name" value={name}
                      onChange={e => setName(e.target.value)} className={inputBase} />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Phone (optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input type="tel" placeholder="+91 98400..." value={phone}
                      onChange={e => setPhone(e.target.value)} className={inputBase} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelBase}>Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-300 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      placeholder="Min. 6 characters" value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={inputBase + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-300 hover:text-stone-500 cursor-pointer">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1E3932] hover:bg-[#152d26] text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Creating Account...' : <><UserPlus className="w-4 h-4" /> Create Account</>}
              </button>
            </form>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-stone-300">
            By continuing you agree to Mayflower's{' '}
            <span className="text-stone-400 underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-stone-400 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};
