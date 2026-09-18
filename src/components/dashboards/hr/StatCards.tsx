import React from 'react';
import { Users, Calendar, AlertTriangle, Building2 } from 'lucide-react';
import { Employee, LeaveRequest } from './types';

interface StatCardsProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onReviewPending: () => void;
  onFilterByStatus?: (status: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  employees,
  leaveRequests,
  onReviewPending,
}) => {
  // Compute dynamic counts based on state
  const totalStaff = employees.length;
  const clockedInCount = employees.filter((e) => e.dutyStatus === 'Clocked In').length;
  const onLeaveCount = employees.filter((e) => e.dutyStatus === 'On Leave').length;
  const pendingRequestsCount = leaveRequests.filter((r) => r.status === 'Pending').length;

  // Unique active outlets
  const activeOutlets = Array.from(new Set(employees.map((e) => e.outlet)));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
      {/* Card 1: TOTAL STAFF */}
      <div
        id="card-total-staff"
        className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#7C857E] uppercase">
            Total Staff
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#EAF8F0] border border-[#C5EBD5] text-[#16A34A] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#18231E]">
            {totalStaff}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <span className="text-[#5E6B64] font-medium">
            {clockedInCount} currently on duty
          </span>
          <span className="bg-[#EAF8F0] text-[#16803D] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#BDEBD0]">
            100% Roster
          </span>
        </div>
      </div>

      {/* Card 2: ON LEAVE TODAY */}
      <div
        id="card-on-leave-today"
        className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#7C857E] uppercase">
            On Leave Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#F5F2FD] border border-[#DDD4F8] text-[#7C3AED] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#18231E]">
            {onLeaveCount}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <span className="text-[#5E6B64] font-medium">
            Staff on approved leave
          </span>
          <span className="bg-[#F5F2FD] text-[#6D28D9] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#DDD4F8]">
            Planned
          </span>
        </div>
      </div>

      {/* Card 3: PENDING REQUESTS */}
      <div
        id="card-pending-requests"
        className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#7C857E] uppercase">
            Pending Requests
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FEF8EC] border border-[#F6E0B8] text-[#D97706] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#B45309]">
            {pendingRequestsCount}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <div className="flex items-center gap-1.5 text-[#D97706] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse inline-block" />
            <span>Action required</span>
          </div>
          <button
            id="btn-review-pending"
            onClick={onReviewPending}
            className="text-[11px] font-bold text-[#8D580A] uppercase tracking-wider hover:text-[#B45309] hover:underline cursor-pointer transition-colors"
          >
            Review
          </button>
        </div>
      </div>

      {/* Card 4: OUTLETS COVERED */}
      <div
        id="card-outlets-covered"
        className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#7C857E] uppercase">
            Outlets Covered
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#18231E]">
            {activeOutlets.length}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <span className="text-[#5E6B64] font-medium truncate max-w-[140px]" title={activeOutlets.join(', ')}>
            Poes Garden, Anna Nagar ...
          </span>
          <span className="bg-[#EAF8F0] text-[#16803D] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#BDEBD0]">
            ALL ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
