import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateWelcomeEmailHtml, generateReservationConfirmationEmailHtml } from '../api/emailTemplates';
import {
  encodeBase64Url,
  createMimeMessage,
  getGoogleAccessToken,
  sendViaGmailApi,
  resetTokenCache,
} from '../api/gmailService';

describe('Transactional Email Outbox & Database Architecture', () => {
  const outboxMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000010_email_outbox_and_triggers.sql'
  );

  const migrationSql = fs.readFileSync(outboxMigrationPath, 'utf8');

  it('defines public.email_outbox with required columns and idempotency constraint', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.email_outbox');
    expect(migrationSql).toContain('idempotency_key TEXT UNIQUE NOT NULL');
    expect(migrationSql).toContain('email_type TEXT NOT NULL');
    expect(migrationSql).toContain('recipient_email TEXT NOT NULL');
    expect(migrationSql).toContain("status TEXT NOT NULL DEFAULT 'pending'");
    expect(migrationSql).toContain("CHECK (status IN ('pending', 'processing', 'sent', 'failed'))");
    expect(migrationSql).toContain('attempt_count INT NOT NULL DEFAULT 0');
    expect(migrationSql).toContain('provider_message_id TEXT');
  });

  it('defines performance indexes on email_outbox for high-efficiency querying', () => {
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_email_outbox_status');
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_email_outbox_idempotency');
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_email_outbox_user_id');
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_email_outbox_reservation_id');
  });

  it('enforces Row-Level Security on email_outbox with private customer isolation', () => {
    expect(migrationSql).toContain('ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY');
    expect(migrationSql).toContain('CREATE POLICY "Users can read their own email logs"');
    expect(migrationSql).toContain('auth.uid() IS NOT NULL AND user_id = auth.uid()');
    expect(migrationSql).toContain('CREATE POLICY "Admins and service role have full outbox access"');
  });

  it('attaches reservation confirmation trigger that strictly fires on confirmed status', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.enqueue_reservation_confirmation_email()');
    expect(migrationSql).toContain("IF NEW.status = 'confirmed'");
    expect(migrationSql).toContain("'res-confirm-' || NEW.id");
    expect(migrationSql).toContain("'reservation_confirmation'");
    expect(migrationSql).toContain('ON CONFLICT (idempotency_key) DO NOTHING');
    expect(migrationSql).toContain('TRIGGER trg_enqueue_reservation_confirmation');
  });

  it('defines welcome email trigger and idempotent RPC for verified users', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.enqueue_welcome_email');
    expect(migrationSql).toContain("'welcome-' || p_user_id");
    expect(migrationSql).toContain('ON CONFLICT (idempotency_key) DO NOTHING');
    expect(migrationSql).toContain('TRIGGER on_auth_user_verified_welcome');
  });
});

describe('HTML Email Template Generation', () => {
  it('generates luxury branded welcome email with personalized name and 200 PTS badge', () => {
    const html = generateWelcomeEmailHtml({
      name: 'Madan Kumar',
      email: 'madan@example.com',
      bonusPoints: 200,
    });

    expect(html).toContain('The Mayflower');
    expect(html).toContain('Culinary Sanctuary • Chennai');
    expect(html).toContain('Welcome to the Sanctuary, <span>Madan Kumar</span>.');
    expect(html).toContain('+200 PTS');
    expect(html).toContain('Green Tier Loyalty Bonus Added to Your Balance');
    expect(html).toContain('Enter Patron Portal');
    expect(html).toContain('Poes Garden • Palavakkam • Egmore • Anna Nagar');
  });

  it('generates reservation confirmation email with booking code, date, and outlet details', () => {
    const html = generateReservationConfirmationEmailHtml({
      name: 'Elena Rostova',
      email: 'elena@example.com',
      bookingCode: 'MAY-78901',
      outletName: 'Poes Garden Sanctuary',
      outletAddress: '12/4 Cathedral Road, Chennai',
      outletPhone: '+91 44 4892 7700',
      date: '2026-10-15',
      timeSlot: '20:00',
      guests: 4,
      seatingArea: 'Verandah Booth',
      specialRequests: 'Window table with anniversary flower arrangement',
    });

    expect(html).toContain('The Mayflower');
    expect(html).toContain('Table Reservation Confirmed');
    expect(html).toContain('Your table is prepared, Elena Rostova.');
    expect(html).toContain('MAY-78901');
    expect(html).toContain('Poes Garden Sanctuary');
    expect(html).toContain('2026-10-15 at 20:00');
    expect(html).toContain('4 Guests (Verandah Booth)');
    expect(html).toContain('Window table with anniversary flower arrangement');
    expect(html).toContain('+150 PTS Visit Accrual');
    expect(html).toContain('15 minutes past your booking time');
  });
});

describe('Gmail API & Google OAuth 2.0 Delivery Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetTokenCache();
  });

  it('encodes string into RFC 4648 URL-safe base64 without padding', () => {
    const input = 'Subject: Test with special characters > & < ? + / =';
    const encoded = encodeBase64Url(input);

    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
    expect(typeof encoded).toBe('string');
  });

  it('formats RFC 2822 MIME message with UTF-8 subject encoding and headers', () => {
    const mime = createMimeMessage({
      from: 'The Mayflower <reservations@mayflower.com>',
      to: 'guest@example.com',
      subject: 'Reservation Confirmed 🌸',
      html: '<h1>Welcome to Mayflower</h1>',
    });

    expect(mime).toContain('From: The Mayflower <reservations@mayflower.com>');
    expect(mime).toContain('To: guest@example.com');
    expect(mime).toContain('Subject: =?utf-8?B?');
    expect(mime).toContain('MIME-Version: 1.0');
    expect(mime).toContain('Content-Type: text/html; charset=utf-8');
    expect(mime).toContain('Content-Transfer-Encoding: 8bit');
    expect(mime).toContain('<h1>Welcome to Mayflower</h1>');
  });

  it('exchanges OAuth 2.0 refresh token for access token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'mock_google_access_token_xyz',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });
    global.fetch = mockFetch;

    const tokenRes = await getGoogleAccessToken({
      clientId: 'mock_client_id.apps.googleusercontent.com',
      clientSecret: 'mock_client_secret',
      refreshToken: 'mock_refresh_token_123',
    });

    expect(tokenRes.accessToken).toBe('mock_google_access_token_xyz');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('dispatches email via official Gmail messages.send endpoint on success', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'active_access_token',
          expires_in: 3600,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'gmail_msg_189ab3cd4ef',
          threadId: 'gmail_thread_987654',
          labelIds: ['SENT'],
        }),
      });
    global.fetch = mockFetch;

    const result = await sendViaGmailApi(
      {
        clientId: 'mock_id',
        clientSecret: 'mock_secret',
        refreshToken: 'mock_refresh',
      },
      {
        from: 'The Mayflower <me>',
        to: 'newpatron@example.com',
        subject: 'Welcome to Mayflower',
        html: '<p>Welcome!</p>',
      }
    );

    expect(result.success).toBe(true);
    expect(result.id).toBe('gmail_msg_189ab3cd4ef');
    expect(result.threadId).toBe('gmail_thread_987654');

    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer active_access_token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('returns graceful error when Google OAuth refresh fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'Token has been expired or revoked.',
      }),
    });
    global.fetch = mockFetch;

    const result = await sendViaGmailApi(
      {
        clientId: 'mock_id',
        clientSecret: 'mock_secret',
        refreshToken: 'expired_refresh_token',
      },
      {
        from: 'The Mayflower <me>',
        to: 'patron@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Token has been expired or revoked');
  });

  it('returns graceful error when Gmail API rejects send request', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'valid_access_token',
          expires_in: 3600,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            message: 'Access Not Configured. Please enable Gmail API in Google Cloud Console.',
            code: 403,
          },
        }),
      });
    global.fetch = mockFetch;

    const result = await sendViaGmailApi(
      {
        clientId: 'mock_id',
        clientSecret: 'mock_secret',
        refreshToken: 'valid_refresh',
      },
      {
        from: 'The Mayflower <me>',
        to: 'patron@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Access Not Configured');
  });
});
