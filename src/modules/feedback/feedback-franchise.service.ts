import { supabase } from '../../lib/supabase';
import type { Database, FeedbackStatus, FranchiseStatus } from '../../types/database.types';

export type FeedbackRow = Database['public']['Tables']['feedback']['Row'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];

export type FranchiseEnquiryRow = Database['public']['Tables']['franchise_enquiries']['Row'];
export type FranchiseEnquiryInsert = Database['public']['Tables']['franchise_enquiries']['Insert'];
export type FranchiseEnquiryUpdate = Database['public']['Tables']['franchise_enquiries']['Update'];

export type FranchiseDocumentRow = Database['public']['Tables']['franchise_documents']['Row'];
export type FranchiseDocumentInsert = Database['public']['Tables']['franchise_documents']['Insert'];

export const VALID_FRANCHISE_TRANSITIONS: Record<FranchiseStatus, FranchiseStatus[]> = {
  new: ['under_review', 'closed'],
  under_review: ['contacted', 'closed'],
  contacted: ['qualified', 'closed'],
  qualified: ['closed'],
  closed: [],
};

export const ALLOWED_FRANCHISE_DOC_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export class FeedbackFranchiseService {
  /**
   * Validate rating input range (1 to 5)
   */
  static validateFeedbackPayload(payload: Partial<FeedbackInsert>): { isValid: boolean; error?: string } {
    if (!payload.outlet_id) return { isValid: false, error: 'Outlet ID is required' };
    if (payload.rating === undefined || payload.rating < 1 || payload.rating > 5) {
      return { isValid: false, error: 'Rating must be an integer between 1 and 5' };
    }
    return { isValid: true };
  }

  /**
   * Submit customer feedback
   */
  static async submitFeedback(
    payload: FeedbackInsert
  ): Promise<{ data: FeedbackRow | null; error: Error | null }> {
    const validation = this.validateFeedbackPayload(payload);
    if (!validation.isValid) {
      return { data: null, error: new Error(validation.error) };
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({ ...payload, status: payload.status || 'new' } as never)
      .select()
      .single();

    return { data: data as FeedbackRow | null, error };
  }

  /**
   * Fetch feedback for an outlet (staff view)
   */
  static async getFeedbackByOutlet(
    outletId: string
  ): Promise<{ data: FeedbackRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('outlet_id', outletId)
      .order('created_at', { ascending: false });

    return { data: data as FeedbackRow[] | null, error };
  }

  /**
   * Update feedback status (e.g. reviewed, flagged, resolved)
   */
  static async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus
  ): Promise<{ data: FeedbackRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('feedback')
      .update({ status } as never)
      .eq('id', feedbackId)
      .select()
      .single();

    return { data: data as FeedbackRow | null, error };
  }

  /**
   * Validate franchise application form input
   */
  static validateFranchiseEnquiryPayload(
    payload: Partial<FranchiseEnquiryInsert>
  ): { isValid: boolean; error?: string } {
    if (!payload.applicant_name?.trim()) return { isValid: false, error: 'Applicant name is required' };
    if (!payload.email?.trim() || !payload.email.includes('@')) {
      return { isValid: false, error: 'Valid email address is required' };
    }
    return { isValid: true };
  }

  /**
   * Submit anonymous/public franchise enquiry
   */
  static async submitFranchiseEnquiry(
    payload: FranchiseEnquiryInsert
  ): Promise<{ data: FranchiseEnquiryRow | null; error: Error | null }> {
    const validation = this.validateFranchiseEnquiryPayload(payload);
    if (!validation.isValid) {
      return { data: null, error: new Error(validation.error) };
    }

    // Ensure internal_notes cannot be set by submitter
    const safePayload: FranchiseEnquiryInsert = {
      ...payload,
      status: 'new',
      internal_notes: null,
    };

    const { data, error } = await supabase
      .from('franchise_enquiries')
      .insert(safePayload as never)
      .select()
      .single();

    return { data: data as FranchiseEnquiryRow | null, error };
  }

  /**
   * Upload document attachment for franchise enquiry
   */
  static async uploadFranchiseDocument(
    enquiryId: string,
    file: File
  ): Promise<{ data: FranchiseDocumentRow | null; error: Error | null }> {
    if (!ALLOWED_FRANCHISE_DOC_MIME_TYPES.includes(file.type)) {
      return {
        data: null,
        error: new Error(`Disallowed document format: ${file.type}. Allowed: PDF, JPEG, PNG, DOC, DOCX.`),
      };
    }

    const fileExt = file.name.split('.').pop() || 'pdf';
    const storagePath = `enquiries/${enquiryId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Upload to private franchise-documents bucket
    const { error: storageError } = await supabase.storage
      .from('franchise-documents')
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (storageError) {
      return { data: null, error: storageError };
    }

    // Record document reference row
    const docPayload: FranchiseDocumentInsert = {
      enquiry_id: enquiryId,
      storage_path: storagePath,
      file_name: file.name,
    };

    const { data: recordData, error: recordError } = await supabase
      .from('franchise_documents')
      .insert(docPayload as never)
      .select()
      .single();

    return { data: recordData as FranchiseDocumentRow | null, error: recordError };
  }

  /**
   * Validate franchise status state machine transition
   */
  static isValidFranchiseTransition(current: FranchiseStatus, next: FranchiseStatus): boolean {
    if (current === next) return true;
    return VALID_FRANCHISE_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Update franchise status & internal notes (staff-only)
   */
  static async updateFranchiseEnquiry(
    enquiryId: string,
    currentStatus: FranchiseStatus,
    newStatus: FranchiseStatus,
    internalNotes?: string,
    assignedTo?: string
  ): Promise<{ data: FranchiseEnquiryRow | null; error: Error | null }> {
    if (!this.isValidFranchiseTransition(currentStatus, newStatus)) {
      return {
        data: null,
        error: new Error(`Invalid franchise status transition from ${currentStatus} to ${newStatus}`),
      };
    }

    const updatePayload: Partial<FranchiseEnquiryUpdate> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (internalNotes !== undefined) updatePayload.internal_notes = internalNotes;
    if (assignedTo !== undefined) updatePayload.assigned_to = assignedTo;

    const { data, error } = await supabase
      .from('franchise_enquiries')
      .update(updatePayload as never)
      .eq('id', enquiryId)
      .select()
      .single();

    return { data: data as FranchiseEnquiryRow | null, error };
  }
}
