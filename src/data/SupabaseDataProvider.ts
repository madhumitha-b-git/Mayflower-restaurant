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
  canViewFeedback, canViewFranchiseEnquiries,
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
      // 1. Fetch user_profiles to build customer lookup & collect JSONB bookings
      let customerProfiles: any[] = [];
      try {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, name, email, phone, reservations');
        if (profilesData) customerProfiles = profilesData;
      } catch {}

      const customerLookup = new Map<string, { name: string; email: string; phone: string }>();
      const profileReservations: SeedReservation[] = [];

      for (const cp of customerProfiles) {
        if (cp.id) {
          customerLookup.set(cp.id, {
            name: cp.name || cp.email?.split('@')[0] || 'Guest',
            email: cp.email || '',
            phone: cp.phone || '',
          });
        }
        if (Array.isArray(cp.reservations)) {
          for (const res of cp.reservations) {
            if (res && (res.id || res.bookingCode)) {
              profileReservations.push({
                id: res.id || `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                bookingCode: res.bookingCode || `MF-${(res.id || '').slice(-4)}`,
                customerId: cp.id,
                customerName: cp.name || 'Guest',
                email: cp.email || '',
                phone: cp.phone || '',
                outlet: res.outlet || 'Poes Garden Flagship',
                date: res.date || '',
                timeSlot: res.timeSlot || '19:00',
                guests: res.guests || 2,
                seatingArea: res.seatingArea || 'Main Dining',
                status: (res.status as any) || 'Confirmed',
                bookedAt: res.bookedAt || '',
                specialRequests: res.specialRequests || '',
              });
            }
          }
        }
      }

      // 2. Query reservations table
      const { data: dbRes, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: false })
        .limit(100);

      const tableReservations: SeedReservation[] = [];
      if (!error && Array.isArray(dbRes)) {
        for (const r of dbRes) {
          const cust = customerLookup.get(r.customer_id);
          tableReservations.push({
            id: r.id,
            bookingCode: r.booking_code || `MF-${r.id.slice(0, 4)}`,
            customerId: r.customer_id || '',
            customerName: cust?.name || r.customer_name || r.guest_name || 'Guest',
            email: cust?.email || r.customer_email || r.email || '',
            phone: cust?.phone || r.customer_phone || r.phone || '',
            outlet: r.outlet_name || r.outlet || 'Poes Garden Flagship',
            date: r.reservation_date || r.date || '',
            timeSlot: r.reservation_time || r.time_slot || '19:00',
            guests: r.party_size || r.guests || 2,
            seatingArea: r.seating_area || 'Main Dining',
            status: ((r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : 'Confirmed') as any),
            bookedAt: r.created_at || '',
            specialRequests: r.special_requests || '',
          });
        }
      }

      // 3. Deduplicate
      const mergedMap = new Map<string, SeedReservation>();
      for (const r of [...tableReservations, ...profileReservations]) {
        const key = r.bookingCode || r.id;
        if (key && !mergedMap.has(key)) {
          mergedMap.set(key, r);
        }
      }

      const allMerged = Array.from(mergedMap.values());
      if (allMerged.length > 0) {
        return allMerged.filter(res => canViewReservation(actor, res));
      }
    } catch (err) {
      console.warn('SupabaseDataProvider.getReservations note:', err);
    }
    return this.fallback.getReservations(actor);
  }

  async createReservation(actor: UserProfile, payload: Partial<SeedReservation>): Promise<SeedReservation> {
    try {
      const newRes: any = {
        customer_id: actor.id,
        booking_code: `MF-${Math.floor(1000 + Math.random() * 9000)}`,
        outlet: payload.outlet || 'Poes Garden Flagship',
        reservation_date: payload.date || new Date().toLocaleDateString('en-IN'),
        party_size: payload.guests || 2,
        reservation_time: payload.timeSlot || '19:30',
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
      let customerLookup = new Map<string, { name: string; email: string }>();
      try {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name, email');
        if (profiles) {
          for (const p of profiles) {
            customerLookup.set(p.id, {
              name: p.name || p.email?.split('@')[0] || 'Guest',
              email: p.email || '',
            });
          }
        }
      } catch {}

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const mapped: SeedFeedback[] = data.map((fb: any) => {
          const cust = customerLookup.get(fb.customer_id);
          const outletName = fb.outlet_name || fb.outlet || (
            fb.outlet_id === 'a1000000-0000-0000-0000-000000000002' ? 'Anna Nagar' :
            fb.outlet_id === 'a1000000-0000-0000-0000-000000000003' ? 'Egmore' :
            fb.outlet_id === 'a1000000-0000-0000-0000-000000000004' ? 'Palavakkam (ECR)' :
            'Poes Garden'
          );
          return {
            id: fb.id,
            customerId: fb.customer_id || '',
            customerName: cust?.name || fb.customer_name || fb.guest_name || 'Guest',
            email: cust?.email || fb.customer_email || fb.email || '',
            outlet: outletName,
            rating: fb.rating || 5,
            message: fb.comments || fb.comment || '',
            status: fb.status || 'New',
            createdAt: fb.created_at || new Date().toISOString(),
          };
        });
        return mapped.filter(f => canViewFeedback(actor, f));
      }
    } catch (err) {
      console.warn('SupabaseDataProvider.getFeedback note:', err);
    }
    return this.fallback.getFeedback(actor);
  }

  async submitFeedback(actor: UserProfile | null, payload: { outlet: string; rating: number; message: string; customerName?: string; email?: string; reservationId?: string }): Promise<SeedFeedback> {
    try {
      const lower = (payload.outlet || '').toLowerCase();
      let outletId = 'a1000000-0000-0000-0000-000000000001';
      if (lower.includes('anna')) outletId = 'a1000000-0000-0000-0000-000000000002';
      else if (lower.includes('egmore')) outletId = 'a1000000-0000-0000-0000-000000000003';
      else if (lower.includes('palavakkam') || lower.includes('ecr')) outletId = 'a1000000-0000-0000-0000-000000000004';

      const rowPayload: any = {
        customer_id: actor?.id || null,
        outlet_id: outletId,
        rating: payload.rating,
        comments: payload.customerName ? `[${payload.customerName}]: ${payload.message}` : payload.message,
        comment: payload.message,
        status: 'new',
      };
      if (payload.reservationId) rowPayload.reservation_id = payload.reservationId;

      const { data, error } = await supabase.from('feedback').insert(rowPayload).select().single();
      if (!error && data) {
        this.emit('feedback', data);
      }
    } catch {}
    return this.fallback.submitFeedback(actor as any, payload);
  }

  async updateFeedbackStatus(actor: UserProfile, feedbackId: string, status: string): Promise<SeedFeedback> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .update({ status: status.toLowerCase() } as any)
        .eq('id', feedbackId)
        .select()
        .single();
      if (!error && data) {
        this.emit('feedback', data);
      }
    } catch {}
    return this.fallback.updateFeedbackStatus(actor, feedbackId, status);
  }

  async getStaffMembers(actor: UserProfile): Promise<UserProfile[]> {
    if (!canViewStaffDirectory(actor)) throw new Error('Denied: Insufficient permission to view staff directory');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['SuperAdmin', 'Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant']);
      if (!error && data && data.length > 0) {
        return data
          .filter((u: any) => (u.role || '').toLowerCase() !== 'customer')
          .map((u: any) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Staff Member',
            phone: u.phone || u.mobile || '',
            email: u.email,
            rewardPoints: 500,
            tier: 'Green',
            role: u.role as UserRole,
            totalVisits: 0,
            joinedDate: '13 Sept 2026',
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
    try {
      const { data, error } = await supabase.from('franchise_enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
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
        documents: d.documents || [],
      }));
    } catch {
      return this.fallback.getFranchiseEnquiries(actor);
    }
  }

  async getMyFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]> {
    try {
      const { data, error } = await supabase.from('franchise_enquiries').select('*').eq('customer_id', actor.id).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
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
        documents: d.documents || [],
      }));
    } catch {
      return this.fallback.getMyFranchiseEnquiries(actor);
    }
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
      message: extraNotes || 'New franchise enquiry',
      customer_id: payload.customerId || null,
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
