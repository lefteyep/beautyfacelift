# Old site `beautyfacelift.ch`: shutdown and redirects

**Decision (user, 2026-10-20):** the old WordPress site on `beautyfacelift.ch` is shut down before the Meta campaign starts. This document is the plan; the user runs the DNS and hosting steps, the agency the rest. It replaces the "do not touch `beautyfacelift.ch`" rule of [DOMAIN-LAUNCH.md](DOMAIN-LAUNCH.md), which applied to the launch of the new domain only.

## Why redirect instead of switching off

- The old domain still ranks and still carries the links (Google Business Profile, Treatwell, directories). A 301 per page passes that on to the new site; a dead site throws it away.
- The old site still fires the Meta Pixel `Lead` event from its homepage form (19 in the four weeks to 2026-10-19, latest 14 October). Redirecting the site stops that, which the campaign's optimisation needs.
- The old ad links (`/lp-aquafacial-aktion/`, `/lp-aquafacial-microneedling/`, `/lp-carbon-microneedling/`) still exist in old Meta ads and messages; they land on the new ad pages with their campaign parameters kept.

## What must not break: e-mail

`beautyfacelift.ch` carries Teresa's mailbox `info@beautyfacelift.ch` on Google Workspace (MX records `aspmx.l.google.com`, `alt1…alt4`). Whatever is done with the website, **the domain's mail records stay**: MX, the SPF TXT record (`v=spf1 include:_spf.google.com ~all`), the DKIM record (`google._domainkey`) and, if present, DMARC (`_dmarc`). If the DNS moves (option A), copy them first and check mail still arrives before anything else is changed.

DNS today: nameservers `ns1–ns3.hosttech.ch` (checked 2026-10-20). `booking.beautyfacelift.ch` is a subdomain of this domain, see DOMAIN-LAUNCH.md; keep its record if it is still in use.

## Option A (recommended): point the domain at the Cloudflare Worker

The Worker already contains the redirect map (`OLD_SITE_HOSTS`, `OLD_SITE_PATH_MAP` in `worker/index.ts`). It is inert until the old domain reaches the Worker, so it can be live before the DNS moves. Steps:

1. **Cloudflare → Add a site → `beautyfacelift.ch`** (Free plan). Cloudflare scans the existing records. Check that every mail record above is present (add any that is missing from hosttech's DNS panel), set the mail records to "DNS only" (grey cloud), and keep `booking.beautyfacelift.ch` if needed. Delete the old `A`/`CNAME` records for `@` and `www` that point to hosttech; the custom domains in step 3 create new ones.
2. **At hosttech (the registrar), change the nameservers** to the two that Cloudflare shows. Propagation takes minutes to a day.
3. **Attach the domain to the Worker:** Cloudflare → Workers & Pages → `beautyfacelift` → Settings → Domains & Routes → add custom domains `beautyfacelift.ch` and `www.beautyfacelift.ch`. (Or: add both to `routes` in `wrangler.jsonc` with `custom_domain: true` and deploy, once the zone exists; before that, a deploy with those routes fails.)
4. **Check:** `curl -I https://beautyfacelift.ch/behandlungen/hydra4face/` answers `301` with `location: https://beautyfacelift-zuerich.ch/behandlungen/aquafacial-zuerich/`; `curl -I https://www.beautyfacelift.ch/` answers `301` to the new home page; send a test mail to `info@beautyfacelift.ch`.
5. **Hosting:** export the WordPress site first (Tools → Export, plus the media folder) as an archive, then cancel the hosting after about a week of working redirects. The domain itself stays registered.

## Option B: keep the hosting for now, redirect in WordPress

If the hosting stays for a while, install the "Redirection" plugin (or add the block below to `.htaccess` in the web root) and leave DNS untouched. Mail is unaffected.

```apache
RewriteEngine On
RewriteRule ^behandlungen/bdr-fruchtsaeurepeeling/?$ https://beautyfacelift-zuerich.ch/behandlungen/fruchtsaeure-peeling-zuerich/ [R=301,L]
RewriteRule ^behandlungen/carbon-peeling/?$ https://beautyfacelift-zuerich.ch/behandlungen/microneedling-zuerich/ [R=301,L]
RewriteRule ^behandlungen/coldplasma/?$ https://beautyfacelift-zuerich.ch/behandlungen/coldplasma-zuerich/ [R=301,L]
RewriteRule ^behandlungen/gesichtsbehandlung/?$ https://beautyfacelift-zuerich.ch/behandlungen/gesichtsbehandlung-zuerich/ [R=301,L]
RewriteRule ^behandlungen/hydra4face/?$ https://beautyfacelift-zuerich.ch/behandlungen/aquafacial-zuerich/ [R=301,L]
RewriteRule ^behandlungen/laser-haarentfernung/?$ https://beautyfacelift-zuerich.ch/behandlungen/laser-haarentfernung-zuerich/ [R=301,L]
RewriteRule ^behandlungen/make-up/?$ https://beautyfacelift-zuerich.ch/behandlungen/make-up-zuerich/ [R=301,L]
RewriteRule ^behandlungen/massage/?$ https://beautyfacelift-zuerich.ch/behandlungen/massage-zuerich-bahnhofstrasse/ [R=301,L]
RewriteRule ^behandlungen/micro-needling/?$ https://beautyfacelift-zuerich.ch/behandlungen/microneedling-zuerich/ [R=301,L]
RewriteRule ^behandlungen/waxing/?$ https://beautyfacelift-zuerich.ch/behandlungen/waxing-zuerich/ [R=301,L]
RewriteRule ^behandlungen/wimpern-und-brauen-zupfen-faerben/?$ https://beautyfacelift-zuerich.ch/behandlungen/wimpern-brauen-zuerich/ [R=301,L]
RewriteRule ^behandlungen/?$ https://beautyfacelift-zuerich.ch/behandlungen/ [R=301,L]
RewriteRule ^angebot-preise/?$ https://beautyfacelift-zuerich.ch/behandlungen/ [R=301,L]
RewriteRule ^(buchen|termin)/?$ https://beautyfacelift-zuerich.ch/termin/ [R=301,L]
RewriteRule ^danke/?$ https://beautyfacelift-zuerich.ch/kontakt/danke/ [R=301,L]
RewriteRule ^faq/?$ https://beautyfacelift-zuerich.ch/haeufige-fragen/ [R=301,L]
RewriteRule ^kontakt/?$ https://beautyfacelift-zuerich.ch/kontakt/ [R=301,L]
RewriteRule ^ueber-mich/?$ https://beautyfacelift-zuerich.ch/ueber-mich/ [R=301,L]
RewriteRule ^blog/?$ https://beautyfacelift-zuerich.ch/blog/ [R=301,L]
RewriteRule ^lp-aquafacial-aktion/?$ https://beautyfacelift-zuerich.ch/lp/aquafacial/ [R=301,L,QSA]
RewriteRule ^lp-aquafacial-microneedling/?$ https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/ [R=301,L,QSA]
RewriteRule ^lp-carbon-microneedling/?$ https://beautyfacelift-zuerich.ch/lp/carbon-microneedling/ [R=301,L,QSA]
RewriteRule ^ https://beautyfacelift-zuerich.ch/ [R=301,L]
```

## Redirect table

The old sitemap (Yoast, 2026-10-20) lists 37 pages and no posts. 24 are real pages, 13 are theme leftovers (`/beispiel-seite/`, `/change-status/`, `/coming/`, `/experience/`, `/experts/`, `/locations/`, `/memership/`, `/packages/`, `/pricing/`, `/reviews/`, `/sauna-rooms/`, `/services-style-1/`, `/404-2/`); those and every other unknown path, including images under `/wp-content/`, go to the home page.

| Old page | New page | Note |
|---|---|---|
| `/` | `/` | |
| `/angebot-preise/` | `/behandlungen/` | the new site has no separate price page; the overview lists every group with its starting price |
| `/behandlungen/` | `/behandlungen/` | |
| `/behandlungen/bdr-fruchtsaeurepeeling/` | `/behandlungen/fruchtsaeure-peeling-zuerich/` | |
| `/behandlungen/carbon-peeling/` | `/behandlungen/microneedling-zuerich/` | no Carbon page on the new site; Carbon Laser + Microneedling is listed there |
| `/behandlungen/coldplasma/` | `/behandlungen/coldplasma-zuerich/` | |
| `/behandlungen/gesichtsbehandlung/` | `/behandlungen/gesichtsbehandlung-zuerich/` | |
| `/behandlungen/hydra4face/` | `/behandlungen/aquafacial-zuerich/` | same treatment, site naming rule |
| `/behandlungen/laser-haarentfernung/` | `/behandlungen/laser-haarentfernung-zuerich/` | |
| `/behandlungen/make-up/` | `/behandlungen/make-up-zuerich/` | |
| `/behandlungen/massage/` | `/behandlungen/massage-zuerich-bahnhofstrasse/` | |
| `/behandlungen/micro-needling/` | `/behandlungen/microneedling-zuerich/` | |
| `/behandlungen/waxing/` | `/behandlungen/waxing-zuerich/` | |
| `/behandlungen/wimpern-und-brauen-zupfen-faerben/` | `/behandlungen/wimpern-brauen-zuerich/` | |
| `/blog/` | `/blog/` | the old blog had no posts |
| `/buchen/`, `/termin/` | `/termin/` | forwards to Treatwell |
| `/danke/` | `/kontakt/danke/` | |
| `/faq/` | `/haeufige-fragen/` | |
| `/kontakt/` | `/kontakt/` | |
| `/ueber-mich/` | `/ueber-mich/` | |
| `/lp-aquafacial-aktion/` | `/lp/aquafacial/` | campaign parameters are kept |
| `/lp-aquafacial-microneedling/` | `/lp/aquafacial-microneedling/` | campaign parameters are kept |
| `/lp-carbon-microneedling/` | `/lp/carbon-microneedling/` | campaign parameters are kept |
| anything else | `/` | theme leftovers, `/wp-content/…`, `/wp-admin/…`, feeds |

## After the redirect is live

- [ ] **Google Business Profile:** website → `https://beautyfacelift-zuerich.ch/` (the profile is managed by another Google account, most likely Teresa's; see TODO).
- [ ] **Treatwell venue profile:** its page links `beautyfacelift.ch`; change the website in the Treatwell partner account.
- [ ] **Instagram bio and Facebook page** website fields.
- [ ] **Search Console:** the agency account has no access to the `beautyfacelift.ch` property. Once the DNS is on Cloudflare, verify `beautyfacelift.ch` as a domain property (TXT record) and run Settings → "Adressänderung" (change of address) to `beautyfacelift-zuerich.ch`, so Google moves the signals faster.
- [ ] **Local directories** (local.ch, search.ch and the others in TODO): update the website.
- [ ] **Meta:** nothing to do. The old site's Pixel stops with the site; the Business Manager domain `beautyfacelift.ch` stays verified and harmless.
- [ ] **E-mail signatures and printed material** that show `beautyfacelift.ch` still work: the domain redirects, and the mailbox stays.
- [ ] After a week: Search Console → Pages on the new property should show the old pages' traffic arriving; the Meta Lead breakdown by URL should show no `beautyfacelift.ch` entries any more.
