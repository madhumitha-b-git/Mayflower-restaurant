import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserProfile } from '../types';
import { getRoleHomePath } from '../routes/roleRoutes';
import { supabaseLogin, supabaseRegister } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';
import { isValidEmailDomain, EMAIL_VALIDATION_MESSAGE } from '../lib/validation';
import { Eye, EyeOff, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';

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

  const [authMode, setAuthMode] = useState<'register' | 'login'>(
    modeParam === 'register' ? 'register' : 'login'
  );
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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

    setLoading(true);
    try {
      const res = await supabaseRegister(email.trim(), password, name.trim(), phone.trim());
      if (res.success && res.user) {
        if (res.requiresEmailConfirmation) {
          setStep('otp');
          setResendCooldown(60);
        } else {
          handlePostAuthRedirect(res.user);
        }
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'signup',
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired code.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          name: name.trim() || email.split('@')[0],
          email: data.user.email || email.trim(),
          phone: phone.trim(),
          rewardPoints: 600,
          tier: 'Green',
          role: 'Customer',
          totalVisits: 1,
          joinedDate: new Date().toISOString().split('T')[0],
          transactions: [
            {
              id: 'txn-welcome',
              type: 'earned_signup',
              points: 600,
              description: 'Sanctuary Welcome Gift — 600 Points',
              date: new Date().toISOString().split('T')[0],
            },
          ],
        };
        handlePostAuthRedirect(userProfile);
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    try {
      await supabase.auth.resend({ type: 'signup', email: email.trim() });
      setResendCooldown(60);
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
            <span className="italic text-[#DFC993] font-normal">Patron Experience</span>
          </h2>
          <p className="mt-4 text-xs text-stone-300 leading-relaxed font-light max-w-xs">
            Sign in to manage table reservations, review loyalty rewards, and access your personalized dining profile across all Chennai sanctuaries.
          </p>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          
          {step === 'otp' ? (
            /* OTP Confirmation Step */
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

              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  onClick={handleResendOtp}
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
                  onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
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
                  onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
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
                      placeholder="patron@mayflower.com"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                      Password
                    </label>
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
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
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
                        placeholder="Madan Kumar"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="madan@example.com"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                    />
                  </div>

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
                    className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md mt-2"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
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
