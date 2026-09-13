-- Mayflower Phase 2 Authentication, RBAC & RLS Policies Migration
-- Authoritative reference: Mayflower_02_Database_Schema_and_RLS_Design.md §4-§5

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_outlet_staff(target_outlet UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN FALSE
    WHEN public.current_profile_role() IN ('super_admin', 'owner_management') THEN TRUE
    WHEN target_outlet IS NULL THEN FALSE
    ELSE EXISTS (
      SELECT 1 FROM public.user_outlets
      WHERE user_id = auth.uid() AND outlet_id = target_outlet
    )
  END;
$$;

-- 2. Auth Signup Trigger (creates profiles row automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop trigger if exists to prevent duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS POLICIES BY TABLE

--------------------------------------------------------------------------------
-- A. PROFILES
--------------------------------------------------------------------------------
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'manager', 'hr', 'accountant')
);

CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  id = auth.uid() OR public.current_profile_role() IN ('super_admin', 'admin')
);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  id = auth.uid() OR public.current_profile_role() IN ('super_admin', 'admin')
) WITH CHECK (
  (id = auth.uid() AND role = public.current_profile_role()) OR
  public.current_profile_role() IN ('super_admin', 'admin')
);

CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
  public.current_profile_role() = 'super_admin'
);

--------------------------------------------------------------------------------
-- B. USER_OUTLETS
--------------------------------------------------------------------------------
CREATE POLICY "user_outlets_select" ON user_outlets FOR SELECT USING (
  user_id = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'hr')
);

CREATE POLICY "user_outlets_all_write" ON user_outlets FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin')
);

--------------------------------------------------------------------------------
-- C. OUTLETS
--------------------------------------------------------------------------------
CREATE POLICY "outlets_select" ON outlets FOR SELECT USING (
  status = 'published' OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'hr', 'accountant') OR
  public.is_outlet_staff(id)
);

CREATE POLICY "outlets_insert" ON outlets FOR INSERT WITH CHECK (
  public.current_profile_role() IN ('super_admin', 'admin')
);

CREATE POLICY "outlets_update" ON outlets FOR UPDATE USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  public.is_outlet_staff(id)
);

CREATE POLICY "outlets_delete" ON outlets FOR DELETE USING (
  public.current_profile_role() = 'super_admin'
);

--------------------------------------------------------------------------------
-- D. FLOORS & TABLES
--------------------------------------------------------------------------------
CREATE POLICY "floors_select" ON floors FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "floors_write" ON floors FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  (public.current_profile_role() = 'manager' AND public.is_outlet_staff(outlet_id))
);

CREATE POLICY "tables_select" ON tables FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "tables_write" ON tables FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  (public.current_profile_role() IN ('manager', 'chef') AND public.is_outlet_staff(outlet_id))
);

--------------------------------------------------------------------------------
-- E. MENU CATEGORIES & ITEMS
--------------------------------------------------------------------------------
CREATE POLICY "menu_categories_select" ON menu_categories FOR SELECT USING (
  outlet_id IS NULL OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'customer') OR
  public.is_outlet_staff(outlet_id) OR
  EXISTS (SELECT 1 FROM outlets WHERE id = menu_categories.outlet_id AND status = 'published')
);

CREATE POLICY "menu_categories_write" ON menu_categories FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  (public.current_profile_role() = 'manager' AND public.is_outlet_staff(outlet_id))
);

CREATE POLICY "menu_items_select" ON menu_items FOR SELECT USING (
  TRUE
);

CREATE POLICY "menu_items_write" ON menu_items FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  EXISTS (
    SELECT 1 FROM menu_categories mc
    WHERE mc.id = menu_items.category_id AND (
      mc.outlet_id IS NULL OR public.is_outlet_staff(mc.outlet_id)
    )
  )
);

--------------------------------------------------------------------------------
-- F. RESERVATIONS
--------------------------------------------------------------------------------
CREATE POLICY "reservations_select" ON reservations FOR SELECT USING (
  customer_id = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "reservations_insert" ON reservations FOR INSERT WITH CHECK (
  customer_id = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "reservations_update" ON reservations FOR UPDATE USING (
  (customer_id = auth.uid() AND status IN ('pending', 'confirmed')) OR
  public.current_profile_role() IN ('super_admin', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "reservations_delete" ON reservations FOR DELETE USING (
  public.current_profile_role() IN ('super_admin', 'admin')
);

--------------------------------------------------------------------------------
-- G. SOPS, CHECKLISTS, TASKS & EVIDENCE
--------------------------------------------------------------------------------
CREATE POLICY "sop_categories_select" ON sop_categories FOR SELECT USING (TRUE);

CREATE POLICY "sops_select" ON sops FOR SELECT USING (
  outlet_id IS NULL OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'hr') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "sops_write" ON sops FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  (public.current_profile_role() = 'manager' AND public.is_outlet_staff(outlet_id))
);

CREATE POLICY "checklists_select" ON checklists FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'hr') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "checklists_write" ON checklists FOR ALL USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  (public.current_profile_role() = 'manager' AND public.is_outlet_staff(outlet_id))
);

CREATE POLICY "checklist_tasks_select" ON checklist_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_tasks.checklist_id AND (
      public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'hr') OR
      public.is_outlet_staff(c.outlet_id) OR
      c.assigned_user_id = auth.uid() OR
      c.assigned_role = public.current_profile_role()
    )
  )
);

CREATE POLICY "checklist_tasks_write" ON checklist_tasks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_tasks.checklist_id AND (
      public.current_profile_role() IN ('super_admin', 'admin') OR
      public.is_outlet_staff(c.outlet_id) OR
      c.assigned_user_id = auth.uid() OR
      c.assigned_role = public.current_profile_role()
    )
  )
);

CREATE POLICY "task_evidence_select" ON task_evidence FOR SELECT USING (
  uploaded_by = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  EXISTS (
    SELECT 1 FROM checklist_tasks t
    JOIN checklists c ON c.id = t.checklist_id
    WHERE t.id = task_evidence.task_id AND public.is_outlet_staff(c.outlet_id)
  )
);

CREATE POLICY "task_evidence_insert" ON task_evidence FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'admin') OR
  EXISTS (
    SELECT 1 FROM checklist_tasks t
    JOIN checklists c ON c.id = t.checklist_id
    WHERE t.id = task_evidence.task_id AND public.is_outlet_staff(c.outlet_id)
  )
);

--------------------------------------------------------------------------------
-- H. FEEDBACK
--------------------------------------------------------------------------------
CREATE POLICY "feedback_select" ON feedback FOR SELECT USING (
  customer_id = auth.uid() OR
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

CREATE POLICY "feedback_insert" ON feedback FOR INSERT WITH CHECK (
  customer_id = auth.uid() OR
  auth.role() = 'anon' OR
  public.current_profile_role() IN ('super_admin', 'admin', 'customer')
);

CREATE POLICY "feedback_update" ON feedback FOR UPDATE USING (
  public.current_profile_role() IN ('super_admin', 'admin') OR
  public.is_outlet_staff(outlet_id)
);

--------------------------------------------------------------------------------
-- I. FRANCHISE ENQUIRIES & DOCUMENTS
--------------------------------------------------------------------------------
CREATE POLICY "franchise_enquiries_select" ON franchise_enquiries FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin')
);

CREATE POLICY "franchise_enquiries_insert" ON franchise_enquiries FOR INSERT WITH CHECK (
  TRUE -- Public anonymous insert permitted
);

CREATE POLICY "franchise_enquiries_update" ON franchise_enquiries FOR UPDATE USING (
  public.current_profile_role() IN ('super_admin', 'admin')
);

CREATE POLICY "franchise_documents_select" ON franchise_documents FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin')
);

CREATE POLICY "franchise_documents_insert" ON franchise_documents FOR INSERT WITH CHECK (
  TRUE -- Public document attachment at submission
);

--------------------------------------------------------------------------------
-- J. INTEGRATION CONFIGS
--------------------------------------------------------------------------------
CREATE POLICY "integration_configs_select" ON integration_configs FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management', 'accountant') OR
  (public.current_profile_role() = 'admin' AND (outlet_id IS NULL OR public.is_outlet_staff(outlet_id)))
);

CREATE POLICY "integration_configs_write" ON integration_configs FOR ALL USING (
  public.current_profile_role() = 'super_admin'
);

--------------------------------------------------------------------------------
-- K. NOTIFICATIONS & AUDIT LOGS
--------------------------------------------------------------------------------
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
  recipient_id = auth.uid() OR public.current_profile_role() = 'super_admin'
);

CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (
  recipient_id = auth.uid()
);

CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
  public.current_profile_role() IN ('super_admin', 'owner_management') OR
  (public.current_profile_role() IN ('admin', 'manager') AND (outlet_id IS NULL OR public.is_outlet_staff(outlet_id)))
);
