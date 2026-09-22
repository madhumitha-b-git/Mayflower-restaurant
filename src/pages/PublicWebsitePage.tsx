import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { HeroCarousel } from '../components/HeroCarousel';
import { AboutSection } from '../components/AboutSection';
import { MayflowerGallery } from '../components/MayflowerGallery';
import { MenuSection } from '../components/MenuSection';
import { MayflowerMomentCards } from '../components/MayflowerMomentCards';
import { OutletsSection } from '../components/OutletsSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { Modals } from '../components/Modals';
import { AuthModal } from '../components/AuthModal';
import { LoyaltyDashboardModal } from '../components/LoyaltyDashboardModal';
import { ActiveModalType, UserProfile } from '../types';
import { getRoleHomePath } from '../routes/roleRoutes';

interface PublicWebsitePageProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const PublicWebsitePage: React.FC<PublicWebsitePageProps> = ({
  currentUser,
  onLogout,
  onLoginSuccess,
  onUpdateUser,
}) => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [intentAfterLogin, setIntentAfterLogin] = useState<string | null>(null);

  const isStaff = Boolean(currentUser && currentUser.role && currentUser.role !== 'Customer');
  const canReserveTable = !isStaff;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToSection(id);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenReservations = (outletName?: string) => {
    if (isStaff) return;
    if (outletName) {
      navigate(`/reservations?outlet=${encodeURIComponent(outletName)}`);
    } else {
      navigate('/reservations');
    }
  };

  const handleOpenFranchise = () => {
    if (!currentUser) {
      setIntentAfterLogin('franchise');
      setActiveModal('auth');
    } else {
      setActiveModal('franchise');
    }
  };

  const handleOpenModal = (modalType: ActiveModalType) => {
    if (modalType === 'franchise') {
      handleOpenFranchise();
    } else {
      setActiveModal(modalType);
    }
  };

  const handleOpenDashboard = () => {
    if (currentUser) {
      navigate(getRoleHomePath(currentUser.role));
    } else {
      navigate('/login');
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    onLoginSuccess(user);
    if (intentAfterLogin === 'franchise') {
      setActiveModal('franchise');
      setIntentAfterLogin(null);
    } else {
      setActiveModal('none');
      navigate(getRoleHomePath(user.role));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1A1A] selection:bg-[#D1CDBC] selection:text-[#1A1A1A] pb-16 md:pb-0">
      <Header
        activeView="website"
        currentUser={currentUser}
        canReserveTable={canReserveTable}
        onNavigate={scrollToSection}
        onOpenReservations={() => handleOpenReservations()}
        onBackToWebsite={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenFranchise={handleOpenFranchise}
        onOpenAuth={() => navigate('/login')}
        onOpenLoyalty={() => setActiveModal('loyalty')}
        onOpenDashboard={handleOpenDashboard}
        onLogout={onLogout}
      />

      <main className="flex-1">
        <HeroCarousel
          canReserveTable={canReserveTable}
          onPlanVisit={() => handleOpenReservations()}
          onExploreMenu={() => scrollToSection('menu')}
        />
        <AboutSection />
        <MayflowerGallery />
        <MenuSection
          canReserveTable={canReserveTable}
          onPlanVisit={() => handleOpenReservations()}
          onRequestCellar={() => setActiveModal('cellar')}
        />
        <MayflowerMomentCards
          currentUser={currentUser}
          onOpenAuth={() => navigate('/login')}
          onUpdateUser={onUpdateUser}
        />
        <OutletsSection
          canReserveTable={canReserveTable}
          onReserveOutlet={(outletName) => handleOpenReservations(outletName)}
        />
        <TestimonialsSection />
        <ContactSection
          onOpenModal={handleOpenModal}
          onOpenFranchise={handleOpenFranchise}
        />
      </main>

      <Footer
        canReserveTable={canReserveTable}
        onNavigate={scrollToSection}
        onPlanVisit={() => handleOpenReservations()}
      />

      <Modals
        activeModal={activeModal}
        currentUser={currentUser}
        onClose={() => setActiveModal('none')}
      />

      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => {
          setActiveModal('none');
          setIntentAfterLogin(null);
        }}
        onLoginSuccess={handleAuthSuccess}
        initialMode={intentAfterLogin ? 'login' : 'register'}
      />

      <LoyaltyDashboardModal
        isOpen={activeModal === 'loyalty'}
        user={currentUser}
        onClose={() => setActiveModal('none')}
        onLogout={onLogout}
        onNavigateToGiftCards={() => scrollToSection('moment-cards')}
      />
    </div>
  );
};
