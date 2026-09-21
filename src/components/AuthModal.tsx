import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetAll = () => {
    setEmail('');
    setName('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setErrorMsg(null);
    setStep('form');
  };

  useEffect(() => {
    if (!isOpen) {
      resetAll();
    } else {
      setAuthMode(initialMode);
    }
  }, [isOpen, initialMode]);

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
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    const res = await supabaseRegister(email.trim(), password, name.trim(), phone.trim());
    setLoading(false);
    if (res.success && res.user) {
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

  const inputBase = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F251C]/20 focus:border-[#0F251C] transition-colors";
  const labelBase = "block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D5] flex flex-col md:flex-row my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-stone-100/80 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-stone-600" />
        </button>

        {/* LEFT SIDE: Minimal Mayflower Screen */}
        <div className="md:w-5/12 bg-[#0F251C] p-8 sm:p-12 text-white flex flex-col items-center justify-center text-center">
          {/* Authentic Mayflower Logo Card */}
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] flex items-center justify-center shadow-md mb-5 p-2 border border-[#C5A880]/30">
            <img
              src="/mayflower-emblem-icon.png"
              alt="The Mayflower"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          {/* Subtitle / Brand */}
          <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#C5A880] mb-2 block">
            THE MAYFLOWER
          </span>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF7F2] leading-tight mb-5 max-w-[240px]">
            Fine dining and private salons
          </h2>

          {/* Subtle gold line */}
          <div className="w-12 h-[1px] bg-[#C5A880]/60 mb-5" />

          {/* Italic caption */}
          <p className="font-serif italic text-xs sm:text-sm text-stone-300/90 leading-relaxed max-w-[220px]">
            Sign in to explore your sanctuary of privileges.
          </p>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="md:w-7/12 p-6 sm:p-10 bg-[#FAF7F2] flex flex-col justify-center">
          {/* Mode Switcher Tabs (Sign in / Register) */}
          {step === 'form' && (
            <div className="bg-[#EAE4D9] p-1 rounded-xl inline-flex self-start mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`text-xs font-semibold px-5 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                className={`text-xs font-semibold px-5 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Form Title & Subtitle */}
          <div className="mb-6">
            {step === 'otp' ? (
              <>
                <h3 className="text-2xl font-serif font-bold text-[#0F251C] leading-tight">Verify Your Email</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Please enter the 6-digit confirmation code dispatched to <span className="text-[#0F251C] font-semibold">{email}</span>
                </p>
              </>
            ) : authMode === 'login' ? (
              <>
                <h3 className="text-2xl font-serif font-bold text-[#0F251C] leading-tight">Welcome back</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Sign in to access your sanctuary reservations and dashboard.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-serif font-bold text-[#0F251C] leading-tight">Register sanctuary account</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Join Mayflower to unlock patron benefits and earn loyalty stars.
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className={labelBase}>6-Digit Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="e.g. 482910"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={inputBase + " tracking-[0.35em] text-center font-bold text-base"}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0F251C] hover:bg-[#16382B] text-[#DFC993] hover:text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-md disabled:opacity-60"
              >
                {loading ? 'Verifying...' : <><CheckCircle2 className="w-4 h-4 inline-block mr-1.5" /> Verify &amp; Continue</>}
              </button>
              <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1 text-[#0F251C] font-semibold disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setErrorMsg(null); }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer mt-2"
              >
                ← Back to {authMode === 'register' ? 'registration' : 'sign in'}
              </button>
            </form>
          )}

          {/* Login Form */}
          {step === 'form' && authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelBase}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputBase}
                  autoFocus
                />
              </div>

              <div>
                <label className={labelBase}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputBase + " pr-9"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0F251C] hover:bg-[#16382B] text-[#DFC993] hover:text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-md disabled:opacity-60 mt-2"
              >
                {loading ? 'Signing In...' : 'SIGN IN'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {step === 'form' && authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className={labelBase}>FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputBase}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelBase}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>CONTACT NUMBER</label>
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelBase}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={inputBase + " pr-9"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>CONFIRM PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={inputBase + " pr-9"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0F251C] hover:bg-[#16382B] text-[#DFC993] hover:text-white text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shadow-md disabled:opacity-60 mt-2"
              >
                {loading ? 'Creating Account...' : 'COMPLETE REGISTRATION'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

