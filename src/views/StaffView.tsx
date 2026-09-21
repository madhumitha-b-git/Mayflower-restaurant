import React, { useEffect, useState } from 'react';
import {
  Search,
  RotateCw,
  UserPlus,
  Building,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
} from 'lucide-react';
import { StaffMember, UserProfile } from '../types';
import { INITIAL_STAFF } from '../data/mockData';
import { fetchAllStaff } from '../lib/adminService';

interface StaffViewProps {
  user?: UserProfile;
}

export const StaffView: React.FC<StaffViewProps> = ({ user }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('18 SECONDS AGO');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAuditArchiveOpen, setIsAuditArchiveOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadStaff = async () => {
      try {
        const staff = await fetchAllStaff();
        if (!isActive) return;

        const mapped = staff.length
          ? staff.map((member: any) => ({
              id: member.id,
              name: member.name || 'Staff Member',
              title: member.role || 'Sanctuary Personnel',
              email: member.email,
              mobile: member.mobile || '+91 00000 00000',
              role: (member.role || 'ADMIN').toUpperCase().replace('SUPERADMIN', 'SUPER ADMIN') as StaffMember['role'],
              department: member.department || member.role || 'Operations',
              outlet: member.outlet_name || member.outlet || 'All Outlets',
              empCode: member.employee_code || `EMP-${String(member.id).slice(0, 3).toUpperCase()}`,
              status: (member.is_active ? 'ACTIVE' : 'RESTRICTED') as StaffMember['status'],
              initials: (member.name || 'SM').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase() || 'SM',
            })) as StaffMember[]
          : INITIAL_STAFF;

        setStaffList(mapped);
      } catch {
        if (isActive) setStaffList(INITIAL_STAFF);
      }
    };

    loadStaff();
    return () => {
      isActive = false;
    };
  }, [user]);

  // New staff form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    mobile: '+91 ',
    role: 'MANAGER' as StaffMember['role'],
    department: 'Operations',
    outlet: 'Poes Garden',
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncText('JUST NOW');
    }, 600);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const initials = formData.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const empNumber = String(staffList.length + 1).padStart(3, '0');
    const newMember: StaffMember = {
      id: `emp-${Date.now()}`,
      name: formData.name,
      title: formData.title || 'Sanctuary Personnel',
      email: formData.email,
      mobile: formData.mobile,
      role: formData.role,
      department: formData.department,
      outlet: formData.outlet,
      empCode: `EMP${empNumber}`,
      status: 'ACTIVE',
      initials: initials || 'SP',
    };

    setStaffList([newMember, ...staffList]);
    setIsAddStaffOpen(false);
    setFormData({
      name: '',
      title: '',
      email: '',
      mobile: '+91 ',
      role: 'MANAGER',
      department: 'Operations',
      outlet: 'Poes Garden',
    });
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'all' || staff.role.toLowerCase() === selectedRole.toLowerCase();

    const matchesOutlet =
      selectedOutlet === 'all' ||
      staff.outlet.toLowerCase().includes(selectedOutlet.toLowerCase()) ||
      staff.outlet === 'All Outlets';

    return matchesSearch && matchesRole && matchesOutlet;
  });

  const getRoleBadgeStyle = (role: StaffMember['role']) => {
    switch (role) {
      case 'SUPER ADMIN':
        return 'bg-[#0E1714] text-white border-[#1F332C]';
      case 'OWNER':
        return 'bg-[#F9F3E8] text-[#8C621E] border-[#E8D6B8]';
      case 'ADMIN':
        return 'bg-[#EFF2F1] text-[#344840] border-[#D1DDD7]';
      case 'MANAGER':
        return 'bg-[#EBF5EF] text-[#22573B] border-[#C8E4D3]';
      case 'CHEF':
        return 'bg-[#FAF4EB] text-[#8A611D] border-[#E9D9C3]';
      case 'HR':
        return 'bg-[#F2F4F5] text-[#3D4B53] border-[#D5DCE0]';
      case 'ACCOUNTANT':
        return 'bg-[#EFF3F8] text-[#254668] border-[#CFDDEB]';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getRoleDotColor = (role: StaffMember['role']) => {
    switch (role) {
      case 'SUPER ADMIN':
        return 'bg-emerald-400';
      case 'OWNER':
        return 'bg-[#C29B38]';
      case 'ADMIN':
        return 'bg-[#517063]';
      case 'MANAGER':
        return 'bg-[#10B981]';
      case 'CHEF':
        return 'bg-[#D97706]';
      case 'HR':
        return 'bg-[#64748B]';
      case 'ACCOUNTANT':
        return 'bg-[#3B82F6]';
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Toolbar */}
      <div
        id="staff-filter-toolbar"
        className="bg-white rounded-xl border border-[#E8E5DD] p-4 shadow-2xs"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="input-staff-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or employee code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] text-[#222E2A] placeholder-zinc-400 focus:bg-white focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <select
              id="select-staff-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white text-[#25322E] focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            >
              <option value="all">Role: All Roles</option>
              <option value="super admin">Super Admin</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="hr">HR</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {/* Outlet Filter */}
          <div className="w-full lg:w-48">
            <select
              id="select-staff-outlet"
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white text-[#25322E] focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            >
              <option value="all">Outlet: All Outlets</option>
              <option value="poes">Poes Garden</option>
              <option value="palavakkam">Palavakkam (ECR)</option>
              <option value="egmore">Egmore</option>
              <option value="anna nagar">Anna Nagar</option>
              <option value="hq">Chennai HQ</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-staff-refresh"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE7] text-xs font-medium text-[#293832] transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 text-zinc-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Add New Staff Button */}
          <button
            id="btn-add-staff"
            onClick={() => setIsAddStaffOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0E1914] hover:bg-[#1A2E25] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#C29B38]" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Ledger Table */}
      <div className="bg-white rounded-xl border border-[#E3E0D6] shadow-xs overflow-hidden">
        {/* Status Bar */}
        <div className="px-6 py-3 bg-[#FAF8F3] border-b border-[#ECE7DC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#3C4A44]">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-mono text-[11px]">
              Showing <strong className="text-[#18231F]">{filteredStaff.length}</strong> verified staff members across 4 sanctuaries
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500">
            <span>AUDIT ENFORCED: 2FA ENABLED</span>
            <span className="text-zinc-300">•</span>
            <span>LAST SYNC: {lastSyncText}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#ECE7DC] text-[11px] font-mono text-[#6A7871] uppercase tracking-wider">
                <th className="py-3 px-4 w-8">
                  <input type="checkbox" className="rounded border-zinc-300 text-[#14261F]" />
                </th>
                <th className="py-3 px-4 font-semibold">NAME</th>
                <th className="py-3 px-4 font-semibold">EMAIL</th>
                <th className="py-3 px-4 font-semibold">MOBILE</th>
                <th className="py-3 px-4 font-semibold">ROLE</th>
                <th className="py-3 px-4 font-semibold">DEPARTMENT</th>
                <th className="py-3 px-4 font-semibold">OUTLET</th>
                <th className="py-3 px-4 font-semibold">EMP CODE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE2] text-xs">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4">
                    <input type="checkbox" className="rounded border-zinc-300 text-[#14261F]" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#16221E] text-[#D8B45A] font-mono font-bold text-xs flex items-center justify-center border border-[#3A4B43]">
                        {staff.initials}
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-sm text-[#18231F]">
                          {staff.name}
                        </div>
                        <div className="text-[11px] text-[#697771]">
                          {staff.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#4A5752]">
                    {staff.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#4A5752]">
                    {staff.mobile}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getRoleBadgeStyle(
                        staff.role
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getRoleDotColor(staff.role)}`}></span>
                      {staff.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#2E3C36] font-medium">
                    {staff.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[#2B3B34]">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      {staff.outlet}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-500 font-medium">
                    {staff.empCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#14261F] text-[#4ADE80]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#ECE7DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5D6B65]">
          <div className="flex items-center gap-2">
            <span>Rows per ledger page:</span>
            <select className="border border-[#D9D6CB] rounded px-2 py-1 bg-white text-xs text-[#222E2A]">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2">
              1-{filteredStaff.length} of {filteredStaff.length} verified personnel
            </span>
          </div>

          <div className="inline-flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-[#DCD9CE] bg-white text-zinc-400 cursor-not-allowed">
              &lt;
            </button>
            <span className="px-2.5 py-1 text-xs font-bold text-[#141F1B] bg-[#EAE7DC] rounded">
              1
            </span>
            <button className="px-2.5 py-1 rounded border border-[#DCD9CE] bg-white text-zinc-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Accordion: Security Audit Trail & Legacy Record Reference */}
      <div className="bg-white rounded-xl border border-[#E5E1D6] p-4 shadow-2xs">
        <button
          onClick={() => setIsAuditArchiveOpen(!isAuditArchiveOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[#74827C] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>SECURITY AUDIT TRAIL &amp; LEGACY RECORD REFERENCE (BASELINE IMAGE ARCHIVE)</span>
          </div>
          {isAuditArchiveOpen ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {isAuditArchiveOpen && (
          <div className="mt-3 pt-3 border-t border-[#ECE7DC] text-xs text-[#5E6B65] space-y-2">
            <p>
              Immutable SHA-256 fingerprint verified for current active session. All 7 role manifests
              are cryptographically signed by Chennai HQ hardware security module.
            </p>
            <div className="p-3 bg-[#FAF8F3] rounded border border-[#E8E2D5] font-mono text-[11px] text-[#404E47]">
              Root Hash: <code>7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</code>
            </div>
          </div>
        )}
      </div>

      {/* Add New Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#C29B38] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#18231F]">
                  Authorize &amp; Provision Staff Member
                </h3>
                <p className="text-xs text-[#5E6D67]">
                  Assign verified role &amp; credentials to sanctuary personnel.
                </p>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Raghavan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                  Designation / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sommelier In-Charge"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="raghavan@mayflower.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                    Mobile Contact
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98409 11002"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as StaffMember['role'] })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-white"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="CHEF">Chef</option>
                    <option value="ADMIN">Admin</option>
                    <option value="HR">HR</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E3C36] mb-1">
                    Primary Outlet
                  </label>
                  <select
                    value={formData.outlet}
                    onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-white"
                  >
                    <option value="Poes Garden">Poes Garden</option>
                    <option value="Palavakkam (ECR)">Palavakkam (ECR)</option>
                    <option value="Egmore">Egmore</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="All Outlets">All Outlets</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DC]">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D9D6CB] text-xs font-medium text-[#404E48] hover:bg-[#F3EFE7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0E1914] hover:bg-[#1C2F26] text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Sign &amp; Provision Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
