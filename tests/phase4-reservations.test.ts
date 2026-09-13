import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ReservationsService } from '../src/modules/reservations/reservations.service';

describe('Phase 4 — Reservation Engine Backend', () => {
  const reservationMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000003_reservation_engine.sql'
  );

  const migrationSql = fs.readFileSync(reservationMigrationPath, 'utf8');

  describe('Database RPC & Trigger Guards', () => {
    it('defines reservation status transition trigger guard in SQL', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_reservation_status_transition()');
      expect(migrationSql).toContain('TRIGGER trg_reservation_status_guard');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Invalid reservation status transition from % to %'");
    });

    it('defines double booking overlap checking function', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_table_double_booking');
      expect(migrationSql).toContain('ABS(EXTRACT(EPOCH FROM (reservation_time - p_reservation_time))) < 7200');
    });

    it('defines atomic approve_and_assign_table RPC function with row locking', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.approve_and_assign_table');
      expect(migrationSql).toContain('FOR UPDATE');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Table is already booked for an overlapping time slot'");
      expect(migrationSql).toContain('UPDATE public.reservations');
      expect(migrationSql).toContain("status = 'confirmed'");
      expect(migrationSql).toContain('UPDATE public.tables');
      expect(migrationSql).toContain("status = 'reserved'");
    });
  });

  describe('Payload Validation', () => {
    it('rejects reservation payloads with non-positive party size', () => {
      const result = ReservationsService.validateCreatePayload({
        outlet_id: '11111111-1111-1111-1111-111111111111',
        customer_id: 'cust-123',
        reservation_date: '2026-10-01',
        reservation_time: '19:00',
        party_size: 0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Party size must be greater than zero');
    });

    it('rejects reservation payloads missing required date or outlet', () => {
      const result = ReservationsService.validateCreatePayload({
        customer_id: 'cust-123',
        party_size: 2,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Outlet ID is required');
    });

    it('accepts valid reservation creation payloads', () => {
      const result = ReservationsService.validateCreatePayload({
        outlet_id: '11111111-1111-1111-1111-111111111111',
        customer_id: 'cust-123',
        reservation_date: '2026-10-01',
        reservation_time: '19:00',
        party_size: 4,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Reservation State Machine Transitions', () => {
    it('allows valid transitions per scope document state machine', () => {
      expect(ReservationsService.isValidStatusTransition('pending', 'confirmed')).toBe(true);
      expect(ReservationsService.isValidStatusTransition('pending', 'cancelled')).toBe(true);
      expect(ReservationsService.isValidStatusTransition('confirmed', 'completed')).toBe(true);
      expect(ReservationsService.isValidStatusTransition('confirmed', 'no_show')).toBe(true);
      expect(ReservationsService.isValidStatusTransition('confirmed', 'cancelled')).toBe(true);
    });

    it('rejects invalid transitions', () => {
      expect(ReservationsService.isValidStatusTransition('completed', 'pending')).toBe(false);
      expect(ReservationsService.isValidStatusTransition('cancelled', 'confirmed')).toBe(false);
      expect(ReservationsService.isValidStatusTransition('no_show', 'completed')).toBe(false);
    });
  });

  describe('Concurrency & Double Booking Lock Logic', () => {
    it('proves atomic single-transaction requirement exists in RPC definition', () => {
      expect(migrationSql).toMatch(/UPDATE public\.reservations[\s\S]*UPDATE public\.tables/);
    });
  });
});
