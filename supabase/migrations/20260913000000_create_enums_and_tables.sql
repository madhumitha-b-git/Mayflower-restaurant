-- Mayflower Phase 1 Database Schema & Core Data Model Migration
-- Authoritative reference: Mayflower_02_Database_Schema_and_RLS_Design.md

-- 1. Create Enum Types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'owner_management',
  'admin',
  'manager',
  'chef',
  'hr',
  'accountant',
  'customer'
);

CREATE TYPE outlet_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE table_status AS ENUM ('available', 'reserved', 'occupied', 'cleaning', 'blocked');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'escalated');
CREATE TYPE franchise_status AS ENUM ('new', 'under_review', 'contacted', 'qualified', 'closed');
CREATE TYPE feedback_status AS ENUM ('new', 'reviewed', 'flagged', 'resolved');
CREATE TYPE integration_provider AS ENUM ('petpooja', 'loyalty', 'cctv');
CREATE TYPE integration_mode AS ENUM ('mocked', 'live');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'whatsapp');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE menu_availability AS ENUM ('available', 'unavailable', 'seasonal');
CREATE TYPE profile_status AS ENUM ('active', 'invited', 'disabled');

-- 2. Module A: Identity & Access
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  status profile_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE user_outlets (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL,
  PRIMARY KEY (user_id, outlet_id)
);

ALTER TABLE user_outlets ENABLE ROW LEVEL SECURITY;

-- 3. Module B: Outlets, Floors & Tables
CREATE TABLE outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status outlet_status NOT NULL DEFAULT 'draft',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'IN',
  phone TEXT,
  email TEXT,
  operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  amenities TEXT[] DEFAULT '{}'::text[],
  description TEXT,
  hero_image_url TEXT,
  geo_lat NUMERIC,
  geo_lng NUMERIC,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

-- Add foreign key back to outlets in user_outlets
ALTER TABLE user_outlets ADD CONSTRAINT fk_user_outlets_outlet FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;

CREATE TABLE floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE floors ENABLE ROW LEVEL SECURITY;

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
  status table_status NOT NULL DEFAULT 'available',
  position_x NUMERIC,
  position_y NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (outlet_id, code)
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- 4. Module C: Menu
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  availability menu_availability NOT NULL DEFAULT 'available',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 5. Module D: Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INT NOT NULL CHECK (party_size > 0),
  status reservation_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  cancelled_reason TEXT,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 6. Module E: Operations (SOPs, Checklists, Tasks, Evidence)
CREATE TABLE sop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

ALTER TABLE sop_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES sop_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sops ENABLE ROW LEVEL SECURITY;

CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  sop_id UUID REFERENCES sops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  assigned_role user_role,
  assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE TABLE checklist_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  remarks TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE checklist_tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE task_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES checklist_tasks(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  geo_lat NUMERIC,
  geo_lng NUMERIC,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE task_evidence ENABLE ROW LEVEL SECURITY;

-- 7. Module F: Feedback & Franchise
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  status feedback_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE TABLE franchise_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city_interested TEXT,
  message TEXT,
  status franchise_status NOT NULL DEFAULT 'new',
  internal_notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE franchise_enquiries ENABLE ROW LEVEL SECURITY;

CREATE TABLE franchise_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES franchise_enquiries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE franchise_documents ENABLE ROW LEVEL SECURITY;

-- 8. Module G: Integrations
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider integration_provider NOT NULL,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  mode integration_mode NOT NULL DEFAULT 'mocked',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, outlet_id)
);

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

-- 9. Module H: Notifications & Audit
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  status notification_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 10. Performance Indexes (§7)
CREATE INDEX idx_reservations_outlet_date_table ON reservations (outlet_id, reservation_date, table_id);
CREATE INDEX idx_checklist_tasks_status_due ON checklist_tasks (status, due_at);
CREATE INDEX idx_tables_outlet_status ON tables (outlet_id, status);
