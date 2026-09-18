import React from 'react';
import { PatronProfile } from './types';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patron: PatronProfile;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose, patron }) => {
  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((patron.stars / patron.maxTierStars) * 100));

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-7 py-5 border-b border-[#C5A880]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              MAYFLOWER CIRCLE OF PATRONS
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              Stars &amp; Tier Privileges
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

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Current Tier Overview */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0B2115] to-[#05130D] text-white border border-[#C5A880]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880]">
                  Current Status
                </span>
                <h4 className="text-2xl font-serif font-bold text-stone-100 flex items-center gap-2">
                  <span>{patron.stars.toLocaleString()} Stars</span>
                  <span className="text-[#DFC993] text-lg">★</span>
                </h4>
              </div>
              <span className="bg-[#123824] text-[#8FD8B0] text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-[#1E5438]">
                {patron.tier} Tier
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Progress to {patron.nextTier}</span>
                <span className="font-semibold text-[#DFC993]">{patron.ptsToNextTier.toLocaleString()} pts remaining</span>
              </div>
              <div className="w-full bg-[#163022] h-2 rounded-full overflow-hidden p-[1px]">
                <div
                  className="bg-gradient-to-r from-[#C5A880] via-[#DFC993] to-[#F3DEAB] h-full rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tier Progression Benefits */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#081C15]">
              Privilege Tiers
            </h5>

            <div className="space-y-2.5">
              {/* Green */}
              <div className="p-3.5 rounded-lg border border-[#C5A880]/40 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#081C15] font-serif">Green Tier (Current)</strong>
                  <span className="text-[10px] text-stone-500">0 - 799 pts</span>
                </div>
                <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5 font-light">
                  <li>Priority table booking at Poes Garden and ECR Seaside</li>
                  <li>Afternoon tea welcome macaron assortment</li>
                  <li>Exclusive invitations to Seasonal Chef's Preview tastings</li>
                </ul>
              </div>

              {/* Gold */}
              <div className="p-3.5 rounded-lg border border-[#E8E2D5] bg-[#FAF7F2] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#997E46] font-serif">Gold Tier (Next Milestone)</strong>
                  <span className="text-[10px] text-stone-500 font-semibold">800 - 1,499 pts</span>
                </div>
                <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5 font-light">
                  <li>Complimentary vintage champagne welcome pour on arrival</li>
                  <li>Guaranteed window / oceanfront terrace table reservations</li>
                  <li>Direct concierge access to Master Sommelier cellar selections</li>
                  <li>Private dining room reservation booking fee waived</li>
                </ul>
              </div>

              {/* Black Diamond */}
              <div className="p-3.5 rounded-lg border border-[#E8E2D5] bg-[#FAF7F2] space-y-1 opacity-80">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-stone-800 font-serif">Black Diamond (By Invitation)</strong>
                  <span className="text-[10px] text-stone-500">1,500+ pts</span>
                </div>
                <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5 font-light">
                  <li>Personalized cellar locker with bespoke engraved crystal decanter</li>
                  <li>Exclusive private salon takeover bookings</li>
                  <li>Bespoke custom menu created in consultation with the Executive Chef</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#081C15] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
