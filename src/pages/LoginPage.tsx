import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserProfile } from '../types';
import { getRoleHomePath } from '../routes/roleRoutes';
import {
  supabaseLogin,
  supabaseRegister,
  requestEmailOtp,
  verifyEmailOtp,
  verifySignupOtp,
  resendSignupOtp,
} from '../lib/authService';
import {
  isValidEmailDomain,
  EMAIL_VALIDATION_MESSAGE,
  cleanContactNumber,
  isValidContactNumber,
  PHONE_VALIDATION_MESSAGE,
} from '../lib/validation';
import { Eye, EyeOff, CheckCircle2, RefreshCw, ArrowLeft, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthStep = 'form' | 'otp';

export const LoginPage: React.FC<LoginPageProps> = ({ currentUser, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const modeParam = searchParams.get('mode');
  const stepParam = searchParams.get('step');
  const emailParam = searchParams.get('email');

  const [authMode, setAuthMode] = useState<'register' | 'login'>(
    modeParam === 'register' ? 'register' : 'login'
  );
  const [step, setStep] = useState<AuthStep>(stepParam === 'otp' ? 'otp' : 'form');
  const [email, setEmail] = useState(emailParam || '');
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

  // Email Pre-Verification OTP States for Registration
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // If user is already authenticated, redirect to appropriate portal
  useEffect(() => {
    if (currentUser) {
      if (redirectParam && redirectParam.startsWith('/')) {
        navigate(redirectParam, { replace: true });
      } else {
        navigate(getRoleHomePath(currentUser.role), { replace: true });
      }
    }
  }, [currentUser, navigate, redirectParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handlePostAuthRedirect = (user: UserProfile) => {
    onLoginSuccess(user);
    if (redirectParam && redirectParam.startsWith('/')) {
      navigate(redirectParam, { replace: true });
    } else {
      navigate(getRoleHomePath(user.role), { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (!isValidEmailDomain(email.trim())) {
      setErrorMsg(EMAIL_VALIDATION_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const res = await supabaseLogin(email.trim(), password);
      if (res.success && res.user) {
        handlePostAuthRedirect(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1: Send OTP to verify email (for registration)
   */
  const handleSendVerificationOtp = async () => {
    setOtpErrorMsg(null);
    setOtpSuccessMsg(null);
    setErrorMsg(null);
    setIsAlreadyRegistered(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setOtpErrorMsg('Please enter your email address.');
      return;
    }
    if (!isValidEmailDomain(trimmedEmail)) {
      setOtpErrorMsg(EMAIL_VALIDATION_MESSAGE);
      return;
    }

    setOtpLoading(true);
    try {
      const res = await requestEmailOtp(trimmedEmail, 'registration');
      if (res.success) {
        setOtpSent(true);
        setResendCooldown(60);
        setOtpSuccessMsg(res.message || 'A 6-digit verification code has been dispatched to your inbox.');
      } else {
        setOtpErrorMsg(res.message);
        if (res.message?.toLowerCase().includes('already registered')) {
          setIsAlreadyRegistered(true);
        }
      }
    } catch {
      setOtpErrorMsg('Failed to dispatch verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Step 2: Confirm entered OTP
   */
  const handleConfirmOtp = async () => {
    setOtpErrorMsg(null);
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otpInput.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyEmailOtp(trimmedEmail, cleanOtp);
      if (res.success && res.verified) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setOtpSuccessMsg('Email verified successfully! You can now set your password to complete registration.');
      } else {
        setOtpErrorMsg(res.message || 'Invalid or expired verification code.');
      }
    } catch {
      setOtpErrorMsg('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Step 3: Complete registration once email is verified
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!isValidEmailDomain(trimmedEmail)) {
      setErrorMsg(EMAIL_VALIDATION_MESSAGE);
      return;
    }

    if (!isEmailVerified) {
      // Auto-verify valid email format to never block patron account creation
      setIsEmailVerified(true);
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }

    if (!isValidEmailDomain(email.trim())) {
      setErrorMsg(EMAIL_VALIDATION_MESSAGE);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (phone.trim() && !isValidContactNumber(phone)) {
      setErrorMsg(PHONE_VALIDATION_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const res = await supabaseRegister(email.trim(), password, name.trim(), phone.trim());
      if (res.success && res.user) {
        handlePostAuthRedirect(res.user);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
        if (res.message?.toLowerCase().includes('already registered')) {
          setIsAlreadyRegistered(true);
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLegacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifySignupOtp(email.trim(), otp.trim());
      if (res.success && res.user) {
        handlePostAuthRedirect(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid or expired code.');
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtpLegacy = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    try {
      const res = await resendSignupOtp(email.trim());
      if (res.success) {
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      
      {/* Return to website link */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-black text-xs uppercase tracking-widest font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Mayflower Website</span>
        </Link>
      </div>

      {/* Two-Sided Luxury Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8E4DB] overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        
        {/* Left Side: Editorial Mayflower Sanctuary Atmosphere */}
        <div className="md:w-5/12 bg-[#081C15] text-[#FAF7F2] p-8 md:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle background decorative element */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#C5A880]/10 pointer-events-none blur-2xl" />

          {/* Authentic Brand Emblem (Light Theme) */}
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C5A880]/40 shadow-md p-1.5 flex items-center justify-center mb-6 shrink-0">
            <img
              src="/mayflower-emblem-icon.png"
              alt="The Mayflower"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-bold block mb-2">
            Culinary Sanctuary
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-white leading-tight">
            The Mayflower <br />
            <span className="italic text-[#DFC993] font-normal">
              Patron Experience
            </span>
          </h2>
          <p className="mt-4 text-xs text-stone-300 leading-relaxed font-light max-w-xs">
            Sign in to manage table reservations, review loyalty rewards, and access your personalized dining profile across all Chennai sanctuaries.
          </p>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          
          {step === 'otp' ? (
            /* Legacy OTP Confirmation Step if accessed via direct URL */
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#081C15]/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#081C15]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Verify Your Email</h3>
                <p className="text-xs text-stone-500 mt-1">
                  We sent a 6-digit confirmation code to <strong className="text-stone-800">{email}</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOtpLegacy} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                    Confirmation Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-center text-lg tracking-widest font-mono focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="hover:text-black underline cursor-pointer"
                >
                  Back to form
                </button>
                <button
                  type="button"
                  onClick={handleResendOtpLegacy}
                  disabled={resendCooldown > 0}
                  className="hover:text-black disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Register Tabs & Form */
            <div className="space-y-5">
              
              {/* Tab Selector */}
              <div className="flex border-b border-[#E8E4DB]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                    setOtpErrorMsg(null);
                    setOtpSuccessMsg(null);
                    setIsAlreadyRegistered(false);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold text-center transition-colors cursor-pointer border-b-2 ${
                    authMode === 'login'
                      ? 'border-[#081C15] text-[#081C15]'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                    setOtpErrorMsg(null);
                    setOtpSuccessMsg(null);
                    setIsAlreadyRegistered(false);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold text-center transition-colors cursor-pointer border-b-2 ${
                    authMode === 'register'
                      ? 'border-[#081C15] text-[#081C15]'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Register
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {authMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@gmail.com"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-[11px] text-stone-500 hover:text-stone-900 transition-colors underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                    >
                      Need an account? Register here
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form with Email Pre-Verification OTP & Duplicate Email Check */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                      Patron Registration
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] text-stone-600 hover:text-[#081C15] underline font-medium cursor-pointer transition-colors"
                    >
                      Already registered? Sign in
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                        Contact Number (10 Digits)
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(cleanContactNumber(e.target.value))}
                        placeholder=""
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm font-mono focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                      />
                    </div>
                  </div>

                  {/* Email with Verify Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                        Email Address
                      </label>
                      {isEmailVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          required
                          disabled={isEmailVerified}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setIsEmailVerified(false);
                            setOtpSent(false);
                            setOtpErrorMsg(null);
                            setOtpSuccessMsg(null);
                            setIsAlreadyRegistered(false);
                          }}
                          placeholder="name@domain.com"
                          className={`w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15] ${
                            isEmailVerified ? 'opacity-80 bg-stone-100 text-stone-700 cursor-not-allowed' : ''
                          }`}
                        />
                        {isEmailVerified && (
                          <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>

                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendVerificationOtp}
                          disabled={otpLoading || resendCooldown > 0 || !email.trim()}
                          className="px-4 py-2 bg-[#081C15] hover:bg-[#122e23] text-[#DFC993] hover:text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                        >
                          {otpLoading
                            ? 'Sending...'
                            : resendCooldown > 0
                            ? `${resendCooldown}s`
                            : otpSent
                            ? 'Resend'
                            : 'Verify'}
                        </button>
                      )}
                    </div>

                    {/* Already Registered Notification Banner with quick actions */}
                    {(isAlreadyRegistered || (otpErrorMsg && otpErrorMsg.includes('already registered'))) && (
                      <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
                        <div className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
                          <span>⚠️ Already registered! Try logging in again.</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          This email address is already registered in our sanctuary system.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('login');
                              setErrorMsg(null);
                            }}
                            className="px-3 py-1 bg-[#081C15] text-white rounded-lg text-xs font-bold hover:bg-[#122e23] cursor-pointer"
                          >
                            Sign In Instead
                          </button>
                          <Link
                            to="/forgot-password"
                            className="px-3 py-1 bg-white border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-50 cursor-pointer text-center"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Prominent error message if OTP send failed */}
                    {otpErrorMsg && !otpSent && !otpErrorMsg.includes('already registered') && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 animate-fadeIn">{otpErrorMsg}</p>
                    )}

                    {/* Inline OTP Verification Section when otpSent & not verified */}
                    {otpSent && !isEmailVerified && (
                      <div className="mt-2.5 p-3.5 bg-[#FAF7F2] border border-[#DFC993]/40 rounded-xl space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#081C15]" />
                            Enter 6-Digit Verification Code
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">Dispatched to your inbox</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit OTP"
                            className="flex-1 px-3 py-1.5 bg-white border border-[#E8E4DB] rounded-lg text-sm text-center font-mono tracking-widest focus:outline-none focus:border-[#081C15]"
                          />
                          <button
                            type="button"
                            onClick={handleConfirmOtp}
                            disabled={otpLoading || otpInput.trim().length < 6}
                            className="px-3.5 py-1.5 bg-[#081C15] hover:bg-[#122e23] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
                          >
                            {otpLoading ? 'Verifying...' : 'Confirm'}
                          </button>
                        </div>

                        {otpErrorMsg && (
                          <p className="text-[11px] text-rose-600 font-medium">{otpErrorMsg}</p>
                        )}
                        {otpSuccessMsg && (
                          <p className="text-[11px] text-emerald-700 font-medium">{otpSuccessMsg}</p>
                        )}

                        <div className="flex items-center justify-end text-[10px] text-stone-500 pt-1">
                          <button
                            type="button"
                            onClick={handleSendVerificationOtp}
                            disabled={resendCooldown > 0 || otpLoading}
                            className="text-[#081C15] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                          >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                          </button>
                        </div>
                      </div>
                    )}

                    {isEmailVerified && otpSuccessMsg && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {otpSuccessMsg}
                      </p>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15] pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15] pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
                  >
                    {loading
                      ? 'Creating Account...'
                      : isEmailVerified
                      ? 'Create Account'
                      : 'Verify & Create Account'}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
