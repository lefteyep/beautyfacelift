# Beauty Face Lift Live Website PRD

- **Product:** Beauty Face Lift Astro site
- **Live URL:** https://beautyfacelift.mediapaulo.workers.dev/
- **Location:** Bahnhofstrasse 94, 8001 Zürich
- **Owner:** Teresa Stimac
- **Date:** 2026-05-04
- **Execution update:** 2026-05-05 - safe high-impact PRD slice executed on branch `codex/prd-live-ux-fixes`.
**Primary goal:** Increase trust, appointment bookings, SEO quality, mobile conversion, accessibility, and perceived premium quality without replacing the editorial medical-spa brand.

---

## 1. Executive Summary

The live site already has a strong premium direction: editorial imagery, refined typography, calm spacing, and a first-party booking funnel. The highest-impact work is not a full redesign. The right next move is a focused conversion and trust pass:

1. Make prices consistent across treatment pages, structured data, homepage copy, and booking data.
2. Move booking intent earlier on mobile.
3. Improve booking clarity, loading/error states, and accessibility.
4. Add trust proof close to calls to action.
5. Improve Teresa's admin dashboard around daily operational tasks.
6. Preserve the premium editorial language while removing friction.

---

## 2. Success Metrics

### Conversion

- Increase mobile clicks on "Termin buchen".
- Increase booking funnel starts from homepage and treatment pages.
- Increase booking completion rate from service selection to customer details.
- Reduce booking abandonment after service selection.
- Increase WhatsApp/contact fallback usage for hesitant users.

### Trust

- Zero visible price contradictions across live pages and booking.
- Treatment pages answer price, duration, downtime, suitability, and safety before booking.
- Clear studio/location proof near booking CTAs.

### Accessibility

- Primary CTAs meet WCAG AA contrast.
- Booking stepper is understandable to screen readers.
- Form errors are associated with inputs.
- Keyboard focus states are visible and predictable.

### Quality

- No mobile horizontal overflow on key pages.
- No text overlap or clipped CTA text at 390px, 834px, and desktop.
- `npm run build` passes before release.

---

## 3. Key User Journeys

### Journey A: Homepage to Booking

User lands on homepage, understands the studio and treatments, sees trust proof, and can book quickly.

Current friction:

- Mobile first viewport is dominated by imagery and headline; booking CTA appears late.
- Proof points exist but are not always close to the decision moment.

Target:

- Mobile users see a booking path earlier.
- CTA is paired with a short trust cue: Teresa personally, Bahnhofstrasse 94, transparent prices.

### Journey B: Treatment Page to Booking

User evaluates one treatment, checks price/FAQ/safety, then books.

Current friction:

- Hydrafacial prices conflict with booking data.
- Booking CTA is not strong enough above the fold on mobile.
- Price/schema/content data are not clearly tied to the same source of truth.

Target:

- Treatment pages show current price/duration ranges and match booking exactly.
- FAQ and trust information support booking confidence.
- Treatment-specific booking CTA is visible earlier.

### Journey C: Booking Funnel

User selects service, date, time, then enters customer details.

Current friction:

- Service cards look elegant but are not obviously actionable.
- Service list is flat, with limited guidance for unsure users.
- Loading, empty, and API failure states are too quiet.
- Stepper is visual only.
- Form errors are not fully accessible.

Target:

- Every booking step explains what to do next.
- Users can recover from API errors.
- Users unsure about the right treatment can switch to WhatsApp/contact without feeling blocked.

### Journey D: Contact Page

User wants a message, call, WhatsApp, address, or booking alternative.

Current state:

- Contact page is one of the stronger mobile pages.
- Direct phone path is visible early.

Target:

- Keep direct-contact clarity.
- Ensure form success/error states and contact fallback remain robust.

### Journey E: Admin Dashboard for Teresa

Teresa logs in to manage bookings, availability, services, and customer exports.

Current limitation:

- Live review only verified the login screen. Authenticated workflow still needs a dedicated review with credentials.

Target:

- Admin opens directly into today's and upcoming bookings.
- Teresa can call, WhatsApp, confirm, cancel, and filter quickly.
- Mobile dashboard remains usable at the studio.

---

## 4. Live Review Findings

### P1: Price Consistency

Official Treatwell catalog now shows:

- Hydra4Face Basic Intensiv: CHF 180
- Hydra4Face Anti Aging: CHF 250
- Hydra4Face Gesicht, Hals, Dekolletee: CHF 280
- Hydra4Face + Microneedling: CHF 170

The site previously used live `/api/services` rows as a temporary source of truth. Treatwell is now the official pricing source and must drive page copy, structured data, booking service rows, and future admin updates.

Files:

- `src/pages/behandlungen/hydrafacial-zuerich/index.astro`
- `src/pages/index.astro`
- service data returned by `/api/services`

Impact:

- High trust risk.
- High SEO quality risk because structured data can advertise a different offer from booking.

### P1: Mobile Homepage CTA Timing

At 390px mobile width, the first viewport is mostly hero images and heading. The primary booking action appears too late.

Files:

- `src/pages/index.astro`
- `src/styles/components.css`

Impact:

- High mobile conversion risk.

### P1: CTA Contrast

The primary gold button uses white text on `#B98F47`, which is about 2.96:1 contrast. This does not meet WCAG AA for normal text.

Files:

- `src/styles/main.css`

Impact:

- Accessibility failure.
- Lower clarity in bright mobile conditions.

### P2: Booking Service Selection

Treatment cards are clickable but do not include an explicit "Auswählen" affordance, recommendation labels, grouping, or fallback guidance.

Files:

- `src/components/booking/steps/TreatmentSelect.tsx`
- `src/styles/booking.css`

Impact:

- Users may not immediately understand that a card is the action.
- Unsure users lack a guided path.

### P2: Booking Error and Empty States

Services, availability, and slots catch fetch failures quietly. Some states can become blank or non-actionable.

Files:

- `src/components/booking/BookingWidget.tsx`
- `src/components/booking/steps/DateSelect.tsx`
- `src/components/booking/steps/TimeSelect.tsx`

Impact:

- Users cannot recover if the API is slow or unavailable.
- Contact fallback is missing at the moment of failure.

### P2: Booking Accessibility

The stepper is decorative and does not expose current step semantics. Form validation messages are visual only.

Files:

- `src/components/booking/ui/StepIndicator.tsx`
- `src/components/booking/steps/CustomerForm.tsx`

Impact:

- Screen reader and keyboard users get a weaker funnel.
- Validation is less reliable for assistive technology.

### P2: Treatment Page CTA Strength

Treatment pages are visually strong, but the booking CTA is not prominent enough in the first mobile decision window.

Files:

- `src/pages/behandlungen/**/index.astro`
- `src/styles/components.css`

Impact:

- Users who already know the treatment have to work harder to book.

### P3: Mobile Navigation Submenu Polish

Opened mobile treatment submenu shows decorative dots separated far from labels.

Files:

- `src/components/Nav.astro`
- `src/styles/components.css`

Impact:

- Brand polish issue.
- Navigation feels less premium than the rest of the page.

### P3: Footer Link Wrapping

On desktop, footer treatment links visually run together because links are block elements with no clear vertical spacing, and long labels create cramped rhythm.

Files:

- `src/components/Footer.astro`
- `src/styles/components.css`

Impact:

- Low conversion impact.
- Medium brand polish impact.

---

## 5. Product Requirements

### 5.1 Trust and Pricing

Requirements:

- All public prices must match the official Treatwell catalog and the booking service data.
- Structured data price values must match visible page content.
- Homepage teaser copy must not advertise outdated "ab CHF" values.
- Treatment pricing cards must either be driven by the same service data source or manually audited against Treatwell.

Acceptance criteria:

- Hydrafacial page no longer contains outdated CHF 190 / 350 / 380 values unless those are confirmed as real active services.
- Booking prices, FAQ answers, pricing cards, meta descriptions, and JSON-LD agree.
- Search snippets do not advertise a price unavailable in booking.

### 5.2 Mobile CTA Strategy

Requirements:

- Homepage mobile users must encounter a booking CTA within the first meaningful viewport.
- Treatment pages must expose a treatment-specific booking action earlier.
- Sticky or compact CTA must not cover form fields, menu overlay, cookie/notice UI, or footer links.
- CTA labels must remain direct and premium.

Recommended copy:

- "Termin buchen"
- "Hydrafacial buchen"
- "Beratung per WhatsApp"

Acceptance criteria:

- At 390px width, homepage screenshot shows a visible booking path without requiring a long scroll.
- No overlapping CTA text or clipped button labels.
- Desktop hero remains editorial and not over-commercialized.

### 5.3 Booking Funnel Clarity

Requirements:

- Service cards include a visible action affordance.
- Service cards show duration, price, and short outcome copy.
- Selected service state is clear.
- Add support for treatment grouping or guided categories.
- Add fallback: "Nicht sicher? Per WhatsApp beraten lassen."
- Loading, empty, and error states include next actions.

Acceptance criteria:

- A first-time user understands that selecting a service advances the funnel.
- API failure states show a message and contact fallback.
- Empty slots state suggests another date and contact fallback.
- Booking flow remains usable at 390px.

### 5.4 Booking Accessibility

Requirements:

- Step indicator is an ordered list or nav landmark.
- Current step uses `aria-current="step"`.
- Step labels are exposed to assistive tech and at least the current label is visible on mobile.
- Customer form inputs use `aria-invalid` when invalid.
- Error messages have stable IDs and are connected with `aria-describedby`.
- On submit with validation errors, focus moves to the first invalid field.
- Submit button uses `aria-busy` while submitting.

Acceptance criteria:

- Keyboard-only user can complete service/date/time/details without losing focus.
- Screen reader announces current step and field errors.
- Existing visual style is preserved.

### 5.5 Contact and WhatsApp Fallback

Requirements:

- Contact page keeps phone and email visible early.
- Booking failure states link to phone/WhatsApp/contact.
- Treatment pages include a soft consult path for unsure users.
- Contact form success and error messages are visible and accessible.

Acceptance criteria:

- A user can choose call, WhatsApp, email, or booking from contact page without hunting.
- Booking API failure never leaves the user without a next step.

### 5.6 Admin Dashboard Usability

Requirements:

- Authenticated admin opens to the most important daily view.
- "Today" and "Next 7 days" bookings are prominent.
- Booking rows/cards include customer name, service, time, phone, status, notes indicator.
- Quick actions: call, WhatsApp, confirm, cancel, complete.
- Filters: date range, status, service.
- Mobile admin uses cards instead of wide tables where needed.
- Export remains available but secondary to daily operations.

Acceptance criteria:

- Teresa can identify the next appointment within 5 seconds after login.
- Teresa can contact a customer from a booking row/card with one tap.
- Admin remains usable at tablet and mobile sizes.

### 5.7 Brand Polish

Requirements:

- Preserve editorial, premium, medical-spa tone.
- Avoid generic SaaS sections, oversized marketing cards, and decorative clutter.
- Keep photography central.
- Use proof strips and microcopy close to decision points.
- Normalize German tone: choose either "Sie" or "Du" and apply consistently.

Acceptance criteria:

- New UI feels like the current Beauty Face Lift brand.
- CTA and trust additions do not make the page feel like a generic landing page.

---

## 6. Implementation Plan

### Phase 0: Baseline and Safety

Scope:

- Capture reference screenshots for live homepage, booking, Hydrafacial, contact, and admin login.
- Confirm current live `/api/services`, `/api/availability`, and `/api/slots`.
- Record current price source of truth.

Files likely touched:

- None unless adding test notes.

Acceptance criteria:

- Screenshots exist for before/after comparison.
- Known unrelated worktree changes are not touched.

### Phase 1: Safe High-Impact Fixes

Scope:

1. Reconcile Hydrafacial and homepage pricing with live booking data.
2. Fix primary CTA contrast.
3. Add booking service card action affordance.
4. Add booking services error/empty state.
5. Add ARIA semantics to booking stepper.
6. Add ARIA validation support to customer form.
7. Fix mobile nav submenu dot alignment.
8. Guard global animation selectors that warn on pages without matching elements.

Primary files:

- `src/pages/index.astro`
- `src/pages/behandlungen/hydrafacial-zuerich/index.astro`
- `src/styles/main.css`
- `src/styles/components.css`
- `src/styles/booking.css`
- `src/layouts/Base.astro`
- `src/components/Nav.astro`
- `src/components/booking/BookingWidget.tsx`
- `src/components/booking/steps/TreatmentSelect.tsx`
- `src/components/booking/steps/CustomerForm.tsx`
- `src/components/booking/ui/StepIndicator.tsx`

Acceptance criteria:

- `npm run build` passes.
- Homepage, treatment, booking, and contact screenshots pass mobile visual review.
- No price conflict remains for Hydrafacial.
- Buttons meet contrast.
- Booking has visible recovery states.

### Phase 2: Conversion Upgrade

Scope:

1. Add earlier mobile homepage booking path.
2. Add treatment-specific above-fold CTA pattern.
3. Add trust proof near CTAs.
4. Add WhatsApp/consult fallback inside booking.
5. Group services in booking by treatment family.
6. Add booking reassurance copy before customer details.

Primary files:

- `src/pages/index.astro`
- `src/pages/behandlungen/**/index.astro`
- `src/components/booking/steps/TreatmentSelect.tsx`
- `src/components/booking/steps/CustomerForm.tsx`
- `src/styles/components.css`
- `src/styles/booking.css`

Acceptance criteria:

- Mobile homepage shows booking path earlier without losing editorial quality.
- Treatment pages show clear booking and consult actions early.
- Booking service selection is faster and easier to scan.

### Phase 3: Admin Dashboard Upgrade

Scope:

1. Review authenticated live admin with Teresa credentials.
2. Redesign dashboard hierarchy around "Heute" and "Nächste 7 Tage".
3. Add quick call/WhatsApp actions.
4. Add status chips and faster filters.
5. Improve mobile table/card layout.

Primary files:

- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/BookingsList.tsx`
- `src/components/admin/ServiceManager.tsx`
- `src/components/admin/AvailabilityEditor.tsx`
- `src/components/admin/BlockedDatesManager.tsx`
- `src/styles/admin.css`

Acceptance criteria:

- Teresa can complete daily booking-management tasks without horizontal table friction.
- Admin remains readable at mobile/tablet sizes.
- No auth/session regression.

### Phase 4: SEO and Data Source Hardening

Scope:

1. Define service/pricing source of truth.
2. Audit all treatment pages for price and duration consistency.
3. Audit JSON-LD Offer/AggregateOffer values.
4. Add a lightweight validation script or checklist to prevent future price drift.
5. Validate sitemap, canonical URLs, and noindex pages.

Primary files:

- `src/pages/behandlungen/**/index.astro`
- `src/pages/index.astro`
- `src/lib` or `worker/routes/services.ts` if data source changes
- `scripts/*` if a validation script is added

Acceptance criteria:

- Search-facing content and booking data agree.
- New price changes have one clear update path.

### Phase 5: Full QA and Release

Scope:

- Run production build.
- Verify live-like Workers environment.
- Test booking flow without submitting real customer data unless approved.
- Test contact form safely.
- Test keyboard navigation.
- Check desktop, tablet, and mobile screenshots.
- Confirm no text overlap, no horizontal overflow, and no broken footer/nav states.

Acceptance criteria:

- `npm run build` passes.
- Key pages pass responsive visual review at 390, 834, and 1440 widths.
- Booking APIs still respond.
- No console errors from expected user journeys.

---

## 7. Detailed Backlog

### Epic A: Price Trust

- [x] Confirm final active prices from the official Treatwell catalog supplied by the client on 2026-05-05.
- [x] Update Hydrafacial pricing content.
- [x] Update Hydrafacial FAQ answers.
- [x] Update Hydrafacial JSON-LD `lowPrice` and `highPrice`.
- [x] Update homepage Hydrafacial teaser price.
- [x] Audit Microneedling, Peeling, ColdPlasma, and Carbon Microneedling against Treatwell.

### Epic B: Mobile Conversion

- [x] Make homepage mobile CTA visible earlier.
- [x] Add treatment page CTA pattern near first content block.
- [x] Add compact trust strip near CTA.
- [x] Ensure sticky/early CTA does not conflict with mobile nav overlay.

### Epic C: Booking Funnel

- [x] Add explicit "Auswählen" affordance to service cards.
- [x] Add selected state copy and stronger visual state.
- [x] Group services by category.
- [x] Add booking service helper text for unsure users.
- [x] Add WhatsApp/contact fallback in booking empty/error states.
- [x] Add API error state for services.
- [x] Add API error state for availability.
- [x] Add API error state for slots.
- [x] Add reassurance summary before final submission.

### Epic D: Accessibility

- [x] Fix CTA contrast.
- [x] Make booking stepper semantic.
- [x] Add `aria-current="step"`.
- [x] Add `aria-invalid` and `aria-describedby` to customer fields.
- [x] Focus first invalid field after submit.
- [x] Add `aria-busy` to submit button.
- [ ] Review focus states for booking, nav, and forms in a full keyboard QA session.

### Epic E: Brand Polish

- [x] Fix mobile nav submenu dot alignment.
- [x] Improve footer link spacing/wrapping.
- [ ] Normalize "Sie" vs "Du" tone.
- [x] Keep CTA additions visually restrained.
- [x] Keep cards at premium editorial density, not SaaS dashboard style.

### Epic F: Admin

- [ ] Review authenticated live admin.
- [ ] Add "Heute" summary.
- [ ] Add "Nächste 7 Tage" summary.
- [ ] Add phone and WhatsApp quick actions.
- [ ] Add status filters.
- [ ] Improve mobile booking list layout.
- [ ] Preserve CSV export.

### Epic G: QA and Release

- [x] Build passes.
- [x] Live-like Workers test passes. Local API validation was blocked by missing Supabase anon key, but post-release live Workers verification passed.
- [x] Screenshots checked at desktop/mobile. Tablet remains recommended for the next QA sweep.
- [x] No mobile horizontal overflow on key pages.
- [x] Booking flow tested through validation and recoverable error states.
- [ ] Contact flow tested without accidental customer submission.

---

## 8. Out of Scope for First Implementation Slice

- Full visual redesign.
- New photography production.
- Stripe/deposit re-architecture.
- Replacing Supabase or Cloudflare architecture.
- Submitting live test bookings without approval.
- Admin changes that require unknown credentials before review.

---

## 9. Open Decisions

1. Final Hydrafacial prices: keep live booking values or update booking to match existing page content?
2. Should site tone be "Sie" throughout or a warmer "Du" throughout?
3. Should Carbon Microneedling remain visible in booking if there is no full treatment page?
4. Should WhatsApp be a primary CTA beside booking, or only a fallback for unsure users?
5. Should service data become the single source of truth for pricing shown on treatment pages?
6. What admin workflow matters most to Teresa: today view, weekly calendar, or customer list?

---

## 10. Recommended First Sprint

Start with Phase 1. It has the best risk/reward profile because it fixes trust, accessibility, and booking clarity without changing the brand system.

Suggested first pull request:

1. Fix Hydrafacial/homepage pricing consistency.
2. Fix CTA contrast.
3. Add booking error/empty states.
4. Add service-card action affordance.
5. Make stepper and form errors accessible.
6. Fix mobile nav submenu alignment.
7. Run build and responsive visual QA.

Definition of done:

- Build passes.
- Mobile homepage, booking, contact, and Hydrafacial look correct at 390px.
- Booking flow still reaches customer form.
- No changed files outside the agreed scope.
