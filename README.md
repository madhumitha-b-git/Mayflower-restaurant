# 🌸 Mayflower Restaurant Platform

> A comprehensive, modern enterprise restaurant management and customer engagement platform built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
  - [1. Customer Portal & Public Website](#1-customer-portal--public-website)
  - [2. Authentication, OTP & Email Automation](#2-authentication-otp--email-automation)
  - [3. Role-Based Access Control (RBAC) & Dashboards](#3-role-based-access-control-rbac--dashboards)
  - [4. Data Architecture & Integrations](#4-data-architecture--integrations)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Architecture & Tech Stack](#-architecture--tech-stack)

---

## 🌟 Overview

The **Mayflower Restaurant Platform** seamlessly connects guests with multi-outlet fine dining experiences while providing fine-grained operational control for restaurant staff, chefs, branch managers, accountants, HR personnel, administrators, and executive owners.

---

## ✨ Key Features & Modules

### 1. Customer Portal & Public Website
- **Hero & Brand Experience**: Immersive hero section with responsive storytelling, high-resolution imagery, and quick action CTA buttons.
- **Dynamic Interactive Menu**:
  - Filterable by categories (*Starters, Mains, Biryani, Desserts, Beverages, Chef Specials*).
  - Dietary tagging (*Veg, Non-Veg, Vegan, Chef Recommended, Spice Levels*).
  - Real-time search and instant pricing/availability sync with admin dashboard updates.
- **Multi-Outlet Locator**:
  - Detailed directory for outlets (*Anna Nagar, T. Nagar, Velachery, etc.*).
  - Operating hours, contact numbers, address links, place imagery, and direct Google Maps directions.
- **Table Reservation Engine**:
  - Instant online booking with outlet selection, date/time slot pickers, party size, and dietary requirements.
  - Real-time slot availability validation and automatic confirmation notification delivery.
- **Loyalty & Rewards Club**:
  - Multi-tier loyalty points system (*Bronze, Silver, Gold, Platinum*).
  - Point redemption tracking, member milestone rewards, and member perks.
- **Community & Social Connection**:
  - Customer review and testimonials carousel.
  - "Mayflower Moments" gallery with direct Instagram profile connect links.
  - Franchise enquiry submission system with automated owner dispatch.

---

### 2. Authentication, OTP & Email Automation
- **Multi-Role Authentication**:
  - Dedicated sign-in and registration flows for Customers and Staff across 8 granular roles.
  - Strict RFC-compliant email validation and secure credential handling.
- **6-Digit OTP Verification System**:
  - Verification codes for user onboarding and password reset workflows.
  - Expiration timers, maximum resend attempt limiters, and anti-abuse safeguards (`api/otpStore.ts`).
- **Transactional Email Automation Engine**:
  - Integrated Gmail API service (`api/gmailService.ts` / `api/send-email.ts`) with seamless development mock mode.
  - Responsive branded HTML email templates (`api/emailTemplates.ts`):
    - ✉️ *Welcome & Account Activation*
    - 🔢 *6-Digit Verification & Reset OTP*
    - 📅 *Table Reservation Confirmation with QR / Booking Code*
    - 💼 *Franchise Opportunity Alert & Customer Feedback Dispatch*

---

### 3. Role-Based Access Control (RBAC) & Dashboards

Each role is guarded with dedicated declarative routes (`src/routes/AppRoutes.tsx` & `ProtectedRoute.tsx`) and customized dashboards:

| Role | Dashboard & Key Capabilities |
| :--- | :--- |
| 👤 **Customer** | View loyalty points, redeem vouchers, inspect booking history, manage profile preferences. |
| 👨‍🍳 **Chef / Kitchen** | Real-time Kitchen Order Tickets (KOT), recipe catalog, stock & inventory monitors, HACCP compliance checklist, task evidence photo capture & upload modal. |
| 👔 **Manager** | Interactive visual floor map with live table states (*Available, Reserved, Occupied, Billing, Cleaning*), staff table assignment, reservation management, daily shift logs. |
| 🛠️ **Admin** | Full Menu CRUD management with instant live sync, outlet settings, category organization, pricing controls. |
| 🛡️ **Super Admin** | Platform-wide governance, outlet provisioning, employee role assignments, security audit log streams. |
| 📊 **Owner / Executive** | Real-time revenue analytics, branch-by-branch sales metrics, top-selling dishes, footfall trends. |
| 💰 **Accountant** | Daily financial ledgers, tax/GST calculations, discount audit reports, POS reconciliation sync. |
| 👥 **HR Manager** | Staff directory, shift scheduling & rosters, attendance tracking, leave approval workflows. |

---

### 4. Data Architecture & Integrations
- **Supabase / PostgreSQL Data Layer**:
  - 10 version-controlled SQL migration scripts in `supabase/migrations/`.
  - Comprehensive schemas for user profiles, reservations, outlets, menu items, orders, tables, audit logs, and SOP tasks.
  - Row Level Security (RLS) policies enforcing role boundaries at the database level.
  - Storage bucket integration for SOP HACCP task photo evidence.
- **Provider-Agnostic Service Layer**:
  - Clean modular architecture in `src/modules/` separating business logic from UI components.
  - Mock integration adapters for POS (*Petpooja*), CCTV telemetry, and external Loyalty providers.

---

## 📁 Project Structure

```
Mayflower-restaurant/
├── api/                             # Backend serverless API & email handlers
│   ├── emailTemplates.ts            # Responsive branded HTML email templates
│   ├── gmailService.ts              # Gmail API dispatch integration
│   ├── otpStore.ts                  # In-memory OTP storage & validation
│   └── send-email.ts                # Unified email API handler
├── docs/                            # Project specifications & architecture docs
│   ├── Mayflower_01_Master_Project_Brief.md
│   ├── Mayflower_02_Database_Schema_and_RLS_Design.md
│   ├── RBAC_MATRIX.md               # Role permissions matrix
│   └── uat-script.md                # User acceptance testing scripts
├── public/                          # Static assets and images
├── src/
│   ├── components/                  # UI components
│   │   ├── dashboards/              # Role-specific dashboard views
│   │   │   ├── ChefDashboard.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── SuperAdminDashboard.tsx
│   │   │   ├── AccountantDashboard.tsx
│   │   │   ├── HRDashboard.tsx
│   │   │   └── CustomerDashboard.tsx
│   │   ├── AuthModal.tsx            # Login & registration modal
│   │   ├── HeroCarousel.tsx         # Brand hero carousel
│   │   ├── MenuSection.tsx          # Dynamic filterable menu
│   │   ├── OutletsSection.tsx       # Outlet locator with map directions
│   │   ├── PlanYourVisit.tsx        # Table reservation modal
│   │   └── ManagerFloorMap.tsx      # Interactive live table layout
│   ├── data/                        # Local mock & fallback data stores
│   ├── hooks/                       # Reusable React hooks
│   ├── modules/                     # Domain modules (reservations, outlets, ops, etc.)
│   ├── pages/                       # Top-level routed pages
│   │   ├── PublicWebsitePage.tsx    # Customer portal
│   │   ├── LoginPage.tsx            # Dedicated auth page
│   │   ├── VerifyEmailPage.tsx      # OTP verification page
│   │   └── ForgotPasswordPage.tsx   # Password reset page
│   ├── routes/                      # Route definitions & RBAC route protection
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── types/                       # TypeScript definitions & Supabase DB types
│   ├── App.tsx                      # Root component
│   └── main.tsx                     # Vite application entry point
├── supabase/
│   ├── migrations/                  # 10 production SQL schema migrations
│   └── seed.sql                     # Seed data for initial outlets & users
├── tests/                           # Complete Vitest test suites (21 test files)
├── package.json                     # Project scripts and dependencies
├── tailwind.config.js               # Styling configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite bundler configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Automation Service (Optional in Dev - falls back to dev logger/mock outbox)
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-google-oauth-client-id
GMAIL_CLIENT_SECRET=your-google-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-google-oauth-refresh-token

# Mode Flags
NODE_ENV=development
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/madhumitha-b-git/Mayflower-restaurant.git

# Navigate into the project folder
cd Mayflower-restaurant

# Install dependencies
npm install
```

### 3. Running in Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Building for Production
```bash
npm run build
```

---

## 🧪 Testing & Quality Assurance

The codebase includes an extensive automated test suite covering routing, database schemas, RBAC rules, outlets, reservations, operations, SOP evidence uploads, email OTP, and dashboard UI interactions:

```bash
# Run all Vitest test suites
npm run test
```

### Test Coverage Highlights:
- ✅ **146+ Automated Tests** across **21 Test Suites** (100% Passing)
- ✅ **Schema & Migration Tests**: Verifies Postgres enum constraints, triggers, and foreign keys.
- ✅ **RBAC Matrix Tests**: Asserts strict route and API isolation between all 8 user roles.
- ✅ **Email & OTP Tests**: Validates 6-digit code generation, expiration logic, and responsive HTML template rendering.
- ✅ **Operations & HACCP Evidence Tests**: Tests task checklists, image evidence uploads, and table status transitions.
- ✅ **Menu CRUD Tests**: Tests admin creation, price updates, category filters, and live customer portal sync.

---

## 🛠️ Architecture & Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) / [PostgreSQL](https://www.postgresql.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)
- **Email Service**: Gmail REST API with OAuth2 / local fallback outbox
