# Beauty Face Lift — Design System ("Atelier Glow")

> Last updated: 7 October 2026
> Source of truth for tokens: `src/styles/main.css` · Shared patterns: `src/styles/components.css`
> Reference pages: `src/pages/index.astro` (homepage) and `src/pages/behandlungen/index.astro` (treatments overview)

The October 2026 "Swiss Quiet Luxury" direction (Bodoni Moda, square corners, espresso buttons) was rejected by the client and replaced by Atelier Glow. Do not reintroduce it.

## 1. Principles and client rules

Beauty Face Lift is a premium cosmetic studio at Bahnhofstrasse 94, Zürich, built around one person: Teresa Stimac. The site should feel like a modern beauty house: warm, calm, photographic and precise.

These rules come straight from client feedback and are not optional:

1. **No overlines.** No eyebrow labels, dots or pills above headings. The `.eyebrow` class remains only for information-bearing labels on the Meta ad landing pages (client-requested, covered by the LP QA scripts) and for article categories.
2. **No italics anywhere.** No italic font face is loaded and `font-synthesis-style: none` stops faux italics. Never write `font-style: italic`.
3. **Less text.** A hero has the H1, one short lead sentence and the CTAs. Each section has an H2, at most one short lead, then the content. Facts asides and "Auf einen Blick" boxes are out.
4. **Hairlines and image cards, not boxes.** Avoid boxes inside boxes. Separate content with space and 1px rules.
5. **Clean names in the UI.** Link labels say "Waxing", not "Waxing Zürich". Keywords belong in the title, meta description, H1 and copy.
6. **Important links are buttons.** Use `btn btn-secondary btn-arrow` for section links such as "Übersicht aller Behandlungen". Use primary `btn btn-arrow` for booking.
7. **No image captions**, except review attributions.
8. **The blog is called "Wissen"** in the UI. Its URL stays `/blog/`.

Copy is written in Swiss German ("ss", never "ß"). The main site uses "Sie"; the ad landing pages use "du". Never invent prices, results, reviews or claims. Cosmetic claims stay cautious ("kann … unterstützen").

## 2. Colour

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--cream` | `#FAF6F1` | Page background | — |
| `--paper` | `#FFFCF9` | Raised surfaces, cards, inputs, nav | — |
| `--shell` | `#F3EAE1` | Alternate section band | — |
| `--blush` | `#EAD9CC` | Image placeholders, arches | — |
| `--clay` | `#8F5A2E` | Copper accent, primary buttons, H1 accent word | 5.32:1 on cream · white on clay 5.72:1 |
| `--clay-dark` | `#6F4421` | Button hover | — |
| `--clay-light` | `#D7AE84` | Accent on cocoa | 7.92:1 on cocoa |
| `--cocoa` | `#2A1E18` | Headings, dark bands, footer | 15.04:1 on cream |
| `--text` | `#4A3B33` | Body text | 9.93:1 on cream |
| `--muted` | `#76655A` | Secondary text, meta, column titles | 5.16:1 cream · 4.67:1 shell |
| `--on-dark` | `#E9DCCF` | Body text on cocoa | 12.03:1 on cocoa |
| `--gold` | `#B98F47` | Review stars only | decorative |
| `--line` / `--line-strong` | `rgba(43,31,25,.10/.18)` | Hairlines | decorative |

Legacy aliases (`--porcelain`, `--espresso`, `--bronze`, `--bg-*`, `--text-*`, `--accent*` and others) still point at these tokens so older markup renders correctly. New code uses the tokens above.

## 3. Typography

- **Display:** Instrument Serif 400, always upright. Used for H1/H2, large card titles, menu links and numerals.
- **Text / UI:** Instrument Sans Variable for body, H3/H4, labels and buttons. Sentence case only, with no uppercase tracking.
- **Accent word:** one `<em>` per H1 renders in copper. Inside H2–H4 an `<em>` renders plain.

| Token | Value | Use |
|---|---|---|
| `--fs-h1` | `clamp(2.75rem, 5.4vw, 5rem)` | Page titles |
| `--fs-h2` | `clamp(2.25rem, 4vw, 3.75rem)` | Section titles |
| `--fs-h3` | `clamp(1.3rem, 1.7vw, 1.6rem)` | Card and list titles (sans) |
| `--fs-lead` | `clamp(1.1rem, 1.35vw, 1.25rem)` | Lead sentences |
| `--fs-body` | `1.0625rem` | Body |
| `--fs-small` / `--fs-label` | `0.9375rem` / `0.8125rem` | Meta, prices, column titles |

## 4. Space, shape, motion

- **Layout:** container 1280px. Gutter `clamp(16px, 4vw, 40px)`. Section padding `--section-y` `clamp(80px, 9vw, 140px)`.
- **Radii:** `--r-sm` 12px, `--r` 20px, `--r-lg` 28px, `--r-xl` 36px, `--r-pill` for buttons and the nav. `.arch` frames hero portraits.
- **Shadows:** `--shadow-sm` (nav at rest) and `--shadow` (nav scrolled, dropdown) only.
- **Motion:**
  - `--ease-expo`;
  - image hover zoom of 1.04;
  - arrow discs rotate 45°;
  - links get an underline that grows from the left.
  - The hero image entrance is transform-only (LCP-safe). `prefers-reduced-motion` is respected.

## 5. Components

- **Navigation** (`Nav.astro`): a floating 72px pill with logo, centred text links (Behandlungen ▾, Über mich, Wissen, Kontakt) and one CTA. The CTA sits with an equal 12px inset.
  - Hover and the current page are shown by a thin underline, never a pill background.
  - The treatments panel has two serif link columns, "Gesicht & Haut" and "Beauty & Wellness", built from `SERVICE_GROUPS`. It adds a consultation image card and an "Übersicht aller Behandlungen" row.
  - On mobile it becomes an unboxed serif list with hairlines.
- **Buttons:**
  - `.btn` is the copper pill and `.btn-secondary` the paper pill with a hairline.
  - `.btn-arrow` adds an arrow disc, `.btn-lg` is the large size, and `.btn-link` is text with a small disc for tertiary links.
- **Section head** (`.section-head`): the H2 (plus an optional lead) on the left and the section button on the right; the button sits below the heading on mobile.
- **Lists:**
  - Image cards are 4:5 with a serif title and an arrow disc.
  - Price rows are hairline rows with a serif name, a price chip and an arrow disc.
  - `.index-list` is for linked rows.
- **Footer** (`Footer.astro`): a rounded cocoa panel with the "Beauty Face Lift" wordmark and four columns (Studio, Kontakt, Behandlungen, Entdecken), plus a legal row with the cookie settings.

## 6. Data

`SERVICE_GROUPS` in `shared/site.ts` is the single source for the treatment groups. It holds the label, href, description, `priceFrom` and services. The nav, footer, homepage and `/behandlungen/` all render from it. `scripts/seo-plan-smoke.mjs` checks that the group labels and the SEO hub anchors stay in the right files.
