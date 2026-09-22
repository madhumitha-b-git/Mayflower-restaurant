/**
 * Official Gmail API & Google OAuth 2.0 Delivery Service
 * Implements RFC 2822 MIME generation, URL-safe base64 encoding,
 * OAuth 2.0 token refresh, and Gmail messages.send endpoint.
 */

export interface GmailSendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface GoogleOAuthCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface GmailSendResult {
  success: boolean;
  id?: string;
  threadId?: string;
  error?: string;
}

// In-memory token cache to avoid redundant OAuth token requests
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

export function resetTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}

/**
 * Encode string to URL-safe base64 string (RFC 4648 §5)
 */
export function encodeBase64Url(str: string): string {
  const base64 = Buffer.from(str, 'utf-8').toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Build RFC 2822 formatted MIME message
 */
export function createMimeMessage(payload: GmailSendPayload): string {
  const subjectEncoded = Buffer.from(payload.subject, 'utf-8').toString('base64');
  
  const headers = [
    `From: ${payload.from}`,
    `To: ${payload.to}`,
    `Subject: =?utf-8?B?${subjectEncoded}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
  ];

  return `${headers.join('\r\n')}\r\n\r\n${payload.html}`;
}

/**
 * Exchange Google OAuth 2.0 refresh token for a short-lived access token
 */
export async function getGoogleAccessToken(creds: GoogleOAuthCredentials): Promise<{ accessToken: string; error?: string }> {
  const now = Date.now();
  // Return cached token if valid for at least 60 more seconds
  if (cachedAccessToken && tokenExpiresAt > now + 60000) {
    return { accessToken: cachedAccessToken };
  }

  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
    return {
      accessToken: '',
      error: 'Missing Google OAuth 2.0 credentials (clientId, clientSecret, or refreshToken).',
    };
  }

  try {
    const params = new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
      grant_type: 'refresh_token',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      return {
        accessToken: '',
        error: data.error_description || data.error || `Failed to refresh Google OAuth token (${tokenRes.status})`,
      };
    }

    cachedAccessToken = data.access_token;
    tokenExpiresAt = now + ((data.expires_in || 3600) * 1000);
    return { accessToken: cachedAccessToken! };
  } catch (err: any) {
    return {
      accessToken: '',
      error: err?.message || 'Network error requesting Google OAuth access token',
    };
  }
}

/**
 * Dispatch transactional email via official Google Gmail API (messages.send)
 */
export async function sendViaGmailApi(
  creds: GoogleOAuthCredentials,
  payload: GmailSendPayload
): Promise<GmailSendResult> {
  const tokenResult = await getGoogleAccessToken(creds);
  if (tokenResult.error || !tokenResult.accessToken) {
    return { success: false, error: tokenResult.error || 'Failed to obtain access token.' };
  }

  try {
    const rawMime = createMimeMessage(payload);
    const rawBase64Url = encodeBase64Url(rawMime);

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawBase64Url,
      }),
    });

    const data = await gmailRes.json();
    if (!gmailRes.ok) {
      const errMsg = data?.error?.message || `Gmail API error (${gmailRes.status})`;
      console.error('[Gmail API Error]:', errMsg);
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      id: data.id,
      threadId: data.threadId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error dispatching email via Gmail API',
    };
  }
}
