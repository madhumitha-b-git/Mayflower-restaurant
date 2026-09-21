import React from 'react';
import { PatronProfile } from './types';
import { Edit3 } from 'lucide-react';

interface PatronCardProps {
  patron: PatronProfile;
  onOpenRewards: () => void;
  onOpenProfile?: () => void;
}

export const PatronCard: React.FC<PatronCardProps> = ({ patron, onOpenRewards, onOpenProfile }) => {
  const percentage = Math.min(100, Math.round((patron.stars / patron.maxTierStars) * 100));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
          <button
            onClick={onOpenProfile}
            type="button"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#C5A880] flex items-center justify-center bg-gradient-to-b from-[#0B2115] to-[#040E0A] shadow-inner shrink-0 ring-4 ring-[#C5A880]/10 hover:ring-[#C5A880]/40 transition cursor-pointer"
            title="View & Edit Patron Profile"
          >
            <span className="font-cormorant text-2xl sm:text-3xl font-medium text-[#DFC993] italic select-none">
              {patron.monogram}
            </span>
          </button>

          {/* Titles & Patron Data */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-stone-100 font-semibold tracking-tight">
                {greeting}, {patron.name}
              </h1>
              <span className="bg-[#123824] text-[#8FD8B0] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-[#1E5438]/80 whitespace-nowrap">
                {patron.tier.toUpperCase()} MEMBER
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-stone-300/80 font-light tracking-wide">
              <span>Mayflower Patron since {patron.memberSince} · {patron.totalVisits} Visit{patron.totalVisits !== 1 ? 's' : ''}</span>
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DFC993] hover:text-white bg-[#C5A880]/15 hover:bg-[#C5A880]/25 border border-[#C5A880]/30 rounded-lg px-2.5 py-0.5 transition cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Profile
                </button>
              )}
            </div>
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
                  {patron.stars.toLocaleString()}
                </span>
                <span className="text-[#DFC993] text-base">★</span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#C5A880] font-medium mt-1">
                MAYFLOWER STARS
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#8FD8B0]">{patron.tier}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">{patron.ptsToNextTier.toLocaleString()} pts to {patron.nextTier}</p>
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
