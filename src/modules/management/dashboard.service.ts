import { supabase } from '../../lib/supabase';

export interface ReservationMetrics {
  outletId: string;
  outletName: string;
  pendingCount: number;
  todayConfirmedCount: number;
  noShowCount: number;
  totalPastBookings: number;
  noShowRatePct: number;
}

export interface TableUtilizationMetrics {
  outletId: string;
  outletName: string;
  totalTables: number;
  occupiedCount: number;
  reservedCount: number;
  availableCount: number;
  utilizationPct: number;
}

export interface OperationsMetrics {
  outletId: string;
  outletName: string;
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  escalatedCount: number;
  taskCompletionRatePct: number;
}

export interface FeedbackMetrics {
  outletId: string;
  outletName: string;
  totalFeedbackCount: number;
  averageRating: number;
  flaggedNegativeCount: number;
}

export interface FranchiseStatusMetrics {
  franchiseStatus: string;
  enquiryCount: number;
}

export interface OutletStatusMetrics {
  outletStatus: string;
  outletCount: number;
}

export class DashboardService {
  /**
   * Fetch reservation summary metrics per outlet
   */
  static async getReservationMetrics(
    outletId?: string
  ): Promise<{ data: ReservationMetrics[] | null; error: Error | null }> {
    let query = supabase.from('view_dashboard_reservations_summary').select('*');
    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    return { data: (data as unknown as ReservationMetrics[]) || null, error };
  }

  /**
   * Fetch table utilization metrics per outlet
   */
  static async getTableUtilizationMetrics(
    outletId?: string
  ): Promise<{ data: TableUtilizationMetrics[] | null; error: Error | null }> {
    let query = supabase.from('view_dashboard_table_utilization').select('*');
    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    return { data: (data as unknown as TableUtilizationMetrics[]) || null, error };
  }

  /**
   * Fetch operations summary metrics per outlet
   */
  static async getOperationsMetrics(
    outletId?: string
  ): Promise<{ data: OperationsMetrics[] | null; error: Error | null }> {
    let query = supabase.from('view_dashboard_operations_summary').select('*');
    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    return { data: (data as unknown as OperationsMetrics[]) || null, error };
  }

  /**
   * Fetch feedback summary metrics per outlet
   */
  static async getFeedbackMetrics(
    outletId?: string
  ): Promise<{ data: FeedbackMetrics[] | null; error: Error | null }> {
    let query = supabase.from('view_dashboard_feedback_summary').select('*');
    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    return { data: (data as unknown as FeedbackMetrics[]) || null, error };
  }

  /**
   * Fetch franchise lead pipeline metrics
   */
  static async getFranchiseMetrics(): Promise<{
    data: FranchiseStatusMetrics[] | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase.from('view_dashboard_franchise_summary').select('*');
    return { data: (data as unknown as FranchiseStatusMetrics[]) || null, error };
  }

  /**
   * Fetch active vs. draft outlet status count
   */
  static async getOutletStatusMetrics(): Promise<{
    data: OutletStatusMetrics[] | null;
    error: Error | null;
  }> {
    const { data, error } = await supabase.from('view_dashboard_outlet_status_summary').select('*');
    return { data: (data as unknown as OutletStatusMetrics[]) || null, error };
  }
}
