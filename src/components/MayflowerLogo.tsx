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
  const isLight = variant === 'light';

  const textColor = isGold
    ? '#DFC993'
    : isDark || isLight
    ? '#FAF7F2'
    : '#2D4030';

  const flourishColor = isGold
    ? '#DFC993'
    : isDark || isLight
    ? '#FAF7F2'
    : '#2D4030';

  const flourishOpacity = isGold || isDark || isLight ? 0.28 : 0.18;

  const svgContent = (
    <svg
      viewBox="0 0 100 100"
      className="w-4/5 h-4/5 select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="The Mayflower"
    >
      <path
        d="M50 16 C54 26 64 30 70 26 C64 37 54 39 50 33 C46 39 36 37 30 26 C36 30 46 26 50 16 Z"
        fill={flourishColor}
        opacity={flourishOpacity}
      />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
        fontSize="56"
        fontWeight="700"
        fill={textColor}
      >
        M
      </text>
    </svg>
  );

  if (!showBadge) {
    return svgContent;
  }

  const badgeBg = isGold || isDark
    ? 'bg-white/10 border border-white/20'
    : 'bg-[#FAF7F2] border border-[#2D4030]/40 shadow-2xs';

  return (
    <div
      className={`${className} rounded-[18px] ${badgeBg} flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {svgContent}
    </div>
  );
};
