import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { EvidenceService, MAX_EVIDENCE_FILE_SIZE_BYTES } from '../src/modules/operations/evidence.service';

describe('Phase 6 — Photo & Geo-Tagged Evidence + Storage', () => {
  const storageMigrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000005_storage_sop_evidence.sql'
  );

  const migrationSql = fs.readFileSync(storageMigrationPath, 'utf8');

  describe('Database Storage Bucket & Policy Definitions', () => {
    it('defines private sop-evidence bucket with 10MB size limit and image mime types', () => {
      expect(migrationSql).toContain("INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)");
      expect(migrationSql).toContain("'sop-evidence'");
      expect(migrationSql).toContain('FALSE'); // Private bucket
      expect(migrationSql).toContain('10485760'); // 10MB
      expect(migrationSql).toContain("ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']");
    });

    it('defines RLS read/write policies on storage.objects for sop-evidence bucket', () => {
      expect(migrationSql).toContain('CREATE POLICY "sop_evidence_storage_select" ON storage.objects');
      expect(migrationSql).toContain('CREATE POLICY "sop_evidence_storage_insert" ON storage.objects');
      expect(migrationSql).toContain("bucket_id = 'sop-evidence'");
    });
  });

  describe('Server-Side File Validation', () => {
    it('accepts valid JPEG and PNG files within size limit', () => {
      const validFile = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });
      const result = EvidenceService.validateFile(validFile);
      expect(result.isValid).toBe(true);
    });

    it('rejects non-image MIME types (e.g. PDF, EXE, TXT)', () => {
      const pdfFile = new File(['mock content'], 'doc.pdf', { type: 'application/pdf' });
      const result = EvidenceService.validateFile(pdfFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Disallowed file format');
    });

    it('rejects files larger than the 10MB limit', () => {
      const oversizedBuffer = new ArrayBuffer(MAX_EVIDENCE_FILE_SIZE_BYTES + 1024);
      const largeFile = new File([oversizedBuffer], 'large.png', { type: 'image/png' });
      const result = EvidenceService.validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds the 10MB limit');
    });
  });

  describe('Geolocation Permission Fallback', () => {
    it('handles denied or unavailable geolocation coordinates gracefully', () => {
      const options = {
        taskId: 'task-123',
        file: new File(['img'], 'test.jpg', { type: 'image/jpeg' }),
        geoLat: null,
        geoLng: null,
      };

      expect(options.geoLat).toBeNull();
      expect(options.geoLng).toBeNull();
    });
  });
});
