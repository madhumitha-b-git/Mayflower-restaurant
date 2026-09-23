import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { SuperAdminDashboardV2 } from './SuperAdminDashboardV2';
import { OwnerDashboard } from './OwnerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { ChefDashboard } from './ChefDashboard';
import { HRDashboard } from './HRDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { AccountProfileModal } from './AccountProfileModal';
import { getRoleHomePath, useSafeNavigate, useSafeLocation } from '../../routes/roleRoutes';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onBackToWebsite?: () => void;
  onOpenReservations?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
  children?: React.ReactNode;
}

export const RoleDashboard: React.FC<Props> = ({
  user,
  onLogout,
  onBackToWebsite,
  onOpenReservations,
  onUpdateUser,
  children,
}) => {
  const navigate = useSafeNavigate();
  const location = useSafeLocation();
  const userRole = user.role || 'Customer';
  const isSuperAdmin = userRole === 'SuperAdmin';
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // SuperAdmin can switch views; all other roles are strictly locked to their own dashboard
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (!isSuperAdmin) return userRole as UserRole;
    if (location.pathname.startsWith('/admin')) return 'Admin';
    if (location.pathname.startsWith('/manager')) return 'Manager';
    if (location.pathname.startsWith('/chef')) return 'Chef';
    if (location.pathname.startsWith('/hr')) return 'HR';
    if (location.pathname.startsWith('/accountant')) return 'Accountant';
    if (location.pathname.startsWith('/owner')) return 'Owner';
    if (location.pathname.startsWith('/customer')) return 'Customer';
    return 'SuperAdmin';
  });

  useEffect(() => {
    if (isSuperAdmin) {
      if (location.pathname.startsWith('/admin')) setActiveRole('Admin');
      else if (location.pathname.startsWith('/manager')) setActiveRole('Manager');
      else if (location.pathname.startsWith('/chef')) setActiveRole('Chef');
      else if (location.pathname.startsWith('/hr')) setActiveRole('HR');
      else if (location.pathname.startsWith('/accountant')) setActiveRole('Accountant');
      else if (location.pathname.startsWith('/owner')) setActiveRole('Owner');
      else if (location.pathname.startsWith('/customer')) setActiveRole('Customer');
      else if (location.pathname.startsWith('/superadmin')) setActiveRole('SuperAdmin');
    }
  }, [location.pathname, isSuperAdmin]);

  // Global event listener for opening account / profile modal from anywhere inside dashboards
  useEffect(() => {
    const handleOpenAccount = () => {
      setIsAccountModalOpen(true);
    };

    window.addEventListener('open-account-modal', handleOpenAccount);
    window.addEventListener('open-patron-profile', handleOpenAccount);
    return () => {
      window.removeEventListener('open-account-modal', handleOpenAccount);
      window.removeEventListener('open-patron-profile', handleOpenAccount);
    };
  }, []);

  const handleSwitchRole = (rolePathOrName: string) => {
    if (!isSuperAdmin) return;
    const map: Record<string, UserRole> = {
      'owner-management': 'Owner',
      'Owner': 'Owner',
      'admin-suite': 'Admin',
      'Admin': 'Admin',
      'manager-operations': 'Manager',
      'Manager': 'Manager',
      'chef-kitchen': 'Chef',
      'Chef': 'Chef',
      'hr-roster': 'HR',
      'HR': 'HR',
      'accountant-ledger': 'Accountant',
      'Accountant': 'Accountant',
      'customer-portal': 'Customer',
      'Customer': 'Customer',
      'SuperAdmin': 'SuperAdmin',
    };
    const targetRole = map[rolePathOrName] ?? (userRole as UserRole);
    setActiveRole(targetRole);
    navigate(getRoleHomePath(targetRole));
  };

  const handleHomeClick = () => {
    if (onBackToWebsite) {
      onBackToWebsite();
    }
    navigate('/');
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const switchHandler = isSuperAdmin ? handleSwitchRole : undefined;

  const renderDashboard = () => {
    if (children) return children;

    switch (activeRole) {
      case 'SuperAdmin':
        return <SuperAdminDashboardV2 user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'Owner':
        return <OwnerDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'Admin':
        return <AdminDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'Manager':
        return <ManagerDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'Chef':
        return <ChefDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'HR':
        return <HRDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      case 'Accountant':
        return <AccountantDashboard user={user} onLogout={handleLogoutClick} onSwitchRole={switchHandler} />;
      default:
        return (
          <CustomerDashboard
            user={user}
            onLogout={handleLogoutClick}
            onOpenReservations={onOpenReservations}
            onSwitchRole={switchHandler}
            onUpdateUser={onUpdateUser}
            onBackToWebsite={handleHomeClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Persistent fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#081C15] border-b border-[#C5A880]/20 text-gray-200 flex items-center justify-between px-4 sm:px-8 h-12 shadow-md">
        <button
          onClick={handleHomeClick}
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
            onClick={() => setIsAccountModalOpen(true)}
            className="text-stone-300 hover:text-[#DFC993] transition-colors text-left focus:outline-none cursor-pointer"
            title="View & Edit Account Details / Reset Password"
          >
            Logged in as <strong className="text-white font-semibold ml-0.5 underline decoration-[#C5A880]/40 underline-offset-2">{user.name}</strong>
          </button>
          <span className="border border-[#C5A880]/70 text-[#DFC993] bg-[#C5A880]/10 text-[10px] tracking-widest px-2.5 py-0.5 rounded font-semibold uppercase shadow-xs">
            {isSuperAdmin && activeRole !== 'SuperAdmin' ? `VIEWING: ${activeRole.toUpperCase()}` : (userRole || 'CUSTOMER').toUpperCase()}
          </span>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="text-stone-400 hover:text-[#DFC993] uppercase font-semibold text-[11px] tracking-widest transition-colors pl-1 cursor-pointer focus:outline-none"
            title="Open Account Section & Reset Password"
          >
            ACCOUNT
          </button>
          <button
            onClick={handleLogoutClick}
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

      {/* Universal Account & Reset Password Modal for All Roles */}
      <AccountProfileModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
};
