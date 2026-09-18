import React, { useState } from 'react';
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
  onUpdateUser?: (user: UserProfile) => void;
}

export const RoleDashboard: React.FC<Props> = ({ user, onLogout, onBackToWebsite, onOpenReservations, onUpdateUser }) => {
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
      default:            return <CustomerDashboard    user={user} onLogout={onLogout} onOpenReservations={onOpenReservations} onSwitchRole={switchHandler} onUpdateUser={onUpdateUser} onBackToWebsite={onBackToWebsite} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Persistent fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#081C15] border-b border-[#C5A880]/20 text-gray-200 flex items-center justify-between px-4 sm:px-8 h-12 shadow-md">
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-stone-300 hover:text-[#DFC993] transition-colors uppercase font-medium group cursor-pointer focus:outline-none"
        >
          <svg
            className="w-4 h-4 text-[#C5A880] group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold tracking-widest text-[11px]">BACK TO HOME</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-4 text-xs tracking-wider">
          <button
            onClick={() => {
              if (activeRole === 'Customer') {
                window.dispatchEvent(new CustomEvent('open-patron-profile'));
              }
            }}
            className={`text-stone-300 hover:text-[#DFC993] transition-colors text-left focus:outline-none ${activeRole === 'Customer' ? 'cursor-pointer' : 'cursor-default'}`}
            title={activeRole === 'Customer' ? 'View Patron Profile' : undefined}
          >
            Logged in as <strong className="text-white font-semibold ml-0.5">{user.name}</strong>
          </button>
          <span className="border border-[#C5A880]/70 text-[#DFC993] bg-[#C5A880]/10 text-[10px] tracking-widest px-2.5 py-0.5 rounded font-semibold uppercase shadow-xs">
            {isSuperAdmin && activeRole !== 'SuperAdmin' ? `VIEWING: ${activeRole.toUpperCase()}` : (userRole || 'CUSTOMER').toUpperCase()}
          </span>
          {activeRole === 'Customer' && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-patron-profile'))}
              className="text-stone-400 hover:text-[#DFC993] uppercase font-semibold text-[11px] tracking-widest transition-colors pl-1 cursor-pointer focus:outline-none"
            >
              ACCOUNT
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-stone-400 hover:text-red-300 uppercase font-semibold text-[11px] tracking-widest transition-colors pl-1 cursor-pointer focus:outline-none ml-1 border-l border-[#C5A880]/30 pl-3"
          >
            LOGOUT
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
