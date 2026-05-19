# Sitewide Layout System — Full-Bleed 1920 + Content Cap 1240

**Date:** 2026-04-20
**Scope:** Every page — homepage, treatments, blog, FAQ, termin, LPs, admin (inherits from Base).

## What changed

Introduced a dual container system inspired by Relume-style marketing layouts: **full-viewport-width sections with horizontal padding that keeps the content column capped at 1240px and centred**, with a **58px minimum gutter on narrow screens**.

This replaces the previous pattern of `max(58px, calc((100% - 1240px) / 2))` (which relied on `%` resolving against the nearest containing block) with a viewport-based formula that resolves on first paint — eliminating the layout jump users previously saw when full-width sections snapped from 100% to 1240px after hydration.

### The one token that drives it all

```css
:root {
  --content-px: max(58px, calc(50vw - 620px));
}
```

- On viewports ≥ 2480px wide: padding matches `(vw - 1240) / 2` → content sits in 1240px at dead centre.
- On viewports 1240–2480px: same formula, naturally shrinks the gutter.
- On viewports < 2480px but still wide: still uses 50vw - 620px.
- On viewports where `50vw - 620px < 58px` (i.e. ≤ 1356px): **floors to 58px** so mobile and tablet keep a sensible minimum gutter.
- On mobile (≤ 900px): overridden to 24px in the media queries.

## Why `vw` (not `%`)

The old formula `calc((100% - 1240px) / 2)` needed the browser to resolve `100%` against the element's containing block before it could compute the padding. On first paint — especially in dev mode where CSS is JS-injected — the containing block wasn't yet laid out, so the browser painted the section edge-to-edge, then reflowed when it resolved the percentage. Users saw full-bleed sections **snap inward** on every reload.

`vw` is resolved against the viewport, which is known before any layout pass. Padding is stable on the very first paint.

## Critical CSS inlined

Even with `vw`, Vite in dev mode injects `<style>` tags via JS after HTML parse, producing a brief FOUC. To eliminate that, the core layout primitives are **inlined in `<head>` in `src/layouts/Base.astro`** so they apply synchronously during HTML parse:

```html
<style>
  :root { --content-px: max(58px, calc(50vw - 620px)); }
  body { margin: 0; position: relative; overflow-x: hidden; }
  .nav-minimal { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
                 display: flex; justify-content: space-between; align-items: center;
                 padding: 28px var(--content-px); pointer-events: none; }
  .nav-minimal > * { pointer-events: auto; }
  .hero-editorial { max-width: 1240px; margin: 0 auto; padding: 12vh 58px 8vh; }
  .services-section, .about-editorial, .testimonials-section, .faq-section,
  .rating-line, .trust-strip, .footer-editorial, .treatment-hero {
    padding-left: var(--content-px); padding-right: var(--content-px);
  }
  .marquee-container { padding: 32px 0; overflow: hidden; }
  @media (max-width: 900px) {
    .nav-minimal { padding: 16px 24px; }
    .hero-editorial { padding: 80px 24px 48px; }
    .services-section, .about-editorial, .testimonials-section,
    .faq-section, .rating-line, .trust-strip,
    .footer-editorial, .treatment-hero { padding-left: 24px; padding-right: 24px; }
  }
</style>
```

## Nav: full-viewport with stable padding

`.nav-minimal` is now `position: fixed` with `left: 0; right: 0` (no more `max-width: 1920px` + transform centering) and uses `var(--content-px)` for horizontal padding — so the logo and menu sit exactly where section content does.

The transition rule was narrowed from `transition: padding 0.5s` to only animate `padding-top`, `padding-bottom`, `background`, and `backdrop-filter`. Previously the horizontal padding animated from 0 to its final value on page load, producing a visible "contract" effect.

## `.full-bleed` helper

For sections that intentionally span full viewport width from inside a capped container:

```css
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}
```

## Files touched

| File | Change |
|------|--------|
| [src/styles/main.css](../../../src/styles/main.css) | Added `--content-px` token. Removed `body { max-width: 1920px }` (was clipping content on ultra-wide). Updated `.full-bleed` to use viewport-based formula. Removed default `transform: translateY(110%)` on `.text-reveal` (was leaving text stuck hidden when GSAP ticker stalled). |
| [src/styles/components.css](../../../src/styles/components.css) | 9 section rules switched from `max(58px, calc((100% - 1240px) / 2))` to `var(--content-px)`: `.services-section`, `.treatment-hero`, `.about-editorial`, `.testimonials-section`, `.rating-line`, `.trust-strip`, `.footer-editorial`, `.faq-section`. Nav transition narrowed. |
| [src/layouts/Base.astro](../../../src/layouts/Base.astro) | Inlined critical layout CSS in `<head>`. Replaced hero "slide-up reveal" GSAP with a simple fade-in using `.from()` + `immediateRender: false` (so text stays visible if ticker stalls). |
| [src/pages/index.astro](../../../src/pages/index.astro) | Removed the obsolete `container` wrapper from `.about-editorial`. **Merged the two display-line divs into a single `<h1 class="hero-display">`** so the visible headline is the actual H1 element (was previously `sr-only`). |
| [src/pages/termin/index.astro](../../../src/pages/termin/index.astro) | Replaced `padding: 0 200px 80px` with `padding: 0 var(--content-px) 80px`. |
| 6 treatment pages | Removed hardcoded inline `padding: 80px 320px` on FAQ sections; they inherit `var(--content-px)` from `.faq-section`. |

## Homepage hero: typography refinement

After the layout refactor, the homepage H1 was changed to meet the client's preference:

- **Single element**: the two decorative divs (`.hero-display-beauty` + `.hero-display-facelift` with the gold `.accent-word` on line 2) were merged into one `<h1 class="hero-display">`. The previous `sr-only` H1 was removed since the visible H1 now carries the SEO weight.
- **All-black, no gold**: the gold accent on "natürlicher Schönheit" was dropped.
- **Sans-serif (Inter)**: the global `h1` rule defaults to Cormorant Garamond via `var(--font-serif)`, so `.hero-display` explicitly sets `font-family: var(--font-sans)` to keep the Inter sans-serif look the design called for.
- **Weight 500**: replaces the previous mix of unset (`beauty`) + 300 (`facelift`).

Animation changed from a masked slide-up ("text lives below an `overflow: hidden` wrapper, translates to y=0") to a plain fade-in. The slide-up pattern was clipping descenders (`g`, `p`, `y`) at rest because the wrapper kept its `overflow: hidden` after the animation completed. The new fade-in needs no mask, so descenders are never clipped.

## Testing notes

- Dev preview runs in a headless/hidden context where `document.visibilityState === 'hidden'`. That stops `requestAnimationFrame`, which stops GSAP's ticker, which leaves `.from()` tweens stuck at their initial state. Using `immediateRender: false` ensures the element stays at its natural CSS state until the tween actually plays — so the page looks correct in the preview even when animations can't run.
- Production build (`npm run build`) generates 26 static pages cleanly. All pages share the same `--content-px` token via the inlined critical CSS, so the layout is consistent everywhere.

## Follow-up: sitewide container cleanup (2026-04-20)

After the layout refactor above, the homepage was migrated correctly but **15 `.about-editorial` sections and 1 `.faq-section` across 7 other pages still carried a leftover `.container` class** from the pre-refactor era. `.container` defines `max-width: 1240px; padding: 0 58px;` — at equal specificity, it came later in source order than `.about-editorial`, so its 58px horizontal padding beat `var(--content-px)` _and_ its `max-width: 1240px` shrank the outer element. Net effect on wide viewports: content sat in a 1124px (= 1240 − 2×58) left-of-centre column instead of the intended 1240px-capped-but-centred cap.

Removed the `container` token from every one of those sections:

| Page | Sections |
|------|----------|
| `ueber-uns/` | 3 (`.about-editorial pad-y`) |
| `behandlungen/hydrafacial-zuerich/` | 2 |
| `behandlungen/microneedling-zuerich/` | 4 |
| `behandlungen/fruchtsaeure-peeling-zuerich/` | 3 |
| `behandlungen/coldplasma-zuerich/` | 2 |
| `behandlungen/vergleich/` | 1 |
| `haeufige-fragen/` | 1 (`.faq-section pad-y`) |

Verification at 1920×1080: computed `padding-left` on every fixed section is now **340px** (= `max(58, 50vw − 620)` = `max(58, 340)` = 340), with `max-width: none`. Previously 58px. Grep for `(about-editorial|faq-section).*\bcontainer\b` across `src/pages` now returns 0 matches.

## Follow-up: Behandlungen nav dropdown (2026-04-20)

Added a CSS-driven dropdown under the "Behandlungen" nav item listing the 4 treatment pages (Hydrafacial, Microneedling, Fruchtsäure Peeling, ColdPlasma). The top-level link continues to navigate to `/behandlungen/` on click; hover or focus reveals the submenu. Keyboard: ArrowDown/Enter/Space on the trigger opens the menu and focuses the first item; Escape closes and restores focus.

On mobile (≤ 900px), the absolute-positioned submenu is hidden and replaced by 4 flat indented sub-items inside the hamburger overlay — always visible, no extra tap. The sub-items are scoped under `.nav-mobile-links .nav-mobile-sub a` to beat the existing `.nav-mobile-links a` rule that zeroes horizontal padding, and the stagger-in animation (`:nth-child(n)` with 0.06s-stepped delays) was extended from 5 items to 9 to account for the new insertions.
