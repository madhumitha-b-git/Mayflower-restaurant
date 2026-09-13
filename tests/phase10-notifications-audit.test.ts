import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationsService } from '../src/modules/management/notifications.service';

describe('Phase 10 — Notifications & Audit Logging Backend', () => {
  const auditMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000008_audit_logs_notifications.sql'
  );

  const migrationSql = fs.readFileSync(auditMigrationPath, 'utf8');

  describe('Database Audit Triggers & Notification Queueing', () => {
    it('defines generic log_material_audit_event trigger function', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.log_material_audit_event()');
      expect(migrationSql).toContain('INSERT INTO public.audit_logs');
    });

    it('attaches audit triggers to all 5 material action tables', () => {
      expect(migrationSql).toContain('TRIGGER trg_audit_profiles');
      expect(migrationSql).toContain('TRIGGER trg_audit_reservations');
      expect(migrationSql).toContain('TRIGGER trg_audit_outlets');
      expect(migrationSql).toContain('TRIGGER trg_audit_checklist_tasks');
      expect(migrationSql).toContain('TRIGGER trg_audit_integration_configs');
    });

    it('defines automatic reservation notification queueing trigger', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.queue_reservation_notification()');
      expect(migrationSql).toContain('TRIGGER trg_notify_reservation');
      expect(migrationSql).toContain('INSERT INTO public.notifications');
    });
  });

  describe('Notification & Audit Service Layer', () => {
    it('exposes typed methods for notification queuing, status updates, and audit queries', () => {
      expect(NotificationsService.queueNotification).toBeDefined();
      expect(NotificationsService.getUserNotifications).toBeDefined();
      expect(NotificationsService.updateNotificationStatus).toBeDefined();
      expect(NotificationsService.getAuditLogs).toBeDefined();
    });
  });
});
