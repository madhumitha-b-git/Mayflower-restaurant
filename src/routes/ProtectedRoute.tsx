import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserProfile, UserRole } from '../types';
import { getRoleHomePath } from './roleRoutes';

interface ProtectedRouteProps {
  currentUser: UserProfile | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentUser,
  allowedRoles,
  children,
}) => {
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login with return path
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const userRole = currentUser.role || 'Customer';

  // SuperAdmin has universal master access
  if (userRole === 'SuperAdmin') {
    return <>{children}</>;
  }

  // If specific roles are required, ensure the user belongs to them
  if (allowedRoles && !allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return <>{children}</>;
};
