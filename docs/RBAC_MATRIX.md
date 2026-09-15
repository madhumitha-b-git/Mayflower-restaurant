# Mayflower RBAC Permission Matrix

This document defines the strict, authoritative Role-Based Access Control (RBAC) permission matrix across all 8 supported roles in the Mayflower platform.

## Legend
- **All**: Unrestricted read and write access across all outlets.
- **Outlet-Scoped**: Read and write access limited to the staff member's assigned outlet(s).
- **Own-Only**: Access restricted exclusively to records created by or belonging to the authenticated user (`user_id` / `customer_id` match).
- **Read-Only (All)**: View-only access across all outlets; no modification privileges.
- **Read-Only (Outlet)**: View-only access limited to the assigned outlet(s).
- **None**: Zero read or write access; blocked at both the UI and data-access layers.

---

## Permission Matrix Table

| Entity / Domain | Super Admin | Owner / Mgmt | Admin | Manager | Chef | HR | Accountant | Customer |
|---|---|---|---|---|---|---|---|---|
| **Outlets & Floors** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Read-Only (Outlet) | Read-Only (All) | Read-Only (All) | Read-Only (Published) |
| **Tables & Seating** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Read-Only (Outlet) | None | None | None |
| **Menu Items & Categories** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Read-Only (Outlet) | None | None | Read-Only (Published) |
| **Reservations** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Read-Only (Outlet) | None | None | Own-Only |
| **SOPs, Checklists & Tasks** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Own-Only (Assigned) | None | None | None |
| **Task Evidence** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | Own-Only (Uploaded) | None | None | None |
| **Customer Feedback** | All | Read-Only (All) | Outlet-Scoped | Outlet-Scoped | None | None | None | Own-Only |
| **Franchise Enquiries** | All (incl. internal notes) | Read-Only (all, notes hidden) | Outlet-Scoped | None | None | None | None | Public Create Only |
| **Integration Configs** | All | Read-Only (All) | None | None | None | None | Read-Only (Financials) | None |
| **Audit Logs** | All | Read-Only (All) | Read-Only (Outlet) | Read-Only (Outlet) | None | None | None | None |
| **Staff Directory & Roles** | All (Full User & Role Mgmt) | Read-Only (Directory) | Read-Only (Outlet) | Read-Only (Outlet) | None | Read-Only (Directory & Roster) | None | None |
| **Loyalty & Points** | All | Read-Only (All) | Read-Only (Outlet) | Read-Only (Outlet) | None | None | None | Own-Only |

---

## Role Definitions & Scoping Principles

1. **Super Admin**: System owner with complete administrative access across all outlets, system configurations, user directory, role assignments (`assignRole`), and audit logs.
2. **Owner / Management**: Strategic executive role providing business-wide operational visibility across all outlets with read-heavy metrics, feedback review, and financial overviews.
3. **Admin**: Operational cluster controller managing reservations, table layouts, menu items, checklists, and feedback for assigned outlets.
4. **Manager**: Outlet floor commander managing daily table assignments, reservation approvals, staff checklist monitoring, and customer feedback resolution.
5. **Chef**: Kitchen lead managing assigned kitchen SOPs, prep checklists, KDS order tickets, and station task completions.
6. **HR**: Human Resources lead with access to employee directory, staff rosters, shift schedules, and attendance logs — strictly excluding payroll and ERP per Scope §6.
7. **Accountant**: Financial auditor with read-only access to aggregated operational metrics, Z-Reports, POS reconciliation data, and reservation volume analytics.
8. **Customer**: Guest account with access limited strictly to their own reservations, loyalty points balance, and feedback history.
