import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../src/components/Header';
import { HeroCarousel } from '../src/components/HeroCarousel';
import { MenuSection } from '../src/components/MenuSection';
import { OutletsSection } from '../src/components/OutletsSection';
import { Footer } from '../src/components/Footer';
import { MobileBottomNav } from '../src/components/MobileBottomNav';
import { RoleDashboard } from '../src/components/dashboards/RoleDashboard';
import { UserProfile } from '../src/types';

describe('Staff vs Customer Table Reservation Visibility & Role View Removal', () => {
  const customerUser: UserProfile = {
    id: 'usr-customer-1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'Customer',
    phone: '9876543210',
    rewardPoints: 100,
    tier: 'Green',
    totalVisits: 1,
    joinedDate: '2023-05-10',
    reservations: [],
    transactions: [],
  };

  const superAdminUser: UserProfile = {
    id: 'usr-superadmin-1',
    name: 'Super Admin',
    email: 'superadmin@mayflower.com',
    role: 'SuperAdmin',
    phone: '9876543211',
    rewardPoints: 0,
    tier: 'Gold',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    reservations: [],
    transactions: [],
  };

  const hrUser: UserProfile = {
    id: 'usr-hr-1',
    name: 'HR Manager',
    email: 'hr@mayflower.com',
    role: 'HR',
    phone: '9876543212',
    rewardPoints: 0,
    tier: 'Gold',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    reservations: [],
    transactions: [],
  };

  const adminUser: UserProfile = {
    id: 'usr-admin-1',
    name: 'Outlet Admin',
    email: 'admin@mayflower.com',
    role: 'Admin',
    phone: '9876543213',
    rewardPoints: 0,
    tier: 'Gold',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    reservations: [],
    transactions: [],
  };

  it('verifies Role View dropdown is completely removed from SuperAdmin dashboard', () => {
    render(
      <RoleDashboard
        user={superAdminUser}
        onLogout={vi.fn()}
        onBackToWebsite={vi.fn()}
      />
    );

    expect(screen.queryByText(/Role View/i)).toBeNull();
    expect(screen.queryByText(/Super Admin Console/i)).toBeNull();
  });

  describe('Unauthenticated Visitors (Before Login)', () => {
    it('shows Reserve Table buttons in Header before login', () => {
      render(
        <Header
          activeView="website"
          currentUser={null}
          canReserveTable={true}
          onNavigate={vi.fn()}
          onOpenReservations={vi.fn()}
          onBackToWebsite={vi.fn()}
          onOpenAuth={vi.fn()}
          onOpenLoyalty={vi.fn()}
          onOpenDashboard={vi.fn()}
          onLogout={vi.fn()}
        />
      );

      expect(document.getElementById('btn-plan-your-visit-header')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Reserve$/i })).toBeInTheDocument();

      // Open mobile menu to verify mobile menu button
      const mobileToggle = document.getElementById('mobile-nav-toggle');
      if (mobileToggle) {
        fireEvent.click(mobileToggle);
        expect(screen.getByRole('button', { name: /Plan Your Visit \(Reserve Table\)/i })).toBeInTheDocument();
      }
    });

    it('shows Reserve Table button in HeroCarousel, MenuSection, OutletsSection, Footer, MobileNav before login', () => {
      render(
        <div>
          <HeroCarousel onPlanVisit={vi.fn()} onExploreMenu={vi.fn()} canReserveTable={true} />
          <MenuSection onPlanVisit={vi.fn()} onRequestCellar={vi.fn()} canReserveTable={true} />
          <OutletsSection onReserveOutlet={vi.fn()} canReserveTable={true} />
          <Footer onNavigate={vi.fn()} onPlanVisit={vi.fn()} canReserveTable={true} />
          <MobileBottomNav activeView="website" onNavigate={vi.fn()} onOpenReservations={vi.fn()} onBackToWebsite={vi.fn()} canReserveTable={true} />
        </div>
      );

      expect(document.getElementById('hero-reserve-table-btn')).toBeInTheDocument();
      expect(document.getElementById('btn-reserve-table-menu-banner')).toBeInTheDocument();
      expect(document.getElementById('btn-reserve-outlet-poes-garden')).toBeInTheDocument();
      expect(document.getElementById('footer-btn-plan-visit')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Book$/i })).toBeInTheDocument();
    });
  });

  describe('Customers (After Login)', () => {
    it('retains all Reserve Table options for logged-in Customers', () => {
      render(
        <div>
          <Header
            activeView="website"
            currentUser={customerUser}
            canReserveTable={true}
            onNavigate={vi.fn()}
            onOpenReservations={vi.fn()}
            onBackToWebsite={vi.fn()}
            onOpenAuth={vi.fn()}
            onOpenLoyalty={vi.fn()}
            onOpenDashboard={vi.fn()}
            onLogout={vi.fn()}
          />
          <HeroCarousel onPlanVisit={vi.fn()} onExploreMenu={vi.fn()} canReserveTable={true} />
          <MenuSection onPlanVisit={vi.fn()} onRequestCellar={vi.fn()} canReserveTable={true} />
          <OutletsSection onReserveOutlet={vi.fn()} canReserveTable={true} />
          <Footer onNavigate={vi.fn()} onPlanVisit={vi.fn()} canReserveTable={true} />
          <MobileBottomNav activeView="website" onNavigate={vi.fn()} onOpenReservations={vi.fn()} onBackToWebsite={vi.fn()} canReserveTable={true} />
        </div>
      );

      expect(document.getElementById('btn-plan-your-visit-header')).toBeInTheDocument();
      expect(document.getElementById('hero-reserve-table-btn')).toBeInTheDocument();
      expect(document.getElementById('btn-reserve-table-menu-banner')).toBeInTheDocument();
      expect(document.getElementById('btn-reserve-outlet-poes-garden')).toBeInTheDocument();
      expect(document.getElementById('footer-btn-plan-visit')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Book$/i })).toBeInTheDocument();
    });
  });

  describe('Staff Users (After Login: SuperAdmin, HR, Admin)', () => {
    it('hides all Reserve Table options for logged-in SuperAdmin', () => {
      render(
        <div>
          <Header
            activeView="website"
            currentUser={superAdminUser}
            canReserveTable={false}
            onNavigate={vi.fn()}
            onOpenReservations={vi.fn()}
            onBackToWebsite={vi.fn()}
            onOpenAuth={vi.fn()}
            onOpenLoyalty={vi.fn()}
            onOpenDashboard={vi.fn()}
            onLogout={vi.fn()}
          />
          <HeroCarousel onPlanVisit={vi.fn()} onExploreMenu={vi.fn()} canReserveTable={false} />
          <MenuSection onPlanVisit={vi.fn()} onRequestCellar={vi.fn()} canReserveTable={false} />
          <OutletsSection onReserveOutlet={vi.fn()} canReserveTable={false} />
          <Footer onNavigate={vi.fn()} onPlanVisit={vi.fn()} canReserveTable={false} />
          <MobileBottomNav activeView="website" onNavigate={vi.fn()} onOpenReservations={vi.fn()} onBackToWebsite={vi.fn()} canReserveTable={false} />
        </div>
      );

      expect(document.getElementById('btn-plan-your-visit-header')).toBeNull();
      expect(document.getElementById('hero-reserve-table-btn')).toBeNull();
      expect(document.getElementById('btn-reserve-table-menu-banner')).toBeNull();
      expect(document.getElementById('btn-reserve-outlet-poes-garden')).toBeNull();
      expect(document.getElementById('footer-btn-plan-visit')).toBeNull();
      expect(screen.queryByRole('button', { name: /^Book$/i })).toBeNull();
    });

    it('hides all Reserve Table options for logged-in HR', () => {
      render(
        <div>
          <Header
            activeView="website"
            currentUser={hrUser}
            canReserveTable={false}
            onNavigate={vi.fn()}
            onOpenReservations={vi.fn()}
            onBackToWebsite={vi.fn()}
            onOpenAuth={vi.fn()}
            onOpenLoyalty={vi.fn()}
            onOpenDashboard={vi.fn()}
            onLogout={vi.fn()}
          />
          <HeroCarousel onPlanVisit={vi.fn()} onExploreMenu={vi.fn()} canReserveTable={false} />
          <MenuSection onPlanVisit={vi.fn()} onRequestCellar={vi.fn()} canReserveTable={false} />
          <OutletsSection onReserveOutlet={vi.fn()} canReserveTable={false} />
          <Footer onNavigate={vi.fn()} onPlanVisit={vi.fn()} canReserveTable={false} />
          <MobileBottomNav activeView="website" onNavigate={vi.fn()} onOpenReservations={vi.fn()} onBackToWebsite={vi.fn()} canReserveTable={false} />
        </div>
      );

      expect(document.getElementById('btn-plan-your-visit-header')).toBeNull();
      expect(document.getElementById('hero-reserve-table-btn')).toBeNull();
      expect(document.getElementById('btn-reserve-table-menu-banner')).toBeNull();
      expect(document.getElementById('btn-reserve-outlet-poes-garden')).toBeNull();
      expect(document.getElementById('footer-btn-plan-visit')).toBeNull();
      expect(screen.queryByRole('button', { name: /^Book$/i })).toBeNull();
    });

    it('hides all Reserve Table options for logged-in Admin', () => {
      render(
        <div>
          <Header
            activeView="website"
            currentUser={adminUser}
            canReserveTable={false}
            onNavigate={vi.fn()}
            onOpenReservations={vi.fn()}
            onBackToWebsite={vi.fn()}
            onOpenAuth={vi.fn()}
            onOpenLoyalty={vi.fn()}
            onOpenDashboard={vi.fn()}
            onLogout={vi.fn()}
          />
          <HeroCarousel onPlanVisit={vi.fn()} onExploreMenu={vi.fn()} canReserveTable={false} />
          <MenuSection onPlanVisit={vi.fn()} onRequestCellar={vi.fn()} canReserveTable={false} />
          <OutletsSection onReserveOutlet={vi.fn()} canReserveTable={false} />
          <Footer onNavigate={vi.fn()} onPlanVisit={vi.fn()} canReserveTable={false} />
          <MobileBottomNav activeView="website" onNavigate={vi.fn()} onOpenReservations={vi.fn()} onBackToWebsite={vi.fn()} canReserveTable={false} />
        </div>
      );

      expect(document.getElementById('btn-plan-your-visit-header')).toBeNull();
      expect(document.getElementById('hero-reserve-table-btn')).toBeNull();
      expect(document.getElementById('btn-reserve-table-menu-banner')).toBeNull();
      expect(document.getElementById('btn-reserve-outlet-poes-garden')).toBeNull();
      expect(document.getElementById('footer-btn-plan-visit')).toBeNull();
      expect(screen.queryByRole('button', { name: /^Book$/i })).toBeNull();
    });
  });
});
