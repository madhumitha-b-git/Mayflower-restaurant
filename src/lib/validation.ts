/**
 * Universal Email Validation Utility
 * Supports all standard email formats, including personal providers (Gmail, Yahoo,
 * Hotmail, Outlook, iCloud, etc.), corporate domains, and institutional/educational
 * domain-specific emails (e.g., .edu, .edu.in, .ac.uk, .res.in, etc.).
 */
export const isValidEmailDomain = (email: string): boolean => {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  // RFC 5322 compliant regex supporting multi-part subdomains, university domains, and special characters
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
};

export const EMAIL_VALIDATION_MESSAGE = 'Please enter a valid email address.';

/**
 * 10-Digit Contact Number Validation & Sanitization Utility
 * Strictly accepts 10 numerical digits with no special characters or alphabets.
 */
export const cleanContactNumber = (val: string): string => {
  return val.replace(/\D/g, '').slice(0, 10);
};

export const isValidContactNumber = (phone: string): boolean => {
  return /^[0-9]{10}$/.test(phone.trim());
};

export const PHONE_VALIDATION_MESSAGE = 'Please enter a valid 10-digit mobile number (numbers only).';
