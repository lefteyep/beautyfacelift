# Workers Cutover Runbook

Status as of 2026-05-07: historical Pages-to-Workers runbook. Do not use this document for the completed `beautyfacelift-zuerich.ch` production domain launch. Use [domain-launch-beautyfacelift-zuerich.md](domain-launch-beautyfacelift-zuerich.md) instead, and do not configure `beautyfacelift.ch`.

**Purpose:** Step-by-step commands to execute Tasks 10, 11, and 13 of the migration plan. Follow in order. Each step has a verify check.

**Branch:** `cf-workers-migration` (currently at `bae6947`, 11 commits ahead of `master`)

**Working directory for all commands below:**
`C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2\.worktrees\cf-workers-migration`

---

## ⚠️ Production Safety Callout — READ FIRST

The old Pages project at `beautyfacelift.pages.dev` auto-deploys on push to `master`.
If you merge this branch to master and push BEFORE disabling Pages auto-deploy OR BEFORE the Workers deploy is verified, you'll trigger a broken Pages build (because `functions/` is now `functions.legacy/`, so Pages will build a site with NO API endpoints).

**Correct order:** Deploy & verify on Workers first (Phase A + B), THEN cut over (Phase C). Never merge to `master` until Phase B passes.

---

## Phase A — Push Secrets to Workers (Task 10)

### A1. Authenticate wrangler

```powershell
cd C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2\.worktrees\cf-workers-migration
npx wrangler login
```

A browser window opens → sign in to Cloudflare → grant permission. Wrangler writes the token to `~/.wrangler/config/`.

**Verify:**
```powershell
npx wrangler whoami
```
Expect: your Cloudflare email + account ID.

### A2. Pull current secret values from Pages

Open: **dash.cloudflare.com → Workers & Pages → beautyfacelift (Pages) → Settings → Environment Variables → Production**

For each variable below that is SET on Pages, copy its value into a scratch file (delete the scratch file after A3). Skip any that are not set — the Worker handles missing optional secrets gracefully.

| Variable | Set on Pages? | Value to copy |
|---|---|---|
| `PUBLIC_SUPABASE_ANON_KEY` | yes (required) | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (required for bookings) | `eyJ...` |
| `META_PIXEL_ID` | ? | |
| `META_ACCESS_TOKEN` | ? | |
| `GA4_MEASUREMENT_ID` | ? | |
| `GA4_API_SECRET` | ? | |
| `STRIPE_SECRET_KEY` | ? (not yet wired) | |
| `STRIPE_WEBHOOK_SECRET` | ? (not yet wired) | |
| `RESEND_API_KEY` | ? (used by Supabase Edge Fn, not Worker) | |

Note: `PUBLIC_SUPABASE_URL` is NOT a secret — it's already in `wrangler.jsonc` under `vars`.

### A3. Push each secret

Run these one-by-one. Each prompts for the value — paste from your scratch file, press Enter.

**Important:** The Worker doesn't exist yet on Cloudflare (first deploy happens in Phase B). `wrangler secret put` will prompt you to create it — answer **yes**.

```powershell
npx wrangler secret put PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Optional — skip any your project doesn't use yet:
npx wrangler secret put META_PIXEL_ID
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put GA4_MEASUREMENT_ID
npx wrangler secret put GA4_API_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
```

**Verify:**
```powershell
npx wrangler secret list
```
Expect: a JSON array listing every name you pushed.

**Delete your scratch file with the pasted values.**

---

## Phase B — First Deploy + Smoke Test (Task 11)

### B1. Deploy

```powershell
npm run cf:deploy
```

This runs `astro build && wrangler deploy --keep-vars`. Watch the output — it ends with:

```
Deployed beautyfacelift triggers (X.XX sec)
  https://beautyfacelift.<your-subdomain>.workers.dev
```

**Copy that URL — call it `WORKERS_URL`.**

### B2. Smoke test — check each critical path

Open `WORKERS_URL` in a browser. Verify:

- [ ] Homepage loads — hero visible, gold accent color, Cormorant Garamond headline
- [ ] `/behandlungen/hydrafacial-zuerich/` — 3000+ word treatment page renders
- [ ] `/termin/` — booking widget loads (React island mounts, no console errors)
- [ ] `/admin/` — login form renders
- [ ] `/does-not-exist` — serves custom 404 page (not a generic Workers error)

API endpoints (use curl or browser):

- [ ] `curl WORKERS_URL/api/services` → returns `{"services":[...]}` with ≥4 treatments
- [ ] `curl "WORKERS_URL/api/availability?month=2026-05"` → returns `{"dates":[...]}` with future dates
- [ ] `curl "WORKERS_URL/api/slots?date=2026-05-01&service_id=<some-uuid-from-services-response>"` → returns `{"slots":["09:00","09:30",...]}`
- [ ] Submit a real test booking through the UI → confirm row appears in Supabase `bookings` table (dashboard: supabase.com/dashboard/project/izekwngqjllaqibrwotp/editor → bookings)

### B3. Watch logs during smoke test

In a second terminal, before running the smoke tests above:

```powershell
npm run cf:tail
```

Each request streams a log line. Look for:
- `GET /api/services` → 200
- `POST /api/bookings` → 201
- No unhandled exceptions

### B4. If ANYTHING fails

Stop. Don't proceed to Phase C. Share the failing request + response + log line. Roll back is not needed — the Pages deploy is still live at `beautyfacelift.pages.dev`.

If smoke test passes, log the `WORKERS_URL` in `docs/MIGRATION.md` → "Deployment URLs" table, replacing the "TBD" placeholder.

---

## Phase C — Cutover Production (Task 13)

### C1. Set GitHub repo secrets + variables

Open: **github.com/lefteyep/beautyfacelift → Settings → Secrets and variables → Actions**

**Secrets → New repository secret** (× 3):
| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Create at dash.cloudflare.com → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template → give it a name like "github-actions-deploy" → Create → copy the token once |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar (right column, under "Account ID") |
| `PUBLIC_SUPABASE_ANON_KEY` | Same value as Phase A3 — Supabase dashboard → Project Settings → API |

**Variables → New repository variable** (× 1):
| Name | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://izekwngqjllaqibrwotp.supabase.co` |

**Verify:** the Secrets and Variables tab shows all 3 secrets + 1 variable.

### C2. Disable Pages auto-deploy

Open: **dash.cloudflare.com → Workers & Pages → beautyfacelift (Pages project) → Settings → Builds & deployments → Branch deployments**

Set **Production branch** to something that won't match (e.g., `__disabled__`) OR toggle off auto-deploy if available. This prevents the old Pages project from fighting with the new Worker when you push to master.

**Do NOT delete the Pages project yet** — it's your rollback target for 30 days.

### C3. Merge branch and push

```powershell
cd C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2

# switch to main working directory, merge in the feature branch
git checkout master
git merge --no-ff cf-workers-migration -m "feat(cf): migrate from Cloudflare Pages to Workers"
git push origin master
```

### C4. Watch GitHub Actions

Open: **github.com/lefteyep/beautyfacelift/actions**

You should see a new run of "Deploy to Cloudflare Workers" kick off. Expect green check in ~60 seconds.

**If the workflow fails:**
- Click into the failed run → inspect the step that failed
- Most common: secret name typo → fix in GitHub repo settings → re-run the workflow (Actions tab → failed run → "Re-run all jobs")

### C5. Point the custom domain to the Worker

(Only do this step if `beautyfacelift-zuerich.ch` is already in Cloudflare DNS. If not, this is blocked on the separate "connect domain" task flagged in `CLAUDE.md`.)

Option 1 — via dashboard:
**dash.cloudflare.com → Workers & Pages → beautyfacelift (Worker) → Settings → Domains & Routes → Add → Custom Domain → `beautyfacelift-zuerich.ch`** (and `www.beautyfacelift-zuerich.ch`).

Option 2 — via wrangler.jsonc routes (commit + redeploy):
Add to `wrangler.jsonc`:
```jsonc
"routes": [
  { "pattern": "beautyfacelift-zuerich.ch/*", "zone_name": "beautyfacelift-zuerich.ch" },
  { "pattern": "www.beautyfacelift-zuerich.ch/*", "zone_name": "beautyfacelift-zuerich.ch" }
]
```
Then: `git commit -am "feat(cf): bind custom domain to Worker" && git push origin master`.

### C6. Production smoke test

Run the same checklist as B2, but against the production URL (`https://beautyfacelift-zuerich.ch`).

### C7. Tag the release

```powershell
git tag -a v2.0.0-workers -m "Migrated from Cloudflare Pages to Workers"
git push origin v2.0.0-workers
```

---

## Phase D — 30-Day Cleanup (Task 14, deferred)

Calendar reminder for 2026-05-15 (+ 30 days):

1. **Cloudflare dashboard → Pages project → Settings → Delete project**
2. In a new branch:
   ```powershell
   git rm -r functions.legacy
   git commit -m "chore(cf): remove legacy Pages Functions 30 days post-migration"
   git push origin master
   ```

---

## Rollback Procedure (if production breaks)

1. **Workers dashboard → beautyfacelift (Worker) → Settings → Domains & Routes** → remove `beautyfacelift-zuerich.ch/*` routes.
2. **Pages dashboard → beautyfacelift (Pages) → Settings → Builds & deployments** → re-enable auto-deploy on `master` → trigger a retry.
3. **Pages dashboard → Custom Domains** → re-add `beautyfacelift-zuerich.ch`.

Pages deploy takes ~90 seconds to go live. DNS propagation on Cloudflare is near-instant because both hosts are on Cloudflare's network.

---

## Checklist Summary

Phase A — Secrets:
- [ ] A1 `wrangler login` + verify with `whoami`
- [ ] A2 Pull secret values from Pages dashboard
- [ ] A3 Push each via `wrangler secret put`

Phase B — Deploy:
- [ ] B1 `npm run cf:deploy` — get `WORKERS_URL`
- [ ] B2 Smoke test 5 pages + 3 API routes + booking flow
- [ ] B3 Tail logs during smoke test
- [ ] Record `WORKERS_URL` in `docs/MIGRATION.md`

Phase C — Cutover:
- [ ] C1 GitHub secrets + variables
- [ ] C2 Disable Pages auto-deploy
- [ ] C3 Merge `cf-workers-migration` → `master`, push
- [ ] C4 Watch Actions green
- [ ] C5 Bind custom domain (if beautyfacelift-zuerich.ch is DNS-ready)
- [ ] C6 Production smoke test
- [ ] C7 Tag `v2.0.0-workers`

Phase D — Cleanup (calendar +30 days):
- [ ] D1 Delete Pages project
- [ ] D2 Remove `functions.legacy/`
