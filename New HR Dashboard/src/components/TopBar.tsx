import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

interface TopBarProps {
  onBackToHome?: () => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onBackToHome,
  onLogout,
  userName = 'HR Director',
  userRole = 'Administrator',
}) => {
  return (
    <header className="w-full bg-[#0B2B24] text-white/90 text-xs px-4 sm:px-8 py-2.5 flex items-center justify-between border-b border-white/10 select-none">
      {/* Left Back button */}
      <button
        id="btn-back-to-home"
        onClick={onBackToHome}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors uppercase font-medium tracking-widest text-[11px] group cursor-pointer"
        title="Return to main dashboard"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </button>

      {/* Right User info & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#3B3224] text-[#E7D6BE] text-[10px] font-bold flex items-center justify-center border border-[#C5A059]/40">
            {userName ? userName.slice(0, 2).toUpperCase() : 'HR'}
          </div>
          <span className="text-white/70 text-[11px]">
            Logged in as <strong className="text-white/90 font-semibold">{userName || userRole}</strong>
          </span>
        </div>

        <span className="text-white/30 text-xs font-light">|</span>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="text-white/70 hover:text-white transition-colors tracking-widest text-[11px] uppercase font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Logout</span>
          <LogOut className="w-3 h-3 text-white/50" />
        </button>
      </div>
    </header>
  );
};
