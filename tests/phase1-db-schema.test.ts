import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 1 — Database Schema & Core Data Model', () => {
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20260913000000_create_enums_and_tables.sql'
  );
  const seedPath = path.join(__dirname, '../supabase/seed.sql');

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const expectedTables = [
    'profiles',
    'user_outlets',
    'outlets',
    'floors',
    'tables',
    'menu_categories',
    'menu_items',
    'reservations',
    'sop_categories',
    'sops',
    'checklists',
    'checklist_tasks',
    'task_evidence',
    'feedback',
    'franchise_enquiries',
    'franchise_documents',
    'integration_configs',
    'notifications',
    'audit_logs',
  ];

  const expectedEnums = [
    'user_role',
    'outlet_status',
    'table_status',
    'reservation_status',
    'task_priority',
    'task_status',
    'franchise_status',
    'feedback_status',
    'integration_provider',
    'integration_mode',
    'notification_channel',
    'notification_status',
    'menu_availability',
    'profile_status',
  ];

  it('creates all 14 required PostgreSQL ENUM types', () => {
    expectedEnums.forEach((enumName) => {
      expect(migrationSql).toMatch(new RegExp(`CREATE TYPE ${enumName} AS ENUM`, 'i'));
    });
  });

  it('creates all 19 core database tables', () => {
    expectedTables.forEach((tableName) => {
      expect(migrationSql).toMatch(new RegExp(`CREATE TABLE ${tableName}`, 'i'));
    });
  });

  it('enforces ROW LEVEL SECURITY on 100% of created tables', () => {
    expectedTables.forEach((tableName) => {
      const rlsPattern = new RegExp(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(migrationSql).toMatch(rlsPattern);
    });
  });

  it('seeds The Mayflower, Chennai flagship outlet with correct operational details', () => {
    expect(seedSql).toContain('The Mayflower, Chennai');
    expect(seedSql).toContain('chennai-flagship');
    expect(seedSql).toContain('WiFi');
    expect(seedSql).toContain('High Chair Available');
    expect(seedSql).toContain('07:30'); // Weekend early opening
    expect(seedSql).toContain('23:00');
  });

  it('seeds standard SOP categories', () => {
    expect(seedSql).toContain('opening');
    expect(seedSql).toContain('closing');
    expect(seedSql).toContain('kitchen');
    expect(seedSql).toContain('floor');
    expect(seedSql).toContain('hygiene');
  });
});
