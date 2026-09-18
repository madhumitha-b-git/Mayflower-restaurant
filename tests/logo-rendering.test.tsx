import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MayflowerLogo } from '../src/components/MayflowerLogo';
import { PlanYourVisit } from '../src/components/PlanYourVisit';

describe('Mayflower Logo & Table Reservation Rendering', () => {
  it('renders MayflowerLogo SVG with monogram M and accessibility label', () => {
    render(<MayflowerLogo className="w-11 h-11" />);
    const logoSvg = screen.getByRole('img', { name: /The Mayflower/i });
    expect(logoSvg).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders MayflowerLogo with different variants without error', () => {
    const { rerender } = render(<MayflowerLogo variant="gold" />);
    expect(screen.getByText('M')).toBeInTheDocument();

    rerender(<MayflowerLogo variant="dark" />);
    expect(screen.getByText('M')).toBeInTheDocument();

    rerender(<MayflowerLogo showBadge={false} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders PlanYourVisit table reservation desk with the Mayflower logo', () => {
    render(
      <PlanYourVisit
        onRequestSignIn={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    // Verify header title
    expect(screen.getByText(/Plan Your Visit to/i)).toBeInTheDocument();

    // Verify logo mark is present in the reservation desk header
    const logos = screen.getAllByRole('img', { name: /The Mayflower/i });
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders RoleDashboard with BACK TO HOME and unified customer header bar', async () => {
    const { RoleDashboard } = await import('../src/components/dashboards/RoleDashboard');
    const mockUser = {
      id: 'usr-madan-1',
      name: 'Madan',
      email: 'madan@mayflower.com',
      role: 'Customer' as const,
      phone: '9876543210',
      rewardPoints: 600,
      tier: 'Green' as const,
      totalVisits: 2,
      reservations: [],
      transactions: [],
    } as any;

    render(
      <RoleDashboard
        user={mockUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    // Verify BACK TO HOME is present
    const backBtn = screen.getByRole('button', { name: /BACK TO HOME/i });
    expect(backBtn).toBeInTheDocument();

    // Verify "Back to Mayflower Website" is NOT present
    expect(screen.queryByText(/Back to Mayflower Website/i)).toBeNull();

    // Verify there is only ONE "BACK TO HOME" button (no duplicate bar)
    const allBackBtns = screen.getAllByRole('button', { name: /BACK TO HOME/i });
    expect(allBackBtns.length).toBe(1);

    // Verify Logged in as Madan
    expect(screen.getByText(/Logged in as/i)).toBeInTheDocument();
    expect(screen.getByText('Madan')).toBeInTheDocument();

    // Verify CUSTOMER badge and ACCOUNT button
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCOUNT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LOGOUT/i })).toBeInTheDocument();
  });

  it('renders RoleDashboard for SuperAdmin with single unified top bar and no duplicate ribbon', async () => {
    const { RoleDashboard } = await import('../src/components/dashboards/RoleDashboard');
    const mockSuperAdmin = {
      id: 'usr-admin-1',
      name: 'Super Admin',
      email: 'admin@mayflower.com',
      role: 'SuperAdmin' as const,
      phone: '9876543210',
      rewardPoints: 0,
      tier: 'Gold' as const,
      totalVisits: 0,
      joinedDate: '2023-01-01',
      reservations: [],
      transactions: [],
    };

    render(
      <RoleDashboard
        user={mockSuperAdmin}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    // Verify there is only ONE "BACK TO HOME" button
    const allBackBtns = screen.getAllByRole('button', { name: /BACK TO HOME/i });
    expect(allBackBtns.length).toBe(1);

    // Verify lower duplicate "Back to home" ribbon is NOT present
    expect(screen.queryByText('Back to home')).toBeNull();

    // Verify only one "Logout" action in top bar
    const logoutBtns = screen.getAllByRole('button', { name: /LOGOUT/i });
    expect(logoutBtns.length).toBe(1);

    // Verify MainHeader console brand rendered directly below top bar
    expect(screen.getByText('Chennai Flagship Division')).toBeInTheDocument();
    expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
  });
});

