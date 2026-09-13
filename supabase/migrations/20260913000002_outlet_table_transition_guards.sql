-- Mayflower Phase 3 Outlet & Table Transition Guards Migration

-- 1. Outlet Status Transition Guard: draft -> published -> archived
CREATE OR REPLACE FUNCTION public.check_outlet_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'draft' AND NEW.status IN ('published', 'archived') THEN
    RETURN NEW;
  ELSIF OLD.status = 'published' AND NEW.status = 'archived' THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid outlet status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_outlet_status_guard ON public.outlets;

CREATE TRIGGER trg_outlet_status_guard
  BEFORE UPDATE OF status ON public.outlets
  FOR EACH ROW EXECUTE FUNCTION public.check_outlet_status_transition();

-- 2. Table Status Transition Guard: available ⇄ reserved ⇄ occupied ⇄ cleaning ⇄ blocked
CREATE OR REPLACE FUNCTION public.check_table_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF (OLD.status = 'available' AND NEW.status IN ('reserved', 'occupied', 'blocked')) OR
     (OLD.status = 'reserved' AND NEW.status IN ('occupied', 'available', 'blocked')) OR
     (OLD.status = 'occupied' AND NEW.status IN ('cleaning', 'available')) OR
     (OLD.status = 'cleaning' AND NEW.status IN ('available', 'blocked')) OR
     (OLD.status = 'blocked' AND NEW.status IN ('available', 'cleaning')) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid table status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_table_status_guard ON public.tables;

CREATE TRIGGER trg_table_status_guard
  BEFORE UPDATE OF status ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.check_table_status_transition();
