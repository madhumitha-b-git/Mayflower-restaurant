import { DataProvider } from './DataProvider';
import { UserProfile, UserRole } from '../types';
import {
  MOCK_USERS, MOCK_OUTLETS, MOCK_RESERVATIONS,
  MOCK_TASKS, MOCK_FEEDBACK, MOCK_FRANCHISE_ENQUIRIES,
  MOCK_AUDIT_LOGS, SeedReservation, SeedTask, SeedFeedback,
  SeedFranchiseEnquiry, SeedAuditLog, SeedOutlet
} from './mockSeed';
import {
  canViewReservation, canManageReservation, canViewCustomerData,
  canViewFeedback, canViewFranchiseEnquiries,
  canAssignRole, canViewStaffDirectory, canViewAuditLogs,
  canUpdateTaskStatus
} from '../rbac/policies';

type EventCallback = (data: any) => void;

const STORAGE_KEY_PREFIX = 'mayflower_mock_db_v5_';

export class MockDataProvider implements DataProvider {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  private users: UserProfile[];
  private outlets: SeedOutlet[];
  private reservations: SeedReservation[];
  private tasks: SeedTask[];
  private feedback: SeedFeedback[];
  private franchiseEnquiries: SeedFranchiseEnquiry[];
  private auditLogs: SeedAuditLog[];

  constructor() {
    this.users = this.loadFromStorage('users', MOCK_USERS);
    this.outlets = this.loadFromStorage('outlets', MOCK_OUTLETS);
    this.reservations = this.loadFromStorage('reservations', MOCK_RESERVATIONS);
    this.tasks = this.loadFromStorage('tasks', MOCK_TASKS);
    this.feedback = this.loadFromStorage('feedback', MOCK_FEEDBACK);
    this.franchiseEnquiries = this.loadFromStorage('franchise', MOCK_FRANCHISE_ENQUIRIES);
    this.auditLogs = this.loadFromStorage('audit', MOCK_AUDIT_LOGS);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch {}
  }

  private emit(event: string, payload?: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => cb(payload));
    }
    const globalSet = this.listeners.get('*');
    if (globalSet) {
      globalSet.forEach(cb => cb({ event, payload }));
    }
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  private addAuditLog(actor: UserProfile, action: string, entityType: string, entityId: string, metadata?: Record<string, any>) {
    const newLog: SeedAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role || 'Customer',
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    this.saveToStorage('audit', this.auditLogs);
    this.emit('auditLogs', this.auditLogs);
  }

  async getReservations(actor: UserProfile): Promise<SeedReservation[]> {
    return this.reservations.filter(r => canViewReservation(actor, r));
  }

  async createReservation(actor: UserProfile, payload: Partial<SeedReservation>): Promise<SeedReservation> {
    const newRes: SeedReservation = {
      id: `res-${Date.now()}`,
      bookingCode: `MF-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: actor.id,
      customerName: actor.name || 'Mayflower Guest',
      email: actor.email,
      phone: actor.phone || '',
      outlet: payload.outlet || 'Poes Garden Flagship',
      date: payload.date || new Date().toLocaleDateString('en-IN'),
      timeSlot: payload.timeSlot || '19:30',
      guests: payload.guests || 2,
      seatingArea: payload.seatingArea || 'Main Dining',
      status: 'Confirmed',
      bookedAt: new Date().toLocaleDateString('en-IN'),
      specialRequests: payload.specialRequests || '',
    };

    this.reservations = [newRes, ...this.reservations];
    this.saveToStorage('reservations', this.reservations);
    this.addAuditLog(actor, 'RESERVATION_CREATED', 'Reservation', newRes.id, { bookingCode: newRes.bookingCode, outlet: newRes.outlet });
    this.emit('reservations', this.reservations);
    return newRes;
  }

  async updateReservationStatus(
    actor: UserProfile,
    reservationId: string,
    status: 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled'
  ): Promise<SeedReservation> {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    if (!canManageReservation(actor, res) && !(actor.id === res.customerId && status === 'Cancelled')) {
      throw new Error('Denied: Insufficient permission to manage reservation status');
    }

    res.status = status;
    this.saveToStorage('reservations', this.reservations);
    this.addAuditLog(actor, `RESERVATION_${status.toUpperCase()}`, 'Reservation', res.id, { oldStatus: res.status, newStatus: status });
    this.emit('reservations', this.reservations);
    return res;
  }

  async assignTable(actor: UserProfile, reservationId: string, tableId: string): Promise<SeedReservation> {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    if (!canManageReservation(actor, res)) {
      throw new Error('Denied: Insufficient permission to assign table');
    }

    res.assignedTable = tableId;
    res.status = 'Confirmed';
    this.saveToStorage('reservations', this.reservations);
    this.addAuditLog(actor, 'RESERVATION_TABLE_ASSIGNED', 'Reservation', res.id, { tableId });
    this.emit('reservations', this.reservations);
    return res;
  }

  async getFeedback(actor: UserProfile): Promise<SeedFeedback[]> {
    return this.feedback.filter(f => canViewFeedback(actor, f));
  }

  async submitFeedback(
    actor: UserProfile | null,
    payload: { outlet: string; rating: number; message: string; customerName?: string; email?: string; reservationId?: string }
  ): Promise<SeedFeedback> {
    const newFb: SeedFeedback = {
      id: `fb-${Date.now()}`,
      customerId: actor?.id || 'guest',
      customerName: payload.customerName || actor?.name || 'Guest',
      email: payload.email || actor?.email || '',
      outlet: payload.outlet,
      rating: payload.rating,
      message: payload.message,
      status: 'New',
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      reservationId: payload.reservationId,
    };

    this.feedback = [newFb, ...this.feedback];
    this.saveToStorage('feedback', this.feedback);
    if (actor) {
      this.addAuditLog(actor, 'FEEDBACK_SUBMITTED', 'Feedback', newFb.id, { outlet: newFb.outlet, rating: newFb.rating });
    }
    this.emit('feedback', this.feedback);
    return newFb;
  }

  async updateFeedbackStatus(actor: UserProfile, feedbackId: string, status: string): Promise<SeedFeedback> {
    const target = this.feedback.find(f => f.id === feedbackId);
    if (!target) throw new Error('Feedback not found');
    target.status = status as any;
    this.saveToStorage('feedback', this.feedback);
    if (actor) {
      this.addAuditLog(actor, 'FEEDBACK_UPDATED', 'Feedback', target.id, { status });
    }
    this.emit('feedback', this.feedback);
    return target;
  }

  async getStaffMembers(actor: UserProfile): Promise<UserProfile[]> {
    if (!canViewStaffDirectory(actor)) {
      throw new Error('Denied: Insufficient permission to view staff directory');
    }
    return this.users.filter(u => (u.role || '').toLowerCase() !== 'customer' && (u.role || '').toLowerCase() !== 'guest');
  }

  async assignRole(actor: UserProfile, targetUserId: string, newRole: UserRole): Promise<UserProfile> {
    if (!canAssignRole(actor, targetUserId, newRole)) {
      throw new Error('Denied: Only SuperAdmin can reassign user roles');
    }

    const targetUser = this.users.find(u => u.id === targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    const oldRole = targetUser.role || 'Customer';
    targetUser.role = newRole;
    this.saveToStorage('users', this.users);

    this.addAuditLog(actor, 'ROLE_ASSIGNMENT', 'UserProfile', targetUser.id, { oldRole, newRole, targetUserEmail: targetUser.email });
    this.emit('users', this.users);
    this.emit(`user:${targetUser.id}`, targetUser);
    return targetUser;
  }

  async getOutlets(_actor: UserProfile): Promise<SeedOutlet[]> {
    return this.outlets;
  }

  async getSOPsAndTasks(actor: UserProfile): Promise<SeedTask[]> {
    return this.tasks.filter(t => canUpdateTaskStatus(actor, t));
  }

  async updateTaskStatus(
    actor: UserProfile,
    taskId: string,
    status: 'Pending' | 'In Progress' | 'Completed' | 'Escalated',
    remarks?: string
  ): Promise<SeedTask> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (!canUpdateTaskStatus(actor, task)) {
      throw new Error('Denied: Insufficient permission to update task status');
    }

    task.status = status;
    if (remarks) task.remarks = remarks;
    if (status === 'Completed') {
      task.completedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      task.completedBy = actor.id;
    }

    this.saveToStorage('tasks', this.tasks);
    this.addAuditLog(actor, `TASK_${status.toUpperCase()}`, 'ChecklistTask', task.id, { title: task.title, status });
    this.emit('tasks', this.tasks);
    return task;
  }

  // Mock Evidence Store
  private taskEvidence: Array<{ id: string; taskId: string; storagePath: string; fileType: string; uploadedBy: string; geoLat?: number; geoLng?: number; capturedAt: string }> = [];

  async uploadTaskEvidence(actor: UserProfile, taskId: string, file: File, geoCoords?: { lat: number; lng: number }): Promise<{ id: string; storagePath: string; capturedAt: string }> {
    const evidence = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      storagePath: `mock/evidence/${taskId}/${file.name}`,
      fileType: file.type,
      uploadedBy: actor.id,
      geoLat: geoCoords?.lat,
      geoLng: geoCoords?.lng,
      capturedAt: new Date().toISOString()
    };
    this.taskEvidence.push(evidence);
    return {
      id: evidence.id,
      storagePath: evidence.storagePath,
      capturedAt: evidence.capturedAt
    };
  }

  async getTaskEvidence(_actor: UserProfile, taskId: string): Promise<Array<{ id: string; storagePath: string; fileType: string; uploadedBy: string; geoLat?: number; geoLng?: number; capturedAt: string }>> {
    return this.taskEvidence.filter(e => e.taskId === taskId);
  }

  async getFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]> {
    if (!canViewFranchiseEnquiries(actor)) {
      throw new Error('Denied: Only SuperAdmin, Owner, or Admin can view franchise enquiries');
    }
    return this.franchiseEnquiries;
  }

  async getMyFranchiseEnquiries(actor: UserProfile): Promise<SeedFranchiseEnquiry[]> {
    return this.franchiseEnquiries.filter(e => e.customerId === actor.id);
  }

  async updateFranchiseEnquiryStatus(actor: UserProfile, enquiryId: string, status: string, internalNotes?: string): Promise<SeedFranchiseEnquiry> {
    if (!canViewFranchiseEnquiries(actor)) {
      throw new Error('Denied: Only SuperAdmin, Owner, or Admin can update franchise enquiries');
    }
    const idx = this.franchiseEnquiries.findIndex(e => e.id === enquiryId);
    if (idx === -1) throw new Error('Enquiry not found');
    const updated = { ...this.franchiseEnquiries[idx], status: status as any, internalNotes: internalNotes ?? this.franchiseEnquiries[idx].internalNotes };
    this.franchiseEnquiries[idx] = updated;
    this.saveToStorage('franchise', this.franchiseEnquiries);
    this.emit('franchise', this.franchiseEnquiries);
    return updated;
  }

  async submitFranchiseEnquiry(payload: { applicantName: string; email: string; phone?: string; cityInterested?: string; message?: string; investmentBudget?: string; priorExperience?: boolean; customerId?: string }): Promise<SeedFranchiseEnquiry> {
    const newEnq: SeedFranchiseEnquiry = {
      id: `fr-${Date.now()}`,
      applicantName: payload.applicantName,
      email: payload.email,
      phone: payload.phone || '',
      cityInterested: payload.cityInterested || 'Chennai',
      message: payload.message || '',
      investmentBudget: payload.investmentBudget,
      priorExperience: payload.priorExperience,
      customerId: payload.customerId,
      status: 'New',
      documents: [],
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    this.franchiseEnquiries = [newEnq, ...this.franchiseEnquiries];
    this.saveToStorage('franchise', this.franchiseEnquiries);
    this.emit('franchise', this.franchiseEnquiries);
    return newEnq;
  }

  async uploadFranchiseDocuments(_actor: UserProfile, enquiryId: string, files: File[]): Promise<Array<{ id: string; fileName: string; storagePath: string }>> {
    const idx = this.franchiseEnquiries.findIndex(e => e.id === enquiryId);
    if (idx === -1) throw new Error('Enquiry not found');
    
    const docs = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      storagePath: `mock/franchise/${enquiryId}/${file.name}`,
      uploadedAt: new Date().toISOString()
    }));
    
    this.franchiseEnquiries[idx] = {
      ...this.franchiseEnquiries[idx],
      documents: [...(this.franchiseEnquiries[idx].documents || []), ...docs]
    };
    
    this.saveToStorage('franchise', this.franchiseEnquiries);
    this.emit('franchise', this.franchiseEnquiries);
    return docs;
  }

  async getFranchiseDocuments(_actor: UserProfile, enquiryId: string): Promise<Array<{ id: string; fileName: string; storagePath: string; uploadedAt: string }>> {
    const idx = this.franchiseEnquiries.findIndex(e => e.id === enquiryId);
    if (idx === -1) throw new Error('Enquiry not found');
    return this.franchiseEnquiries[idx].documents || [];
  }

  async getAuditLogs(actor: UserProfile): Promise<SeedAuditLog[]> {
    if (!canViewAuditLogs(actor)) {
      throw new Error('Denied: Insufficient permission to view audit logs');
    }
    return this.auditLogs;
  }

  async getLoyaltyBalance(actor: UserProfile): Promise<{ rewardPoints: number; tier: string; transactions: any[] }> {
    if (!canViewCustomerData(actor, actor.id)) {
      throw new Error('Denied: Cannot view another customer\'s loyalty balance');
    }
    const user = this.users.find(u => u.id === actor.id) || actor;
    return {
      rewardPoints: user.rewardPoints ?? 200,
      tier: user.tier ?? 'Green',
      transactions: user.transactions ?? [],
    };
  }
}
