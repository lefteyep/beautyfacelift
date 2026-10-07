# Carbon Microneedling Landing Page — Hero + Pricing Refresh

**Date:** 2026-04-24
**Scope:** `/lp/carbon-microneedling/` only — other LPs (aquafacial, microneedling, peeling) untouched.
**Related:** [HERO-THIRD-CARD-2026-04-24.md](../design-notes/HERO-THIRD-CARD-2026-04-24.md) — parallel homepage hero update using the same Teresa Carbon image.

## What changed

1. **H1 typography swapped to Inter.** The LP title (`Endlich porenreine, straffe Haut`) now renders in Inter 500 to match the homepage `.hero-display` system. Accent word (`straffe Haut`) stays gold.
2. **Hero gains a second floating card.** The hero media swapped from a single microneedling image to the homepage-style two-card composition: main 3:4 portrait + top-right 1:1 overlap showing Teresa performing the Carbon treatment on a client (activated-charcoal mask).
3. **Price chip restructured.** The `variant="chip"` in `OfferBox.astro` changed from inline badge + inline prices to a stacked layout: the `27% RABATT` badge (now a solid gold chip with white text), then crossed-out UVP above the offer price. All chip typography switched from Cormorant serif to Inter; the offer price bumped to `clamp(2.2rem, 4vw, 2.75rem)` weight 700 for visual punch.
4. **Rating typography swapped to Inter.** `.trust-rating-num` in `TrustStrip.astro` moved from Cormorant serif to Inter 600 so the Google rating reads consistently with the rest of the LP.
5. **Bahnhofstrasse 94 removed from trust strip.** The rating variant of `TrustStrip.astro` no longer renders the address line (kept in the about section and final CTA footer where it belongs).

## Hero composition on desktop (1280×800)

With `.lp-hero-media` rendering at ~530×530:

| Card | w | h | Anchor |
|------|---|---|--------|
| Main (microneedling) | 329 | 438 | `left:0; top:8%` |
| Overlap (Teresa Carbon treatment) | 254 | 254 | `right:0; top:0` |

Both cards share `var(--shadow-2)` and `var(--radius-card)`. The overlap has a 3px paper-coloured border for separation. Hover lifts both cards on their own timing (main −4px, overlap −6px).

**Important:** The overlap `<Image>` uses `loading="eager"` (not `lazy`). A global rule in `src/styles/main.css` sets `img[loading="lazy"] { opacity: 0 }` and only restores opacity when a `.loaded` class or `[complete]` attribute is applied by the lazy-load script. Hero-visible images must therefore avoid `loading="lazy"` to stay visible on first paint.

## Price chip — before / after

Before: inline flex, `27% RABATT` as quiet gold text, `CHF 220` and `CHF 160` inline on one line, both Cormorant.

After:
```
[ 27% RABATT ]   ← gold solid chip, Inter 700, white text
 CHF 220         ← Inter 500, strikethrough, muted
 CHF 160         ← Inter 700, clamp(2.2, 4vw, 2.75) rem
```

Visually closer to Meta-ad offer chips and reads stronger on mobile (prices no longer compete for horizontal space with a 27% badge on the same line).

## Files touched

| File | Change |
|------|--------|
| `src/pages/lp/carbon-microneedling/index.astro` | H1 font swap to Inter; `.lp-hero-media` two-card composition; overlap `<Image>` loads eagerly. |
| `src/components/lp/OfferBox.astro` | `variant="chip"` CSS rewritten — column flex, solid gold badge, Inter typography, larger offer price. |
| `src/components/lp/TrustStrip.astro` | `variant="rating"` no longer renders `address`; `.trust-rating-num` swapped to Inter 600. |

## Scope notes

- `TrustStrip.astro` is shared with other LPs — the address `<span>` was unconditionally rendered in the `rating` variant. Removing it means `/lp/aquafacial/`, `/lp/microneedling/`, `/lp/peeling/` also lose the address line from their rating strip. This is consistent with best practice (the address appears at the bottom of every LP and in the final CTA); if any LP wants the address back, pass `address={null}` and add a conditional, or revive the span with a new variant.
- `OfferBox.astro`'s `variant="box"` (the offer block lower on the page) is **unchanged** — only the chip variant was restructured.

## Verified

Dev preview at `http://localhost:4321/lp/carbon-microneedling/`:
- Overlap image: `opacity: 1`, `loading="eager"`, natural 307×307 rendered at 254×254.
- Chip badge: `background: rgb(185, 143, 71)` (gold), `color: rgb(255, 255, 255)`, Inter.
- Chip strong: Inter 700 @ 44px.
- Rating num: Inter 600.
- Trust strip text: `★★★★★ 4.8 · 230+ Bewertungen · 20+ Jahre Erfahrung` (no address).
- No console errors.
