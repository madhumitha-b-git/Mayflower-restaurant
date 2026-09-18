import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, User } from 'lucide-react';
import { Employee, OutletName, DutyStatus } from './types';
import { ALL_OUTLETS, SHIFT_OPTIONS } from './mockData';

interface OnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Employee) => void;
  totalEmployees: number;
}

export const OnboardModal: React.FC<OnboardModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
  totalEmployees,
}) => {
  const nextNum = (totalEmployees + 1).toString().padStart(2, '0');

  const [name, setName] = useState('');
  const [role, setRole] = useState('Line Cook');
  const [outlet, setOutlet] = useState<OutletName>('Poes Garden');
  const [shift, setShift] = useState(SHIFT_OPTIONS[0]);
  const [phone, setPhone] = useState('+91 98400 ');
  const [email, setEmail] = useState('');
  const [dutyStatus, setDutyStatus] = useState<DutyStatus>('Off Duty');

  if (!isOpen) return null;

  const generateInitials = (n: string) => {
    const parts = n.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'ST';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const AVATAR_COLORS = [
    '#133E33',
    '#704214',
    '#2B3A4A',
    '#15474A',
    '#4A3222',
    '#5B21B6',
    '#831843',
    '#1E40AF',
    '#0F766E',
    '#9A3412',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = generateInitials(name);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      code: `EMP-${nextNum}`,
      name: name.trim(),
      phone: phone.trim() || '+91 98400 99999',
      avatarInitials: initials,
      avatarBg: randomColor,
      role: role.trim(),
      outlet,
      shift,
      dutyStatus,
      clockIn: dutyStatus === 'Clocked In' ? '15:10' : '-',
      hoursToday: dutyStatus === 'Clocked In' ? '0.2 hrs' : '0 hrs',
      joined: formattedDate,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@m-fd.luxury`,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E3D8] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B2B24] text-[#D4A359] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-semibold text-[#18231E]">
                Onboard New Staff Member
              </h2>
              <p className="text-xs text-[#7A857F]">
                Assign to Fine Dining Roster (EMP-{nextNum})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C9690] hover:text-[#18231E] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C9690] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Chef Rohan Verma"
                className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24]"
              />
            </div>
          </div>

          {/* Role & Outlet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
                Designation / Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Sous Chef / Line Cook"
                className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl px-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
                Outlet *
              </label>
              <select
                value={outlet}
                onChange={(e) => setOutlet(e.target.value as OutletName)}
                className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl px-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24] cursor-pointer"
              >
                {ALL_OUTLETS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shift Schedule */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
              Roster Shift *
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl px-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24] cursor-pointer"
            >
              {SHIFT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C9690] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 00000"
                  className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C9690] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@m-fd.luxury"
                  className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#18231E] focus:bg-white focus:outline-none focus:border-[#0B2B24]"
                />
              </div>
            </div>
          </div>

          {/* Initial Duty Status */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#6B7871] mb-1">
              Current Duty Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Clocked In', 'Off Duty', 'Scheduled'] as DutyStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setDutyStatus(status)}
                  className={`py-2 px-2 rounded-xl text-center font-medium transition-all cursor-pointer ${
                    dutyStatus === status
                      ? 'bg-[#0B2B24] text-white font-semibold shadow-xs'
                      : 'bg-[#FAF8F5] text-[#55635C] border border-[#E8E3D8] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2ECE1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6B7871] hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#D4A359] hover:bg-[#C2934A] text-[#132620] font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Confirm & Add to Directory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
