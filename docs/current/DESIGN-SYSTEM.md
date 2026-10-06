# Beauty Face Lift — Design System ("Swiss Quiet Luxury")

> Last updated: 6 October 2026 · Spec: [`docs/superpowers/specs/2026-10-06-luxury-redesign-design.md`](../superpowers/specs/2026-10-06-luxury-redesign-design.md)
> Source of truth for tokens: `src/styles/main.css` · Shared patterns: `src/styles/components.css`

## 1. Principles

Beauty Face Lift is a premium cosmetic studio at Bahnhofstrasse 94, Zürich, built around one person: Teresa Stimac. The interface should feel like a Swiss luxury house, not a salon template.

1. **Restraint carries luxury.** Typography, whitespace and real photography do the work; ornament does not.
2. **Hairlines, not boxes.** Content is separated by 1px rules and space. No rounded cards, no shadows, no gradients.
3. **Gold is detail, never fill.** Bronze marks eyebrows, italic accent words, numerals and hover states. Actions are espresso.
4. **Structure must mean something.** Numerals only for real sequences; grids never leave orphans.
5. **Write for the client.** No SEO, tracking or agency language in visible copy. German typographic quotes „…“. Main site in "Sie", ad landing pages in "du".

## 2. Colour

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--porcelain` | `#F7F4EF` | Page background | — |
| `--ivory` | `#FBF9F5` | Raised surfaces, alternate band, inputs | — |
| `--sand` | `#ECE4D8` | Alternate section band, booking CTA | — |
| `--stone` | `#CFC4B4` | Strong rules, image placeholders | — |
| `--espresso` | `#171411` | Headings, primary buttons, dark bands, footer | 16.7:1 on porcelain |
| `--umber` | `#3A332C` | Body text | 11.3:1 on porcelain |
| `--taupe` | `#6B6258` | Muted text, captions, labels | 5.45:1 porcelain · 4.74:1 sand |
| `--bronze` | `#7A5C34` | Accent text, eyebrows, italic accents | 5.62:1 porcelain · 4.89:1 sand |
| `--bronze-light` | `#C2A475` | Accent on espresso | 7.7:1 on espresso |
| `--champagne` | `#D9C6A5` | Body text on espresso | 11:1 on espresso |
| `--rule` / `--rule-strong` | `rgba(23,20,17,.12/.24)` | Hairlines | decorative |
| `--rule-light` / `--rule-light-strong` | `rgba(247,244,239,.16/.32)` | Hairlines on espresso | decorative |

Legacy aliases (`--bg-*`, `--text-*`, `--accent*`, `--gold*`, `--paper*`, `--ink*`, `--border-*`, `--font-*`, `--radius-*`, `--shadow-*`) still exist and point at these tokens so older markup renders on the new system. New code uses the tokens above.

## 3. Typography

- **Display:** Bodoni Moda Variable (`@fontsource-variable/bodoni-moda`, optical sizes 6–96, roman + italic). Weight 400. Its high contrast echoes the gold BFL monogram. Italic is used for one accent word per heading (`<em>` → bronze).
- **Text / UI:** Instrument Sans Variable (`@fontsource-variable/instrument-sans`). Body 400; labels and buttons 600 uppercase with 0.16–0.18em tracking.

| Token | Value | Use |
|---|---|---|
| `--fs-display` | clamp(3rem, 7vw, 6.25rem) | Homepage masthead, treatment H1 |
| `--fs-h1` | clamp(2.6rem, 5.2vw, 4.75rem) | Page H1 |
| `--fs-h2` | clamp(2rem, 3.6vw, 3.25rem) | Section titles |
| `--fs-h3` | clamp(1.4rem, 1.9vw, 1.75rem) | List titles |
| `--fs-h4` | clamp(1.15rem, 1.3vw, 1.3rem) | Small headings, price names |
| `--fs-lead` | clamp(1.125rem, 1.4vw, 1.3rem) | Intro paragraphs |
| `--fs-body` | 1.0625rem / 1.7 | Running text (max 66ch) |
| `--fs-small` | 0.9rem | Captions, meta |
| `--fs-label` | 0.75rem, 600, uppercase | Eyebrows, buttons, nav |

## 4. Space, shape, motion

- Container `--container: 1320px` + `--gutter: clamp(20px, 5vw, 72px)`; full-width sections align with `--content-px`.
- Section rhythm `--section-y: clamp(88px, 11vw, 168px)`, tight `--section-y-tight`.
- Corners: 0 everywhere; 2px only on form inputs. Shadows: only `--shadow-float` for the nav dropdown and consent banner.
- Motion: hero entrance is CSS-only (`.reveal-up` with `--d` delay, `.reveal-media`); GSAP adds gentle scroll reveals (≤24px) and parallax (≤4%). All motion respects `prefers-reduced-motion`.

## 5. Components and patterns

| Pattern | Class(es) | Notes |
|---|---|---|
| Buttons | `.btn` (primary), `.btn-secondary`, `.btn-link`, `.btn-sm`, `.btn-lg`, `.btn-row` | Inverts automatically inside `.on-dark`, `.section--dark`, `.cta-band`, footer. Legacy `.pill-btn*` map onto these. |
| Eyebrow | `.eyebrow` (+ `.eyebrow--rule`), legacy `.sub-display` | Bronze label type. |
| Sections | `.section`, `--tight`, `--sand`, `--ivory`, `--dark`, `--rule` | Vertical rhythm and bands. |
| Page hero | `.page-hero`, `.page-hero--split`, `.page-hero-copy` | Inner pages. |
| Treatment hero | `.treatment-hero`, `.treatment-hero-copy`, `.treatment-hero-title`, `.treatment-hero-media` | Copy + 4:5 image. |
| Section head | `.section-head` (+ `--center`) | Eyebrow + H2 + optional link on the right. |
| Media | `.media` + `--portrait`, `--tall`, `--square`, `--landscape`, `--wide`; `figure.media-figure` | Square crops, slow hover zoom. |
| Index list | `.index-list` > `.index-item` (`-title`, `-text`, `-meta`) | Ruled rows with arrow; replaces cards. |
| Index grid | `.index-grid` (`--2`) | 3/2 columns of ruled entries. |
| Facts | `dl.facts` | Label/value rows. |
| Price menu | `.price-menu` > `.price-row` (`-name`, `-note`, `-duration`, `-price`) | Prices in display numerals. |
| Steps | `ol.steps` | Numbered real sequences only. |
| Quote | `figure.quote` (+ `--center`) | Italic display with label attribution. |
| CTA band | `.cta-band` > `.cta-band-inner` | Espresso closing band. |
| Trust line | `.trust-line` | Ruled row of proof points. |
| FAQ | `details.faq-item` inside `.faq-list` | Display-serif questions, drawn `+`. |
| Booking CTA | `<BookingCta />` | Sand band, primary + WhatsApp link. |

## 6. Global chrome

- **Navigation** (`src/components/Nav.astro`): three zones on desktop — Behandlungen (mega dropdown) · Über mich · Journal | centred monogram | Kontakt · "Termin buchen". Porcelain with blur; compacts on scroll. Mobile: logo left, menu button right, porcelain overlay with display-serif links.
- **Footer** (`src/components/Footer.astro`): espresso band, large Bodoni wordmark, four columns, legal row with "Cookie-Einstellungen" (`data-bfl-consent-open`).
- **Consent** (`src/components/MarketingConsent.astro`): ivory panel; re-openable from every footer.

## 7. Files

| File | Contents |
|---|---|
| `src/styles/main.css` | Fonts, tokens, base type, layout primitives, buttons, accessibility helpers |
| `src/styles/components.css` | Navigation, heroes, shared patterns, restyled legacy classes, footer, responsive |
| `src/styles/kontakt.css` | Kontakt page layout |
| `src/styles/blog.css` | Journal article typography |
| `src/styles/booking.css` | Legacy booking widget |
| Scoped `<style>` in pages/components | Page-specific layout only |

The live reference page is `/admin/design-system/` (noindex).
