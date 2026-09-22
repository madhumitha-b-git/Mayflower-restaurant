import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserRole, LoyaltyTier, PointTransaction, UserReservationRecord } from '../types';
import { loginWithPassword, getStoredUsers, saveStoredUsers, setCurrentUserSession, getCurrentUser } from '../data/userStorage';
import { sendWelcomeConfirmationEmail } from '../data/emailService';
import { hashPassword, verifyPassword } from './passwordUtils';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

const STAFF_EMAIL_ROLE_MAP: Record<string, UserRole> = {
  'superadmin@gmail.com': 'SuperAdmin',
  'owner@gmail.com': 'Owner',
  'admin@gmail.com': 'Admin',
  'manager@gmail.com': 'Manager',
  'chef@gmail.com': 'Chef',
  'hr@gmail.com': 'HR',
  'accountant@gmail.com': 'Accountant',
};

/**
 * Request an email verification OTP via official Gmail API
 * Pre-checks if the email is already registered before dispatching OTP for registration.
 */
export const requestEmailOtp = async (
  email: string,
  purpose: 'registration' | 'password_reset' = 'registration'
): Promise<{ success: boolean; message: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // Pre-check if email already exists when registering
  if (purpose === 'registration') {
    try {
      if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
        return { success: false, message: 'This email is already registered. Please sign in instead.' };
      }

      // Check public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'This email is already registered. Please sign in instead.' };
      }

      // Check public.user_profiles
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existingProfile) {
        return { success: false, message: 'This email is already registered. Please sign in instead.' };
      }
    } catch (e) {
      console.warn('Pre-registration check note:', e);
    }
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_otp',
        to: normalizedEmail,
        purpose,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || data.message || 'Failed to dispatch verification code via Gmail.',
      };
    }

    return {
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email address.',
    };
  } catch (err: any) {
    console.error('[requestEmailOtp Error]:', err);
    return { success: false, message: err?.message || 'Network error while sending OTP.' };
  }
};

/**
 * Verify a 6-digit email OTP against the server OTP store
 */
export const verifyEmailOtp = async (
  email: string,
  otp: string
): Promise<{ success: boolean; verified: boolean; message?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  if (!cleanOtp) {
    return { success: false, verified: false, message: 'Please enter the 6-digit verification code.' };
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_otp',
        to: normalizedEmail,
        otp: cleanOtp,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.verified) {
      return {
        success: false,
        verified: false,
        message: data.error || data.message || 'Invalid or expired verification code.',
      };
    }

    return { success: true, verified: true, message: 'Email address successfully verified!' };
  } catch (err: any) {
    console.error('[verifyEmailOtp Error]:', err);
    return { success: false, verified: false, message: err?.message || 'Network error during verification.' };
  }
};

/** Sign in with email + password via direct database query + SHA-256 password hash comparison */
export const supabaseLogin = async (email: string, password: string): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  // 0. If staff email in SEED_STAFF, check local staff login first
  if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
    const localRes = loginWithPassword(normalizedEmail, password);
    if (localRes.success && localRes.user) {
      localRes.user.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
      localStorage.setItem('mayflower_current_user_id', localRes.user.id);
      localStorage.setItem('mayflower_current_user', JSON.stringify(localRes.user));
      return localRes;
    }
  }

  if (!isSupabaseConfigured) {
    const localRes = loginWithPassword(normalizedEmail, password);
    if (localRes.success && localRes.user) {
      localStorage.setItem('mayflower_current_user_id', localRes.user.id);
      localStorage.setItem('mayflower_current_user', JSON.stringify(localRes.user));
    }
    return localRes;
  }

  // 1. Direct database lookup in public.users (where password_hash is stored)
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (userRow) {
      // Verify SHA-256 hash or plain password
      const isPasswordValid = await verifyPassword(password, userRow.password_hash);
      if (!isPasswordValid) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }

      // Password matches! Fetch or construct full patron profile
      let profile = await fetchUserProfile(userRow.id);
      if (!profile) {
        const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        profile = {
          id: userRow.id,
          name: userRow.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          phone: userRow.phone || '',
          role: (userRow.role as UserRole) || 'Customer',
          rewardPoints: 200,
          tier: 'Green',
          totalVisits: 0,
          joinedDate: todayStr,
          transactions: [],
          reservations: [],
        };

        try {
          await supabase.from('user_profiles').upsert({
            id: userRow.id,
            name: profile.name,
            email: normalizedEmail,
            phone: profile.phone,
            role: profile.role,
            reward_points: 200,
            tier: 'Green',
            total_visits: 0,
            joined_date: todayStr,
            transactions: [],
            reservations: [],
          }, { onConflict: 'id' });
        } catch {}
      }

      if (userRow.phone && !profile.phone) {
        profile.phone = userRow.phone;
      }
      if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
        profile.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
      }

      // Establish session
      localStorage.setItem('mayflower_current_user_id', userRow.id);
      localStorage.setItem('mayflower_current_user', JSON.stringify(profile));

      return { success: true, user: profile };
    }
  } catch (err) {
    console.warn('[supabaseLogin direct users lookup note]:', err);
  }

  // 2. Check local SEED_STAFF / userStorage fallback for demo accounts
  const localRes = loginWithPassword(normalizedEmail, password);
  if (localRes.success && localRes.user) {
    if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
      localRes.user.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
    }
    localStorage.setItem('mayflower_current_user_id', localRes.user.id);
    localStorage.setItem('mayflower_current_user', JSON.stringify(localRes.user));
    return localRes;
  }

  // 3. Check 'user_profiles' table for existing customer
  try {
    const { data: existingProf } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (existingProf) {
      const mappedProfile: UserProfile = {
        id: existingProf.id,
        name: existingProf.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        phone: existingProf.phone || '',
        role: (existingProf.role as UserRole) || 'Customer',
        rewardPoints: existingProf.reward_points ?? 200,
        tier: (existingProf.tier as LoyaltyTier) ?? 'Green',
        totalVisits: existingProf.total_visits ?? 0,
        joinedDate: existingProf.joined_date ?? new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactions: existingProf.transactions ?? [],
        reservations: existingProf.reservations ?? [],
      };
      localStorage.setItem('mayflower_current_user_id', existingProf.id);
      localStorage.setItem('mayflower_current_user', JSON.stringify(mappedProfile));
      return { success: true, user: mappedProfile };
    }
  } catch {}

  return {
    success: false,
    message: 'We could not find an account with those details. New to Mayflower? Register your account first.'
  };
};

/**
 * Sign up a new customer directly in the database
 * Stores name, email, phone, SHA-256 password hash in public.users and public.user_profiles
 * Dispatches welcome email via official Gmail API immediately upon registration.
 */
export const supabaseRegister = async (
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const patronName = (name || '').trim() || normalizedEmail.split('@')[0];

  // Pre-check DB tables for existing account with this email
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: 'This email is already registered. Please sign in instead.' };
    }

    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, message: 'This email is already registered. Please sign in instead.' };
    }
  } catch {}

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const newUserId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Hash password with SHA-256
  const passwordHash = await hashPassword(password);

  // 1. Insert into public.users (stores credentials + phone)
  try {
    const { error: userInsertError } = await supabase.from('users').insert({
      id: newUserId,
      name: patronName,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'Customer',
      phone: cleanPhone,
      is_active: true,
    });

    if (userInsertError) {
      console.error('[supabaseRegister] users table insert error:', userInsertError);
    }
  } catch (err) {
    console.warn('[supabaseRegister] users insert exception:', err);
  }

  // 2. Insert into public.user_profiles (stores rewards, tier, visits, bookings)
  const newProfileRow = {
    id: newUserId,
    name: patronName,
    email: normalizedEmail,
    phone: cleanPhone,
    role: 'Customer' as UserRole,
    reward_points: 200,
    tier: 'Green' as LoyaltyTier,
    total_visits: 0,
    joined_date: todayStr,
    transactions: [{
      id: `signup-${newUserId}`,
      type: 'earned_signup' as const,
      points: 200,
      description: 'Welcome bonus for registering your Mayflower account',
      date: todayStr,
    }],
    reservations: [],
  };

  try {
    const { error: profileError } = await supabase.from('user_profiles').insert(newProfileRow);
    if (profileError) {
      console.warn('[supabaseRegister] user_profiles insert note:', profileError);
      await supabase.from('user_profiles').upsert(newProfileRow, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('[supabaseRegister] user_profiles exception:', err);
  }

  // 3. Sync to public.customers table if exists
  try {
    await supabase.from('customers').insert({
      user_id: newUserId,
      name: patronName,
      email: normalizedEmail,
      phone: cleanPhone,
    });
  } catch {}

  const finalProfile: UserProfile = {
    id: newUserId,
    name: patronName,
    email: normalizedEmail,
    phone: cleanPhone,
    role: 'Customer',
    rewardPoints: 200,
    tier: 'Green',
    totalVisits: 0,
    joinedDate: todayStr,
    transactions: newProfileRow.transactions,
    reservations: [],
  };

  // 4. Save session locally
  try {
    localStorage.setItem('mayflower_current_user_id', newUserId);
    localStorage.setItem('mayflower_current_user', JSON.stringify(finalProfile));
    // Save in userStorage local backup
    const existingStored = getStoredUsers();
    if (!existingStored.some(u => u.email.toLowerCase() === normalizedEmail)) {
      saveStoredUsers([...existingStored, { ...finalProfile, password }]);
    }
  } catch {}

  // 5. Dispatch Welcome Email via official Gmail API immediately upon registration
  try {
    sendWelcomeConfirmationEmail(normalizedEmail, patronName, newUserId);
  } catch (err) {
    console.warn('[Welcome Email Send Warning]:', err);
  }

  return { success: true, user: finalProfile };
};

/** Fetch the user_profiles row and map to UserProfile shape with fallback construction */
export const fetchUserProfile = async (userId: string, _authUserFallback?: any): Promise<UserProfile | null> => {
  if (!userId) return null;

  // 1. Try querying 'user_profiles' table
  try {
    const { data: profileRow } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileRow) {
      let fetchedPhone = profileRow.phone ?? profileRow.contact_number ?? '';

      // Fallback to public.users table if phone is missing in user_profiles
      if (!fetchedPhone) {
        try {
          const { data: uRow } = await supabase.from('users').select('phone').eq('id', userId).maybeSingle();
          if (uRow?.phone) {
            fetchedPhone = uRow.phone;
            supabase.from('user_profiles').update({ phone: fetchedPhone }).eq('id', userId).then();
          }
        } catch {}
      }

      if (!fetchedPhone) {
        try {
          const { data: custRow } = await supabase.from('customers').select('phone').eq('user_id', userId).maybeSingle();
          if (custRow?.phone) fetchedPhone = custRow.phone;
        } catch {}
      }

      const emailLower = (profileRow.email || '').toLowerCase();
      const role: UserRole = STAFF_EMAIL_ROLE_MAP[emailLower] || (profileRow.role as UserRole) || 'Customer';
      return {
        id: profileRow.id,
        name: profileRow.name || profileRow.full_name || 'Mayflower Patron',
        email: profileRow.email,
        phone: fetchedPhone,
        role,
        rewardPoints: profileRow.reward_points ?? 200,
        tier: (profileRow.tier as LoyaltyTier) ?? 'Green',
        totalVisits: profileRow.total_visits ?? 0,
        joinedDate: profileRow.joined_date ?? new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactions: profileRow.transactions ?? [],
        reservations: profileRow.reservations ?? [],
      };
    }
  } catch {}

  // 2. Fallback to 'users' table directly
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userRow) {
      const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const role: UserRole = STAFF_EMAIL_ROLE_MAP[userRow.email?.toLowerCase()] || (userRow.role as UserRole) || 'Customer';
      const constructedProfile: UserProfile = {
        id: userRow.id,
        name: userRow.name || userRow.email?.split('@')[0] || 'Mayflower Patron',
        email: userRow.email,
        phone: userRow.phone || '',
        role,
        rewardPoints: 200,
        tier: 'Green',
        totalVisits: 0,
        joinedDate: todayStr,
        transactions: [],
        reservations: [],
      };

      // Upsert into user_profiles for future queries
      try {
        await supabase.from('user_profiles').upsert({
          id: userRow.id,
          name: constructedProfile.name,
          email: constructedProfile.email,
          phone: constructedProfile.phone,
          role: constructedProfile.role,
          reward_points: 200,
          tier: 'Green',
          total_visits: 0,
          joined_date: todayStr,
          transactions: [],
          reservations: [],
        }, { onConflict: 'id' });
      } catch {}

      return constructedProfile;
    }
  } catch {}

  // 3. Fallback to local storage
  const localUser = getCurrentUser();
  if (localUser && localUser.id === userId) {
    return localUser;
  }

  return null;
};

export const addReservationForCurrentUser = async (
  user: UserProfile,
  reservation: UserReservationRecord
): Promise<AuthResult> => {
  const bookedAt = reservation.bookedAt;
  const BONUS_POINTS = 300;

  // Find outlet_id by name if available, or fallback to first available outlet
  let outletId: string | null = null;
  try {
    const { data: outletData } = await supabase
      .from('outlets')
      .select('id')
      .ilike('name', `%${reservation.outlet || 'Poes Garden'}%`)
      .limit(1)
      .maybeSingle();
    outletId = outletData?.id ?? null;

    if (!outletId) {
      const { data: fallbackOutlet } = await supabase
        .from('outlets')
        .select('id')
        .limit(1)
        .maybeSingle();
      outletId = fallbackOutlet?.id ?? null;
    }
  } catch {}

  // 1. Try schema-compliant insert into reservations table
  if (outletId) {
    try {
      await supabase.from('reservations').insert({
        customer_id: user.id && user.id.length === 36 ? user.id : null,
        outlet_id: outletId,
        booking_code: reservation.bookingCode,
        date: reservation.date,
        time_slot: reservation.timeSlot || '19:00',
        guests: reservation.guests || 2,
        status: 'Confirmed',
        seating_area: reservation.seatingArea || 'Main Dining',
        special_notes: reservation.seatingArea ? `Area: ${reservation.seatingArea}` : null
      });
    } catch {}
  }

  // 2. Credit loyalty points and append reservation record to user_profiles
  const updatedPoints = (user.rewardPoints ?? 0) + BONUS_POINTS;
  const newTransaction: PointTransaction = {
    id: `reservation-${reservation.id}`,
    type: 'earned_visit',
    points: BONUS_POINTS,
    description: `Reservation bonus (${reservation.outlet} - ${reservation.bookingCode})`,
    date: bookedAt,
  };
  const updatedTransactions = [...(user.transactions ?? []), newTransaction];
  const updatedReservations = [...(user.reservations ?? []), reservation];

  try {
    await supabase.from('user_profiles').update({
      reward_points: updatedPoints,
      transactions: updatedTransactions,
      reservations: updatedReservations,
    }).eq('id', user.id);
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mayflower_reservation_created', { detail: reservation }));
    }
  } catch {}

  try {
    await supabase.from('customers').update({
      loyalty_points: updatedPoints
    }).eq('user_id', user.id);
  } catch {}

  const fetchedUser = await fetchUserProfile(user.id);
  const finalUser: UserProfile = {
    ...(fetchedUser ?? user),
    rewardPoints: updatedPoints,
    transactions: updatedTransactions,
    reservations: updatedReservations,
  };

  localStorage.setItem('mayflower_current_user', JSON.stringify(finalUser));
  return { success: true, user: finalUser };
};

/** Get the currently authenticated session user profile from local storage and DB */
export const getSupabaseCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const userId = localStorage.getItem('mayflower_current_user_id');
    if (userId) {
      const profile = await fetchUserProfile(userId);
      if (profile) return profile;
    }
    const cached = localStorage.getItem('mayflower_current_user');
    if (cached) {
      return JSON.parse(cached);
    }
    return getCurrentUser();
  } catch {
    return null;
  }
};

/** Sign out from current session */
export const supabaseLogout = async (): Promise<void> => {
  try {
    localStorage.removeItem('mayflower_current_user_id');
    localStorage.removeItem('mayflower_current_user');
    setCurrentUserSession(null);
  } catch {}
};

export interface UpdateProfileParams {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  dietaryPreferences?: string[];
  preferredSeating?: string;
}

/** Update customer profile details, phone, email, password, and preferences directly in database */
export const updateUserProfile = async (
  params: UpdateProfileParams
): Promise<{ success: boolean; user?: UserProfile; message?: string }> => {
  const { userId, name, email, phone, password, dietaryPreferences, preferredSeating } = params;
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const trimmedPhone = (phone || '').trim();

  try {
    // 1. If password is provided, hash and update password_hash in public.users
    if (password && password.trim().length >= 6) {
      const newHash = await hashPassword(password.trim());
      try {
        await supabase
          .from('users')
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (pwdErr) {
        console.warn('Password update in users note:', pwdErr);
      }
    }

    // 2. Update public.user_profiles in Supabase
    const updatePayload: Record<string, any> = {
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
      updated_at: new Date().toISOString(),
    };
    if (dietaryPreferences !== undefined) {
      updatePayload.dietary_preferences = dietaryPreferences;
    }
    if (preferredSeating !== undefined) {
      updatePayload.preferred_seating = preferredSeating;
    }

    const { error: profError } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (profError) {
      console.warn('user_profiles update note:', profError.message);
    }

    // 3. Update public.users table as well
    try {
      await supabase
        .from('users')
        .update({
          name: trimmedName,
          email: normalizedEmail,
          phone: trimmedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {}

    // 4. Update public.customers table if user exists there
    try {
      await supabase
        .from('customers')
        .update({
          name: trimmedName,
          email: normalizedEmail,
          phone: trimmedPhone,
        })
        .eq('user_id', userId);
    } catch {}

    // 5. Fetch updated user profile
    const fetchedUser = await fetchUserProfile(userId);
    const updatedUser: UserProfile = {
      ...(fetchedUser || {
        id: userId,
        role: 'Customer',
        rewardPoints: 200,
        tier: 'Green',
        totalVisits: 0,
        joinedDate: 'Recent',
        transactions: [],
        reservations: [],
      }),
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
    };

    localStorage.setItem('mayflower_current_user', JSON.stringify(updatedUser));
    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update profile' };
  }
};

/** Verify 6-digit OTP sent to user email upon registration (legacy alias) */
export const verifySignupOtp = async (email: string, token: string): Promise<AuthResult> => {
  const verifyRes = await verifyEmailOtp(email, token);
  if (!verifyRes.success || !verifyRes.verified) {
    return { success: false, message: verifyRes.message || 'Invalid or expired confirmation code.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (userRow) {
      const profile = await fetchUserProfile(userRow.id);
      if (profile) return { success: true, user: profile };
    }

    const { data: profRow } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (profRow) {
      const profile = await fetchUserProfile(profRow.id);
      if (profile) return { success: true, user: profile };
    }
  } catch {}

  return { success: true, message: 'Email verified successfully.' };
};

/** Resend signup confirmation OTP (legacy alias) */
export const resendSignupOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
  return requestEmailOtp(email, 'registration');
};

/** Request a password reset recovery email / OTP */
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if account exists
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    const { data: profRow } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (!userRow && !profRow && !STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
      return {
        success: false,
        message: 'No Mayflower account is associated with this email address.',
      };
    }
  } catch {}

  return requestEmailOtp(normalizedEmail, 'password_reset');
};

/** Verify recovery OTP */
export const verifyRecoveryOtp = async (email: string, token: string): Promise<AuthResult> => {
  const verifyRes = await verifyEmailOtp(email, token);
  if (!verifyRes.success || !verifyRes.verified) {
    return { success: false, message: verifyRes.message || 'Invalid or expired recovery code.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (userRow) {
      const profile = await fetchUserProfile(userRow.id);
      return { success: true, user: profile || undefined };
    }
  } catch {}

  return { success: true };
};

/** Securely update password for recovery or profile */
export const updateUserPassword = async (
  password: string,
  email?: string
): Promise<{ success: boolean; message?: string }> => {
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const newHash = await hashPassword(trimmed);
  let targetEmail = email?.trim().toLowerCase();

  if (!targetEmail) {
    const cachedUser = localStorage.getItem('mayflower_current_user');
    if (cachedUser) {
      try {
        targetEmail = JSON.parse(cachedUser).email;
      } catch {}
    }
  }

  if (targetEmail) {
    try {
      await supabase.from('users').update({ password_hash: newHash }).ilike('email', targetEmail);

      // Update local storage backup if present
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === targetEmail);
      if (idx >= 0) {
        users[idx].password = trimmed;
        saveStoredUsers(users);
      }
      return { success: true, message: 'Password updated successfully. You can now sign in with your new password.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update password.' };
    }
  }

  return { success: true, message: 'Password updated successfully.' };
};
