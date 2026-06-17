# CLAUDE.md

Guidance for AI assistants working in this repository.

## Project

**المراح V2 (almrah-v2)** — an Arabic, RTL, mobile-first PWA for managing
livestock (sheep/goat) herds. It tracks births, baby growth stages, the
breeding cycle, deaths, veterinary isolation, reports, subscriptions, and
support tickets, plus an AI assistant and Telegram notifications.

The entire UI is in Arabic (`lang="ar" dir="rtl"`). User-facing strings —
including API error messages — are written in Arabic. Keep that convention
when adding code.

## Stack

- **Next.js 14.2** (App Router) + **React 18** + **TypeScript 5.5**
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) for Postgres, Auth, and cookie-based sessions
- **Tailwind CSS 3.4** for styling (plus a lot of inline `style={{}}` in the shells)
- **Google Gemini** (`gemini-2.5-flash`) powers the AI assistant
- **Telegram Bot API** (direct, with a Cloudflare Worker fallback) for notifications
- **jsPDF** + `jspdf-autotable` for PDF reports, **recharts** for charts, **react-hot-toast** for toasts, **lucide-react** for icons, **date-fns** for dates
- Deployed on **Vercel**; Node `>=18 <21` (`.nvmrc` pins `20`)

## Commands

```bash
npm run dev     # local dev server (next dev)
npm run build   # production build (next build)
npm run start   # serve the production build
```

There is **no test suite, linter, or typecheck script** configured.
`tsconfig.json` uses `strict: false` and `noImplicitAny: false`, so the
compiler is lenient. The closest thing to validation is `npm run build`.
Use it to sanity-check changes before considering them done.

## Architecture

### Routing & route groups (`src/app`)

The App Router is organized into three route groups, each with its own layout:

- **`(auth)`** — `/login`, `/register`, `/forgot-password`. Public.
- **`(dashboard)`** — the main app: `/dashboard`, `/births`, `/production`,
  `/flock`, `/vet`, `/deaths`, `/reports`, `/ai`, `/subscriptions`,
  `/support`, `/settings`, `/search`, `/notifications`. Wrapped in
  `ClientShell` (sidebar + bottom nav).
- **`(admin)`** — `/admin`, `/admin/users`, `/admin/tickets`, `/admin/stats`,
  `/admin/settings`. Wrapped in `AdminShell`. Admin-only.

Standalone pages: `/` (landing), `/maintenance`, `/offline`.

API routes live under `src/app/api/**/route.ts` and mirror the feature areas
(`births`, `deaths`, `flock`, `production`, `rams`, `vet/isolation`,
`ai/chat`, `ai/usage`, `notifications`, `subscriptions`, `support`,
`admin/*`, `telegram/setup`, `auth/welcome`).

### Auth, middleware & access control

- `src/middleware.ts` delegates to `updateSession` in
  `src/lib/supabase/middleware.ts`. This runs on every request (per the
  `matcher`) and is the **single source of truth for route protection**:
  - Refreshes the Supabase session cookie.
  - Redirects unauthenticated users to `/login` (except public paths and `/api`, `/_next`).
  - Redirects logged-in users away from `/login` and `/register` to `/dashboard`.
  - Enforces admin role on `/admin/*` (checks `profiles.role === 'admin'`).
  - Enforces **maintenance mode**: reads `app_settings.maintenance_mode`
    (cached in-memory for 60s) and redirects non-admin, non-API traffic to
    `/maintenance`.
- API routes do **not** rely on middleware for authorization. Each route
  re-checks the user itself (see pattern below).

### Supabase clients (`src/lib/supabase`)

Pick the right client for the context:

- `server.ts` → `createClient()` — async, cookie-aware, for **Server
  Components and API routes**. Always `await createClient()`.
- `client.ts` → `createClient()` — browser client for **`'use client'`
  components**.
- `middleware.ts` → `updateSession()` — only used by the root middleware.

All three use `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(anon key only — there is no service-role key in the codebase). Row-level
security is therefore expected to scope data per user.

### Library helpers (`src/lib`)

- `utils/cn.ts` — `cn()` merges class names (`clsx` + `tailwind-merge`).
- `utils/dates.ts` — date math and **the core domain rules**:
  - `MATING_DELAY = 15` (days after birth before re-mating, "شبك التلقيح")
  - `PREGNANCY_DAYS = 150`
  - `getRakhlStage` (female lambs: بهم <3mo → مفطوم <7mo → جاهز للإنتاج 7mo+)
  - `getKharoofStage` (males: بهم <3mo → جاهز للبيع 3mo+)
  - Arabic date formatting via `date-fns` `ar` locale.
- `utils/format.ts` — `formatCurrency` (SAR, ar-SA) and `generateTicketNumber`.
- `telegram/sender.ts` — `notifyUser(supabase, userId, key, msg, type)` writes
  a `notifications` row (deduped by `user_id,key`) and sends a Telegram
  message if the user has `telegram_chat_id` and notifications enabled.
  `sendTelegramMessage` tries the Bot API first, then a Cloudflare Worker.
- `pdf/generator.ts` — report PDF generation.

### Components (`src/components/layout`)

- `ClientShell.tsx` — the dashboard chrome (fixed header, desktop sidebar,
  mobile drawer, 5-item bottom nav). The `NAV` array here defines the
  dashboard navigation; add new dashboard sections there.
- `AdminShell.tsx` — admin chrome with its own nav array.

Both are heavy `'use client'` components that fetch the user's role and
unread-notification count on mount.

## Conventions

### API route pattern

Every API route follows this shape — match it for new routes:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    // ... query scoped by user.id ...
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
```

- Wrap handlers in `try/catch`; return Arabic error strings.
- Auth-check at the top of every handler; scope queries by `user.id`.
- Success responses use `{ data }` (and `201` for creates); errors use
  `{ error }` with the appropriate status.
- Supabase has no transactions here — multi-table writes do **manual
  rollback** (see `births/route.ts`: it deletes the parent record if child
  inserts fail). Follow that pattern for related writes.
- Fire-and-forget side effects (notifications, flock counts) are wrapped so
  they can't fail the request — e.g. `.catch(err => console.error(...))`.

### Imports & paths

- Use the `@/*` alias (maps to `src/*`), e.g. `@/lib/supabase/server`.

### Styling

- Tailwind theme defines custom palettes: `green` (primary `#1e5a10`),
  `gold` (`#c9a84c`), `beige` backgrounds. Use these tokens.
- Because many classes are built dynamically, `tailwind.config.js` has a
  **`safelist`** — if you use a color class that only ever appears via a
  computed string, add it to the safelist or it will be purged.
- The shells use inline `style={{}}` with hardcoded hex constants
  (`G`, `BEIGE`, etc.) rather than Tailwind classes. Stay consistent with
  whichever file you're editing.
- Font is **Tajawal** (`font-tajawal`), loaded from Google Fonts in the root layout.

## Database tables

Referenced via the Supabase client (snake_case):
`profiles`, `birth_records`, `babies`, `flock_data`, `deaths`, `rams`,
`vet_isolation`, `notifications`, `subscriptions`, `support_tickets`,
`ticket_replies`, `app_settings`.

> ⚠️ **Known inconsistency:** the `profiles` table is queried by
> `.eq('id', ...)` in most places (middleware, `notifyUser`) but by
> `.eq('user_id', ...)` in a few (`api/ai/chat`). When touching profile
> queries, verify which key the schema actually uses rather than copying
> blindly.

## Environment variables

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Google Gemini key for the AI assistant |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token (preferred send path) |
| `TELEGRAM_WORKER_URL` | Cloudflare Worker fallback for Telegram |
| `RESEND_API_KEY` | Resend email API key |
| `FROM_EMAIL` | Sender address for emails |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app |

Note: `next.config.js` sets security headers and an image `remotePatterns`
allowlist for `*.supabase.co`, and configures `serverActions.allowedOrigins`.

## CI / workflows

`.github/workflows` contains **ops automation, not tests** — they call the
Vercel API (disable deployment protection, check/add env vars) and test the
Telegram integration. They are mostly `workflow_dispatch` triggered. There
is no build/test CI gate.

## Working agreements

- Keep all user-facing text in **Arabic**.
- Default branch is `main`; develop on the assigned feature branch and open a
  draft PR.
- Before declaring work done, run `npm run build` to catch compile errors —
  there are no tests to fall back on.
