import React from 'react';
import { UserPlus, LogOut, Users } from 'lucide-react';

interface BrandHeaderProps {
  onOpenOnboard: () => void;
  onExit: () => void;
  userName?: string;
  userRole?: string;
  onSwitchRole?: (role: string) => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onOpenOnboard,
  onExit,
  userName = '',
  userRole = 'HR Director',
  onSwitchRole,
}) => {
  return (
    <div className="w-full bg-[#0B2B24] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-[#143B33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
      {/* Brand Emblem & HR Dashboard Title */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="flex flex-col items-center justify-center border border-[#C5A059]/60 rounded-xl px-3 py-2 bg-[#0E352C] shadow-inner shrink-0">
          {/* Gold silhouette users icon */}
          <div className="text-[#D4A359] flex items-center justify-center mb-1">
            <Users className="w-5 h-5 text-[#D4A359]" strokeWidth={2.2} />
          </div>
          {/* Gold brand letters */}
          <span className="text-[#D4A359] text-[10px] tracking-[0.25em] font-bold font-brand uppercase pl-0.5">
            M · FD
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-white/95 font-serif-display text-lg sm:text-xl font-semibold tracking-wide">
              HR Dashboard
            </h1>
          </div>

          {/* User display */}
          <div
            id="supabase-user-container"
            className="flex items-center gap-1.5 text-xs text-white/70 mt-1 flex-wrap"
          >
            <span className="text-white/50 text-[11px]">Welcome,</span>
            <span
              id="supabase-user-name"
              className="text-[#D4A359] font-medium font-sans px-1.5 py-0.5 rounded bg-white/5 border border-white/10 min-w-[100px] text-center sm:text-left inline-block"
            >
              {userName ? userName : (
                <span className="text-[#D4A359]/90 font-medium">
                  {userRole}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons on Right */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
        {onSwitchRole && (
          <select
            onChange={(e) => onSwitchRole(e.target.value)}
            defaultValue="hr-roster"
            className="bg-[#0E352C] text-xs text-[#E7D6BE] border border-[#C5A059]/40 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#C5A059] transition-colors"
          >
            <option value="owner-management">👑 Owner Portal</option>
            <option value="admin-suite">🛡️ Admin Suite</option>
            <option value="manager-operations">💼 Manager Ops</option>
            <option value="chef-kitchen">👨‍🍳 Chef Kitchen</option>
            <option value="hr-roster">👥 HR & Roster</option>
            <option value="accountant-ledger">📊 Accountant</option>
            <option value="customer-portal">🍷 Patron Portal</option>
          </select>
        )}

        <button
          id="btn-onboard-staff"
          onClick={onOpenOnboard}
          className="bg-[#D4A359] hover:bg-[#C2934A] active:scale-[0.98] text-[#132620] font-semibold text-xs tracking-wider uppercase px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#132620]" strokeWidth={2.4} />
          <span>+ Onboard</span>
        </button>

        <button
          id="btn-exit-dashboard"
          onClick={onExit}
          className="border border-white/20 hover:border-white/40 hover:bg-white/5 active:scale-[0.98] text-white/90 text-xs tracking-widest uppercase px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-white/80" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};
