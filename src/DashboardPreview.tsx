import { useState } from 'react';
import { RoleDashboard } from './components/dashboards/RoleDashboard';
import { UserRole, UserProfile } from './types';

const MOCK_PREVIEW_USER: UserProfile = {
  id: 'preview-user-1',
  email: 'admin@mayflower.com',
  name: 'Mayflower Administrator',
  phone: '+91 98765 43210',
  rewardPoints: 1200,
  tier: 'Gold',
  role: 'Manager',
  totalVisits: 14,
  joinedDate: '2026-01-01',
  transactions: [],
};

const DASHBOARD_ROLES: UserRole[] = [
  'SuperAdmin',
  'Owner',
  'Admin',
  'Manager',
  'Chef',
  'HR',
  'Accountant',
  'Customer',
];

export function DashboardPreview() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Manager');

  const demoUser: UserProfile = {
    ...MOCK_PREVIEW_USER,
    role: selectedRole,
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Top Bar Role Selector */}
      <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg text-[#C5A880]">The Mayflower</span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Dashboard Switcher</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {DASHBOARD_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
                selectedRole === r
                  ? 'bg-[#C5A880] text-black font-medium'
                  : 'bg-[#222] text-gray-400 hover:text-white'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Role Dashboard Component */}
      <RoleDashboard
        user={demoUser}
        onLogout={() => alert('Logged out preview')}
        onBackToWebsite={() => alert('Back to website preview')}
        onOpenReservations={() => alert('Open reservations preview')}
      />
    </div>
  );
}

export default DashboardPreview;
