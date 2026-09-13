-- Mayflower Phase 1 Seed Data
-- Fixture Data: The Mayflower, Chennai Flagship Outlet

-- 1. Seed SOP Categories
INSERT INTO sop_categories (key, name) VALUES
  ('opening', 'Opening Operations'),
  ('closing', 'Closing Operations'),
  ('kitchen', 'Kitchen & Food Safety'),
  ('floor', 'Floor & Guest Service'),
  ('hygiene', 'Sanitization & Hygiene'),
  ('equipment', 'Equipment Maintenance'),
  ('customer_service', 'Customer Experience'),
  ('quality_checks', 'Quality Assurance'),
  ('other', 'General Operations')
ON CONFLICT (key) DO NOTHING;

-- 2. Seed Flagship Outlet: The Mayflower, Chennai
INSERT INTO outlets (
  id,
  name,
  slug,
  status,
  address_line1,
  city,
  state,
  postal_code,
  country,
  phone,
  email,
  operating_hours,
  amenities,
  description
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'The Mayflower, Chennai',
  'chennai-flagship',
  'published',
  '123 Cathedral Road, Gopalapuram',
  'Chennai',
  'Tamil Nadu',
  '600086',
  'IN',
  '+91 44 2811 0000',
  'chennai@mayflowerrestaurant.com',
  '{
    "mon": {"open": "11:00", "close": "23:00"},
    "tue": {"open": "11:00", "close": "23:00"},
    "wed": {"open": "11:00", "close": "23:00"},
    "thu": {"open": "11:00", "close": "23:00"},
    "fri": {"open": "11:00", "close": "23:00"},
    "sat": {"open": "07:30", "close": "23:00"},
    "sun": {"open": "07:30", "close": "23:00"}
  }'::jsonb,
  ARRAY['WiFi', 'High Chair Available'],
  'Traditional-meets-innovation dining; warm lighting, tasteful decor, cozy-yet-refined ambiance.'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Floors & Tables for Chennai Flagship
INSERT INTO floors (id, outlet_id, name, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Main Dining Hall', 1),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Mezzanine & Terrace', 2)
ON CONFLICT DO NOTHING;

INSERT INTO tables (outlet_id, floor_id, code, seating_capacity, status, position_x, position_y) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'T01', 2, 'available', 10, 10),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'T02', 4, 'available', 25, 10),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'T03', 6, 'reserved', 40, 10),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'TR01', 4, 'available', 10, 30)
ON CONFLICT (outlet_id, code) DO NOTHING;

-- 4. Seed Menu Categories & Items
INSERT INTO menu_categories (id, outlet_id, name, sort_order) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Starters & Appetizers', 1),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Signature Mains', 2)
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, availability, sort_order) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Truffle Mushroom Arancini', 'Crispy risotto balls infused with truffle and served with garlic aioli', 450.00, 'available', 1),
  ('55555555-5555-5555-5555-555555555555', 'Mayflower Herb Crusted Lamb', 'Slow roasted lamb chops served with pomme purée and rosemary reduction', 1250.00, 'available', 1)
ON CONFLICT DO NOTHING;
