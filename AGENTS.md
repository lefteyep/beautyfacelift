# Codex Project Rules

## Start here (handover 2026-10-21)

1. Read `docs/current/HANDOVER-2026-10-21.md` (project, systems and IDs, current state, next steps), then `docs/current/STATUS.md` and `docs/current/TODO.md`.
2. The approved plan for the next build is `docs/current/LEAD-COCKPIT-PLAN.md`; its Phase 1 is merged and deployed since 2026-10-30 (PR #62; current state in `docs/current/STATUS.md`).
3. The sections "Project context" below mirror the local `CLAUDE.md` (gitignored by design; Claude reads it, and it includes this file through `@AGENTS.md`): commands, release gates, client design and copy rules, gotchas. They apply to every task.
4. `docs/current/CODEX-START.md` holds the start prompt and the setup notes for OpenAI Codex.
5. **Source of truth** is GitHub `lefteyep/beautyfacelift`, branch `master`. An orchestrator session keeps the board `docs/orchestrator/STATUS.md` in the main local copy (excluded from git). When it exists, read it first: it names the current milestone, the owner of every file set and every running worker. Nothing new starts without the user's explicit go. A Codex task gets its brief from `docs/orchestrator/handover/` and reports back there.

## Safety Model

- `master` is the live deploy branch. Pushing to `master` triggers Cloudflare deployment through `.github/workflows/deploy.yml`.
- Do not edit directly on `master`.
- Do not run `npm run cf:deploy`, `wrangler deploy`, or push to `master` without explicit user approval.
- The live production URL is `https://beautyfacelift-zuerich.ch`.
- The temporary workers.dev hostname is not canonical and should remain disabled or redirected by production config.
- The GitHub remote must be `https://github.com/lefteyep/beautyfacelift.git`.

## Required Start Check

Before editing files, run and report:

```bash
git status -sb
git remote -v
git branch --show-current
```

If the current branch is `master`, stop and create or switch to a task branch first:

```bash
git switch -c codex/<short-task-name>
```

If there are uncommitted changes you did not create, do not overwrite them. Work with them if they are relevant, or ask before touching the same files.

## Parallel Chat / Agent Rules

- Branches belong to folders, not chats. Two Codex chats using the same folder share the same files and the same current branch.
- For simultaneous editing, create a temporary sibling Git worktree per agent/task.
- Each editing agent should have its own folder and its own branch, for example:

```text
astro-v2                      -> master, reference only
../astro-v2-worktrees/homepage -> codex/homepage-fixes
../astro-v2-worktrees/booking  -> codex/booking-fixes
```

- Do not let two agents edit the same files at the same time unless one agent is only reviewing.
- Use clear ownership: one agent per page, component group, or feature area.
- Before merging branches, run tests/builds and review the diff.
- Remove temporary worktrees after their branches are merged or abandoned.

## Deployment Rule

Changes are allowed to go live only after:

1. Work is on a non-master branch.
2. The branch has been tested locally.
3. A pull request is reviewed.
4. The user explicitly approves merge/deploy to `master`.

## Project context

Client site built and run by the mediapaulo agency for Beauty Face Lift (Teresa Stimac, Bahnhofstrasse 94, 8001 Zürich). Production: https://beautyfacelift-zuerich.ch. Docs index: `docs/README.md`; current state: `docs/current/STATUS.md`; open work: `docs/current/TODO.md`.

### Stack

- **Site:** Astro 7, static build of 36 pages, served by a Cloudflare Worker with Static Assets.
- **Worker:** `worker/index.ts`, with `itty-router` for `/api/*`. Config is in `wrangler.jsonc`.
- **Front end:** vanilla CSS, GSAP, and `@fontsource` (Instrument Serif + Instrument Sans). No Tailwind, no Partytown.
- **Booking:** forwards to Treatwell via `/termin/`.
- **Contact form:** posts to the Worker, which sends mail through Resend.
- **Tracking:** `/api/track` forwards events to Meta CAPI; GTM/GA4 load only after marketing consent.

### Commands

```bash
npm run dev                          # Astro dev server, http://localhost:4321
npm run check                        # astro check + tsc -p worker — must be 0 errors
npm run validate                     # complete release gate, including offline behavior checks
npm run build                        # static build into dist/
npm audit --audit-level=moderate     # CI gate — must report 0 vulnerabilities
npm run qa:aquafacial-lp && npm run qa:aquafacial-combo-lp && npm run qa:carbon-lp && npm run qa:simple-lps
npm run qa:docs && npm run qa:marketing && npm run qa:contact
node scripts/seo-plan-smoke.mjs
npm run launch:check
npx wrangler deploy --dry-run
```

Run all of them before asking for a release. The Lead-Cockpit branches add `npm run qa:leads` and `npm run harness:*`.

### Release workflow

- Work on a `codex/*` branch, never on `master`. Parallel work goes in sibling worktrees under `../astro-v2-worktrees/`.
- Pushing a feature branch is safe. Pushing or merging to `master` deploys to production (`.github/workflows/deploy.yml`: `npm ci`, audit, build, `wrangler deploy`). Do this only with the user's explicit approval in the current conversation, after a reviewed PR.
- Never run `npm run cf:deploy` or `wrangler deploy` by hand.

### Where things live

- **`shared/site.ts`:** contact data and booking links; `SERVICE_GROUPS` (label, href, description, `priceFrom`, services) is the single source for the nav menu, footer, homepage and `/behandlungen/`.
- **`shared/tracking.ts`:** the one list of event-data keys the page may send to `/api/track` and the Worker accepts (they must never drift).
- **`src/styles/main.css`:** tokens, type and buttons. **`src/styles/components.css`:** shared patterns (nav, heroes, section heads, lists, FAQ, CTA band, footer). Page-specific layout in each page's scoped `<style>`.
- **`src/layouts/`:** `Base.astro` (site layout, critical nav CSS, tracking bootstrap), `LandingPage.astro` (ad pages, no nav), `BlogPost.astro` (articles).
- **Treatment pages:** `src/components/ServiceHubPage.astro` renders the six service hubs; `src/components/treatment/*` is the kit for treatment detail pages.
- **Ad landing pages:** `src/pages/lp/*` and `src/components/lp/*` (`/lp/aquafacial/` in "du", the others in "Sie"). The Aquafacial, combo and Carbon pages are locked by the `qa:*-lp` scripts, Microneedling and Peeling by `qa:simple-lps`.
- **`src/lib/track.ts`:** consent-gated Pixel/GTM, CAPI dedupe and lead events (the combo page queues its lead and `/kontakt/danke/` counts it).
- **`worker/routes/contact.ts`:** form parsing, validation, Turnstile, Resend mail. **`worker/leads/*`, `worker/email/*`, `worker/cron/*`:** the Lead-Cockpit (PR branches).

### Design and copy rules (client-mandated)

The full system ("Atelier Glow") is in `docs/current/DESIGN-SYSTEM.md`. Non-negotiable:

- No eyebrow/overline labels above headings and no decorative pills. No italics: `font-style: italic` is banned.
- Little text: a hero is the H1, one lead sentence and the CTAs. No "Auf einen Blick" or facts boxes, no image captions.
- UI labels use clean names ("Waxing", not "Waxing Zürich"). Important links are buttons (`btn btn-secondary btn-arrow`).
- The blog is called "Wissen" in the UI; the URL stays `/blog/`.
- Never invent prices, durations, results, reviews or claims. Cosmetic claims stay cautious ("kann … unterstützen"). Never write "Hydrafacial" or "Hydra"; "Hydra4Face" is allowed but unwanted — the site says "Aquafacial". Treatwell is the source of truth for services, durations, prices and opening hours (its "Hydra4Face …" services are the site's Aquafacial treatments; map them one to one).
- Swiss spelling ("ss", never "ß"). The main site uses "Sie"; each ad page keeps its campaign voice.
- Show rendered desktop and mobile screenshots before rolling out a visual change site-wide.

### Gotchas

- **SEO smoke test:** `scripts/seo-plan-smoke.mjs` needs exact strings: the six group labels in `src/pages/behandlungen/index.astro`, the hub anchors in `src/pages/index.astro` (`hubAnchors` map), `SERVICE_GROUPS` in Nav and Footer.
- **LP QA scripts** assert exact LP markup, including the `eyebrow` kickers and the offer end date, so those must stay.
- **Analytics contract:** keep `data-button-location`, `data-treatment` and `data-source` on CTAs (`qa:marketing`).
- **Forms:** never submit the real contact or LP lead forms — they e-mail the client. Prove behaviour with the harnesses in `scripts/harness/`.
- **Astro scoped CSS** adds an attribute selector to every rule, so a scoped selector outranks an equal global one.
- **Windows:** git runs with `core.autocrlf=true` (index LF, some working files CRLF — normalise `\r\n` in scripted patches); in Git Bash prefix node commands that take `/path/` arguments with `MSYS_NO_PATHCONV=1`; never use bare `git stash` (shared across worktrees).
- **Worktree dependencies:** a worktree's `node_modules` can lag behind `package.json`; run `npm install` there.
- **CI npm version:** the deploy runs Node 22 with npm 10.9, which ignores nested `overrides` that npm 11 honours. Keep overrides top-level. After any dependency change run `npx -y npm@10.9.9 ci --ignore-scripts` in a clean copy and `npm audit --audit-level=moderate` — a lockfile npm 10 rejects blocks the release.
- **Supabase** (`izekwngqjllaqibrwotp`) has been unreachable since 2026-10-06: `/api/services` returns 500, the admin page and legacy booking widget don't work; the contact form and `/api/track` don't depend on it.
- **Dashboards need a human:** Cloudflare, Meta, Resend, Treatwell, Search Console, GA4 — write the exact steps for the user.
