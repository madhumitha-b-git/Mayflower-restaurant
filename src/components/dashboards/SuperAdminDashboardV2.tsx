import React, { useState, useEffect } from 'react';
import { TabType, UserProfile } from '../../types';
import { useSafeNavigate, useSafeLocation } from '../../routes/roleRoutes';
import { MainHeader } from '../MainHeader';
import { MasterFooter } from '../MasterFooter';
import { OverviewView } from '../../views/OverviewView';
import { StaffView } from '../../views/StaffView';
import { CustomersView } from '../../views/CustomersView';
import { OutletsView } from '../../views/OutletsView';
import { RolesPermissionsView } from '../../views/RolesPermissionsView';
import { SOPChecklistManagement } from './shared/SOPChecklistManagement';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

export const SuperAdminDashboardV2: React.FC<Props> = ({ user, onLogout: _onLogout, onSwitchRole: _onSwitchRole }) => {
  const navigate = useSafeNavigate();
  const location = useSafeLocation();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (location.pathname.includes('/outlets')) return 'outlets';
    if (location.pathname.includes('/sops') || location.pathname.includes('/checklists')) return 'sops';
    if (location.pathname.includes('/users') || location.pathname.includes('/staff')) return 'staff';
    if (location.pathname.includes('/customers')) return 'customers';
    if (location.pathname.includes('/integrations') || location.pathname.includes('/roles-permissions')) return 'roles-permissions';
    return 'overview';
  });

  useEffect(() => {
    if (location.pathname.includes('/outlets')) setActiveTab('outlets');
    else if (location.pathname.includes('/sops') || location.pathname.includes('/checklists')) setActiveTab('sops');
    else if (location.pathname.includes('/users') || location.pathname.includes('/staff')) setActiveTab('staff');
    else if (location.pathname.includes('/customers')) setActiveTab('customers');
    else if (location.pathname.includes('/integrations') || location.pathname.includes('/roles-permissions')) setActiveTab('roles-permissions');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    const routeMap: Record<TabType, string> = {
      'overview': '/superadmin/overview',
      'sops': '/superadmin/sops',
      'outlets': '/superadmin/outlets',
      'staff': '/superadmin/users',
      'customers': '/superadmin/customers',
      'roles-permissions': '/superadmin/integrations',
    };
    navigate(routeMap[tab] || '/superadmin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1D2B24] flex flex-col antialiased selection:bg-[#C29B38] selection:text-white">
      <MainHeader activeTab={activeTab} onSelectTab={handleNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <OverviewView onNavigate={handleNavigate} user={user} />}
        {activeTab === 'sops' && <SOPChecklistManagement user={user} initialTab="compliance" />}
        {activeTab === 'staff' && <StaffView user={user} />}
        {activeTab === 'customers' && <CustomersView user={user} />}
        {activeTab === 'outlets' && <OutletsView user={user} />}
        {activeTab === 'roles-permissions' && <RolesPermissionsView onNavigate={handleNavigate} user={user} />}
      </main>

      <MasterFooter />
    </div>
  );
};

export default SuperAdminDashboardV2;
