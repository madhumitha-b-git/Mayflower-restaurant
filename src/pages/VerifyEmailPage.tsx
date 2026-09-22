import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { verifySignupOtp, resendSignupOtp } from '../lib/authService';
import { UserProfile } from '../types';
import { getRoleHomePath } from '../routes/roleRoutes';

interface VerifyEmailPageProps {
  currentUser?: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ currentUser, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

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
    if (emailParam && !email) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit confirmation code dispatched to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifySignupOtp(trimmedEmail, cleanOtp);
      if (res.success && res.user) {
        onLoginSuccess?.(res.user);
        if (redirectParam && redirectParam.startsWith('/')) {
          navigate(redirectParam, { replace: true });
        } else {
          navigate(getRoleHomePath(res.user.role), { replace: true });
        }
      } else {
        setErrorMsg(res.message || 'Invalid or expired confirmation code.');
      }
    } catch {
      setErrorMsg('Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please provide your email address to resend the code.');
      return;
    }

    try {
      const res = await resendSignupOtp(trimmedEmail);
      if (res.success) {
        setSuccessMsg(res.message);
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to resend confirmation code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      {/* Return to website link */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-black text-xs uppercase tracking-widest font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Two-Sided Luxury Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8E4DB] overflow-hidden flex flex-col md:flex-row min-h-[540px]">
        {/* Left Side: Brand Atmosphere */}
        <div className="md:w-5/12 bg-[#081C15] text-[#FAF7F2] p-8 md:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#C5A880]/10 pointer-events-none blur-2xl" />

          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C5A880]/40 shadow-md p-1.5 flex items-center justify-center mb-6 shrink-0">
            <img
              src="/mayflower-emblem-icon.png"
              alt="The Mayflower"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-bold block mb-2">
            Verification Desk
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-white leading-tight">
            The Mayflower <br />
            <span className="italic text-[#DFC993] font-normal">Account Confirmation</span>
          </h2>
          <p className="mt-4 text-xs text-stone-300 leading-relaxed font-light max-w-xs">
            Verify your email address using the one-time password (OTP) sent to your inbox to unlock your dining privileges.
          </p>
        </div>

        {/* Right Side: Verification Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-5">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#081C15]/10 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-[#081C15]" />
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A]">Verify Your Email</h3>
              <p className="text-xs text-stone-500 mt-1">
                Enter the 6-digit confirmation code dispatched to{' '}
                <strong className="text-stone-800">{email || 'your email address'}</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              {!emailParam && (
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
              )}

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
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-center text-xl tracking-widest font-mono focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
              <Link to="/login" className="hover:text-black underline cursor-pointer">
                Back to Sign In
              </Link>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="hover:text-black disabled:opacity-50 cursor-pointer flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
