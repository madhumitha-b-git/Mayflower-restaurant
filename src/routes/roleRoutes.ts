import { useInRouterContext, useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

export const getRoleHomePath = (role?: UserRole | string): string => {
  switch (role) {
    case 'SuperAdmin':
      return '/superadmin';
    case 'Admin':
      return '/admin';
    case 'Manager':
      return '/manager';
    case 'Chef':
      return '/chef';
    case 'HR':
      return '/hr';
    case 'Accountant':
      return '/accountant';
    case 'Owner':
      return '/owner';
    case 'Customer':
    default:
      return '/customer';
  }
};

export const useSafeNavigate = () => {
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : null;
  return (to: any, options?: any) => {
    if (navigate) navigate(to, options);
  };
};

export const useSafeLocation = () => {
  const inRouter = useInRouterContext();
  const location = inRouter ? useLocation() : null;
  return location || { pathname: '/', search: '', hash: '', state: null, key: 'default' };
};
