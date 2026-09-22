import { UserReservationRecord } from '../types';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

export const dispatchAutomatedEmail = async (
  to: string,
  subject: string,
  html: string,
  emailType: string,
  payload?: Record<string, any>
): Promise<EmailDispatchResult> => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        emailType,
        payload,
      })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[Email Dispatch Warning ${emailType}]:`, err);
    // Non-blocking: fail gracefully without crashing UI operations
    return { success: false, error: err };
  }
};

/**
 * 1. Welcome & Registration Confirmation Email (Dispatched via Gmail API)
 */
export const sendWelcomeConfirmationEmail = async (
  email: string,
  name: string,
  memberId: string
): Promise<EmailDispatchResult> => {
  const patronName = name?.trim() || email.split('@')[0];
  const subject = `🌸 Welcome ${patronName} to Mayflower — Account Created (+200 PTS)`;
  return dispatchAutomatedEmail(email, subject, '', 'WELCOME_EMAIL', {
    name: patronName,
    memberId,
    bonusPoints: 200,
  });
};

/**
 * 2. Seat Table Reservation Confirmation Email (Dispatched via Gmail API)
 */
export const sendReservationConfirmationEmail = async (
  email: string,
  name: string,
  resData: UserReservationRecord
): Promise<EmailDispatchResult> => {
  const subject = `🍽️ Reservation Confirmed: Mayflower ${resData.outlet} (${resData.bookingCode})`;
  return dispatchAutomatedEmail(email, subject, '', 'RESERVATION_EMAIL', {
    name,
    booking_code: resData.bookingCode,
    outlet_name: resData.outlet,
    date: resData.date,
    time: resData.timeSlot,
    party_size: resData.guests,
    seatingArea: resData.seatingArea,
  });
};

/**
 * 3. Happiness Gift Card Purchase & Claim Confirmation Email
 */
export const sendGiftCardClaimEmail = async (
  email: string,
  name: string,
  cardTitle: string,
  code: string,
  pointsSpent: number
): Promise<EmailDispatchResult> => {
  const subject = `🎁 Mayflower Happiness Card Claimed: ${cardTitle} (${code})`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 20px; overflow: hidden;">
      <div style="background: #081C15; color: #ffffff; padding: 36px; text-align: center;">
        <h1 style="font-size: 26px; margin: 0; font-weight: 400; letter-spacing: 3px;">HAPPINESS GIFT CARD</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #DFC993; margin-top: 8px;">MAYFLOWER MOMENTS</p>
      </div>
      <div style="padding: 36px; background: #ffffff;">
        <h2 style="font-size: 20px; color: #1A1A1A; margin-top: 0; font-weight: normal;">Congratulations, ${name}!</h2>
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.6;">
          You have successfully claimed your Mayflower Moment Happiness Gift Card for <strong>${cardTitle}</strong> using your reward points (-${pointsSpent} PTS).
        </p>
        <div style="background: #FAF7F2; border: 2px dashed #C5A880; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
          <span style="font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #5A5A40; font-weight: bold;">Gift Voucher Code</span>
          <div style="font-family: monospace; font-size: 26px; font-weight: bold; color: #081C15; margin-top: 6px; letter-spacing: 4px;">${code}</div>
          <div style="margin-top: 12px; font-family: Arial, sans-serif; font-size: 13px; color: #5A5A40;">
            Valid at all Mayflower Outlets in Chennai
          </div>
        </div>
      </div>
    </div>
  `;
  return dispatchAutomatedEmail(email, subject, html, 'GIFTCARD_EMAIL');
};
