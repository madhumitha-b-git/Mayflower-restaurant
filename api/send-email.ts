import type { IncomingMessage } from 'http';
import { generateWelcomeEmailHtml, generateReservationConfirmationEmailHtml, generateOtpEmailHtml } from './emailTemplates';
import { sendViaGmailApi, GoogleOAuthCredentials } from './gmailService';
import { saveOtp, verifyOtp, isEmailVerified } from './otpStore';

interface OutboxRow {
  id: string;
  idempotency_key: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  payload: Record<string, any>;
  status: string;
  attempt_count: number;
}

/** Helper to read json body from incoming request */
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

/**
 * Vercel Serverless Function entrypoint
 * Uses the official Google Gmail API with OAuth 2.0 to deliver transactional emails.
 */
export default async function handler(req: any, res: any) {
  // Support CORS for client invocations
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // Google OAuth 2.0 Credentials from .env
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  const body = typeof req.body === 'object' && req.body !== null ? req.body : await getJsonBody(req);
  let action = body.action;
  if (!action && req.url?.includes('/send-otp')) action = 'send_otp';
  if (!action && req.url?.includes('/verify-otp')) action = 'verify_otp';
  const { to, subject, html, emailType, payload } = body;

  // 1. Verify Google OAuth credentials availability
  if (!googleCreds.clientId || !googleCreds.clientSecret) {
    console.warn('[Gmail API] Google OAuth Client ID or Client Secret not configured.');
    return res.status(500).json({
      success: false,
      error: 'Google OAuth configuration missing. Set Gmail_api_client_id and Gmail_api_client_secret in .env.',
    });
  }

  // 2. Handle OTP Verification Actions
  if (action === 'send_otp') {
    const targetEmail = (to || body.email || '').trim().toLowerCase();
    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required to send verification code.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(targetEmail, otpCode);

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
      console.error(`[OTP Send Failed for ${targetEmail}]:`, sendRes.error);
      return res.status(502).json({ success: false, error: sendRes.error || 'Failed to dispatch verification email via Gmail.' });
    }

    return res.status(200).json({
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email address.',
      email: targetEmail,
    });
  }

  if (action === 'verify_otp') {
    const targetEmail = (to || body.email || '').trim().toLowerCase();
    const candidateCode = (body.otp || body.code || '').trim();

    if (!targetEmail || !candidateCode) {
      return res.status(400).json({ success: false, error: 'Both email and verification code are required.' });
    }

    const verifyResult = verifyOtp(targetEmail, candidateCode);
    if (!verifyResult.success) {
      return res.status(400).json({ success: false, error: verifyResult.error });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      email: targetEmail,
      message: 'Email address successfully verified.',
    });
  }

  if (action === 'check_verification') {
    const targetEmail = (to || body.email || '').trim().toLowerCase();
    const verified = isEmailVerified(targetEmail);
    return res.status(200).json({ success: true, verified });
  }

  // 3. Direct transactional email send
  if (to && (html || emailType)) {
    let finalHtml = html;
    let finalSubject = subject || 'The Mayflower Notification';

    if (emailType === 'WELCOME_EMAIL' || emailType === 'welcome') {
      finalHtml = generateWelcomeEmailHtml({
        name: payload?.name || payload?.member_name || body.name || to.split('@')[0],
        email: to,
        bonusPoints: payload?.bonusPoints || payload?.bonus_points || 200,
        portalUrl: payload?.portalUrl,
      });
      finalSubject = finalSubject || '🌸 Welcome to Mayflower Sanctuary — Account Verified (+200 PTS Credited)';
    } else if (emailType === 'RESERVATION_EMAIL' || emailType === 'reservation_confirmation') {
      finalHtml = generateReservationConfirmationEmailHtml({
        name: payload?.name || body.name || to.split('@')[0],
        email: to,
        bookingCode: payload?.booking_code || payload?.bookingCode || 'MAY-RES',
        outletName: payload?.outlet_name || payload?.outlet || 'Poes Garden',
        outletAddress: payload?.outlet_address || payload?.address,
        outletPhone: payload?.outlet_phone || payload?.phone,
        date: payload?.date || new Date().toISOString().split('T')[0],
        timeSlot: payload?.time || payload?.timeSlot || '19:00',
        guests: payload?.party_size || payload?.guests || 2,
        seatingArea: payload?.seatingArea || payload?.special_requests,
        specialRequests: payload?.specialRequests || payload?.special_requests,
      });
      finalSubject = finalSubject || `🍽️ Reservation Confirmed: Mayflower (${payload?.booking_code || 'Confirmed'})`;
    }

    const sendRes = await sendViaGmailApi(googleCreds, {
      from: defaultSender,
      to,
      subject: finalSubject,
      html: finalHtml,
    });

    if (!sendRes.success) {
      console.error(`[Gmail Dispatch Error] Failed to send to ${to}:`, sendRes.error);
      return res.status(502).json({ success: false, error: sendRes.error });
    }

    return res.status(200).json({
      success: true,
      messageId: sendRes.id,
      threadId: sendRes.threadId,
      recipient: to,
      emailType: emailType || 'direct',
    });
  }

  // 3. Process Pending Email Outbox
  if (action === 'process_outbox' || action === 'poll_outbox') {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: 'Supabase credentials missing for outbox processing.' });
    }

    try {
      const fetchOutboxRes = await fetch(`${supabaseUrl}/rest/v1/email_outbox?status=eq.pending&attempt_count=lt.3&order=created_at.asc&limit=10`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      const items: OutboxRow[] = await fetchOutboxRes.json();
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(200).json({ success: true, processed: 0, message: 'No pending emails in outbox' });
      }

      const results = [];
      for (const item of items) {
        let emailHtml = '';
        if (item.email_type === 'welcome') {
          emailHtml = generateWelcomeEmailHtml({
            name: item.recipient_name || item.payload?.member_name || item.recipient_email.split('@')[0],
            email: item.recipient_email,
            bonusPoints: item.payload?.bonus_points || 200,
          });
        } else if (item.email_type === 'reservation_confirmation') {
          emailHtml = generateReservationConfirmationEmailHtml({
            name: item.recipient_name || 'Valued Guest',
            email: item.recipient_email,
            bookingCode: item.payload?.booking_code || 'MAY-RES',
            outletName: item.payload?.outlet_name || 'Poes Garden',
            outletAddress: item.payload?.outlet_address,
            outletPhone: item.payload?.outlet_phone,
            date: item.payload?.date || '',
            timeSlot: item.payload?.time || '',
            guests: item.payload?.party_size || 2,
            specialRequests: item.payload?.special_requests,
          });
        } else {
          emailHtml = item.payload?.html || `<p>${item.subject}</p>`;
        }

        const sendRes = await sendViaGmailApi(googleCreds, {
          from: defaultSender,
          to: item.recipient_email,
          subject: item.subject,
          html: emailHtml,
        });

        // Update outbox status in Supabase
        const updatePayload: Record<string, any> = {
          attempt_count: item.attempt_count + 1,
          updated_at: new Date().toISOString(),
        };

        if (sendRes.success) {
          updatePayload.status = 'sent';
          updatePayload.sent_at = new Date().toISOString();
          updatePayload.provider_message_id = sendRes.id;
        } else {
          updatePayload.status = item.attempt_count + 1 >= 3 ? 'failed' : 'pending';
          updatePayload.last_error = sendRes.error;
        }

        await fetch(`${supabaseUrl}/rest/v1/email_outbox?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(updatePayload),
        });

        results.push({ id: item.id, recipient: item.recipient_email, success: sendRes.success, messageId: sendRes.id });
      }

      return res.status(200).json({ success: true, processed: results.length, results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Outbox processing failed' });
    }
  }

  return res.status(400).json({ error: 'Invalid request. Specify "to" and "html"/"emailType" or action="process_outbox".' });
}
