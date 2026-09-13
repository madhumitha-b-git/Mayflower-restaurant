# Mayflower Phase 1 — Testing & QA Framework

**Purpose:** a single reusable reference the agent checks itself against at the end of every phase, so "done" means the same thing every time instead of being redefined phase to phase.

---

## 1. Testing Philosophy

Build the test pyramid in this order of priority:

1. **Unit tests** — fast, isolated, no network/database. Business logic (state machine guards, escalation timing, validation rules).
2. **Integration tests** — run against a real local Supabase instance (via `supabase start`), exercising actual RLS policies, triggers, and storage rules. This is where most of the confidence in a Supabase-first backend actually comes from — RLS bugs are invisible to pure unit tests.
3. **End-to-end tests** — from Phase 13 onward, exercising real user flows through the UI (Playwright recommended).
4. **Manual/UAT** — Phase 18, humans walking through the scripted scenarios.

A phase is not complete just because the code runs — it's complete when the required tests for that phase (specified in each phase prompt) exist, pass, and were reviewed.

---

## 2. Recommended Tooling

| Purpose | Tool |
|---|---|
| Unit & integration test runner | Vitest |
| Component tests | Vitest + Testing Library |
| Backend/RLS integration tests | Vitest (or pgTAP) against a local `supabase start` instance |
| End-to-end tests | Playwright |
| Linting/type safety | ESLint + TypeScript strict mode |
| CI | GitHub Actions or Vercel's built-in pipeline |

---

## 3. Universal Definition of Done (checked at the end of every phase)

- [ ] Required functionality for this phase is implemented per its prompt
- [ ] Correct permissions/RLS enforced for every new table or endpoint touched
- [ ] Required tests for this phase exist and pass
- [ ] No secret, key, or credential exists in source code or git history
- [ ] `PHASE_LOG.md` has a new entry using the template in §8
- [ ] Any ambiguity or default assumption made this phase is explicitly flagged, not silently baked in
- [ ] Nothing from the Master Brief §6 exclusion list was touched
- [ ] The phase's "out of scope" list was actually respected — no scope creep into the next phase

---

## 4. Backend-Wide Regression Checklist (used at the Phase 11 gate, and again at Phase 18)

- [ ] Every table has Row Level Security enabled
- [ ] Every RBAC matrix cell (Database Schema doc §5) has a passing automated test
- [ ] No table is readable/writable by the anon role except the two explicitly public paths (published outlets/menu, franchise/feedback anonymous insert)
- [ ] File storage buckets deny unauthorized read/write; no bucket is fully public except `outlet-media`
- [ ] Input validation exists server-side for every user-writable field, not just client-side
- [ ] Every material action (per Database Schema doc §8) produces an audit log row
- [ ] State-machine guards (reservation, task, outlet, franchise) reject every invalid transition, tested explicitly
- [ ] Concurrency/double-booking guard holds under simulated simultaneous requests
- [ ] Error handling is consistent (no leaking stack traces or internal details to the client)
- [ ] HTTPS assumptions are correct for production
- [ ] `.env.example` is current and no real secret exists anywhere in the repo history

---

## 5. RBAC Test Matrix Template

Use this as a literal test-tracking artifact during Phase 2 and re-verify it at Phase 11. Mark a cell ✅ only once an automated test exists and passes for it — not when you believe it should work.

| Resource → / Role ↓ | Super Admin | Owner/Mgmt | Admin | Manager | Chef | HR | Accountant | Customer |
|---|---|---|---|---|---|---|---|---|
| Outlets | | | | | | | | |
| Floors & Tables | | | | | | | | |
| Menu | | | | | | | | |
| Reservations | | | | | | | | |
| SOPs/Checklists/Tasks | | | | | | | | |
| Task Evidence | | | | | | | | |
| Feedback | | | | | | | | |
| Franchise Enquiries | | | | | | | | |
| Integration Configs | | | | | | | | |
| Audit Logs | | | | | | | | |
| Own Profile | | | | | | | | |

Expected values for each cell come from Database Schema doc §5. Do not leave a cell blank at the Phase 11 gate — blank means untested, not "assumed fine."

---

## 6. UAT Script Template (for Phase 18)

Structure each scenario as: **Role → Steps → Expected Result → Actual Result → Pass/Fail**. Base the four scenarios directly on the scope document's core user flows:

1. **Customer Reservation** — Website → Outlet → Date/Time → Guests → Login/Register → Reservation Request → Manager Review → Table Assignment → Confirmation.
2. **Daily Operations** — Manager assigns Checklist/Task → Employee completes it → Photo/Geo evidence submitted → Manager reviews → Completed or Escalated.
3. **New Outlet** — Admin creates outlet → Configures content → Approves → Publishes → Confirms it's visible on the public website.
4. **Management Data Review** — Owner/Manager opens dashboard → Confirms reservation, operations, and feedback metrics reflect real current data.

For each scenario, have an actual Mayflower stakeholder (or a stand-in, before real UAT) perform it — don't just re-run your own automated test and call it UAT.

---

## 7. Bug Severity Definitions

| Severity | Definition | Go-live gate |
|---|---|---|
| Critical | Data loss, security/permission bypass, or a core flow is completely broken | Must fix before go-live |
| High | A core flow works but produces wrong results in common cases | Must fix before go-live |
| Medium | An edge case or a secondary flow is broken | Should fix, can be waived with written reason |
| Low | Cosmetic, copy, or minor UX friction | Can ship, track for Phase 2 |

Only Critical/High require blocking go-live, matching the scope document's own instruction that "in-scope critical defects should be resolved before go-live."

---

## 8. PHASE_LOG.md Entry Template

Append one of these per completed phase — this becomes your running project history and doubles as handover documentation.

```markdown
## Phase N — <Name>
**Date completed:** YYYY-MM-DD

**What was built:**
- ...

**Tests run and results:**
- Unit: X/X passing
- Integration: X/X passing
- (e2e, if applicable): X/X passing

**Assumptions made / flagged for client confirmation:**
- ...

**Deviations from the original prompt (if any) and why:**
- ...

**Open questions carried forward:**
- ...
```
