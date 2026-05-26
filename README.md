# AgencyFlow CRM — Frontend (Phase 1)

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query · Zustand · React Hook Form + Zod

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Ensure the backend API is running at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`).

## Phase 1 routes

| Route | Module |
|-------|--------|
| `/` | Marketing landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Executive KPIs (owner) |
| `/leads` | Kanban pipeline |
| `/clients` | Client directory |
| `/projects` | Projects & tasks |
| `/finance` | Phase 2 placeholder |

## Stack alignment

- **Next.js 15** with App Router and Turbopack
- **TanStack Query v5** for server state
- **Zustand** for sidebar / UI preferences
- **@dnd-kit** for lead Kanban drag-and-drop
- **Recharts** for dashboard charts
