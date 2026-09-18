import React, { useState } from 'react';
import { X, Clock, MapPin, Calendar, Phone, Mail, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Employee, DutyStatus, OutletName } from '../types';
import { ALL_OUTLETS, SHIFT_OPTIONS } from '../data/mockData';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
  onUpdateDutyStatus: (employeeId: string, newStatus: DutyStatus) => void;
  onUpdateEmployee: (updated: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
  onUpdateDutyStatus,
  onUpdateEmployee,
}) => {
  if (!employee) return null;

  const [selectedOutlet, setSelectedOutlet] = useState<OutletName>(employee.outlet);
  const [selectedShift, setSelectedShift] = useState<string>(employee.shift);
  const [hasChanges, setHasChanges] = useState(false);

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutlet(e.target.value as OutletName);
    setHasChanges(true);
  };

  const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedShift(e.target.value);
    setHasChanges(true);
  };

  const handleSaveReassignment = () => {
    onUpdateEmployee({
      ...employee,
      outlet: selectedOutlet,
      shift: selectedShift,
    });
    setHasChanges(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E3D8] animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start justify-between border-b border-[#F2ECE1] pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
              style={{ backgroundColor: employee.avatarBg }}
            >
              {employee.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#18231E]">
                  {employee.name}
                </h2>
              </div>
              <p className="text-xs text-[#5D6B64] font-medium mt-0.5">
                {employee.role}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#8C9690]">
                <span>{employee.code}</span>
                <span>•</span>
                <span>Joined {employee.joined}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C9690] hover:text-[#18231E] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duty Status Control Bar */}
        <div className="mt-4 bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFE9DD]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-[#7C857E] uppercase">
              Current Duty Status
            </span>
            <span className="font-semibold text-xs text-[#18231E]">
              {employee.dutyStatus}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => onUpdateDutyStatus(employee.id, 'Clocked In')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                employee.dutyStatus === 'Clocked In'
                  ? 'bg-[#EAF7ED] text-[#15803D] border border-[#BDEBD0] shadow-2xs'
                  : 'bg-white text-[#5E6B64] border border-[#E8E3D8] hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clock In</span>
            </button>

            <button
              onClick={() => onUpdateDutyStatus(employee.id, 'Off Duty')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                employee.dutyStatus === 'Off Duty'
                  ? 'bg-gray-200 text-[#1F2937] shadow-2xs'
                  : 'bg-white text-[#5E6B64] border border-[#E8E3D8] hover:bg-gray-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Off Duty</span>
            </button>

            <button
              onClick={() => onUpdateDutyStatus(employee.id, 'On Leave')}
              className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                employee.dutyStatus === 'On Leave'
                  ? 'bg-[#F5F2FD] text-[#6D28D9] border border-[#DDD4F8] shadow-2xs'
                  : 'bg-white text-[#5E6B64] border border-[#E8E3D8] hover:bg-gray-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>On Leave</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5D6B64] mt-3 pt-2.5 border-t border-[#EDE7DB]">
            <span>Punched in at: <strong className="text-[#18231E] font-mono">{employee.clockIn}</strong></span>
            <span>Hours today: <strong className="text-[#18231E] font-semibold">{employee.hoursToday}</strong></span>
          </div>
        </div>

        {/* Outlet & Shift Assignment */}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#7C857E] uppercase mb-1">
                Assigned Outlet
              </label>
              <select
                value={selectedOutlet}
                onChange={handleOutletChange}
                className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl px-3 py-2 text-xs text-[#18231E] focus:outline-hidden focus:border-[#0B2B24] cursor-pointer"
              >
                {ALL_OUTLETS.map((out) => (
                  <option key={out} value={out}>
                    {out}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#7C857E] uppercase mb-1">
                Shift Schedule
              </label>
              <select
                value={selectedShift}
                onChange={handleShiftChange}
                className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl px-3 py-2 text-xs text-[#18231E] focus:outline-hidden focus:border-[#0B2B24] cursor-pointer"
              >
                {SHIFT_OPTIONS.map((sh) => (
                  <option key={sh} value={sh}>
                    {sh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveReassignment}
                className="bg-[#0B2B24] hover:bg-[#15463B] text-white text-xs font-semibold px-4 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Save Assignment Changes
              </button>
            </div>
          )}
        </div>

        {/* Contact Links */}
        <div className="mt-5 pt-4 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${employee.phone}`}
              className="flex items-center gap-1.5 text-[#0B2B24] font-semibold hover:underline"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>{employee.phone}</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D6B64] hover:bg-gray-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
