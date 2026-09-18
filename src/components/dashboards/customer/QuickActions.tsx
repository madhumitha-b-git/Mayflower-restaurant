import React from 'react';

interface QuickActionsProps {
  onOpenReserve: () => void;
  onOpenFeedback: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenReserve, onOpenFeedback }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" data-purpose="quick-actions">
      {/* Reserve Action Card */}
      <button
        onClick={onOpenReserve}
        className="bg-white border border-[#E8E2D5] hover:border-[#C5A880]/70 rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-md card-hover-transition group relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A880]/40 w-full"
        type="button"
        id="quickReserveBtn"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="w-12 h-12 rounded-full bg-[#081C15] text-[#DFC993] border border-[#C5A880]/30 flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:border-[#C5A880] transition-all duration-300 shadow-sm">
          {/* Cutlery / Dining Fork & Knife Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3v4a2 2 0 002 2v11m4-17v17M16 3v4a2 2 0 01-2 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#081C15] group-hover:text-[#997E46] transition-colors relative z-10">
          RESERVE
        </span>
      </button>

      {/* Feedback Action Card */}
      <button
        onClick={onOpenFeedback}
        className="w-full bg-white border border-[#E8E2D5] hover:border-[#C5A880]/70 rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-md card-hover-transition group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#C5A880]/40 cursor-pointer"
        id="feedbackOpenBtn"
        type="button"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="w-12 h-12 rounded-full bg-[#081C15] text-[#DFC993] border border-[#C5A880]/30 flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:border-[#C5A880] transition-all duration-300 shadow-sm">
          {/* Star Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#081C15] group-hover:text-[#997E46] transition-colors relative z-10">
          FEEDBACK
        </span>
      </button>
    </section>
  );
};
