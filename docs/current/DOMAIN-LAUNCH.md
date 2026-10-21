# Domain Launch — beautyfacelift-zuerich.ch

> Historical record of the completed May 2026 custom-domain launch. Its old-domain exclusions describe that launch only. On 20 October the user separately decided to shut down/301-redirect the old site before the campaign; use [OLD-SITE-SHUTDOWN.md](OLD-SITE-SHUTDOWN.md) for that future approved change while preserving email. Current repair/rollout gates are in [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md). Do not rerun historical deployment, DNS or form-test steps as part of code repair.

Canonical production domain:

```text
https://beautyfacelift-zuerich.ch
```

The May launch introduced a new custom domain for the Cloudflare Worker formerly associated with `beautyfacelift.mediapaulo.workers.dev`. It did not migrate or modify `beautyfacelift.ch` or `www.beautyfacelift.ch`. Those historical exclusions do not override the later October shutdown/redirect decision.

**Update 2026-10-20:** the rule above applied to the launch. The user has since decided to shut the old site down before the Meta campaign; the plan, the redirect map and the steps are in [OLD-SITE-SHUTDOWN.md](OLD-SITE-SHUTDOWN.md). The "do not add" steps below are kept as the record of the launch.

## Repository State

- App: Astro static build on Cloudflare Workers Static Assets
- Worker entrypoint: `worker/index.ts`
- API router: `itty-router`
- Cloudflare config: `wrangler.jsonc`
- Production custom domains in Wrangler:
  - `beautyfacelift-zuerich.ch`
  - `www.beautyfacelift-zuerich.ch`
- `workers_dev=false`
- Public sitemap: `https://beautyfacelift-zuerich.ch/sitemap.xml`

Because `workers_dev=false` is active, the temporary workers.dev hostname is not publicly serving the site. The Worker still contains a defensive redirect for `beautyfacelift.mediapaulo.workers.dev` in case that hostname is made reachable again in the future.

## Production State

Observed on 2026-05-07:

| Item | Current value |
| --- | --- |
| Canonical production URL | `https://beautyfacelift-zuerich.ch` |
| Non-canonical production host | `www.beautyfacelift-zuerich.ch` redirects to apex |
| Worker name | `beautyfacelift` |
| Worker version deployed | `f376e963-48cf-4708-9130-650ed6e48b4b` |
| Public nameservers | `ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com` |
| Temporary workers.dev host | Disabled by `workers_dev=false`; live check returned 404 |
| Old domain handling | No `beautyfacelift.ch` or `www.beautyfacelift.ch` routes, DNS changes, redirects, or Search Console migration steps were added |

Launch actions completed:

1. Added `beautyfacelift-zuerich.ch` as a Cloudflare zone.
2. Imported/preserved all-inkl mail authentication records in Cloudflare DNS.
3. Removed only the new-domain all-inkl website records from Cloudflare DNS:
   - apex `A 85.13.163.60`
   - wildcard or `www` CNAME records pointing to `w01402c3.kasserver.com.`
4. Switched all-inkl nameservers to Cloudflare:
   - `ezra.ns.cloudflare.com`
   - `ryleigh.ns.cloudflare.com`
5. Deployed the Worker with Wrangler using the custom-domain routes in `wrangler.jsonc`.
6. Confirmed the apex domain serves the Worker and `www` redirects to the apex.

## all-inkl Checklist

1. Confirm `beautyfacelift-zuerich.ch` is registered at all-inkl.
2. Add `beautyfacelift-zuerich.ch` to Cloudflare as a zone.
3. Copy the two Cloudflare nameservers shown by Cloudflare:
   - `ezra.ns.cloudflare.com`
   - `ryleigh.ns.cloudflare.com`
4. Before changing nameservers, copy any required DNS records from all-inkl/KAS into Cloudflare:
   - MX
   - SPF TXT
   - DKIM TXT
   - DMARC TXT
   - other TXT verification records
   - booking/platform verification records
   - any required subdomains
5. This is especially important if all-inkl email is used.
6. Log in to all-inkl Members Area.
7. Go to Domainverwaltung.
8. Go to Domainliste.
9. Edit `beautyfacelift-zuerich.ch`.
10. Choose Nameserver ändern.
11. Enter the first Cloudflare nameserver.
12. Continue.
13. Confirm the second Cloudflare nameserver is detected or enter it if needed.
14. Save the nameserver change.
15. Wait for DNS activation.
16. Verify the Cloudflare zone becomes active.
17. Do not point the website to all-inkl kasserver if the production website is served by Cloudflare Workers.
18. Keep all-inkl as registrar unless email or other services still intentionally use all-inkl.

### all-inkl DNS Records To Preserve In Cloudflare

These records were exported from all-inkl for `beautyfacelift-zuerich.ch`. Add the mail/authentication records to the Cloudflare DNS zone before changing nameservers if all-inkl email is used.

| Name | Type | Value |
| --- | --- | --- |
| `@` | `MX` | `10 w01402c3.kasserver.com.` |
| `@` | `TXT` | `v=spf1 a mx include:spf.kasserver.com ~all` |
| `_dmarc` | `TXT` | `v=DMARC1; p=none;` |
| `kas202605061810._domainkey` | `TXT` | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0+7uyAJGGdmtL+PyXzffr9f1Y1ghMgjrWmMUmFgj3vNV4xTgHam/MPVRoeYMIl9iPN4WcSUFHLG3UV+e0rwwTKTCV0ij/hXhYoJPjC2BV0lGvBc/bwLEJFMLyOFvkEJp9u0ukB+o3T2C3Beubxnl0fPyJSz7U0t5Z3wC+7io1rA5dvTORNGEThC422h1QZo9JHCpfNd2aznGo6I5eSbc+QMRJDLi7yMAp4ijdljYW33/LRKqNTbgfaBVss1QSuNQ2KIz8Z3H3anrCDlm2QmcJD5/CasTpMkJDJbgn6neVpolGm1sV3z1FNV6UVfPCL8XBFb7BvDzWy/k2zv+t8qJtwIDAQAB` |

Do not copy these as production website records unless there is a separate, intentional non-website use for them:

| Name | Type | Value | Reason |
| --- | --- | --- | --- |
| `@` | `A` | `85.13.163.60` | The apex website must be served by the Cloudflare Worker custom domain, not all-inkl hosting. |
| `*` | `CNAME` | `w01402c3.kasserver.com.` | Only add a wildcard if unknown subdomains must continue to resolve to all-inkl; it is not required for the Worker site or all-inkl email and must not override `www`. |

Current Cloudflare DNS state after launch:

- Keep the MX, SPF, DMARC, and DKIM records above as DNS-only records.
- Do not re-add the apex `A 85.13.163.60` record for the website.
- Do not re-add `www` or wildcard CNAME records pointing the new website back to all-inkl.
- Cloudflare Worker Custom Domains own the apex and `www` website traffic.

## Cloudflare Checklist

1. Add `beautyfacelift-zuerich.ch` as a Cloudflare zone if not already added.
2. Confirm Cloudflare zone becomes active after nameserver change.
3. Open Cloudflare Dashboard.
4. Go to Workers & Pages.
5. Select the Worker currently serving `beautyfacelift.mediapaulo.workers.dev`.
6. Go to Settings.
7. Go to Domains & Routes.
8. Add Custom Domain:
   - `beautyfacelift-zuerich.ch`
9. Add Custom Domain:
   - `www.beautyfacelift-zuerich.ch`
10. If Cloudflare reports externally managed DNS conflicts, remove or replace only the new-domain web records that point to all-inkl:
    - apex `A 85.13.163.60`
    - `www`/wildcard CNAME to `w01402c3.kasserver.com.`
11. Preserve the MX/SPF/DKIM/DMARC records listed above.
12. Confirm Cloudflare creates the required Worker custom-domain DNS records.
13. Confirm SSL/TLS certificate issuance is complete.
14. Confirm apex domain serves the Worker.
15. Confirm www redirects to apex.
16. Confirm workers.dev is disabled for production or redirects to the canonical apex.
17. Do not add `beautyfacelift.ch`.
18. Do not add `www.beautyfacelift.ch`.
19. Do not configure any old-domain migration.

Do not create a Cloudflare Redirect Rule for `www` in the dashboard. The Worker handles the `www` to apex 301 redirect before asset/API handling, preserving path and query string. A separate dashboard redirect rule would be redundant and can create harder-to-debug behavior.

## Workers.dev Handling

The preferred production setting is active in `wrangler.jsonc`:

```json
{
  "workers_dev": false
}
```

The Worker also has a defensive redirect for `beautyfacelift.mediapaulo.workers.dev` so the temporary hostname cannot become canonical if it is still reachable.

Live result on 2026-05-07:

- `https://beautyfacelift.mediapaulo.workers.dev/` returned `404 Not Found`.
- This is expected with `workers_dev=false` and is acceptable because the temporary hostname does not serve indexable duplicate content.

## Subdomain Notes

- `booking.beautyfacelift.ch` belongs to the separate old domain and was not changed during this launch.
- Do not add or remove old-domain DNS records from this project.
- If a new booking subdomain is needed later, prefer a new-domain host such as `booking.beautyfacelift-zuerich.ch`.
- Add a new booking subdomain only after the booking provider gives the required target record and ownership verification values.
- Do not use wildcard DNS as a shortcut for the production website; configure only the exact subdomain that is intentionally needed.

## Google Search Console Checklist

1. Verify domain property:
   - `beautyfacelift-zuerich.ch`
2. Submit sitemap:
   - `https://beautyfacelift-zuerich.ch/sitemap.xml`
3. Inspect homepage:
   - `https://beautyfacelift-zuerich.ch/`
4. Inspect key pages:
   - Kontakt
   - Behandlungen
   - service pages if present
5. Monitor:
   - indexing status
   - sitemap status
   - canonical selected by Google
   - crawl errors
   - mobile usability
   - page experience
6. Do not use any site-move workflow from `beautyfacelift.ch`.
7. Do not claim this is a migration unless the business later intentionally redirects the old domain.

## Google Business Profile Checklist

1. Update website URL to `https://beautyfacelift-zuerich.ch` only when the new website is ready to be public.
2. Confirm business name, address, phone, category, and opening hours are correct.
3. Ensure the website footer/contact page matches the Google Business Profile details.
4. Do not create conflicting business names.
5. Do not create duplicate profiles.

## Analytics And Platform Checklist

1. Update GA4 data stream URL if applicable.
2. Update Google Tag Manager domains/triggers if applicable.
3. Update Google Ads final URLs if applicable.
4. Update Meta Ads final URLs if applicable.
5. Update booking platform return/callback URLs if applicable.
6. Update Google Business Profile website URL if this new site should become the business website.
7. Preserve existing analytics IDs and consent-mode behavior.

## Remaining Manual Work

These items are still manual after the Cloudflare/Worker launch:

1. Google Search Console:
   - verify the `beautyfacelift-zuerich.ch` domain property
   - submit `https://beautyfacelift-zuerich.ch/sitemap.xml`
   - inspect the homepage and key treatment/contact pages
2. Google Business Profile:
   - update the website URL to `https://beautyfacelift-zuerich.ch` when the business is ready to use this as the public profile URL
   - keep name, address, phone, categories, and opening hours consistent with the real business profile
3. Analytics and ads:
   - check GA4 stream URL, GTM triggers/domains, Google Ads final URLs, Meta Ads final URLs, and booking-platform return URLs
4. Email and contact forms:
   - keep the preserved all-inkl MX/SPF/DKIM/DMARC records in Cloudflare
   - if a new sender domain is added for transactional email, add only the DNS records provided by that email provider
   - do not modify old-domain DNS as part of this new-domain launch
5. Cloudflare AI Crawl Control:
   - live `robots.txt` currently includes Cloudflare Managed Content Signals before the repository's `robots.txt`
   - if AI crawler access is intentional, review Cloudflare Dashboard settings under AI Crawl Control / content signals because managed rules can override later crawler-specific `Allow` lines

## Deployment Checks

Run locally before production deploy:

```bash
npm run build
npm run launch:check
npx wrangler deploy --dry-run
```

Production deploy command, when approved:

```bash
npm run cf:deploy
```

`npm run cf:deploy` runs `astro build && wrangler deploy --keep-vars` so dashboard-set non-secret Worker variables are preserved.

Production deploy performed on 2026-05-07:

```bash
npx wrangler deploy --keep-vars
```

Wrangler reported the following production triggers:

- `beautyfacelift-zuerich.ch` custom domain
- `www.beautyfacelift-zuerich.ch` custom domain

The deployed Worker version was `f376e963-48cf-4708-9130-650ed6e48b4b`.

## Verification Commands

```bash
# Canonical apex should serve the website
curl -I https://beautyfacelift-zuerich.ch/

# www should redirect to apex
curl -I https://www.beautyfacelift-zuerich.ch/

# Temporary workers.dev should not be canonical
curl -I https://beautyfacelift.mediapaulo.workers.dev/

# Temporary workers.dev deep path should redirect or noindex
curl -I https://beautyfacelift.mediapaulo.workers.dev/kontakt

# Path should be preserved when redirecting from www
curl -I https://www.beautyfacelift-zuerich.ch/kontakt

# Query string should be preserved when redirecting from www
curl -I "https://www.beautyfacelift-zuerich.ch/kontakt?utm_source=test"

# Sitemap should use only the new domain
curl https://beautyfacelift-zuerich.ch/sitemap.xml

# robots.txt should reference the new sitemap
curl https://beautyfacelift-zuerich.ch/robots.txt
```

## Observed Verification Results

Fresh checks from 2026-05-07:

| Check | Observed result |
| --- | --- |
| `Resolve-DnsName beautyfacelift-zuerich.ch -Type NS -Server 1.1.1.1` | `ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com` |
| `Resolve-DnsName beautyfacelift-zuerich.ch -Type A -Server 1.1.1.1` | Cloudflare A records `172.67.221.235`, `104.21.54.4` |
| `curl -I https://beautyfacelift-zuerich.ch/` | `200 OK` |
| `curl -I https://www.beautyfacelift-zuerich.ch/` | `301 Moved Permanently`, `Location: https://beautyfacelift-zuerich.ch/` |
| `curl -I "https://www.beautyfacelift-zuerich.ch/kontakt?utm_source=test"` | `301 Moved Permanently`, `Location: https://beautyfacelift-zuerich.ch/kontakt?utm_source=test` |
| `curl -I https://beautyfacelift.mediapaulo.workers.dev/` | `404 Not Found` because workers.dev is disabled |
| `curl https://beautyfacelift-zuerich.ch/sitemap.xml` | only `https://beautyfacelift-zuerich.ch/...` URLs |
| `curl https://beautyfacelift-zuerich.ch/robots.txt` | includes `Sitemap: https://beautyfacelift-zuerich.ch/sitemap.xml` |

Expected results:

- `https://beautyfacelift-zuerich.ch/` returns 200 for valid pages.
- `https://www.beautyfacelift-zuerich.ch/` returns 301 to `https://beautyfacelift-zuerich.ch/`.
- `https://www.beautyfacelift-zuerich.ch/kontakt` redirects to `https://beautyfacelift-zuerich.ch/kontakt`.
- Query strings are preserved.
- `beautyfacelift.mediapaulo.workers.dev` is either disabled or redirects to the canonical domain.
- Sitemap contains only `https://beautyfacelift-zuerich.ch` URLs.
- robots.txt references `https://beautyfacelift-zuerich.ch/sitemap.xml`.
- Canonical tags use `https://beautyfacelift-zuerich.ch`.
- JSON-LD uses `https://beautyfacelift-zuerich.ch`.
- Open Graph uses `https://beautyfacelift-zuerich.ch`.
- No production SEO metadata uses workers.dev.
- No production SEO metadata uses the old domain.
