/**
 * Email validation utility
 * Enforces valid format strictly ending with @gmail.com or @outlook.com as requested
 */
export const isValidEmailDomain = (email: string): boolean => {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com)$/;
  return regex.test(trimmed);
};

export const EMAIL_VALIDATION_MESSAGE = 'Please enter a valid email address with @gmail.com or @outlook.com format.';
