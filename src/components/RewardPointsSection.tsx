import React from 'react';
import { Sparkles } from 'lucide-react';

export interface RewardPointsSectionProps {
  onOpenAuth?: () => void;  // to trigger login modal
}

interface EarningMethod {
  id: string;
  emoji: string;
  points: string;
  title: string;
  description: string;
}

const EARNING_METHODS: EarningMethod[] = [
  {
    id: 'signup',
    emoji: '🎉',
    points: '+200 pts',
    title: 'Sign Up',
    description: 'Create your Mayflower account',
  },
  {
    id: 'reserve',
    emoji: '🍽️',
    points: '+300 pts',
    title: 'Reserve a Table',
    description: 'Book through our reservation system',
  },
  {
    id: 'feedback',
    emoji: '⭐',
    points: '+100 pts',
    title: 'Share Feedback',
    description: 'Tell us about your dining experience',
  },
  {
    id: 'milestones',
    emoji: '🏆',
    points: '+500 pts',
    title: 'Visit Milestones',
    description: 'Bonus at every 5th visit',
  },
];

export const RewardPointsSection: React.FC<RewardPointsSectionProps> = ({ onOpenAuth }) => {
  return (
    <section
      id="rewards-program"
      className="py-20 sm:py-24 bg-[#FAF7F2] text-[#1A1A1A] relative border-b border-[#E8E4DB] overflow-hidden"
    >
      {/* Subtle ambient blur decorations */}
      <div className="absolute top-10 right-[-60px] w-80 h-80 rounded-full bg-[#E8E4DB]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-60px] w-80 h-80 rounded-full bg-[#D1CDBC]/25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] uppercase tracking-[0.25em] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Member Privileges</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1A1A1A]">
            Earn Mayflower Rewards
          </h2>

          <p className="text-[15px] sm:text-base text-[#4A4A4A] leading-relaxed max-w-2xl mx-auto">
            Every visit brings you closer to exclusive perks and unforgettable moments.
          </p>

          <div className="w-12 h-[2px] bg-[#5A5A40]/30 mx-auto mt-4" />
        </div>

        {/* 4 Earning Method Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
          {EARNING_METHODS.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E8E4DB] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
            >
              {/* Emoji as large icon */}
              <div
                className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E8E4DB]/80 flex items-center justify-center text-3xl sm:text-4xl shadow-2xs mb-5 group-hover:scale-110 group-hover:border-[#2D4030]/30 transition-transform duration-300 select-none"
                role="img"
                aria-label={method.title}
              >
                <span>{method.emoji}</span>
              </div>

              {/* Point Value Prominently Displayed */}
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D4030] mb-2 tracking-tight">
                {method.points}
              </div>

              {/* Action Label */}
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-2">
                {method.title}
              </h3>

              {/* Description Text */}
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                {method.description}
              </p>
            </div>
          ))}
        </div>

        {/* Optional Action CTA */}
        {onOpenAuth && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-[#2D4030] hover:bg-[#1E2B20] text-white text-[11px] uppercase tracking-widest font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Join Mayflower Rewards</span>
            </button>
          </div>
        )}

        {/* Bottom Expiration Note */}
        <p className="mt-10 text-center text-xs text-[#737373] tracking-wide">
          Points expire 24 months from your last visit. Terms apply.
        </p>
      </div>
    </section>
  );
};
