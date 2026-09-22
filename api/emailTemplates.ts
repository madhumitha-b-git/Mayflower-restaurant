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

/**
 * Generate luxury responsive HTML template for Mayflower Welcome Email
 */
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
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 48px 32px 40px; text-align: center; }
    .brand-title { font-size: 28px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .brand-sub { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; color: #DFC993; text-transform: uppercase; margin-top: 10px; font-weight: 600; }
    .content { padding: 40px 36px; background-color: #FFFFFF; }
    .greeting { font-size: 24px; color: #1A1A1A; margin-top: 0; font-weight: normal; line-height: 1.3; }
    .greeting span { color: #8F7249; }
    .body-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.7; margin: 16px 0; }
    .points-card { background-color: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 16px; padding: 28px 24px; margin: 28px 0; text-align: center; }
    .points-tag { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8F7249; font-weight: 700; }
    .points-value { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 700; color: #081C15; margin: 8px 0 4px; }
    .points-desc { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1B5E20; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #081C15; color: #FAF7F2 !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-top: 12px; }
    .footer { background-color: #FAF7F2; padding: 28px 36px; text-align: center; border-top: 1px solid #E8E4DB; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #8C8275; line-height: 1.6; }
    .outlets { margin-bottom: 8px; font-weight: 600; color: #5A5A40; letter-spacing: 1px; text-transform: uppercase; font-size: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div class="brand-sub">Culinary Sanctuary • Chennai</div>
    </div>
    <div class="content">
      <h2 class="greeting">Welcome to the Sanctuary, <span>${patronName}</span>.</h2>
      <p class="body-text">
        Your patron account has been verified and activated. We invite you to experience Chennai's premier destination for fine dining, serene botanical spaces, and private culinary salons.
      </p>
      <div class="points-card">
        <div class="points-tag">Welcome Privileges Credited</div>
        <div class="points-value">+${points} PTS</div>
        <div class="points-desc">Green Tier Loyalty Bonus Added to Your Balance</div>
      </div>
      <p class="body-text">
        As a verified patron, you now enjoy priority table booking across all our sanctuaries, bespoke chef menu previews, and points accrual on every culinary visit.
      </p>
      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="${portalLink}" class="cta-button" target="_blank" rel="noopener noreferrer">Enter Patron Portal</a>
      </div>
    </div>
    <div class="footer">
      <div class="outlets">Poes Garden • Palavakkam • Egmore • Anna Nagar</div>
      <div>The Mayflower Restaurant • 12/4 Cathedral Road, Poes Garden, Chennai 600086</div>
      <div style="margin-top: 6px;">Concierge: +91 44 4892 7700 • reservations@mayflower.com</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate luxury responsive HTML template for Mayflower Reservation Confirmation Email
 */
export function generateReservationConfirmationEmailHtml(data: ReservationEmailData): string {
  const patronName = data.name?.trim() || 'Valued Guest';
  const outlet = data.outletName || 'The Mayflower (Poes Garden)';
  const address = data.outletAddress || 'Poes Garden, Chennai';
  const phone = data.outletPhone || '+91 44 4892 7700';
  const guestsLabel = `${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}`;
  const seating = data.seatingArea || 'Main Dining Hall';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Confirmed — The Mayflower</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 48px 32px 40px; text-align: center; }
    .brand-title { font-size: 28px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .status-badge { display: inline-block; background-color: #DFC993; color: #081C15; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-top: 14px; }
    .content { padding: 40px 36px; background-color: #FFFFFF; }
    .greeting { font-size: 22px; color: #1A1A1A; margin-top: 0; font-weight: normal; }
    .body-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #4A4A4A; line-height: 1.7; margin: 16px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #FAF7F2; border: 1px solid #E8E4DB; border-radius: 16px; overflow: hidden; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; }
    .details-table tr { border-bottom: 1px solid #E8E4DB; }
    .details-table tr:last-child { border-bottom: none; }
    .details-table td { padding: 14px 20px; }
    .label-col { color: #736C61; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; width: 35%; }
    .val-col { color: #1A1A1A; font-weight: 600; text-align: right; }
    .code-val { font-family: monospace; font-size: 16px; color: #081C15; letter-spacing: 2px; font-weight: 700; }
    .notice { background-color: #F4EFE6; border-left: 3px solid #C5A880; padding: 14px 18px; border-radius: 8px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #5A5243; line-height: 1.6; margin-top: 24px; }
    .footer { background-color: #FAF7F2; padding: 28px 36px; text-align: center; border-top: 1px solid #E8E4DB; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #8C8275; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div><span class="status-badge">Table Reservation Confirmed</span></div>
    </div>
    <div class="content">
      <h2 class="greeting">Your table is prepared, ${patronName}.</h2>
      <p class="body-text">
        We have reserved your table at our <strong>${outlet}</strong> sanctuary. Please find the confirmed itinerary below:
      </p>

      <table class="details-table">
        <tr>
          <td class="label-col">Booking Reference</td>
          <td class="val-col code-val">${data.bookingCode}</td>
        </tr>
        <tr>
          <td class="label-col">Sanctuary</td>
          <td class="val-col">${outlet}</td>
        </tr>
        <tr>
          <td class="label-col">Date &amp; Time</td>
          <td class="val-col">${data.date} at ${data.timeSlot}</td>
        </tr>
        <tr>
          <td class="label-col">Party Size</td>
          <td class="val-col">${guestsLabel} (${seating})</td>
        </tr>
        ${data.specialRequests ? `<tr><td class="label-col">Special Requests</td><td class="val-col">${data.specialRequests}</td></tr>` : ''}
        <tr>
          <td class="label-col">Patron Reward</td>
          <td class="val-col" style="color: #1B5E20;">+150 PTS Visit Accrual</td>
        </tr>
      </table>

      <div class="notice">
        <strong>Sanctuary Etiquette &amp; Arrival:</strong> We hold reserved tables for up to 15 minutes past your booking time. For changes, cancellations, or dietary guidance, please call our host desk directly at <strong>${phone}</strong>.
      </div>
    </div>
    <div class="footer">
      <div>${outlet} • ${address}</div>
      <div style="margin-top: 6px;">Concierge Desk: ${phone} • reservations@mayflower.com</div>
      <div style="margin-top: 12px; color: #A69C8E; font-size: 10px;">The Mayflower Culinary Sanctuary Chennai • All Rights Reserved</div>
    </div>
  </div>
</body>
</html>`;
}

export interface OtpEmailData {
  email: string;
  otp: string;
  purpose?: 'registration' | 'password_reset';
}

/**
 * Generate luxury responsive HTML template for Mayflower OTP Verification Email
 */
export function generateOtpEmailHtml(data: OtpEmailData): string {
  const isRecovery = data.purpose === 'password_reset';
  const heading = isRecovery ? 'Password Recovery' : 'Email Verification';
  const subtext = isRecovery
    ? 'We received a request to reset your Mayflower patron password. Please enter the verification code below to establish your secure recovery session:'
    : 'Thank you for registering with The Mayflower Culinary Sanctuary. To verify your email address and proceed with creating your patron account, please enter the one-time verification code below:';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading} — The Mayflower</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 540px; margin: 32px auto; background-color: #FFFFFF; border: 1px solid #E8E4DB; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #081C15 0%, #15392B 100%); color: #FAF7F2; padding: 40px 32px; text-align: center; }
    .brand-title { font-size: 26px; letter-spacing: 4px; font-weight: 300; margin: 0; color: #FAF7F2; text-transform: uppercase; }
    .brand-sub { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9px; letter-spacing: 3px; color: #DFC993; text-transform: uppercase; margin-top: 8px; font-weight: 600; }
    .content { padding: 36px 32px; background-color: #FFFFFF; text-align: center; }
    .title { font-size: 22px; color: #1A1A1A; margin-top: 0; font-weight: normal; }
    .body-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4A4A; line-height: 1.6; margin: 16px 0 28px; text-align: left; }
    .otp-box { background-color: #FAF7F2; border: 2px dashed #C5A880; border-radius: 16px; padding: 24px; margin: 0 auto 28px; }
    .otp-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8F7249; font-weight: 700; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #081C15; letter-spacing: 10px; margin: 0; }
    .expiry-note { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #8C8275; margin-top: 8px; }
    .security-notice { background-color: #FFFDF9; border-left: 3px solid #C5A880; padding: 12px 16px; text-align: left; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #665E51; line-height: 1.5; border-radius: 4px; }
    .footer { background-color: #FAF7F2; padding: 24px 32px; text-align: center; border-top: 1px solid #E8E4DB; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #8C8275; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">The Mayflower</h1>
      <div class="brand-sub">Culinary Sanctuary • Chennai</div>
    </div>
    <div class="content">
      <h2 class="title">${heading}</h2>
      <p class="body-text">${subtext}</p>
      
      <div class="otp-box">
        <div class="otp-label">One-Time Verification Code</div>
        <div class="otp-code">${data.otp}</div>
        <div class="expiry-note">Expires in 10 minutes</div>
      </div>

      <div class="security-notice">
        <strong>Security Notice:</strong> Never share this code with anyone. Mayflower staff will never ask for your verification code. If you did not initiate this request, you can safely disregard this message.
      </div>
    </div>
    <div class="footer">
      <div>Poes Garden • Palavakkam • Egmore • Anna Nagar</div>
      <div style="margin-top: 6px;">© ${new Date().getFullYear()} The Mayflower Restaurant • All Rights Reserved</div>
    </div>
  </div>
</body>
</html>`;
}
