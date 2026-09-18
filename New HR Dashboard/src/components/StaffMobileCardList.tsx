import React from 'react';
import { Clock, Phone, ChevronRight, CheckCircle2, User } from 'lucide-react';
import { Employee, DutyStatus } from '../types';

interface StaffMobileCardListProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onUpdateDutyStatus: (employeeId: string, newStatus: DutyStatus) => void;
}

export const StaffMobileCardList: React.FC<StaffMobileCardListProps> = ({
  employees,
  onSelectEmployee,
  onUpdateDutyStatus,
}) => {
  const renderDutyBadge = (status: DutyStatus) => {
    switch (status) {
      case 'Clocked In':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7ED] text-[#1E743F] border border-[#C6EAD1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Clocked In</span>
          </span>
        );
      case 'Off Duty':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            Off Duty
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
            On Leave
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white/95 rounded-2xl p-8 text-center border border-[#E8E3D8]">
        <p className="font-serif-display text-base text-[#18231E]">No staff members found</p>
        <p className="text-xs text-[#8C9690] mt-1">
          Adjust search or salon location filters to see staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {employees.map((emp) => (
        <div
          key={emp.id}
          id={`mobile-card-${emp.code.toLowerCase()}`}
          className="bg-white/95 rounded-2xl p-4 border border-[#E8E3D8] shadow-xs active:bg-[#FAF8F5] transition-all"
        >
          {/* Top row: Avatar + Name + Status */}
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => onSelectEmployee(emp)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: emp.avatarBg }}
              >
                {emp.avatarInitials}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#18231E] leading-tight">
                  {emp.name}
                </h2>
                <span className="text-[11px] text-[#7A857F] font-mono">
                  {emp.code} • {emp.phone}
                </span>
              </div>
            </div>

            <div>{renderDutyBadge(emp.dutyStatus)}</div>
          </div>

          {/* Details grid */}
          <div
            className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#F2ECE1] text-xs cursor-pointer"
            onClick={() => onSelectEmployee(emp)}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C9690] tracking-wider block">
                Role & Outlet
              </span>
              <span className="font-medium text-[#2E3B35] block mt-0.5">
                {emp.role}
              </span>
              <span className="inline-block mt-1 bg-[#F3EFE6] text-[#4A453A] font-medium text-[11px] px-2 py-0.5 rounded border border-[#E9E4D8]">
                {emp.outlet}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C9690] tracking-wider block">
                Shift & Duty
              </span>
              <span className="text-[#4A5550] block mt-0.5 truncate" title={emp.shift}>
                {emp.shift}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#55635C]">
                <span>In: <strong>{emp.clockIn}</strong></span>
                <span>•</span>
                <span>Hrs: <strong>{emp.hoursToday}</strong></span>
              </div>
            </div>
          </div>

          {/* Bottom quick actions */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#F2ECE1]">
            <a
              href={`tel:${emp.phone}`}
              className="flex items-center gap-1 text-xs text-[#55635C] hover:text-[#18231E] px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E9E4D8]"
            >
              <Phone className="w-3.5 h-3.5 text-[#7C857E]" />
              <span>Call</span>
            </a>

            {emp.dutyStatus === 'Clocked In' ? (
              <button
                onClick={() => onUpdateDutyStatus(emp.id, 'Off Duty')}
                className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Clock Out</span>
              </button>
            ) : (
              <button
                onClick={() => onUpdateDutyStatus(emp.id, 'Clocked In')}
                className="flex items-center gap-1.5 text-xs text-[#16803D] font-medium px-3 py-1.5 rounded-lg bg-[#EAF7ED] hover:bg-[#DCFCE7] border border-[#C6EAD1] cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clock In</span>
              </button>
            )}

            <button
              onClick={() => onSelectEmployee(emp)}
              className="flex items-center gap-1 text-xs text-[#18231E] font-medium px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFE9DD] border border-[#E9E4D8] cursor-pointer"
            >
              <span>Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
