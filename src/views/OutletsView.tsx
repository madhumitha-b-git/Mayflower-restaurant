import React from 'react';
import { UserProfile } from '../types';
import { OutletManagement } from '../components/dashboards/shared/OutletManagement';

interface OutletsViewProps {
  user?: UserProfile;
}

export const OutletsView: React.FC<OutletsViewProps> = ({ user }) => {
  return <OutletManagement user={user} />;
};
