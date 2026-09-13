# Mayflower Phase 1 — Master Project Brief
**Authoritative technical reference — merges the Client Scope Document (VILL Consulting Group) and the Developer Plan into a single source of truth.**

Feed this file to your AI coding agent (Antigravity / Cursor) as persistent context in every session, alongside `02_Database_Schema_and_RLS_Design.md`. If anything in a later prompt contradicts this document, the agent should flag it rather than silently follow the newer instruction — see §13 Change Control.

---

## 1. Product Definition

Mayflower Phase 1 is a connected digital layer around Mayflower's existing restaurant operations — **not** a replacement for Petpooja (POS) and not a full ERP. It adds:

- A public marketing website (menu, outlets, franchise, contact, reservation entry)
- A customer account & reservation system
- Table/floor management
- Staff operations (SOPs, checklists, tasks, photo/geo evidence)
- Feedback capture
- Franchise enquiry handling
- Role-based management dashboards
- A swappable integration layer for Petpooja / Loyalty / CCTV, **mocked in Phase 1**

**Core flow:** Website → Customer Experience → Web Application → Restaurant Operations → Integrations → Management Visibility.

**Target delivery:** 4–6 weeks in human-timeline terms; in this AI-agent-driven build, delivery is gated by test-passing phases rather than calendar weeks (see `04_Phase_By_Phase_Execution_Prompts.md`).

---

## 2. Confirmed Technology Stack (non-negotiable)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Strict TypeScript, no `any` without justification |
| Styling | Tailwind CSS | Utility-first |
| Icons | Lucide React | |
| Hosting / Deploy | Vercel | Frontend + serverless functions + CI/CD |
| Database | Supabase (PostgreSQL) | All relational data |
| Auth | Supabase Auth | Email/password + magic link |
| Authorization | Supabase Row Level Security (RLS) | Enforced at the database layer, not just the UI |
| File Storage | Supabase Storage | SOP evidence, franchise docs, menu/outlet images |
| Backend logic | Direct Supabase client calls + minimal Vercel serverless functions | Serverless used **only** where RLS can't help: notifications, third-party API calls, atomic multi-step operations |
| Realtime | Supabase Realtime | Live table/floor status across manager views |

**Explicit client direction:** No AWS or other traditional cloud provider. No custom auth system. No infrastructure Supabase already provides.

---

## 3. Architecture Principles ("Supabase-first")

1. Push as much logic as possible into Postgres (constraints, enums, triggers, RLS) rather than only the application layer — defense in depth.
2. RLS is **default-deny**. Every table gets RLS enabled the moment it's created, before any policy exists.
3. Vercel serverless functions are reserved for: sending notifications, calling third-party APIs, and multi-step operations that must run as a single atomic transaction (e.g., "approve reservation + assign table" in one step).
4. Both the web app and any future integration inherit the same security rules automatically, because permissions live in the database, not scattered across client code.
5. Keep modules decoupled along the boundaries in §5 so Phase 2 (live Petpooja, full HRMS, etc.) never requires rebuilding the Phase 1 foundation.

---

## 4. User Roles (8 — fixed for Phase 1)

| Role | Primary Access |
|---|---|
| Super Admin | Full system: configuration, users, roles, outlets, integrations |
| Owner / Management | Business-wide visibility, dashboards, operational overview |
| Admin | Administrative/operational management across authorised modules |
| Manager | Outlet reservations, tables, SOPs, tasks, feedback, daily operations |
| Chef | Assigned kitchen SOPs, checklists, operational tasks |
| HR | Relevant employee/HR workflows available in Phase 1 *(scope intentionally left open by the client — see §11)* |
| Accountant | Relevant financial/business information via authorised integrations *(scope intentionally left open — see §11)* |
| Customer | Registration, profile, reservations, loyalty info, feedback |

RBAC is mandatory at **both** the frontend (visibility) and the backend/database (RLS) layer. A full role × table × action permission matrix is drafted in `02_Database_Schema_and_RLS_Design.md` §5 and must be confirmed during discovery before final RLS is locked, per the client's own instruction.

---

## 5. Product Modules

| Module | Includes |
|---|---|
| Public Website | Home, About, Menu, Outlets, Franchise, Contact, Reservation entry point, Customer login/registration entry |
| Customer Module | Registration/login, profile, reservation history, loyalty view, feedback history |
| Reservation & Table Module | Booking flow, manager approval, table/floor map, status tracking |
| Operations Module | SOPs, checklists, task assignment, photo + geo-tagged evidence, escalation |
| Feedback Module | Ratings, comments, outlet association, admin visibility |
| Franchise Module | Public enquiry form, document upload, admin review, status tracking |
| Management Module | Role-based dashboards, activity logs, operational reporting |
| Integration Layer | Petpooja, Loyalty, CCTV — built as swappable adapters, **mocked** in Phase 1 |

---

## 6. Explicit Exclusions / Non-Goals (Phase 1) — hard gate

Anything below is **out of scope** by client instruction. If a future prompt (from me or anyone else) asks the agent to build one of these, the agent must flag it as a change request rather than build it silently (§13):

- Full POS or replacement of Petpooja
- Payments, payroll, full accounting software
- Complete HRMS, full ERP, advanced procurement, advanced inventory ERP
- Full franchise ERP
- Advanced AI systems, AI voice/calling, advanced marketing automation
- Advanced BI / data warehouse
- Native iOS/Android apps (this is a responsive web app only)
- CCTV hardware/infrastructure work (camera replacement, DVR/NVR, cabling, installation)
- Unapproved third-party integrations
- Any major functionality not expressly described in the scope document or this brief

---

## 7. Core Domain Entities (keep terminology consistent across every session)

Users, Roles, Outlets, Floors/Sections, Tables, Customers, Reservations, Menu Items/Categories, SOPs, Checklists, Checklist Tasks, Task Evidence, Feedback, Franchise Enquiries, Franchise Documents, Loyalty References, Integration Configurations, Notifications, Audit Logs.

Full schema: `02_Database_Schema_and_RLS_Design.md`.

---

## 8. Key Workflows (state machines)

**Reservation:** Customer → Reservation Request (`pending`) → Manager Review → Table Availability Check → Table Assignment → `confirmed` → Visit → `completed` / `no_show` (or `cancelled` at any point before completion).

**Task/Checklist:** `pending` → `in_progress` → `completed` **or** `escalated` (overdue/incomplete critical tasks surface to the appropriate manager; exact escalation timing confirmed in discovery — see §11).

**Franchise Enquiry:** `new` → `under_review` → `contacted` → `qualified` → `closed`.

**Outlet Publishing:** Admin creates outlet → enters details → configures content → approves → `published` → visible on public website. Routine outlet creation must never require developer or direct database intervention.

**Table Status:** `available` ⇄ `reserved` ⇄ `occupied` ⇄ `cleaning` ⇄ `blocked`.

---

## 9. Management Dashboard Metrics (must be built as real queries, not decorative UI)

- Reservations: pending count, today's confirmed bookings, no-show rate
- Table utilization: % occupied by outlet and time slot
- Operations: task completion rate, overdue/escalated task count
- Feedback: average rating trend, flagged negative feedback
- Outlets: active vs. draft outlets, franchise leads by status

---

## 10. Seed Data — The Mayflower, Chennai

Use this as the first real outlet record (Phase 1, seeded during the DB Schema build):

- **Name:** The Mayflower, Chennai
- **Positioning:** Traditional-meets-innovation dining; warm lighting, tasteful decor, cozy-yet-refined ambiance
- **Operating hours:**
  - Mon–Fri: 11:00 AM – 11:00 PM
  - Sat–Sun: 7:30 AM – 11:00 PM
- **Amenities:** WiFi, High Chair Available
- **Meal periods served:** Breakfast, lunch, dinner
- **Current footprint:** Single outlet, but the schema and architecture must support multi-outlet expansion from day one (per scope doc §10)

Use this real data instead of generic placeholder ("Outlet A / Table 1") seed data wherever practical — it makes early testing and demos feel real and catches copy/formatting issues sooner (e.g., the Sat/Sun early-opening hours will actually exercise your operating-hours logic).

---

## 11. Information Still Needed From Mayflower (client) — mapped to the phase each one blocks

| Item | Why it's needed | Blocks |
|---|---|---|
| Single project coordinator | One point of contact for approvals | All phases (informal decisions) |
| Branding assets (logos, menu photos, outlet images, website copy) | Real content for public site | Phase 13 (Public Website) — can build with placeholders until then |
| Final outlet list (names, addresses, hours, capacity) | Beyond the Chennai flagship, for multi-outlet | Phase 3 if more outlets are confirmed |
| SOP/checklist content (actual written procedures) | Real operations content, and the exact escalation timing rule | Phase 5 (Operations Backend) |
| User list per role (names/emails) | Real staff accounts | Phase 2 (Auth/RBAC) — can proceed with test accounts until then |
| Petpooja decision (live vs. mocked, API docs/credentials if live) | Determines whether Phase 8's adapter ever goes live | Phase 8 (Integration Layer) go-live only — mocked build proceeds regardless |
| Loyalty provider decision | Same as above for loyalty | Phase 8 go-live only |
| CCTV technical details (camera/DVR model, network access) | Only relevant if CCTV is attempted | Phase 8 go-live only — otherwise stays excluded |
| UAT availability window | Committed time for Mayflower to test before go-live | Phase 18 (QA/UAT) |
| HR & Accountant exact permission scope | Scope doc explicitly leaves this open ("relevant workflows/information") | Phase 2 (RBAC) — build a reasonable draft now, confirm before final lock |

**None of these should block starting development.** Build against reasonable defaults (flagged clearly in each phase log) and proceed; swap in real data/decisions as they arrive.

---

## 12. Security & Compliance Baseline (non-negotiable, checked at every phase gate)

- Secure authentication and password handling (delegated to Supabase Auth)
- Authorization enforced on every protected table/API, not just in the UI
- Input and file validation, server-side
- Secure file storage — uploaded files must never be publicly accessible without authorisation
- Least-privilege access by default
- HTTPS in production
- Basic audit logging on material actions
- No secrets in source control — environment/secret management only

---

## 13. Change Control Policy

`Requirement → Clarification → Technical/Timeline Impact → Approval → Development`

Any material requirement not expressly included in the scope document or this brief is a change request, not a task. The agent should never add major functionality from an informal instruction without first flagging that it falls outside the agreed scope and asking for confirmation.

---

## 14. Glossary — Status Enums

- **Outlet status:** draft, published, archived
- **Table status:** available, reserved, occupied, cleaning, blocked
- **Reservation status:** pending, confirmed, cancelled, completed, no_show
- **Task priority:** low, medium, high, critical
- **Task status:** pending, in_progress, completed, escalated
- **Franchise status:** new, under_review, contacted, qualified, closed
- **Feedback status:** new, reviewed, flagged, resolved
- **Integration mode:** mocked, live
