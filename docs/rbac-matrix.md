# Mayflower RBAC Permission Matrix

**Authoritative reference:** `Mayflower_02_Database_Schema_and_RLS_Design.md` §5 & Phase 2 Migration (`20260913000001_auth_rbac_rls_policies.sql`).

Legend:
- **Full**: Full CRUD permissions
- **RW**: Read and Write permissions
- **R**: Read-only permissions
- **Own**: Restricted to user's own records
- **None**: No access permitted

| Entity / Resource | Super Admin | Owner / Mgmt | Admin | Manager | Chef | HR | Accountant | Customer | Anonymous |
|---|---|---|---|---|---|---|---|---|---|
| `profiles` | Full | R | RW (scoped) | R | R | R | R | Own | None |
| `user_outlets` | Full | R | Full | R | None | R | None | None | None |
| `outlets` | Full | R (all) | Full (own) | RW (own) | R (own) | R (own) | R (own) | Published | Published |
| `floors` & `tables` | Full | R (all) | Full (own) | Full (own) | R+Status | None | None | None | None |
| `menu_categories` & `menu_items` | Full | R (all) | Full | RW (own) | R (own) | None | None | Published | Published |
| `reservations` | Full | R (all) | Full | Full (own) | R (kitchen) | None | None | Own | None |
| `sops` & `checklists` | Full | R (all) | Full | Full (own) | R (assigned) | R (draft) | None | None | None |
| `checklist_tasks` | Full | R (all) | Full | Full (own) | Own-assigned RW | None | None | None | None |
| `task_evidence` | Full | R (all) | R (own) | R (own) | Own upload | None | None | None | None |
| `feedback` | Full | R (all) | RW status | RW status | None | None | None | Own | Insert |
| `franchise_enquiries` | Full + Notes | R (all) | Full + Notes | None | None | None | None | None | Insert |
| `integration_configs` | Full | R (all) | R (own) | None | None | None | R (mocked) | None | None |
| `audit_logs` | R (all) | R (all) | R (own) | R (own) | None | None | None | None | None |
| `notifications` | Full | Own | Own | Own | Own | Own | Own | Own | None |

> [!NOTE]
> **TBD Flags**: HR and Accountant permission scopes are configured as reasonable drafts (HR can view SOPs/checklists/outlets; Accountant can view integrated configs/reports). Pending final client signoff per Master Brief §11.
