import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/routes/AppRoutes';
import { UserProfile } from '../src/types';

// Mock Supabase
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
    }),
    channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
    removeChannel: vi.fn(),
  },
  isSupabaseConfigured: false,
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();

describe('Application Routing Structure', () => {
  const dummyCustomer: UserProfile = {
    id: 'cust-1',
    name: 'Priya Sundaram',
    email: 'priya@gmail.com',
    phone: '9840012345',
    role: 'Customer',
    rewardPoints: 450,
    tier: 'Gold',
    totalVisits: 3,
    joinedDate: '2024-01-01',
    transactions: [],
  };

  const dummySuperAdmin: UserProfile = {
    id: 'sa-1',
    name: 'Root Administrator',
    email: 'superadmin@gmail.com',
    phone: '9840000001',
    role: 'SuperAdmin',
    rewardPoints: 0,
    tier: 'Sanctuary VIP',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    transactions: [],
  };

  const dummyAdmin: UserProfile = {
    id: 'adm-1',
    name: 'General Manager Arvind',
    email: 'admin@gmail.com',
    phone: '9840000002',
    role: 'Admin',
    rewardPoints: 0,
    tier: 'Sanctuary VIP',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    transactions: [],
  };

  const dummyManager: UserProfile = {
    id: 'mgr-1',
    name: 'Floor Manager Vignesh',
    email: 'manager@gmail.com',
    phone: '9840000003',
    role: 'Manager',
    rewardPoints: 0,
    tier: 'Gold',
    totalVisits: 0,
    joinedDate: '2023-01-01',
    transactions: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders public website on route "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes
          currentUser={null}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Explore the uniqueness of/i)).toBeInTheDocument();
  });

  it('renders public reservations page on route "/reservations"', () => {
    render(
      <MemoryRouter initialEntries={['/reservations']}>
        <AppRoutes
          currentUser={null}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tables held for 15 minutes past reservation time/i)).toBeInTheDocument();
  });

  it('renders login page on route "/login"', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes
          currentUser={null}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Patron Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Mayflower Website/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected "/customer" to "/login"', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <AppRoutes
          currentUser={null}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Patron Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Mayflower Website/i)).toBeInTheDocument();
  });

  it('renders customer dashboard on "/customer" when authenticated as Customer', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <AppRoutes
          currentUser={dummyCustomer}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/BACK TO HOME/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Priya Sundaram/i).length).toBeGreaterThan(0);
  });

  it('renders superadmin dashboard on "/superadmin" when authenticated as SuperAdmin', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin']}>
        <AppRoutes
          currentUser={dummySuperAdmin}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/BACK TO HOME/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Root Administrator/i).length).toBeGreaterThan(0);
  });

  it('renders admin dashboard on "/admin" and "/admin/menu" when authenticated as Admin', () => {
    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <AppRoutes
          currentUser={dummyAdmin}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/BACK TO HOME/i)).toBeInTheDocument();
    expect(screen.getByText(/Menu Catalog/i)).toBeInTheDocument();
  });

  it('renders manager dashboard on "/manager" and "/manager/reservations" when authenticated as Manager', () => {
    render(
      <MemoryRouter initialEntries={['/manager/reservations']}>
        <AppRoutes
          currentUser={dummyManager}
          onLoginSuccess={vi.fn()}
          onLogout={vi.fn()}
          onUpdateUser={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/BACK TO HOME/i)).toBeInTheDocument();
    expect(screen.getByText(/Reservation Lifecycle Pipeline/i)).toBeInTheDocument();
  });
});
