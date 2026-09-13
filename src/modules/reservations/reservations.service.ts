import { supabase } from '../../lib/supabase';
import type { Database, ReservationStatus } from '../../types/database.types';

export type ReservationRow = Database['public']['Tables']['reservations']['Row'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];

export const VALID_RESERVATION_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  cancelled: [],
  completed: [],
  no_show: [],
};

export class ReservationsService {
  /**
   * Validate reservation status transition before invocation
   */
  static isValidStatusTransition(current: ReservationStatus, next: ReservationStatus): boolean {
    if (current === next) return true;
    return VALID_RESERVATION_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Validate input parameters for new reservation creation
   */
  static validateCreatePayload(payload: Partial<ReservationInsert>): { isValid: boolean; error?: string } {
    if (!payload.outlet_id) return { isValid: false, error: 'Outlet ID is required' };
    if (!payload.customer_id) return { isValid: false, error: 'Customer ID is required' };
    if (!payload.reservation_date) return { isValid: false, error: 'Reservation date is required' };
    if (!payload.reservation_time) return { isValid: false, error: 'Reservation time is required' };
    if (!payload.party_size || payload.party_size <= 0) {
      return { isValid: false, error: 'Party size must be greater than zero' };
    }

    const resDate = new Date(`${payload.reservation_date}T${payload.reservation_time}`);
    if (isNaN(resDate.getTime())) {
      return { isValid: false, error: 'Invalid reservation date/time format' };
    }

    return { isValid: true };
  }

  /**
   * Create a new reservation in 'pending' status
   */
  static async createReservation(payload: ReservationInsert): Promise<{ data: ReservationRow | null; error: Error | null }> {
    const validation = this.validateCreatePayload(payload);
    if (!validation.isValid) {
      return { data: null, error: new Error(validation.error) };
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({ ...payload, status: payload.status || 'pending' } as never)
      .select()
      .single();

    return { data: data as ReservationRow | null, error };
  }

  /**
   * Invoke atomic approve & table assignment RPC operation
   */
  static async approveAndAssignTable(
    reservationId: string,
    tableId: string,
    confirmedBy: string
  ): Promise<{ data: ReservationRow | null; error: Error | null }> {
    const { data, error } = await supabase.rpc('approve_and_assign_table', {
      p_reservation_id: reservationId,
      p_table_id: tableId,
      p_confirmed_by: confirmedBy,
    } as never);

    return { data: data as ReservationRow | null, error };
  }

  /**
   * Update reservation status (cancel, mark complete, mark no-show)
   */
  static async updateReservationStatus(
    reservationId: string,
    currentStatus: ReservationStatus,
    newStatus: ReservationStatus,
    cancelledReason?: string
  ): Promise<{ data: ReservationRow | null; error: Error | null }> {
    if (!this.isValidStatusTransition(currentStatus, newStatus)) {
      return {
        data: null,
        error: new Error(`Invalid reservation status transition from ${currentStatus} to ${newStatus}`),
      };
    }

    const updatePayload: Partial<ReservationUpdate> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'cancelled' && cancelledReason) {
      updatePayload.cancelled_reason = cancelledReason;
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updatePayload as never)
      .eq('id', reservationId)
      .select()
      .single();

    return { data: data as ReservationRow | null, error };
  }

  /**
   * Fetch reservations for an outlet with optional status/date filters
   */
  static async getReservationsByOutlet(
    outletId: string,
    filters?: { status?: ReservationStatus; date?: string }
  ): Promise<{ data: ReservationRow[] | null; error: Error | null }> {
    let query = supabase.from('reservations').select('*').eq('outlet_id', outletId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date) {
      query = query.eq('reservation_date', filters.date);
    }

    const { data, error } = await query.order('reservation_time', { ascending: true });
    return { data: data as ReservationRow[] | null, error };
  }

  /**
   * Fetch customer's own reservation history
   */
  static async getCustomerReservations(
    customerId: string
  ): Promise<{ data: ReservationRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', customerId)
      .order('reservation_date', { ascending: false });

    return { data: data as ReservationRow[] | null, error };
  }
}
