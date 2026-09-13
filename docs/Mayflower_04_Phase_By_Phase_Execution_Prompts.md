# Mayflower Phase 1 — Phase-by-Phase Execution Prompts

**How to use this document:** work top to bottom, one phase at a time. After the Master Agent Prompt has been set as persistent context, paste each "Agent Prompt" block below into your session in order. **Do not paste the next one until the current phase's acceptance criteria and tests all pass and you've reviewed the phase log entry.** This is the actual gating mechanism — the discipline lives in you pausing between phases, not in the agent enforcing it alone.

Phases 0–11 are backend-only, per your instruction to make the backend exist and work properly first. Phases 12–19 build the frontend against a backend that is already fully tested. This is a deliberate departure from the original document's calendar-week structure (Week 1–6) — with an AI agent, granular test-gated phases matter more than calendar time, but every phase still maps back to a specific section of the scope document.

---

## PHASE 0 — Environment & Repository Foundation

**Objective:** Stand up the entire toolchain with zero business logic, so every later phase has a clean, tested foundation to build on.

**In scope:** repo init, Vite+React+TS+Tailwind scaffold, folder structure, linting, Vitest, Supabase CLI local dev, Vercel project link, CI pipeline, `.env.example`, `PHASE_LOG.md`.

**Out of scope:** any table, any auth, any real UI beyond a placeholder health-check page.

**Acceptance criteria:** `npm run dev` runs cleanly; `npm run test` runs (even a single dummy test); `supabase start` / `supabase db reset` complete without error; CI passes lint + typecheck + test on a pushed branch.

**Required tests:** one smoke test rendering the placeholder page; CI green.

```
PHASE 0 — Environment & Repository Foundation

Set up the complete project skeleton with no business logic yet:
- Initialize a React 18 + TypeScript + Vite project with Tailwind CSS and Lucide React
  configured.
- Set up ESLint + Prettier with strict TypeScript rules.
- Create this folder structure: /src/modules/* (one folder per module from Master Brief
  §5), /src/lib/supabase.ts (typed Supabase client), /supabase/migrations,
  /supabase/functions, /docs (copy the brief, schema doc, this prompt set, and the
  testing framework into /docs so they live in the repo).
- Install and configure Vitest + Testing Library.
- Install the Supabase CLI, run `supabase init`, and confirm `supabase start` /
  `supabase db reset` work locally.
- Create `.env.example` with placeholders and comments for every env var this project
  will eventually need (Supabase URL/anon key/service role key, Vercel-specific vars).
  Do not put real values anywhere.
- Link the repo to a Vercel project (I will provide credentials/account access).
- Set up a CI pipeline (GitHub Actions or Vercel's own) that runs lint, typecheck, and
  test on every push.
- Build one placeholder route that renders "Mayflower Phase 1 — environment healthy"
  and reads a value from Supabase (e.g. `select now()`) to prove the connection works.
- Create /docs/PHASE_LOG.md and add the Phase 0 entry per the template in
  Mayflower_05_Testing_QA_Framework.md.

Do not create any business tables, auth flow, or real UI screens. When finished, show
me that `npm run dev`, `npm run test`, and `supabase db reset` all succeed, and that CI
is green on a pushed branch. Then stop and wait for my confirmation before Phase 1.
```

---

## PHASE 1 — Database Schema & Core Data Model

**Objective:** Implement the entire Phase 1 data model as versioned Supabase migrations, exactly as specified in the DB Schema doc.

**In scope:** all tables/enums from `02_Database_Schema_and_RLS_Design.md` §2–3, constraints/indexes, RLS **enabled** on every table (deny-all, no policies yet), seed script including the real Mayflower Chennai outlet data from Master Brief §10, an ERD diagram committed to `/docs`.

**Out of scope:** actual RLS policies (Phase 2), any API/service layer, any UI.

**Acceptance criteria:** fresh `supabase db reset` applies every migration and the seed without error; every table shows `relrowsecurity = true`; querying any table with the anon key returns zero rows (deny-all confirmed); seed row counts match expectations.

**Required tests:** migration idempotency (reset twice in a row succeeds); an automated check that RLS is enabled on 100% of tables; seed data assertions.

```
PHASE 1 — Database Schema & Core Data Model

Using Mayflower_02_Database_Schema_and_RLS_Design.md as the exact specification, write
Supabase migrations that create:
- All enum types listed in §2.
- All tables listed in §3, grouped by module, with the columns, types, constraints,
  and foreign keys exactly as specified. Add sensible indexes per §7.
- Enable Row Level Security on every single table in the same migration that creates
  it. Do NOT write any policies yet — a deny-all table with RLS on and no policy is
  the correct state to leave things in after this phase.
- Write /supabase/seed.sql that seeds: the 8 roles (as profile.role values, no
  separate roles table per the DB doc's design note), the sop_categories list, and
  one real outlet — The Mayflower, Chennai — using the operating hours and amenities
  from Master Brief §10. Add a couple of floors/tables and menu categories/items
  under it so later phases have real data to work against, not placeholders.
- Produce an ER diagram (Mermaid is fine) and commit it to /docs/erd.md.

Write a test that runs `supabase db reset` twice back-to-back and asserts success both
times (idempotency), a test that queries pg_class/pg_tables to confirm relrowsecurity
is true for every table in the public schema, and assertions on seed row counts.

Do not write any RLS policies, any service/API layer, or any UI in this phase. When
finished, show me the reset succeeding, the RLS-enabled check passing for every table,
and update PHASE_LOG.md. Then stop and wait for my confirmation before Phase 2.
```

---

## PHASE 2 — Authentication, RBAC & RLS Policies

**Objective:** Real Supabase Auth plus the full RLS policy set from the DB Schema doc's permission matrix, proven by an automated per-role test suite.

**In scope:** `profiles` creation on signup, role assignment flow, `user_outlets` outlet-scoping, every RLS policy for every table/role/action pair, a data-driven RLS test harness.

**Out of scope:** any UI (login screens come in Phase 14), notifications.

**Acceptance criteria:** 100% of the RBAC matrix cells in the DB Schema doc §5 are covered by a passing automated test; zero cross-outlet leakage; a Customer can never read another customer's row under any test scenario; the "TBD" rows (HR, Accountant) are implemented as reasonable drafts and explicitly logged as pending confirmation.

**Required tests:** automated integration test suite — for every role, for every table, for every action (select/insert/update/delete) — asserting allow or deny matches the matrix.

```
PHASE 2 — Authentication, RBAC & RLS Policies

Implement real authentication and the full RLS policy set:
- Configure Supabase Auth (email/password + magic link).
- Add a database trigger that creates a `profiles` row automatically on signup,
  defaulting role to 'customer'.
- Build a role-assignment mechanism for staff roles (Super Admin/Admin only can set
  another user's role — this itself needs an RLS policy on `profiles` updates).
- Build the `user_outlets` assignment flow for outlet-scoped roles.
- Write the SQL helper functions described in the DB Schema doc §4
  (current_profile_role(), is_outlet_staff()).
- Write the actual RLS policy for every table, for every role, for every action,
  matching the matrix in Mayflower_02_Database_Schema_and_RLS_Design.md §5 exactly.
  For the two rows marked TBD (HR and Accountant scope), implement the draft access
  described in the matrix, and add a clear comment in the migration plus an entry in
  PHASE_LOG.md flagging it as pending client confirmation per Master Brief §11.
- Build a data-driven RLS test harness: create one test user per role (8 total, plus
  an anonymous/unauthenticated case), and for every table and every action, assert
  the result matches the matrix. This should be a real automated test suite, not a
  manual QA pass.

Do not build any login/signup UI or notification logic in this phase — this is
backend and RLS only. When finished, show me the full RLS test suite passing (report
the pass count against the total matrix cells), update /docs/rbac-matrix.md with any
confirmed changes, and update PHASE_LOG.md including the two flagged TBD items. Then
stop and wait for my confirmation before Phase 3.
```

---

## PHASE 3 — Outlet, Floor & Table Management Backend

**Objective:** CRUD and the publish/unpublish workflow for outlets/floors/tables, running against the RLS from Phase 2.

**In scope:** typed service layer for outlet/floor/table CRUD; outlet status transition guard (`draft → published → archived`); table status transition guard; using the seeded Mayflower Chennai outlet as the primary test fixture.

**Out of scope:** the visual floor-map UI, reservation logic.

**Acceptance criteria:** invalid status transitions are rejected at the database level (not just app-level); only Admin/Owner/Super Admin can publish an outlet; Manager/Chef are correctly limited to their assigned outlet(s) via `user_outlets`.

**Required tests:** unit tests for the service layer; integration tests for each transition guard (valid transitions succeed, invalid ones are rejected); a re-run of the relevant slice of the Phase 2 RLS suite against the new service functions (not just raw SQL).

```
PHASE 3 — Outlet, Floor & Table Management Backend

Build the backend service layer for outlets, floors, and tables:
- Typed CRUD functions (outlet, floor, table) using the Supabase client, respecting
  the RLS policies already in place — do not bypass RLS with a service-role key here.
- Implement the outlet status transition guard: draft → published → archived, with
  any other transition rejected. Use a database CHECK/trigger or an RPC function so
  the rule can't be bypassed by calling the table directly.
- Implement the table status transition guard for available/reserved/occupied/
  cleaning/blocked, same principle.
- Wire the publish action so only Admin/Owner/Super Admin can invoke it, matching the
  matrix.
- Confirm the seeded Mayflower Chennai outlet, its floors, and its tables all work
  correctly through this new service layer.

Do not build the floor-map visual UI or any reservation logic yet. Write unit tests
for the service layer and integration tests proving invalid transitions are rejected
at the database level. When finished, show me the tests passing and update
PHASE_LOG.md. Then stop and wait for my confirmation before Phase 4.
```

---

## PHASE 4 — Reservation Engine Backend

**Objective:** The full reservation lifecycle from scope doc §8, including the atomic approve+assign operation.

**In scope:** reservation creation, the full status state machine, an atomic "approve + assign table" RPC/serverless function (this is exactly the kind of multi-step atomic operation the architecture principles call out for a serverless function rather than raw client calls), a double-booking guard.

**Out of scope:** any booking UI, notifications (Phase 10), Petpooja sync (Phase 8).

**Acceptance criteria:** a table can never be double-booked for overlapping times; only outlet-scoped Manager/Admin/Owner/Super Admin can approve a reservation; a customer can only see and cancel their own reservations.

**Required tests:** a concurrency test simulating two simultaneous booking attempts for the same table/slot (only one should succeed); full state-machine transition tests (every valid and invalid transition); RLS re-verification specific to reservations.

```
PHASE 4 — Reservation Engine Backend

Build the reservation engine:
- A reservation-creation function validating outlet, date, time, and party size are
  present and sane (reject past dates, non-positive party sizes).
- The full status state machine: pending → confirmed → completed/no_show, with
  cancelled reachable from pending or confirmed. Guard invalid transitions at the
  database level.
- An atomic "approve and assign table" operation (RPC function or a Vercel serverless
  function, per the architecture principle that atomic multi-step operations belong
  outside plain client calls) that, in a single transaction, moves a reservation to
  confirmed AND assigns/locks a table, so two managers can't race and double-assign
  the same table.
- A double-booking guard: reject or flag an attempt to book/assign the same table for
  an overlapping outlet/date/time window.
- No-show and completion marking, restricted to outlet staff.

Do not build the customer-facing booking UI or any notifications yet. Write a
concurrency test that fires two simultaneous confirm+assign attempts at the same
table/slot and asserts exactly one succeeds, plus full state-machine tests and RLS
tests specific to the reservations table. When finished, show me the tests passing
and update PHASE_LOG.md. Then stop and wait for my confirmation before Phase 5.
```

---

## PHASE 5 — Operations Backend: SOPs, Checklists & Tasks

**Objective:** The SOP/checklist/task backend from scope doc §14.

**In scope:** SOP and checklist CRUD scoped by outlet/category, checklist task CRUD with priority/status, assignment to a role or a specific user, the task status transition guard, an escalation-check function (logic only — the actual scheduled trigger for it is wired in Phase 10).

**Out of scope:** photo/geo evidence storage (Phase 6), any UI.

**Acceptance criteria:** a Chef can only see and update tasks assigned to them or their outlet; the escalation-check function correctly identifies overdue critical tasks given a mocked "current time."

**Required tests:** state-machine tests for task status; RLS scoping tests (Chef vs. Manager vs. cross-outlet); a unit test for the escalation-check logic using a mocked clock.

```
PHASE 5 — Operations Backend: SOPs, Checklists & Tasks

Build the operations backend:
- CRUD for sops and checklists, scoped by outlet and SOP category (seed data already
  exists from Phase 1).
- CRUD for checklist_tasks including priority and the status state machine: pending →
  in_progress → completed, or → escalated.
- Assignment logic supporting both "assigned to a role" (e.g. all Chefs at an outlet)
  and "assigned to a specific user."
- An escalation-check function that identifies tasks past their due_at that are still
  pending/in_progress and marks them escalated. Since the exact escalation timing
  rule is not yet confirmed by the client (Master Brief §11), implement a reasonable
  default (e.g. escalate critical-priority tasks 30 minutes past due_at, others at
  2 hours past due_at) and flag this explicitly as pending confirmation in
  PHASE_LOG.md. Do not wire this to an actual cron job yet — that's Phase 10; just
  build and test the function itself.

Do not build photo/geo evidence handling or any UI yet. Write state-machine tests,
RLS scoping tests confirming a Chef only sees their own assigned tasks, and a unit
test for the escalation function using a mocked/injected "now." When finished, show
me the tests passing and update PHASE_LOG.md with the flagged escalation-rule
assumption. Then stop and wait for my confirmation before Phase 6.
```

---

## PHASE 6 — Photo & Geo-Tagged Evidence + Storage

**Objective:** The file-evidence pipeline from scope doc §15/§24.

**In scope:** the `sop-evidence` Storage bucket and its policies, the `task_evidence` metadata table wiring, server-side file-type/size validation, graceful handling of denied geo-location permission.

**Out of scope:** the camera-capture UI itself.

**Acceptance criteria:** unauthenticated or unauthorized users cannot read or write evidence files via a direct storage URL; oversized or disallowed file types are rejected server-side, not just in the browser.

**Required tests:** storage RLS/policy tests; file-validation unit tests (valid types/sizes pass, invalid ones are rejected).

```
PHASE 6 — Photo & Geo-Tagged Evidence + Storage

Build the evidence pipeline:
- Create the `sop-evidence` Supabase Storage bucket as private.
- Write storage policies so upload is restricted to the assigned user or outlet staff
  for the relevant task, and read is restricted to that outlet's management chain
  plus Super Admin — no public URLs.
- Wire the task_evidence table so uploads are recorded with the storage path (never a
  public URL), file type, uploader, and geo coordinates when available.
- Implement server-side file-type and size validation (reject anything that isn't an
  expected image type, and anything over a sane size limit — pick a reasonable
  default like 10MB and flag it as adjustable in PHASE_LOG.md).
- Handle the case where geo-location permission is denied: geo_lat/geo_lng should be
  nullable and the rest of the upload should still succeed.

Do not build the actual camera-capture UI yet. Write storage policy tests proving an
unauthorized user cannot read or write another outlet's evidence files, and unit
tests for the file validation logic. When finished, show me the tests passing and
update PHASE_LOG.md. Then stop and wait for my confirmation before Phase 7.
```

---

## PHASE 7 — Feedback & Franchise Module Backend

**Objective:** The feedback and franchise pipelines from scope doc §16/§11.

**In scope:** feedback CRUD (customer submission + staff visibility/status), franchise enquiry CRUD, the `franchise-documents` bucket (reusing the Phase 6 storage pattern), the franchise status pipeline, staff-only internal notes.

**Out of scope:** the public-facing form UI.

**Acceptance criteria:** anonymous/public users can submit a franchise enquiry and upload its documents without an account, but cannot read anyone else's submissions or any internal notes.

**Required tests:** RLS tests for anonymous insert with no read access; a specific test proving `internal_notes` is never returned to a non-staff query.

```
PHASE 7 — Feedback & Franchise Module Backend

Build the feedback and franchise backends:
- CRUD for feedback: customers can create and read their own; outlet staff can read
  and update status for their outlet.
- CRUD for franchise_enquiries: allow anonymous (unauthenticated) insert, since a
  prospective franchisee should not need an account to enquire. Anonymous users must
  never be able to read enquiries (their own or anyone else's) back.
- Create the `franchise-documents` Storage bucket following the same private-bucket
  pattern as Phase 6, but allow anonymous upload tied to a specific enquiry_id at
  submission time.
- Implement the franchise status pipeline: new → under_review → contacted →
  qualified → closed, staff-only to change.
- Ensure internal_notes on franchise_enquiries is never selectable by anyone outside
  Admin/Owner/Super Admin, at the RLS level.

Do not build the public enquiry/feedback form UI yet. Write RLS tests proving
anonymous insert works but anonymous read does not, and a dedicated test proving
internal_notes never leaks to a non-staff role. When finished, show me the tests
passing and update PHASE_LOG.md. Then stop and wait for my confirmation before
Phase 8.
```

---

## PHASE 8 — Integration Adapter Layer (Petpooja / Loyalty / CCTV — Mocked)

**Objective:** Build the swappable adapter architecture the Master Brief's Supabase-first principles call for, with mock implementations only, per scope doc §17–19.

**In scope:** a stable adapter interface per provider, mock implementations returning realistic fake data, `integration_configs` wiring, a documented go-live checklist for each provider.

**Out of scope:** any real third-party API call, any CCTV streaming.

**Acceptance criteria:** switching a provider's `mode` from `mocked` to `live` in config should require changes only inside that provider's adapter file — nothing else in the app should need to know the difference.

**Required tests:** adapter contract/unit tests; a test that swaps mode and confirms the calling code is unaffected.

```
PHASE 8 — Integration Adapter Layer (Petpooja / Loyalty / CCTV — Mocked)

Build the integration adapter layer:
- Define a stable TypeScript interface per provider (Petpooja, Loyalty, CCTV) that
  describes the data shapes listed as "potential data" in the scope document
  (e.g. for Petpooja: sales, orders, inventory, staff/HR info, outlet info, reports —
  only include what's realistic to mock meaningfully for a restaurant dashboard).
- Implement a mock adapter per provider that returns realistic, clearly-labeled fake
  data consistent with the seeded Mayflower Chennai outlet.
- Wire the integration_configs table so each provider's mode (mocked/live) is read
  from config, and the app calls whichever adapter matches the current mode.
- Write /docs/integration-go-live-checklist.md documenting exactly what would need to
  happen to flip each provider to live (API docs needed, credentials needed, endpoint
  mapping needed) — this becomes the handoff spec for when the client makes the
  Petpooja/Loyalty/CCTV decisions listed in Master Brief §11.

Do not call any real third-party API or attempt any CCTV streaming. Write contract
tests for each adapter interface and a test proving that flipping mode from mocked to
live doesn't require touching calling code (interface stability). When finished, show
me the tests passing and update PHASE_LOG.md. Then stop and wait for my confirmation
before Phase 9.
```

---

## PHASE 9 — Management Dashboard Data Layer

**Objective:** Backend aggregation for every metric listed in the dev plan §6, built as testable SQL views/RPC functions.

**In scope:** views/RPCs for pending reservations, today's confirmed count, no-show rate, table utilization %, task completion rate, overdue/escalated count, average rating trend, flagged negative feedback, active vs. draft outlets, franchise leads by status — all outlet-scoped and RLS-respecting.

**Out of scope:** any chart/UI.

**Acceptance criteria:** every metric's value matches a hand-calculated expected value against seeded fixture data, for at least two distinct scenarios each; no metric silently bypasses RLS (use `SECURITY INVOKER` where the database supports it, or explicit outlet filtering).

**Required tests:** metric-accuracy integration tests per metric.

```
PHASE 9 — Management Dashboard Data Layer

Build the dashboard data layer as SQL views or RPC functions, one per metric listed in
Master Brief §9:
- Reservations: pending count, today's confirmed bookings, no-show rate.
- Table utilization: % occupied by outlet and time slot.
- Operations: task completion rate, overdue/escalated task count.
- Feedback: average rating trend, flagged negative feedback count.
- Outlets: active vs. draft count, franchise leads grouped by status.

Every metric must respect the RLS scoping already in place (a Manager should only see
their own outlet's numbers; Owner/Super Admin see all) — use SECURITY INVOKER views or
explicit outlet-id filtering rather than a service-role bypass. Set up at least two
distinct fixture scenarios per metric with known expected values, and write
integration tests asserting the computed value matches your hand-calculation exactly.

Do not build any chart or dashboard UI yet — this is data-layer only. When finished,
show me the tests passing (including the fixture data and expected values you used)
and update PHASE_LOG.md. Then stop and wait for my confirmation before Phase 10.
```

---

## PHASE 10 — Notifications & Audit Logging Backend

**Objective:** Wire the async/atomic pieces that genuinely need a serverless function, plus the audit trail from scope doc §23, plus the Phase 5 escalation check's actual schedule.

**In scope:** serverless functions for reservation status notifications, task assignment/escalation notifications, feedback/admin alerts (logged as "would-send" pending an approved delivery provider); the generic audit-log trigger on every material action; a scheduled job wiring the Phase 5 escalation check.

**Out of scope:** actual email/SMS/WhatsApp delivery (blocked on client provider approval, per Master Brief §11); any notification UI.

**Acceptance criteria:** every material action (user creation, reservation status change, table assignment, task completion, outlet publication, admin config change) produces exactly one correct audit row; the escalation cron correctly flags overdue tasks in a test scenario.

**Required tests:** audit-trigger coverage test per action type; an escalation-cron unit test.

```
PHASE 10 — Notifications & Audit Logging Backend

Build the notification and audit backbone:
- Write serverless functions (Vercel or Supabase Edge Functions — your call, document
  the choice) that fire on: reservation confirmation/status change, task assignment,
  task escalation, and new feedback/admin alerts. Since the actual delivery channel
  (email/SMS/WhatsApp) isn't approved yet per Master Brief §11, record these as rows
  in the notifications table with status tracking rather than actually sending
  anything external. Log this limitation clearly in PHASE_LOG.md.
- Add a generic audit-log trigger (per Mayflower_02_Database_Schema_and_RLS_Design.md
  §8) covering: profile role changes, reservation status changes and table
  assignment, outlet publish/unpublish, checklist_task completion, and admin
  configuration changes to integration_configs.
- Wire the Phase 5 escalation-check function to an actual scheduled job (cron) so it
  runs periodically rather than only on demand.

Do not attempt real external notification delivery. Write a test proving each listed
action type produces exactly one correctly-populated audit row, and a test proving
the escalation cron flags an overdue task correctly in a controlled scenario. When
finished, show me the tests passing and update PHASE_LOG.md. Then stop and wait for
my confirmation before Phase 11.
```

---

## PHASE 11 — Full Backend Regression, Security Hardening & Sign-off (GATE)

**Objective:** Prove the entire backend — all ten prior phases together — is production-grade before any frontend work begins. This is the most important gate in the whole plan.

**In scope:** the complete regression suite run together (not phase-by-phase in isolation), the full security checklist from scope doc §26, a secrets/git-history audit, cross-module scenario tests.

**Out of scope:** any new feature work.

**Acceptance criteria:** 100% of the backend checklist in `05_Testing_QA_Framework.md` §4 passes; zero open critical/high findings.

**Required tests:** the full combined backend test suite from Phases 1–10; new cross-module tests (e.g., cancelling a reservation frees the table, logs an audit entry, and does not touch any other outlet's data, all in one flow).

```
PHASE 11 — Full Backend Regression, Security Hardening & Sign-off (GATE)

This phase adds no new features. Its only job is to prove the backend built in
Phases 0–10 is solid enough to build a frontend on top of.

- Run every test suite from every prior phase together, not in isolation, and fix
  anything that only passed because of test-order dependencies or leftover state.
- Go through the security checklist in Master Brief §12 and scope doc §26 item by
  item: authentication/password handling, authorization on every protected table,
  input/file validation coverage, secure file storage, least-privilege access,
  production HTTPS readiness, basic audit logging coverage, and a check that no
  secret, key, or credential exists anywhere in the codebase or git history.
- Write at least three new cross-module integration tests that exercise a full
  realistic flow end-to-end at the backend level, e.g.: "customer books a reservation
  → manager confirms and assigns a table → customer cancels → table is freed → an
  audit log entry exists for every step → no other outlet's data was touched at any
  point."
- Produce /docs/security-signoff.md documenting the checklist results.

When finished, report the full regression test results and the security checklist
status. Do not proceed to Phase 12 (frontend) until I have explicitly reviewed and
confirmed this phase — this is a hard gate, not a formality.
```

---

## PHASE 12 — Frontend Foundation & Design System

**Objective:** Establish the visual/component foundation before any real screen is built, per frontend-design best practice — no generic templated defaults.

**In scope:** Tailwind theme reflecting Mayflower's brand ("warm lighting, tasteful decor, cozy-yet-refined"), base layout components, a component library skeleton built against real Supabase types.

**Out of scope:** full pages.

**Acceptance criteria:** components render correctly across breakpoints; every component is typed against the actual database schema, not mock shapes; basic accessibility passes.

**Required tests:** component unit/snapshot tests; a basic accessibility lint pass.

```
PHASE 12 — Frontend Foundation & Design System

Before building any page, establish the design system:
- Propose a Tailwind theme (palette, typography, spacing) that reflects Mayflower's
  positioning — warm, elegant, "tradition meets innovation," cozy-yet-refined ambiance
  with warm lighting — and show it to me for approval before applying it broadly.
  Consult your own design-guidance resources for this; avoid a generic templated
  look.
- Build the base layout: an AppShell, role-aware navigation, and page containers.
- Build a component library skeleton: buttons, form inputs, tables, modals, toasts —
  each typed directly against the real Supabase-generated types from the schema, not
  hand-rolled mock shapes.
- Set up a simple preview route (or Storybook, your call) to browse the component
  library in isolation.

Do not build any full page yet. Write component-level tests (rendering + basic
accessibility checks) and confirm responsiveness across at least mobile, tablet, and
desktop breakpoints. When finished, show me the preview and update PHASE_LOG.md. Then
stop and wait for my confirmation before Phase 13.
```

---

## PHASE 13 — Public Website

**Objective:** Build every page from scope doc §5, wired to real backend data — no mock content.

**In scope:** Home, About, Menu, Outlets/Locations, Franchise, Contact, Reservation entry point, Customer login/registration entry point.

**Out of scope:** authenticated app screens.

**Acceptance criteria:** every form submits to and is correctly gated by the real RLS-protected backend from Phases 1–11; the site is responsive and has basic SEO structure.

**Required tests:** a smoke test per page (renders, key interactions work); a responsive/breakpoint check; a test that the franchise and menu data shown is live, not hardcoded.

```
PHASE 13 — Public Website

Build the public website pages, using real backend data, not mocks:
- Home, About, Menu (pulling from menu_categories/menu_items), Outlets/Locations
  (published outlets only), Franchise (enquiry form wired to the Phase 7 backend),
  Contact, Reservation entry point (wired to the Phase 4 backend), and the Customer
  login/registration entry point.
- Responsive on desktop, tablet, and mobile. Basic SEO structure (meta tags,
  semantic HTML, sensible headings).
- Every form must actually hit the real RLS-protected backend — the franchise form
  should succeed anonymously and the submitter should not be able to read anything
  back beyond a success confirmation.

Do not build any authenticated customer/staff screens yet. Write a smoke test per
page and a responsive check. When finished, show me the pages and update
PHASE_LOG.md. Then stop and wait for my confirmation before Phase 14.
```

---

## PHASE 14 — Customer Web Application

**Objective:** The authenticated customer flows from scope doc §7/§8.1.

**In scope:** registration/login/logout, profile management, the full reservation flow (select outlet/date/time/party size → submit → status → history), the loyalty view (against the Phase 8 mock adapter), feedback history.

**Out of scope:** manager/staff screens.

**Acceptance criteria:** a customer can complete a full reservation end to end; a customer cannot see any other customer's data through the UI, re-verifying that Phase 2's RLS is actually enforced at this layer too, not just the API layer.

**Required tests:** an end-to-end test of the full reservation flow; a test attempting to access another customer's data through the UI and confirming it fails.

```
PHASE 14 — Customer Web Application

Build the authenticated customer experience:
- Registration, login, logout using Supabase Auth.
- Profile management (view/edit contact details).
- The full reservation flow: select outlet → date → time → party size → submit →
  view status → view reservation history → cancel if still pending/confirmed.
- Loyalty view, using the Phase 8 mocked loyalty adapter.
- Feedback history (view past feedback, submit new feedback tied to a past
  reservation).

Do not build any manager or staff-facing screen yet. Write an end-to-end test of the
full reservation flow, and a test that deliberately tries to access another
customer's reservation/profile data through the UI and confirms it is blocked. When
finished, show me the flow working and update PHASE_LOG.md. Then stop and wait for my
confirmation before Phase 15.
```

---

## PHASE 15 — Manager/Staff Operations UI

**Objective:** The staff-facing screens from scope doc §9/§14/§15.

**In scope:** reservation management (filter/approve/assign), the table/floor map, SOP/checklist/task views for Manager and Chef, photo/geo evidence capture.

**Out of scope:** dashboards (Phase 16).

**Acceptance criteria:** outlet scoping is correctly enforced in the UI (a Manager only ever sees their outlet); the floor map stays fast and simple, per the scope document's explicit instruction to avoid unnecessary visual complexity; camera/location permission failures are handled gracefully.

**Required tests:** an end-to-end test of the full daily-operations flow (manager assigns a task → employee completes it with photo/geo evidence → manager reviews).

```
PHASE 15 — Manager/Staff Operations UI

Build the staff-facing operations screens:
- Reservation management view: filter by outlet/date/status, view customer details,
  approve/reject, modify, allocate table, change status.
- A table/floor map that is fast and practical for restaurant staff — the scope
  document explicitly warns against unnecessary visual complexity here, so keep it
  simple: a clear grid or layout showing table status by color, not an elaborate
  drag-and-drop floor designer.
- SOP/checklist/task views for Manager (assign, monitor) and Chef (see assigned
  tasks, update status).
- Photo/geo evidence capture UI that respects browser camera/location permission
  prompts and degrades gracefully if permission is denied (per Phase 6's backend
  handling).

Do not build the management dashboards yet — that's Phase 16. Write an end-to-end
test covering the full daily-operations flow from the scope document (manager assigns
a task, an employee completes it with photo/geo evidence, manager reviews it), and
re-verify outlet scoping holds at the UI layer. When finished, show me it working and
update PHASE_LOG.md. Then stop and wait for my confirmation before Phase 16.
```

---

## PHASE 16 — Management Dashboards UI

**Objective:** Role-based dashboards from scope doc §12/§13, rendering the Phase 9 data layer.

**In scope:** dashboard views per role's access scope, charts for every metric in Master Brief §9.

**Out of scope:** anything not already computed by Phase 9's data layer.

**Acceptance criteria:** every number shown on screen matches the corresponding Phase 9 metric test's expected value; role gating holds (a Manager only sees their outlet's dashboard, Owner/Super Admin see everything).

**Required tests:** a UI-level test asserting displayed values match the Phase 9 fixture-based expected values; a role-gating test per dashboard.

```
PHASE 16 — Management Dashboards UI

Build the role-based management dashboards, rendering the Phase 9 data layer:
- Owner/Management: business-wide visibility across all outlets.
- Admin: system and operational administration view.
- Manager: outlet-level operations view.
- Chef, HR, Accountant: their respective relevant views per Master Brief §4/§11.
- Render every metric from Master Brief §9 as an appropriate chart or summary card.

Every number on screen must come from the exact Phase 9 view/RPC — do not
recompute anything client-side. Write a test asserting the displayed dashboard values
match the same fixture data and expected values used in the Phase 9 backend tests,
and a role-gating test confirming each role only sees what it's entitled to. When
finished, show me the dashboards and update PHASE_LOG.md. Then stop and wait for my
confirmation before Phase 17.
```

---

## PHASE 17 — Realtime, Notifications UI & Final Polish

**Objective:** Wire Supabase Realtime for live floor/table status, add a notification inbox, and apply interface polish.

**In scope:** realtime subscriptions on table/floor status for manager views; a notification bell/inbox reading from the `notifications` table; animation/interaction polish per the original tech stack's "CSS Transitions & Motion" line.

**Out of scope:** new backend logic.

**Acceptance criteria:** a table status change in one manager's session appears in another manager's session within a few seconds without a manual refresh; the notification inbox correctly reflects the Phase 10 data.

**Required tests:** a realtime propagation test (change status in one client, assert it appears in another within a bounded time); a notification-inbox test.

```
PHASE 17 — Realtime, Notifications UI & Final Polish

Add the interactive/live layer:
- Wire Supabase Realtime so table/floor status changes propagate live to all open
  manager sessions for that outlet, without a manual refresh.
- Build a notification bell/inbox UI reading from the notifications table built in
  Phase 10.
- Apply interface polish: transitions and micro-interactions consistent with the
  design system from Phase 12 — nothing gimmicky, just smooth and professional.

Do not add any new backend logic in this phase — everything here should be wiring
existing data live. Write a test that changes a table's status in one simulated
session and asserts it appears in another within a few seconds, and a test for the
notification inbox rendering correctly. When finished, show me it working and update
PHASE_LOG.md. Then stop and wait for my confirmation before Phase 18.
```

---

## PHASE 18 — Full System QA, UAT Preparation & Responsive/Device Testing

**Objective:** The end-to-end testing pass from scope doc §34, across the whole product, plus preparing Mayflower's own team to test it.

**In scope:** full regression across backend + frontend together, a device/browser test matrix, a UAT script for Mayflower stakeholders, a bug list with severity, the Definition of Done checklist.

**Out of scope:** new features (bugs found here get fixed, not expanded scope).

**Acceptance criteria:** the Definition of Done checklist in `05_Testing_QA_Framework.md` §3 is 100% green, or every unchecked item has an explicit, written reason from me for waiving it.

**Required tests:** the complete regression suite (everything from Phases 0–17); manual device/browser pass; the UAT script walked through at least once internally before handing it to the client.

```
PHASE 18 — Full System QA, UAT Preparation & Responsive/Device Testing

Run the full end-to-end quality pass before this goes anywhere near production:
- Run the complete regression suite from every prior phase, backend and frontend
  together.
- Do a manual pass across a realistic device/browser matrix (at minimum: latest
  Chrome and Safari on desktop, and one recent Android and one recent iOS device or
  emulator) for both the public website and the staff-facing app.
- Re-verify permission testing at the UI layer across every role.
- Test file upload validation, photo/location permission flows, and integration
  failure/error-path handling explicitly (e.g., what happens if a mocked adapter
  call fails).
- Write /docs/uat-script.md: a step-by-step script covering the four core user flows
  from the scope document (customer reservation, daily operations, new outlet
  creation, management data review) that Mayflower's own team can walk through.
- Produce a bug list with severity ratings (see Mayflower_05_Testing_QA_Framework.md
  §7) and fix everything Critical/High before calling this phase done.
- Walk through the Definition of Done checklist in
  Mayflower_05_Testing_QA_Framework.md §3 and report the status of every item.

When finished, show me the regression results, the bug list, and the Definition of
Done status. Do not proceed to Phase 19 until every Critical/High item is resolved and
I've reviewed the UAT script. Then stop and wait for my confirmation before Phase 19.
```

---

## PHASE 19 — Production Deployment & Handover

**Objective:** The handover package from scope doc §41.

**In scope:** production Supabase project + Vercel production deployment, environment variable audit, domain/HTTPS, backup strategy confirmation, and the full documentation handover package.

**Out of scope:** anything not already built and tested in Phases 0–18.

**Acceptance criteria:** a production smoke test passes; every item in scope doc §41's handover list exists and is handed over.

**Required tests:** a production smoke test covering the core flows once more, against the real production environment.

```
PHASE 19 — Production Deployment & Handover

Deploy to production and assemble the handover package:
- Stand up the production Supabase project and apply all migrations.
- Deploy to Vercel production, with a proper custom domain and HTTPS.
- Audit every environment variable end-to-end (nothing missing, nothing left as a
  placeholder, no secret checked into source).
- Confirm and document the backup strategy for the production database.
- Assemble the full handover package: production environment/URL, admin access
  instructions, user/role configuration guide, source repository access, environment/
  configuration documentation, the integration go-live checklist from Phase 8, basic
  deployment documentation, a list of known limitations/dependencies (pull directly
  from Master Brief §11's still-open items), and the UAT sign-off record from
  Phase 18.
- Run a full production smoke test covering the four core user flows once more,
  against the real production environment this time.

When finished, show me the production smoke test results and the assembled handover
package. This is the final phase — report a summary of the entire build against the
original scope document for my final review.
```
