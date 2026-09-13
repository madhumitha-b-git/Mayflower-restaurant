-- Mayflower Phase 6 Photo & Geo-Tagged Evidence Storage Migration
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §38 & DB Schema doc §6

-- 1. Register Private Storage Bucket for SOP Evidence
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sop-evidence',
  'sop-evidence',
  FALSE, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Objects RLS Policies for sop-evidence
CREATE POLICY "sop_evidence_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'sop-evidence' AND (
    owner = auth.uid() OR
    public.current_profile_role() IN ('super_admin', 'owner_management', 'admin', 'manager')
  )
);

CREATE POLICY "sop_evidence_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'sop-evidence' AND (
    owner = auth.uid() OR
    public.current_profile_role() IN ('super_admin', 'admin', 'manager', 'chef')
  )
);

CREATE POLICY "sop_evidence_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'sop-evidence' AND
  public.current_profile_role() IN ('super_admin', 'admin')
);
