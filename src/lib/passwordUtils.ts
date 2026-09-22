/**
 * Mayflower Secure Password Hashing & Verification Utilities
 * Uses Web Crypto API (SHA-256) with fallback for universal browser and server support.
 */

/**
 * Generate a SHA-256 hex digest for a password string
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js environment fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(password).digest('hex');
  } catch {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

/**
 * Compare entered password against stored hash or password
 */
export async function verifyPassword(enteredPassword: string, storedHash: string): Promise<boolean> {
  if (!enteredPassword || !storedHash) return false;

  // Direct match (for legacy demo staff accounts or plain seeds)
  if (enteredPassword === storedHash) {
    return true;
  }

  // SHA-256 hash comparison
  const computedHash = await hashPassword(enteredPassword);
  return computedHash === storedHash;
}
