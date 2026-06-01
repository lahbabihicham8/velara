# NexaPay — Global Treasury & FX Platform

> منصة إدارة مدفوعات وتحويل عملات للشركات — بنية برمجية متكاملة بأحدث تقنيات 2026.
> Enterprise multi-currency wallets, real-time FX streaming, and treasury analytics.

NexaPay is a production-grade reference architecture for a corporate payments &
currency-conversion platform: multi-currency wallets, an instant FX converter
backed by a live streaming rate engine, smart analytics (cash flow + FX
Value-at-Risk), and Role-Based Access Control.

---

## ✨ Highlights

- **Multi-Currency Wallets** — USD, EUR, GBP, SAR, AED, KWD, QAR with USD-base valuation and 24h deltas.
- **Instant Conversion** — converter wired to a live, mean-reverting FX stream; rate & output recompute on every tick.
- **Smart Analytics** — animated KPIs, 12-month cash flow, 30-day volume, currency-exposure donut.
- **FX Risk Management** — per-currency 1-day 95% parametric Value-at-Risk (VaR) with volatility bars.
- **RBAC** — five roles (Owner → Viewer), permission-gated navigation, server-side authorization guards, and a full access-control matrix.
- **Real-time** — a Zustand-backed market-data simulator streams ticks every 1.5s into a live ticker and rate board.
- **Dark / Light / System** — OKLCH token-driven theming via `next-themes`, fully responsive, reduced-motion aware.
- **Premium UX** — `motion` micro-interactions, glassmorphism, animated count-ups, shimmer skeletons.

## 🧱 Tech Stack (2026)

| Layer        | Choice                                                          |
| ------------ | --------------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, React Server Components, Turbopack)  |
| Language     | **TypeScript** (strict)                                         |
| UI           | **Tailwind CSS v4** + custom shadcn-style primitives            |
| Charts       | **Recharts**                                                    |
| Animation    | **Motion** (Framer Motion successor)                            |
| Icons        | **lucide-react**                                                |
| State / RT   | **Zustand** (live FX stream)                                    |
| Theming      | **next-themes**                                                 |
| Database     | **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`) |
| Auth         | DB-backed sessions · **bcrypt** hashing · **zod** validation    |
| Validation   | **zod**                                                         |

## 🔑 Authentication & Security

- **Credential login** (`/login`) via a React 19 `useActionState` server action.
- **Passwords** hashed with bcrypt (cost factor configurable via env).
- **Sessions** are opaque, revocable, and **DB-backed**: a random 256-bit token
  lives in an `httpOnly`, `sameSite=lax`, `secure` (in prod) cookie; only its
  SHA-256 hash is stored, so a database leak can't be replayed.
- **`proxy.ts`** (Next.js 16, formerly middleware) blocks unauthenticated
  access to `/dashboard/*`; the dashboard layout then does authoritative DB
  validation and redirects expired/invalid sessions.
- **RBAC enforced server-side** at the data boundary: every service calls
  `requirePermission(...)`, and sensitive pages re-check via `authorize(...)`.
  The client `useRbac()` only controls what's *shown* — the server is the gate.

## 📂 Project Structure

```
prisma/
├── schema.prisma                # Org · User · Session · Wallet · Transaction (+enums)
├── migrations/                  # SQL migration history (committed)
└── seed.ts                      # Reuses deterministic generators as fixtures
prisma.config.ts                 # Prisma 7 CLI config (datasource url + seed)
docker-compose.yml               # Local/prod Postgres 16
scripts/pg-dev.mjs               # Zero-Docker embedded Postgres for local dev
src/
├── proxy.ts                     # Edge route guard for /dashboard/*
├── app/
│   ├── layout.tsx               # Root layout · fonts · ThemeProvider
│   ├── page.tsx                 # → redirects to /dashboard
│   ├── login/                   # Auth screen (server) + redirect-if-authed
│   └── dashboard/
│       ├── layout.tsx           # Session validation + AppShell
│       ├── loading.tsx          # Suspense skeleton
│       ├── error.tsx            # Route error boundary
│       ├── page.tsx             # Treasury overview
│       ├── wallets/ transactions/ analytics/ team/ settings/
├── components/
│   ├── ui/ layout/ charts/ dashboard/ wallets/ transactions/ team/ settings/
│   ├── auth/                    # LoginForm, LogoutButton
│   └── providers/               # Theme + Session providers
├── server/                      # Server-only core
│   ├── auth.ts                  # Sessions, getCurrentUser, requirePermission
│   ├── analytics.ts             # DB-driven analytics derivations
│   ├── mappers.ts               # Prisma row → domain type
│   └── actions/auth-actions.ts  # login / logout server actions
├── hooks/                       # use-fx-stream, use-rbac, use-mounted
├── lib/                         # utils, format, currencies, rbac, fx-engine,
│                                #   result, prisma, password, env, validation
├── services/                    # Typed Prisma data boundary (Result<T>)
├── store/                       # Zustand FX store
├── data/                        # Deterministic generators (seed fixtures only)
└── types/                       # Domain models (single source of truth)
```

## 🏛 Architecture Notes

- **Server-first.** Pages are React Server Components; data is fetched in
  `services/*` and rendered on the server. Only interactive islands
  (`converter`, `ticker`, `charts`, `theme toggle`) are client components.
- **Typed failure handling.** Services return `Result<T>` (`lib/result.ts`)
  instead of throwing, so every page renders an explicit `ErrorState`.
- **Deterministic mock data.** A seeded PRNG (`seededRandom`) keeps
  server/client output identical, eliminating hydration mismatches.
- **RBAC, two layers.** `services/auth.service.ts → authorize()` guards on the
  server; `useRbac()` filters navigation and gates UI on the client. Both share
  one policy matrix in `lib/rbac.ts`.
- **FX engine.** `lib/fx-engine.ts` holds cross-rate math, VaR inputs, and a
  mean-reverting random walk; `store/fx-store.ts` streams it.

## 🚀 Getting Started (local development)

You need a PostgreSQL database. Pick **one** of the two options below. The app
code is identical either way — only `DATABASE_URL` changes.

```bash
npm install
cp .env.example .env     # adjust if needed
```

### Option A — Zero-Docker embedded Postgres (recommended for quick local testing)

A real PostgreSQL instance runs from npm, no Docker or cloud account required.
Data persists in `./.pgdata`.

```bash
# Terminal 1 — start the database (keep running)
npm run db:start

# Terminal 2 — apply migrations + seed, then run the app
npm run db:setup         # migrate deploy + seed
npm run dev              # http://localhost:3000
```

### Option B — Docker / managed Postgres (Neon, Supabase, Hostinger…)

```bash
docker compose up -d     # or set DATABASE_URL to a Neon/Supabase URL
npm run db:migrate       # create/apply the schema
npm run db:seed          # load demo org, users, wallets, 520 transactions
npm run dev
```

### 🔐 Demo login

All seeded users share the password from `SEED_PASSWORD` (default `NexaPay!2026`):

| Email                | Role      |
| -------------------- | --------- |
| layla@nexapay.io     | Owner     |
| marcus@nexapay.io    | Admin     |
| sofia@nexapay.io     | Treasurer |
| yuki@nexapay.io      | Analyst   |
| daniel@partner.io    | Viewer    |

Sign in as different users to see RBAC change the navigation and lock down pages.

### 📜 Scripts

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm run start        # serve the build
npm run lint         # eslint
npm run db:start     # local embedded Postgres (dev only)
npm run db:migrate   # prisma migrate dev (create + apply migration)
npm run db:deploy    # prisma migrate deploy (CI/production)
npm run db:seed      # seed the database
npm run db:reset     # drop, re-migrate and re-seed
npm run db:studio    # Prisma Studio (visual DB browser)
npm run db:setup     # migrate deploy + seed (one shot)
```

## ☁️ Deployment (Hostinger + EasyPanel)

The whole stack is standard PostgreSQL + a Node.js Next.js server, so it drops
straight into EasyPanel:

1. **Create a Postgres service** in EasyPanel (or use Neon/Supabase). Copy its
   connection string.
2. **Create an App service** from this repo. Set environment variables:
   - `DATABASE_URL` = the managed Postgres URL
   - `NODE_ENV=production`
   - `SESSION_TTL_DAYS`, `PASSWORD_SALT_ROUNDS` (optional)
   - Remove `SEED_PASSWORD` (or seed once then delete it).
3. **Build command:** `npm install && npm run build`
4. **Release/start command:** `npm run db:deploy && npm run start`
   (`db:deploy` applies migrations safely — it never resets data.)
5. **First deploy only:** run `npm run db:seed` once if you want demo data
   (skip for a clean production tenant).

Because development and production both use PostgreSQL, there are **no dialect
surprises** — what you test locally is exactly what runs in production.

## 🔐 Roles

| Role       | Capabilities                                              |
| ---------- | --------------------------------------------------------- |
| Owner      | Everything, incl. billing & members                       |
| Admin      | Operations + member & settings management                 |
| Treasurer  | Move funds, convert FX, approve payments                  |
| Analyst    | Read-only analytics, balances & reports                   |
| Viewer     | Limited dashboard visibility                              |

Change the active demo user in `src/data/session.ts` (`role`) to see RBAC gating
live — e.g. set `analyst` and the converter, team and settings pages lock down.

## 🗄️ Data layer

All services query PostgreSQL via Prisma, **scoped to the authenticated user's
organisation** and gated by RBAC:

```ts
// src/services/wallet.service.ts
export async function listWallets(): Promise<Result<WalletsView>> {
  return attempt(async () => {
    const user = await requirePermission("wallets.view"); // authn + authz
    const rows = await prisma.wallet.findMany({ where: { orgId: user.orgId } });
    return { wallets: rows.map(walletFromRow), totalBaseValue: /* … */ };
  }, "WALLETS_LOAD_FAILED");
}
```

The `src/data/*` generators are now **seed fixtures only** (`prisma/seed.ts`),
producing a realistic 12-month ledger so analytics are populated on first run.

---

Built as a Principal-Engineer reference implementation. Clean, modular, type-safe,
and production-ready.
