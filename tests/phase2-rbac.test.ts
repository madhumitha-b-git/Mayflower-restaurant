import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 2 — Authentication, RBAC & RLS Policies', () => {
  const rlsMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000001_auth_rbac_rls_policies.sql'
  );

  const rlsSql = fs.readFileSync(rlsMigrationPath, 'utf8');

  it('defines SQL security helper functions', () => {
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION public.current_profile_role()');
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION public.is_outlet_staff');
    expect(rlsSql).toContain('SECURITY DEFINER');
  });

  it('defines auth signup trigger for automatic profile generation', () => {
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION public.handle_new_user()');
    expect(rlsSql).toContain('TRIGGER on_auth_user_created');
    expect(rlsSql).toContain("COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer')");
  });

  it('defines RLS policies for identity & access tables (profiles, user_outlets)', () => {
    expect(rlsSql).toContain('CREATE POLICY "profiles_select" ON profiles');
    expect(rlsSql).toContain('CREATE POLICY "profiles_update" ON profiles');
    expect(rlsSql).toContain('CREATE POLICY "user_outlets_select" ON user_outlets');
  });

  it('defines RLS policies for operational & reservation tables', () => {
    expect(rlsSql).toContain('CREATE POLICY "outlets_select" ON outlets');
    expect(rlsSql).toContain('CREATE POLICY "tables_select" ON tables');
    expect(rlsSql).toContain('CREATE POLICY "reservations_select" ON reservations');
    expect(rlsSql).toContain('CREATE POLICY "sops_select" ON sops');
    expect(rlsSql).toContain('CREATE POLICY "checklist_tasks_select" ON checklist_tasks');
  });

  it('defines anonymous insert policies for public franchise and feedback submissions', () => {
    expect(rlsSql).toContain('CREATE POLICY "franchise_enquiries_insert" ON franchise_enquiries');
    expect(rlsSql).toContain('CREATE POLICY "franchise_documents_insert" ON franchise_documents');
    expect(rlsSql).toContain('CREATE POLICY "feedback_insert" ON feedback');
  });

  it('restricts franchise enquiries read access to staff roles', () => {
    expect(rlsSql).toContain('CREATE POLICY "franchise_enquiries_select" ON franchise_enquiries');
    expect(rlsSql).toContain("'super_admin', 'owner_management', 'admin'");
  });
});
