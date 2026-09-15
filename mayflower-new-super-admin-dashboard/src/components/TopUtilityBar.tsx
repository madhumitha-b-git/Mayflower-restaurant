import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

interface TopUtilityBarProps {
  onNavigateHome: () => void;
  activeRole: string;
  onLogout: () => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  onNavigateHome,
  activeRole,
  onLogout,
}) => {
  return (
    <section
      id="top-utility-bar"
      className="bg-[#0D1412] text-white/90 text-xs px-6 py-2.5 flex items-center justify-between border-b border-white/10"
      data-purpose="utility-header"
    >
      <div className="flex items-center gap-3">
        <button
          id="btn-back-home"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors duration-150 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </button>
      </div>

      {/* Right utility controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60">Logged in as</span>
          <span className="font-semibold text-white tracking-wide">{activeRole}</span>
        </div>
        <button
          id="btn-logout"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-colors border border-red-800/40 text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </section>
  );
};
