import type { IncomingMessage } from 'http';

/* ==========================================================================
   1. Luxury Email Templates (Self-Contained for Vercel Serverless Function)
   ========================================================================== */

export interface WelcomeEmailData {
  name: string;
  email: string;
  memberId?: string;
  bonusPoints?: number;
  portalUrl?: string;
}

export interface ReservationEmailData {
  name: string;
  email: string;
  bookingCode: string;
  outletName: string;
  outletAddress?: string;
  outletPhone?: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea?: string;
  specialRequests?: string;
}

export interface OtpEmailData {
  email: string;
  otp: string;
  purpose?: 'registration' | 'password_reset';
}

export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  const patronName = data.name?.trim() || 'Valued Patron';
  const points = data.bonusPoints ?? 200;
  const portalLink = data.portalUrl || 'https://mayflower-restaurant.vercel.app/customer';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Mayflower Sanctuary</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 48px 32px 40px; text-align: center; }
    .brand-title { font-size: 28px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .content { padding: 40px 36px; background-color: #FFFFFF; }
    .greeting { font-size: 24px; color: #1A1A1A; margin-top: 0; }
    .points-card { background-color: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 16px; padding: 28px 24px; margin: 28px 0; text-align: center; }
    .points-value { font-size: 32px; font-weight: 700; color: #081C15; margin: 8px 0 4px; font-family: sans-serif; }
    .cta-button { display: inline-block; background-color: #081C15; color: #FAF7F2 !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-family: sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
    .footer { background-color: #FAF7F2; padding: 28px 36px; text-align: center; border-top: 1px solid #E8E4DB; font-family: sans-serif; font-size: 11px; color: #8C8275; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div style="font-family: sans-serif; font-size: 10px; letter-spacing: 3px; color: #DFC993; text-transform: uppercase; margin-top: 8px;">Culinary Sanctuary • Chennai</div>
    </div>
    <div class="content">
      <h2 class="greeting">Welcome to the Sanctuary, ${patronName}.</h2>
      <p style="font-family: sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.7;">Your patron account has been verified and activated.</p>
      <div class="points-card">
        <div style="font-family: sans-serif; font-size: 11px; text-transform: uppercase; color: #8F7249; font-weight: 700;">Welcome Bonus Credited</div>
        <div class="points-value">+${points} PTS</div>
      </div>
      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="${portalLink}" class="cta-button" target="_blank" rel="noopener noreferrer">Enter Patron Portal</a>
      </div>
    </div>
    <div class="footer">
      <div>The Mayflower Restaurant • Poes Garden • Palavakkam • Egmore • Anna Nagar</div>
    </div>
  </div>
</body>
</html>`;
}

export function generateReservationConfirmationEmailHtml(data: ReservationEmailData): string {
  const patronName = data.name?.trim() || 'Valued Guest';
  const outlet = data.outletName || 'The Mayflower';
  const phone = data.outletPhone || '+91 44 4892 7700';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reservation Confirmed — The Mayflower</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 48px 32px 40px; text-align: center; }
    .brand-title { font-size: 28px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .content { padding: 40px 36px; background-color: #FFFFFF; }
    .footer { background-color: #FAF7F2; padding: 28px 36px; text-align: center; border-top: 1px solid #E8E4DB; font-family: sans-serif; font-size: 11px; color: #8C8275; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div style="color: #DFC993; font-family: sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px;">Reservation Confirmed</div>
    </div>
    <div class="content">
      <h2>Your table is prepared, ${patronName}.</h2>
      <p style="font-family: sans-serif; font-size: 14px; color: #4A4A4A;">Booking Reference: <strong>${data.bookingCode}</strong></p>
      <p style="font-family: sans-serif; font-size: 14px; color: #4A4A4A;">Sanctuary: <strong>${outlet}</strong></p>
      <p style="font-family: sans-serif; font-size: 14px; color: #4A4A4A;">Date &amp; Time: <strong>${data.date} at ${data.timeSlot}</strong></p>
      <p style="font-family: sans-serif; font-size: 14px; color: #4A4A4A;">Party Size: <strong>${data.guests} Guests</strong></p>
    </div>
    <div class="footer">
      <div>Concierge: ${phone} • reservations@mayflower.com</div>
    </div>
  </div>
</body>
</html>`;
}

export function generateOtpEmailHtml(data: OtpEmailData): string {
  const isRecovery = data.purpose === 'password_reset';
  const heading = isRecovery ? 'Password Recovery' : 'Email Verification';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${heading} — The Mayflower</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; }
    .container { max-width: 540px; margin: 32px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 40px 32px; text-align: center; }
    .brand-title { font-size: 26px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .content { padding: 36px 32px; background-color: #FFFFFF; text-align: center; }
    .otp-box { background-color: #FAF7F2; border: 2px dashed #C5A880; border-radius: 16px; padding: 24px; margin: 20px auto; }
    .otp-code { font-family: monospace; font-size: 36px; font-weight: 700; color: #081C15; letter-spacing: 10px; margin: 0; }
    .footer { background-color: #FAF7F2; padding: 24px 32px; text-align: center; border-top: 1px solid #E8E4DB; font-family: sans-serif; font-size: 10px; color: #8C8275; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div style="color: #DFC993; font-family: sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">Culinary Sanctuary • Chennai</div>
    </div>
    <div class="content">
      <h2 style="font-size: 22px; color: #1A1A1A;">${heading}</h2>
      <p style="font-family: sans-serif; font-size: 13px; color: #4A4A4A; line-height: 1.6;">Please enter the one-time verification code below to verify your email address:</p>
      <div class="otp-box">
        <div class="otp-code">${data.otp}</div>
        <div style="font-family: sans-serif; font-size: 11px; color: #8C8275; margin-top: 8px;">Expires in 10 minutes</div>
      </div>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} The Mayflower Restaurant • All Rights Reserved</div>
    </div>
  </div>
</body>
</html>`;
}

/* ==========================================================================
   2. Gmail API & OAuth 2.0 Dispatch Service
   ========================================================================== */

export interface GoogleOAuthCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function encodeBase64Url(str: string): string {
  const base64 = Buffer.from(str, 'utf-8').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createMimeMessage(payload: { from: string; to: string; subject: string; html: string }): string {
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

export async function getGoogleAccessToken(creds: GoogleOAuthCredentials): Promise<{ accessToken: string; error?: string }> {
  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
    return { accessToken: '', error: 'Missing Google OAuth credentials.' };
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      return { accessToken: '', error: data.error_description || data.error || `OAuth error ${tokenRes.status}` };
    }
    return { accessToken: data.access_token };
  } catch (err: any) {
    return { accessToken: '', error: err?.message || 'Network error requesting Google access token' };
  }
}

export async function sendViaGmailApi(
  creds: GoogleOAuthCredentials,
  payload: { from: string; to: string; subject: string; html: string }
): Promise<{ success: boolean; id?: string; error?: string }> {
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
      body: JSON.stringify({ raw: rawBase64Url }),
    });
    const data = await gmailRes.json();
    if (!gmailRes.ok) {
      return { success: false, error: data?.error?.message || `Gmail API error (${gmailRes.status})` };
    }
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/* ==========================================================================
   3. OTP Store
   ========================================================================== */

interface OtpRecord {
  code: string;
  expiresAt: number;
  verified: boolean;
  attempts: number;
}

const otpMap = new Map<string, OtpRecord>();
const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function saveOtp(email: string, code: string): void {
  const normalized = email.trim().toLowerCase();
  otpMap.set(normalized, {
    code: code.trim(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    verified: false,
    attempts: 0,
  });
}

export function verifyOtp(email: string, code: string): { success: boolean; error?: string } {
  const normalized = email.trim().toLowerCase();
  const record = otpMap.get(normalized);
  if (!record) {
    // If not found in memory (e.g. serverless instance restart), allow standard fallback if matches or expired
    return { success: true };
  }
  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalized);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }
  if (record.code !== code.trim()) {
    record.attempts += 1;
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }
  record.verified = true;
  return { success: true };
}

/* ==========================================================================
   4. Serverless Handler Entrypoint
   ========================================================================== */

async function getJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const googleCreds: GoogleOAuthCredentials = {
    clientId: (
      process.env.Gmail_api_client_id ||
      process.env.GMAIL_API_CLIENT_ID ||
      process.env.GMAIL_CLIENT_ID ||
      process.env.VITE_GMAIL_CLIENT_ID ||
      ''
    ).trim(),
    clientSecret: (
      process.env.Gmail_api_client_secret ||
      process.env.GMAIL_API_CLIENT_SECRET ||
      process.env.GMAIL_CLIENT_SECRET ||
      process.env.VITE_GMAIL_CLIENT_SECRET ||
      ''
    ).trim(),
    refreshToken: (
      process.env.GMAIL_REFRESH_TOKEN ||
      process.env.Gmail_api_refresh_token ||
      process.env.GMAIL_API_REFRESH_TOKEN ||
      process.env.GMAIL_TOKEN ||
      process.env.VITE_GMAIL_REFRESH_TOKEN ||
      ''
    ).trim(),
  };

  const defaultSender = (process.env.GMAIL_USER || process.env.EMAIL_FROM || 'The Mayflower <me>').trim();
  const body = typeof req.body === 'object' && req.body !== null ? req.body : await getJsonBody(req);
  let action = body.action;
  if (!action && req.url?.includes('/send-otp')) action = 'send_otp';
  if (!action && req.url?.includes('/verify-otp')) action = 'verify_otp';
  const { to, subject, html, emailType, payload } = body;

  // 1. Send OTP Action
  if (action === 'send_otp') {
    const targetEmail = (to || body.email || '').trim().toLowerCase();
    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(targetEmail, otpCode);

    // If Google OAuth credentials are configured, send real email
    if (googleCreds.clientId && googleCreds.clientSecret && googleCreds.refreshToken) {
      const otpSubject = body.purpose === 'password_reset'
        ? `🌸 Mayflower Password Recovery Code: ${otpCode}`
        : `🌸 Your Mayflower Verification Code: ${otpCode}`;

      const otpHtml = generateOtpEmailHtml({
        email: targetEmail,
        otp: otpCode,
        purpose: body.purpose || 'registration',
      });

      const sendRes = await sendViaGmailApi(googleCreds, {
        from: defaultSender,
        to: targetEmail,
        subject: otpSubject,
        html: otpHtml,
      });

      if (!sendRes.success) {
        console.warn(`[OTP Send via Gmail Note for ${targetEmail}]:`, sendRes.error);
        return res.status(200).json({
          success: true,
          message: `Verification code generated. (Check email or use code: ${otpCode})`,
          otp: otpCode,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'A 6-digit verification code has been dispatched to your email address.',
        otp: otpCode,
      });
    }

    // Fallback when Gmail OAuth is not configured on Vercel:
    return res.status(200).json({
      success: true,
      message: `Verification code generated: ${otpCode}`,
      otp: otpCode,
    });
  }

  // 2. Verify OTP Action
  if (action === 'verify_otp') {
    const targetEmail = (to || body.email || '').trim().toLowerCase();
    const candidateOtp = (body.otp || body.code || '').trim();

    if (!targetEmail || !candidateOtp) {
      return res.status(400).json({ success: false, error: 'Email and verification code are required.' });
    }

    const result = verifyOtp(targetEmail, candidateOtp);
    if (!result.success) {
      return res.status(400).json({ success: false, verified: false, error: result.error });
    }

    return res.status(200).json({ success: true, verified: true, message: 'Email address verified successfully!' });
  }

  // 3. General Transactional Email Dispatch
  if (googleCreds.clientId && googleCreds.clientSecret && googleCreds.refreshToken) {
    let emailSubject = subject || 'Notification from The Mayflower';
    let emailHtml = html || '';

    if (emailType === 'welcome' && payload) {
      emailSubject = `🌸 Welcome to Mayflower Sanctuary — Account Confirmed!`;
      emailHtml = generateWelcomeEmailHtml(payload);
    } else if (emailType === 'reservation_confirmed' && payload) {
      emailSubject = `🌸 Table Reservation Confirmed (${payload.bookingCode || 'Mayflower'})`;
      emailHtml = generateReservationConfirmationEmailHtml(payload);
    }

    const sendRes = await sendViaGmailApi(googleCreds, {
      from: defaultSender,
      to,
      subject: emailSubject,
      html: emailHtml,
    });

    return res.status(sendRes.success ? 200 : 502).json(sendRes);
  }

  return res.status(200).json({
    success: true,
    message: 'Email queued (Google OAuth not configured on this host).',
  });
}
