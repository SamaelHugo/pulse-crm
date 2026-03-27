# Pulse CRM — Sales Dashboard

## Project
Fullstack CRM dashboard with analytics, client management, and deal tracking.
Demo project for web developer portfolio. Must look like a real SaaS product, not a template.

## Technical Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Recharts (charts/graphs)
- Prisma ORM + PostgreSQL (Supabase) — added in later prompts
- NextAuth.js — added in later prompts
- Framer Motion (animations)

## Technical Rules
- App Router (src/app/) — file-based routing
- All components in src/components/
- Shared layouts via layout.tsx
- Mock data first (src/data/), database later
- Do NOT change CSS variables or fonts after Prompt 0
- Do NOT change the sidebar/topbar layout after Prompt 0
- Russian language for all UI text
- Responsive: desktop-first (1024px+), tablet (768px), mobile (375px)

## Design Direction
- DARK THEME — deep charcoal/navy base, NOT pure black
- Think Linear.app, Vercel Dashboard, Raycast — premium dark SaaS
- ONE electric accent color: cyan/teal (#06B6D4 range) for primary actions, active states, chart highlights
- Secondary accent: amber/orange (#F59E0B) for warnings, alerts, revenue metrics
- Cards with subtle borders (1px rgba white 6%), no heavy shadows
- Glassmorphism on sidebar: backdrop-blur, semi-transparent bg
- Typography: clean, geometric sans — NOT Inter/Roboto
- Data-dense but not cluttered — whitespace is key
- Charts: clean, minimal, matching the dark theme palette

## Pages
- /dashboard — main analytics view (charts, stats, recent deals)
- /clients — client table with search, filters, sort, pagination
- /clients/[id] — client detail (profile, deals, notes, activity)
- /deals — deals pipeline/kanban or table view
- /settings — placeholder settings page
- /login — auth page (added later)

## Progress
- [x] Prompt 0: Design system + Layout (sidebar + topbar)
- [x] Prompt 1: Dashboard page (stats cards + charts)
- [x] Prompt 2: Clients table page
- [x] Prompt 3: Client detail page
- [x] Prompt 4: Deals page (pipeline view)
- [x] Prompt 5: Database (Prisma + Supabase + seed data)
- [x] Prompt 6: API routes (CRUD)
- [x] Prompt 7: Auth (NextAuth)
- [x] Prompt 8: Animations + Polish + Deploy