import { supabase } from '../../lib/supabase';
import type { Database, TaskStatus } from '../../types/database.types';

export type SopCategoryRow = Database['public']['Tables']['sop_categories']['Row'];

export type SopRow = Database['public']['Tables']['sops']['Row'];
export type SopInsert = Database['public']['Tables']['sops']['Insert'];

export type ChecklistRow = Database['public']['Tables']['checklists']['Row'];
export type ChecklistInsert = Database['public']['Tables']['checklists']['Insert'];

export type TaskRow = Database['public']['Tables']['checklist_tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['checklist_tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['checklist_tasks']['Update'];

export const VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ['in_progress', 'completed', 'escalated'],
  in_progress: ['completed', 'escalated'],
  completed: [],
  escalated: [],
};

export class OperationsService {
  /**
   * Validate task status transition before invocation
   */
  static isValidTaskTransition(current: TaskStatus, next: TaskStatus): boolean {
    if (current === next) return true;
    return VALID_TASK_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Fetch all SOP categories
   */
  static async getSopCategories(): Promise<{ data: SopCategoryRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('sop_categories')
      .select('*')
      .order('name', { ascending: true });

    return { data: data as SopCategoryRow[] | null, error };
  }

  /**
   * Fetch SOPs for an outlet (or global SOPs where outlet_id is null)
   */
  static async getSops(outletId?: string): Promise<{ data: SopRow[] | null; error: Error | null }> {
    let query = supabase.from('sops').select('*').eq('is_active', true);

    if (outletId) {
      query = query.or(`outlet_id.eq.${outletId},outlet_id.is.null`);
    } else {
      query = query.is('outlet_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as SopRow[] | null, error };
  }

  /**
   * Create a new SOP
   */
  static async createSop(payload: SopInsert): Promise<{ data: SopRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('sops')
      .insert(payload as never)
      .select()
      .single();

    return { data: data as SopRow | null, error };
  }

  /**
   * Fetch checklists for an outlet
   */
  static async getChecklists(outletId: string): Promise<{ data: ChecklistRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('outlet_id', outletId)
      .order('created_at', { ascending: false });

    return { data: data as ChecklistRow[] | null, error };
  }

  /**
   * Create a new checklist (assigned to a role or user)
   */
  static async createChecklist(payload: ChecklistInsert): Promise<{ data: ChecklistRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('checklists')
      .insert(payload as never)
      .select()
      .single();

    return { data: data as ChecklistRow | null, error };
  }

  /**
   * Fetch tasks for a checklist
   */
  static async getTasksByChecklist(checklistId: string): Promise<{ data: TaskRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('checklist_tasks')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('sort_order', { ascending: true });

    return { data: data as TaskRow[] | null, error };
  }

  /**
   * Create a new task within a checklist
   */
  static async createTask(payload: TaskInsert): Promise<{ data: TaskRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('checklist_tasks')
      .insert(payload as never)
      .select()
      .single();

    return { data: data as TaskRow | null, error };
  }

  /**
   * Update task status (e.g. Chef marking in_progress or completed)
   */
  static async updateTaskStatus(
    taskId: string,
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
    completedBy?: string,
    remarks?: string
  ): Promise<{ data: TaskRow | null; error: Error | null }> {
    if (!this.isValidTaskTransition(currentStatus, newStatus)) {
      return {
        data: null,
        error: new Error(`Invalid task status transition from ${currentStatus} to ${newStatus}`),
      };
    }

    const updatePayload: Partial<TaskUpdate> = {
      status: newStatus,
    };

    if (newStatus === 'completed') {
      updatePayload.completed_at = new Date().toISOString();
      if (completedBy) updatePayload.completed_by = completedBy;
    }

    if (remarks) {
      updatePayload.remarks = remarks;
    }

    const { data, error } = await supabase
      .from('checklist_tasks')
      .update(updatePayload as never)
      .eq('id', taskId)
      .select()
      .single();

    return { data: data as TaskRow | null, error };
  }

  /**
   * Run escalation check function against overdue tasks
   */
  static async runEscalationCheck(
    currentTime?: string
  ): Promise<{ escalatedCount: number | null; error: Error | null }> {
    const { data, error } = await supabase.rpc('check_and_escalate_overdue_tasks', {
      p_current_time: currentTime || new Date().toISOString(),
    } as never);

    return { escalatedCount: data as number | null, error };
  }
}
