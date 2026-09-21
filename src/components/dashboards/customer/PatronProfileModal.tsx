import React, { useState, useEffect } from 'react';
import { PatronProfile } from './types';
import { UserProfile } from '../../../types';
import { updateUserProfile } from '../../../lib/authService';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2
} from 'lucide-react';

interface PatronProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patron: PatronProfile;
  user: UserProfile;
  onUpdateSuccess: (updatedUser: UserProfile, updatedPatron: Partial<PatronProfile>) => void;
  onUpdatePatron?: (updated: Partial<PatronProfile>) => void;
}

export const PatronProfileModal: React.FC<PatronProfileModalProps> = ({
  isOpen,
  onClose,
  patron,
  user,
  onUpdateSuccess,
  onUpdatePatron,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(patron.name || user.name || '');
      setEmail(patron.email || user.email || '');
      setPhone(patron.phone || user.phone || '');
      setPassword('');
      setNewPassword('');
      setShowPassword(false);
      setShowNewPassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, patron, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMsg('Please provide your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password change validation
    const pwdToSave = newPassword.trim() || password.trim();
    if (password || newPassword) {
      if (password && newPassword && password !== newPassword) {
        setErrorMsg('Passwords do not match. Please verify your new password.');
        return;
      }
      if (pwdToSave.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const result = await updateUserProfile({
        userId: user.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: pwdToSave || undefined,
        dietaryPreferences: patron.dietaryPreferences,
        preferredSeating: patron.preferredSeating,
      });

      if (!result.success) {
        setErrorMsg(result.message || 'Failed to update profile. Please try again.');
        setIsSaving(false);
        return;
      }

      const updatedPatronData: Partial<PatronProfile> = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        monogram: trimmedName[0]?.toUpperCase() || 'M',
      };

      const updatedUser: UserProfile = result.user || {
        ...user,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      };

      if (onUpdatePatron) {
        onUpdatePatron(updatedPatronData);
      }
      onUpdateSuccess(updatedUser, updatedPatronData);

      setSuccessMsg('Profile updated successfully.');

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSaving(false);
    }
  };

  const inputBase = "w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-white text-xs text-[#1A1A1A] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1E3932]/30 focus:border-[#1E3932] transition-colors";
  const labelBase = "block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1";

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#C5A880]/40 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-8 py-5 border-b border-[#C5A880]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-bold block mb-0.5">
              PATRON PROFILE
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              Edit Profile
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
          {/* Patron Badge */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#E8E2D5]">
            <div className="w-12 h-12 rounded-full border border-[#C5A880] flex items-center justify-center bg-gradient-to-b from-[#0B2115] to-[#040E0A] shadow-inner shrink-0">
              <span className="font-cormorant text-xl font-bold text-[#DFC993] italic">
                {name ? name[0].toUpperCase() : patron.monogram}
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-base text-[#081C15]">{name || patron.name}</h4>
              <p className="text-xs text-stone-600">
                Mayflower Patron since {patron.memberSince} · <span className="text-[#1E3932] font-semibold">{patron.tier} Member</span>
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-bold font-serif uppercase tracking-wider text-[#1E3932] flex items-center gap-2 border-b border-[#E8E2D5] pb-1.5">
              <User className="w-3.5 h-3.5 text-[#C5A880]" />
              Personal &amp; Contact Information
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
                <label className={labelBase}>Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={labelBase}>Contact Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password & New Password */}
          <div className="space-y-3.5 pt-1">
            <h5 className="text-xs font-bold font-serif uppercase tracking-wider text-[#1E3932] flex items-center gap-2 border-b border-[#E8E2D5] pb-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
              Change Password
            </h5>
            <p className="text-[11px] text-stone-500">
              Leave blank if you do not wish to change your password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelBase}>Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputBase + " pr-9"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelBase}>New Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputBase + " pr-9"}
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
            </div>
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
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#081C15] hover:bg-[#0D2818] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating...
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

