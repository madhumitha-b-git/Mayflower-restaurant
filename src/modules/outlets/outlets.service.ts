import { supabase } from '../../lib/supabase';
import type { Database, OutletStatus, TableStatus } from '../../types/database.types';

export type OutletRow = Database['public']['Tables']['outlets']['Row'];
export type OutletInsert = Database['public']['Tables']['outlets']['Insert'];
export type OutletUpdate = Database['public']['Tables']['outlets']['Update'];

export type FloorRow = Database['public']['Tables']['floors']['Row'];
export type FloorInsert = Database['public']['Tables']['floors']['Insert'];

export type TableRow = Database['public']['Tables']['tables']['Row'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];

/**
 * Valid Outlet status transitions:
 * draft -> published -> archived
 */
export const VALID_OUTLET_TRANSITIONS: Record<OutletStatus, OutletStatus[]> = {
  draft: ['published', 'archived'],
  published: ['archived'],
  archived: [],
};

/**
 * Valid Table status transitions:
 * available ⇄ reserved ⇄ occupied ⇄ cleaning ⇄ blocked
 */
export const VALID_TABLE_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  available: ['reserved', 'occupied', 'blocked'],
  reserved: ['occupied', 'available', 'blocked'],
  occupied: ['cleaning', 'available'],
  cleaning: ['available', 'blocked'],
  blocked: ['available', 'cleaning'],
};

export class OutletsService {
  /**
   * Validate outlet status transition rules before invocation
   */
  static isValidOutletTransition(current: OutletStatus, next: OutletStatus): boolean {
    if (current === next) return true;
    return VALID_OUTLET_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Validate table status transition rules before invocation
   */
  static isValidTableTransition(current: TableStatus, next: TableStatus): boolean {
    if (current === next) return true;
    return VALID_TABLE_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Fetch all published outlets (or all outlets if user is authorized)
   */
  static async getOutlets(): Promise<{ data: OutletRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('outlets')
      .select('*')
      .order('name', { ascending: true });

    return { data: data as OutletRow[] | null, error };
  }

  /**
   * Fetch a single outlet by ID
   */
  static async getOutletById(id: string): Promise<{ data: OutletRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('outlets')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as OutletRow | null, error };
  }

  /**
   * Create a new outlet in 'draft' status
   */
  static async createOutlet(payload: OutletInsert): Promise<{ data: OutletRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('outlets')
      .insert({ ...payload, status: payload.status || 'draft' } as never)
      .select()
      .single();

    return { data: data as OutletRow | null, error };
  }

  /**
   * Update outlet status with transition validation
   */
  static async updateOutletStatus(
    id: string,
    currentStatus: OutletStatus,
    newStatus: OutletStatus
  ): Promise<{ data: OutletRow | null; error: Error | null }> {
    if (!this.isValidOutletTransition(currentStatus, newStatus)) {
      return {
        data: null,
        error: new Error(`Invalid outlet status transition from ${currentStatus} to ${newStatus}`),
      };
    }

    const { data, error } = await supabase
      .from('outlets')
      .update({ status: newStatus, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single();

    return { data: data as OutletRow | null, error };
  }

  /**
   * Get all floors for an outlet
   */
  static async getFloorsByOutlet(outletId: string): Promise<{ data: FloorRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('floors')
      .select('*')
      .eq('outlet_id', outletId)
      .order('sort_order', { ascending: true });

    return { data: data as FloorRow[] | null, error };
  }

  /**
   * Create a new floor
   */
  static async createFloor(payload: FloorInsert): Promise<{ data: FloorRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('floors')
      .insert(payload as never)
      .select()
      .single();

    return { data: data as FloorRow | null, error };
  }

  /**
   * Get all tables for an outlet
   */
  static async getTablesByOutlet(outletId: string): Promise<{ data: TableRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('outlet_id', outletId)
      .order('code', { ascending: true });

    return { data: data as TableRow[] | null, error };
  }

  /**
   * Create a new table
   */
  static async createTable(payload: TableInsert): Promise<{ data: TableRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('tables')
      .insert(payload as never)
      .select()
      .single();

    return { data: data as TableRow | null, error };
  }

  /**
   * Update table status with transition guard check
   */
  static async updateTableStatus(
    tableId: string,
    currentStatus: TableStatus,
    newStatus: TableStatus
  ): Promise<{ data: TableRow | null; error: Error | null }> {
    if (!this.isValidTableTransition(currentStatus, newStatus)) {
      return {
        data: null,
        error: new Error(`Invalid table status transition from ${currentStatus} to ${newStatus}`),
      };
    }

    const { data, error } = await supabase
      .from('tables')
      .update({ status: newStatus, updated_at: new Date().toISOString() } as never)
      .eq('id', tableId)
      .select()
      .single();

    return { data: data as TableRow | null, error };
  }
}
