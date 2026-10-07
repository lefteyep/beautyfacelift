import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/aquafacial-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  landingPage: new URL('../src/layouts/LandingPage.astro', import.meta.url),
  marketingConsent: new URL('../src/components/MarketingConsent.astro', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readNamedFile(name) {
  try {
    return await readFile(files[name], 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`${name} file is missing at ${files[name].pathname}`);
    }
    throw error;
  }
}

const [lp, termin, landingPage, marketingConsent, tracking] = await Promise.all([
  readNamedFile('lp'),
  readNamedFile('termin'),
  readNamedFile('landingPage'),
  readNamedFile('marketingConsent'),
  readNamedFile('tracking'),
]);

const previousTreatmentSpellings = [
  ['Hydra', 'Facial'].join(''),
  ['Hydra', 'facial'].join(''),
];

for (const spelling of previousTreatmentSpellings) {
  assert(!lp.includes(spelling), 'Aquafacial LP must not render the previous treatment spelling');
  assert(!termin.includes(spelling), 'Booking bridge must not render the previous treatment spelling');
  assert(!tracking.includes(spelling), 'Tracking metadata must not render the previous treatment spelling');
}

assert(lp.includes('const PROMO_PRICE = 170'), 'Aquafacial LP must define CHF 170 promo price');
assert(lp.includes('const REGULAR_PRICE = 250'), 'Aquafacial LP must define CHF 250 regular price');
assert(lp.includes('const DURATION_LABEL = \'1 Std. 30 Min.\''), 'Aquafacial LP must show the requested duration label');
assert(lp.includes("const OFFER_SLUG = 'aquafacial-microneedling-aktion'"), 'Aquafacial LP must use the Aquafacial offer slug');
assert(lp.includes('Aquafacial + Microneedling'), 'Aquafacial LP must name the treatment clearly');
assert(lp.includes('CHF {PROMO_PRICE}') || lp.includes('CHF ${PROMO_PRICE}'), 'Aquafacial LP must render the promo price');
assert(lp.includes('statt CHF {REGULAR_PRICE}') || lp.includes('statt CHF ${REGULAR_PRICE}'), 'Aquafacial LP must render the original price anchor');
assert(lp.includes("const PRIMARY_CTA_LABEL = 'Jetzt Termin buchen'"), 'Aquafacial LP must define direct booking as the primary CTA label');
assert(lp.includes("const LEAD_CTA_LABEL = 'Hautanalyse & Termin anfragen'"), 'Aquafacial LP must keep a secondary lead-focused CTA label');
assert(lp.includes("const SECONDARY_CTA_LABEL = 'Frage per WhatsApp stellen'"), 'Aquafacial LP must define the WhatsApp secondary CTA label');
assert(lp.includes("const BOOKING_CTA_LABEL = 'Kombi-Behandlung buchen'"), 'Aquafacial LP must preserve a direct booking CTA');
assert(lp.includes("const FORM_CTA_LABEL = 'Terminwunsch senden'"), 'Aquafacial LP must define the lead form submit CTA');
assert(lp.includes('Jetzt Termin buchen'), 'Aquafacial LP must use the requested direct-booking primary CTA copy');
assert(lp.includes('Hautanalyse & Termin anfragen'), 'Aquafacial LP must keep the lead-form CTA as a secondary path');
assert(lp.includes('Frage per WhatsApp stellen'), 'Aquafacial LP must use the brief WhatsApp CTA copy');
assert(lp.includes('Kombi-Behandlung buchen'), 'Aquafacial LP must keep a warm-traffic booking path');
assert(!lp.includes('Sie wissen bereits, dass die Kombi passt?'), 'Aquafacial LP hero must not show the direct-booking prompt line');
assert(!lp.includes('lp_hero_direct_booking'), 'Aquafacial LP hero must not show a separate direct-booking CTA');
assert(!lp.includes('Kombi-Termin sichern'), 'Aquafacial LP must not keep the previous CTA copy');
assert(lp.includes('font-size: clamp(2.25rem, 4.7vw, 3.5rem)'), 'Aquafacial LP hero headline must match the section headline scale on desktop');
assert(lp.includes('font-size: clamp(2rem, 9vw, 2.6rem)'), 'Aquafacial LP hero headline must match the section headline scale on mobile');
assert(lp.includes('font-weight: 500'), 'Aquafacial LP hero headline must use the requested 500 font weight');
assert(!/\.lp-title\s*\{\s*max-width:\s*760px;\s*font-weight:\s*400;/m.test(lp), 'Aquafacial LP hero headline override must not reset the title to 400 font weight');
assert(lp.includes('text-align: center'), 'Aquafacial LP mobile hero text must be center aligned');
assert(lp.includes('Aktion: Aquafacial + Microneedling in Zürich'), 'Aquafacial LP hero eyebrow must use the requested action-focused copy');
assert(
  lp.includes('Frischer Glow und glatter wirkende Haut – professionell abgestimmt auf Ihr Hautbild'),
  'Aquafacial LP must use the brief outcome-led hero headline',
);
assert(lp.includes('Wenn Ihre Haut mehr braucht als Pflege zu Hause'), 'Aquafacial LP must connect visitor desire to the offer');
assert(lp.includes('Warum Aquafacial und Microneedling zusammen sinnvoll sein können'), 'Aquafacial LP must explain why Aquafacial and Microneedling are combined');
assert(lp.includes('Aquafacial: reinigen, hydratisieren, Glow aufbauen'), 'Aquafacial LP must include a dedicated Aquafacial explanation');
assert(lp.includes('Microneedling: gezielte Mikroimpulse für feinere Hautstruktur'), 'Aquafacial LP must include a dedicated Microneedling explanation');
assert(lp.includes('hero-aquafacial-microneedling-zuerich.webp'), 'Aquafacial LP must use the optimized hero WebP image');
assert(lp.includes('aquafacial-close-up-zuerich.webp'), 'Aquafacial LP must use the optimized Aquafacial close-up image');
assert(lp.includes('post-treatment-glow-zuerich.webp'), 'Aquafacial LP must use the optimized post-treatment glow image');
assert(lp.includes('hautanalyse-beratung-zuerich.webp'), 'Aquafacial LP must use the optimized Hautanalyse image');
assert(lp.includes('abschlusspflege-aftercare-zuerich.webp'), 'Aquafacial LP must use the optimized aftercare image');
assert(lp.includes('microneedling-close-up-zuerich.webp'), 'Aquafacial LP must use the optimized Microneedling close-up image');
assert(lp.includes('personal-treatment-zuerich.webp'), 'Aquafacial LP must use the optimized personal treatment image');
assert(lp.includes('Aquafacial und Microneedling Behandlung bei Beauty Face Lift Zürich'), 'Aquafacial LP hero image must use meaningful German alt text');
assert(lp.includes('loading="eager"') && lp.includes('fetchpriority="high"'), 'Aquafacial LP must prioritize only the hero image');
assert(!lp.includes('loading="eager"') || (lp.match(/loading="eager"/g) || []).length === 1, 'Aquafacial LP must not eagerly load non-hero images');
assert(lp.includes('Persönliche Behandlung statt Standardprogramm'), 'Aquafacial LP must include a stronger trust/proof section before the final booking area');
assert(lp.includes('color: #178a45'), 'Aquafacial LP included-item checks must render as green check marks');
assert(lp.includes('Realistische Ergebnisse statt übertriebener Versprechen'), 'Aquafacial LP must keep expectation-setting visible');
assert(lp.includes('id={LEAD_FORM_ID}'), 'Aquafacial LP must include a lead form anchor');
assert(lp.includes("const LEAD_FORM_TARGET_ID = 'anfrage-form'"), 'Aquafacial LP must define a direct form anchor target');
assert(lp.includes('data-button-location="lp_hero_booking"'), 'Aquafacial LP hero primary CTA must be a direct booking CTA');
assert(lp.includes('<a href={bookingHref} class="pill-btn lp-hero-primary"'), 'Aquafacial LP hero primary CTA must route through the booking bridge');
assert(!lp.includes('data-button-location="lp_hero_lead"'), 'Aquafacial LP hero must not make the lead form the primary CTA');
assert(lp.includes('href={`#${LEAD_FORM_TARGET_ID}`}'), 'Aquafacial LP secondary lead CTAs must scroll directly to the form');
assert(lp.includes('id={LEAD_FORM_TARGET_ID}'), 'Aquafacial LP form must expose the direct anchor id');
assert(lp.includes('class="lp-lead-form" action="/api/contact" method="post"'), 'Aquafacial LP must submit the lead form through the existing contact API');
assert(lp.includes('name="skinGoal"'), 'Aquafacial LP lead form must ask for the skin goal');
assert(lp.includes('name="preferredCallbackTime"'), 'Aquafacial LP lead form must ask for preferred timing');
assert(lp.includes('name="phone"'), 'Aquafacial LP lead form must ask for phone or WhatsApp');
assert(lp.includes('name="email"'), 'Aquafacial LP lead form must include email');
assert(lp.includes('name="source" value="aquafacial-microneedling-lp"'), 'Aquafacial LP lead form must identify its source for contact handling');
assert(lp.includes('name="privacyConsent"'), 'Aquafacial LP lead form must keep privacy consent');
assert(!lp.includes('cf-turnstile') && !lp.includes('challenges.cloudflare.com/turnstile'), 'Aquafacial LP lead form must not depend on Turnstile rendering');
assert(lp.includes('lp-mobile-sticky'), 'Aquafacial LP must include a mobile sticky CTA bar');
assert(lp.includes('data-mobile-sticky'), 'Aquafacial LP sticky CTA must be addressable for viewport gating');
assert(lp.includes('aria-hidden="true" data-mobile-sticky'), 'Aquafacial LP sticky CTA must start hidden before the hero leaves the viewport');
assert(lp.includes('lp-sticky-visible'), 'Aquafacial LP sticky CTA must be revealed by a scroll-gated body state');
assert(lp.includes('heroSection.getBoundingClientRect()'), 'Aquafacial LP sticky CTA must use the hero position before appearing');
assert(lp.includes('data-button-location="sticky_booking"') && lp.includes('WhatsApp'), 'Aquafacial LP sticky CTA must expose direct booking and WhatsApp actions');
assert(lp.includes('WhatsAppButton'), 'Aquafacial LP must use the reusable WhatsApp CTA component');
assert(lp.includes('Wie viele Sitzungen sind sinnvoll?'), 'Aquafacial LP FAQ must address session expectations');
assert(lp.includes('Muss ich schon wissen, ob Aquafacial oder Microneedling besser für mich ist?'), 'Aquafacial LP FAQ must address treatment uncertainty');
assert(lp.includes('Wann sollte ich den Termin verschieben?'), 'Aquafacial LP FAQ must address suitability and safety objections');
assert(lp.includes('FAQAccordion items={faqs}'), 'Aquafacial LP must include the FAQ accordion');
assert(lp.includes('Studio & Anfahrt'), 'Aquafacial LP must include a studio and directions section');
assert(lp.includes('Bahnhofstrasse 94 · Zürich'), 'Aquafacial LP location section must make the address scannable');
assert(lp.includes('googleMapsEmbedUrl'), 'Aquafacial LP must render a Google Maps embed for the studio location');
assert(lp.includes('Route in Google Maps öffnen'), 'Aquafacial LP location section must include a Google Maps route link');
assert(lp.includes('id="studio-map"'), 'Aquafacial LP Google Maps panel must expose a direct anchor');
assert(lp.includes('OPENING_HOURS'), 'Aquafacial LP location section must reuse shared opening hours');
assert(lp.includes('TrustStrip variant="promises"'), 'Aquafacial LP must include a trust/quality strip');
assert(lp.includes("bookingLinkForService(BOOKING_SERVICE)"), 'Aquafacial LP must route booking through the existing /termin/ bridge');
assert(lp.includes("data-treatment=\"Aquafacial + Microneedling\""), 'Aquafacial LP CTAs must expose the treatment for tracking');
assert(lp.includes('window.bflTracking?.trackLead'), 'Aquafacial LP must track lead form submits when analytics consent allows it');
assert(!lp.includes('garantiert'), 'Aquafacial LP must avoid guaranteed-result claims');
assert(!lp.includes('schmerzfrei'), 'Aquafacial LP must avoid unsupported pain-free claims');
assert(!lp.includes('keine Ausfallzeit'), 'Aquafacial LP must avoid no-downtime claims');
assert(!lp.includes('Poren verschwinden'), 'Aquafacial LP must avoid guaranteed pore claims');
assert(!lp.includes('Falten weg'), 'Aquafacial LP must avoid unsupported wrinkle claims');
assert(!lp.includes('Hydra4Face') && !lp.includes('hydra4face'), 'Aquafacial LP must not use the device-brand term');
assert(lp.includes("absoluteUrl('/lp/aquafacial-microneedling/#product')"), 'Structured product id must use the Aquafacial LP slug');
assert(lp.includes("absoluteUrl('/lp/aquafacial-microneedling/')"), 'Structured product offer URL must use the Aquafacial LP slug');

assert(termin.includes('aquafacial-microneedling-aktion'), 'Booking bridge must recognize the Aquafacial campaign offer parameter');
assert(termin.includes('Aquafacial + Microneedling für CHF 170 statt CHF 250'), 'Booking bridge must expose Aquafacial promo context to users');
assert(termin.includes("'Aquafacial + Microneedling': 'TR4124140'"), 'Booking bridge must map Aquafacial + Microneedling to the Treatwell service detail id');
assert(termin.includes("target.hash = 'serviceDetails=' + encodeURIComponent(serviceDetailsId)"), 'Booking bridge must open the matching Treatwell service detail panel');
assert(!termin.includes('hydra4face-microneedling-aktion'), 'Booking bridge must not keep the old hydra4face offer parameter');

assert(landingPage.includes('og:title'), 'Landing page layout must expose Open Graph title metadata');
assert(landingPage.includes('twitter:card'), 'Landing page layout must expose Twitter card metadata');
assert(
  marketingConsent.includes('bfl-consent-visible') && marketingConsent.includes('bfl-consent-hidden'),
  'Marketing consent must expose visible/hidden state so mobile sticky CTAs do not fight the banner',
);

assert(tracking.includes("'/lp/aquafacial-microneedling/'"), 'Tracking must register the Aquafacial campaign route');
assert(tracking.includes("content_name: 'Aquafacial Microneedling Aktion'"), 'Tracking must name the Aquafacial ViewContent event');
assert(tracking.includes('value: 170'), 'Tracking must send CHF 170 as the ViewContent value');
assert(tracking.includes('trackLead: typeof trackLead'), 'Tracking helper must expose trackLead for the LP form');
assert(!tracking.includes("'/lp/hydra4face-microneedling/'"), 'Tracking must not keep the old hydra4face campaign route');

console.log('[ok] Aquafacial + Microneedling LP offer, metadata, bridge, and tracking are aligned.');
