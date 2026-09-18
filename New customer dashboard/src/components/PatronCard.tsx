import React from 'react';
import { PatronProfile } from '../types';

interface PatronCardProps {
  patron: PatronProfile;
  onOpenRewards: () => void;
}

export const PatronCard: React.FC<PatronCardProps> = ({ patron, onOpenRewards }) => {
  const percentage = Math.min(100, Math.round((patron.stars / patron.maxTierStars) * 100));

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#061610] via-[#0D2818] to-[#081C15] rounded-2xl text-white p-6 sm:p-7 md:p-8 shadow-2xl border border-[#C5A880]/30 transition-all duration-300"
      data-purpose="patron-card"
    >
      {/* Ambient Vignette & Decorative Elements */}
      <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-[#C5A880]/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-[#1A472E]/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar & Patron Identity */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Monogram Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#C5A880] flex items-center justify-center bg-gradient-to-b from-[#0B2115] to-[#040E0A] shadow-inner shrink-0 ring-4 ring-[#C5A880]/10">
            <span className="font-cormorant text-2xl sm:text-3xl font-medium text-[#DFC993] italic select-none">
              {patron.monogram}
            </span>
          </div>

          {/* Titles & Patron Data */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-stone-100 font-semibold tracking-tight">
                Good morning, {patron.name}
              </h1>
              <span className="bg-[#123824] text-[#8FD8B0] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-[#1E5438]/80 whitespace-nowrap">
                {patron.tier.toUpperCase()} MEMBER
              </span>
            </div>
            <p className="text-xs text-stone-300/80 font-light tracking-wide">
              Mayflower Patron since {patron.memberSince} · {patron.totalVisits} Visits
            </p>
          </div>
        </div>

        {/* Right: Stars Counter & Tier Status */}
        <button
          onClick={onOpenRewards}
          className="bg-[#05130D]/85 border border-[#C5A880]/30 hover:border-[#C5A880]/60 rounded-xl px-5 sm:px-7 py-4 flex flex-col justify-center min-w-[270px] sm:min-w-[290px] shadow-sm backdrop-blur-sm transition-all duration-200 text-left group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
          title="Click to view Mayflower Stars & Tier Privileges"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-2xl font-serif font-bold text-stone-100 tracking-tight group-hover:text-[#DFC993] transition-colors">
                  {patron.stars}
                </span>
                <span className="text-[#DFC993] text-base">★</span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#C5A880] font-medium mt-1">
                MAYFLOWER STARS
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#8FD8B0]">{patron.tier}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">{patron.ptsToNextTier} pts to {patron.nextTier}</p>
            </div>
          </div>

          {/* Tier Progress Track */}
          <div className="w-full bg-[#163022] h-1.5 rounded-full overflow-hidden mt-1 p-[1px]">
            <div
              className="bg-gradient-to-r from-[#C5A880] via-[#DFC993] to-[#F3DEAB] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </button>
      </div>
    </section>
  );
};
