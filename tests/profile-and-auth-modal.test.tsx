import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthModal } from '../src/components/AuthModal';
import { PatronProfileModal } from '../src/components/dashboards/customer/PatronProfileModal';
import { UserProfile } from '../src/types';
import { PatronProfile } from '../src/components/dashboards/customer/types';

// Mock Supabase
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-new-1', email: 'test@example.com' } }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-1' } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      resend: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
  isSupabaseConfigured: true,
}));

// Mock authService
vi.mock('../src/lib/authService', () => ({
  supabaseLogin: vi.fn().mockResolvedValue({ success: true, user: { id: 'usr-1', name: 'Madan', role: 'Customer' } }),
  supabaseRegister: vi.fn().mockImplementation((email, _password, name, phone) => {
    return Promise.resolve({
      success: true,
      user: { id: 'usr-2', name, email, phone, role: 'Customer' },
    });
  }),
  updateUserProfile: vi.fn().mockImplementation((params) => {
    return Promise.resolve({
      success: true,
      user: {
        id: params.userId,
        name: params.name,
        email: params.email,
        phone: params.phone || '',
        role: 'Customer',
      },
    });
  }),
}));

describe('AuthModal Redesign (Two-Sided Luxury Screen)', () => {
  it('renders left-side Mayflower heritage screen and right-side form', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        onLoginSuccess={vi.fn()}
        initialMode="register"
      />
    );

    // Left side minimal branding
    expect(screen.getByText('THE MAYFLOWER')).toBeInTheDocument();
    expect(screen.getByText(/Fine dining and private salons/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to explore your sanctuary of privileges/i)).toBeInTheDocument();

    // Right side registration fields
    expect(screen.getByPlaceholderText('e.g. Eleanor Vance')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+91 98400 12345')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter password')).toBeInTheDocument();
  });

  it('validates password and confirm password matching on registration', async () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        onLoginSuccess={vi.fn()}
        initialMode="register"
      />
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. Eleanor Vance'), { target: { value: 'Eleanor' } });
    fireEvent.change(screen.getByPlaceholderText('name@email.com'), { target: { value: 'eleanor@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /Complete Registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('switches to login mode with email and password fields', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        onLoginSuccess={vi.fn()}
        initialMode="login"
      />
    );

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SIGN IN' })).toBeInTheDocument();
  });
});

describe('PatronProfileModal Edit Profile & DB Sync', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    name: 'Madan Kumar',
    email: 'madan@example.com',
    phone: '+91 98400 55555',
    role: 'Customer',
    rewardPoints: 500,
    tier: 'Green',
    totalVisits: 3,
    joinedDate: '14 Sept 2026',
    transactions: [],
    reservations: [],
  };

  const mockPatron: PatronProfile = {
    name: 'Madan Kumar',
    email: 'madan@example.com',
    phone: '+91 98400 55555',
    monogram: 'M',
    tier: 'Green',
    stars: 500,
    maxTierStars: 800,
    nextTier: 'Gold Tier',
    ptsToNextTier: 300,
    memberSince: '14 Sept 2026',
    totalVisits: 3,
    dietaryPreferences: ['Truffle Degustation'],
    preferredSeating: 'Quiet corner or Verandah booth',
  };

  it('prefills current patron credentials and preferences', () => {
    render(
      <PatronProfileModal
        isOpen={true}
        onClose={vi.fn()}
        patron={mockPatron}
        user={mockUser}
        onUpdateSuccess={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Madan Kumar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('madan@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+91 98400 55555')).toBeInTheDocument();
  });

  it('updates profile and invokes onUpdateSuccess', async () => {
    const handleSuccess = vi.fn();

    render(
      <PatronProfileModal
        isOpen={true}
        onClose={vi.fn()}
        patron={mockPatron}
        user={mockUser}
        onUpdateSuccess={handleSuccess}
      />
    );

    const nameInput = screen.getByDisplayValue('Madan Kumar');
    fireEvent.change(nameInput, { target: { value: 'Madan Senior' } });

    const submitBtn = screen.getByRole('button', { name: /^Save Changes$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Madan Senior' }),
        expect.objectContaining({ name: 'Madan Senior' })
      );
    });
  });

  it('renders password and new password fields and validates matching', async () => {
    render(
      <PatronProfileModal
        isOpen={true}
        onClose={vi.fn()}
        patron={mockPatron}
        user={mockUser}
        onUpdateSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('New Password')).toBeInTheDocument();

    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    expect(passwordInputs).toHaveLength(2);

    fireEvent.change(passwordInputs[0], { target: { value: 'firstpassword' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'differentpassword' } });

    const submitBtn = screen.getByRole('button', { name: /^Save Changes$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
