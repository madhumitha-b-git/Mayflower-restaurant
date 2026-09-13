-- Mayflower Phase 10 Notifications & Audit Logging Backend Migration
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §8 & DB Schema doc §8

-- 1. Generic Audit Log Trigger Function
CREATE OR REPLACE FUNCTION public.log_material_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_outlet UUID := NULL;
  v_metadata JSONB := '{}'::jsonb;
BEGIN
  v_action := TG_ARGV[0];

  IF TG_TABLE_NAME = 'profiles' THEN
    v_metadata := jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role);
  ELSIF TG_TABLE_NAME = 'reservations' THEN
    v_outlet := NEW.outlet_id;
    v_metadata := jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'table_id', NEW.table_id);
  ELSIF TG_TABLE_NAME = 'outlets' THEN
    v_outlet := NEW.id;
    v_metadata := jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status);
  ELSIF TG_TABLE_NAME = 'checklist_tasks' THEN
    v_metadata := jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'completed_by', NEW.completed_by);
  ELSIF TG_TABLE_NAME = 'integration_configs' THEN
    v_outlet := NEW.outlet_id;
    v_metadata := jsonb_build_object('provider', NEW.provider, 'mode', NEW.mode);
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, outlet_id, metadata)
  VALUES (auth.uid(), v_action, TG_TABLE_NAME, NEW.id, v_outlet, v_metadata);

  RETURN NEW;
END;
$$;

-- 2. Attach Triggers to Material Action Tables
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_material_audit_event('PROFILE_ROLE_CHANGED');

DROP TRIGGER IF EXISTS trg_audit_reservations ON public.reservations;
CREATE TRIGGER trg_audit_reservations
  AFTER UPDATE OF status, table_id ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_material_audit_event('RESERVATION_STATUS_CHANGED');

DROP TRIGGER IF EXISTS trg_audit_outlets ON public.outlets;
CREATE TRIGGER trg_audit_outlets
  AFTER UPDATE OF status ON public.outlets
  FOR EACH ROW EXECUTE FUNCTION public.log_material_audit_event('OUTLET_STATUS_CHANGED');

DROP TRIGGER IF EXISTS trg_audit_checklist_tasks ON public.checklist_tasks;
CREATE TRIGGER trg_audit_checklist_tasks
  AFTER UPDATE OF status ON public.checklist_tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_material_audit_event('TASK_STATUS_CHANGED');

DROP TRIGGER IF EXISTS trg_audit_integration_configs ON public.integration_configs;
CREATE TRIGGER trg_audit_integration_configs
  AFTER UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.log_material_audit_event('INTEGRATION_CONFIG_CHANGED');

-- 3. Automatic Notification Queueing Trigger for Reservation Confirmation
CREATE OR REPLACE FUNCTION public.queue_reservation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != NEW.status AND NEW.status IN ('confirmed', 'cancelled') THEN
    INSERT INTO public.notifications (recipient_id, type, payload, channel, status)
    VALUES (
      NEW.customer_id,
      'RESERVATION_' || UPPER(NEW.status::TEXT),
      jsonb_build_object('reservation_id', NEW.id, 'outlet_id', NEW.outlet_id, 'date', NEW.reservation_date, 'time', NEW.reservation_time),
      'in_app',
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reservation ON public.reservations;
CREATE TRIGGER trg_notify_reservation
  AFTER UPDATE OF status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.queue_reservation_notification();
