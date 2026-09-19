import { UserProfile, UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  SeedReservation, SeedTask, SeedFeedback,
  SeedFranchiseEnquiry, SeedAuditLog, SeedOutlet
} from './mockSeed';
import { MockDataProvider } from './MockDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';

export interface DataProvider {
  /** Fetch reservations filtered by actor role & policies */
  getReservations(actor: UserProfile): Promise<SeedReservation[]>;
  /** Create a new reservation */
  createReservation(actor: UserProfile, payload: Partial<SeedReservation>): Promise<SeedReservation>;
  /** Update reservation status (Approve, Confirm, Cancel, Complete) */
  updateReservationStatus(actor: UserProfile, reservationId: string, status: 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled'): Promise<SeedReservation>;
  /** Manager assigns a specific table to a reservation */
  assignTable(actor: UserProfile, reservationId: string, tableId: string): Promise<SeedReservation>;

  /** Fetch customer feedback filtered by policies */
  getFeedback(actor: UserProfile): Promise<SeedFeedback[]>;
  /** Submit new guest feedback */
  submitFeedback(actor: UserProfile, payload: { outlet: string; rating: number; message: string; reservationId?: string }): Promise<SeedFeedback>;

  /** Fetch staff members directory filtered by policies */
  getStaffMembers(actor: UserProfile): Promise<UserProfile[]>;
  /** Super Admin role assignment method with RBAC check and audit logging */
  assignRole(actor: UserProfile, targetUserId: string, newRole: UserRole): Promise<UserProfile>;

  /** Fetch active outlets list */
  getOutlets(actor: UserProfile): Promise<SeedOutlet[]>;

  /** Fetch SOPs & checklist tasks filtered by policies */
  getSOPsAndTasks(actor: UserProfile): Promise<SeedTask[]>;
  /** Update checklist task status (Completed, In Progress, Escalated) */
  updateTaskStatus(actor: UserProfile, taskId: string, status: 'Pending' | 'In Progress' | 'Completed' | 'Escalated', remarks?: string): Promise<SeedTask>;

  /** Upload photo evidence for a completed task */
  uploadTaskEvidence(actor: UserProfile, taskId: string, file: File, geoCoords?: { lat: number; lng: number }): Promise<{ id: string; storagePath: string; capturedAt: string }>;
  /** Get evidence items for a task */
  getTaskEvidence(actor: UserProfile, taskId: string): Promise<Array<{ id: string; storagePath: string; fileType: string; uploadedBy: string; geoLat?: number; geoLng?: number; capturedAt: string }>>;

  /** Fetch franchise enquiries (Admin/Owner/SuperAdmin only) */
  getFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]>;
  /** Fetch customer's own franchise enquiries */
  getMyFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]>;
  /** Update franchise enquiry status and notes (Admin/Owner/SuperAdmin only) */
  updateFranchiseEnquiryStatus(actor: UserProfile, enquiryId: string, status: string, internalNotes?: string): Promise<SeedFranchiseEnquiry>;
  /** Submit public franchise enquiry */
  submitFranchiseEnquiry(payload: { applicantName: string; email: string; phone?: string; cityInterested?: string; message?: string; investmentBudget?: string; priorExperience?: boolean; customerId?: string }): Promise<SeedFranchiseEnquiry>;
  /** Upload documents for a franchise enquiry */
  uploadFranchiseDocuments(actor: UserProfile, enquiryId: string, files: File[]): Promise<Array<{ id: string; fileName: string; storagePath: string }>>;
  /** Fetch documents for a franchise enquiry */
  getFranchiseDocuments(actor: UserProfile, enquiryId: string): Promise<Array<{ id: string; fileName: string; storagePath: string; uploadedAt: string }>>;

  /** Fetch system audit logs */
  getAuditLogs(actor: UserProfile): Promise<SeedAuditLog[]>;

  /** Fetch customer loyalty points and transaction history */
  getLoyaltyBalance(actor: UserProfile): Promise<{ rewardPoints: number; tier: string; transactions: any[] }>;

  /** Reactive pub/sub subscription mechanism for autonomous live UI updates */
  subscribe(event: string, callback: (data: any) => void): () => void;
}

let providerInstance: DataProvider | null = null;

export const getDataProvider = (): DataProvider => {
  if (providerInstance) return providerInstance;

  const mode = (import.meta.env.VITE_DATA_PROVIDER || (isSupabaseConfigured ? 'supabase' : 'mock')).toLowerCase();

  if (mode === 'supabase') {
    providerInstance = new SupabaseDataProvider();
  } else {
    providerInstance = new MockDataProvider();
  }

  return providerInstance!;
};
