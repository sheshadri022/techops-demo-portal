<div align="center">

# TechOps Portal

### Modern IT Asset & Helpdesk Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-6366f1?style=for-the-badge&logo=render&logoColor=white)](https://techops-portal.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sheshadri022/techops-demo-portal)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

</div>

---

## Project Overview

**TechOps Portal** is a full-stack IT operations platform designed to help IT teams manage hardware assets, track support tickets, and oversee employee equipment — all from a single, polished interface.

It ships with two portals in one app:

- **Admin Portal** — Full IT admin access: asset inventory, helpdesk queue, employee directory, and live dashboard metrics.
- **End-User (Self-Service) Portal** — Employee-facing portal to submit tickets, track request status, and view assigned equipment.

The project is built with a contract-first API (OpenAPI → code-generated hooks), a type-safe PostgreSQL backend, and a fully responsive React frontend with purple & gold branding.

---

## Live Demo

**Frontend:** [https://techops-portal.onrender.com](https://techops-portal.onrender.com)  
**API:** [https://techops-api-76ir.onrender.com/api/healthz](https://techops-api-76ir.onrender.com/api/healthz)

### Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@techopsdemo.com` | `admin123` | Full admin — assets, tickets, employees, dashboard |
| End User | `user@techopsdemo.com` | `user123` | Self-service — submit tickets, view assigned gear |

> **Note:** Hosted on Render's free tier — first load may take ~30 seconds for the service to wake up.

---

## Screenshots

### Login Page
![Login Page](./docs/screenshots/login.jpg)

### Dashboard
![Dashboard](./docs/screenshots/dashboard.jpg)

### Asset Management
![Assets](./docs/screenshots/assets.jpg)

### Helpdesk Tickets
![Tickets](./docs/screenshots/tickets.jpg)

### Employee Directory
![Employees](./docs/screenshots/employees.jpg)

---

## Key Features

### IT Asset Management
- Track laptops, monitors, phones, peripherals, and more
- Filter by status: Available · In Use · Maintenance · Retired
- View full asset detail: brand, model, serial number, purchase date, warranty, assigned user
- Add new assets via dialog form with live validation

### Helpdesk Ticket Management
- Log support tickets with category, priority, and description
- Priority levels: Urgent · High · Medium · Low
- Status workflow: Open → In Progress → Resolved → Closed
- Link tickets to specific assets and requesters

### Live Dashboard
- Summary cards: total assets, open tickets, active employees, urgent issues
- Asset status breakdown chart
- Ticket volume and priority overview
- Quick-access to most recent activity

### Authentication & Access Control
- Client-side auth with role-based routing (Admin vs. End User)
- Admin portal is gated — unauthorized users are redirected to login
- Persistent session via `localStorage`

### Responsive Design
- Mobile-first layout with slide-in sidebar drawer on small screens
- Hamburger menu toggle, adaptive padding, horizontally scrollable tables
- Works on phones (390px), tablets, and wide desktops

### Modern Admin Interface
- Rich purple & gold brand palette
- Smooth transitions, hover states, skeleton loading, empty states
- Toast notifications for all create/update operations
- Built on Radix UI primitives with shadcn/ui components

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI / shadcn-ui |
| Routing | Wouter |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Backend | Express 5 (Node.js 24) |
| Database | PostgreSQL + Drizzle ORM |
| API Contract | OpenAPI 3 → Orval codegen |
| Validation | Zod v4 + drizzle-zod |
| Logging | Pino |
| Package Manager | pnpm workspaces |
| Deployment | Render (Web Service + Static Site) |
| Database Host | Render PostgreSQL / Supabase |
| Build Tool | esbuild (API) + Vite (Frontend) |
| AI-Assisted Dev | Replit AI Agent |

---

## Folder Structure

```
techops-demo-portal/
├── artifacts/
│   ├── api-server/              # Express 5 API service
│   │   ├── src/
│   │   │   ├── app.ts           # Express app setup, middleware
│   │   │   ├── index.ts         # Server entry point, port binding
│   │   │   ├── migrate.ts       # Startup migrations & seed data
│   │   │   ├── routes/
│   │   │   │   ├── assets.ts    # GET/POST /api/assets
│   │   │   │   ├── tickets.ts   # GET/POST /api/tickets
│   │   │   │   ├── employees.ts # GET/POST /api/employees
│   │   │   │   ├── dashboard.ts # GET /api/dashboard/summary
│   │   │   │   └── health.ts    # GET /api/healthz, /api/db-check
│   │   │   └── lib/
│   │   │       └── logger.ts    # Pino logger singleton
│   │   ├── build.mjs            # esbuild bundler config
│   │   └── package.json
│   │
│   └── techops-portal/          # React + Vite frontend
│       ├── src/
│       │   ├── App.tsx          # Root router (Wouter)
│       │   ├── components/
│       │   │   ├── layout.tsx         # Admin layout wrapper
│       │   │   ├── sidebar.tsx        # Responsive sidebar drawer
│       │   │   ├── header.tsx         # Top bar with hamburger + search
│       │   │   ├── end-user-layout.tsx# Self-service layout
│       │   │   └── ui/               # shadcn/ui component library
│       │   ├── context/
│       │   │   └── auth.tsx           # Auth context + role routing
│       │   ├── hooks/
│       │   │   └── use-mobile.tsx     # Responsive breakpoint hook
│       │   └── pages/
│       │       ├── login.tsx          # Login page with demo credentials
│       │       ├── dashboard.tsx      # Admin dashboard with charts
│       │       ├── assets.tsx         # Asset inventory list + add form
│       │       ├── asset-detail.tsx   # Single asset view
│       │       ├── tickets.tsx        # Helpdesk queue + new ticket form
│       │       ├── ticket-detail.tsx  # Single ticket view
│       │       ├── employees.tsx      # Employee directory + add form
│       │       ├── employee-detail.tsx# Single employee profile
│       │       └── end-user/
│       │           ├── my-tickets.tsx    # User's own tickets
│       │           ├── submit-ticket.tsx # New ticket submission form
│       │           └── my-assets.tsx     # User's assigned equipment
│       └── package.json
│
├── lib/
│   ├── api-spec/                # OpenAPI 3 specification
│   │   └── openapi.yaml         # Source of truth for all endpoints
│   ├── api-client-react/        # Generated React Query hooks (Orval)
│   └── db/                      # Drizzle ORM schema + pool
│       └── src/
│           └── index.ts         # DB schema definitions + pool config
│
├── pnpm-workspace.yaml          # Monorepo workspace config + catalog
├── tsconfig.base.json           # Shared TypeScript strict config
├── tsconfig.json                # Solution file (lib packages only)
└── package.json                 # Root dev tooling
```

---

## Installation & Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (local instance or cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/sheshadri022/techops-demo-portal.git
cd techops-demo-portal
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root (see [Environment Variables](#environment-variables) below). At minimum you need `DATABASE_URL`.

### 4. Run Database Migrations

The API server auto-migrates and seeds on startup. Tables are created with `CREATE TABLE IF NOT EXISTS`, so re-runs are safe.

To manually push the Drizzle schema:

```bash
pnpm --filter @workspace/db run push
```

### 5. Start the Development Servers

In separate terminals:

```bash
# Terminal 1 — API server (port 5000 by default)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — React frontend (Vite dev server)
pnpm --filter @workspace/techops-portal run dev
```

Or if using Replit, the workflows start everything automatically.

### 6. Open the App

Navigate to `http://localhost:5173` (or whichever port Vite picks). Login with the demo credentials above.

### Useful Commands

```bash
# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API client from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## Environment Variables

Create a `.env` file at the project root. **Never commit real secrets to version control.**

```env
# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/dbname

# For Supabase (transaction pooler — recommended for serverless)
# DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ─── Server ───────────────────────────────────────────────────────────────────
SESSION_SECRET=your-random-secret-at-least-32-chars
NODE_ENV=development

# ─── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173
```

> In production (Render, Railway, etc.), set these as environment variables in the service dashboard — do not use a `.env` file on the server.

---

## Deployment

### Render (recommended — matches current live setup)

1. **API service** (Web Service)
   - Build command: `pnpm install && pnpm --filter @workspace/api-server run build`
   - Start command: `pnpm --filter @workspace/api-server run start`
   - Environment: add `DATABASE_URL`, `SESSION_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV=production`

2. **Frontend** (Static Site)
   - Build command: `pnpm install && pnpm --filter @workspace/techops-portal run build`
   - Publish directory: `artifacts/techops-portal/dist`
   - Add a redirect rule: `/* → /index.html` (200) for SPA routing

3. **Database** — Provision a Render PostgreSQL instance (free tier available) in the same region as your API service for internal networking.

---

## Future Improvements

- [ ] **Real authentication** — Replace client-side auth with JWT / Clerk / Auth0
- [ ] **Asset assignment flow** — Directly assign/unassign assets to employees from the UI
- [ ] **Ticket comments & history** — Thread-style activity log on each ticket
- [ ] **Email notifications** — Alert assignees when tickets are created or updated
- [ ] **File attachments** — Upload screenshots/evidence to tickets and assets
- [ ] **Reporting & exports** — CSV/PDF export for asset inventory and ticket reports
- [ ] **Bulk operations** — Select multiple assets/tickets and perform batch updates
- [ ] **Dark mode toggle** — User-selectable light/dark theme
- [ ] **Audit log** — Track every create/update with timestamp and actor
- [ ] **Advanced search** — Full-text search with filters across all entities
- [ ] **Mobile app** — Expo React Native companion for on-the-go IT management
- [ ] **Role-based permissions** — Granular RBAC (read-only, technician, super-admin)
- [ ] **API rate limiting** — Add express-rate-limit to protect public endpoints
- [ ] **Unit & E2E tests** — Vitest + Playwright coverage for critical flows

---

## Author

**Sheshadri**

- GitHub: [@sheshadri022](https://github.com/sheshadri022)
- Project: [techops-demo-portal](https://github.com/sheshadri022/techops-demo-portal)
- Live App: [techops-portal.onrender.com](https://techops-portal.onrender.com)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with React · TypeScript · Express · PostgreSQL · Tailwind CSS · Deployed on Render

</div>
