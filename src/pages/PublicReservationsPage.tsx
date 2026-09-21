import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { PlanYourVisit } from '../components/PlanYourVisit';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { UserProfile } from '../types';
import { getRoleHomePath } from '../routes/roleRoutes';

interface PublicReservationsPageProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const PublicReservationsPage: React.FC<PublicReservationsPageProps> = ({
  currentUser,
  onLogout,
  onLoginSuccess,
  onUpdateUser,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletParam = searchParams.get('outlet') || 'Poes Garden';
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isStaff = Boolean(currentUser && currentUser.role && currentUser.role !== 'Customer');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1A1A]">
      <Header
        activeView="reservations"
        currentUser={currentUser}
        canReserveTable={!isStaff}
        onNavigate={(section) => navigate(`/#${section}`)}
        onOpenReservations={() => {}}
        onBackToWebsite={() => navigate('/')}
        onOpenFranchise={() => navigate('/#contact')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLoyalty={() => {}}
        onOpenDashboard={() => navigate(currentUser ? getRoleHomePath(currentUser.role) : '/login')}
        onLogout={onLogout}
      />

      <main className="flex-1">
        <PlanYourVisit
          initialOutlet={outletParam}
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onRequestSignIn={() => setIsAuthOpen(true)}
          onBackToWebsite={() => navigate('/')}
        />
      </main>

      <Footer
        canReserveTable={!isStaff}
        onNavigate={(section) => navigate(`/#${section}`)}
        onPlanVisit={() => {}}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          onLoginSuccess(user);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
};
