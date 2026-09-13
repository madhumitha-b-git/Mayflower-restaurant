-- Mayflower Phase 5 Operations Backend Migration: SOPs, Checklists, Tasks & Escalation Logic
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §14 & Execution Prompts Phase 5

-- 1. Task Status Transition Guard Trigger
CREATE OR REPLACE FUNCTION public.check_task_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF (OLD.status = 'pending' AND NEW.status IN ('in_progress', 'completed', 'escalated')) OR
     (OLD.status = 'in_progress' AND NEW.status IN ('completed', 'escalated')) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid task status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_status_guard ON public.checklist_tasks;

CREATE TRIGGER trg_task_status_guard
  BEFORE UPDATE OF status ON public.checklist_tasks
  FOR EACH ROW EXECUTE FUNCTION public.check_task_status_transition();

-- 2. Task Escalation Check Function (with injectable mock clock for testing)
CREATE OR REPLACE FUNCTION public.check_and_escalate_overdue_tasks(
  p_current_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escalated_count INT;
BEGIN
  WITH target_tasks AS (
    SELECT id
    FROM public.checklist_tasks
    WHERE status IN ('pending', 'in_progress')
      AND due_at IS NOT NULL
      AND (
        (priority = 'critical' AND (due_at + INTERVAL '30 minutes') <= p_current_time)
        OR
        (priority != 'critical' AND (due_at + INTERVAL '2 hours') <= p_current_time)
      )
  )
  UPDATE public.checklist_tasks
  SET status = 'escalated'
  WHERE id IN (SELECT id FROM target_tasks);

  GET DIAGNOSTICS v_escalated_count = ROW_COUNT;
  RETURN v_escalated_count;
END;
$$;
