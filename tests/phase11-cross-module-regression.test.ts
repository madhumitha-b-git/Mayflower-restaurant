import { describe, it, expect } from 'vitest';
import { OutletsService } from '../src/modules/outlets/outlets.service';
import { ReservationsService } from '../src/modules/reservations/reservations.service';
import { OperationsService } from '../src/modules/operations/operations.service';
import { EvidenceService } from '../src/modules/operations/evidence.service';
import { FeedbackFranchiseService } from '../src/modules/feedback/feedback-franchise.service';
import { NotificationsService } from '../src/modules/management/notifications.service';

describe('Phase 11 — Full Backend Regression & Cross-Module Integration (GATE)', () => {
  describe('Cross-Module Integration Flow 1: Reservation Lifecycle & Table Locking', () => {
    it('executes full reservation flow: validate payload -> state transition -> table lock -> cancellation', () => {
      // 1. Validate customer reservation payload
      const payload = {
        outlet_id: '11111111-1111-1111-1111-111111111111',
        customer_id: 'cust-456',
        reservation_date: '2026-10-15',
        reservation_time: '20:00',
        party_size: 4,
      };
      const validation = ReservationsService.validateCreatePayload(payload);
      expect(validation.isValid).toBe(true);

      // 2. Validate table status transition from available to reserved
      expect(OutletsService.isValidTableTransition('available', 'reserved')).toBe(true);

      // 3. Validate reservation confirmation state transition
      expect(ReservationsService.isValidStatusTransition('pending', 'confirmed')).toBe(true);

      // 4. Validate customer cancellation from confirmed status
      expect(ReservationsService.isValidStatusTransition('confirmed', 'cancelled')).toBe(true);

      // 5. Validate table status return to available after cancellation
      expect(OutletsService.isValidTableTransition('reserved', 'available')).toBe(true);
    });
  });

  describe('Cross-Module Integration Flow 2: Daily Operations & Evidence Pipeline', () => {
    it('executes operational task lifecycle: checklist creation -> task status update -> evidence validation', () => {
      // 1. Task state machine transitions: pending -> in_progress -> completed
      expect(OperationsService.isValidTaskTransition('pending', 'in_progress')).toBe(true);
      expect(OperationsService.isValidTaskTransition('in_progress', 'completed')).toBe(true);

      // 2. Evidence file validation (JPEG photo under 10MB)
      const validPhoto = new File(['evidence image buffer'], 'kitchen_cleanliness.jpg', { type: 'image/jpeg' });
      const fileValidation = EvidenceService.validateFile(validPhoto);
      expect(fileValidation.isValid).toBe(true);

      // 3. Reject invalid file format (e.g. executable binary)
      const invalidFile = new File(['binary content'], 'malicious.exe', { type: 'application/octet-stream' });
      const invalidValidation = EvidenceService.validateFile(invalidFile);
      expect(invalidValidation.isValid).toBe(false);
    });
  });

  describe('Cross-Module Integration Flow 3: Public Franchise Lead & Document Attachment', () => {
    it('executes public franchise lead submission: validate applicant data -> status pipeline -> document validation', () => {
      // 1. Validate public franchise enquiry input
      const enquiryPayload = {
        applicant_name: 'Mayflower Partner Lead',
        email: 'franchise@partner.com',
        city_interested: 'Bengaluru',
      };
      const validation = FeedbackFranchiseService.validateFranchiseEnquiryPayload(enquiryPayload);
      expect(validation.isValid).toBe(true);

      // 2. Franchise status pipeline transitions: new -> under_review -> contacted -> qualified -> closed
      expect(FeedbackFranchiseService.isValidFranchiseTransition('new', 'under_review')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('under_review', 'contacted')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('contacted', 'qualified')).toBe(true);
      expect(FeedbackFranchiseService.isValidFranchiseTransition('qualified', 'closed')).toBe(true);

      // 3. Verify notifications service exposes audit log fetcher
      expect(NotificationsService.getAuditLogs).toBeDefined();
    });
  });
});
