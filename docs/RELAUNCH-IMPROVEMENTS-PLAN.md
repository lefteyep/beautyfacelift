# Relaunch Improvements Plan

## Goal

Implement the relaunch fixes for `beautyfacelift-zuerich.ch` without changing the established Atelier visual language. The work targets five outcomes:

1. Faster image delivery and cleaner LCP behavior.
2. Better mobile readability and type consistency.
3. More robust navigation, especially the `Behandlungen` dropdown.
4. A first-party contact flow with a dedicated `/kontakt/` page and Worker-backed form handling.
5. Removal of treatment-page regressions and Treatwell as a primary identity/action path.

## Implementation Scope

### 1. Image performance

- Move large homepage and treatment marketing images into Astro's asset pipeline via imported local assets.
- Replace raw `<img>` usage with Astro image components where the large PNGs currently hurt LCP and bandwidth.
- Preload the real homepage hero LCP image instead of the current mismatched asset.
- Give the primary hero image high priority and the overlapping secondary hero image low priority.
- Preload only the treatment hero on treatment pages; keep supporting/editorial images lazy.
- Add explicit `sizes` attributes for homepage hero, treatment heroes, and treatment overview cards.

### 2. Typography and readability

- Raise the global mobile type floor with updated tokens:
  - `text-xs`: 12px
  - `text-sm`: 15px
  - `text-base`: 17px
  - `text-md`: 19px
  - `text-lg`: 24px
- Normalize body line-height around `1.65`.
- Keep general paragraph measure near `64ch` and hero/support copy near `34ch`.
- Remove mobile rules that shrink hero/body text to `14px`.
- Re-check nav, FAQ, pricing, testimonials, footer, and booking-adjacent copy after the token shift.

### 3. Navigation

- Refactor `Behandlungen` into a link plus a distinct disclosure button.
- Remove menu-role semantics that do not match a site-navigation pattern.
- Support desktop hover, focus-within, Enter, Space, ArrowDown, and Escape.
- Make the mobile treatments submenu collapsed by default and expandable inline.
- Hide the mobile overlay in markup with `hidden`/`inert`, not only with late CSS.
- Tighten focus handling and scroll locking so the overlay behaves predictably.

### 4. Kontakt page and backend

- Add `/kontakt/` and route nav/footer contact links there.
- Build a contact page with direct contact options, address/hours, directions/parking, guidance copy, and a form.
- Add `POST /api/contact` in the Worker with:
  - server-side validation
  - honeypot rejection
  - conditional Cloudflare Turnstile verification
  - simple in-memory IP rate limiting
  - Resend notification email to the studio
  - redirect-based success handling that works without client-side JS
- Document required env vars in code comments and env examples.

### 5. Treatment-page cleanup

- Remove the marquee from all four treatment detail pages.
- Add a shared body/layout hook for treatment-page styling.
- Fix treatment hero first-paint styling in shared layout/CSS so the nav and hero overlay do not flash or wash out.
- Keep only the intended dark gradient on treatment hero images.
- Clean up breadcrumb spacing below treatment heroes.

### 6. Treatwell cleanup

- Remove Treatwell from schema `sameAs` usage and from primary linked action paths.
- Keep only lightweight social-proof copy where still useful during the transition.

## Environment Variables

The new contact flow expects these values:

- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL` (falls back to `OWNER_EMAIL` or `info@beautyfacelift.ch` if omitted)

## Validation

- Run `npm run build`.
- Confirm treatment pages no longer render the marquee after the hero.
- Confirm homepage and treatment pages now preload the correct image target.
- Confirm `/kontakt/` builds and the non-JS success redirect path exists.

## Status Record

- Current implementation status is tracked in `docs/RELAUNCH-STATUS.md`.
