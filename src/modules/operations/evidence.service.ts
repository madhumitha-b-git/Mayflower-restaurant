import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

export type TaskEvidenceRow = Database['public']['Tables']['task_evidence']['Row'];
export type TaskEvidenceInsert = Database['public']['Tables']['task_evidence']['Insert'];

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EVIDENCE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export interface EvidenceUploadOptions {
  taskId: string;
  file: File;
  uploadedBy?: string;
  geoLat?: number | null;
  geoLng?: number | null;
}

export class EvidenceService {
  /**
   * Server-side file type and size validation
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_EVIDENCE_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Disallowed file format: ${file.type}. Only JPEG, PNG, WEBP, and HEIC images are allowed.`,
      };
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds the 10MB limit (File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      };
    }

    return { isValid: true };
  }

  /**
   * Upload evidence image to private Storage bucket and record metadata row
   */
  static async uploadTaskEvidence(
    options: EvidenceUploadOptions
  ): Promise<{ data: TaskEvidenceRow | null; error: Error | null }> {
    const fileValidation = this.validateFile(options.file);
    if (!fileValidation.isValid) {
      return { data: null, error: new Error(fileValidation.error) };
    }

    const fileExt = options.file.name.split('.').pop() || 'jpg';
    const storagePath = `tasks/${options.taskId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // 1. Upload to private Supabase storage bucket
    const { error: storageError } = await supabase.storage
      .from('sop-evidence')
      .upload(storagePath, options.file, {
        contentType: options.file.type,
        upsert: false,
      });

    if (storageError) {
      return { data: null, error: storageError };
    }

    // 2. Record metadata entry in task_evidence table
    const evidencePayload: TaskEvidenceInsert = {
      task_id: options.taskId,
      storage_path: storagePath,
      file_type: options.file.type,
      uploaded_by: options.uploadedBy,
      geo_lat: options.geoLat ?? null,
      geo_lng: options.geoLng ?? null,
    };

    const { data: recordData, error: recordError } = await supabase
      .from('task_evidence')
      .insert(evidencePayload as never)
      .select()
      .single();

    if (recordError) {
      return { data: null, error: recordError };
    }

    return { data: recordData as TaskEvidenceRow | null, error: null };
  }

  /**
   * Generate signed URL for private evidence viewing (restricted access)
   */
  static async getSignedEvidenceUrl(
    storagePath: string,
    expiresInSeconds = 3600
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    const { data, error } = await supabase.storage
      .from('sop-evidence')
      .createSignedUrl(storagePath, expiresInSeconds);

    return { signedUrl: data?.signedUrl || null, error };
  }

  /**
   * Fetch all evidence metadata records for a task
   */
  static async getEvidenceByTask(
    taskId: string
  ): Promise<{ data: TaskEvidenceRow[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('task_evidence')
      .select('*')
      .eq('task_id', taskId)
      .order('captured_at', { ascending: false });

    return { data: data as TaskEvidenceRow[] | null, error };
  }
}
