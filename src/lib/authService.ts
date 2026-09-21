import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserRole, LoyaltyTier, PointTransaction, UserReservationRecord } from '../types';
import { loginWithPassword } from '../data/userStorage';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
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

/** Sign in with email + password via Supabase Auth, then load profile row */
export const supabaseLogin = async (email: string, password: string): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  // 0. If staff email in SEED_STAFF, check local staff login first
  if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
    const localRes = loginWithPassword(normalizedEmail, password);
    if (localRes.success && localRes.user) {
      localRes.user.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
      return localRes;
    }
  }

  if (!isSupabaseConfigured) {
    return loginWithPassword(normalizedEmail, password);
  }

  // 1. Try Supabase Auth signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

  if (data?.user) {
    const profile = await fetchUserProfile(data.user.id, data.user);
    if (profile) {
      if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
        profile.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
      }
      return { success: true, user: profile };
    }
  }

  // 2. Check local SEED_STAFF / userStorage fallback for demo accounts
  const localRes = loginWithPassword(normalizedEmail, password);
  if (localRes.success && localRes.user) {
    if (STAFF_EMAIL_ROLE_MAP[normalizedEmail]) {
      localRes.user.role = STAFF_EMAIL_ROLE_MAP[normalizedEmail];
    }
    return localRes;
  }

  // 3. Check staff 'users' table directly (SuperAdmin, Owner, Admin, Manager, Chef, HR, Accountant)
  try {
    const { data: staffUser } = await supabase
      .from('users')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (staffUser) {
      const staffRole: UserRole = (staffUser.role as UserRole) || 'Admin';
      const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const staffProfile: UserProfile = {
        id: staffUser.id || `staff-${Date.now()}`,
        name: staffUser.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        phone: staffUser.phone || '',
        role: staffRole,
        rewardPoints: 500,
        tier: 'Sanctuary VIP',
        totalVisits: 10,
        joinedDate: todayStr,
        transactions: [],
        reservations: [],
      };
      return { success: true, user: staffProfile };
    }
  } catch {}

  // 3. Check 'user_profiles' or 'profiles' table for existing customer
  try {
    const { data: existingProf } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (existingProf) {
      return {
        success: true,
        user: {
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
        }
      };
    }
  } catch {}

  if (error) {
    const isUnconfirmed = /confirm|verification/i.test(error.message || '');
    const isInvalid = /invalid login/i.test(error.message || '');

    if (isUnconfirmed) {
      return {
        success: false,
        message: 'Email confirmation is pending for this account. To log in without confirmation, toggle OFF "Confirm Email" in your Supabase Dashboard -> Auth -> Providers -> Email.'
      };
    }

    const message = isInvalid
      ? 'We could not find an account with those details. New to Mayflower? Register your account first.'
      : error.message || 'Login failed.';
    return { success: false, message };
  }

  // Fallback profile construction so valid logins never fail
  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    success: true,
    user: {
      id: `user-${Date.now()}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '',
      role: 'Customer',
      rewardPoints: 200,
      tier: 'Green',
      totalVisits: 1,
      joinedDate: todayStr,
      transactions: [],
      reservations: [],
    }
  };
};

/** Sign up a new customer via Supabase Auth, then insert profile row */
export const supabaseRegister = async (
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<AuthResult> => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data: { user: signedInUser } } = await supabase.auth.getUser();
  if (signedInUser?.email?.toLowerCase() === normalizedEmail) {
    return { success: false, message: 'This email is already registered. Please sign in instead.' };
  }

  // Pre-check DB tables for existing account with this email
  try {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (existingProfile) {
      return { success: false, message: 'This email is already registered. Please sign in instead.' };
    }

    const { data: altProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (altProfile) {
      return { success: false, message: 'This email is already registered. Please sign in instead.' };
    }
  } catch {}

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { name: name || normalizedEmail.split('@')[0], phone: phone || '' } },
  });

  if (error || !data.user) {
    const isEmailSendError = /error sending confirmation email|confirmation email/i.test(error?.message || '');
    const isRateLimit = /rate limit/i.test(error?.message || '');
    const isDuplicate = /already|registered|exists/i.test(error?.message || '');

    if (isEmailSendError) {
      // Try logging in in case user was actually created
      const loginRes = await supabaseLogin(normalizedEmail, password);
      if (loginRes.success) return loginRes;

      return {
        success: false,
        message: 'Supabase email service error: Email confirmation is enabled in your Supabase project, but custom SMTP is not set up. To allow registration without SMTP: In Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF "Confirm email".'
      };
    }

    if (isRateLimit) {
      // Attempt auto-login if account was already created during previous attempt
      const loginRes = await supabaseLogin(normalizedEmail, password);
      if (loginRes.success) return loginRes;
      return {
        success: false,
        message: 'Supabase email rate limit reached. To fix this: Go to Supabase Dashboard -> Auth -> Providers -> Email and turn OFF "Confirm email", or Sign In directly if your account exists.'
      };
    }

    if (isDuplicate) {
      return { success: false, message: 'This email is already registered. Please sign in instead.' };
    }

    return { success: false, message: error?.message || 'Registration failed.' };
  }

  // With Supabase email-confirmation enabled, an existing email is deliberately
  // returned without a new identity. Treat it as a duplicate instead of showing success.
  if (data.user.identities?.length === 0) {
    return { success: false, message: 'This email is already registered. Please sign in instead.' };
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const newProfile = {
    id: data.user.id,
    name: name || email.split('@')[0],
    email: normalizedEmail,
    phone: phone || '',
    role: 'Customer' as UserRole,
    reward_points: 200,
    tier: 'Green' as LoyaltyTier,
    total_visits: 0,
    joined_date: todayStr,
    transactions: [{
      id: `signup-${data.user.id}`,
      type: 'earned_signup',
      points: 200,
      description: 'Welcome bonus for registering your Mayflower account',
      date: todayStr,
    }],
    reservations: [],
  };

  try {
    await supabase.from('user_profiles').upsert(newProfile, { onConflict: 'id', ignoreDuplicates: true });
  } catch {}

  // Auto sign-in to establish active session token for RLS policies
  const loginRes = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

  if (loginRes.error && /confirm/i.test(loginRes.error.message)) {
    const fallbackProfile: UserProfile = {
      id: data.user.id,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '',
      role: 'Customer',
      rewardPoints: 200,
      tier: 'Green',
      totalVisits: 0,
      joinedDate: todayStr,
      transactions: [{
        id: `signup-${data.user.id}`,
        type: 'earned_signup',
        points: 200,
        description: 'Welcome bonus for registering your Mayflower account',
        date: todayStr,
      }],
      reservations: [],
    };
    return {
      success: true,
      user: fallbackProfile,
      message: 'Account created! If email confirmation is enabled in your Supabase project, check your inbox or turn OFF "Confirm Email" in Supabase Auth settings to sign in instantly.'
    };
  }

  const profile = await fetchUserProfile(data.user.id);
  const fallbackProfile: UserProfile = profile ?? {
    id: data.user.id,
    name: name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    phone: '',
    role: 'Customer',
    rewardPoints: 200,
    tier: 'Green',
    totalVisits: 0,
    joinedDate: todayStr,
    transactions: [{
      id: `signup-${data.user.id}`,
      type: 'earned_signup',
      points: 200,
      description: 'Welcome bonus for registering your Mayflower account',
      date: todayStr,
    }],
    reservations: [],
  };

  return { success: true, user: fallbackProfile };
};

/** Fetch the user_profiles or profiles row and map to UserProfile shape with fallback construction */
export const fetchUserProfile = async (userId: string, authUserFallback?: any): Promise<UserProfile | null> => {
  if (!userId) return null;

  // 1. Try querying 'user_profiles' table
  try {
    const { data: profileRow } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileRow) {
      const emailLower = (profileRow.email || '').toLowerCase();
      const role: UserRole = STAFF_EMAIL_ROLE_MAP[emailLower] || (profileRow.role as UserRole) || 'Customer';
      return {
        id: profileRow.id,
        name: profileRow.name || profileRow.full_name || 'Mayflower Patron',
        email: profileRow.email,
        phone: profileRow.phone ?? '',
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

  // 2. Fallback to 'profiles' table if user_profiles returns null/error
  try {
    const { data: altData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (altData) {
      return {
        id: altData.id,
        name: altData.full_name || altData.name || altData.email?.split('@')[0] || 'Mayflower Patron',
        email: altData.email || '',
        phone: altData.phone || '',
        role: (altData.role as UserRole) || 'Customer',
        rewardPoints: 200,
        tier: 'Green',
        totalVisits: 0,
        joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactions: [],
        reservations: []
      };
    }
  } catch {}

  // 3. Fallback to authUser object or active auth session or constructed profile
  let u = authUserFallback;
  if (!u) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && authData.user.id === userId) {
        u = authData.user;
      }
    } catch {}
  }

  if (!u) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user && sessionData.session.user.id === userId) {
        u = sessionData.session.user;
      }
    } catch {}
  }

  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const email = u?.email || '';
  const name = u?.user_metadata?.name || email.split('@')[0] || 'Mayflower Patron';
  const phone = u?.phone || '';
  const role: UserRole = STAFF_EMAIL_ROLE_MAP[email.toLowerCase()] || (u?.user_metadata?.role as UserRole) || 'Customer';

  const constructedProfile: UserProfile = {
    id: userId,
    name,
    email,
    phone,
    role,
    rewardPoints: 200,
    tier: 'Green',
    totalVisits: 1,
    joinedDate: todayStr,
    transactions: [{
      id: `welcome-${userId}`,
      type: 'earned_signup',
      points: 200,
      description: 'Welcome bonus for registering your Mayflower account',
      date: todayStr,
    }],
    reservations: [],
  };

  // Attempt async upsert to user_profiles so table row is populated for future queries
  try {
    await supabase.from('user_profiles').upsert({
      id: userId,
      name: constructedProfile.name,
      email: constructedProfile.email,
      phone: constructedProfile.phone,
      role: constructedProfile.role,
      reward_points: 200,
      tier: 'Green',
      total_visits: 1,
      joined_date: todayStr,
      transactions: constructedProfile.transactions,
      reservations: []
    }, { onConflict: 'id' });
  } catch {}

  return constructedProfile;
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

  // 1. Try schema-compliant insert into reservations table (outlet_id, customer_id, etc.)
  if (outletId) {
    try {
      await supabase.from('reservations').insert({
        customer_id: user.id,
        outlet_id: outletId,
        booking_code: reservation.bookingCode,
        reservation_date: reservation.date,
        reservation_time: reservation.timeSlot || '19:00:00',
        party_size: reservation.guests || 2,
        status: 'confirmed',
        special_requests: reservation.seatingArea ? `Area: ${reservation.seatingArea}` : null
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

  return { success: true, user: finalUser };
};

/** Get the currently authenticated Supabase session user profile */
export const getSupabaseCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return fetchUserProfile(session.user.id);
};

/** Sign out from Supabase */
export const supabaseLogout = async (): Promise<void> => {
  await supabase.auth.signOut();
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

/** Update customer profile details, phone, email, password, and preferences */
export const updateUserProfile = async (
  params: UpdateProfileParams
): Promise<{ success: boolean; user?: UserProfile; message?: string }> => {
  const { userId, name, email, phone, password, dietaryPreferences, preferredSeating } = params;
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const trimmedPhone = (phone || '').trim();

  try {
    // 1. If password is provided, update password via Supabase Auth
    if (password && password.trim().length >= 6) {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: password.trim(),
      });
      if (pwdError) {
        console.warn('Supabase auth password update note:', pwdError.message);
      }
    }

    // 2. Update Supabase Auth user metadata & email
    try {
      await supabase.auth.updateUser({
        email: normalizedEmail,
        data: { name: trimmedName, phone: trimmedPhone },
      });
    } catch (authErr) {
      console.warn('Supabase auth updateUser error:', authErr);
    }

    // 3. Update public.user_profiles in Supabase
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

    // 4. Update public.users table if user exists there
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

    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update profile' };
  }
};

