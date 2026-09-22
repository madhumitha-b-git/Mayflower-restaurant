# Mayflower Restaurant & Sanctuary Management System
## Comprehensive Technical Documentation, Architecture & Integration Guide

---

## 1. Executive Summary & Project Overview

Mayflower Cafe & Dining is a premier multi-outlet luxury hospitality ecosystem located in Chennai, India. The application bridges two core domains:
1. Public Luxury Guest Experience: A guest-facing web portal for exploring global fusion menus, discovering sanctuaries, reserving dining tables, applying for franchise opportunities, purchasing gifting Moment Cards, and reading visitor testimonials.
2. Enterprise Multi-Role Staff Portal: A role-based operations management console powering 7 distinct operational roles (Super Admin, Owner, Admin, Manager, Chef, HR, Accountant) across 4 flagship Chennai sanctuaries:
   - Poes Garden Flagship
   - Palavakkam ECR Seaside
   - Egmore Heritage Manor
   - Anna Nagar East Pavilion

---

## 2. What We Have Built & Completed

### A. Public Guest Experience (`/`, `/reservations`, `/login`)
- Hero & Philosophy Experience: High-fashion typography with Cinzel and serif typography, smooth section transitions, and luxury brand assets.
- Table Reservation System:
  - Multi-outlet booking engine supporting party size, date/time picker, dietary preferences, and seating zones (Sanctuary Garden, High-Table Bar, Private Dining, Indoor Saloon).
  - Live table booking connected to Supabase PostgreSQL database.
  - Dedicated public booking route (`/reservations`) with URL search query param support (`?outlet=...`).
- Reviews & Testimonials Carousel:
  - Interactive auto-playing testimonial carousel with pause-on-hover, drag/touch gestures, rating stars, and verified guest citations.
  - Primary navigation "Reviews" item smoothly scrolling into the `#testimonials` section.
- Global Food & Beverage Menu:
  - Categorized menu display (Pan-Asian, Italian, Mediterranean, French, Desserts, Artisanal Beverages).
  - Real-time live synchronization with the Admin Menu CRUD panel.
- Franchise Enquiry Portal:
  - Multi-step modal for franchise applicants, collecting investment budgets, target cities, commercial backgrounds, and document uploads.
  - Linked to Supabase storage bucket `franchise-documents` with RLS protection.
- Mayflower Moment Cards:
  - Digital gifting cards with custom card themes, personal messaging, and instant balance crediting to patron profiles.
- Authentication & Security:
  - User registration and login with email verification OTP codes.
  - Password hashing via Web Crypto SHA-256 with salt.
  - Dedicated password reset and email verification routes (`/forgot-password`, `/verify-email`).
  - Strict input sanitization preventing XSS and injection vulnerabilities.

---

### B. Staff Dashboards & Operational Suites

#### 1. Super Admin Dashboard (`/superadmin`)
- Centralized Executive Command:
  - Executive telemetry: Active outlets, staff headcount, active reservations, system health status.
  - Recent Reservations Ledger: Live customer booking stream with emerald `Reserved` status badges and guest party metadata.
  - Staff Governance: Directory oversight with outlet filtering, active status toggling, and role provisioning.
  - SOPs & Checklists: Enterprise compliance tracking across all 12 operational checklist categories.
  - Audit Log Removal (Completed): Cleaned out audit log tabs, routes, and views per executive instruction to maintain an agile, clutter-free dashboard.

#### 2. Admin Dashboard (`/admin`)
- Operational Metrics:
  - Total real customer reservations counter (displaying all 5 database customer bookings: Vanitha, Janakiraman, Madhu [2 bookings], VJ).
  - Unresolved guest feedback indicator with real-time feedback review.
- Menu Management (CRUD):
  - Real-time dish creation, price adjustment, dietary tagging (Veg, Non-Veg, Vegan, Gluten-Free), and instant status publishing.
- Franchise Inquiries Review:
  - Admin inspection panel for incoming franchise partner applications.

#### 3. Manager Dashboard (`/manager`)
- Floor & Table Orchestration:
  - Visual floor layout with table allocation, capacity monitoring, and booking status controls (Reserved, Seated, Completed, Cancelled).
- Shift Checklist Approvals:
  - Review of opening and closing checklists submitted by line staff.
- Guest Feedback Resolution:
  - Feedback triage queue where managers can review diner ratings and mark issues as resolved.

#### 4. Chef Dashboard (`/chef`)
- Kitchen Checklist & Operations:
  - Preparation checklists, temperature monitoring, and kitchen hygiene standards.
- Photo Evidence Capture:
  - Direct camera capture/upload modal for proof of completed tasks.
  - Auto-captures GPS coordinates (latitude/longitude) and stores imagery in Supabase storage bucket `sop-evidence`.

#### 5. HR Dashboard (`/hr`)
- Staff Directory & Lifecycle:
  - Department filtering (Kitchen, Front of House, Management, Administration).
  - New staff onboarding modal with automated email credentials dispatch.
- Shift & Leave Management:
  - Pending leave request approval/rejection pipeline.
  - Punch-in/punch-out attendance and activity log telemetry.

#### 6. Accountant Dashboard (`/accountant`)
- Financial Intelligence:
  - Daily Petpooja POS register reconciliation (Z-Reports).
  - Cash vs digital card/UPI variance analysis.
  - Official CA-signed PDF audit report export.

#### 7. Customer Dashboard (`/customer`)
- Patron Portal:
  - Upcoming and historical table reservations with cancel/modify capabilities.
  - Loyalty point balance, tier badge (Green, Gold, Sanctuary VIP), and rewards ledger.
  - Post-dining feedback submission modal.

---

### C. Major Bug Fixes & Refactoring Completed
1. Live Reservations Pipeline:
   - Replaced static mock reservations with real Supabase queries deduplicating customer profiles and relational reservation rows.
2. Elimination of Customer Data in Staff Directory:
   - Filtered out all `Customer` and `Guest` profiles from staff directories in `StaffView.tsx`, `adminService.ts`, and `HRDashboard.tsx`.
3. Removal of Mock Financial Figures:
   - Removed arbitrary mock revenue values (`₹ 48,500.00`, etc.) and replaced with live customer table reservations.
4. Audit Log Removal in Super Admin:
   - Completely excised the `audit-log` navigation tab, view imports, and routing references from Super Admin.
5. Navigation Architecture:
   - Replaced former rewards navigation item with Reviews, smooth-scrolling directly to the `#testimonials` section.

---

## 3. System Architecture & Technical Specifications

- Frontend Framework: React 18.3.1 with TypeScript 5.7.3
- Bundler & Tooling: Vite 5.4.14
- Routing: React Router DOM 7.18.4 (with ProtectedRoute and Role-based gatekeepers)
- Styling: Tailwind CSS 3.4.17 with custom heritage palette
- Icons: Lucide React 0.475.0
- Database & Storage: Supabase Cloud PostgreSQL 15 with Row-Level Security
- Email Service: Google OAuth2 Gmail API with HTML template engine
- Testing Framework: Vitest 3.0.6 with React Testing Library (23 test suites, 165 automated unit & integration tests)

---

## 4. UI/UX Design System & Theme

### Color Palette
- Primary Sanctuary Green: `#16221E` (Dark Deep Forest), `#2D4030` (Muted Olive Pine)
- Heritage Accent Gold: `#C29B38` (Antique Brass), `#E4C27D` (Champagne Gold), `#967C3B` (Ochre)
- Background Parchment: `#FAF7F2` (Alabaster Cream), `#F7F5F0` (Ivory Linen), `#FFFFFF` (Card Surface)
- Neutral Charcoal: `#1A1A1A` (Primary Text), `#5A5A40` (Secondary Olive), `#8C887C` (Muted Zinc)
- System Accents: Emerald `#10B981` (Confirmed/Reserved), Amber `#F59E0B` (Pending), Rose `#EF4444` (Critical)

### Typography
- Headings & Brand Title: `Cinzel`, `Playfair Display`, serif with subtle letter-spacing (`tracking-wider`)
- Body & Controls: `Inter`, system sans-serif with high readability
- Telemetry & Codes: `JetBrains Mono`, monospace for booking references (`#MF-5512`) and timestamps

---

## 5. Security & RBAC Model

The Role-Based Access Control matrix is implemented via pure predicate functions in `src/rbac/policies.ts`:
- Super Admin: Universal access to outlets, staff, SOPs, checklists, customer dossiers, franchise leads.
- Owner: High-level business overview, financials, multi-outlet analytics.
- Admin: Single-outlet administration, menu items CRUD, table reservation monitoring, feedback reviews.
- Manager: Floor plan, table allocation, shift checklist signoffs, customer feedback triage.
- Chef: Kitchen station checklists, temperature tracking, photo evidence capture with GPS location.
- HR: Employee directory, staff onboarding, shift & leave requests, attendance logs.
- Accountant: Daily Petpooja POS register reconciliation, variance tracking, audit PDF export.
- Customer: Table reservations, profile management, moment card gifting, loyalty points, feedback submission.

---

## 6. How We Tested & Verified

### Automated Test Suite (Vitest)
- Total Test Files: 23 passed (100%)
- Total Tests: 165 passed (100%)
- TypeScript Static Verification: `npx tsc --noEmit` exited with 0 errors.
- Production Build: `npm run build` generated optimized bundles in 10.72s.

---

## 7. Pending Tasks & Integration Roadmap

### Priority 1: Automated Vercel Deployment Linkage
- Status: Git branch `main` and `madan-branch` are up-to-date with all latest commits (`8cf0525`).
- Action Required: In the Vercel dashboard, click "Connect Git Repository" on the `mayflower` project card and link to `madhumitha-b-git/Mayflower-restaurant`.
- Environment Variables: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in Vercel Project Settings.

### Priority 2: Petpooja POS API Integration
- Current State: Adapter layer (`src/modules/integrations/pos.adapter.ts`) is designed and interfaces are typed.
- Pending Step:
  1. Acquire production Petpooja API credentials (App Key, App Secret, RestID).
  2. Implement webhook listener in Supabase Edge Functions (`/functions/petpooja-webhook`) to receive real-time table billing status and auto-close reservations.

### Priority 3: Production Email Gateway (Resend / SendGrid / Amazon SES)
- Current State: Operational via Gmail API OAuth2 using refresh token in `api/gmailService.ts` and `api/send-email.ts`.
- Recommended Production Step: Migrate from personal Gmail OAuth to a dedicated transactional provider (e.g. Resend or Amazon SES) for high email sending volume.

### Priority 4: Payment Gateway Integration (Advance Table Cover Deposits)
- Objective: Collect optional cover fee deposits for VIP and peak weekend dinner reservations to minimize no-shows.
- Recommended Stack: Razorpay / Stripe integration embedded into `PlanYourVisit.tsx`.

### Priority 5: Automated SMS & WhatsApp Notifications
- Objective: Instant WhatsApp booking confirmation messages with Google Maps sanctuary directions.
- Recommended Provider: Twilio or Gupshup WhatsApp Business API triggered via Supabase Database Webhooks on `INSERT INTO reservations`.

---
*Document generated on: September 23, 2026*  
*Repository: madhumitha-b-git/Mayflower-restaurant*  
*Primary Branches: main, madan-branch*

