-- Migration: Transactional Email Outbox, Idempotency & Automatic Event Triggers
-- File: supabase/migrations/20260913000010_email_outbox_and_triggers.sql

-- 1. Create Email Outbox Table
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  email_type TEXT NOT NULL, -- e.g. 'welcome', 'reservation_confirmation'
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempt_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  provider_message_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 2. Indexes for High-Performance Delivery & Outbox Processing
CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON public.email_outbox (status);
CREATE INDEX IF NOT EXISTS idx_email_outbox_idempotency ON public.email_outbox (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_email_outbox_user_id ON public.email_outbox (user_id);
CREATE INDEX IF NOT EXISTS idx_email_outbox_reservation_id ON public.email_outbox (reservation_id);
CREATE INDEX IF NOT EXISTS idx_email_outbox_created_at ON public.email_outbox (created_at);

-- 3. Row Level Security Policies
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own email logs" ON public.email_outbox;
DROP POLICY IF EXISTS "Admins and service role have full outbox access" ON public.email_outbox;

-- Allow authenticated users to view logs specifically for their account
CREATE POLICY "Users can read their own email logs"
  ON public.email_outbox FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Service role & superadmin/admin full access
CREATE POLICY "Admins and service role have full outbox access"
  ON public.email_outbox FOR ALL
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'owner_management', 'admin', 'manager')
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'owner_management', 'admin', 'manager')
    )
  );

-- 4. Automatic Reservation Confirmation Outbox Trigger
CREATE OR REPLACE FUNCTION public.enqueue_reservation_confirmation_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_outlet_name TEXT;
  v_outlet_phone TEXT;
  v_outlet_address TEXT;
  v_booking_code TEXT;
BEGIN
  -- Only trigger when status transitions to 'confirmed'
  IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'confirmed') THEN
    
    -- Lookup customer details from profiles or fallback
    SELECT email, COALESCE(full_name, split_part(email, '@', 1))
    INTO v_customer_email, v_customer_name
    FROM public.profiles
    WHERE id = NEW.customer_id;

    -- Fallback to user_profiles if profiles not found
    IF v_customer_email IS NULL THEN
      SELECT email, COALESCE(name, split_part(email, '@', 1))
      INTO v_customer_email, v_customer_name
      FROM public.user_profiles
      WHERE id = NEW.customer_id;
    END IF;

    -- Lookup outlet details
    SELECT name, phone, COALESCE(address_line1, city)
    INTO v_outlet_name, v_outlet_phone, v_outlet_address
    FROM public.outlets
    WHERE id = NEW.outlet_id;

    v_booking_code := COALESCE(
      NEW.booking_code,
      'MAY-' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 6))
    );

    IF v_customer_email IS NOT NULL THEN
      INSERT INTO public.email_outbox (
        idempotency_key,
        email_type,
        recipient_email,
        recipient_name,
        subject,
        payload,
        status,
        user_id,
        reservation_id
      ) VALUES (
        'res-confirm-' || NEW.id,
        'reservation_confirmation',
        v_customer_email,
        COALESCE(v_customer_name, 'Valued Guest'),
        '🍽️ Table Reservation Confirmed — The Mayflower (' || v_booking_code || ')',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'booking_code', v_booking_code,
          'outlet_name', COALESCE(v_outlet_name, 'The Mayflower Sanctuary'),
          'outlet_phone', COALESCE(v_outlet_phone, '+91 44 4892 7700'),
          'outlet_address', COALESCE(v_outlet_address, 'Chennai, India'),
          'date', NEW.reservation_date,
          'time', NEW.reservation_time,
          'party_size', NEW.party_size,
          'special_requests', NEW.special_requests
        ),
        'pending',
        NEW.customer_id,
        NEW.id
      )
      ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_reservation_confirmation ON public.reservations;
CREATE TRIGGER trg_enqueue_reservation_confirmation
  AFTER INSERT OR UPDATE OF status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_reservation_confirmation_email();

-- 5. Automatic Welcome Email Trigger for Verified Users
CREATE OR REPLACE FUNCTION public.enqueue_welcome_email(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_outbox_id UUID;
  v_is_confirmed BOOLEAN := FALSE;
BEGIN
  -- Look up user from auth.users
  SELECT
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
    (email_confirmed_at IS NOT NULL)
  INTO v_user_email, v_user_name, v_is_confirmed
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Enqueue welcome email with unique idempotency key per user
  INSERT INTO public.email_outbox (
    idempotency_key,
    email_type,
    recipient_email,
    recipient_name,
    subject,
    payload,
    status,
    user_id
  ) VALUES (
    'welcome-' || p_user_id,
    'welcome',
    v_user_email,
    COALESCE(v_user_name, 'Mayflower Patron'),
    '🌸 Welcome to Mayflower Sanctuary — Account Verified (+200 PTS Credited)',
    jsonb_build_object(
      'user_id', p_user_id,
      'member_name', COALESCE(v_user_name, 'Mayflower Patron'),
      'bonus_points', 200,
      'tier', 'Green Tier'
    ),
    'pending',
    p_user_id
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'success', true,
    'enqueued', (v_outbox_id IS NOT NULL),
    'outbox_id', v_outbox_id
  );
END;
$$;

-- 6. Trigger on auth.users when email is verified
CREATE OR REPLACE FUNCTION public.trg_auth_user_verified_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Trigger only when email becomes confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR TG_OP = 'INSERT') THEN
    PERFORM public.enqueue_welcome_email(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_verified_welcome ON auth.users;
CREATE TRIGGER on_auth_user_verified_welcome
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.trg_auth_user_verified_welcome();
