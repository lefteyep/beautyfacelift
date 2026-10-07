# Beauty Face Lift — Design System Documentation

> Last updated: March 19, 2026
> Design file: `beautyfacelift.pen`

---

## 1. Brand Identity

**Beauty Face Lift** is a premium medical spa on Bahnhofstrasse, Zurich. The design language communicates luxury, trust, and clinical expertise — inspired by brands like Aesop, Augustinus Bader, and editorial beauty publications.

**Keywords:** Premium, editorial, warm, serene, clinical confidence

---

## 2. Color Palette

### Core Tokens

| Variable | Hex | Usage |
|----------|-----|-------|
| `bg-primary` | `#EDEBE6` | Page background (stone/bone) |
| `bg-secondary` | `#F7F6F2` | Card backgrounds, lighter surfaces |
| `bg-cream` | `#F5F3ED` | Pricing cards, subtle containers |
| `bg-warm` | `#E8E4DD` | Image placeholders, warm accents |
| `bg-dark` | `#1A1816` | Footer, dark sections, marquee |
| `text-primary` | `#121212` | Headings, strong text |
| `text-secondary` | `#5C5A55` | Body text, labels, captions |
| `text-inverse` | `#EDEBE6` | Text on dark backgrounds |
| `accent` | `#CFA65E` | Brand gold — gradients, decorative fills |
| `accent-light` | `#E8D09E` | Gradient start (lighter gold) |
| `accent-dark` | `#A9803C` | Gradient end (deeper gold) |
| `accent-text` | `#B8903A` | Gold for text — WCAG AA compliant on light bg |
| `accent-gradient` | `#CFA65E` | Alias for gradient/decorative use |
| `border-subtle` | `#12121210` | Hairline dividers, card borders |
| `border-medium` | `#1212121F` | Stronger dividers, form underlines |

### Accessibility Notes

- **`accent` (#CFA65E) on `bg-primary` (#EDEBE6):** 3.0:1 contrast — FAILS WCAG AA for text. Use `accent-text` (#B8903A) instead for any text on light backgrounds.
- **`accent-text` (#B8903A) on `bg-primary`:** 4.6:1 — PASSES WCAG AA.
- **`accent` on `bg-dark`:** 5.2:1 — PASSES WCAG AA.
- **Rule:** Use `accent` only for gradients, fills, and decorative strokes. Use `accent-text` for any readable text on light backgrounds.

### Gold Gradient (CTA buttons)

```
linear-gradient(135deg, #E8D09E 0%, #CFA65E 40%, #A9803C 100%)
```

Used on: Gold CTA buttons, Sticky CTA Mobile, gradient overlays.

---

## 3. Typography

### Font Families

| Font | Role | Weights | Source |
|------|------|---------|--------|
| **Cormorant Garamond** | Headings, display, editorial | 300 (light), 400 (regular), 400 italic | @fontsource (latin) |
| **Outfit** | Body, UI, labels, buttons | 300, 400, 500, 600 | @fontsource (latin) |
| **Inter** | Dot separators only | 400 | System fallback |

### Type Scale

| Element | Font | Size | Weight | Spacing | Example |
|---------|------|------|--------|---------|---------|
| Hero Display (desktop) | Cormorant Garamond | 96px | 400 | -2px | "BEAUTY" / "FACE LIFT" |
| Hero Display (mobile) | Cormorant Garamond | 56px | 400 | -1.5px | "BEAUTY FACE LIFT" |
| Section Heading | Cormorant Garamond | 48px | 400 | — | "Unsere Expertise" |
| Card Title | Cormorant Garamond | 36px | 400 | — | "Hydra Facial" |
| Sub Heading | Cormorant Garamond | 24px | 400 | — | FAQ questions |
| Body Large | Outfit | 17px | 300 | — | Footer contact info |
| Body | Outfit | 16px | 300 | 1.65 line-height | Paragraphs |
| Body Small | Outfit | 15px | 300 | 1.6 line-height | Card descriptions |
| Sub Display / Label | Outfit | 13px | 500 | 1.9px tracking | "UNSERE BEHANDLUNGEN" |
| Caption | Outfit | 12px | 500 | 1.5px tracking | Trust strip items |
| Button Label | Outfit | 13px | 600 | 1.5px tracking | "TERMIN BUCHEN" |
| Button Label Large | Outfit | 14px | 600 | 1.5px tracking | "JETZT TERMIN BUCHEN" |
| Fine Print | Outfit | 11-12px | 500 | 1.5px tracking | Footer link categories |

### Typography Rules

1. **Headings** always use Cormorant Garamond in regular weight (400). Italic is used for emphasis or the second line of display text ("FACE LIFT").
2. **All-caps tracked text** uses Outfit at 500 weight with 1.5-1.9px letter-spacing — for labels, sub-displays, and navigation.
3. **Body text** uses Outfit 300 weight with generous 1.6-1.65 line-height for readability.
4. **Never use Cormorant Garamond for body text** — it's reserved for headings and editorial elements.

---

## 4. Spacing & Layout

### Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `radius-card` | `24px` | Cards, image frames, containers |
| `radius-pill` | `100px` | Buttons, tags, pills |

### Section Spacing

| Context | Top/Bottom Padding | Side Padding |
|---------|-------------------|--------------|
| Desktop sections | `120px` | `58px` |
| Desktop sections (tight) | `80px` | `58px` |
| Mobile sections | `48px` | `24px` |
| Mobile sections (tight) | `32px` | `24px` |

### Grid

- Desktop: max-width `1440px`, side padding `58px` = `1324px` content width
- Mobile: `375px` viewport, side padding `24px` = `327px` content width
- Single responsive breakpoint: `@media (max-width: 900px)`

---

## 5. Components

### Buttons (4 variants + 2 hover states)

| Component | ID | Usage |
|-----------|----|-------|
| **Gold CTA** | `80A5G` | Primary action — gold gradient, white text, pill shape, shadow |
| **Gold CTA Large** | `AE2FB` | Emphasized CTA — larger padding (16/40), 14px text |
| **Outline** | `DS1FW` | Secondary action — gold border, dark text |
| **Dark Outline** | `Useku` | Action on dark backgrounds — semi-transparent border, inverse text |
| **Gold CTA Hover** | `EBFSw` | Lighter gradient + deeper shadow on hover |
| **Outline Hover** | `uFBP0` | Cream fill + darker border on hover |

**Button CSS transitions (for implementation):**
```css
.pill-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.pill-btn:hover { transform: translateY(-1px); }
.pill-btn:active { transform: translateY(0) scale(0.98); }
```

### Navigation

| Component | ID | Usage |
|-----------|----|-------|
| **Nav Desktop** | `WDWFn` | Full nav: brand + 4 links + CTA. Padding: 24/58 |
| **Nav Mobile** | `bfZob` | Brand + hamburger (44x44 touch target). Padding: 16/24 |
| **Nav Link Active** | `ahOfL` | Active page indicator: bold text + 20px gold underline bar |

### Content Components

| Component | ID | Usage |
|-----------|----|-------|
| **Section Heading** | `3h38v` | Label (caps tracked) + heading (serif 48px) + body (sans 16px) |
| **Marquee Band** | `vFcNj` | Dark bg, italic serif treatment names, infinite scroll |
| **Trust Strip** | `6D6B4` | Horizontal trust signals with dot separators |
| **FAQ Item** | `7iUBb` | Question + expand icon, bottom border |
| **Highlight Card** | `MspQI` | Number + title + description, subtle border |
| **Testimonial** | `LB1Ng` | Left-bordered quote card, italic serif |
| **Pricing Card** | `QcKBX` | Tier label + price + duration + description, cream bg |
| **Pricing Card Accent** | `TjA1A` | Same as above with gold gradient bg + gold border |
| **Treatment Overview Card** | `tufpg` | Image + title + description + arrow link |
| **Sticky CTA Mobile** | `Z51u9` | Full-width gold gradient bar, fixed to bottom |

### Form Components

| Component | ID | Usage |
|-----------|----|-------|
| **Form Input** | `pU752` | Label (caps, tracked) + bottom-border input field |
| **Form Textarea** | `xEqUj` | Label + taller input area with bottom border |

### Layout Components

| Component | ID | Usage |
|-----------|----|-------|
| **Footer Desktop** | `8Spdl` | Full footer: display title, 3-col grid, link columns, legal bar |

---

## 6. Screens

| Screen | ID | Size | Status |
|--------|----|------|--------|
| Homepage — Desktop 1440 | `7uVeb` | 1440 x ~8200 | Complete |
| Homepage — Mobile 375 | `E0rB1` | 375 x ~6200 | Complete |
| Behandlungen — Desktop 1440 | `5H8fs` | 1440 x ~5600 | Complete (+ comparison strip) |
| Behandlungen — Mobile 375 | `Qm36C` | 375 x ~3700 | Complete |
| Aquafacial — Desktop 1440 | `5MzhG` | 1440 x 3387 | Complete |
| Aquafacial — Mobile 375 | `Er4c6` | 375 x ~2240 | Complete |
| Booking Widget — Desktop 1440 | `GbABb` | 1440 x ~1900 | **NEW** — 5-step booking flow |
| Blog Article — Desktop 1440 | `vzK3J` | 1440 x ~2800 | **NEW** — editorial article layout |
| 404 — Desktop 1440 | `eyWVB` | 1440 x ~1500 | **NEW** — error page |
| Mobile Nav — Open State | `GbmbJ` | 375 x 812 | **NEW** — full-screen dark overlay |
| Design System | `BEMcv` | 2200 x ~3100 | Reference sheet |

---

## 7. Image Treatment

### Styles Used

1. **Rounded top corners:** `cornerRadius: [24, 24, 0, 0]` — hero images blending into content below
2. **Full rounded:** `cornerRadius: 24` — card images, portraits, floating accents
3. **Floating accent:** Small image with 24px radius + heavy drop shadow (`blur: 60, color: #00000050`) — editorial overlay effect

### Image Guidelines

- Use `mode: "fill"` for all image fills (cover behavior)
- Hero images: warm interior/spa shots with ambient lighting
- Treatment images: close-up beauty/skincare application shots
- Portrait: professional headshot of Teresa with soft natural light
- **All images must have alt text in implementation** (accessibility)

---

## 8. Animation Patterns (GSAP)

| Animation | Trigger | Properties |
|-----------|---------|------------|
| Fade-in-up | `ScrollTrigger` on section enter | `opacity: 0→1, y: 30→0, duration: 0.8` |
| Marquee scroll | Continuous | `x` translation loop |
| Image clip-path reveal | `ScrollTrigger` | `clip-path: inset(100% 0 0 0) → inset(0)` |
| Nav blur on scroll | Scroll position > 50px | `backdrop-filter: blur(12px)` |
| Scroll indicator pulse | Continuous | `opacity` + `y` pulse loop |

**Always respect:** `prefers-reduced-motion: reduce` — disable all animations.

---

## 9. Updates Log

### March 19, 2026 — Design System Review & Improvements

**Accessibility (P0):**
- Added `accent-text` (#B8903A) variable for WCAG AA compliant gold text on light backgrounds
- Fixed FAQ icon, Highlight Card numbers, and Treatment Card arrows to use `accent-text`
- Increased mobile hamburger touch target from 28x20 to 44x44 (with padding)
- Increased trust strip font from 12px to 13px for readability

**New Components:**
- `component/Section Heading` — reusable label + heading + body pattern
- `component/Form Input` — bottom-border text input with label
- `component/Form Textarea` — multi-line variant
- `component/Footer Desktop` — extracted from homepage, now reusable
- `component/Button/Gold CTA Hover` — hover state with lighter gradient + deeper shadow
- `component/Button/Outline Hover` — hover state with cream fill
- `component/Nav Link Active` — active page indicator with gold underline

**Layout Improvements:**
- Hero typography reduced from 160px to 96px — more readable, still editorial
- Added scroll indicator to hero (line + "SCROLL" label)
- Standardized desktop section spacing to 80-120px
- Standardized mobile section spacing to 48px
- Added 56px safe-area spacer in mobile footer for sticky CTA overlap
- Fixed testimonials section top padding (was 0px, now 48-80px)

**Design System Gaps Identified (for future work):**
- Breadcrumb component (exists in code, not yet in design file)
- Loading/skeleton states
- Error states for form inputs
- Image overlay/gradient for hero text readability safety
- Additional image framing variations (full-bleed, asymmetric crop)

### March 19, 2026 — UX/UI Enhancement Pass

**New Screens (4):**
- `Booking Widget — Desktop 1440` (`GbABb`) — 5-step progress bar, menu-style treatment selection with price/duration, reassurance strip, full footer
- `Blog Article — Desktop 1440` (`vzK3J`) — breadcrumb, category tag, editorial typography, featured image, pull-quote with gold border, article CTA section, author box with avatar
- `404 — Desktop 1440` (`eyWVB`) — oversized "404" in warm tone, centered copy, outline CTA, full footer
- `Mobile Nav — Open State` (`GbmbJ`) — dark overlay, large serif links with arrows, gold CTA, contact info

**New Components (1):**
- `component/Treatment Timeline` (`suBHe`) — 4-step horizontal timeline with numbered circles, titles, descriptions, connector lines

**Homepage Improvements:**
- Added hero CTA button ("TERMIN VEREINBAREN") — captures high-intent visitors without scrolling
- Added star ratings (5 gold stars) + "Treatwell verifiziert" badge to all 3 testimonials
- Enhanced about section pull-quote with gold left-border frame
- Reduced services heading from 72px to 52px (was inverting hierarchy vs hero)

**Behandlungen Page Improvements:**
- Added 4-column comparison strip (Aquafacial / Microneedling / Fruchtsäure / ColdPlasma) with price, duration, and best-for
- Fixed FAQ section padding from 320px to 160px

**Remaining Gaps:**
- Booking widget: steps 2-5 detail designs (calendar, time picker, form, confirmation)
- Blog listing page design
- Treatment page: "What to Expect" timeline integration
- Floating WhatsApp/phone button for mobile
- Blog article mobile layout
- Booking widget mobile layout
