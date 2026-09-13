-- Mayflower Phase 9 Management Dashboard Data Layer Migration
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §9 & DB Schema doc §7

-- 1. Reservation Metrics View (SECURITY INVOKER to respect caller RLS)
CREATE OR REPLACE VIEW public.view_dashboard_reservations_summary
WITH (security_invoker = true) AS
SELECT
  o.id AS outlet_id,
  o.name AS outlet_name,
  COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'pending'), 0) AS pending_count,
  COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'confirmed' AND r.reservation_date = CURRENT_DATE), 0) AS today_confirmed_count,
  COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'no_show'), 0) AS no_show_count,
  COALESCE(COUNT(r.id) FILTER (WHERE r.status IN ('completed', 'no_show')), 0) AS total_past_bookings,
  ROUND(
    COALESCE(
      (COUNT(r.id) FILTER (WHERE r.status = 'no_show')::NUMERIC /
      NULLIF(COUNT(r.id) FILTER (WHERE r.status IN ('completed', 'no_show')), 0)) * 100,
      0
    ), 2
  ) AS no_show_rate_pct
FROM public.outlets o
LEFT JOIN public.reservations r ON r.outlet_id = o.id
GROUP BY o.id, o.name;

-- 2. Table Utilization Metrics View (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.view_dashboard_table_utilization
WITH (security_invoker = true) AS
SELECT
  o.id AS outlet_id,
  o.name AS outlet_name,
  COALESCE(COUNT(t.id), 0) AS total_tables,
  COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'occupied'), 0) AS occupied_count,
  COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'reserved'), 0) AS reserved_count,
  COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'available'), 0) AS available_count,
  ROUND(
    COALESCE(
      (COUNT(t.id) FILTER (WHERE t.status IN ('occupied', 'reserved'))::NUMERIC /
      NULLIF(COUNT(t.id), 0)) * 100,
      0
    ), 2
  ) AS utilization_pct
FROM public.outlets o
LEFT JOIN public.tables t ON t.outlet_id = o.id
GROUP BY o.id, o.name;

-- 3. Operations Metrics View (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.view_dashboard_operations_summary
WITH (security_invoker = true) AS
SELECT
  o.id AS outlet_id,
  o.name AS outlet_name,
  COALESCE(COUNT(ct.id), 0) AS total_tasks,
  COALESCE(COUNT(ct.id) FILTER (WHERE ct.status = 'completed'), 0) AS completed_count,
  COALESCE(COUNT(ct.id) FILTER (WHERE ct.status = 'pending'), 0) AS pending_count,
  COALESCE(COUNT(ct.id) FILTER (WHERE ct.status = 'escalated'), 0) AS escalated_count,
  ROUND(
    COALESCE(
      (COUNT(ct.id) FILTER (WHERE ct.status = 'completed')::NUMERIC /
      NULLIF(COUNT(ct.id), 0)) * 100,
      0
    ), 2
  ) AS task_completion_rate_pct
FROM public.outlets o
LEFT JOIN public.checklists c ON c.outlet_id = o.id
LEFT JOIN public.checklist_tasks ct ON ct.checklist_id = c.id
GROUP BY o.id, o.name;

-- 4. Feedback Metrics View (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.view_dashboard_feedback_summary
WITH (security_invoker = true) AS
SELECT
  o.id AS outlet_id,
  o.name AS outlet_name,
  COALESCE(COUNT(f.id), 0) AS total_feedback_count,
  ROUND(COALESCE(AVG(f.rating), 0), 2) AS average_rating,
  COALESCE(COUNT(f.id) FILTER (WHERE f.status = 'flagged' OR f.rating <= 2), 0) AS flagged_negative_count
FROM public.outlets o
LEFT JOIN public.feedback f ON f.outlet_id = o.id
GROUP BY o.id, o.name;

-- 5. Outlets & Franchise Status Summary Views (SECURITY INVOKER)
CREATE OR REPLACE VIEW public.view_dashboard_franchise_summary
WITH (security_invoker = true) AS
SELECT
  status AS franchise_status,
  COUNT(*) AS enquiry_count
FROM public.franchise_enquiries
GROUP BY status;

CREATE OR REPLACE VIEW public.view_dashboard_outlet_status_summary
WITH (security_invoker = true) AS
SELECT
  status AS outlet_status,
  COUNT(*) AS outlet_count
FROM public.outlets
GROUP BY status;
