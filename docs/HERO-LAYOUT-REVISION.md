# Homepage Hero — Two-Image Layout Revision

**Date:** 2026-04-20
**Scope:** Homepage (`/`) only — landing pages untouched.

## What changed

The homepage hero was restructured from a vertical "content on top + full-width scrolling image below" arrangement into a **two-column editorial layout** with two overlapping images on the right.

### Before

- Single `<header class="hero-editorial">` with all content absolutely positioned at top-left.
- Full-width `.hero-media-container` at the bottom that expanded to fullscreen on scroll via GSAP.
- Small floating accent image (`.hero-floating-image`) overlapping the bottom image at the lower-right corner.
- One CTA: "Jetzt Termin buchen".

### After

- Grid 2-column layout on desktop (`grid-template-columns: 1fr 1fr`, gap 4rem).
- **Left column** (`.hero-content`): eyebrow, display headline, body, and **two CTAs**.
  - Primary: `Jetzt Termin buchen` → `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
  - Secondary: `Behandlungen entdecken` → `/behandlungen/` (uses new `.pill-btn-ghost` variant — transparent with ink border).
- **Right column** (`.hero-media`, 1:1 aspect, max-width 640px):
  - `.hero-media-main` — tall 3:4 portrait image (62% width) anchored to the left and offset down 8%.
  - `.hero-media-overlap` — 1:1 square image (48% width) anchored to the top-right, overlapping the portrait. `z-index: 2` + 3px paper-coloured border for lift.
- Mobile (≤900px): collapses to a single column, media stacks above content with `order: -1`, max-width 520px.

## Files touched

| File | Change |
|------|--------|
| [src/pages/index.astro](../src/pages/index.astro) | Wrapped content in `.hero-content`, replaced old `.hero-media-container` + `.hero-floating-image` with new `.hero-media` → `.hero-media-main` + `.hero-media-overlap` structure. Added secondary CTA. |
| [src/styles/components.css](../src/styles/components.css) | Replaced absolute-positioned hero rules with grid layout + overlapping-image CSS. Added `.pill-btn-ghost`. Simplified mobile breakpoint. |
| [src/layouts/Base.astro](../src/layouts/Base.astro) | **Removed** the GSAP `scrollTrigger` on `#hero-media` (the old "expand to fullscreen on scroll" effect — incompatible with the new static 2-col media container). Float fade-in on `#hero-float-1` kept (still targets `.hero-media-overlap` via the preserved id). |

## Assets

Same two images as before — they already fit the new layout:

- `/public/assets/hero_center.png` — treatment room with Teresa + client (main portrait).
- `/public/assets/hero_right.png` — close-up portrait (overlap square).

No new assets required.

## Verification

- `npm run build` → 26 pages built without errors/warnings related to the hero.
- Desktop (1280×800, 1440×900): computed `grid-template-columns` = equal 2-col; media column rect positioned at right half; both images load with correct rects.
- Mobile (375×812): media stacks above content, overlap positioning stays within bounds (`max-width: 520px`).
- No console errors on the homepage.

## Rollback

If the new layout needs to be reverted:

```bash
git revert <commit-sha-of-this-change>
```

The old full-width + floating-image hero is fully reproducible from that revert — no assets or data were removed.
