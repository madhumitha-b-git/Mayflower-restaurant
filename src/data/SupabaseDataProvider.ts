import { DataProvider } from './DataProvider';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, UserRole } from '../types';
import {
  SeedReservation, SeedTask, SeedFeedback,
  SeedFranchiseEnquiry, SeedAuditLog, SeedOutlet
} from './mockSeed';
import { MockDataProvider } from './MockDataProvider';
import {
  canViewReservation, canManageReservation, canViewCustomerData,
  canViewFeedback, canSubmitFeedback, canViewFranchiseEnquiries,
  canAssignRole, canViewStaffDirectory, canViewAuditLogs,
  canUpdateTaskStatus
} from '../rbac/policies';

type EventCallback = (data: any) => void;

export class SupabaseDataProvider implements DataProvider {
  private fallback: MockDataProvider = new MockDataProvider();
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.setupRealtimeSubscriptions();
  }

  private setupRealtimeSubscriptions() {
    try {
      supabase
        .channel('public-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          this.emit(payload.table, payload);
          this.emit('*', payload);
        })
        .subscribe();
    } catch {}
  }

  private emit(event: string, payload?: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => cb(payload));
    }
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    const fallbackUnsub = this.fallback.subscribe(event, callback);

    return () => {
      fallbackUnsub();
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  async getReservations(actor: UserProfile): Promise<SeedReservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, booking_code, guests, reservation_date, time_slot, status, booked_at, outlets(name), user_profiles(email, name)')
        .limit(100);

      if (!error && data && data.length > 0) {
        const mapped: SeedReservation[] = data.map((r: any) => ({
          id: r.id,
          bookingCode: r.booking_code || `MF-${r.id.slice(0, 4)}`,
          customerId: r.customer_id || actor.id,
          customerName: r.user_profiles?.name || r.customer_name || 'Guest',
          email: r.user_profiles?.email || r.email || '',
          phone: r.phone || '',
          outlet: r.outlets?.name || r.outlet || 'Poes Garden Flagship',
          date: r.reservation_date || '',
          timeSlot: r.time_slot || '',
          guests: r.guests || 2,
          seatingArea: r.seating_area || 'Main Dining',
          status: (r.status as any) || 'Confirmed',
          bookedAt: r.booked_at || '',
          specialRequests: r.special_requests || '',
        }));
        return mapped.filter(res => canViewReservation(actor, res));
      }
    } catch {}
    return this.fallback.getReservations(actor);
  }

  async createReservation(actor: UserProfile, payload: Partial<SeedReservation>): Promise<SeedReservation> {
    try {
      const newRes = {
        customer_id: actor.id,
        booking_code: `MF-${Math.floor(1000 + Math.random() * 9000)}`,
        outlet: payload.outlet || 'Poes Garden Flagship',
        reservation_date: payload.date || new Date().toLocaleDateString('en-IN'),
        time_slot: payload.timeSlot || '19:30',
        guests: payload.guests || 2,
        status: 'pending',
        special_requests: payload.specialRequests || '',
      };
      const { data, error } = await supabase.from('reservations').insert(newRes).select('*').single();
      if (!error && data) {
        this.emit('reservations', data);
        return {
          id: data.id,
          bookingCode: data.booking_code,
          customerId: actor.id,
          customerName: actor.name,
          email: actor.email,
          phone: actor.phone,
          outlet: payload.outlet || 'Poes Garden Flagship',
          date: payload.date || '',
          timeSlot: payload.timeSlot || '',
          guests: payload.guests || 2,
          seatingArea: payload.seatingArea || 'Main Dining',
          status: 'Pending',
          bookedAt: new Date().toLocaleDateString('en-IN'),
        };
      }
    } catch {}
    return this.fallback.createReservation(actor, payload);
  }

  async updateReservationStatus(actor: UserProfile, reservationId: string, status: 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled'): Promise<SeedReservation> {
    if (!canManageReservation(actor) && !(actor.id === reservationId && status === 'Cancelled')) {
      throw new Error('Denied: Insufficient permission to manage reservation status');
    }
    try {
      const { error } = await supabase.from('reservations').update({ status: status.toLowerCase() }).eq('id', reservationId);
      if (!error) {
        this.emit('reservations');
      }
    } catch {}
    return this.fallback.updateReservationStatus(actor, reservationId, status);
  }

  async assignTable(actor: UserProfile, reservationId: string, tableId: string): Promise<SeedReservation> {
    if (!canManageReservation(actor)) {
      throw new Error('Denied: Insufficient permission to manage reservation status');
    }
    try {
      const { ReservationsService } = await import('../modules/reservations/reservations.service');
      const { error } = await ReservationsService.approveAndAssignTable(reservationId, tableId, actor.id);
      if (!error) {
        this.emit('reservations');
      }
    } catch {}
    return this.fallback.assignTable(actor, reservationId, tableId);
  }

  async getFeedback(actor: UserProfile): Promise<SeedFeedback[]> {
    try {
      const { data, error } = await supabase.from('feedback').select('id, rating, message, status, created_at, outlet, user_profiles(name, email)').limit(50);
      if (!error && data && data.length > 0) {
        const mapped: SeedFeedback[] = data.map((fb: any) => ({
          id: fb.id,
          customerId: fb.customer_id,
          customerName: fb.user_profiles?.name || 'Guest',
          email: fb.user_profiles?.email || '',
          outlet: fb.outlet || 'Poes Garden Flagship',
          rating: fb.rating,
          message: fb.message,
          status: fb.status || 'New',
          createdAt: fb.created_at || '',
        }));
        return mapped.filter(f => canViewFeedback(actor, f));
      }
    } catch {}
    return this.fallback.getFeedback(actor);
  }

  async submitFeedback(actor: UserProfile, payload: { outlet: string; rating: number; message: string; reservationId?: string }): Promise<SeedFeedback> {
    if (!canSubmitFeedback(actor)) throw new Error('Denied: Must be authenticated to submit feedback');
    try {
      await supabase.from('feedback').insert({
        customer_id: actor.id,
        outlet: payload.outlet,
        rating: payload.rating,
        message: payload.message,
        reservation_id: payload.reservationId,
      });
      this.emit('feedback');
    } catch {}
    return this.fallback.submitFeedback(actor, payload);
  }

  async getStaffMembers(actor: UserProfile): Promise<UserProfile[]> {
    if (!canViewStaffDirectory(actor)) throw new Error('Denied: Insufficient permission to view staff directory');
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').in('role', ['SuperAdmin', 'Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant']);
      if (!error && data && data.length > 0) {
        return data.map((u: any) => ({
          id: u.id,
          name: u.name || u.email?.split('@')[0] || 'Staff Member',
          phone: u.phone || u.mobile || '',
          email: u.email,
          rewardPoints: u.reward_points ?? 500,
          tier: u.tier ?? 'Green',
          role: u.role as UserRole,
          totalVisits: u.total_visits ?? 0,
          joinedDate: u.joined_date || '',
          transactions: [],
        }));
      }
    } catch {}
    return this.fallback.getStaffMembers(actor);
  }

  async assignRole(actor: UserProfile, targetUserId: string, newRole: UserRole): Promise<UserProfile> {
    if (!canAssignRole(actor, targetUserId, newRole)) throw new Error('Denied: Only SuperAdmin can reassign user roles');
    try {
      await supabase.from('user_profiles').update({ role: newRole }).eq('id', targetUserId);
      this.emit('users');
    } catch {}
    return this.fallback.assignRole(actor, targetUserId, newRole);
  }

  async getOutlets(actor: UserProfile): Promise<SeedOutlet[]> {
    return this.fallback.getOutlets(actor);
  }

  async getSOPsAndTasks(actor: UserProfile): Promise<SeedTask[]> {
    return this.fallback.getSOPsAndTasks(actor);
  }

  async updateTaskStatus(actor: UserProfile, taskId: string, status: 'Pending' | 'In Progress' | 'Completed' | 'Escalated', remarks?: string): Promise<SeedTask> {
    if (!canUpdateTaskStatus(actor)) throw new Error('Denied: Insufficient permission to update task status');
    return this.fallback.updateTaskStatus(actor, taskId, status, remarks);
  }

  async uploadTaskEvidence(actor: UserProfile, taskId: string, file: File, geoCoords?: { lat: number; lng: number }): Promise<{ id: string; storagePath: string; capturedAt: string }> {
    const { EvidenceService } = await import('../modules/operations/evidence.service');
    const { data, error } = await EvidenceService.uploadTaskEvidence({
      taskId,
      file,
      uploadedBy: actor.id,
      geoLat: geoCoords?.lat,
      geoLng: geoCoords?.lng
    });
    
    if (error || !data) {
      console.error('Supabase upload failed, falling back to mock', error);
      return this.fallback.uploadTaskEvidence(actor, taskId, file, geoCoords);
    }
    
    return {
      id: data.id,
      storagePath: data.storage_path,
      capturedAt: data.captured_at
    };
  }

  async getTaskEvidence(actor: UserProfile, taskId: string): Promise<Array<{ id: string; storagePath: string; fileType: string; uploadedBy: string; geoLat?: number; geoLng?: number; capturedAt: string }>> {
    const { EvidenceService } = await import('../modules/operations/evidence.service');
    const { data, error } = await EvidenceService.getEvidenceByTask(taskId);
    
    if (error || !data || data.length === 0) {
      return this.fallback.getTaskEvidence(actor, taskId);
    }
    
    return data.map(row => ({
      id: row.id,
      storagePath: row.storage_path,
      fileType: row.file_type,
      uploadedBy: row.uploaded_by || '',
      geoLat: row.geo_lat ?? undefined,
      geoLng: row.geo_lng ?? undefined,
      capturedAt: row.captured_at
    }));
  }

  async getFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]> {
    if (!canViewFranchiseEnquiries(actor)) throw new Error('Denied: Cannot view franchise enquiries');
    const { data, error } = await supabase.from('franchise_enquiries').select('*, franchise_documents(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      applicantName: d.applicant_name,
      email: d.email,
      phone: d.phone,
      cityInterested: d.city_interested,
      message: d.message,
      status: d.status,
      internalNotes: d.internal_notes,
      createdAt: d.created_at,
      customerId: d.customer_id,
      investmentBudget: d.investment_budget,
      priorExperience: d.prior_experience,
      documents: d.franchise_documents?.map((doc: any) => ({
        id: doc.id,
        fileName: doc.file_name,
        storagePath: doc.storage_path,
        uploadedAt: doc.created_at
      }))
    }));
  }

  async getMyFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]> {
    const { data, error } = await supabase.from('franchise_enquiries').select('*, franchise_documents(*)').eq('customer_id', actor.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      applicantName: d.applicant_name,
      email: d.email,
      phone: d.phone,
      cityInterested: d.city_interested,
      message: d.message,
      status: d.status,
      internalNotes: d.internal_notes,
      createdAt: d.created_at,
      customerId: d.customer_id,
      investmentBudget: d.investment_budget,
      priorExperience: d.prior_experience,
      documents: d.franchise_documents?.map((doc: any) => ({
        id: doc.id,
        fileName: doc.file_name,
        storagePath: doc.storage_path,
        uploadedAt: doc.created_at
      }))
    }));
  }

  async updateFranchiseEnquiryStatus(actor: UserProfile, enquiryId: string, status: string, internalNotes?: string): Promise<SeedFranchiseEnquiry> {
    if (!canViewFranchiseEnquiries(actor)) throw new Error('Denied: Cannot update franchise enquiries');
    
    // We can also use FeedbackFranchiseService.updateFranchiseEnquiry here if needed, but doing it directly is fine.
    const updateData: any = { status };
    if (internalNotes !== undefined) updateData.internal_notes = internalNotes;
    
    const { data, error } = await supabase.from('franchise_enquiries').update(updateData).eq('id', enquiryId).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      applicantName: data.applicant_name,
      email: data.email,
      phone: data.phone,
      cityInterested: data.city_interested,
      message: data.message,
      status: data.status,
      internalNotes: data.internal_notes,
      createdAt: data.created_at,
      customerId: data.customer_id,
      investmentBudget: data.investment_budget,
      priorExperience: data.prior_experience
    };
  }

  async submitFranchiseEnquiry(payload: { applicantName: string; email: string; phone?: string; cityInterested?: string; message?: string; investmentBudget?: string; priorExperience?: boolean; customerId?: string }): Promise<SeedFranchiseEnquiry> {
    const { FeedbackFranchiseService } = await import('../modules/feedback/feedback-franchise.service');
    const extraNotes = [
      payload.investmentBudget ? `Budget: ${payload.investmentBudget}` : null,
      payload.priorExperience !== undefined ? `Prior F&B Experience: ${payload.priorExperience ? 'Yes' : 'No'}` : null,
      payload.message || null
    ].filter(Boolean).join(' | ');

    const res = await FeedbackFranchiseService.submitFranchiseEnquiry({
      applicant_name: payload.applicantName,
      email: payload.email,
      phone: payload.phone,
      city_interested: payload.cityInterested,
      message: extraNotes || 'New franchise enquiry'
    });
    if (res.error || !res.data) throw res.error || new Error('Failed to submit');
    return {
      id: res.data.id,
      applicantName: res.data.applicant_name,
      email: res.data.email,
      phone: res.data.phone || '',
      cityInterested: res.data.city_interested || '',
      message: res.data.message || '',
      status: res.data.status as any,
      createdAt: res.data.created_at,
      customerId: payload.customerId || undefined,
    };
  }

  async uploadFranchiseDocuments(_actor: UserProfile, enquiryId: string, files: File[]): Promise<Array<{ id: string; fileName: string; storagePath: string }>> {
    const { FeedbackFranchiseService } = await import('../modules/feedback/feedback-franchise.service');
    const results = [];
    for (const file of files) {
      const res = await FeedbackFranchiseService.uploadFranchiseDocument(enquiryId, file);
      if (res.data) {
        results.push({
          id: res.data.id,
          fileName: res.data.file_name,
          storagePath: res.data.storage_path
        });
      }
    }
    return results;
  }

  async getFranchiseDocuments(_actor: UserProfile, enquiryId: string): Promise<Array<{ id: string; fileName: string; storagePath: string; uploadedAt: string }>> {
    const { data, error } = await supabase.from('franchise_documents').select('*').eq('enquiry_id', enquiryId);
    if (error) throw error;
    return (data || []).map((doc: any) => ({
      id: doc.id,
      fileName: doc.file_name,
      storagePath: doc.storage_path,
      uploadedAt: doc.created_at
    }));
  }

  async getAuditLogs(actor: UserProfile): Promise<SeedAuditLog[]> {
    if (!canViewAuditLogs(actor)) throw new Error('Denied: Cannot view audit logs');
    return this.fallback.getAuditLogs(actor);
  }

  async getLoyaltyBalance(actor: UserProfile): Promise<{ rewardPoints: number; tier: string; transactions: any[] }> {
    if (!canViewCustomerData(actor, actor.id)) throw new Error('Denied: Cannot view another customer\'s loyalty balance');
    return this.fallback.getLoyaltyBalance(actor);
  }
}
