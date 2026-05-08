# Release Note — 2026-05-08 Live Update

## Context

This release records the May 8, 2026 live update requested for the public Beauty Face Lift Zürich site.

Working branch:

```text
codex/project-safety-rules
```

Production domain:

```text
https://beautyfacelift-zuerich.ch
```

Repository:

```text
https://github.com/lefteyep/beautyfacelift
```

## Release Scope

The current release branch is larger than a single layout hotfix. It includes the branch baseline already present before this session plus the latest page polish.

### Existing Branch Baseline

The branch contains these unpublished commits relative to `origin/master`:

- `Route booking flow to Aesthetika`
- `Add Exosome Therapie treatment page`
- `Launch beautyfacelift-zuerich custom domain`

Those commits cover the Aesthetika booking direction, the Exosome treatment page, canonical production-domain configuration, Workers routing, SEO/AIO metadata, and launch documentation.

### May 8 Page And Layout Updates

The current working-tree update covers:

- Exosome treatment page CTA copy and WhatsApp link handling.
- Shared treatment action bar wording and centralized WhatsApp URL usage.
- Homepage hero headline and supporting copy refinement.
- Mobile hero sizing refinements in `Base.astro` and `components.css`.
- Centered treatment copy blocks for the Exosome expectations section.
- Centered reusable callout styling on the treatment comparison page.
- Treatment process grid layout refinements for desktop and mobile.
- Shared head icon markup for the main layout and landing-page layout.
- PNG favicon, Apple touch icon, Android Chrome app icons, and manifest icon updates.
- Worker static asset deploy hardening with explicit `--assets=./dist`, immediate old-asset expiry, HEAD request handling, and an internal HTML release key to avoid stale cached document responses.

The important visual decision from this session:

- Content blocks such as "Erwartungen / Wann sieht man Ergebnisse?" remain visually centered.
- Eyebrow, headline, body copy, and related CTA/callout blocks keep centered alignment.
- The fix avoids scattered inline styles by moving repeated treatment-block behavior into shared CSS classes.

## Files In The May 8 Working Tree Delta

```text
docs/DELIVERY-2026-05-08.md
docs/RELAUNCH-STATUS.md
docs/RELEASE-2026-05-08-live-update.md
docs/STATUS.md
docs/TREATMENT-CTA-UPDATE-2026-05-08.md
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/apple-touch-icon.png
public/favicon-32x32.png
public/favicon.ico
public/favicon.svg
public/manifest.json
public/site-icon-270x270.png
package.json
src/components/BookingCta.astro
src/components/HeadIcons.astro
src/components/TreatmentActionBar.astro
src/layouts/Base.astro
src/layouts/LandingPage.astro
src/pages/behandlungen/exosome-therapie-zuerich/index.astro
src/pages/behandlungen/vergleich/index.astro
src/pages/index.astro
src/styles/components.css
worker/index.ts
```

The local `output/` folder contains Playwright screenshot artifacts and is not part of the committed release scope.

## Validation

Validation commands used before release:

```powershell
npm run build
git diff --check
npm run cf:deploy
```

Rendered browser checks were performed locally against:

```text
http://127.0.0.1:4322/
http://127.0.0.1:4322/behandlungen/exosome-therapie-zuerich/
```

Checked viewports:

- Desktop: `1280x720`
- Mobile: `430x932`

Validated behavior:

- Homepage renders the new H1 and subheadline.
- The removed mobile hero booking/proof block no longer appears.
- The homepage hero CTA remains visible in the first mobile viewport.
- Page loads with the intended title: `Exosome Therapie Zürich | Beauty Face Lift`.
- The "Wann sieht man Ergebnisse?" section renders as a centered block.
- The mobile version keeps centered label, headline, and body copy.
- Browser console check returned no relevant errors or warnings.

## Deployment Record

Deployment used the project script:

```powershell
npm run cf:deploy
```

An additional deploy was run after the branch push because an older cached Worker Asset response served the Exosome static route as `404`. The final live deployment uses an internal HTML asset release key plus immediate old-asset expiry:

```powershell
npm run cf:deploy
```

Final Cloudflare result:

```text
Worker: beautyfacelift
Version ID: dac9d2f7-18e2-48ff-95f2-4d8272556e93
Routes:
- beautyfacelift-zuerich.ch
- www.beautyfacelift-zuerich.ch
```

Post-deploy smoke checks:

- `https://beautyfacelift-zuerich.ch/` returned `200` and contains the new homepage headline and subheadline.
- `https://beautyfacelift-zuerich.ch/termin/` returned `200` and contains the Aesthetika booking copy.
- `https://beautyfacelift-zuerich.ch/behandlungen/exosome-therapie-zuerich/` returned `200` and contains `Behandlung planen` plus `Frage per WhatsApp`.
- `https://www.beautyfacelift-zuerich.ch/` returned `200` and contains the new homepage headline.
- `HEAD https://beautyfacelift-zuerich.ch/favicon-32x32.png` returned `200`.
- `HEAD https://beautyfacelift-zuerich.ch/behandlungen/exosome-therapie-zuerich/` returned `200` after the asset restore deploy.
- `https://beautyfacelift-zuerich.ch/api/services` returned `200 application/json`.

## SEO Service Hub Addendum

The later May 8 SEO/copy release is documented separately in:

```text
docs/SEO-SERVICE-HUBS-2026-05-08.md
```

It adds six service hub landing pages, updates the visible service architecture across navigation, footer, homepage, overview, `llms.txt`, and sitemap output, and softens high-risk cosmetic/medical copy claims across treatment and blog content.
