import React, { useState } from 'react';
import { TabType, UserProfile } from '../../types';
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

export const SuperAdminDashboardV2: React.FC<Props> = ({ user, onLogout: _onLogout, onSwitchRole: _onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1D2B24] flex flex-col antialiased selection:bg-[#C29B38] selection:text-white">
      <MainHeader activeTab={activeTab} onSelectTab={handleNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <OverviewView onNavigate={handleNavigate} user={user} />}
        {activeTab === 'staff' && <StaffView user={user} />}
        {activeTab === 'customers' && <CustomersView user={user} />}
        {activeTab === 'outlets' && <OutletsView user={user} />}
        {activeTab === 'roles-permissions' && <RolesPermissionsView onNavigate={handleNavigate} user={user} />}
        {activeTab === 'audit-log' && <AuditLogView user={user} />}
      </main>

      <MasterFooter />
    </div>
  );
};

export default SuperAdminDashboardV2;
