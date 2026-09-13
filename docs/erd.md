# Mayflower Phase 1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    PROFILES ||--o{ USER_OUTLETS : "scoped to"
    OUTLETS ||--o{ USER_OUTLETS : "has staff"
    OUTLETS ||--o{ FLOORS : "contains"
    FLOORS ||--o{ TABLES : "houses"
    OUTLETS ||--o{ MENU_CATEGORIES : "defines"
    MENU_CATEGORIES ||--o{ MENU_ITEMS : "includes"
    PROFILES ||--o{ RESERVATIONS : "books"
    OUTLETS ||--o{ RESERVATIONS : "receives"
    TABLES ||--o| RESERVATIONS : "assigned to"
    OUTLETS ||--o{ SOPS : "has SOPs"
    SOP_CATEGORIES ||--o{ SOPS : "categorized by"
    OUTLETS ||--o{ CHECKLISTS : "schedules"
    SOPS ||--o| CHECKLISTS : "derived from"
    CHECKLISTS ||--o{ CHECKLIST_TASKS : "contains"
    CHECKLIST_TASKS ||--o{ TASK_EVIDENCE : "attaches"
    OUTLETS ||--o{ FEEDBACK : "rated in"
    PROFILES ||--o| FEEDBACK : "submitted by"
    FRANCHISE_ENQUIRIES ||--o{ FRANCHISE_DOCUMENTS : "includes"
    OUTLETS ||--o{ INTEGRATION_CONFIGS : "configures"
    PROFILES ||--o{ NOTIFICATIONS : "receives"
    PROFILES ||--o| AUDIT_LOGS : "acted by"
```

## Entity Summary Table
| Entity | Module | Description | RLS State |
|---|---|---|---|
| `profiles` | Identity | User roles, contact info, status (extends `auth.users`) | Default Deny |
| `user_outlets` | Identity | Outlet assignment join table | Default Deny |
| `outlets` | Outlets | Restaurant outlets, operating hours, status | Default Deny |
| `floors` | Outlets | Floor levels per outlet | Default Deny |
| `tables` | Outlets | Physical dining tables, capacity, position | Default Deny |
| `menu_categories` | Menu | Food/beverage categories | Default Deny |
| `menu_items` | Menu | Dishes, pricing, availability | Default Deny |
| `reservations` | Reservations | Guest bookings & table assignment status | Default Deny |
| `sop_categories` | Operations | Standard operational categories | Default Deny |
| `sops` | Operations | Standard Operating Procedures | Default Deny |
| `checklists` | Operations | Scheduled operational checklists | Default Deny |
| `checklist_tasks` | Operations | Specific tasks with priority and due date | Default Deny |
| `task_evidence` | Operations | Uploaded photo/geo metadata evidence | Default Deny |
| `feedback` | Feedback | Guest ratings and comments | Default Deny |
| `franchise_enquiries`| Franchise | Franchise application leads | Default Deny |
| `franchise_documents`| Franchise | Applicant documents | Default Deny |
| `integration_configs`| Integrations | Petpooja, Loyalty, CCTV adapter configs | Default Deny |
| `notifications` | System | Multi-channel notification queue | Default Deny |
| `audit_logs` | System | Material action log | Default Deny |
