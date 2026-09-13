import { supabase } from '../../lib/supabase';
import type { Database, NotificationChannel, NotificationStatus } from '../../types/database.types';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export class NotificationsService {
  /**
   * Queue a new notification row into notifications queue table
   */
  static async queueNotification(payload: {
    recipientId: string;
    type: string;
    payloadData: Record<string, unknown>;
    channel?: NotificationChannel;
  }): Promise<{ data: NotificationRow | null; error: Error | null }> {
    const notificationPayload: NotificationInsert = {
      recipient_id: payload.recipientId,
      type: payload.type,
      payload: payload.payloadData,
      channel: payload.channel || 'in_app',
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationPayload as never)
      .select()
      .single();

    return { data: data as NotificationRow | null, error };
  }

  /**
   * Fetch in-app notifications for user
   */
  static async getUserNotifications(
    recipientId: string
  ): Promise<{ data: NotificationRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    return { data: data as NotificationRow[] | null, error };
  }

  /**
   * Mark notification status (e.g. sent, failed)
   */
  static async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus
  ): Promise<{ data: NotificationRow | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      } as never)
      .eq('id', notificationId)
      .select()
      .single();

    return { data: data as NotificationRow | null, error };
  }

  /**
   * Fetch audit logs (management & admin view)
   */
  static async getAuditLogs(filters?: {
    outletId?: string;
    entityType?: string;
    limit?: number;
  }): Promise<{ data: AuditLogRow[] | null; error: Error | null }> {
    let query = supabase.from('audit_logs').select('*');

    if (filters?.outletId) {
      query = query.eq('outlet_id', filters.outletId);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 50);

    return { data: data as AuditLogRow[] | null, error };
  }
}
