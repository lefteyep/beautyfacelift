# Documentation And Project Folder Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the project easy to navigate by separating current source-of-truth docs from historical logs, adding a docs index, and creating a safe cleanup path for the outer local project folder.

**Architecture:** Keep the production repo cleanup reversible in git by using `git mv` and archiving instead of deleting on the first pass. Keep active operational docs under `docs/current/`, historical release/design/migration records under `docs/archive/`, and local non-git assets under a dated folder outside the repo only after an inventory is reviewed. Add a small docs QA script so stale domain/deployment claims do not re-enter the active docs.

**Tech Stack:** Astro repo on Git, Cloudflare Workers, Node scripts, PowerShell for local inventory, Markdown docs.

---

## Audit Summary From 2026-05-18

Repo documentation currently includes:

- 30 markdown files under `docs/`.
- 3 historical implementation plans under `docs/superpowers/plans/`.
- Top-level `README.md`, `AGENTS.md`, `PRD.md`, and `CLAUDE.md`.
- `design/DESIGN-SYSTEM.md` outside `docs/`.

Current docs that should remain easy to find:

- `README.md`
- `AGENTS.md`
- `docs/STATUS.md`
- `docs/TODO.md`
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/PPC-TRACKING-SETUP-2026-05-08.md`
- `docs/SECURITY-STATUS.md`
- `docs/SITEMAP.md`
- `docs/domain-launch-beautyfacelift-zuerich.md`
- `design/DESIGN-SYSTEM.md`

Historical or lower-priority docs that should be archived:

- `docs/CUTOVER-RUNBOOK.md`
- `docs/MIGRATION.md`
- `docs/DELIVERY-2026-04-22.md`
- `docs/DELIVERY-2026-05-08.md`
- `docs/RELEASE-2026-05-08-live-update.md`
- `docs/CARBON-GLOWUP-TREATWELL-RELEASE-2026-05-08.md`
- `docs/SEO-SERVICE-HUBS-2026-05-08.md`
- `docs/PRD-EXECUTION-2026-05-05.md`
- `docs/RELAUNCH-IMPROVEMENTS-PLAN.md`
- `docs/RELAUNCH-STATUS.md`
- `docs/TREATMENT-CTA-UPDATE-2026-05-08.md`
- `docs/EXOSOME-THERAPIE-2026-05-06.md`
- `docs/HERO-LAYOUT-REVISION.md`
- `docs/HERO-THIRD-CARD-2026-04-24.md`
- `docs/LP-CARBON-MICRONEEDLING-2026-04-24.md`
- `docs/LAYOUT-SYSTEM.md`
- `docs/IMAGES.md`
- `docs/imagery-upgrade-2026-04-24.md`
- `PRD.md`
- `CLAUDE.md`
- completed historical files under `docs/superpowers/plans/`

Active stale facts found during the audit:

- `AGENTS.md` still says the live Worker URL is `https://beautyfacelift.mediapaulo.workers.dev/`, but production is `https://beautyfacelift-zuerich.ch`.
- `PRD.md` and `CLAUDE.md` still describe old workers.dev / Pages-era assumptions and BookingWidget-centric flow.
- Several historical files already contain warning notes; archiving them will make those warnings less likely to confuse day-to-day work.
- The outer local project folder contains large non-repo folders and loose assets: `ads` around 491.5 MB, `carbon peeling` around 482.1 MB, `microneedling` around 265.9 MB, `webseite-redesign` around 198.1 MB, plus loose videos, PDFs, images, and a customer export CSV.

## Target File Structure

```text
astro-v2/
  README.md
  AGENTS.md
  docs/
    README.md
    current/
      ARCHITECTURE.md
      DESIGN-SYSTEM.md
      DOMAIN-LAUNCH.md
      PPC-TRACKING.md
      SECURITY.md
      SETUP.md
      SITEMAP.md
      STATUS.md
      TODO.md
    archive/
      ai-context/
      design-notes/
      feature-notes/
      migration/
      plans/
      prd/
      releases/
    superpowers/
      plans/
        2026-05-18-documentation-project-folder-organization.md
  scripts/
    check-docs-current.mjs
```

```text
beautyfacelift/
  astro-v2/
  astro-v2-worktrees/
  _archives/
    2026-05-18-local-cleanup/
      client-assets/
      client-documents/
      old-builds/
      qa-artifacts/
      private-data/
```

## Task 1: Create A Dedicated Cleanup Branch

**Files:**
- Modify: none

- [ ] **Step 1: Start from the live-line branch after PR #20 is merged**

Run:

```powershell
cd C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2
git fetch origin
git worktree add ..\astro-v2-worktrees\docs-organization -b codex/docs-organization origin/codex/project-safety-rules
cd ..\astro-v2-worktrees\docs-organization
```

Expected:

```text
Preparing worktree (new branch 'codex/docs-organization')
```

- [ ] **Step 2: Confirm repo safety state**

Run:

```powershell
git status -sb
git remote -v
git branch --show-current
```

Expected:

```text
## codex/docs-organization
origin  https://github.com/lefteyep/beautyfacelift.git (fetch)
origin  https://github.com/lefteyep/beautyfacelift.git (push)
codex/docs-organization
```

## Task 2: Add A Documentation Index

**Files:**
- Create: `docs/README.md`
- Modify: `README.md`

- [ ] **Step 1: Create `docs/README.md`**

Create this file:

```markdown
# Documentation Index

Use this page to choose the right document quickly.

## Current Source Of Truth

| Need | Document |
|------|----------|
| Project overview and commands | [../README.md](../README.md) |
| Codex safety and deployment rules | [../AGENTS.md](../AGENTS.md) |
| Current launch/status snapshot | [current/STATUS.md](current/STATUS.md) |
| Open operational work | [current/TODO.md](current/TODO.md) |
| Local setup and production config | [current/SETUP.md](current/SETUP.md) |
| Architecture and request flow | [current/ARCHITECTURE.md](current/ARCHITECTURE.md) |
| Tracking and paid ads setup | [current/PPC-TRACKING.md](current/PPC-TRACKING.md) |
| Security actions | [current/SECURITY.md](current/SECURITY.md) |
| Sitemap and indexable routes | [current/SITEMAP.md](current/SITEMAP.md) |
| Domain launch record | [current/DOMAIN-LAUNCH.md](current/DOMAIN-LAUNCH.md) |
| Design system | [current/DESIGN-SYSTEM.md](current/DESIGN-SYSTEM.md) |

## Historical Records

Historical docs are kept under [archive/](archive/) for traceability. They are not current operating instructions unless a current doc links to them explicitly.

## Rule For New Docs

Add new durable docs under `docs/current/`. Add release notes, one-off implementation notes, and old plans under `docs/archive/`. Keep `docs/superpowers/plans/` for active implementation plans only.
```

- [ ] **Step 2: Add a docs link to `README.md`**

Add this section after `## Commands`:

```markdown
## Documentation

Start with [docs/README.md](docs/README.md). Current operating docs live in `docs/current/`; historical release notes and old implementation records live in `docs/archive/`.
```

- [ ] **Step 3: Verify the new index is discoverable**

Run:

```powershell
rg -n "Documentation|docs/README.md|Current Source Of Truth" README.md docs/README.md
```

Expected: matches in both `README.md` and `docs/README.md`.

## Task 3: Move Current Docs Into `docs/current/`

**Files:**
- Move: `docs/ARCHITECTURE.md` -> `docs/current/ARCHITECTURE.md`
- Move: `docs/domain-launch-beautyfacelift-zuerich.md` -> `docs/current/DOMAIN-LAUNCH.md`
- Move: `docs/PPC-TRACKING-SETUP-2026-05-08.md` -> `docs/current/PPC-TRACKING.md`
- Move: `docs/SECURITY-STATUS.md` -> `docs/current/SECURITY.md`
- Move: `docs/SETUP.md` -> `docs/current/SETUP.md`
- Move: `docs/SITEMAP.md` -> `docs/current/SITEMAP.md`
- Move: `docs/STATUS.md` -> `docs/current/STATUS.md`
- Move: `docs/TODO.md` -> `docs/current/TODO.md`
- Move: `design/DESIGN-SYSTEM.md` -> `docs/current/DESIGN-SYSTEM.md`

- [ ] **Step 1: Create folders**

Run:

```powershell
New-Item -ItemType Directory -Force docs\current
New-Item -ItemType Directory -Force docs\archive\ai-context
New-Item -ItemType Directory -Force docs\archive\design-notes
New-Item -ItemType Directory -Force docs\archive\feature-notes
New-Item -ItemType Directory -Force docs\archive\migration
New-Item -ItemType Directory -Force docs\archive\plans
New-Item -ItemType Directory -Force docs\archive\prd
New-Item -ItemType Directory -Force docs\archive\releases
```

Expected: folders exist and no files are modified yet.

- [ ] **Step 2: Move current docs with git history preserved**

Run:

```powershell
git mv docs\ARCHITECTURE.md docs\current\ARCHITECTURE.md
git mv docs\domain-launch-beautyfacelift-zuerich.md docs\current\DOMAIN-LAUNCH.md
git mv docs\PPC-TRACKING-SETUP-2026-05-08.md docs\current\PPC-TRACKING.md
git mv docs\SECURITY-STATUS.md docs\current\SECURITY.md
git mv docs\SETUP.md docs\current\SETUP.md
git mv docs\SITEMAP.md docs\current\SITEMAP.md
git mv docs\STATUS.md docs\current\STATUS.md
git mv docs\TODO.md docs\current\TODO.md
git mv design\DESIGN-SYSTEM.md docs\current\DESIGN-SYSTEM.md
```

Expected: `git status -sb` shows renames, not delete/add pairs where Git can detect the rename.

## Task 4: Archive Historical Repo Docs

**Files:**
- Move historical docs from `docs/`, top level, and `docs/superpowers/plans/` into `docs/archive/`.

- [ ] **Step 1: Move migration and cutover records**

Run:

```powershell
git mv docs\CUTOVER-RUNBOOK.md docs\archive\migration\CUTOVER-RUNBOOK.md
git mv docs\MIGRATION.md docs\archive\migration\MIGRATION.md
git mv docs\superpowers\plans\2026-04-15-cloudflare-workers-migration.md docs\archive\plans\2026-04-15-cloudflare-workers-migration.md
```

- [ ] **Step 2: Move release and delivery records**

Run:

```powershell
git mv docs\DELIVERY-2026-04-22.md docs\archive\releases\DELIVERY-2026-04-22.md
git mv docs\DELIVERY-2026-05-08.md docs\archive\releases\DELIVERY-2026-05-08.md
git mv docs\RELEASE-2026-05-08-live-update.md docs\archive\releases\RELEASE-2026-05-08-live-update.md
git mv docs\CARBON-GLOWUP-TREATWELL-RELEASE-2026-05-08.md docs\archive\releases\CARBON-GLOWUP-TREATWELL-RELEASE-2026-05-08.md
git mv docs\SEO-SERVICE-HUBS-2026-05-08.md docs\archive\releases\SEO-SERVICE-HUBS-2026-05-08.md
```

- [ ] **Step 3: Move feature notes**

Run:

```powershell
git mv docs\EXOSOME-THERAPIE-2026-05-06.md docs\archive\feature-notes\EXOSOME-THERAPIE-2026-05-06.md
git mv docs\LP-CARBON-MICRONEEDLING-2026-04-24.md docs\archive\feature-notes\LP-CARBON-MICRONEEDLING-2026-04-24.md
git mv docs\PRD-EXECUTION-2026-05-05.md docs\archive\feature-notes\PRD-EXECUTION-2026-05-05.md
git mv docs\RELAUNCH-IMPROVEMENTS-PLAN.md docs\archive\feature-notes\RELAUNCH-IMPROVEMENTS-PLAN.md
git mv docs\RELAUNCH-STATUS.md docs\archive\feature-notes\RELAUNCH-STATUS.md
git mv docs\TREATMENT-CTA-UPDATE-2026-05-08.md docs\archive\feature-notes\TREATMENT-CTA-UPDATE-2026-05-08.md
```

- [ ] **Step 4: Move design notes**

Run:

```powershell
git mv docs\HERO-LAYOUT-REVISION.md docs\archive\design-notes\HERO-LAYOUT-REVISION.md
git mv docs\HERO-THIRD-CARD-2026-04-24.md docs\archive\design-notes\HERO-THIRD-CARD-2026-04-24.md
git mv docs\LAYOUT-SYSTEM.md docs\archive\design-notes\LAYOUT-SYSTEM.md
git mv docs\IMAGES.md docs\archive\design-notes\IMAGES.md
git mv docs\imagery-upgrade-2026-04-24.md docs\archive\design-notes\imagery-upgrade-2026-04-24.md
```

- [ ] **Step 5: Move old planning and AI-context docs**

Run:

```powershell
git mv PRD.md docs\archive\prd\PRD.md
git mv CLAUDE.md docs\archive\ai-context\CLAUDE.md
git mv docs\superpowers\plans\2026-04-17-carbon-microneedling-lp-revision.md docs\archive\plans\2026-04-17-carbon-microneedling-lp-revision.md
git mv docs\superpowers\plans\2026-05-08-ppc-treatwell-tracking.md docs\archive\plans\2026-05-08-ppc-treatwell-tracking.md
```

- [ ] **Step 6: Verify no old loose docs remain at the wrong level**

Run:

```powershell
rg --files -g "*.md" -g "README*" -g "AGENTS.md"
```

Expected current doc shape includes `README.md`, `AGENTS.md`, `docs/README.md`, `docs/current/*.md`, `docs/archive/**/*.md`, and active plans under `docs/superpowers/plans/`.

## Task 5: Consolidate Current Status And Pending Work

**Files:**
- Modify: `docs/current/STATUS.md`
- Modify: `docs/current/TODO.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Fix stale production URL in `AGENTS.md`**

Replace:

```markdown
- The live Worker URL is `https://beautyfacelift.mediapaulo.workers.dev/`.
```

With:

```markdown
- The live production URL is `https://beautyfacelift-zuerich.ch`.
- The temporary workers.dev hostname is not canonical and should remain disabled or redirected by production config.
```

- [ ] **Step 2: Update `docs/current/STATUS.md` header**

Replace the first status paragraph with:

```markdown
**Last updated:** May 18, 2026

This file is the current status source of truth. Historical implementation notes live under `docs/archive/`.
```

- [ ] **Step 3: Add missing operational risks to `docs/current/TODO.md`**

Under `## Priority 1: Go Live (blocking everything else)`, include these rows if they are not already present:

```markdown
- [ ] Rotate the Supabase `service_role` key if any previous chat, local file, or deployment log exposed it.
- [ ] Replace weak/test admin credentials before exposing production customer data.
- [ ] Verify `/api/services` on production returns 200 or intentionally document why it may return 500 while Treatwell is active.
```

- [ ] **Step 4: Confirm duplicated pending-work docs are archived**

Run:

```powershell
Test-Path docs\PENDING-WORK.md
Test-Path docs\archive\feature-notes\PENDING-WORK.md
```

Expected before the move: first is `True`, second is `False`.

- [ ] **Step 5: Archive `docs/PENDING-WORK.md` after its open items are copied**

Run:

```powershell
git mv docs\PENDING-WORK.md docs\archive\feature-notes\PENDING-WORK.md
```

Expected: open work now lives in `docs/current/TODO.md`; the old pending-work narrative is historical.

## Task 6: Update All Markdown Links After Moves

**Files:**
- Modify: all moved docs as needed

- [ ] **Step 1: Find stale links**

Run:

```powershell
rg -n "docs/(ARCHITECTURE|STATUS|TODO|SETUP|SITEMAP|SECURITY-STATUS|PPC-TRACKING-SETUP-2026-05-08|domain-launch-beautyfacelift-zuerich)|\\.\\./(ARCHITECTURE|STATUS|TODO|SETUP|SITEMAP)" README.md AGENTS.md docs
```

Expected: any matches point to old paths and need replacement.

- [ ] **Step 2: Replace old docs paths with current paths**

Use these replacements:

```text
docs/ARCHITECTURE.md -> docs/current/ARCHITECTURE.md
docs/STATUS.md -> docs/current/STATUS.md
docs/TODO.md -> docs/current/TODO.md
docs/SETUP.md -> docs/current/SETUP.md
docs/SITEMAP.md -> docs/current/SITEMAP.md
docs/SECURITY-STATUS.md -> docs/current/SECURITY.md
docs/PPC-TRACKING-SETUP-2026-05-08.md -> docs/current/PPC-TRACKING.md
docs/domain-launch-beautyfacelift-zuerich.md -> docs/current/DOMAIN-LAUNCH.md
design/DESIGN-SYSTEM.md -> docs/current/DESIGN-SYSTEM.md
```

- [ ] **Step 3: Verify Markdown links do not point to missing local docs**

Run:

```powershell
rg -n "\\]\\(([^)#]+\\.md)" README.md AGENTS.md docs
```

Expected: each local `.md` link resolves to an existing file after path normalization.

## Task 7: Add A Docs QA Script

**Files:**
- Create: `scripts/check-docs-current.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/check-docs-current.mjs`**

Create:

```js
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const activeFiles = [
  'README.md',
  'AGENTS.md',
  'docs/README.md',
  'docs/current/ARCHITECTURE.md',
  'docs/current/DESIGN-SYSTEM.md',
  'docs/current/DOMAIN-LAUNCH.md',
  'docs/current/PPC-TRACKING.md',
  'docs/current/SECURITY.md',
  'docs/current/SETUP.md',
  'docs/current/SITEMAP.md',
  'docs/current/STATUS.md',
  'docs/current/TODO.md',
];

const forbidden = [
  {
    pattern: /live Worker URL is `https:\/\/beautyfacelift\.mediapaulo\.workers\.dev\/`/i,
    reason: 'workers.dev must not be described as the live production URL',
  },
  {
    pattern: /beautyfacelift\.pages\.dev/i,
    reason: 'Pages host is historical and should not appear in active docs',
  },
  {
    pattern: /currently live at beautyfacelift\.pages\.dev/i,
    reason: 'old Pages-era deployment text is stale',
  },
  {
    pattern: /BookingWidget.*active public booking path/i,
    reason: 'BookingWidget is legacy while Treatwell is active',
  },
];

let failed = false;

for (const file of activeFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    console.error(`[missing] ${file}`);
    failed = true;
    continue;
  }

  const text = fs.readFileSync(absolute, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(text)) {
      console.error(`[stale] ${file}: ${rule.reason}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('[ok] current docs do not contain known stale deployment claims');
```

- [ ] **Step 2: Add npm script**

In `package.json`, add:

```json
"qa:docs": "node scripts/check-docs-current.mjs"
```

- [ ] **Step 3: Run docs QA**

Run:

```powershell
npm run qa:docs
```

Expected:

```text
[ok] current docs do not contain known stale deployment claims
```

## Task 8: Review Legacy Code Folders Before Any Deletion

**Files:**
- Inspect: `src/api_backup/**`
- Inspect: `src/components/booking/**`
- Inspect: `worker/routes/**`
- Modify: `docs/current/ARCHITECTURE.md`
- Modify: `docs/current/TODO.md`

- [ ] **Step 1: Confirm `src/api_backup` is unused**

Run:

```powershell
rg -n "api_backup|\\.\\/api_backup|\\.\\.\\/api_backup" src worker scripts package.json docs/current
```

Expected: no runtime imports. Matches in docs are acceptable only if they describe archival status.

- [ ] **Step 2: Confirm first-party booking is legacy but still referenced**

Run:

```powershell
rg -n "BookingWidget|DepositStep|/api/bookings|buchung-bestaetigt" src worker scripts docs/current package.json
```

Expected: references show the legacy booking code exists, `/api/bookings` is disabled by default, and public booking uses `/termin/` -> Treatwell.

- [ ] **Step 3: Document the decision**

In `docs/current/ARCHITECTURE.md`, keep this exact entry under React islands:

```markdown
- `src/components/booking/**` is legacy first-party booking UI. It remains in the repo for a possible future direct-booking return, but it is not the active public conversion path while Treatwell is active.
```

In `docs/current/TODO.md`, add:

```markdown
- [ ] Decide whether to delete `src/api_backup/**` after confirming git history is sufficient as the archive.
- [ ] Decide whether to keep, remove, or revive the legacy first-party BookingWidget after Treatwell/confirmed-booking tracking is settled.
```

## Task 9: Build And Link-Check The Reorganized Repo

**Files:**
- Modify: none unless checks expose broken docs or config

- [ ] **Step 1: Run core checks**

Run:

```powershell
npm run qa:docs
npm run qa:marketing
npm run qa:carbon-lp
npm run build
```

Expected:

```text
[ok] current docs do not contain known stale deployment claims
[ok] marketing/ads tracking contract is current
[ok] Carbon Microneedling LP offer, Treatwell bridge, and tracking copy are aligned.
35 page(s) built
```

- [ ] **Step 2: Confirm git sees only intended cleanup files**

Run:

```powershell
git status -sb
git diff --stat
```

Expected: docs moves, docs index, package script, docs QA script, and targeted current-doc edits only.

- [ ] **Step 3: Commit**

Run:

```powershell
git add -A
git commit -m "Organize project documentation"
```

Expected:

```text
[codex/docs-organization <hash>] Organize project documentation
```

## Task 10: Inventory The Outer Local Project Folder

**Files:**
- Create outside repo: `_archives/2026-05-18-local-cleanup/local-folder-inventory.tsv`
- Move outside repo only after review

- [ ] **Step 1: Create a local cleanup folder**

Run from `C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift`:

```powershell
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup\client-assets
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup\client-documents
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup\old-builds
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup\private-data
New-Item -ItemType Directory -Force _archives\2026-05-18-local-cleanup\qa-artifacts
```

- [ ] **Step 2: Generate an inventory TSV**

Run:

```powershell
Get-ChildItem -Force | ForEach-Object {
  $item = $_
  if ($item.PSIsContainer) {
    $files = Get-ChildItem -LiteralPath $item.FullName -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\dist\\|\\.astro\\' }
    $bytes = ($files | Measure-Object -Property Length -Sum).Sum
    if ($null -eq $bytes) { $bytes = 0 }
    "{0}`tdir`t{1}`t{2}" -f $item.Name, $files.Count, $bytes
  } else {
    "{0}`tfile`t1`t{1}" -f $item.Name, $item.Length
  }
} | Set-Content -Path _archives\2026-05-18-local-cleanup\local-folder-inventory.tsv
```

Expected: `_archives/2026-05-18-local-cleanup/local-folder-inventory.tsv` contains one row per top-level item.

- [ ] **Step 3: Review sensitive items before moving**

Classify these as private data and do not move them into the repo:

```text
Beauty Face Lift Kundenexport 07.02.2025.csv
BeautyFaceLift_Hydra4Face_Telefonleitfaden.docx
SwissPelviCare - Telefon Leitfaden für Telefon Anfragen .docx
```

Expected: these files are treated as local/private only.

## Task 11: Move Safe Local-Only Artifacts After User Approval

**Files:**
- Move outside repo only

- [ ] **Step 1: Move QA/cache artifacts**

Run from `C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift` after user approval:

```powershell
Move-Item -LiteralPath .tmp-qa -Destination _archives\2026-05-18-local-cleanup\qa-artifacts\.tmp-qa
Move-Item -LiteralPath .playwright-cli -Destination _archives\2026-05-18-local-cleanup\qa-artifacts\.playwright-cli
Move-Item -LiteralPath output -Destination _archives\2026-05-18-local-cleanup\qa-artifacts\output
```

- [ ] **Step 2: Move old local build/prototype folders**

Run after user approval:

```powershell
Move-Item -LiteralPath "redesign-v2" -Destination _archives\2026-05-18-local-cleanup\old-builds\redesign-v2
Move-Item -LiteralPath "webseite-redesign" -Destination _archives\2026-05-18-local-cleanup\old-builds\webseite-redesign
Move-Item -LiteralPath "gemini-v3" -Destination _archives\2026-05-18-local-cleanup\old-builds\gemini-v3
```

- [ ] **Step 3: Move campaign asset folders**

Run after user approval:

```powershell
Move-Item -LiteralPath "ads" -Destination _archives\2026-05-18-local-cleanup\client-assets\ads
Move-Item -LiteralPath "carbon peeling" -Destination _archives\2026-05-18-local-cleanup\client-assets\carbon peeling
Move-Item -LiteralPath "microneedling" -Destination _archives\2026-05-18-local-cleanup\client-assets\microneedling
```

- [ ] **Step 4: Move loose media assets**

Run after user approval:

```powershell
Move-Item -LiteralPath "video 1 long.mp4" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "video 2 long.mp4" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "video 3.mp4" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "669eae96f846208778d3317b.mp4" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Gemini_Generated_Image_rmzdkirmzdkirmzd.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "bild1.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "bild2.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "bild 3.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-1.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-2.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-3.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-4.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-5.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-6.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
Move-Item -LiteralPath "Bewertung-7.png" -Destination _archives\2026-05-18-local-cleanup\client-assets\
```

- [ ] **Step 5: Move loose client documents**

Run after user approval:

```powershell
Move-Item -LiteralPath "Angebot_AG0088.pdf" -Destination _archives\2026-05-18-local-cleanup\client-documents\
Move-Item -LiteralPath "Beautyfacelift design system.zip" -Destination _archives\2026-05-18-local-cleanup\client-documents\
Move-Item -LiteralPath "BeautyFaceLift_Hydra4Face_Telefonleitfaden.docx" -Destination _archives\2026-05-18-local-cleanup\client-documents\
```

- [ ] **Step 6: Move private or unrelated personal documents separately**

Run after user approval:

```powershell
Move-Item -LiteralPath "Beauty Face Lift Kundenexport 07.02.2025.csv" -Destination _archives\2026-05-18-local-cleanup\private-data\
Move-Item -LiteralPath "SwissPelviCare - Telefon Leitfaden für Telefon Anfragen .docx" -Destination _archives\2026-05-18-local-cleanup\private-data\
Move-Item -LiteralPath "3R300_Misch_sozial_20_VWL.pdf" -Destination _archives\2026-05-18-local-cleanup\private-data\
Move-Item -LiteralPath "Kuendigung_Entgeltumwandlung.pdf" -Destination _archives\2026-05-18-local-cleanup\private-data\
Move-Item -LiteralPath "kuendigung-der-versicherung.pdf" -Destination _archives\2026-05-18-local-cleanup\private-data\
Move-Item -LiteralPath "mitgliedsantrag.pdf" -Destination _archives\2026-05-18-local-cleanup\private-data\
```

## Task 12: Close Out With Two Pull Requests

**Files:**
- Modify: GitHub PR metadata only

- [ ] **Step 1: Push docs branch**

Run:

```powershell
git push -u origin codex/docs-organization
```

Expected:

```text
branch 'codex/docs-organization' set up to track 'origin/codex/docs-organization'
```

- [ ] **Step 2: Open draft PR**

Run:

```powershell
gh pr create --draft --base codex/project-safety-rules --head codex/docs-organization --title "[codex] Organize project documentation" --body "Organizes current docs under docs/current, archives historical records under docs/archive, adds docs/README.md, and adds npm run qa:docs to prevent stale deployment claims in active docs."
```

Expected: GitHub returns the new PR URL.

- [ ] **Step 3: Leave the outer folder cleanup as a local approval checklist**

Do not commit local archive moves. Report the local inventory path and ask the user before moving large campaign folders, private data, or old build folders.

## Self-Review Checklist

- Spec coverage: Covers repo docs, stale active docs, historical archive, active source-of-truth docs, legacy code folders, local workspace clutter, and PR workflow.
- Placeholder scan: No TBD placeholders or vague implementation steps are used; every move has exact source and destination.
- Safety: Repo changes are reversible through git. Local non-git file moves require explicit user approval before execution.
