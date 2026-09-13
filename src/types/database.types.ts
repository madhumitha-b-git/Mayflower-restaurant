export type UserRole =
  | 'super_admin'
  | 'owner_management'
  | 'admin'
  | 'manager'
  | 'chef'
  | 'hr'
  | 'accountant'
  | 'customer';

export type OutletStatus = 'draft' | 'published' | 'archived';
export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'blocked';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'escalated';
export type FranchiseStatus = 'new' | 'under_review' | 'contacted' | 'qualified' | 'closed';
export type FeedbackStatus = 'new' | 'reviewed' | 'flagged' | 'resolved';
export type IntegrationProvider = 'petpooja' | 'loyalty' | 'cctv';
export type IntegrationMode = 'mocked' | 'live';
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type MenuAvailability = 'available' | 'unavailable' | 'seasonal';
export type ProfileStatus = 'active' | 'invited' | 'disabled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          status: ProfileStatus;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_outlets: {
        Row: {
          user_id: string;
          outlet_id: string;
        };
        Insert: {
          user_id: string;
          outlet_id: string;
        };
        Update: {
          user_id?: string;
          outlet_id?: string;
        };
      };
      outlets: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: OutletStatus;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          operating_hours: Record<string, unknown>;
          amenities: string[];
          description: string | null;
          hero_image_url: string | null;
          geo_lat: number | null;
          geo_lng: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: OutletStatus;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          operating_hours?: Record<string, unknown>;
          amenities?: string[];
          description?: string | null;
          hero_image_url?: string | null;
          geo_lat?: number | null;
          geo_lng?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: OutletStatus;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          operating_hours?: Record<string, unknown>;
          amenities?: string[];
          description?: string | null;
          hero_image_url?: string | null;
          geo_lat?: number | null;
          geo_lng?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      floors: {
        Row: {
          id: string;
          outlet_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          outlet_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          outlet_id: string;
          floor_id: string;
          code: string;
          seating_capacity: number;
          status: TableStatus;
          position_x: number | null;
          position_y: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          floor_id: string;
          code: string;
          seating_capacity: number;
          status?: TableStatus;
          position_x?: number | null;
          position_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          outlet_id?: string;
          floor_id?: string;
          code?: string;
          seating_capacity?: number;
          status?: TableStatus;
          position_x?: number | null;
          position_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          outlet_id: string | null;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          outlet_id?: string | null;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          outlet_id?: string | null;
          name?: string;
          sort_order?: number;
        };
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          availability: MenuAvailability;
          sort_order: number;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          availability?: MenuAvailability;
          sort_order?: number;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          availability?: MenuAvailability;
          sort_order?: number;
        };
      };
      reservations: {
        Row: {
          id: string;
          customer_id: string;
          outlet_id: string;
          table_id: string | null;
          reservation_date: string;
          reservation_time: string;
          party_size: number;
          status: ReservationStatus;
          special_requests: string | null;
          cancelled_reason: string | null;
          confirmed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          outlet_id: string;
          table_id?: string | null;
          reservation_date: string;
          reservation_time: string;
          party_size: number;
          status?: ReservationStatus;
          special_requests?: string | null;
          cancelled_reason?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          outlet_id?: string;
          table_id?: string | null;
          reservation_date?: string;
          reservation_time?: string;
          party_size?: number;
          status?: ReservationStatus;
          special_requests?: string | null;
          cancelled_reason?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sop_categories: {
        Row: {
          id: string;
          key: string;
          name: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
        };
      };
      sops: {
        Row: {
          id: string;
          outlet_id: string | null;
          category_id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outlet_id?: string | null;
          category_id: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          outlet_id?: string | null;
          category_id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      checklists: {
        Row: {
          id: string;
          outlet_id: string;
          sop_id: string | null;
          name: string;
          assigned_role: UserRole | null;
          assigned_user_id: string | null;
          scheduled_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          outlet_id: string;
          sop_id?: string | null;
          name: string;
          assigned_role?: UserRole | null;
          assigned_user_id?: string | null;
          scheduled_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          outlet_id?: string;
          sop_id?: string | null;
          name?: string;
          assigned_role?: UserRole | null;
          assigned_user_id?: string | null;
          scheduled_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      checklist_tasks: {
        Row: {
          id: string;
          checklist_id: string;
          name: string;
          priority: TaskPriority;
          status: TaskStatus;
          due_at: string | null;
          completed_at: string | null;
          completed_by: string | null;
          remarks: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          name: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_at?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          remarks?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          name?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_at?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          remarks?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      task_evidence: {
        Row: {
          id: string;
          task_id: string;
          storage_path: string;
          file_type: string;
          uploaded_by: string | null;
          geo_lat: number | null;
          geo_lng: number | null;
          captured_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          storage_path: string;
          file_type: string;
          uploaded_by?: string | null;
          geo_lat?: number | null;
          geo_lng?: number | null;
          captured_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          storage_path?: string;
          file_type?: string;
          uploaded_by?: string | null;
          geo_lat?: number | null;
          geo_lng?: number | null;
          captured_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          customer_id: string | null;
          outlet_id: string;
          reservation_id: string | null;
          rating: number;
          comments: string | null;
          status: FeedbackStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          outlet_id: string;
          reservation_id?: string | null;
          rating: number;
          comments?: string | null;
          status?: FeedbackStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          outlet_id?: string;
          reservation_id?: string | null;
          rating?: number;
          comments?: string | null;
          status?: FeedbackStatus;
          created_at?: string;
        };
      };
      franchise_enquiries: {
        Row: {
          id: string;
          applicant_name: string;
          email: string;
          phone: string | null;
          city_interested: string | null;
          message: string | null;
          status: FranchiseStatus;
          internal_notes: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          applicant_name: string;
          email: string;
          phone?: string | null;
          city_interested?: string | null;
          message?: string | null;
          status?: FranchiseStatus;
          internal_notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          applicant_name?: string;
          email?: string;
          phone?: string | null;
          city_interested?: string | null;
          message?: string | null;
          status?: FranchiseStatus;
          internal_notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      franchise_documents: {
        Row: {
          id: string;
          enquiry_id: string;
          storage_path: string;
          file_name: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          storage_path: string;
          file_name: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          enquiry_id?: string;
          storage_path?: string;
          file_name?: string;
          uploaded_at?: string;
        };
      };
      integration_configs: {
        Row: {
          id: string;
          provider: IntegrationProvider;
          outlet_id: string | null;
          mode: IntegrationMode;
          config: Record<string, unknown>;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: IntegrationProvider;
          outlet_id?: string | null;
          mode?: IntegrationMode;
          config?: Record<string, unknown>;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: IntegrationProvider;
          outlet_id?: string | null;
          mode?: IntegrationMode;
          config?: Record<string, unknown>;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: string;
          payload: Record<string, unknown>;
          channel: NotificationChannel;
          status: NotificationStatus;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: string;
          payload?: Record<string, unknown>;
          channel?: NotificationChannel;
          status?: NotificationStatus;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          type?: string;
          payload?: Record<string, unknown>;
          channel?: NotificationChannel;
          status?: NotificationStatus;
          created_at?: string;
          sent_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          outlet_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          outlet_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          outlet_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      outlet_status: OutletStatus;
      table_status: TableStatus;
      reservation_status: ReservationStatus;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      franchise_status: FranchiseStatus;
      feedback_status: FeedbackStatus;
      integration_provider: IntegrationProvider;
      integration_mode: IntegrationMode;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      menu_availability: MenuAvailability;
      profile_status: ProfileStatus;
    };
  };
}
