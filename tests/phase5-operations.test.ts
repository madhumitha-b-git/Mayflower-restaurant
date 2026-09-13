import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { OperationsService } from '../src/modules/operations/operations.service';

describe('Phase 5 — Operations Backend: SOPs, Checklists & Tasks', () => {
  const opsMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000004_operations_sops_tasks.sql'
  );

  const migrationSql = fs.readFileSync(opsMigrationPath, 'utf8');

  describe('Database Trigger & Escalation Functions', () => {
    it('defines PostgreSQL task status transition trigger guard', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_task_status_transition()');
      expect(migrationSql).toContain('TRIGGER trg_task_status_guard');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Invalid task status transition from % to %'");
    });

    it('defines check_and_escalate_overdue_tasks function with critical/non-critical intervals', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_and_escalate_overdue_tasks');
      expect(migrationSql).toContain("priority = 'critical' AND (due_at + INTERVAL '30 minutes') <= p_current_time");
      expect(migrationSql).toContain("priority != 'critical' AND (due_at + INTERVAL '2 hours') <= p_current_time");
    });
  });

  describe('Task State Machine Transitions', () => {
    it('allows valid task state transitions', () => {
      expect(OperationsService.isValidTaskTransition('pending', 'in_progress')).toBe(true);
      expect(OperationsService.isValidTaskTransition('pending', 'completed')).toBe(true);
      expect(OperationsService.isValidTaskTransition('pending', 'escalated')).toBe(true);
      expect(OperationsService.isValidTaskTransition('in_progress', 'completed')).toBe(true);
      expect(OperationsService.isValidTaskTransition('in_progress', 'escalated')).toBe(true);
    });

    it('rejects invalid task state transitions', () => {
      expect(OperationsService.isValidTaskTransition('completed', 'pending')).toBe(false);
      expect(OperationsService.isValidTaskTransition('completed', 'in_progress')).toBe(false);
      expect(OperationsService.isValidTaskTransition('escalated', 'pending')).toBe(false);
    });
  });

  describe('Service Layer Methods', () => {
    it('exposes typed methods for SOPs, checklists, tasks, and escalation execution', () => {
      expect(OperationsService.getSopCategories).toBeDefined();
      expect(OperationsService.getSops).toBeDefined();
      expect(OperationsService.createSop).toBeDefined();
      expect(OperationsService.getChecklists).toBeDefined();
      expect(OperationsService.createChecklist).toBeDefined();
      expect(OperationsService.getTasksByChecklist).toBeDefined();
      expect(OperationsService.createTask).toBeDefined();
      expect(OperationsService.updateTaskStatus).toBeDefined();
      expect(OperationsService.runEscalationCheck).toBeDefined();
    });
  });
});
