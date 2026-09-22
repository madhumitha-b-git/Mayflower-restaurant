import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { PublicWebsitePage } from '../pages/PublicWebsitePage';
import { PublicReservationsPage } from '../pages/PublicReservationsPage';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleDashboard } from '../components/dashboards/RoleDashboard';

interface AppRoutesProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onUpdateUser,
}) => {
  return (
    <Routes>
      {/* Public Website */}
      <Route
        path="/"
        element={
          <PublicWebsitePage
            currentUser={currentUser}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            onUpdateUser={onUpdateUser}
          />
        }
      />

      {/* Public Reservations */}
      <Route
        path="/reservations"
        element={
          <PublicReservationsPage
            currentUser={currentUser}
            onLogout={onLogout}
            onLoginSuccess={onLoginSuccess}
            onUpdateUser={onUpdateUser}
          />
        }
      />

      {/* Shared Authentication & Login */}
      <Route
        path="/login"
        element={
          <LoginPage
            currentUser={currentUser}
            onLoginSuccess={onLoginSuccess}
          />
        }
      />

      {/* Password Recovery Routes */}
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={<ForgotPasswordPage />}
      />

      {/* Dedicated Email Verification Route */}
      <Route
        path="/verify-email"
        element={
          <VerifyEmailPage
            currentUser={currentUser}
            onLoginSuccess={onLoginSuccess}
          />
        }
      />

      {/* Customer Portal */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Customer']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin Dashboard */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['SuperAdmin']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Admin']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Manager Dashboard */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Manager']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Chef Dashboard */}
      <Route
        path="/chef/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Chef']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* HR Dashboard */}
      <Route
        path="/hr/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['HR']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Accountant Dashboard */}
      <Route
        path="/accountant/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Accountant']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Owner Dashboard */}
      <Route
        path="/owner/*"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Owner']}>
            <RoleDashboard
              user={currentUser!}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
