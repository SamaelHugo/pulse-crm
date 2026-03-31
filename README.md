# PULSE CRM

Fullstack CRM dashboard with charts, kanban board, and auth.

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff)

🔗 **Live:** [pulse-crm-zeta.vercel.app](https://pulse-crm-zeta.vercel.app)
🔑 **Demo:** admin@pulse.ru / demo123

---

## Overview

CRM system with analytics dashboard, client management, deal pipeline and authentication. Built as a fullstack Next.js application with Prisma ORM and Supabase.

## Features

- **Dashboard** — revenue charts, conversion rates, key metrics (Recharts)
- **Clients** — CRUD table with search and filters
- **Deals** — drag-and-drop Kanban board
- **Auth** — NextAuth with credentials provider
- **Responsive** — desktop + mobile

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| ORM | Prisma |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| Auth | NextAuth |
| Deploy | Vercel |

## Run Locally
```bash
git clone https://github.com/SamaelHugo/pulse-crm.git
cd pulse-crm
npm install
npx prisma generate
npm run dev
```
