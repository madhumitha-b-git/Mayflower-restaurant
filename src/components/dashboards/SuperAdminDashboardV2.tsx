import React, { useState } from 'react';
import { TabType, UserProfile } from '../../types';
import { TopUtilityBar } from '../TopUtilityBar';
import { MainHeader } from '../MainHeader';
import { MasterFooter } from '../MasterFooter';
import { OverviewView } from '../../views/OverviewView';
import { StaffView } from '../../views/StaffView';
import { CustomersView } from '../../views/CustomersView';
import { OutletsView } from '../../views/OutletsView';
import { RolesPermissionsView } from '../../views/RolesPermissionsView';
import { AuditLogView } from '../../views/AuditLogView';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

export const SuperAdminDashboardV2: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showLogoutNotice, setShowLogoutNotice] = useState(false);

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setShowLogoutNotice(true);
    setTimeout(() => {
      setShowLogoutNotice(false);
      setActiveTab('overview');
      onLogout();
    }, 2500);
  };

  const handleNavigateHome = () => {
    setActiveTab('overview');
    onSwitchRole?.('SuperAdmin');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1D2B24] flex flex-col antialiased selection:bg-[#C29B38] selection:text-white">
      <TopUtilityBar
        activeRole={user.role || 'SuperAdmin'}
        onNavigateHome={handleNavigateHome}
        onLogout={handleLogout}
      />

      <MainHeader activeTab={activeTab} onSelectTab={handleNavigate} />

      {showLogoutNotice && (
        <div className="bg-[#14261F] text-white px-6 py-2.5 text-center text-xs font-mono border-b border-[#2C4A3C] flex items-center justify-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Session securely invalidated. Re-authenticated with Chennai HQ hardware key as Super Admin.</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <OverviewView onNavigate={handleNavigate} />}
        {activeTab === 'staff' && <StaffView />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'outlets' && <OutletsView />}
        {activeTab === 'roles-permissions' && <RolesPermissionsView onNavigate={handleNavigate} />}
        {activeTab === 'audit-log' && <AuditLogView />}
      </main>

      <MasterFooter />
    </div>
  );
};

export default SuperAdminDashboardV2;
