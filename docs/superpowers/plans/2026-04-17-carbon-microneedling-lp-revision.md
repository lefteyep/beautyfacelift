# Carbon Microneedling LP — Design/Conversion/UX Revision Plan

> **Status:** Implemented 2026-04-17. Build verified (25 static pages). Awaiting live visual spot-check.

## Context

The Meta-campaign landing page at `astro-v2/src/pages/lp/carbon-microneedling/` was shipped 2026-04-17 as the dedicated destination for Teresa's Carbon Microneedling offer (CHF 160 statt CHF 220). The campaign is staged but not yet live — Meta Pixel ID / CAPI / domain cutover are still pending (per `meta_campaign.md`). This is the right moment to polish before ads spend.

**Problems observed (from the user and from code review):**

- **Desktop layout is undersized**: headlines feel small, content sits in narrow central columns (max-width 960/1100px) inside a 1440px viewport, yielding large empty gutters. The LP reinvents simpler "card grid" patterns instead of reusing the editorial 56–72px-type patterns the rest of the site already has (`.highlights-grid`, `.testimonial-card`, `.about-portrait`, `.faq-section`).
- **Mobile is sparse and slow to reach CTA**: the 900px-tall hero image orders to top and eats ~100svh before any CTA or offer is visible; typography doesn't scale down below 900px (no 600px LP-specific tuning); emoji icons render inconsistently across devices; the sticky WhatsApp button is the only floating CTA and doesn't mention price.
- **Conversion scaffolding is thin**: no in-hero trust strip (rating, review count, address, years of practice), no value-breakdown of what's in the CHF 160, no risk-reversal messaging, no mobile sticky offer bar. Testimonials are buried mid-page.
- **Emoji icons (💧✨🌿🧬🎯🚀)** undermine the premium/medical brand feel and render inconsistently across OS/browsers.

**Intended outcome:** a visually coherent, conversion-dense LP that matches the editorial craft of the rest of beautyfacelift.ch, works well on mobile first-scroll, and preserves the existing BookingWidget + Meta Pixel/CAPI tracking.

---

## Design Direction

**Keep the aesthetic.** The brand is already well-defined: warm stone background (`#EDEBE6`), gold accent (`#CFA65E`), Cormorant Garamond serif for display, Outfit sans for body. Don't change any of that. The problem is craft, not direction.

**Scale up, not out.** Use the type scale the rest of the site already uses: hero title via `.display-text` (up to 72px), section titles via `clamp(2.5rem, 5vw, 56px)`, pull-quote via `clamp(28px, 3vw, 38px)`. Drop narrow `max-width` constraints on section grids so content fills the 58px-padded container.

**Reuse at the sub-component level only.** The existing global classes (`.highlight-item`, `.testimonial-card`, `.about-portrait`, `.about-quote`, `.faq-item`) are sound. Do not reuse their *section wrappers* (`.about-editorial`, `.faq-section`, `.testimonials-section`) — those carry their own paddings that would double-pad when nested inside `.container .lp-section`. Keep the existing `.lp-section` shell; pick inner patterns.

**Mobile-first offer visibility.** Cap hero image to 320px mobile, add a mobile-only sticky offer bar (price + "Jetzt buchen") layered above the sticky WhatsApp button.

**No fake scarcity.** Static "3 Plätze diese Woche" text on a premium medical-adjacent brand reads as theatre. Keep the soft "Einführungsangebot · nur für Neukundinnen" framing; do not invent live inventory.

**Preserve tracking & BookingWidget.** Keep the `#buchen` anchor, the `preselectedCategory="Carbon Microneedling"` prop on `<BookingWidget client:load />`, and the `window.__bflTrackLead` hook. Any regression here silently breaks Meta CAPI lead events.

---

## Phases

The plan is split into three executable phases so the user can ship incrementally. **Phase 1 alone resolves the reported layout issues.** Phase 2 adds conversion scaffolding. Phase 3 is brand polish.

### Phase 1 — Must-ship layout & craft (low risk, high visual impact)

1. **Hero title scale**: replace `.lp-title` custom size with `class="display-text"` (already globally defined at `clamp(2.5rem, 5.5vw, 72px)`). Remove the scoped `.lp-title` rules. Keep the `<br><em>` line break and italic treatment. File: `astro-v2/src/pages/lp/carbon-microneedling/index.astro:108`.

2. **Section title scale**: bump `.lp-section-title` from `clamp(2rem, 4.5vw, 3rem)` to `clamp(2.5rem, 5vw, 56px)` to match site norm (`.services-sticky h2`). File: `index.astro:344`.

3. **Drop narrow inner max-widths**: remove `max-width: 960px` from `.lp-problem-grid` and `max-width: 1100px` from `.lp-phases`, `.lp-benefits-grid`. Let these fill the 58px-padded container. Keep `max-width: 520px` on `.offer-box` (it's a focal element that wants concentration) and `780px` on `.faq-accordion` (long-form reading). File: `index.astro:357, 374, 398`.

4. **Hero grid balance**: change `grid-template-columns: 1.1fr 0.9fr` → `1fr 1fr`, and add `max-width: 560px` to `.lp-hero-content` so copy doesn't stretch uncomfortably wide at 1440+. Add a **third breakpoint at 1100px** to switch hero to single column earlier (currently the 900–1100px range is the awkward zone where `.offer-chip` wraps). File: `index.astro:305-310`, `index.astro:476-482`.

5. **Replace emoji icons with inline SVG**. Create `astro-v2/src/components/lp/BenefitIcon.astro` with 6 named icons (`droplet`, `sparkle`, `leaf`, `dna`, `target`, `arrow-up`) rendered as 28×28 inline SVG with `stroke: var(--accent); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round;` — a Feather/Lucide-style outline set. Update the `benefits` array in `index.astro:15-22` to use `name:` instead of `icon:` (emoji) and the `.lp-benefit-icon` render in `index.astro:192`. Matches the refined gold-accent aesthetic far better than emoji.

6. **Mobile hero image cap (highest-impact mobile fix)**. Add `@media (max-width: 600px) { .lp-hero-media img { max-height: 380px; object-fit: cover; object-position: center 20%; } }` — the rendered `720×900` image currently eats almost the full mobile viewport before the CTA is visible. `object-position: center 20%` keeps the face/product visible when cropped. File: `index.astro:330-336, 476-482`.

7. **Mobile type scale**. Add to the same 600px breakpoint: `.lp-section { padding: 8vh 0 4vh; } .lp-section-head { margin-bottom: 2rem; } .lp-subtitle { font-size: 1rem; }`. `.display-text` already has a `clamp(2.5rem, 14vw, 4rem)` override at 600px globally (`main.css:124` + `components.css:1464-1467`) — do not fight it, just confirm the hero uses `.display-text`.

8. **Fix offer-chip wrapping in hero**. In `OfferBox.astro:55-66`, add `max-width: 100%` and `row-gap: 0.35rem` to `.offer-chip`, and tighten `padding` on the inner `.offer-chip-prices` to prevent awkward mid-price wraps. File: `astro-v2/src/components/lp/OfferBox.astro:55-89`.

9. **Problem section hierarchy**. Restyle `.lp-problem-item` to feel editorial rather than boxy: remove the background and border, increase the serif `strong` to 1.5rem, add a thin gold top-border (`border-top: 1px solid var(--accent); padding-top: 1rem`), and widen the grid to 2-column on desktop (`repeat(2, 1fr)` with 2rem gap) so each entry reads as a proper pain-point, not a micro-card. File: `index.astro:353-367`.

10. **3-phase cards — larger numbers, connecting visual**. Scale `.lp-phase-no` from 2rem to 4.5rem (matches `.highlight-number` at 48px, a step bigger), change color to `rgba(207, 166, 94, 0.4)` for editorial ghost-number treatment. Keep centered layout. File: `index.astro:384-389`.

11. **Benefit cards — reuse hover-lift pattern**. Update `.lp-benefit` to match `.highlight-item`: `padding: 2rem 1.5rem`, add `transition: transform 0.5s var(--ease-expo), box-shadow 0.5s var(--ease-expo), border-color 0.3s ease`, and a `:hover` state with `transform: translateY(-4px); box-shadow: var(--shadow-medium); border-color: var(--border-medium);`. File: `index.astro:401-409`.

### Phase 2 — Conversion lifters (medium risk, measurable impact)

12. **In-hero trust strip**. Add a horizontal row below `.lp-hero-ctas` containing: gold star row + `4.8` + `230+ Bewertungen` · `Bahnhofstrasse 94` · `20+ Jahre Erfahrung`. Use the existing `.trust-strip` design language (uppercase 11px, dot separators, muted color) but scoped to the hero so it fits visually. Create `astro-v2/src/components/lp/TrustStrip.astro` (props: `rating`, `reviewCount`, `address`, `years`) so it can also be reused in Phase 3 before the booking section.

13. **Mobile sticky offer bar**. Create `astro-v2/src/components/lp/StickyOfferBar.astro` — a bottom-fixed bar, only shown under 900px, layered above the sticky WhatsApp button:
    - Left side: `CHF 160.-` in serif 1.4rem, strikethrough `CHF 220` in muted 0.8rem above or beside it.
    - Right side: a gold `pill-btn` with text `Jetzt buchen` linking to `#buchen`.
    - `position: fixed; bottom: 0; left: 0; right: 0; z-index: 39` (below WhatsApp sticky at z-index 40). Adjust WhatsApp sticky `bottom` to `5rem` on mobile so both coexist.
    - Hide on desktop via `@media (min-width: 901px) { display: none }`.
    - Add `safe-area-inset-bottom` padding for iOS.
    - Include it once in `index.astro` near the existing `<WhatsAppButton variant="sticky">` call at `index.astro:288`.

14. **Value-breakdown block**. Insert a new section between Problem and 3-Phase — a short list of what's included in the 90-minute CHF 160 session:
    - Reinigung & Hautanalyse
    - Carbon-Aktivkohle-Peeling
    - Microneedling mit medizinischem Pen
    - Hyaluron- & Vitamin-Infusion
    - Beruhigende Abschlussmaske
    - Persönliche After-Care-Beratung

    Layout: 2-column on desktop (3 items each), single column on mobile. Use `✓` gold checkmark bullets matching `.lp-about-list li::before`. Heading: `Was im Preis enthalten ist`. Adds transparency and anchors the CHF 160 against perceived value. File: insert between `index.astro:151` and `:153`.

15. **Risk-reversal trust strip before booking**. Directly above the `#buchen` section, add a `.trust-strip`-style row with four micro-promises: `Keine Ausfallzeit` · `Persönliche Betreuung` · `Transparente Preise` · `Unverbindliche Anfrage`. Reduces pre-submit friction. Can reuse the same `TrustStrip.astro` component with a `variant="promises"` mode, or be a one-off inline. File: insert before `index.astro:264`.

16. **Testimonials — prepare for 5, ship 3**. Keep the 3 existing real quotes live (Laura M., Sandra B., Marina K.). Add 2 commented placeholder slots in the `testimonials` array in `index.astro:24-40` with clear TODO markers (`// TODO: real testimonial — Teresa to supply name, quote, location`) — do not render fabricated content. Update `TestimonialStrip.astro` to use `repeat(auto-fit, minmax(260px, 1fr))` so 3 cards flow cleanly now and 5 will flow 3-2 on wide desktops after Teresa supplies the two missing quotes. File: `index.astro:24`, `TestimonialStrip.astro:66-70`.

17. **Offer box "Einführungsangebot" line** (soft-urgency, not fake scarcity). Replace the current `urgency="Nur für kurze Zeit · begrenzte Plätze · ausschliesslich für Neukundinnen"` (reads as theatre) with `urgency="Einführungspreis · nur für Neukundinnen"`. Keeps legitimacy; drops the invented scarcity. File: `index.astro:207`.

### Phase 3 — Brand polish & optional additions

18. **Final CTA section as full-bleed dark block**. Wrap the existing `.lp-final` content in a dark container (`background: var(--bg-dark); color: var(--text-inverse); border-radius: var(--radius-card) var(--radius-card) 0 0; padding: 8vh 58px 12vh`). Mirrors the site's `.footer-editorial` pattern. Override child text colors to inverse. File: `index.astro:275-286, 459-474`.

19. **Section dividers**. Between major sections (after hero, after phases, after benefits, after testimonials), add a centered decorative rule: `<div class="deco-line" style="margin: 0 auto;"></div>` — the class already exists in `main.css:298-304` (48px gold line). Subtle, editorial, costs nothing.

20. **FAQ accordion visual polish**. Upgrade `FAQAccordion.astro` to use the site-standard `.faq-item` treatment: 30px summary padding, bordered circular +/- icon, serif 24px summary headings. The current implementation uses 1.1rem summaries and a plain `+` icon — noticeably less refined than `/behandlungen/*` pages. File: `astro-v2/src/components/lp/FAQAccordion.astro:26-70`.

21. **Teresa portrait section — use `.about-portrait` pattern**. Upgrade the image from current auto-height to `height: 650px` (like `.about-portrait`), add hover `transform: scale(1.03)`. If the current aspect ratio (600×720) looks wrong at 650px height full-width, swap to `object-fit: cover; object-position: center top`. File: `index.astro:228-235, 429-435`.

22. **Add a pull-quote to Teresa section**. Replace or supplement the prose paragraph with a short italic pull-quote using the `.about-quote` pattern: `"Ich behandle jede Kundin wie eine Freundin. Diskretion, Präzision und ein Ergebnis, das du selbst siehst."` — surrounded by the existing prose. Massive trust-lift at low cost. File: `index.astro:240-244`.

23. **Scroll animations — deferred**. Per critique: GSAP is bundled site-wide but this LP currently ships zero animation JS; adding staggered reveals adds LCP-risk JS payload for marginal polish. **Skip unless explicitly requested.**

24. **Hero floating accent image — deferred**. The existing `.hero-floating-image` pattern is absolute-positioned for a different hero layout. Reworking it for this grid hero is redesign, not reuse. **Skip unless a second hero asset is available.**

---

## Files to Modify

**Edit:**
- `astro-v2/src/pages/lp/carbon-microneedling/index.astro` — markup, benefits data, scoped `<style>`
- `astro-v2/src/components/lp/OfferBox.astro` — chip wrap fix, urgency text tightening
- `astro-v2/src/components/lp/TestimonialStrip.astro` — minmax tweak for 5 cards
- `astro-v2/src/components/lp/FAQAccordion.astro` — upgrade to site-standard accordion styling (Phase 3)
- `astro-v2/src/components/lp/WhatsAppButton.astro` — raise mobile `bottom` above `StickyOfferBar`

**Create:**
- `astro-v2/src/components/lp/BenefitIcon.astro` — SVG icon component (6 named icons)
- `astro-v2/src/components/lp/TrustStrip.astro` — reusable rating/address/promises strip
- `astro-v2/src/components/lp/StickyOfferBar.astro` — mobile-only sticky bottom bar

**Do not touch:**
- `astro-v2/src/components/booking/**` — any regression breaks Meta CAPI lead tracking
- `astro-v2/src/lib/track.ts` — same reason
- `astro-v2/src/layouts/LandingPage.astro` — UTM/Pixel bootstrap is already correct
- The `structuredData` JSON-LD (schema is accurate)
- The `#buchen` anchor id

---

## Verification

### Local preview
```bash
cd astro-v2
npm run dev
# open http://localhost:4321/lp/carbon-microneedling/
```

### Desktop visual checks (1440×900 viewport)
- [ ] Hero title fills left half at ~72px, CTAs + trust strip sit below, image fills right half at matched height
- [ ] "Kennst du das?" section: two columns of editorial pain-points, not four narrow cards; content spans full container width
- [ ] 3 phases: numbers feel like editorial ghost-numerals (large, tinted gold), cards span the full 1326px content area
- [ ] "6 Gründe" benefits: SVG icons gold-stroked, cards hover-lift on mouseover, content spans full container
- [ ] Offer box still centered at 520px max-width (focal element), soft "Einführungspreis" urgency
- [ ] Testimonials flow 3-2 (or 5 across) not cramped
- [ ] Teresa section: portrait ~650px tall on desktop, pull-quote prominent
- [ ] FAQ: 24px serif summary, circular +/- icon
- [ ] Final CTA: dark full-bleed band with light type

### Mobile checks (iPhone 12/13 viewport, 390×844)
- [ ] Hero image capped at ~380px, CTAs visible in first scroll
- [ ] Sticky offer bar shows at bottom with price + "Jetzt buchen"
- [ ] WhatsApp sticky sits above the offer bar (both reachable, no overlap)
- [ ] Type scales down cleanly — section titles ~36–44px, body ~1rem
- [ ] All tap targets ≥ 44px high
- [ ] Safe-area bottom inset respected on iOS (no overlap with home indicator)
- [ ] Value-breakdown stacks single-column with ✓ bullets

### Regression / tracking sanity
- [x] `npm run build` succeeds and produces the 25-page static dist
- [ ] `#buchen` anchor still scrolls to BookingWidget from hero CTA
- [ ] BookingWidget auto-advances past treatment selection (`preselectedCategory="Carbon Microneedling"` still passed)
- [ ] `window.__bflTrackLead` still exposed on page — `trackPageView()` and `trackLead` wiring untouched
- [ ] WhatsApp deep-link contains the prefilled German message
- [ ] View-source: `noindex, nofollow` meta still present
- [ ] No console errors on load

### Real-device spot-check
- [ ] Test on a real iOS Safari and Android Chrome — emoji-replacement (SVG) should render identically; previously the 🧬 / 🚀 glyphs differed between Apple and Google emoji sets.

### Deployment
- Deploy via `git push` to master — `.github/workflows/deploy.yml` auto-runs `wrangler deploy`. Preview URL: `https://beautyfacelift.mediapaulo.workers.dev/lp/carbon-microneedling/`.

---

## Scope decisions (confirmed with user)

- **Full pass — all three phases.** Phase 1 (layout/craft) + Phase 2 (conversion scaffolding) + Phase 3 (brand polish) all shipped in this revision.
- **Testimonials**: keep 3 real ones live now; leave 2 clearly-marked `TODO` placeholder slots in the array for Teresa to fill in post-hoc. Grid is pre-tuned for 5.
- **Before/after imagery**: deferred. If Teresa later supplies signed client releases for treatment before/after photos, that's the single highest-impact addition for this vertical — worth a follow-up pass then.

---

## Post-implementation fixes (2026-04-17, same day)

After the initial phase 1–3 pass shipped, the user flagged three visual bugs via desktop screenshot and then a comprehensive mobile-spacing review via full-page mobile screenshot. Both rounds were fixed and verified with `npm run build` (25 static pages, no regressions).

### Round 1 — visual bug fixes

1. **"Pillow on pillow" offer chip** (`OfferBox.astro:55-120`) — the in-hero `variant="chip"` rendered a stone-colored outer pill wrapping a gold inner pill, creating nested marshmallows.
   - **Fix:** removed the outer container entirely. `.offer-chip` is now `background: transparent; border: none; padding: 0; border-radius: 0;` with `gap: 0.6rem 1.1rem` and `flex-wrap: wrap`. The gold badge stands alone; prices sit inline on a transparent background; urgency has its own tiny gold-dot separator via `::before`.
   - **Also:** prices strong bumped from 1.3rem to 1.65rem with `line-height: 1` for editorial crispness.

2. **Mismatched hero CTA widths** (`index.astro` — `.lp-hero-ctas` block) — "Jetzt Termin sichern" and "Via WhatsApp schreiben" rendered at different natural widths because `.pill-btn` is `inline-flex`.
   - **Fix:** added `.lp-hero-ctas > :global(.pill-btn) { flex: 1 1 200px; min-width: 0; justify-content: center; text-align: center; }` with `align-items: stretch` on the parent. Equal width on desktop, clean single-column stack on narrow mobile. The `:global()` escape is required because `.pill-btn` is an unscoped utility class from `main.css`.

3. **WhatsApp sticky button mobile rendering** (`WhatsAppButton.astro:sticky` variant) — at ≤900px the label was hidden but the `padding: 0.7rem 1rem` left a stretched pill, not a circle.
   - **Fix:** true `52×52` circle on mobile — `width: 52px; height: 52px; padding: 0; border-radius: 50%; justify-content: center; gap: 0;` with `.wa-sticky-label { display: none }`. Position lifted to `bottom: calc(5.5rem + env(safe-area-inset-bottom))` so it floats above the new sticky offer bar.

4. **Sticky offer bar breathing room** (`StickyOfferBar.astro`) — also refined while in the hero bug fixes: added a second sub-breakpoint at 420px (tightens padding, reduces price size to 1.3rem, reduces CTA to 10px 16px) for narrow Android phones.

### Round 2 — comprehensive mobile polish

The full-page mobile screenshot revealed inconsistent section padding, some oversized headings, tight list-item line-height, and most critically a sticky-offer-bar overlap with the BookingWidget submit button. Rewrote both the `@media (max-width: 900px)` and `@media (max-width: 600px)` blocks of the LP's scoped styles.

**Section rhythm (all at ≤900px):**
- `.lp-section { padding: 5rem 0 }` (was `6vh 0` — viewport units felt arbitrary on short phone screens)
- `.lp-section-head { margin-bottom: 2.5rem }` (tightens the title-to-content gap)
- `.lp-divider { padding: 1rem 0 }` added — the decorative gold rule between sections was floating in too much space
- `.lp-final-dark { padding: 8vh 24px calc(10vh + env(safe-area-inset-bottom)); margin-top: 3vh }` — the dark final CTA band gets proper safe-area bottom inset so the home-indicator doesn't clip it
- **Critical: `#buchen.lp-section { padding-bottom: calc(5rem + env(safe-area-inset-bottom)) }`** — without this the `StickyOfferBar` (fixed, z-index 39) was overlapping the BookingWidget submit button on phones, a silent conversion killer.

**At ≤600px (phone-specific):**
- Hero: `padding-top: 7vh; padding-bottom: 2vh` (was `9vh/4vh`); image capped `max-height: 420px` with `object-position: center 18%` so Teresa's face/product stays visible when cropped.
- Typography: `.lp-subtitle 1rem/1.55`, `.lp-section-title clamp(1.9rem, 8vw, 2.3rem)`, `.lp-section-lead 1rem` (previously relied on clamp mins that were still too big on 360px screens).
- Problem items: `strong 1.2rem`, `p 0.95rem` — tightened from the editorial 1.5rem desktop size.
- Included-list checkmarks: smaller circle (20×20), 10px tick, list items 0.98rem for comfortable mobile reading.
- Benefits grid: collapses to single column at ≤600px (was 2-col at 900px, kept 2-col in 600–900 range), card padding `1.75rem 1.5rem`, icon wrap 46×46.
- Phase cards: padding `1.75rem 1.5rem`, ghost number 3rem (was 4.5rem desktop), h3 1.35rem.
- About section: `max-height: 440px; max-width: 420px` on portrait, pull-quote 1.2rem, prose 1rem.
- Final CTA: stacks vertically on phone — `.lp-final-ctas { flex-direction: column; align-items: stretch; gap: 0.6rem }` with `.pill-btn { width: 100% }`. Title clamped `2rem, 9vw, 2.8rem`.

**Component-level mobile polish (done same pass):**
- `OfferBox.astro`: box variant ≤600px — `padding: 2rem 1.25rem; border-radius: 16px`, prices `.offer-old 1.2rem`, `.offer-new clamp(2.25rem, 13vw, 3rem)`, CTA `width: 100%`.
- `FAQAccordion.astro`: ≤600px — summary padding `20px 0`, h3 1.1rem/1.35, icon 30×30, body padding-bottom 20px/0.95rem.
- `TestimonialStrip.astro`: ≤600px — rating row `margin-bottom: 2rem; gap: 0.5rem`, `strong 1.25rem`, `span 0.9rem`, card padding-left `1.25rem`, blockquote 1.1rem.

**What was explicitly preserved:**
- `#buchen` anchor, `preselectedCategory="Carbon Microneedling"` on `<BookingWidget client:load />`, `window.__bflTrackLead`, `noindex, nofollow` meta, GSAP bundling, WhatsApp deep-link prefilled message, UTM persistence, structured data JSON-LD.
- 25 pages still build in ~3.2s. Zero console errors.

### Files touched in round 1 + round 2

- `src/components/lp/OfferBox.astro` — chip rebuild + box mobile block
- `src/components/lp/WhatsAppButton.astro` — mobile sticky → circle
- `src/components/lp/StickyOfferBar.astro` — 420px sub-breakpoint
- `src/components/lp/FAQAccordion.astro` — ≤600px block expansion
- `src/components/lp/TestimonialStrip.astro` — ≤600px block expansion
- `src/pages/lp/carbon-microneedling/index.astro` — `.lp-hero-offer`, `.lp-hero-ctas`, full rewrite of both ≤900px and ≤600px scoped blocks
