import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/hydrafacial-microneedling/index.astro', import.meta.url),
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
  assert(!lp.includes(spelling), 'Hydrofacial LP must not render the previous treatment spelling');
  assert(!termin.includes(spelling), 'Booking bridge must not render the previous treatment spelling');
  assert(!tracking.includes(spelling), 'Tracking metadata must not render the previous treatment spelling');
}

assert(lp.includes('const PROMO_PRICE = 170'), 'Hydrofacial LP must define CHF 170 promo price');
assert(lp.includes('const REGULAR_PRICE = 250'), 'Hydrofacial LP must define CHF 250 regular price');
assert(lp.includes('const DURATION_LABEL = \'1 Std. 30 Min.\''), 'Hydrofacial LP must show the requested duration label');
assert(lp.includes('Hydrofacial + Microneedling'), 'Hydrofacial LP must name the treatment clearly');
assert(lp.includes('CHF {PROMO_PRICE}') || lp.includes('CHF ${PROMO_PRICE}'), 'Hydrofacial LP must render the promo price');
assert(lp.includes('statt CHF {REGULAR_PRICE}') || lp.includes('statt CHF ${REGULAR_PRICE}'), 'Hydrofacial LP must render the original price anchor');
assert(lp.includes("const PRIMARY_CTA_LABEL = 'Hautanalyse & Termin anfragen'"), 'Hydrofacial LP must define the lead-focused primary CTA label');
assert(lp.includes("const SECONDARY_CTA_LABEL = 'Frage per WhatsApp stellen'"), 'Hydrofacial LP must define the WhatsApp secondary CTA label');
assert(lp.includes("const BOOKING_CTA_LABEL = 'Kombi-Behandlung buchen'"), 'Hydrofacial LP must preserve a direct booking CTA');
assert(lp.includes("const FORM_CTA_LABEL = 'Terminwunsch senden'"), 'Hydrofacial LP must define the lead form submit CTA');
assert(lp.includes('Hautanalyse & Termin anfragen'), 'Hydrofacial LP must use the brief primary CTA copy');
assert(lp.includes('Frage per WhatsApp stellen'), 'Hydrofacial LP must use the brief WhatsApp CTA copy');
assert(lp.includes('Kombi-Behandlung buchen'), 'Hydrofacial LP must keep a warm-traffic booking path');
assert(!lp.includes('Jetzt Termin buchen'), 'Hydrofacial LP must not keep the previous primary CTA copy');
assert(!lp.includes('Kombi-Termin sichern'), 'Hydrofacial LP must not keep the previous CTA copy');
assert(lp.includes('font-size: 2rem'), 'Hydrofacial LP mobile hero headline must be 2rem');
assert(lp.includes('text-align: center'), 'Hydrofacial LP mobile hero text must be center aligned');
assert(
  lp.includes('Frischer Glow und glatter wirkende Haut – professionell abgestimmt auf Ihr Hautbild'),
  'Hydrofacial LP must use the brief outcome-led hero headline',
);
assert(lp.includes('Wenn Ihre Haut mehr braucht als Pflege zu Hause'), 'Hydrofacial LP must connect visitor desire to the offer');
assert(lp.includes('Warum Hydrofacial und Microneedling zusammen sinnvoll sein können'), 'Hydrofacial LP must explain why Hydrofacial and Microneedling are combined');
assert(lp.includes('Hydrofacial: reinigen, hydratisieren, Glow aufbauen'), 'Hydrofacial LP must include a dedicated Hydrofacial explanation');
assert(lp.includes('Microneedling: gezielte Mikroimpulse für feinere Hautstruktur'), 'Hydrofacial LP must include a dedicated Microneedling explanation');
assert(lp.includes('Persönliche Behandlung statt Standardprogramm'), 'Hydrofacial LP must include a stronger trust/proof section before the final booking area');
assert(lp.includes('Realistische Ergebnisse statt übertriebener Versprechen'), 'Hydrofacial LP must keep expectation-setting visible');
assert(lp.includes('id={LEAD_FORM_ID}'), 'Hydrofacial LP must include a lead form anchor');
assert(lp.includes("const LEAD_FORM_TARGET_ID = 'anfrage-form'"), 'Hydrofacial LP must define a direct form anchor target');
assert(lp.includes('href={`#${LEAD_FORM_TARGET_ID}`}'), 'Hydrofacial LP lead CTAs must scroll directly to the form');
assert(lp.includes('id={LEAD_FORM_TARGET_ID}'), 'Hydrofacial LP form must expose the direct anchor id');
assert(lp.includes('class="lp-lead-form" action="/api/contact" method="post"'), 'Hydrofacial LP must submit the lead form through the existing contact API');
assert(lp.includes('name="skinGoal"'), 'Hydrofacial LP lead form must ask for the skin goal');
assert(lp.includes('name="preferredCallbackTime"'), 'Hydrofacial LP lead form must ask for preferred timing');
assert(lp.includes('name="phone"'), 'Hydrofacial LP lead form must ask for phone or WhatsApp');
assert(lp.includes('name="email"'), 'Hydrofacial LP lead form must include email');
assert(lp.includes('name="privacyConsent"'), 'Hydrofacial LP lead form must keep privacy consent');
assert(lp.includes('lp-mobile-sticky'), 'Hydrofacial LP must include a mobile sticky CTA bar');
assert(lp.includes('Termin anfragen') && lp.includes('WhatsApp'), 'Hydrofacial LP sticky CTA must expose lead and WhatsApp actions');
assert(lp.includes('WhatsAppButton'), 'Hydrofacial LP must use the reusable WhatsApp CTA component');
assert(lp.includes('Wie viele Sitzungen sind sinnvoll?'), 'Hydrofacial LP FAQ must address session expectations');
assert(lp.includes('Muss ich schon wissen, ob Hydrofacial oder Microneedling besser für mich ist?'), 'Hydrofacial LP FAQ must address treatment uncertainty');
assert(lp.includes('Wann sollte ich den Termin verschieben?'), 'Hydrofacial LP FAQ must address suitability and safety objections');
assert(lp.includes('FAQAccordion items={faqs}'), 'Hydrofacial LP must include the FAQ accordion');
assert(lp.includes('TrustStrip variant="promises"'), 'Hydrofacial LP must include a trust/quality strip');
assert(lp.includes("bookingLinkForService(BOOKING_SERVICE)"), 'Hydrofacial LP must route booking through the existing /termin/ bridge');
assert(lp.includes("data-treatment=\"Hydrofacial + Microneedling\""), 'Hydrofacial LP CTAs must expose the treatment for tracking');
assert(lp.includes('window.bflTracking?.trackLead'), 'Hydrofacial LP must track lead form submits when analytics consent allows it');
assert(!lp.includes('garantiert'), 'Hydrofacial LP must avoid guaranteed-result claims');
assert(!lp.includes('schmerzfrei'), 'Hydrofacial LP must avoid unsupported pain-free claims');
assert(!lp.includes('keine Ausfallzeit'), 'Hydrofacial LP must avoid no-downtime claims');
assert(!lp.includes('Poren verschwinden'), 'Hydrofacial LP must avoid guaranteed pore claims');
assert(!lp.includes('Falten weg'), 'Hydrofacial LP must avoid unsupported wrinkle claims');
assert(!lp.includes('Hydra4Face') && !lp.includes('hydra4face'), 'Hydrofacial LP must not use the device-brand term');

assert(termin.includes('hydrafacial-microneedling-aktion'), 'Booking bridge must recognize the Hydrofacial campaign offer parameter');
assert(termin.includes('Hydrofacial + Microneedling für CHF 170 statt CHF 250'), 'Booking bridge must expose Hydrofacial promo context to users');
assert(!termin.includes('hydra4face-microneedling-aktion'), 'Booking bridge must not keep the old hydra4face offer parameter');

assert(landingPage.includes('og:title'), 'Landing page layout must expose Open Graph title metadata');
assert(landingPage.includes('twitter:card'), 'Landing page layout must expose Twitter card metadata');
assert(
  marketingConsent.includes('bfl-consent-visible') && marketingConsent.includes('bfl-consent-hidden'),
  'Marketing consent must expose visible/hidden state so mobile sticky CTAs do not fight the banner',
);

assert(tracking.includes("'/lp/hydrafacial-microneedling/'"), 'Tracking must register the Hydrofacial campaign route');
assert(tracking.includes("content_name: 'Hydrofacial Microneedling Aktion'"), 'Tracking must name the Hydrofacial ViewContent event');
assert(tracking.includes('value: 170'), 'Tracking must send CHF 170 as the ViewContent value');
assert(tracking.includes('trackLead: typeof trackLead'), 'Tracking helper must expose trackLead for the LP form');
assert(!tracking.includes("'/lp/hydra4face-microneedling/'"), 'Tracking must not keep the old hydra4face campaign route');

console.log('[ok] Hydrofacial + Microneedling LP offer, metadata, bridge, and tracking are aligned.');
