import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoleDashboard } from '../src/components/dashboards/RoleDashboard';
import { UserProfile } from '../src/types';

describe('HR Dashboard Integration and Routing', () => {
  const mockHRUser: UserProfile = {
    id: 'usr-hr-01',
    name: 'Alexandra Vance',
    email: 'a.vance@mayflower.com',
    role: 'HR',
    phone: '9840011111',
    rewardPoints: 0,
    tier: 'Gold',
    totalVisits: 0,
    joinedDate: '2023-01-12',
    reservations: [],
    transactions: [],
  };

  it('routes to and renders HR Dashboard when user role is HR', () => {
    render(
      <RoleDashboard
        user={mockHRUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    // Verify top persistent bar
    expect(screen.getByText(/BACK TO HOME/i)).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getAllByText('Alexandra Vance').length).toBeGreaterThan(0);

    // Verify HR Dashboard brand banner
    expect(screen.getByRole('heading', { name: /HR Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('M · FD')).toBeInTheDocument();

    // Verify 4 KPI metric cards
    expect(screen.getByText(/Total Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/On Leave Today/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Outlets Covered/i)).toBeInTheDocument();

    // Verify Tab bar navigation
    expect(screen.getByRole('button', { name: /Staff Directory & Shifts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shift & Leave Requests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Activity Log/i })).toBeInTheDocument();

    // Verify initial staff members in directory (present in table and mobile card views)
    expect(screen.getAllByText('Chef Rajesh Sharma').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ananya Roy').length).toBeGreaterThan(0);
  });

  it('filters staff directory when an outlet filter pill is clicked', () => {
    render(
      <RoleDashboard
        user={mockHRUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    // Click on 'Palavakkam' filter
    const palavakkamBtn = screen.getByRole('button', { name: 'Palavakkam' });
    fireEvent.click(palavakkamBtn);

    // Ananya Roy is at Palavakkam, Chef Rajesh Sharma is at Poes Garden
    expect(screen.getAllByText('Ananya Roy').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Chef Rajesh Sharma').length).toBe(0);
  });

  it('switches to Shift & Leave Requests tab and renders pending requests', () => {
    render(
      <RoleDashboard
        user={mockHRUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    const requestsTab = screen.getByRole('button', { name: /Shift & Leave Requests/i });
    fireEvent.click(requestsTab);

    expect(screen.getByText(/Shift & Leave Requests Review/i)).toBeInTheDocument();
    expect(screen.getByText('Meera Patel')).toBeInTheDocument();
    expect(screen.getByText('Annual Leave')).toBeInTheDocument();
  });

  it('switches to Activity Log tab and renders punch-in logs', () => {
    render(
      <RoleDashboard
        user={mockHRUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    const activityTab = screen.getByRole('button', { name: /Activity Log/i });
    fireEvent.click(activityTab);

    expect(screen.getByText(/Real-Time Staff Activity & Timecard Log/i)).toBeInTheDocument();
    expect(screen.getByText(/Punched in on time for Evening Shift/i)).toBeInTheDocument();
  });

  it('opens onboarding modal when + Onboard button is clicked', () => {
    render(
      <RoleDashboard
        user={mockHRUser}
        onLogout={() => {}}
        onBackToWebsite={() => {}}
      />
    );

    const onboardBtn = screen.getByRole('button', { name: /\+ Onboard/i });
    fireEvent.click(onboardBtn);

    expect(screen.getByText(/Onboard New Staff Member/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Master Chef Rohan Verma/i)).toBeInTheDocument();
  });
});
