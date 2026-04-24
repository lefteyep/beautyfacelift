# Homepage Hero — Third Image Card

**Date:** 2026-04-24
**Scope:** Homepage (`/`) only — landing pages untouched.
**Supersedes details in:** [HERO-LAYOUT-REVISION.md](HERO-LAYOUT-REVISION.md) (two-card layout from 2026-04-20).

## What changed

Added a third image card to the hero `.hero-media` composition. The hero now shows three overlapping images instead of two, forming an editorial staircase composition:

- **Main** (`.hero-media-main`) — tall 3:4 portrait, 62% wide, anchored left, offset 8% from top.
- **Top-right overlap** (`.hero-media-overlap`) — 1:1 square, 48% wide, anchored top-right.
- **Bottom-right overlap** (`.hero-media-overlap-bottom`) — new. 1:1 square, 44% wide, anchored bottom-right. Shows Teresa performing a Carbon-Peeling treatment with an activated-charcoal mask — reinforcing the medical-aesthetic credibility of the studio.

## Composition on desktop (1280×800)

With `.hero-media` rendering at 530×530:

| Card | x | y | w | h |
|------|---|---|---|---|
| Main | 0 | 42 | 329 | 438 |
| Top-right | 274 | 58 | 258 | 258 |
| Bottom-right | 299 | 299 | 228 | 228 |

The top-right and bottom-right cards overlap vertically by ~17px, giving a layered feel. Both share the 3px paper-coloured border treatment and `--shadow-2` for lift.

## Files touched

| File | Change |
|------|--------|
| `src/assets/marketing/carbon_treatment_teresa.png` | New asset — Teresa with client during Carbon Peeling. |
| `src/lib/site-images.ts` | Added `carbonTreatmentTeresa` import/export. |
| `src/pages/index.astro` | Imported `carbonTreatmentTeresa`; added `<div class="hero-media-overlap-bottom" id="hero-float-2">` inside `.hero-media`. |
| `src/styles/components.css` | Added `.hero-media-overlap-bottom` + `.hero-media-overlap-bottom img` rules mirroring `.hero-media-overlap` but anchored `right:0; bottom:0;` at 44% width. |

## Mobile behaviour

The existing `@media (max-width: 900px)` rule on `.hero-media` (`max-width: 520px; margin: 0 auto`) applies to the new card too — it scales with the container. No separate mobile override needed: the bottom-right anchoring translates cleanly to smaller viewports.

## Accessibility

The new image has a descriptive German alt: _"Teresa Stimac bei einer Carbon Peeling Behandlung im Studio an der Bahnhofstrasse Zürich"_.

## Rollback

Revert the commit — four files, no migration or schema impact.
