-- Mayflower Phase 7 Feedback & Franchise Module Backend Migration
-- Authoritative reference: Mayflower_01_Master_Project_Brief.md §16 & DB Schema doc §6

-- 1. Franchise Status Transition Guard Trigger
CREATE OR REPLACE FUNCTION public.check_franchise_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF (OLD.status = 'new' AND NEW.status IN ('under_review', 'closed')) OR
     (OLD.status = 'under_review' AND NEW.status IN ('contacted', 'closed')) OR
     (OLD.status = 'contacted' AND NEW.status IN ('qualified', 'closed')) OR
     (OLD.status = 'qualified' AND NEW.status = 'closed') THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid franchise status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_franchise_status_guard ON public.franchise_enquiries;

CREATE TRIGGER trg_franchise_status_guard
  BEFORE UPDATE OF status ON public.franchise_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.check_franchise_status_transition();

-- 2. Register Private Storage Bucket for Franchise Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'franchise-documents',
  'franchise-documents',
  FALSE, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage Objects RLS Policies for franchise-documents
CREATE POLICY "franchise_documents_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'franchise-documents' -- Public/anonymous document upload permitted
);

CREATE POLICY "franchise_documents_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'franchise-documents' AND
  public.current_profile_role() IN ('super_admin', 'owner_management', 'admin')
);

CREATE POLICY "franchise_documents_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'franchise-documents' AND
  public.current_profile_role() IN ('super_admin', 'admin')
);
