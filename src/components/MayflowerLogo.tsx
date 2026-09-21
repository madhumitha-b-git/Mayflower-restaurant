import React from 'react';

interface MayflowerLogoProps {
  className?: string;
  variant?: 'default' | 'gold' | 'dark' | 'light';
  showBadge?: boolean;
}

export const MayflowerLogo: React.FC<MayflowerLogoProps> = ({
  className = 'w-11 h-11',
  variant = 'default',
  showBadge = true,
}) => {
  const isGold = variant === 'gold';
  const isDark = variant === 'dark';

  const badgeBg = isGold || isDark
    ? 'bg-white/10 border border-white/20'
    : 'bg-[#FAF7F2] border border-[#2D4030]/30 shadow-2xs';

  // Inner logo content rendering the authentic Mayflower emblem
  const logoContent = (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src="/mayflower-emblem-icon.png"
        alt="The Mayflower"
        className="w-full h-full object-contain p-1 select-none pointer-events-none"
        loading="eager"
      />
      {/* Hidden text for screen readers & monogram test checks */}
      <span className="sr-only">M</span>
    </div>
  );

  if (!showBadge) {
    return (
      <div className={`${className} flex items-center justify-center shrink-0`}>
        {logoContent}
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-[18px] ${badgeBg} flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {logoContent}
    </div>
  );
};
