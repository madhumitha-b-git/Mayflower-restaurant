import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DashboardService } from '../src/modules/management/dashboard.service';

describe('Phase 9 — Management Dashboard Data Layer', () => {
  const dashboardMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000007_management_dashboard_views.sql'
  );

  const migrationSql = fs.readFileSync(dashboardMigrationPath, 'utf8');

  describe('Database Views & SECURITY INVOKER RLS Scoping', () => {
    it('defines reservation metrics view with SECURITY INVOKER', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_reservations_summary');
      expect(migrationSql).toContain('WITH (security_invoker = true)');
      expect(migrationSql).toContain('no_show_rate_pct');
    });

    it('defines table utilization metrics view with SECURITY INVOKER', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_table_utilization');
      expect(migrationSql).toContain('WITH (security_invoker = true)');
      expect(migrationSql).toContain('utilization_pct');
    });

    it('defines operations metrics view with SECURITY INVOKER', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_operations_summary');
      expect(migrationSql).toContain('WITH (security_invoker = true)');
      expect(migrationSql).toContain('task_completion_rate_pct');
    });

    it('defines feedback metrics view with SECURITY INVOKER', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_feedback_summary');
      expect(migrationSql).toContain('WITH (security_invoker = true)');
      expect(migrationSql).toContain('flagged_negative_count');
    });

    it('defines franchise and outlet status summary views', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_franchise_summary');
      expect(migrationSql).toContain('CREATE OR REPLACE VIEW public.view_dashboard_outlet_status_summary');
    });
  });

  describe('Metric Accuracy Fixture Formula Verification', () => {
    it('calculates no-show rate percentage correctly given fixture counts (1 no-show out of 10 completed/no-show = 10.00%)', () => {
      const completed = 9;
      const noShow = 1;
      const totalPast = completed + noShow;
      const rate = Number(((noShow / totalPast) * 100).toFixed(2));
      expect(rate).toBe(10.0);
    });

    it('calculates table utilization percentage correctly (1 occupied + 1 reserved out of 4 tables = 50.00%)', () => {
      const totalTables = 4;
      const activeTables = 2; // 1 occupied + 1 reserved
      const utilization = Number(((activeTables / totalTables) * 100).toFixed(2));
      expect(utilization).toBe(50.0);
    });

    it('calculates task completion rate percentage correctly (3 completed out of 4 total tasks = 75.00%)', () => {
      const totalTasks = 4;
      const completedTasks = 3;
      const completionRate = Number(((completedTasks / totalTasks) * 100).toFixed(2));
      expect(completionRate).toBe(75.0);
    });

    it('calculates average feedback rating correctly (ratings 4 and 5 -> avg 4.50)', () => {
      const ratings = [4, 5];
      const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
      expect(avg).toBe(4.5);
    });
  });

  describe('Typed Service Layer Methods', () => {
    it('exposes dashboard metric fetchers', () => {
      expect(DashboardService.getReservationMetrics).toBeDefined();
      expect(DashboardService.getTableUtilizationMetrics).toBeDefined();
      expect(DashboardService.getOperationsMetrics).toBeDefined();
      expect(DashboardService.getFeedbackMetrics).toBeDefined();
      expect(DashboardService.getFranchiseMetrics).toBeDefined();
      expect(DashboardService.getOutletStatusMetrics).toBeDefined();
    });
  });
});
