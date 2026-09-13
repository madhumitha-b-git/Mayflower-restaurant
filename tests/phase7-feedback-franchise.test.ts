import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FeedbackFranchiseService } from '../src/modules/feedback/feedback-franchise.service';

describe('Phase 7 — Feedback & Franchise Module Backend', () => {
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000006_feedback_franchise_backend.sql'
  );

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  describe('Database Trigger & Storage Definitions', () => {
    it('defines PostgreSQL franchise status transition trigger guard', () => {
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.check_franchise_status_transition()');
      expect(migrationSql).toContain('TRIGGER trg_franchise_status_guard');
      expect(migrationSql).toContain("RAISE EXCEPTION 'Invalid franchise status transition from % to %'");
    });

    it('defines private franchise-documents storage bucket and RLS policies', () => {
      expect(migrationSql).toContain("'franchise-documents'");
      expect(migrationSql).toContain('FALSE'); // Private bucket
      expect(migrationSql).toContain('CREATE POLICY "franchise_documents_storage_insert" ON storage.objects');
      expect(migrationSql).toContain('CREATE POLICY "franchise_documents_storage_select" ON storage.objects');
    });
  });

  describe('Feedback Validation', () => {
    it('accepts ratings between 1 and 5', () => {
      const result = FeedbackFranchiseService.validateFeedbackPayload({
        outlet_id: '11111111-1111-1111-1111-111111111111',
        rating: 5,
        comments: 'Excellent dining experience!',
      });
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid ratings (< 1 or > 5)', () => {
      const lowResult = FeedbackFranchiseService.validateFeedbackPayload({
        outlet_id: '11111111-1111-1111-1111-111111111111',
        rating: 0,
      });
      expect(lowResult.isValid).toBe(false);

      const highResult = FeedbackFranchiseService.validateFeedbackPayload({
        outlet_id: '11111111-1111-1111-1111-111111111111',
        rating: 6,
      });
      expect(highResult.isValid).toBe(false);
    });
  });

  describe('Franchise Enquiry & Security Checks', () => {
    it('validates required name and email format for franchise enquiry', () => {
      const invalidEmail = FeedbackFranchiseService.validateFranchiseEnquiryPayload({
        applicant_name: 'John Doe',
        email: 'invalid-email',
      });
      expect(invalidEmail.isValid).toBe(false);

      const validPayload = FeedbackFranchiseService.validateFranchiseEnquiryPayload({
        applicant_name: 'Jane Smith',
        email: 'jane@example.com',
      });
      expect(validPayload.isValid).toBe(true);
    });

    it('allows valid franchise status state machine transitions', () => {
      expect(FeedbackFranchiseService.isValidFranchiseTransition('new', 'under_review')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('under_review', 'contacted')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('contacted', 'qualified')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('qualified', 'closed')).toBe(true);
    });

    it('rejects invalid franchise status transitions', () => {
      expect(FeedbackFranchiseService.isValidFranchiseTransition('closed', 'new')).toBe(false);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('qualified', 'under_review')).toBe(false);
    });
  });
});
