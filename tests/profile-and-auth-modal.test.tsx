import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthModal } from '../src/components/AuthModal';
import { PatronProfileModal } from '../src/components/dashboards/customer/PatronProfileModal';
import { UserProfile } from '../src/types';
import { PatronProfile } from '../src/components/dashboards/customer/types';

// Mock Supabase
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
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
  requestEmailOtp: vi.fn().mockResolvedValue({ success: true, message: 'OTP sent' }),
  verifyEmailOtp: vi.fn().mockResolvedValue({ success: true, verified: true }),
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

describe('AuthModal Component', () => {
  it('renders registration fields with verify button and phone input', () => {
    render(
      <MemoryRouter>
        <AuthModal
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
          initialMode="register"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Join Mayflower')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Madan Kumar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@domain.com')).toBeInTheDocument();
    const phoneInput = screen.getByPlaceholderText('9876543210');
    expect(phoneInput).toBeInTheDocument();
    fireEvent.change(phoneInput, { target: { value: '9840012345' } });
    expect(phoneInput).toHaveValue('9840012345');
    expect(screen.getByRole('button', { name: /^Verify$/i })).toBeInTheDocument();
  });

  it('supports email verification flow and enables password entry upon verification', async () => {
    render(
      <MemoryRouter>
        <AuthModal
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
          initialMode="register"
        />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. Madan Kumar'), { target: { value: 'Eleanor' } });
    fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'eleanor@ritchennai.edu.in' } });

    // Click Verify to send OTP
    fireEvent.click(screen.getByRole('button', { name: /^Verify$/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('6-digit OTP')).toBeInTheDocument();
    });

    // Enter 6-digit OTP and Confirm
    fireEvent.change(screen.getByPlaceholderText('6-digit OTP'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    // Password fields are now active
    fireEvent.change(screen.getByPlaceholderText('Min 6 chars'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('switches to login mode with email and password fields', () => {
    render(
      <MemoryRouter>
        <AuthModal
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
          initialMode="login"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Sign In/i }).length).toBeGreaterThanOrEqual(1);
  });
});

describe('PatronProfileModal Edit Profile & DB Sync', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    name: 'Madan Kumar',
    email: 'madan@example.com',
    phone: '9840055555',
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
    phone: '9840055555',
    monogram: 'M',
    tier: 'Green',
    stars: 500,
    maxTierStars: 800,
    nextTier: 'Gold Member',
    ptsToNextTier: 300,
    memberSince: '14 Sept 2026',
    totalVisits: 3,
    dietaryPreferences: ['Chef’s Table Special'],
    preferredSeating: 'Indoor Salon',
  };

  it('renders existing patron data prefilled in form', () => {
    render(
      <PatronProfileModal
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        patron={mockPatron}
        onUpdateSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Madan Kumar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('madan@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9840055555')).toBeInTheDocument();
  });

  it('allows editing name and phone', () => {
    render(
      <PatronProfileModal
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        patron={mockPatron}
        onUpdateSuccess={vi.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue('Madan Kumar');
    fireEvent.change(nameInput, { target: { value: 'Madan K.' } });
    expect(nameInput).toHaveValue('Madan K.');

    const phoneInput = screen.getByDisplayValue('9840055555');
    fireEvent.change(phoneInput, { target: { value: '9840099999' } });
    expect(phoneInput).toHaveValue('9840099999');
  });

  it('submits updated profile data and calls onProfileUpdate callback', async () => {
    const onProfileUpdate = vi.fn();
    const onClose = vi.fn();

    render(
      <PatronProfileModal
        isOpen={true}
        onClose={onClose}
        user={mockUser}
        patron={mockPatron}
        onUpdateSuccess={onProfileUpdate}
      />
    );

    const nameInput = screen.getByDisplayValue('Madan Kumar');
    fireEvent.change(nameInput, { target: { value: 'Madan Verified' } });

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onProfileUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Madan Verified',
          email: 'madan@example.com',
        }),
        expect.anything()
      );
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 2500 });
  });
});
