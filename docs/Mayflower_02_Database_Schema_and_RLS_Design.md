# Mayflower Phase 1 — Database Schema & RLS Design Reference

**This is the technical backbone of the backend-first build.** Give this file to the agent alongside the Master Project Brief for every backend phase (0–11). Treat it as a strong, implementation-ready draft — not gospel: the RBAC matrix in §5 explicitly needs client confirmation per the Master Brief §11, and the agent should flag rather than silently deviate.

---

## 1. Design Principles

1. **Constrain at the database, not just the app.** Use Postgres `ENUM` types, `CHECK` constraints, and foreign keys wherever possible. Application-layer validation is a UX nicety, not the security boundary.
2. **RLS default-deny.** Enable RLS on every table the moment it's created (Phase 1), even before real policies exist (Phase 2). A table with RLS enabled and zero policies denies all access — that's the correct intermediate state.
3. **Identity bridge:** Supabase's `auth.users` table is managed by Supabase Auth and shouldn't be extended directly. Use a `profiles` table (1:1 with `auth.users.id`) to carry role, contact info, and status.
4. **Outlet scoping via a join table** (`user_outlets`) for roles whose access is limited to specific outlets (Manager, Chef, and optionally Admin/HR/Accountant). Super Admin and Owner/Management bypass outlet scoping entirely via a role check.
5. **State machines are guarded in the database**, not just the UI — via `CHECK` constraints for simple cases or trigger/RPC functions for anything with side effects (e.g., a reservation being confirmed should also be capable of assigning a table in the same transaction).
6. **Conventions:** all primary keys `uuid default gen_random_uuid()`; all timestamps `timestamptz`; `created_at`/`updated_at` on every table; money as `numeric(10,2)`.
7. **Dashboards read through views/RPC functions**, not ad-hoc client-side aggregation, so the metric logic exists in exactly one place and can be unit tested.

---

## 2. Enum Types

```sql
create type user_role as enum (
  'super_admin','owner_management','admin','manager','chef','hr','accountant','customer'
);
create type outlet_status as enum ('draft','published','archived');
create type table_status as enum ('available','reserved','occupied','cleaning','blocked');
create type reservation_status as enum ('pending','confirmed','cancelled','completed','no_show');
create type task_priority as enum ('low','medium','high','critical');
create type task_status as enum ('pending','in_progress','completed','escalated');
create type franchise_status as enum ('new','under_review','contacted','qualified','closed');
create type feedback_status as enum ('new','reviewed','flagged','resolved');
create type integration_provider as enum ('petpooja','loyalty','cctv');
create type integration_mode as enum ('mocked','live');
create type notification_channel as enum ('in_app','email','sms','whatsapp');
create type notification_status as enum ('pending','sent','failed');
create type menu_availability as enum ('available','unavailable','seasonal');
create type profile_status as enum ('active','invited','disabled');
```

**Design note on roles:** the scope document lists "Roles" as a distinct entity, which could imply a dynamic `roles` table. For Phase 1, the role set is fixed at 8 — using a Postgres `ENUM` on `profiles.role` is simpler, faster to check inside RLS policies, and fully sufficient. If a future phase needs admin-configurable custom roles, that's a schema migration (enum → table + join table), not a Phase 1 requirement — don't over-build for it now.

---

## 3. Table Catalog (grouped by module)

### A. Identity & Access

**`profiles`** (extends `auth.users`)
- `id uuid PK references auth.users(id) on delete cascade`
- `email text not null`
- `full_name text`
- `phone text`
- `role user_role not null default 'customer'`
- `status profile_status not null default 'active'`
- `avatar_url text`
- `created_at`, `updated_at`

**`user_outlets`** — outlet scoping for non-global roles
- `user_id uuid FK profiles`
- `outlet_id uuid FK outlets`
- PK `(user_id, outlet_id)`

### B. Outlets, Floors & Tables

**`outlets`**
- `id`, `name text not null`, `slug text unique not null`
- `status outlet_status not null default 'draft'`
- `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country default 'IN'`
- `phone`, `email`
- `operating_hours jsonb not null default '{}'` — keyed by day, e.g. `{"mon":{"open":"11:00","close":"23:00"}, "sat":{"open":"07:30","close":"23:00"}}`
- `amenities text[] default '{}'`
- `description text`, `hero_image_url text`
- `geo_lat numeric`, `geo_lng numeric`
- `created_by uuid FK profiles`, `created_at`, `updated_at`

**`floors`**
- `id`, `outlet_id FK outlets`, `name text not null`, `sort_order int default 0`, `created_at`

**`tables`**
- `id`, `outlet_id FK outlets`, `floor_id FK floors`
- `code text not null` (table number/name)
- `seating_capacity int not null check (seating_capacity > 0)`
- `status table_status not null default 'available'`
- `position_x numeric`, `position_y numeric` (for the floor map)
- `created_at`, `updated_at`
- unique `(outlet_id, code)`

### C. Menu

**`menu_categories`**
- `id`, `outlet_id FK outlets nullable` (null = applies to all outlets), `name text not null`, `sort_order int default 0`

**`menu_items`**
- `id`, `category_id FK menu_categories`
- `name text not null`, `description text`, `price numeric(10,2) not null check (price >= 0)`
- `image_url text`
- `availability menu_availability not null default 'available'`
- `sort_order int default 0`

### D. Reservations

**`reservations`**
- `id`, `customer_id FK profiles`, `outlet_id FK outlets`, `table_id FK tables nullable`
- `reservation_date date not null`, `reservation_time time not null`
- `party_size int not null check (party_size > 0)`
- `status reservation_status not null default 'pending'`
- `special_requests text`, `cancelled_reason text`
- `confirmed_by uuid FK profiles nullable`
- `created_at`, `updated_at`
- Index on `(outlet_id, reservation_date, table_id)` to support overlap/double-booking checks.

### E. Operations (SOPs, Checklists, Tasks, Evidence)

**`sop_categories`** — seed: opening, closing, kitchen, floor, hygiene, equipment, customer_service, quality_checks, other
- `id`, `key text unique`, `name text`

**`sops`**
- `id`, `outlet_id FK outlets nullable` (null = applies to all outlets), `category_id FK sop_categories`
- `title text not null`, `description text`, `is_active bool default true`
- `created_by uuid FK profiles`, `created_at`, `updated_at`

**`checklists`**
- `id`, `outlet_id FK outlets`, `sop_id FK sops nullable`
- `name text not null`
- `assigned_role user_role nullable`, `assigned_user_id uuid FK profiles nullable`
- `scheduled_date date`
- `created_by uuid FK profiles`, `created_at`

**`checklist_tasks`**
- `id`, `checklist_id FK checklists`
- `name text not null`
- `priority task_priority not null default 'medium'`
- `status task_status not null default 'pending'`
- `due_at timestamptz`
- `completed_at timestamptz`, `completed_by uuid FK profiles`
- `remarks text`, `sort_order int default 0`, `created_at`

**`task_evidence`**
- `id`, `task_id FK checklist_tasks`
- `storage_path text not null` (Supabase Storage object path, not a public URL)
- `file_type text not null`
- `uploaded_by uuid FK profiles`
- `geo_lat numeric`, `geo_lng numeric` (nullable — permission may be denied)
- `captured_at timestamptz default now()`

### F. Feedback & Franchise

**`feedback`**
- `id`, `customer_id FK profiles nullable` (nullable to allow non-account feedback if the client wants it later — confirm; default assumption is customer must be logged in), `outlet_id FK outlets`, `reservation_id FK reservations nullable`
- `rating int not null check (rating between 1 and 5)`
- `comments text`
- `status feedback_status not null default 'new'`
- `created_at`

**`franchise_enquiries`**
- `id`, `applicant_name text not null`, `email text not null`, `phone text`
- `city_interested text`, `message text`
- `status franchise_status not null default 'new'`
- `internal_notes text` — **staff-only, never exposed to the applicant**
- `assigned_to uuid FK profiles nullable`
- `created_at`, `updated_at`

**`franchise_documents`**
- `id`, `enquiry_id FK franchise_enquiries`
- `storage_path text not null`, `file_name text not null`, `uploaded_at default now()`

### G. Integrations

**`integration_configs`**
- `id`, `provider integration_provider not null`, `outlet_id FK outlets nullable` (null = global)
- `mode integration_mode not null default 'mocked'`
- `config jsonb not null default '{}'` — non-secret settings only; real credentials belong in Vercel/Supabase secret storage, never here
- `is_active bool default true`, `updated_at`
- unique `(provider, outlet_id)`

### H. Notifications & Audit

**`notifications`**
- `id`, `recipient_id uuid FK profiles`, `type text not null`
- `payload jsonb not null default '{}'`
- `channel notification_channel not null default 'in_app'`
- `status notification_status not null default 'pending'`
- `created_at`, `sent_at`

**`audit_logs`**
- `id`, `actor_id uuid FK profiles nullable`, `action text not null`
- `entity_type text not null`, `entity_id uuid`
- `outlet_id uuid FK outlets nullable`
- `metadata jsonb default '{}'`
- `created_at default now()`

---

## 4. RLS Strategy

- Enable RLS on every table above in the same migration that creates it (`alter table x enable row level security;`), even before policies exist.
- Build two SQL helper functions used across nearly every policy:
  - `current_profile_role()` — returns the caller's `user_role` by joining `profiles` on `auth.uid()`.
  - `is_outlet_staff(target_outlet uuid)` — returns `true` if the caller is Super Admin/Owner (all-outlet bypass) **or** has a matching row in `user_outlets`.
- **Performance note for the agent:** a per-row subquery against `profiles`/`user_outlets` is simple and correct, and is the right starting point for Phase 1's scale. If Phase 11's regression testing shows this is a bottleneck, investigate embedding role/outlet claims directly into the Supabase Auth JWT via a Custom Access Token Hook — check Supabase's current documentation for the exact mechanism, since this is an area that evolves. Don't add that complexity pre-emptively.
- Policies should be written per table, per role, per action (`select`/`insert`/`update`/`delete`) — not one broad `using (true)` clause "for now." A permissive placeholder policy is worse than no policy, because it's easy to forget to tighten later.
- Anonymous (unauthenticated) access is required for exactly two paths: public website reads (`outlets` where `status='published'`, `menu_items`, `menu_categories`) and two public inserts (`franchise_enquiries` + `franchise_documents`, `feedback` only if the client confirms anonymous feedback is allowed — default assumption is customer-account-only). Everything else requires an authenticated `auth.uid()`.

---

## 5. RBAC Permission Matrix (draft — confirm before final lock)

Legend: **Full** = create/read/update/delete within scope · **RW** = read/write, no delete · **R** = read-only · **Own** = own records only · **None** = no access.

| Resource | Super Admin | Owner/Mgmt | Admin | Manager | Chef | HR | Accountant | Customer |
|---|---|---|---|---|---|---|---|---|
| Outlets (create/publish) | Full (all) | R (all) | Full (own outlet) | RW basic info (own outlet) | R (own outlet) | R (own outlet) | R (own outlet) | R (published only) |
| Floors & Tables | Full (all) | R (all) | Full (own outlet) | Full (own outlet) | R + status update (own outlet) | None | None | None |
| Menu | Full (all) | R (all) | Full (own outlet/global) | RW (own outlet) | R (own outlet) | None | None | R (published only) |
| Reservations | Full (all) | R (all) | Full (own outlet) | Full incl. approve/assign (own outlet) | R (own outlet, kitchen visibility) | None | None | Own: create/read/cancel |
| SOPs/Checklists/Tasks | Full (all) | R (all) | Full (own outlet) | Full incl. assign (own outlet) | Own-assigned: R + status update | R — **TBD, confirm in discovery** | None | None |
| Task Evidence | Full (all) | R (all) | R (own outlet) | R (own outlet) | Own-uploaded: write; own-assigned: R | None | None | None |
| Feedback | Full (all) | R (all) | RW status (own outlet) | RW status (own outlet) | None | None | None | Own: create/read |
| Franchise Enquiries | Full incl. notes | R (all), notes hidden — **TBD** | Full incl. notes/status | None | None | None | None | Public create only, no read |
| Integration Configs | Full | R (all) | R (own outlet) | None | None | None | R (mocked financial views) | None |
| Audit Logs | R (all) | R (all) | R (own outlet) | R (own outlet) — **TBD** | None | None | None | None |
| Own Profile | RW | RW | RW | RW | RW | RW | RW | RW |

Rows marked **TBD** correspond directly to Master Brief §11 (HR/Accountant scope) and §13 (change control) — build the draft above, write it into your Phase 2 tests as-is, and flag it explicitly in the phase log rather than treating it as final.

---

## 6. Storage Buckets

| Bucket | Access | Notes |
|---|---|---|
| `outlet-media` | Public read; write restricted to outlet staff (Admin+) | Hero images, menu photography |
| `sop-evidence` | Private; write: assigned/outlet staff only; read: outlet management chain + Super Admin | Never publicly accessible — signed URLs only |
| `franchise-documents` | Private; write: public insert allowed (applicant uploading their own document, no login required); read: staff with franchise access only | File-type and size validation server-side before accepting |

---

## 7. Indexing & Performance Notes

- Index every foreign key used in a `WHERE` clause of a hot query: `reservations(outlet_id, reservation_date)`, `checklist_tasks(status, due_at)`, `tables(outlet_id, status)`.
- Partial indexes are worth considering for dashboard queries, e.g. `create index on reservations (outlet_id) where status = 'pending';`
- Dashboard aggregation should live in SQL views or `SECURITY INVOKER` functions (so they respect the caller's RLS rather than bypassing it) — see Phase 9 in the execution prompts.

## 8. Audit Logging Pattern

Use a single generic `audit_logs` table plus a reusable trigger function attached to the tables that scope doc §23 flags as material: `profiles` (role changes), `reservations` (status changes, table assignment), `outlets` (publish/unpublish), `checklist_tasks` (completion), and any admin configuration change. The trigger writes `actor_id` (from `auth.uid()`), `action`, `entity_type`, `entity_id`, and a `metadata` diff — don't build a bespoke audit table per module.
