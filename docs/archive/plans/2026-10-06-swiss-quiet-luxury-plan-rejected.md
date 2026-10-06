# Luxury Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Swiss Quiet Luxury" redesign defined in `docs/superpowers/specs/2026-10-06-luxury-redesign-design.md` across all 36 pages without changing URLs, SEO metadata, tracking or booking behaviour.

**Architecture:** Phase 1 rebuilds the shared design system (tokens, fonts, global component CSS, Nav, Footer, consent, BookingCta) and the homepage; legacy class names are re-pointed so every page restyles immediately. Phase 2 runs three page-group agents in parallel, each in its own worktree branched from the Phase 1 commit, editing only the files it owns and keeping page-specific CSS in scoped `<style>` blocks. Phase 3 merges, verifies and documents.

**Tech Stack:** Astro 7 static build, Cloudflare Worker, GSAP, `@fontsource-variable/bodoni-moda`, `@fontsource-variable/instrument-sans`.

**Verification gate (run after every task, from the worktree root):**

```bash
npm run check            # expect: 0 errors
npm audit --audit-level=moderate   # expect: found 0 vulnerabilities
npm run build            # expect: 36 page(s) built
for q in qa:carbon-lp qa:aquafacial-lp qa:aquafacial-combo-lp qa:docs qa:marketing; do npm run -s $q; done   # expect: 5 × [ok]
```

Visual check: `node <scratchpad>/shoot.mjs http://localhost:4321 <out> <paths…>` against `npm run dev`, at 1440 and 390.

---

## Phase 1 — Design system + homepage (owner: lead session)

### Task 1: Fonts and tokens
**Files:** Modify `src/styles/main.css`, `package.json`
- [ ] Replace Cormorant/Inter/JetBrains imports with `@fontsource-variable/bodoni-moda/opsz.css`, `…/opsz-italic.css`, `@fontsource-variable/instrument-sans/standard.css`; uninstall the three old font packages.
- [ ] Add the colour, type, space and shape tokens from the spec; re-point every legacy alias (`--bg-*`, `--text-*`, `--accent*`, `--gold*`, `--paper*`, `--ink*`, `--border-*`, `--font-*`, `--radius-*`, `--shadow-*`).
- [ ] Base typography: headings Bodoni 400 with optical sizing, `em` in headings = italic bronze; body Instrument Sans 400 17px/1.7; `.sub-display`/`.eyebrow` label style; remove grain overlay.
- [ ] Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-link`, dark-context inversions; legacy `.pill-btn*` mapped.
- [ ] Gate + commit `Introduce Swiss Quiet Luxury tokens and type`.

### Task 2: Global components
**Files:** Modify `src/styles/components.css`, `src/styles/blog.css`
- [ ] Radii → 0 (images, cards, CTA boxes), shadows removed; boxed cards (`.highlight-item`, `.benefit-card`, pricing cards, combination cards, booking CTA box) become hairline layouts; grids pick column counts without orphans.
- [ ] FAQ accordion, testimonials, trust strip, breadcrumbs, marquee, treatment hero, facts block restyled per spec.
- [ ] Gate + commit `Restyle shared components for the luxury system`.

### Task 3: Navigation, footer, consent, booking CTA copy
**Files:** Modify `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/MarketingConsent.astro`, `src/components/BookingCta.astro`, `src/components/ServiceHubPage.astro` (copy line only), `src/layouts/Base.astro` (nav/footer wiring only)
- [ ] Three-zone desktop nav with centred monogram; Journal label → `/blog/`; mobile overlay in display serif; keep all existing a11y (focus trap, `aria-expanded`, Escape) and `data-button-location` attributes.
- [ ] Footer per spec, keeps every link and the `data-bfl-consent-open` control.
- [ ] Booking CTA default text and hub CTA text rewritten without Treatwell/campaign jargon.
- [ ] Gate + commit `Rebuild navigation, footer and booking CTA`.

### Task 4: Homepage
**Files:** Modify `src/pages/index.astro`, `shared/site.ts` (add `RATING` constant only if absent)
- [ ] Compose sections 1–9 from the spec using existing images and facts; JSON-LD objects unchanged (FAQ order may change; text unchanged).
- [ ] Gate, screenshots at 1440/390, commit `Recompose homepage`.

## Phase 2 — Page groups (parallel agents, one worktree each, branched from the Task 4 commit)

Rules for every agent: edit only owned files; page-specific CSS goes in the page's scoped `<style>`; do not edit `main.css`, `components.css`, `Nav.astro`, `Footer.astro`, `Base.astro`, `LandingPage.astro` unless owned; keep every `data-*` tracking attribute, form `name`, href and JSON-LD; run the gate; commit on the agent's branch.

### Task 5 (Agent A): Treatments
**Owns:** `src/pages/behandlungen/**`, `src/components/ServiceHubPage.astro`, `src/components/TreatmentActionBar.astro`, `src/components/TreatmentLinkCard.astro`, `src/components/AiSummary.astro`, `src/components/Breadcrumbs.astro`
- [ ] Five bespoke treatment pages, six hubs (via `ServiceHubPage`), `/behandlungen/` and `/behandlungen/vergleich/` per spec; Aquafacial hero says "Aquafacial"; "Suchintention" paragraph rewritten; duplicate FAQ (Aquafacial price question asked twice) merged in markup **and** JSON-LD consistently.

### Task 6 (Agent B): Content and service pages
**Owns:** `src/pages/ueber-mich/**`, `src/pages/blog/**`, `src/layouts/BlogPost.astro`, `src/styles/blog.css`, `src/pages/haeufige-fragen/**`, `src/pages/kontakt/**`, `src/pages/termin/**`, `src/pages/impressum/**`, `src/pages/datenschutz/**`, `src/pages/404.astro`, `src/pages/buchung-bestaetigt/**`
- [ ] About with portrait above the fold; blog index + article layout; FAQ hub; Kontakt (all form behaviour intact); Termin/Bestätigt copy without jargon; legal pages and 404 on the system.

### Task 7 (Agent C): Landing pages
**Owns:** `src/pages/lp/**`, `src/layouts/LandingPage.astro`, `src/components/lp/**`, `scripts/check-*-lp-offer.mjs`, `scripts/check-marketing-ads.mjs`, LP docs in `docs/current/AQUAFACIAL-*.md`
- [ ] All five LPs rebuilt in the new language with the same section order, forms, tracking and QA contracts; Aquafacial LP gets the audit hero/CTA changes from the spec; QA scripts updated only where approved copy changed.

## Phase 3 — Integrate and verify (owner: lead session)

### Task 8: Merge and polish
- [ ] Merge A, B, C into `codex/luxury-redesign`; resolve conflicts; full gate.
- [ ] Screenshot every page type at 1440/390; fix overflow, orphans, contrast.
- [ ] Lighthouse mobile on `/` and `/lp/aquafacial/` (performance ≥ current, accessibility ≥ 96).

### Task 9: Docs and hand-off
- [ ] Update `docs/current/DESIGN-SYSTEM.md`, `STATUS.md`, `TODO.md`.
- [ ] Update the review artifact with before/after.
- [ ] Remove the three agent worktrees after merge.
