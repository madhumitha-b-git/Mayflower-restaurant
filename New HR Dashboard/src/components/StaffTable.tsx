import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Clock, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';
import { Employee, DutyStatus } from '../types';

interface StaffTableProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onUpdateDutyStatus: (employeeId: string, newStatus: DutyStatus) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  employees,
  onSelectEmployee,
  onUpdateDutyStatus,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close action popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDutyBadge = (status: DutyStatus) => {
    switch (status) {
      case 'Clocked In':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF7ED] text-[#1E743F] border border-[#C6EAD1]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Clocked In</span>
          </span>
        );
      case 'Off Duty':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            Off Duty
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
            On Leave
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white/95 rounded-2xl shadow-sm border border-[#E8E3D8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Table Header Row */}
          <thead>
            <tr className="bg-[#0B2B24] text-[#C4CDBC] text-[11px] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-5 font-semibold">Employee</th>
              <th className="py-3.5 px-4 font-semibold">Role</th>
              <th className="py-3.5 px-4 font-semibold">Outlet</th>
              <th className="py-3.5 px-4 font-semibold">Shift</th>
              <th className="py-3.5 px-4 font-semibold">Duty Status</th>
              <th className="py-3.5 px-4 font-semibold">Clock-In</th>
              <th className="py-3.5 px-4 font-semibold">Hours Today</th>
              <th className="py-3.5 px-4 font-semibold">Joined</th>
              <th className="py-3.5 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-[#F1ECE2] text-xs text-[#2A3530]">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#707B75]">
                  <p className="font-serif-display text-base text-[#18231E]">No staff members found</p>
                  <p className="text-xs mt-1 text-[#8C9690]">
                    Try adjusting your search query or salon outlet filter.
                  </p>
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const isMenuOpen = openMenuId === emp.id;

                return (
                  <tr
                    key={emp.id}
                    id={`row-employee-${emp.code.toLowerCase()}`}
                    className="hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
                    onClick={() => onSelectEmployee(emp)}
                  >
                    {/* Employee Col: Initials Avatar + Name + Subtitle */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: emp.avatarBg }}
                        >
                          {emp.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#18231E] group-hover:text-[#0B2B24] transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-[#7A857F] mt-0.5 font-mono">
                            {emp.code} • {emp.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 font-medium text-[#2E3B35]">
                      {emp.role}
                    </td>

                    {/* Outlet */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-[#F3EFE6] text-[#4A453A] font-medium text-xs px-3 py-1 rounded-md border border-[#E9E4D8]">
                        {emp.outlet}
                      </span>
                    </td>

                    {/* Shift */}
                    <td className="py-3.5 px-4 text-[#4A5550]">
                      {emp.shift}
                    </td>

                    {/* Duty Status */}
                    <td className="py-3.5 px-4">
                      {renderDutyBadge(emp.dutyStatus)}
                    </td>

                    {/* Clock-In */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#374151]">
                      {emp.clockIn}
                    </td>

                    {/* Hours Today */}
                    <td className="py-3.5 px-4 font-medium text-[#2E3B35]">
                      {emp.hoursToday}
                    </td>

                    {/* Joined */}
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {emp.joined}
                    </td>

                    {/* Action */}
                    <td
                      className="py-3.5 px-4 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        id={`btn-action-${emp.code.toLowerCase()}`}
                        onClick={() => setOpenMenuId(isMenuOpen ? null : emp.id)}
                        className="p-1.5 rounded-lg text-[#8C9690] hover:text-[#18231E] hover:bg-[#EAE5DA] transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-10 w-48 bg-white rounded-xl shadow-lg border border-[#E5E0D4] py-1.5 z-30 text-left text-xs"
                        >
                          <button
                            onClick={() => {
                              onSelectEmployee(emp);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-[#2A3530] hover:bg-[#F8F6F0] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span>View Full Profile</span>
                          </button>

                          {emp.dutyStatus !== 'Clocked In' ? (
                            <button
                              onClick={() => {
                                onUpdateDutyStatus(emp.id, 'Clocked In');
                                setOpenMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-[#16803D] hover:bg-[#EAF7ED] flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16803D]" />
                              <span>Clock In Now</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onUpdateDutyStatus(emp.id, 'Off Duty');
                                setOpenMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-[#4B5563] hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#4B5563]" />
                              <span>Clock Out</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onUpdateDutyStatus(
                                emp.id,
                                emp.dutyStatus === 'On Leave' ? 'Off Duty' : 'On Leave'
                              );
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-[#6D28D9] hover:bg-[#F5F2FD] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-[#6D28D9]" />
                            <span>
                              {emp.dutyStatus === 'On Leave' ? 'End Leave' : 'Mark On Leave'}
                            </span>
                          </button>

                          <div className="border-t border-[#F1ECE2] my-1" />

                          <a
                            href={`tel:${emp.phone}`}
                            className="w-full px-3.5 py-2 text-left text-[#4A5550] hover:bg-[#F8F6F0] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span>Call Staff</span>
                          </a>

                          {emp.email && (
                            <a
                              href={`mailto:${emp.email}`}
                              className="w-full px-3.5 py-2 text-left text-[#4A5550] hover:bg-[#F8F6F0] flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>Send Email</span>
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
