-- Mayflower Phase 4 Reservation Engine & Atomic Table Assignment Migration
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §8 & Execution Prompts Phase 4

-- 1. Reservation Status Transition Guard Trigger
CREATE OR REPLACE FUNCTION public.check_reservation_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'cancelled')) OR
     (OLD.status = 'confirmed' AND NEW.status IN ('completed', 'no_show', 'cancelled')) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid reservation status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservation_status_guard ON public.reservations;

CREATE TRIGGER trg_reservation_status_guard
  BEFORE UPDATE OF status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.check_reservation_status_transition();

-- 2. Double-Booking Overlap Check Function
CREATE OR REPLACE FUNCTION public.check_table_double_booking(
  p_table_id UUID,
  p_reservation_date DATE,
  p_reservation_time TIME,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.reservations
  WHERE table_id = p_table_id
    AND reservation_date = p_reservation_date
    AND status IN ('confirmed', 'pending')
    AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id)
    AND ABS(EXTRACT(EPOCH FROM (reservation_time - p_reservation_time))) < 7200; -- 2-hour dining window

  RETURN v_count > 0;
END;
$$;

-- 3. Atomic "Approve and Assign Table" RPC Function
CREATE OR REPLACE FUNCTION public.approve_and_assign_table(
  p_reservation_id UUID,
  p_table_id UUID,
  p_confirmed_by UUID
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.reservations%ROWTYPE;
  v_table public.tables%ROWTYPE;
  v_is_double_booked BOOLEAN;
BEGIN
  -- 1. Lock reservation row for update
  SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  IF v_res.status != 'pending' THEN
    RAISE EXCEPTION 'Only pending reservations can be confirmed';
  END IF;

  -- 2. Lock table row for update
  SELECT * INTO v_table FROM public.tables WHERE id = p_table_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table not found';
  END IF;

  IF v_table.outlet_id != v_res.outlet_id THEN
    RAISE EXCEPTION 'Table does not belong to reservation outlet';
  END IF;

  -- 3. Check for double booking
  v_is_double_booked := public.check_table_double_booking(
    p_table_id,
    v_res.reservation_date,
    v_res.reservation_time,
    p_reservation_id
  );

  IF v_is_double_booked THEN
    RAISE EXCEPTION 'Table is already booked for an overlapping time slot';
  END IF;

  -- 4. Atomic transaction update
  UPDATE public.reservations
  SET status = 'confirmed',
      table_id = p_table_id,
      confirmed_by = p_confirmed_by,
      updated_at = NOW()
  WHERE id = p_reservation_id;

  UPDATE public.tables
  SET status = 'reserved',
      updated_at = NOW()
  WHERE id = p_table_id;

  SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
  RETURN v_res;
END;
$$;
