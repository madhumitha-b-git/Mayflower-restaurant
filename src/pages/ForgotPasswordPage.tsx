import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Eye, EyeOff, RefreshCw, ShieldAlert } from 'lucide-react';
import { requestPasswordReset, verifyRecoveryOtp, updateUserPassword } from '../lib/authService';
import { isValidEmailDomain, EMAIL_VALIDATION_MESSAGE } from '../lib/validation';

type ResetStep = 'email' | 'otp' | 'new_password' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Submit email to request recovery OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!isValidEmailDomain(trimmedEmail)) {
      setErrorMsg(EMAIL_VALIDATION_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(trimmedEmail);
      if (res.success) {
        setSuccessMsg(res.message);
        setStep('otp');
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message || 'Unable to request password recovery.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify recovery OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRecoveryOtp(email.trim(), otp.trim());
      if (res.success) {
        setStep('new_password');
      } else {
        setErrorMsg(res.message || 'Invalid or expired recovery code.');
      }
    } catch {
      setErrorMsg('Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserPassword(newPassword, email.trim());
      if (res.success) {
        setStep('success');
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setSuccessMsg('A new recovery code has been dispatched to your email.');
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to resend recovery code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      {/* Return link */}
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
        {/* Left Side: Mayflower Sanctuary Brand Emblem */}
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
            Account Security
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-white leading-tight">
            The Mayflower <br />
            <span className="italic text-[#DFC993] font-normal">Patron Recovery</span>
          </h2>
          <p className="mt-4 text-xs text-stone-300 leading-relaxed font-light max-w-xs">
            Secure password recovery via Supabase Auth and verified email OTP token verification.
          </p>
        </div>

        {/* Right Side: Recovery Steps */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && step === 'otp' && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#081C15]/10 flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5 text-[#081C15]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Reset Your Password</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your registered patron email to receive a 6-digit recovery code.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                    Patron Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@mayflower.com"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Dispatching Recovery Code...' : 'Send Recovery Code'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter Recovery OTP */}
          {step === 'otp' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#081C15]/10 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-[#081C15]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Enter Recovery Code</h3>
                <p className="text-xs text-stone-500 mt-1">
                  We sent a 6-digit verification code to <strong className="text-stone-800">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                    6-Digit Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-center text-xl tracking-widest font-mono focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Verifying Code...' : 'Verify & Set New Password'}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="hover:text-black underline cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="hover:text-black disabled:opacity-50 cursor-pointer flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 'new_password' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#081C15]/10 flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5 text-[#081C15]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Create New Password</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Choose a secure password with a minimum of 6 characters.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
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

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#081C15] focus:ring-1 focus:ring-[#081C15] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 'success' && (
            <div className="space-y-5 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A]">Password Successfully Updated</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                Your patron account password has been updated. You may now sign in using your new credentials.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer shadow-md"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
