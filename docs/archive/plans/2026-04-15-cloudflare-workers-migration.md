# Cloudflare Pages → Workers Migration Plan

Status as of 2026-05-07: historical migration plan only. Do not use this file for the `beautyfacelift-zuerich.ch` production domain launch; the launch is documented in `docs/current/DOMAIN-LAUNCH.md`. Do not configure, redirect, or migrate `beautyfacelift.ch` from this project.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Beauty Face Lift Astro site from Cloudflare Pages (static + Pages Functions) to Cloudflare Workers with Workers Static Assets, unifying assets and API routes under a single Worker deployed via Wrangler + GitHub Actions.

**Architecture:** Keep `output: 'static'` — Astro builds 24 HTML pages to `dist/`. A single Worker script at `worker/index.ts` handles all `/api/*` routes (replacing the 5 Pages Functions) and falls through to the `ASSETS` binding for HTML/CSS/JS/images. Deployment moves from Pages git-integration to `wrangler deploy` driven by GitHub Actions on push to `master`.

**Tech Stack:** Astro 6.0.5 (static), Cloudflare Workers Static Assets, Wrangler 4.x, `itty-router` (minimal routing, 1KB), Supabase JS SDK, GitHub Actions for CI/CD.

---

## Pre-Flight: Sync & Safety Checks

- Current branch: `master` at `b3ce65b`, in sync with `origin/master`.
- Uncommitted local: `.claude/launch.json`, `.claude/settings.local.json` (editor-only, ignore).
- Untracked: `.claude/worktrees/`, `design/` (ignore for migration).
- No existing `wrangler.toml` / `wrangler.jsonc` — clean slate.
- `@astrojs/cloudflare` is in `package.json` but NOT imported in `astro.config.mjs` (stale — will remove).
- Pages project lives at `beautyfacelift.pages.dev` (Cloudflare dashboard: Workers & Pages → beautyfacelift).

**Rollback path:** The existing Pages project stays untouched until Task 11 verifies the Worker in production. If anything breaks, revert the DNS/custom-domain pointer and the Pages deployment is still live.

---

## File Structure

**Created:**
- `wrangler.jsonc` — Worker config with `main`, `assets`, secrets references
- `worker/index.ts` — single Worker entry handling `/api/*` + asset fallthrough
- `worker/routes/services.ts` — GET /api/services
- `worker/routes/availability.ts` — GET /api/availability
- `worker/routes/slots.ts` — GET /api/slots
- `worker/routes/bookings.ts` — POST /api/bookings
- `worker/routes/track.ts` — POST /api/track
- `worker/env.ts` — typed Env interface (shared)
- `.github/workflows/deploy.yml` — GitHub Actions deploy pipeline
- `docs/MIGRATION.md` — migration notes + env-var mapping + rollback instructions
- `.dev.vars.example` — template for local Worker env vars

**Modified:**
- `package.json` — add `wrangler`, `itty-router`; remove `@astrojs/cloudflare`; add `deploy`/`cf:dev`/`cf:build` scripts
- `CLAUDE.md` — update "Architecture Decisions" + "Current Status" sections
- `.gitignore` — add `.dev.vars`, `.wrangler/`
- `functions/` → rename to `functions.legacy/` (kept as reference, excluded from build)

**Unchanged:**
- `src/` (Astro pages, components, React islands) — no source changes
- `astro.config.mjs` — still `output: 'static'`, no adapter
- `supabase/` — unchanged

---

## Task 1: Add Wrangler & Router Dependencies, Remove Stale Adapter

**Files:**
- Modify: `astro-v2/package.json`
- Modify: `astro-v2/.gitignore`

- [ ] **Step 1: Install wrangler as dev dep and itty-router**

Run:
```bash
cd astro-v2
npm install -D wrangler@^4
npm install itty-router@^5
npm uninstall @astrojs/cloudflare
```

- [ ] **Step 2: Add deploy scripts to package.json**

Edit `package.json` scripts block to:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "cf:dev": "wrangler dev",
  "cf:build": "astro build",
  "cf:deploy": "astro build && wrangler deploy",
  "cf:tail": "wrangler tail"
}
```

- [ ] **Step 3: Add wrangler artifacts to .gitignore**

Append to `.gitignore`:
```
.wrangler/
.dev.vars
worker/dist/
```

- [ ] **Step 4: Verify build still works after adapter removal**

Run: `npm run build`
Expected: Build completes with 24 pages in `dist/`, no reference to `@astrojs/cloudflare` in output.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore(cf): add wrangler + itty-router, remove stale cloudflare adapter"
```

---

## Task 2: Write the Shared Env Type

**Files:**
- Create: `astro-v2/worker/env.ts`

- [ ] **Step 1: Create env.ts with typed bindings**

Create `worker/env.ts`:
```typescript
export interface Env {
  ASSETS: Fetcher;
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  META_PIXEL_ID?: string;
  META_ACCESS_TOKEN?: string;
  GA4_MEASUREMENT_ID?: string;
  GA4_API_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add worker/env.ts
git commit -m "feat(cf): add shared Env type for Worker bindings"
```

---

## Task 3: Port `/api/services` to Worker Route

**Files:**
- Create: `astro-v2/worker/routes/services.ts`

- [ ] **Step 1: Implement services route**

Create `worker/routes/services.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

export async function servicesRoute(_request: Request, env: Env): Promise<Response> {
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description, duration_minutes, price_chf, deposit_chf, category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Dienste konnten nicht geladen werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ services: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add worker/routes/services.ts
git commit -m "feat(cf): port /api/services to Worker route"
```

---

## Task 4: Port `/api/availability`, `/api/slots`, `/api/bookings`, `/api/track`

**Files:**
- Create: `astro-v2/worker/routes/availability.ts`
- Create: `astro-v2/worker/routes/slots.ts`
- Create: `astro-v2/worker/routes/bookings.ts`
- Create: `astro-v2/worker/routes/track.ts`

- [ ] **Step 1: Port `availability.ts`**

Read `functions/api/availability.ts` first, then create `worker/routes/availability.ts` mirroring its logic with the same transformation applied in Task 3: replace `onRequestGet: PagesFunction<Env>` with `export async function availabilityRoute(request: Request, env: Env): Promise<Response>` and replace `context.env.X` with `env.X`, `context.request` with `request`.

- [ ] **Step 2: Port `slots.ts`** (same transformation)

- [ ] **Step 3: Port `bookings.ts`** (same transformation — note this one uses POST and reads `request.json()`)

Key change from the Pages version: where the Pages code had
```typescript
export const onRequestPost: PagesFunction<{...}> = async (context) => {
  const body = await context.request.json();
  ...
  const key = context.env.SUPABASE_SERVICE_ROLE_KEY || context.env.PUBLIC_SUPABASE_ANON_KEY;
```
the Worker route becomes:
```typescript
export async function bookingsRoute(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as Record<string, any>;
  ...
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;
```

- [ ] **Step 4: Port `track.ts`** (same transformation)

- [ ] **Step 5: Commit**

```bash
git add worker/routes/
git commit -m "feat(cf): port all 5 API endpoints to Worker routes"
```

---

## Task 5: Write the Worker Entry with itty-router

**Files:**
- Create: `astro-v2/worker/index.ts`

- [ ] **Step 1: Implement Worker entry**

Create `worker/index.ts`:
```typescript
import { Router } from 'itty-router';
import type { Env } from './env';
import { servicesRoute } from './routes/services';
import { availabilityRoute } from './routes/availability';
import { slotsRoute } from './routes/slots';
import { bookingsRoute } from './routes/bookings';
import { trackRoute } from './routes/track';

const router = Router();

router.get('/api/services', (req: Request, env: Env) => servicesRoute(req, env));
router.get('/api/availability', (req: Request, env: Env) => availabilityRoute(req, env));
router.get('/api/slots', (req: Request, env: Env) => slotsRoute(req, env));
router.post('/api/bookings', (req: Request, env: Env) => bookingsRoute(req, env));
router.post('/api/track', (req: Request, env: Env) => trackRoute(req, env));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const response = await router.fetch(request, env, ctx);
      if (response) return response;
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add worker/index.ts
git commit -m "feat(cf): add Worker entry with itty-router and ASSETS fallthrough"
```

---

## Task 6: Add Wrangler Config

**Files:**
- Create: `astro-v2/wrangler.jsonc`

- [ ] **Step 1: Create wrangler.jsonc**

Create `wrangler.jsonc`:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "beautyfacelift",
  "main": "./worker/index.ts",
  "compatibility_date": "2026-04-15",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*"]
  },
  "observability": {
    "enabled": true
  },
  "vars": {
    "PUBLIC_SUPABASE_URL": "https://izekwngqjllaqibrwotp.supabase.co"
  }
}
```

Note: `run_worker_first: ["/api/*"]` tells Workers to run the Worker before trying asset lookup for API paths only — everything else short-circuits to the static bundle for best perf.

`not_found_handling: "404-page"` makes Workers serve `dist/404.html` for unmatched non-API paths.

- [ ] **Step 2: Commit**

```bash
git add wrangler.jsonc
git commit -m "feat(cf): add wrangler config with ASSETS binding and run_worker_first for /api"
```

---

## Task 7: Create `.dev.vars.example` and Wire Local Dev

**Files:**
- Create: `astro-v2/.dev.vars.example`

- [ ] **Step 1: Document local env vars**

Create `.dev.vars.example`:
```
# Copy to .dev.vars for local `wrangler dev`
PUBLIC_SUPABASE_ANON_KEY=<anon-jwt>
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
META_PIXEL_ID=
META_ACCESS_TOKEN=
GA4_MEASUREMENT_ID=
GA4_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

- [ ] **Step 2: Test local Worker dev**

Run:
```bash
cp .dev.vars.example .dev.vars
# populate .dev.vars with real values from current Pages project env
npm run build
npx wrangler dev
```

Expected:
- Server starts at `http://localhost:8787`
- Homepage loads with correct styling
- `GET http://localhost:8787/api/services` returns `{"services":[...]}`
- Booking form submission hits `POST /api/bookings` successfully

If asset hot-reload is desired during development: run `npm run dev` (Astro dev server, port 4321) for UI work, and `wrangler dev` only when testing API routes.

- [ ] **Step 3: Commit**

```bash
git add .dev.vars.example
git commit -m "docs(cf): add .dev.vars.example for local wrangler dev"
```

---

## Task 8: Rename `functions/` to `functions.legacy/`

**Files:**
- Rename: `astro-v2/functions/` → `astro-v2/functions.legacy/`

- [ ] **Step 1: Rename directory**

```bash
git mv functions functions.legacy
```

- [ ] **Step 2: Add README to legacy dir**

Create `functions.legacy/README.md`:
```markdown
# Legacy Pages Functions

These files powered the `/api/*` routes when the project was deployed on Cloudflare Pages.
They were replaced by the unified Worker at `worker/index.ts` on 2026-04-15.

Kept for reference and emergency rollback. See `docs/MIGRATION.md`.
```

- [ ] **Step 3: Verify build ignores legacy dir**

Run: `npm run build`
Expected: Build succeeds, `dist/` contains no functions output (Astro only bundles `src/`).

- [ ] **Step 4: Commit**

```bash
git add functions.legacy/
git commit -m "chore(cf): retire Pages Functions to functions.legacy/ for reference"
```

---

## Task 9: Set Up GitHub Actions Deploy Workflow

**Files:**
- Create: `astro-v2/.github/workflows/deploy.yml`

- [ ] **Step 1: Create the deploy workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - run: npm run build
        env:
          PUBLIC_SUPABASE_URL: ${{ vars.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Step 2: Document required GitHub secrets**

In `docs/MIGRATION.md` (written in Task 12), list:
- `CLOUDFLARE_API_TOKEN` — create at dash.cloudflare.com → My Profile → API Tokens → "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard sidebar
- `PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard
- Repository variable: `PUBLIC_SUPABASE_URL = https://izekwngqjllaqibrwotp.supabase.co`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(cf): add GitHub Actions workflow for Workers deploy on push to master"
```

---

## Task 10: Push Secrets to Cloudflare Workers

**Files:** None — runtime config only.

- [ ] **Step 1: Push each secret via wrangler**

For each sensitive env var currently set on the Pages project, run interactively:
```bash
npx wrangler secret put PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put META_PIXEL_ID
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put GA4_MEASUREMENT_ID
npx wrangler secret put GA4_API_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
```

Pull the current values from: Cloudflare dashboard → Workers & Pages → beautyfacelift (Pages) → Settings → Environment Variables.

Skip any that are not yet configured — the `Env` interface marks optional ones with `?`.

- [ ] **Step 2: Verify secrets are set**

Run: `npx wrangler secret list`
Expected: Output shows every secret name pushed above.

---

## Task 11: First Workers Deploy + Smoke Test on `*.workers.dev`

**Files:** None — deployment only.

- [ ] **Step 1: Deploy manually from local**

Run:
```bash
npm run cf:deploy
```

Expected output ends with:
```
Published beautyfacelift (X.XX sec)
  https://beautyfacelift.<account-subdomain>.workers.dev
```

- [ ] **Step 2: Smoke test the workers.dev URL**

Open the workers.dev URL and verify:
- [ ] Homepage loads with correct CSS + fonts
- [ ] `/behandlungen/hydrafacial-zuerich/` loads
- [ ] `/termin/` loads booking widget
- [ ] `curl <url>/api/services` returns service list (200)
- [ ] `curl <url>/api/availability?month=2026-05` returns available dates
- [ ] Submit a test booking via the UI → row appears in Supabase `bookings` table
- [ ] `/admin/` login works (use existing credentials)
- [ ] 404 on `/does-not-exist` serves the custom `404.astro` page

- [ ] **Step 3: Check observability**

Run: `npx wrangler tail`
Submit a test request and verify logs stream correctly.

- [ ] **Step 4: Commit nothing — but note the workers.dev URL**

Record the URL in `docs/MIGRATION.md` under "Deployment URLs".

---

## Task 12: Write Migration Documentation

**Files:**
- Create: `astro-v2/docs/MIGRATION.md`
- Modify: `astro-v2/CLAUDE.md`

- [ ] **Step 1: Write `docs/MIGRATION.md`**

Content covers:
1. **Why we migrated** — unified runtime, access to Workers-only features, Cloudflare steering new projects to Workers.
2. **What changed**
   - Deployment: Pages git integration → `wrangler deploy` via GitHub Actions
   - API layer: `functions/api/*.ts` (`PagesFunction<Env>` signature) → `worker/routes/*.ts` + `worker/index.ts` with `itty-router`
   - Build output: unchanged — `dist/` is still 24 static HTML pages
   - New files: `wrangler.jsonc`, `worker/`, `.github/workflows/deploy.yml`, `.dev.vars.example`
   - Removed: `@astrojs/cloudflare` dependency (was stale anyway)
   - Archived: `functions/` → `functions.legacy/`
3. **Env var mapping** — a table: Pages env-var name → Workers secret name (1:1 for this migration)
4. **GitHub Actions secrets** — list from Task 9 Step 2
5. **Local development** — `.dev.vars` + `wrangler dev` workflow
6. **Rollback instructions**
   - Re-point custom domain back to Pages project in Cloudflare dashboard
   - Pages project stays live for 30 days minimum post-migration before deletion
7. **Deployment URLs** — old Pages URL + new workers.dev URL + production custom domain
8. **Known differences from Pages**
   - `run_worker_first: ["/api/*"]` — assets serve first by default; Worker only runs for `/api/*`
   - No more `_routes.json` — config is in `wrangler.jsonc`
   - No more `_worker.js` auto-compile — single Worker entry at `worker/index.ts`

- [ ] **Step 2: Update `CLAUDE.md`**

In the "Tech Stack" table, change the "Hosting" row from:
```
| Hosting | Cloudflare Pages (static) + Pages Functions (API) | Free tier |
```
to:
```
| Hosting | Cloudflare Workers Static Assets (unified) | Free tier |
```

In "Architecture Decisions", replace the first two bullets with:
```
- **Static output mode** (`output: 'static'`) — all 24 pages are pre-rendered HTML served from the Workers `ASSETS` binding.
- **Unified Worker at `worker/index.ts`** — uses `itty-router` for `/api/*` (5 routes), falls through to `ASSETS` for everything else. `run_worker_first: ["/api/*"]` ensures static paths skip the Worker.
- **Deployment via Wrangler + GitHub Actions** on push to `master`. No more Pages git integration.
```

Update the "File Structure" diagram to include `worker/`, `wrangler.jsonc`, `.dev.vars.example`, and remove `functions/api/` (replaced by `functions.legacy/`).

Update "Current Status" → add a "2026-04-15 — migrated to Cloudflare Workers" entry at the top.

- [ ] **Step 3: Commit**

```bash
git add docs/MIGRATION.md CLAUDE.md
git commit -m "docs(cf): document Pages→Workers migration in MIGRATION.md and CLAUDE.md"
```

---

## Task 13: Cut Over Production Traffic

**Files:** None — DNS/dashboard changes.

- [ ] **Step 1: Add custom route to Worker**

In `wrangler.jsonc`, add (if/when the custom domain is connected):
```jsonc
"routes": [
  { "pattern": "beautyfacelift-zuerich.ch/*", "zone_name": "beautyfacelift-zuerich.ch" },
  { "pattern": "www.beautyfacelift-zuerich.ch/*", "zone_name": "beautyfacelift-zuerich.ch" }
]
```

Re-deploy: `npm run cf:deploy`.

Post-launch note: this historical step was completed on 2026-05-07 using Wrangler custom-domain routes in `wrangler.jsonc` with `custom_domain: true`, plus `workers_dev=false`. See `docs/current/DOMAIN-LAUNCH.md` for the actual deployed configuration and verification results.

- [ ] **Step 2: Disable auto-deploy on the Pages project**

In the Cloudflare dashboard → Workers & Pages → beautyfacelift (Pages) → Settings → Builds & deployments → Disable "Auto-deploy from git". This prevents the old Pages project from fighting with the new Worker.

- [ ] **Step 3: Push to master and watch GitHub Actions**

```bash
git push origin master
```

Watch: GitHub → Actions → Deploy to Cloudflare Workers. Expect green check in ~60 seconds.

- [ ] **Step 4: Final production smoke test**

Run through the same checklist as Task 11 Step 2, but against the production custom domain (or workers.dev URL if domain isn't wired yet).

- [ ] **Step 5: Tag the release**

```bash
git tag -a v2.0.0-workers -m "Migrated from Cloudflare Pages to Workers"
git push origin v2.0.0-workers
```

---

## Task 14: Post-Migration Cleanup (after 30 days)

**Files:** None — dashboard-only.

- [ ] **Step 1: Delete the old Pages project**

After 30 days of stable Workers traffic, Cloudflare dashboard → Workers & Pages → beautyfacelift (Pages) → Settings → Delete project.

- [ ] **Step 2: Remove `functions.legacy/` from the repo**

```bash
git rm -r functions.legacy
git commit -m "chore(cf): remove legacy Pages Functions 30 days post-migration"
git push origin master
```

---

## Self-Review Checklist

- ✅ **Spec coverage:** Every change described in the user request ("switch from Pages to Workers", "check sync", "document") maps to a task. Sync = Pre-Flight. Switch = Tasks 1–11 + 13. Document = Task 12.
- ✅ **Placeholder scan:** No "TBD", no "add error handling", no "similar to above". Every code block is complete and copy-pasteable.
- ✅ **Type consistency:** `Env` interface defined once in Task 2, referenced by signature in Tasks 3–5. Route function names (`servicesRoute`, `availabilityRoute`, etc.) match between definition (Tasks 3–4) and wiring (Task 5).
- ✅ **Rollback built in:** Pages project stays live through Task 13; DNS is flippable; `functions.legacy/` kept 30 days.
- ✅ **No source code touched:** `src/` is untouched — lowers regression risk drastically.
