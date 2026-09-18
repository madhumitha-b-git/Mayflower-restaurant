import React from 'react';
import { PatronProfile } from '../types';

interface HeaderProps {
  patron: PatronProfile;
  onOpenProfile: () => void;
  onResetView: () => void;
}

export const Header: React.FC<HeaderProps> = ({ patron, onOpenProfile, onResetView }) => {
  return (
    <header className="bg-[#081C15] text-gray-200 border-b border-[#C5A880]/20 sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs tracking-wider">
        {/* Left Back Navigation */}
        <button
          onClick={onResetView}
          className="inline-flex items-center gap-2 text-stone-300 hover:text-[#DFC993] transition-colors uppercase font-medium group cursor-pointer focus:outline-none"
        >
          <svg
            className="w-4 h-4 text-[#C5A880] group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold tracking-widest text-[11px]">BACK TO HOME</span>
        </button>

        {/* Right User Session Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenProfile}
            className="text-stone-300 hover:text-[#DFC993] transition-colors cursor-pointer text-left focus:outline-none"
            title="View Patron Profile"
          >
            Logged in as <strong className="text-white font-semibold ml-0.5">{patron.name}</strong>
          </button>
          <span className="border border-[#C5A880]/70 text-[#DFC993] bg-[#C5A880]/10 text-[10px] tracking-widest px-2.5 py-0.5 rounded font-semibold uppercase shadow-xs">
            CUSTOMER
          </span>
          <button
            onClick={onOpenProfile}
            className="text-stone-400 hover:text-[#DFC993] uppercase font-semibold text-[11px] tracking-widest transition-colors pl-1 cursor-pointer focus:outline-none"
          >
            ACCOUNT
          </button>
        </div>
      </div>
    </header>
  );
};
