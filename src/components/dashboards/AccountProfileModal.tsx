import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { updateUserProfile, requestEmailOtp, verifyEmailOtp, updateUserPassword } from '../../lib/authService';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, ShieldCheck, KeyRound, RefreshCw
} from 'lucide-react';
import { cleanContactNumber, isValidContactNumber, PHONE_VALIDATION_MESSAGE } from '../../lib/validation';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password Reset & Email Verification state
  const [isPasswordOtpVerified, setIsPasswordOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // New Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setIsPasswordOtpVerified(false);
      setOtpSent(false);
      setOtpInput('');
      setOtpLoading(false);
      setOtpErrorMsg(null);
      setOtpSuccessMsg(null);
      setResendCooldown(0);
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Send verification OTP to registered email
  const handleSendPasswordOtp = async () => {
    setOtpErrorMsg(null);
    setOtpSuccessMsg(null);
    setErrorMsg(null);

    const targetEmail = (email || user.email || '').trim().toLowerCase();
    if (!targetEmail) {
      setOtpErrorMsg('User email is missing.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await requestEmailOtp(targetEmail, 'password_reset');
      if (res.success) {
        setOtpSent(true);
        setResendCooldown(60);
        setOtpSuccessMsg('A 6-digit verification code has been dispatched to your email.');
      } else {
        setOtpErrorMsg(res.message || 'Failed to dispatch verification code.');
      }
    } catch {
      setOtpErrorMsg('Network error while dispatching verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Confirm 6-digit OTP
  const handleConfirmPasswordOtp = async () => {
    setOtpErrorMsg(null);
    setOtpSuccessMsg(null);
    setErrorMsg(null);

    const targetEmail = (email || user.email || '').trim().toLowerCase();
    const cleanOtp = otpInput.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyEmailOtp(targetEmail, cleanOtp);
      if (res.success && res.verified) {
        setIsPasswordOtpVerified(true);
        setOtpSent(false);
        setOtpSuccessMsg('Email verified! You can now set and confirm your new password below.');
      } else {
        setOtpErrorMsg(res.message || 'Invalid or expired verification code.');
      }
    } catch {
      setOtpErrorMsg('Verification failed. Please check your code and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Save profile details and password in Supabase DB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = (email || user.email || '').trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMsg('Please provide your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (trimmedPhone && !isValidContactNumber(trimmedPhone)) {
      setErrorMsg(PHONE_VALIDATION_MESSAGE);
      return;
    }

    // Password reset validation if changing password
    const isChangingPassword = Boolean(newPassword.trim() || confirmNewPassword.trim());
    if (isChangingPassword) {
      if (!isPasswordOtpVerified) {
        setErrorMsg('Please verify your email address via 6-digit code before resetting your password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Passwords do not match. Please ensure both password fields are identical.');
        return;
      }
    }

    setIsSaving(true);

    try {
      // 1. Explicitly update password in Supabase users table and storage
      if (isChangingPassword) {
        const pwdRes = await updateUserPassword(newPassword.trim(), trimmedEmail);
        if (!pwdRes.success) {
          setErrorMsg(pwdRes.message || 'Failed to update password in database.');
          setIsSaving(false);
          return;
        }
      }

      // 2. Update profile fields (name, phone, email) in user_profiles and users
      const result = await updateUserProfile({
        userId: user.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: isChangingPassword ? newPassword.trim() : undefined,
      });

      if (!result.success) {
        setErrorMsg(result.message || 'Failed to update account. Please try again.');
        setIsSaving(false);
        return;
      }

      const updatedUser: UserProfile = result.user || {
        ...user,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setSuccessMsg(
        isChangingPassword
          ? 'Password and profile updated successfully in database! You can now log in with your new password.'
          : 'Account profile updated successfully.'
      );

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSaving(false);
    }
  };

  const inputBase =
    'w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-xs text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1E3932]/30 focus:border-[#1E3932] transition-colors';
  const labelBase =
    'block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1';

  const isCustomer = (user.role || 'Customer') === 'Customer';

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#C5A880]/40 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-8 py-5 border-b border-[#C5A880]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-bold block mb-0.5">
              {isCustomer ? 'PATRON PROFILE' : 'STAFF CREDENTIALS & ACCOUNT'}
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
              <span>Account Settings &amp; Password Reset</span>
            </h3>
          </div>
          <button
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-[#C5A880]/40 text-[#DFC993] hover:text-white hover:bg-[#C5A880]/20 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 sm:p-7 overflow-y-auto space-y-5">
          
          {/* User Badge Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#E8E2D5]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full border border-[#C5A880] flex items-center justify-center bg-gradient-to-b from-[#0B2115] to-[#040E0A] shadow-inner shrink-0">
                <span className="font-serif text-xl font-bold text-[#DFC993]">
                  {(name || user.name || 'M')[0]?.toUpperCase()}
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-serif font-bold text-base text-[#081C15]">{name || user.name}</h4>
                <p className="text-xs text-stone-600 truncate max-w-xs">{email || user.email}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block border border-[#C5A880]/60 text-[#081C15] bg-[#DFC993]/25 text-[10px] tracking-widest px-2.5 py-1 rounded-full font-bold uppercase shadow-2xs">
                {user.role || 'CUSTOMER'}
              </span>
              {isCustomer && user.rewardPoints !== undefined && (
                <p className="text-[10px] text-stone-500 font-semibold mt-1">
                  {user.rewardPoints} Reward Points
                </p>
              )}
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-bold font-serif uppercase tracking-wider text-[#1E3932] flex items-center gap-2 border-b border-[#E8E2D5] pb-1.5">
              <User className="w-3.5 h-3.5 text-[#C5A880]" />
              Profile Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className={labelBase}>Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Your legal or preferred name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={labelBase}>Registered Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    disabled
                    placeholder="you@domain.com"
                    value={email}
                    className={`${inputBase} opacity-75 bg-stone-100 cursor-not-allowed`}
                  />
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelBase}>Contact Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(cleanContactNumber(e.target.value))}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset / Change Password Mechanism with Email Verification */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-1.5">
              <h5 className="text-xs font-bold font-serif uppercase tracking-wider text-[#1E3932] flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                Reset / Change Password
              </h5>
              <span className="text-[10px] text-stone-500 font-medium">Email Verification Required</span>
            </div>

            {/* Email Verification Step for Password Reset */}
            {!isPasswordOtpVerified ? (
              <div className="p-4 rounded-2xl bg-white border border-[#DFC993]/50 space-y-3 shadow-2xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#081C15]" />
                    Email Verification Step
                  </span>
                  <span className="text-[10px] text-stone-500">Security Requirement</span>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  To ensure account security, a 6-digit verification code must be sent to your registered email (<strong className="text-[#081C15]">{email}</strong>) before you can change your password.
                </p>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendPasswordOtp}
                    disabled={otpLoading || resendCooldown > 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#081C15] hover:bg-[#122e23] text-[#DFC993] hover:text-white text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend Code in ${resendCooldown}s`
                    ) : (
                      'Send Verification Code to Email'
                    )}
                  </button>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        className="flex-1 px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl text-sm text-center font-mono tracking-widest focus:outline-none focus:border-[#081C15]"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmPasswordOtp}
                        disabled={otpLoading || otpInput.trim().length < 6}
                        className="px-4 py-2 bg-[#081C15] hover:bg-[#122e23] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                      >
                        {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify Code'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>Didn't receive the email code?</span>
                      <button
                        type="button"
                        onClick={handleSendPasswordOtp}
                        disabled={resendCooldown > 0 || otpLoading}
                        className="text-[#081C15] font-bold hover:underline disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {otpErrorMsg && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpErrorMsg}</span>
                  </p>
                )}
                {otpSuccessMsg && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpSuccessMsg}</span>
                  </p>
                )}
              </div>
            ) : (
              /* Verified Banner & Password Form */
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Email verified! You can now enter your new password below.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E4DB]">
                  <div>
                    <label className={labelBase}>New Password *</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputBase + ' pr-9'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Confirm New Password *</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        minLength={6}
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={inputBase + ' pr-9'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Match Status indicator */}
                  {newPassword && confirmNewPassword && (
                    <div className="sm:col-span-2 pt-1 text-[11px] font-medium flex items-center gap-1.5">
                      {newPassword === confirmNewPassword ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Passwords match perfectly
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          Passwords do not match yet
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D5]">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-white transition-colors uppercase tracking-wider cursor-pointer disabled:opacity-50"
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (Boolean(newPassword || confirmNewPassword) && !isPasswordOtpVerified)}
              className="px-6 py-2.5 rounded-xl bg-[#081C15] hover:bg-[#0D2818] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving in DB...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
