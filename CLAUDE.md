# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## Project overview

**المراح V2 (Almrah V2)** — `almrah-v2` — is a livestock/sheep flock-management
platform for Arabic-speaking farmers. It tracks births, the baby-animal growth
lifecycle, veterinary isolation, deaths, PDF reports, an AI assistant, Telegram
notifications, and a subscription/support system.

The entire UI is **Arabic and right-to-left (RTL)**. UI strings, code comments,
API error messages, and the AI system prompt are all in Arabic. Keep new
user-facing text and error messages in Arabic to match.

## Tech stack

- **Next.js 14.2.5** (App Router) + **React 18** + **TypeScript** (`strict: false`)
- **Supabase** (PostgreSQL + Auth) via `@supabase/ssr`
- **Tailwind CSS 3** with a custom green/gold/beige theme + Tajawal font
- **Gemini 2.5 Flash** for the AI assistant (migrated from Anthropic — see history)
- **jsPDF / jspdf-autotable** for client-side PDF reports
- **Telegram Bot API** (with a Cloudflare Worker fallback) for notifications
- **Resend** for transactional email
- **recharts**, **react-hot-toast**, **lucide-react**, **date-fns**
- Deployed on **Vercel**. Node **18–20** (`.nvmrc` = 20).

## Commands

```bash
npm run dev      # local dev server (next dev)
npm run build    # production build (next build) — use this to type-check
npm run start    # serve the production build
```

There is **no test suite, linter, or formatter configured**. `npm run build`
is the only verification gate — run it after changes to catch type/compile
errors. Note `tsconfig.json` has `strict: false` and `noImplicitAny: false`,
so many type holes will not be caught; lean on `any` sparingly and match the
surrounding style.

## Directory structure

```
src/
  middleware.ts              # Root middleware → delegates to lib/supabase/middleware
  app/
    layout.tsx               # Root layout: <html lang="ar" dir="rtl">, fonts, Toaster
    globals.css              # CSS variables + reusable component classes (.card, .btn-*, .badge-*, .input ...)
    page.tsx                 # Landing page
    maintenance/  offline/   # Standalone status pages
    (auth)/                  # Route group: login, register, forgot-password (no shell)
    (dashboard)/             # Route group: wrapped in ClientShell (user app)
      dashboard, births, production, flock, vet, deaths,
      reports, ai, subscriptions, support, settings, ...
    (admin)/                 # Route group: wrapped in AdminShell (admin-only)
      admin, admin/users, admin/stats, admin/settings, admin/tickets
    api/                     # Route handlers (REST-ish JSON endpoints)
  components/layout/
    ClientShell.tsx          # User nav shell (sidebar + bottom nav)
    AdminShell.tsx           # Admin nav shell
  lib/
    supabase/{client,server,middleware}.ts
    telegram/sender.ts       # notifyUser() + sendTelegramMessage()
    pdf/generator.ts         # Client-side PDF report builders
    utils/{dates,format,cn}.ts
public/                      # PWA manifest, icons
.github/workflows/           # Vercel ops + Telegram setup scripts (no CI build/test)
```

Path alias: `@/*` → `./src/*`.

## Routing & auth model

`src/lib/supabase/middleware.ts` runs on every non-asset request and is the
single source of truth for access control:

1. **Maintenance mode** — reads `app_settings.maintenance_mode` (cached 60s in
   module memory) and redirects non-admin, non-API traffic to `/maintenance`.
2. **Auth** — unauthenticated users hitting a non-public path are redirected to
   `/login`. Public paths: `/`, `/login`, `/register`, `/forgot-password`,
   `/maintenance`, `/offline`, anything under `/api`, `/_next`, `/favicon`.
3. **Admin gate** — `/admin/*` requires `profiles.role === 'admin'`, else
   redirect to `/dashboard`.

Route groups `(auth)`, `(dashboard)`, `(admin)` only affect layout nesting, not
URLs. `(dashboard)` wraps pages in `ClientShell`; `(admin)` in `AdminShell`.

## Supabase usage conventions

Three client factories — pick by context:

- `lib/supabase/server.ts` → `createClient()` (async, cookie-backed) — **API
  routes & server components**.
- `lib/supabase/client.ts` → `createClient()` (browser) — **`'use client'`
  components**.
- `lib/supabase/middleware.ts` → `updateSession()` — middleware only.

### API route handler pattern

Every authenticated `api/` route follows this shape (see
`src/app/api/births/route.ts` as the reference):

```ts
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('table').select('*').eq('user_id', user.id)  // always scope to the user
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

Conventions to follow:
- Always authenticate with `getUser()` and return `401 { error: 'غير مصرح' }`
  when missing.
- **Scope every query to `user.id`** — there is no reliance on RLS in the app
  code; tenancy is enforced in queries.
- Wrap handlers in `try/catch` and return `500 { error: 'خطأ داخلي في الخادم' }`
  on unexpected failures.
- Responses use `{ data }` for success and `{ error }` for failures. Mutations
  return `201` on create.
- Multi-table writes do **manual rollback** (no transactions) — e.g. births
  deletes the parent record if child `babies` insert fails.

### ⚠️ Known inconsistency: `profiles` lookup key

The `profiles` table is queried inconsistently across the codebase — some code
uses `.eq('id', user.id)` and some uses `.eq('user_id', user.id)`:

- `id`: middleware, ClientShell, admin routes, `telegram/sender.ts`, settings, telegram/setup
- `user_id`: `api/ai/chat`, `api/ai/usage`, `api/admin/users`, `api/support/[id]`

This is a latent bug source. When touching profile lookups, **verify which
column actually exists in the DB** for that query rather than copying a nearby
line, and prefer matching whichever form is already proven correct in that area.

### Stored procedures (RPC)

Background lifecycle logic lives in Postgres functions, invoked from
`api/babies/stages` via `supabase.rpc(...)`:
- `update_baby_stages` — advances baby growth stages by age
- `check_breed_ask_notifications` — flags ewes ready for mating
- `check_vet_notifications` — vet/isolation reminders

## Domain logic

Core constants and helpers live in `src/lib/utils/dates.ts`:
- `MATING_DELAY = 15` days after birth before a ewe can be re-mated.
- `PREGNANCY_DAYS = 150` days gestation.
- Baby lifecycle **stages** (Arabic):
  - رخل (female/`رخل`): `بهم` (0–3mo) → `مفطوم` (3–7mo) → `جاهز للإنتاج` (7mo+, counts toward flock total)
  - خروف (male): `بهم` (0–3mo) → `جاهز للبيع` (3mo+)
- A baby with `health === 'نفوق'` (dead) is excluded from alive counts and
  triggers automatic flock-total decrements.

Key tables seen in code: `profiles`, `birth_records`, `babies`, `flock_data`,
`deaths`, `rams`, `vet_isolation`, `notifications`, `support_tickets`,
`app_settings`.

## Notifications

Use `notifyUser(supabase, userId, key, msg, type)` from `lib/telegram/sender.ts`
for user-facing events. It persists a row in `notifications` (deduped on
`user_id,key`) **and** sends a Telegram message if the user has a
`telegram_chat_id` and notifications enabled. Telegram delivery tries the direct
Bot API first (`TELEGRAM_BOT_TOKEN`), then falls back to the Cloudflare Worker.
Notification sends should be fire-and-forget — callers `.catch()` and log
errors rather than failing the request.

## AI assistant

`src/app/api/ai/chat/route.ts` calls **Gemini 2.5 Flash**
(`generativelanguage.googleapis.com`, `GEMINI_API_KEY`). Notes:
- Per-user token budgeting via `profiles.ai_tokens_used` / `ai_tokens_limit`
  (default limit 5000) → returns `429` when exceeded.
- History is mapped to Gemini's format (`assistant` → `model`), leading `model`
  messages are stripped, and only the last 10 messages are sent.
- System prompt is Arabic and scopes the assistant to explaining the platform.
- The git history shows a prior Anthropic/Claude integration; the current code
  is Gemini. Don't reintroduce Anthropic calls unless explicitly asked.

## Styling conventions

Two coexisting styling approaches — match whatever the file already uses:
- **`globals.css` component classes**: `.card`, `.card-hover`, `.btn-primary`,
  `.btn-secondary`, `.btn-gold`, `.btn-danger`, `.input`, `.label`, `.badge-*`,
  `.stat-card`, `.page-header`, `.skeleton`, etc.
- **Inline `style={{...}}` objects**: client shells and many pages define local
  color consts (`G = '#1e5a10'`, `GOLD = '#c9a84c'`, `BEIGE = '#f8f4ee'`...) and
  style inline. This was done deliberately (commit history: "replace className
  with inline styles") to dodge Tailwind purge issues.

Theme palette (Tailwind `tailwind.config.js` + CSS vars): green `#1e5a10`,
gold `#c9a84c`, beige `#f8f4ee`, border `#d8cfc3`. Because of purge concerns,
dynamic Tailwind color classes are listed in the `safelist` in
`tailwind.config.js` — **add to the safelist if you introduce new
dynamically-composed color classes**. Use `cn()` from `lib/utils/cn.ts`
(clsx + tailwind-merge) to compose classNames.

## Environment variables

Required at runtime (configured in Vercel, not committed):

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | AI assistant (Gemini) |
| `TELEGRAM_BOT_TOKEN` | Direct Telegram delivery (optional; falls back to Worker) |
| `TELEGRAM_WORKER_URL` | Cloudflare Worker fallback (has a hardcoded default) |
| `RESEND_API_KEY` | Transactional email |
| `FROM_EMAIL` | Email sender address |
| `NEXT_PUBLIC_APP_URL` | Absolute app URL for email links |

The `.github/workflows/` are **operational scripts** (Vercel protection toggles,
env-var checks, Telegram setup/tests) run via `workflow_dispatch`/cron — they
are **not** a build/test CI pipeline.

## Conventions checklist for changes

- Keep all user-facing text and error messages in **Arabic, RTL**.
- New authenticated API routes: follow the `getUser()` → `401` → user-scoped
  query → `try/catch` 500 pattern; return `{ data }` / `{ error }`.
- Scope every DB query to `user.id`; do manual rollback on multi-step writes.
- Run `npm run build` to verify before considering work done (no tests exist).
- Match the surrounding styling approach (component class vs inline style); add
  new dynamic color classes to the Tailwind `safelist`.
- Use `notifyUser()` for events that should reach the user, fire-and-forget.
- Be careful with the `profiles` `id` vs `user_id` inconsistency noted above.
```
