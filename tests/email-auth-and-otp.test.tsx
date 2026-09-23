import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';
import {
  requestEmailOtp,
  verifyEmailOtp,
  verifySignupOtp,
  resendSignupOtp,
  requestPasswordReset,
  verifyRecoveryOtp,
  updateUserPassword,
} from '../src/lib/authService';
import { ForgotPasswordPage } from '../src/pages/ForgotPasswordPage';
import { VerifyEmailPage } from '../src/pages/VerifyEmailPage';
import { LoginPage } from '../src/pages/LoginPage';

// Mock Supabase Client (Direct Database)
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => {
        // Return existing user for recovery queries, and null for new registration checks
        return Promise.resolve({
          data: table === 'users' ? {
            id: 'usr-100',
            email: 'patron@example.com',
            name: 'Madan Kumar',
            phone: '9876543210',
            role: 'Customer',
            reward_points: 200,
          } : null,
          error: null,
        });
      }),
    })),
  },
  isSupabaseConfigured: true,
}));

// Mock Email Service
vi.mock('../src/data/emailService', () => ({
  sendWelcomeConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendReservationConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Fetch for Gmail API OTP endpoints
global.fetch = vi.fn().mockImplementation((_url, opts) => {
  const body = opts?.body ? JSON.parse(opts.body) : {};
  if (body.action === 'send_otp') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'A 6-digit verification code has been dispatched.' }),
    });
  }
  if (body.action === 'verify_otp') {
    if (body.otp === '000000' || body.otp === 'invalid') {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, verified: false, error: 'Invalid or expired verification code.' }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, verified: true, message: 'Email verified successfully.' }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  });
}) as any;

describe('Gmail API OTP & Direct Database Auth Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestEmailOtp', () => {
    it('dispatches OTP via /api/send-email with Gmail API for new email', async () => {
      // Temporarily mock maybeSingle to return null (email not taken)
      const fromMock = vi.mocked(supabase.from);
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const res = await requestEmailOtp('newpatron@example.com', 'registration');
      expect(res.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            action: 'send_otp',
            to: 'newpatron@example.com',
            purpose: 'registration',
          }),
        })
      );
    });

    it('dispatches OTP for institutional domain-specific and non-gmail providers', async () => {
      const fromMock = vi.mocked(supabase.from);
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const institutionalEmail = 'madankumar.s.2023.aids@ritchennai.edu.in';
      const res = await requestEmailOtp(institutionalEmail, 'registration');
      expect(res.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            action: 'send_otp',
            to: institutionalEmail,
            purpose: 'registration',
          }),
        })
      );
    });

    it('rejects registration OTP if email is already registered', async () => {
      const res = await requestEmailOtp('patron@example.com', 'registration');
      expect(res.success).toBe(false);
      expect(res.message).toContain('already registered');
    });
  });

  describe('verifyEmailOtp', () => {
    it('verifies valid 6-digit OTP successfully', async () => {
      const res = await verifyEmailOtp('patron@example.com', '123456');
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            action: 'verify_otp',
            to: 'patron@example.com',
            otp: '123456',
          }),
        })
      );
    });

    it('rejects invalid OTP', async () => {
      const res = await verifyEmailOtp('patron@example.com', '000000');
      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('Invalid or expired');
    });
  });

  describe('verifySignupOtp (backward compatibility alias)', () => {
    it('verifies valid signup OTP and loads user profile', async () => {
      const result = await verifySignupOtp('patron@example.com', '123456');
      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('usr-100');
      expect(result.user?.email).toBe('patron@example.com');
    });
  });

  describe('resendSignupOtp', () => {
    it('calls requestEmailOtp to resend OTP via Gmail API', async () => {
      const fromMock = vi.mocked(supabase.from);
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const result = await resendSignupOtp('newpatron@example.com');
      expect(result.success).toBe(true);
    });
  });

  describe('requestPasswordReset', () => {
    it('dispatches recovery OTP if account exists', async () => {
      const result = await requestPasswordReset('patron@example.com');
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            action: 'send_otp',
            to: 'patron@example.com',
            purpose: 'password_reset',
          }),
        })
      );
    });
  });

  describe('verifyRecoveryOtp', () => {
    it('verifies recovery OTP and returns recovery user profile', async () => {
      const result = await verifyRecoveryOtp('patron@example.com', '654321');
      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('usr-100');
    });
  });

  describe('updateUserPassword', () => {
    it('rejects passwords shorter than 6 characters', async () => {
      const result = await updateUserPassword('short', 'patron@example.com');
      expect(result.success).toBe(false);
      expect(result.message).toContain('at least 6 characters');
    });

    it('updates password hash directly in database when valid', async () => {
      const result = await updateUserPassword('secureNewPassword123', 'patron@example.com');
      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });
  });
});

describe('ForgotPasswordPage UI Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial step with email input and dispatches recovery OTP', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('patron@mayflower.com')).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('patron@mayflower.com');
    fireEvent.change(emailInput, { target: { value: 'patron@gmail.com' } });

    const submitButton = screen.getByRole('button', { name: /Send Recovery Code/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Enter Recovery Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });
  });

  it('progresses to new password entry upon recovery OTP verification and validates password match', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Step 1: Submit email
    fireEvent.change(screen.getByPlaceholderText('patron@mayflower.com'), { target: { value: 'patron@gmail.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Code/i }));

    // Step 2: Enter OTP
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Set New Password/i }));

    // Step 3: Enter new password with mismatched confirm
    await waitFor(() => {
      expect(screen.getByText('Create New Password')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'differentpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});

describe('VerifyEmailPage UI Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prefills email from query parameters and allows OTP verification', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email?email=patron@example.com']}>
        <VerifyEmailPage onLoginSuccess={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
    expect(screen.getByText('patron@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

describe('LoginPage & Duplicate Email Registration Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows already registered message and sign in option when email is already in database', async () => {
    render(
      <MemoryRouter initialEntries={['/login?mode=register']}>
        <LoginPage currentUser={null} onLoginSuccess={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Patron Registration')).toBeInTheDocument();

    // Enter email of existing user
    const emailInput = screen.getByPlaceholderText('name@domain.com');
    fireEvent.change(emailInput, { target: { value: 'patron@example.com' } });

    // Click Verify
    const verifyButton = screen.getByRole('button', { name: /^Verify$/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/already registered! Try logging in again/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In Instead/i })).toBeInTheDocument();
    });
  });
});

describe('Dashboard Account Section Reset Password with Email Verification', () => {
  it('requires email verification before unlocking new password fields and updates database', async () => {
    const { AccountProfileModal } = await import('../src/components/dashboards/AccountProfileModal');
    const mockUser = {
      id: 'usr-100',
      name: 'Madan Kumar',
      email: 'patron@example.com',
      phone: '9876543210',
      role: 'Customer' as const,
      rewardPoints: 300,
      tier: 'Green' as const,
      totalVisits: 2,
      joinedDate: '10 Jan 2026',
      transactions: [],
      reservations: [],
    };
    const onUpdateUserMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AccountProfileModal
        isOpen={true}
        onClose={onCloseMock}
        user={mockUser}
        onUpdateUser={onUpdateUserMock}
      />
    );

    expect(screen.getByText('Reset / Change Password')).toBeInTheDocument();
    expect(screen.getByText('Email Verification Step')).toBeInTheDocument();

    // 1. Click Send Verification Code
    const sendOtpBtn = screen.getByRole('button', { name: /Send Verification Code to Email/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    // 2. Enter 6-digit OTP code and verify
    const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
    fireEvent.change(otpInput, { target: { value: '123456' } });

    const verifyOtpBtn = screen.getByRole('button', { name: /Verify Code/i });
    fireEvent.click(verifyOtpBtn);

    // 3. Once verified, new password fields are unlocked
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Re-enter new password')).toBeInTheDocument();
    });

    // 4. Enter and confirm new password
    const newPwdInput = screen.getByPlaceholderText('Min 6 characters');
    const confirmPwdInput = screen.getByPlaceholderText('Re-enter new password');
    fireEvent.change(newPwdInput, { target: { value: 'newsecret123' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'newsecret123' } });

    expect(screen.getByText(/Passwords match/i)).toBeInTheDocument();

    // 5. Submit changes
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('users');
    });
  });
});
