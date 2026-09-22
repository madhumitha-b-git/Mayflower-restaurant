/**
 * In-Memory & Distributed OTP Verification Store
 * Manages 6-digit email verification codes with expiration (10 mins) and rate limits.
 */

export interface OtpRecord {
  code: string;
  expiresAt: number;
  verified: boolean;
  attempts: number;
}

// In-memory store keyed by normalized email
const otpMap = new Map<string, OtpRecord>();

// Expiration time: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Save or overwrite an OTP for a given email
 */
export function saveOtp(email: string, code: string): void {
  const normalized = email.trim().toLowerCase();
  otpMap.set(normalized, {
    code: code.trim(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    verified: false,
    attempts: 0,
  });
}

/**
 * Verify an entered OTP against the store
 */
export function verifyOtp(email: string, code: string): { success: boolean; error?: string } {
  const normalized = email.trim().toLowerCase();
  const record = otpMap.get(normalized);

  if (!record) {
    return { success: false, error: 'No verification code was requested for this email address.' };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalized);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpMap.delete(normalized);
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }

  // Mark as verified
  record.verified = true;
  return { success: true };
}

/**
 * Check if an email has already been verified
 */
export function isEmailVerified(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const record = otpMap.get(normalized);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalized);
    return false;
  }
  return record.verified;
}

/**
 * Clear an OTP record once account registration is finished
 */
export function clearOtp(email: string): void {
  const normalized = email.trim().toLowerCase();
  otpMap.delete(normalized);
}

/**
 * Testing helper: reset store
 */
export function resetOtpStore(): void {
  otpMap.clear();
}
