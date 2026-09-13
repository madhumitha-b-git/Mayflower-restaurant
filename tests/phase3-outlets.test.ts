import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { OutletsService } from '../src/modules/outlets/outlets.service';

describe('Phase 3 — Outlet, Floor & Table Management Backend', () => {
  const transitionMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000002_outlet_table_transition_guards.sql'
  );

  const migrationSql = fs.readFileSync(transitionMigrationPath, 'utf8');

  describe('Database Trigger Guards', () => {
    it('defines PostgreSQL outlet status transition trigger guard', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_outlet_status_transition()');
      expect(migrationSql).toContain('TRIGGER trg_outlet_status_guard');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Invalid outlet status transition from % to %'");
    });

    it('defines PostgreSQL table status transition trigger guard', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_table_status_transition()');
      expect(migrationSql).toContain('TRIGGER trg_table_status_guard');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Invalid table status transition from % to %'");
    });
  });

  describe('Outlet Service Layer Transition Guard', () => {
    it('allows valid outlet status transitions (draft -> published -> archived)', () => {
      expect(OutletsService.isValidOutletTransition('draft', 'published')).toBe(true);
      expect(OutletsService.isValidOutletTransition('draft', 'archived')).toBe(true);
      expect(OutletsService.isValidOutletTransition('published', 'archived')).toBe(true);
      expect(OutletsService.isValidOutletTransition('published', 'published')).toBe(true);
    });

    it('rejects invalid outlet status transitions', () => {
      expect(OutletsService.isValidOutletTransition('published', 'draft')).toBe(false);
      expect(OutletsService.isValidOutletTransition('archived', 'draft')).toBe(false);
      expect(OutletsService.isValidOutletTransition('archived', 'published')).toBe(false);
    });
  });

  describe('Table Service Layer Transition Guard', () => {
    it('allows valid table status transitions', () => {
      expect(OutletsService.isValidTableTransition('available', 'reserved')).toBe(true);
      expect(OutletsService.isValidTableTransition('available', 'occupied')).toBe(true);
      expect(OutletsService.isValidTableTransition('reserved', 'occupied')).toBe(true);
      expect(OutletsService.isValidTableTransition('occupied', 'cleaning')).toBe(true);
      expect(OutletsService.isValidTableTransition('cleaning', 'available')).toBe(true);
      expect(OutletsService.isValidTableTransition('blocked', 'available')).toBe(true);
    });

    it('rejects invalid table status transitions', () => {
      expect(OutletsService.isValidTableTransition('occupied', 'reserved')).toBe(false);
      expect(OutletsService.isValidTableTransition('cleaning', 'occupied')).toBe(false);
    });
  });

  describe('Typed Service Methods', () => {
    it('exposes typed CRUD methods for outlets, floors, and tables', () => {
      expect(OutletsService.getOutlets).toBeDefined();
      expect(OutletsService.getOutletById).toBeDefined();
      expect(OutletsService.createOutlet).toBeDefined();
      expect(OutletsService.updateOutletStatus).toBeDefined();
      expect(OutletsService.getFloorsByOutlet).toBeDefined();
      expect(OutletsService.createFloor).toBeDefined();
      expect(OutletsService.getTablesByOutlet).toBeDefined();
      expect(OutletsService.createTable).toBeDefined();
      expect(OutletsService.updateTableStatus).toBeDefined();
    });
  });
});
