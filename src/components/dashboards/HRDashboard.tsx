import React, { useState } from 'react';
import {
  Users, Calendar, CheckCircle2, XCircle, AlertTriangle,
  LogOut,
  Building, UserPlus, Search, X
} from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

type ShiftType = 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night (22:00-06:00)';
type DutyStatus = 'Clocked In' | 'On Break' | 'Off Duty' | 'On Leave';
type RequestType = 'Shift Swap' | 'Leave Request';
type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  outlet: string;
  shift: ShiftType;
  status: DutyStatus;
  clockInTime: string;
  hoursWorked: number;
  joinedDate: string;
  phone: string;
}

interface StaffRequest {
  id: string;
  type: RequestType;
  employee: string;
  role: string;
  outlet: string;
  details: string;
  date: string;
  status: RequestStatus;
  reason: string;
  leaveDays?: number;
}

interface ActivityLog {
  id: string;
  employee: string;
  action: string;
  time: string;
  outlet: string;
  type: 'clock-in' | 'clock-out' | 'leave' | 'shift' | 'onboard';
}

export const HRDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'requests' | 'activity'>('roster');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: 'EMP-01', name: 'Chef Rajesh Sharma',  role: 'Executive Chef',   outlet: 'Poes Garden',    shift: 'Evening (15:00-23:00)', status: 'Clocked In',  clockInTime: '14:45', hoursWorked: 7.5, joinedDate: '12 Jan 2023', phone: '+91 98400 11111' },
    { id: 'EMP-02', name: 'Ananya Roy',           role: 'Head Sommelier',   outlet: 'Palavakkam',     shift: 'Evening (15:00-23:00)', status: 'Clocked In',  clockInTime: '15:00', hoursWorked: 7.0, joinedDate: '05 Mar 2022', phone: '+91 98400 22222' },
    { id: 'EMP-03', name: 'Vikram Seth',          role: 'Floor Captain',    outlet: 'Poes Garden',    shift: 'Morning (07:00-15:00)', status: 'Off Duty',    clockInTime: '06:55', hoursWorked: 8.0, joinedDate: '22 Jul 2021', phone: '+91 98400 33333' },
    { id: 'EMP-04', name: 'Priya Sundaram',       role: "Maître d'",        outlet: 'Anna Nagar',     shift: 'Evening (15:00-23:00)', status: 'Clocked In',  clockInTime: '14:50', hoursWorked: 7.2, joinedDate: '18 Sep 2022', phone: '+91 98400 44444' },
    { id: 'EMP-05', name: 'Arjun Kapoor',         role: 'Line Cook',        outlet: 'Egmore',         shift: 'Morning (07:00-15:00)', status: 'Off Duty',    clockInTime: '07:00', hoursWorked: 8.0, joinedDate: '30 Oct 2023', phone: '+91 98400 55555' },
    { id: 'EMP-06', name: 'Kavita Menon',         role: 'Pastry Chef',      outlet: 'Poes Garden',    shift: 'Morning (07:00-15:00)', status: 'Off Duty',    clockInTime: '06:45', hoursWorked: 8.5, joinedDate: '14 Feb 2021', phone: '+91 98400 66666' },
    { id: 'EMP-07', name: 'Siddharth Rao',        role: 'Senior Bartender', outlet: 'Palavakkam',     shift: 'Night (22:00-06:00)',   status: 'On Break',    clockInTime: '21:50', hoursWorked: 4.0, joinedDate: '07 Jun 2022', phone: '+91 98400 77777' },
    { id: 'EMP-08', name: 'Meera Patel',          role: 'Guest Relations',  outlet: 'Anna Nagar',     shift: 'Evening (15:00-23:00)', status: 'On Leave',    clockInTime: '--:--', hoursWorked: 0,   joinedDate: '11 Nov 2023', phone: '+91 98400 88888' },
  ]);

  const [requests, setRequests] = useState<StaffRequest[]>([
    { id: 'REQ-101', type: 'Shift Swap',    employee: 'Vikram Seth',    role: 'Floor Captain',  outlet: 'Poes Garden', details: 'Swap Evening shift on 15 Sep with Ananya Roy', date: '12 Sep 2026', status: 'Pending',  reason: 'Family engagement' },
    { id: 'REQ-102', type: 'Leave Request', employee: 'Meera Patel',    role: 'Guest Relations',outlet: 'Anna Nagar',  details: 'Casual leave for 2 days (14–15 Sep)',          date: '11 Sep 2026', status: 'Approved', reason: 'Medical appointment', leaveDays: 2 },
    { id: 'REQ-103', type: 'Shift Swap',    employee: 'Kavita Menon',   role: 'Pastry Chef',    outlet: 'Poes Garden', details: 'Swap Morning shift on 16 Sep with Arjun K.',   date: '10 Sep 2026', status: 'Pending',  reason: 'Personal errand' },
    { id: 'REQ-104', type: 'Leave Request', employee: 'Arjun Kapoor',   role: 'Line Cook',      outlet: 'Egmore',      details: 'Sick leave — 13 Sep',                          date: '12 Sep 2026', status: 'Rejected', reason: 'Critical event day — cover required', leaveDays: 1 },
    { id: 'REQ-105', type: 'Leave Request', employee: 'Siddharth Rao',  role: 'Sr. Bartender',  outlet: 'Palavakkam',  details: 'Annual leave 18–20 Sep (3 days)',               date: '09 Sep 2026', status: 'Pending',  reason: 'Pre-planned holiday', leaveDays: 3 },
  ]);

  const [activityLog] = useState<ActivityLog[]>([
    { id: 'ACT-01', employee: 'Chef Rajesh Sharma', action: 'Clocked In',                outlet: 'Poes Garden', time: 'Today, 14:45', type: 'clock-in'  },
    { id: 'ACT-02', employee: 'Ananya Roy',          action: 'Clocked In',                outlet: 'Palavakkam',  time: 'Today, 15:00', type: 'clock-in'  },
    { id: 'ACT-03', employee: 'Meera Patel',         action: 'Leave Approved (2 days)',   outlet: 'Anna Nagar',  time: 'Today, 10:32', type: 'leave'     },
    { id: 'ACT-04', employee: 'Vikram Seth',         action: 'Shift Swap Requested',      outlet: 'Poes Garden', time: 'Today, 09:15', type: 'shift'     },
    { id: 'ACT-05', employee: 'Siddharth Rao',       action: 'On Break',                  outlet: 'Palavakkam',  time: 'Today, 02:00', type: 'clock-out' },
    { id: 'ACT-06', employee: 'Arjun Kapoor',        action: 'Clocked Out',               outlet: 'Egmore',      time: 'Yesterday, 15:02', type: 'clock-out' },
    { id: 'ACT-07', employee: 'Kavita Menon',        action: 'Clocked Out',               outlet: 'Poes Garden', time: 'Yesterday, 15:18', type: 'clock-out' },
    { id: 'ACT-08', employee: 'Priya Sundaram',      action: 'Leave Request Submitted',   outlet: 'Anna Nagar',  time: 'Yesterday, 09:00', type: 'leave'  },
  ]);

  const [onboardForm, setOnboardForm] = useState({
    name: '', role: 'Waiter', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)' as ShiftType, phone: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRequestAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Request ${id} ${newStatus.toLowerCase()} successfully.`);
  };

  const handleOnboardStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name) return;
    const newEmp: StaffMember = {
      id: `EMP-0${staffList.length + 1}`,
      name: onboardForm.name,
      role: onboardForm.role,
      outlet: onboardForm.outlet,
      shift: onboardForm.shift,
      status: 'Off Duty',
      clockInTime: '--:--',
      hoursWorked: 0,
      joinedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      phone: onboardForm.phone || '—',
    };
    setStaffList([newEmp, ...staffList]);
    setShowOnboardModal(false);
    showToast(`${onboardForm.name} onboarded successfully!`);
    setOnboardForm({ name: '', role: 'Waiter', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)', phone: '' });
  };

  const filteredStaff = staffList.filter(s => {
    const matchesOutlet = selectedOutlet === 'all' || s.outlet.toLowerCase().includes(selectedOutlet.toLowerCase());
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.outlet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOutlet && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  const statusColors: Record<DutyStatus, string> = {
    'Clocked In': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Break':   'bg-amber-50  text-amber-700  border-amber-200',
    'On Leave':   'bg-purple-50 text-purple-700 border-purple-200',
    'Off Duty':   'bg-gray-100  text-gray-600   border-gray-200',
  };

  const activityIcon: Record<ActivityLog['type'], string> = {
    'clock-in':  '🟢',
    'clock-out': '⚫',
    'leave':     '🟣',
    'shift':     '🔵',
    'onboard':   '✨',
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] font-sans antialiased pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2D4030] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#C5A059]/40">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#2D4030] text-white sticky top-10 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A059] flex items-center justify-center text-[#2D4030] shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-wide font-serif">STAFFING & ROSTER</h1>
                <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {user.role ? user.role.toUpperCase() : 'HR'}
                </span>
              </div>
              <p className="text-xs text-green-200/80">Mayflower Fine Dining — Human Resources</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onSwitchRole && (
              <select
                onChange={(e) => onSwitchRole(e.target.value)}
                defaultValue="hr-roster"
                className="bg-[#1e2c21] text-xs text-[#E8E4DB] border border-green-700/50 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#C5A059]"
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
              onClick={() => setShowOnboardModal(true)}
              className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#2D4030] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Onboard</span>
            </button>

            <button
              onClick={onLogout}
              className="text-xs text-red-300 hover:text-red-100 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Total Staff</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{staffList.length}</div>
            <div className="text-xs text-[#5A5A40] mt-1">{staffList.filter(s => s.status === 'Clocked In').length} currently on duty</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">On Leave Today</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{staffList.filter(s => s.status === 'On Leave').length}</div>
            <div className="text-xs text-[#5A5A40] mt-1">Staff on approved leave</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Pending Requests</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{pendingCount}</div>
            <div className="text-xs text-amber-600 mt-1 font-medium">Action required</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Outlets Covered</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">4</div>
            <div className="text-xs text-[#5A5A40] mt-1">Poes Garden, Anna Nagar + 2</div>
          </div>
        </div>

        {/* Tab Bar + Outlet Filter */}
        <div className="bg-white rounded-2xl border border-[#E8E4DB] p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E8E4DB] w-full lg:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'roster' ? 'bg-[#2D4030] text-white shadow-sm' : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              👥 Staff Directory & Shifts
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'requests' ? 'bg-[#2D4030] text-white shadow-sm' : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              <span>📋 Shift & Leave Requests</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'activity' ? 'bg-[#2D4030] text-white shadow-sm' : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              📊 Activity Log
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-[#5A5A40] whitespace-nowrap flex items-center space-x-1">
              <Building className="w-3.5 h-3.5" />
              <span>Outlet:</span>
            </span>
            {[
              { id: 'all',        label: 'All'         },
              { id: 'poes',       label: 'Poes Garden' },
              { id: 'palavakkam', label: 'Palavakkam'  },
              { id: 'anna',       label: 'Anna Nagar'  },
              { id: 'egmore',     label: 'Egmore'      },
            ].map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOutlet(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  selectedOutlet === o.id
                    ? 'bg-[#C5A059] text-[#2D4030] border-[#C5A059] font-bold'
                    : 'bg-white text-[#5A5A40] border-[#E8E4DB] hover:bg-[#FAF7F2]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: Staff Directory & Shifts */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E4DB]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, role, or outlet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div className="text-xs text-[#5A5A40] font-medium">
                Showing <span className="font-bold text-[#1A1A1A]">{filteredStaff.length}</span> of {staffList.length} employees
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#2D4030] text-white">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Employee</th>
                      <th className="px-4 py-3.5 font-semibold">Role</th>
                      <th className="px-4 py-3.5 font-semibold">Outlet</th>
                      <th className="px-4 py-3.5 font-semibold">Shift</th>
                      <th className="px-4 py-3.5 font-semibold">Duty Status</th>
                      <th className="px-4 py-3.5 font-semibold">Clock-In</th>
                      <th className="px-4 py-3.5 font-semibold">Hours Today</th>
                      <th className="px-4 py-3.5 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DB]">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#1A1A1A] text-sm">{staff.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{staff.id} · {staff.phone}</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#2D4030]">{staff.role}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {staff.outlet}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#5A5A40] font-medium">{staff.shift}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[staff.status]}`}>
                            {staff.status === 'Clocked In' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />}
                            {staff.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[#5A5A40]">{staff.clockInTime}</td>
                        <td className="px-4 py-3.5 font-bold text-[#2D4030]">{staff.hoursWorked > 0 ? `${staff.hoursWorked} hrs` : '—'}</td>
                        <td className="px-4 py-3.5 text-[#5A5A40]">{staff.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Shift Swaps & Leave Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#2D4030]">Shift & Leave Requests</h2>
                <p className="text-xs text-[#5A5A40] mt-0.5">{pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting your action</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm space-y-4 ${
                    req.status === 'Pending' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-[#E8E4DB]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{req.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.type === 'Shift Swap'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {req.type === 'Shift Swap' ? '🔄 Shift Swap' : `🗓️ Leave${req.leaveDays ? ` (${req.leaveDays}d)` : ''}`}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : req.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-[#1A1A1A] text-sm">{req.employee}</div>
                    <div className="text-xs text-[#5A5A40]">{req.role} · {req.outlet}</div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E4DB] text-xs space-y-1">
                    <div className="font-semibold text-[#2D4030]">{req.details}</div>
                    <div className="text-gray-500">Reason: {req.reason}</div>
                    <div className="text-[10px] text-gray-400 pt-1">Submitted: {req.date}</div>
                  </div>

                  {req.status === 'Pending' ? (
                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        onClick={() => handleRequestAction(req.id, 'Approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'Rejected')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic text-center pt-1">
                      Action already completed for {req.id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Activity Log */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#2D4030]">Employee Activity Log</h2>
                <p className="text-xs text-[#5A5A40] mt-0.5">Recent clock-ins, leave updates, and shift changes across all outlets</p>
              </div>
              <span className="text-xs bg-[#2D4030]/10 text-[#2D4030] px-3 py-1.5 rounded-xl font-semibold">{activityLog.length} Events</span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden shadow-sm">
              <div className="divide-y divide-[#E8E4DB]">
                {activityLog.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#FAF7F2] transition">
                    <div className="flex items-center space-x-4">
                      <span className="text-xl">{activityIcon[log.type]}</span>
                      <div>
                        <div className="font-bold text-[#1A1A1A] text-sm">{log.employee}</div>
                        <div className="text-xs text-[#5A5A40]">{log.action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#2D4030]">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[11px]">
                          {log.outlet}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Onboard Staff Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleOnboardStaff} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8E4DB]">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <div className="flex items-center space-x-2 text-[#2D4030]">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-lg">Onboard New Staff</h3>
              </div>
              <button type="button" onClick={() => setShowOnboardModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Full Name *</label>
                <input
                  type="text" required placeholder="e.g. Rahul Verma"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Phone Number</label>
                <input
                  type="text" placeholder="+91 98400 XXXXX"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Role / Position *</label>
                <select
                  value={onboardForm.role}
                  onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option>Executive Chef</option>
                  <option>Sous Chef</option>
                  <option>Line Cook</option>
                  <option>Pastry Chef</option>
                  <option>Head Sommelier</option>
                  <option>Maître d'</option>
                  <option>Floor Captain</option>
                  <option>Waiter</option>
                  <option>Guest Relations</option>
                  <option>Senior Bartender</option>
                  <option>Cashier</option>
                  <option>Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Outlet Assignment *</label>
                <select
                  value={onboardForm.outlet}
                  onChange={(e) => setOnboardForm({ ...onboardForm, outlet: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option>Poes Garden</option>
                  <option>Palavakkam</option>
                  <option>Anna Nagar</option>
                  <option>Egmore</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Assigned Shift *</label>
                <select
                  value={onboardForm.shift}
                  onChange={(e) => setOnboardForm({ ...onboardForm, shift: e.target.value as ShiftType })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option>Morning (07:00-15:00)</option>
                  <option>Evening (15:00-23:00)</option>
                  <option>Night (22:00-06:00)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#2D4030] hover:bg-[#1e2c21] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Complete Onboarding
              </button>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
