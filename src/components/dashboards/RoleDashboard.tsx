import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { SuperAdminDashboardV2 } from './SuperAdminDashboardV2';
import { OwnerDashboard } from './OwnerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { ChefDashboard } from './ChefDashboard';
import { HRDashboard } from './HRDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { CustomerDashboard } from './CustomerDashboard';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onOpenReservations?: () => void;
}

export const RoleDashboard: React.FC<Props> = ({ user, onLogout, onBackToWebsite, onOpenReservations }) => {
  const userRole = user.role || 'Customer';
  const isSuperAdmin = userRole === 'SuperAdmin';

  // SuperAdmin can switch views; all other roles are strictly locked to their own dashboard
  const [activeRole, setActiveRole] = useState<UserRole>(userRole as UserRole);

  const handleSwitchRole = (rolePathOrName: string) => {
    if (!isSuperAdmin) return;
    const map: Record<string, UserRole> = {
      'owner-management': 'Owner',   'Owner': 'Owner',
      'admin-suite': 'Admin',        'Admin': 'Admin',
      'manager-operations': 'Manager', 'Manager': 'Manager',
      'chef-kitchen': 'Chef',        'Chef': 'Chef',
      'hr-roster': 'HR',             'HR': 'HR',
      'accountant-ledger': 'Accountant', 'Accountant': 'Accountant',
      'customer-portal': 'Customer', 'Customer': 'Customer',
      'SuperAdmin': 'SuperAdmin',
    };
    setActiveRole(map[rolePathOrName] ?? (userRole as UserRole));
  };

  const switchHandler = isSuperAdmin ? handleSwitchRole : undefined;

  const renderDashboard = () => {
    switch (activeRole) {
      case 'SuperAdmin':  return <SuperAdminDashboardV2 user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Owner':       return <OwnerDashboard       user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Admin':       return <AdminDashboard       user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Manager':     return <ManagerDashboard     user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Chef':        return <ChefDashboard        user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'HR':          return <HRDashboard          user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Accountant':  return <AccountantDashboard  user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      default:            return <CustomerDashboard    user={user} onLogout={onLogout} onOpenReservations={onOpenReservations} onSwitchRole={switchHandler} onUpdateUser={undefined} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Persistent fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#02150c] border-b border-[#C5A880]/40 text-white flex items-center justify-between px-4 sm:px-8 h-11 shadow-md">
        <button
          onClick={onBackToWebsite}
          className="flex items-center space-x-2 text-xs font-semibold text-[#C5A880] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-sans tracking-wide">Back to Mayflower Website</span>
        </button>
        <div className="flex items-center space-x-4 text-xs text-[#D1CDBC]">
          <span className="hidden sm:inline text-gray-400">Logged in as</span>
          <span className="font-bold text-white font-serif tracking-wide">{user.name}</span>
          <span className="bg-[#152a20] text-[#C5A880] border border-[#C5A880]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {isSuperAdmin && activeRole !== 'SuperAdmin' ? `Viewing: ${activeRole}` : userRole}
          </span>
          <button
            onClick={onLogout}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest cursor-pointer ml-2 border-l border-[#C5A880]/30 pl-3 py-0.5"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Role dashboard content with top offset */}
      <div className="flex-1 pt-11">
        {renderDashboard()}
      </div>
    </div>
  );
};
