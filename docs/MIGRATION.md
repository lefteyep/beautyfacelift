# Cloudflare Pages → Workers Migration

Status as of 2026-05-07: historical runtime migration notes only. This is not the launch runbook for `beautyfacelift-zuerich.ch`; use [domain-launch-beautyfacelift-zuerich.md](domain-launch-beautyfacelift-zuerich.md). Do not configure or redirect `beautyfacelift.ch` from this project.

**Date:** 2026-04-15
**Branch:** `cf-workers-migration`
**Plan:** [docs/superpowers/plans/2026-04-15-cloudflare-workers-migration.md](superpowers/plans/2026-04-15-cloudflare-workers-migration.md)
**Cutover runbook (step-by-step commands):** [docs/CUTOVER-RUNBOOK.md](CUTOVER-RUNBOOK.md)

---

## Why We Migrated

1. **Unified runtime.** Pages split into "static + Pages Functions" — Workers Static Assets unifies both under one deployable. No more juggling `functions/api/` vs. build output.
2. **Workers-only features become available.** Durable Objects, Cron Triggers, Queues, Workers Analytics Engine are not available on Pages.
3. **Cloudflare is steering new projects to Workers.** New features land on Workers first; Pages is maintenance-mode for static sites.
4. **Better local dev.** `wrangler dev` runs the full production stack locally (Worker + ASSETS binding) — closer to production than Pages' local emulation.
5. **Stale `@astrojs/cloudflare` dep.** The adapter was listed but not imported. Migration was a good moment to clean it up.

---

## What Changed

### Deployment
| Before | After |
|---|---|
| Cloudflare Pages git integration (auto-deploy on push to master) | GitHub Actions running `wrangler deploy` on push to master |
| Dashboard: Workers & Pages → beautyfacelift (Pages project) | Dashboard: Workers & Pages → beautyfacelift (Workers project) |
| URL: `beautyfacelift.pages.dev` | URL: `beautyfacelift.<account-subdomain>.workers.dev` |

### API Layer
| Before | After |
|---|---|
| `functions/api/*.ts` (5 files, `onRequestGet`/`onRequestPost` + `PagesFunction<Env>` signature) | `worker/routes/*.ts` (5 files, plain `async function(request, env): Promise<Response>`) |
| Auto-bound `ASSETS` by Pages | Explicit `ASSETS` binding in `wrangler.jsonc` |
| Pages served `functions/` ahead of static assets by default | Workers serve static assets by default; `run_worker_first: ["/api/*"]` overrides for `/api/*` only |
| Each function was its own isolated script | Single Worker entry at `worker/index.ts` uses `itty-router` to dispatch |

### Build Output
**Unchanged.** `dist/` still contains 24 pre-rendered HTML pages. `output: 'static'` in `astro.config.mjs` remains. No Astro adapter is used.

### New Files
- `wrangler.jsonc` — Workers config (main entry, ASSETS binding, compat flags)
- `worker/env.ts` — shared `Env` interface
- `worker/index.ts` — Worker entry + itty-router
- `worker/routes/*.ts` — 5 route handlers
- `.github/workflows/deploy.yml` — CI deploy pipeline
- `.dev.vars.example` — local env-var template
- `docs/MIGRATION.md` — this file

### Removed
- `@astrojs/cloudflare` (dependency) — was stale, never imported

### Archived then removed
- `functions/` was archived to `functions.legacy/` during the migration, then deleted after the CI deploy went green. The originals live in git history at commit `394942f` for anyone who needs to read them.

---

## Environment Variable Mapping

The variable names stay identical — only the delivery mechanism changes.

| Variable | Pages location | Workers location | Notes |
|---|---|---|---|
| `PUBLIC_SUPABASE_URL` | Pages env var | `wrangler.jsonc` → `vars` block (public, non-secret) | |
| `PUBLIC_SUPABASE_ANON_KEY` | Pages env var | `wrangler secret put` | |
| `SUPABASE_SERVICE_ROLE_KEY` | Pages env var | `wrangler secret put` | Optional — bypasses RLS |
| `META_PIXEL_ID` | Pages env var | `wrangler secret put` | Optional |
| `META_ACCESS_TOKEN` | Pages env var | `wrangler secret put` | Optional |
| `GA4_MEASUREMENT_ID` | Pages env var | `wrangler secret put` | Optional |
| `GA4_API_SECRET` | Pages env var | `wrangler secret put` | Optional |
| `STRIPE_SECRET_KEY` | Pages env var | `wrangler secret put` | Optional (not wired) |
| `STRIPE_WEBHOOK_SECRET` | Pages env var | `wrangler secret put` | Optional (not wired) |
| `RESEND_API_KEY` | Pages env var | `wrangler secret put` | Optional (used by Supabase Edge Function, not the Worker) |

Pull current values from: Cloudflare dashboard → Workers & Pages → beautyfacelift (Pages) → Settings → Environment Variables.

---

## GitHub Actions Secrets

Set these in the GitHub repo: Settings → Secrets and variables → Actions.

**Repository secrets:**
| Name | Source |
|---|---|
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com → My Profile → API Tokens → "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar (right-hand "Account ID") |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |

**Repository variables:**
| Name | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://izekwngqjllaqibrwotp.supabase.co` |

---

## Local Development

```bash
# Option A: Astro dev server (UI work, hot reload, port 4321)
npm run dev

# Option B: Wrangler dev (full prod stack with /api/* routes, port 8787)
cp .dev.vars.example .dev.vars    # once — then populate with real values
npm run build                      # build assets
npm run cf:dev                     # wrangler dev

# Deploy from local (manual, useful for testing)
npm run cf:deploy

# Stream production logs
npm run cf:tail
```

Use **Option A** for UI iteration — hot reload is instant. Use **Option B** when testing API routes or the `ASSETS` fallthrough logic.

---

## Deployment URLs

| Environment | URL | Status |
|---|---|---|
| Workers deploy | https://beautyfacelift.mediapaulo.workers.dev | Historical temporary URL; not canonical and disabled for production via `workers_dev=false` |
| Production custom domain | https://beautyfacelift-zuerich.ch | Live on Cloudflare Workers custom domain as of 2026-05-07 |

The old Pages project (`beautyfacelift.pages.dev`) was deleted on 2026-04-15 as part of cutover.

---

## Rollback Instructions

The Pages project was deleted at cutover, so the "flip DNS back to Pages" path no longer exists. If the Worker breaks:

1. **Previous Worker version:** Cloudflare dashboard → Workers & Pages → beautyfacelift → Deployments → pick a known-good version → **Rollback**. Takes seconds.
2. **Previous git state:** `git revert` the bad commit and push — CI redeploys in ~60s.
3. **Nuclear option:** Recreate a Pages project from an older commit (before migration). `functions.legacy/` has the originals, or use any pre-migration commit. ~10 min.

---

## Known Differences from Pages (behavioural)

1. **`run_worker_first`** — assets now serve first by default. Only `/api/*` goes through the Worker. If you need a catch-all middleware (auth, logging, A/B), you have to widen this array.
2. **No `_routes.json`** — all routing config lives in `wrangler.jsonc`.
3. **No `_worker.js` auto-compile** — single explicit entry at `worker/index.ts`.
4. **Assets binding is manual** — `ASSETS` is declared in `wrangler.jsonc` rather than auto-provided. The `Env` type reflects this.
5. **Observability is opt-in** — enabled in `wrangler.jsonc` under `"observability": { "enabled": true }`.

---

## Post-Migration Cleanup

- **Pages project:** deleted 2026-04-15 during cutover.
- **`functions.legacy/`:** removed from the repo 2026-04-15. Originals preserved in git history at commit `394942f`.
- **Release tag:** `v2.0.0-workers` marks the cutover commit.
- **Feature branch + worktree:** `cf-workers-migration` branch and `.worktrees/cf-workers-migration/` worktree cleaned up after merge.

## Post-Migration TODOs

1. **Rotate Supabase service_role key** — the current value was pasted into a chat during cutover. Rotate in Supabase dashboard → Settings → API Keys, then `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` with the new value.
2. **Connect custom domain `beautyfacelift-zuerich.ch`** — done 2026-05-07. See [domain-launch-beautyfacelift-zuerich.md](domain-launch-beautyfacelift-zuerich.md) for DNS, Worker version, and verification results.
