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
  ['Hydro', 'facial'].join(''),
  ['Hydro', 'Facial'].join(''),
  ['Hydro ', 'Facial'].join(''),
  ['hydro', 'facial'].join(''),
  ['Hydra', 'Facial'].join(''),
  ['Hydra', 'facial'].join(''),
  ['Hydra ', 'Facial'].join(''),
  ['hydra', 'facial'].join(''),
];

for (const spelling of previousTreatmentSpellings) {
  assert(!lp.includes(spelling), 'Aquafacial LP must not render the previous treatment spelling');
  assert(!termin.includes(spelling), 'Booking bridge must not render the previous treatment spelling');
  assert(!tracking.includes(spelling), 'Tracking metadata must not render the previous treatment spelling');
}

assert(lp.includes('const PROMO_PRICE = 170'), 'Aquafacial LP must define CHF 170 promo price');
assert(lp.includes('const REGULAR_PRICE = 250'), 'Aquafacial LP must define CHF 250 regular price');
assert(lp.includes("const DURATION_LABEL = '1 Std. 30 Min.'"), 'Aquafacial LP must show the requested duration label');
assert(lp.includes("const OFFER_SLUG = 'aquafacial-microneedling-aktion'"), 'Aquafacial LP must use the Aquafacial offer slug');
assert(lp.includes('Aquafacial + Microneedling'), 'Aquafacial LP must name the treatment clearly');
assert(lp.includes('CHF {PROMO_PRICE}') || lp.includes('CHF ${PROMO_PRICE}'), 'Aquafacial LP must render the promo price');
assert(lp.includes('statt CHF {REGULAR_PRICE}') || lp.includes('statt CHF ${REGULAR_PRICE}'), 'Aquafacial LP must render the original price anchor');

// One offer, one audience, one primary action (2026-10-10): the request form is the primary CTA everywhere,
// WhatsApp is the secondary path and Treatwell booking only a text link (after success, FAQ, closing band).
assert(lp.includes("const PRIMARY_CTA_LABEL = 'Unverbindlich Termin anfragen'"), 'Aquafacial LP must define the request form as the one primary CTA');
assert(lp.includes("const STICKY_CTA_LABEL = 'Termin anfragen'"), 'Aquafacial LP must define the short sticky CTA label');
assert(lp.includes("const SECONDARY_CTA_LABEL = 'Per WhatsApp anfragen'"), 'Aquafacial LP must define the WhatsApp secondary CTA label');
assert(lp.includes("const BOOKING_CTA_LABEL = 'Direkt online buchen'"), 'Aquafacial LP must keep Treatwell as a tertiary booking link');
assert(!lp.includes('Jetzt Termin buchen'), 'Aquafacial LP must not keep the old booking-first primary CTA');
assert(!lp.includes('Hautanalyse & Termin anfragen'), 'Aquafacial LP must not keep the old secondary lead CTA label');
assert(!lp.includes('Kombi-Behandlung buchen'), 'Aquafacial LP must not keep the old booking CTA label');
assert(!lp.includes('Terminwunsch senden'), 'Aquafacial LP submit button must use the one primary CTA label');
for (const location of ['lp_hero_lead', 'offer_section_lead', 'trust_section_lead', 'lp_final_lead']) {
  assert(
    lp.includes(`data-button-location="${location}" data-lead-cta>{PRIMARY_CTA_LABEL}</a>`),
    `Aquafacial LP ${location} CTA must scroll to the form with the one primary CTA label`,
  );
}
assert(lp.includes('<span data-submit-label>{PRIMARY_CTA_LABEL}</span>'), 'Aquafacial LP submit button must carry the primary CTA label');
assert(lp.includes('data-button-location="sticky_lead" data-lead-cta>{STICKY_CTA_LABEL}</a>'), 'Aquafacial LP sticky bar must carry the short request CTA');
assert(!lp.includes('data-button-location="lp_hero_booking"'), 'Aquafacial LP hero must not carry a booking CTA');
assert(lp.includes('data-button-location="form_success_booking">{BOOKING_CTA_LABEL}</a>'), 'Treatwell booking must be offered after a successful request');
assert(lp.includes('data-button-location="lp_final_booking">{BOOKING_CTA_LABEL}</a>'), 'Treatwell booking must stay available as a text link in the closing band');
assert(lp.includes('Kann ich auch direkt online buchen?'), 'Aquafacial LP FAQ must explain the online booking path');
assert((lp.match(/data-lead-cta/g) || []).length >= 5, 'Every section must end with the primary request CTA');

// Hero: outcome-led H1 with the copper accent word, lead with duration and contents, price line, bullets on every screen.
assert(lp.includes('Aktion: Aquafacial + Microneedling in Zürich'), 'Aquafacial LP hero eyebrow must use the requested action-focused copy');
assert(
  lp.includes('<p class="eyebrow eyebrow--rule lp-eyebrow">Aktion: Aquafacial + Microneedling in Zürich</p>'),
  'Aquafacial LP hero eyebrow must use the shared eyebrow style',
);
assert(
  lp.includes('Aquafacial + Microneedling: frischer <em>Glow</em>, glatter wirkende Haut</h1>'),
  'Aquafacial LP must use the treatment-led hero headline with one copper accent word',
);
assert(!lp.includes('Ganzheitliche Kombi-Behandlung'), 'Aquafacial LP must not keep the abstract four-line headline');
assert(!/\.lp-title\s*\{[^}]*font-weight:\s*[5-9]00/.test(lp), 'Aquafacial LP hero headline must keep the 400 display weight');
assert(
  /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.lp-subtitle\s*\{\s*order:\s*3;/.test(lp)
    && /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.lp-hero-media\s*\{\s*order:\s*7;/.test(lp),
  'Aquafacial LP stacked hero must show lead, price, CTA and rating before the photo band',
);
assert(!/\.lp-hero-bullets\s*\{[^}]*display:\s*none;/.test(lp), 'Aquafacial LP hero bullets must stay visible on phones');
assert(lp.includes('href={TREATWELL_URL}'), 'Aquafacial LP rating line and trust facts must link to the Treatwell source');
assert(lp.includes('4,8</strong> aus 248+ Bewertungen auf Treatwell'), 'Aquafacial LP must show the rating line under the hero CTAs');

// Styling: tokens only, pill buttons, no inline styles.
assert(!/#[0-9a-f]{3,8}\b/i.test(lp.split('<style>')[1] ?? ''), 'Aquafacial LP styles must use design tokens instead of hard-coded colours');
assert(!lp.includes('pill-btn'), 'Aquafacial LP CTAs must use the .btn system');
assert(!/\sstyle=["{]/.test(lp), 'Aquafacial LP markup must not use inline styles');
assert(!/font-style:\s*italic/.test(lp), 'Aquafacial LP must not use italics');
assert(!/text-transform:\s*uppercase/.test(lp), 'Aquafacial LP labels must stay in sentence case');

// Section flow: included, why the combination (three photo steps with fit lists), expectations, trust, form, FAQ, location, closing band.
assert(lp.includes('Das ist im Kombi-Angebot enthalten'), 'Aquafacial LP must list what is included');
assert(!lp.includes('OfferBox'), 'Aquafacial LP must not repeat the price in an offer card');
assert(!lp.includes('TrustStrip'), 'Aquafacial LP must not carry the generic promises strip');
assert(!lp.includes('Wenn Ihre Haut mehr braucht als Pflege zu Hause'), 'Aquafacial LP must not keep the separate desire grid');
assert(lp.includes('Warum Aquafacial und Microneedling zusammen sinnvoll sein können'), 'Aquafacial LP must explain why Aquafacial and Microneedling are combined');
assert(lp.includes('Aquafacial bereitet vor') && lp.includes('Microneedling setzt Mikroimpulse') && lp.includes('Abschlusspflege beruhigt'), 'Aquafacial LP must show the three steps of the appointment');
assert(lp.includes('Müde oder fahl wirkende Haut') && lp.includes('Unruhige Hautstruktur'), 'Aquafacial LP steps must say which skin situations each treatment step is for');
assert(!lp.includes('Zwei Behandlungsschritte, ein klares Hautziel'), 'Aquafacial LP must not keep the duplicate two-step section');
assert(!lp.includes('aquafacial-microneedling-infografik-zuerich.webp'), 'Aquafacial LP must not render the infographic (it prints the previous treatment name and a foreign palette)');
assert(lp.includes('hero-aquafacial-microneedling-zuerich.webp'), 'Aquafacial LP must use the optimized hero WebP image');
assert(lp.includes('aquafacial-close-up-zuerich.webp'), 'Aquafacial LP must use the optimized Aquafacial close-up image');
assert(lp.includes('post-treatment-glow-zuerich.webp'), 'Aquafacial LP must use the optimized post-treatment glow image');
assert(lp.includes('hautanalyse-beratung-zuerich.webp'), 'Aquafacial LP must use the optimized Hautanalyse image');
assert(lp.includes('abschlusspflege-aftercare-zuerich.webp'), 'Aquafacial LP must use the optimized aftercare image');
assert(lp.includes('microneedling-close-up-zuerich.webp'), 'Aquafacial LP must use the optimized Microneedling close-up image');
assert(lp.includes('personal-treatment-zuerich.webp'), 'Aquafacial LP must use the optimized personal treatment image');
assert(lp.includes('Aquafacial und Microneedling Behandlung bei Beauty Face Lift Zürich'), 'Aquafacial LP hero image must use meaningful German alt text');
assert(lp.includes('loading="eager"') && lp.includes('fetchpriority="high"'), 'Aquafacial LP must prioritize only the hero image');
assert((lp.match(/loading="eager"/g) || []).length === 1, 'Aquafacial LP must not eagerly load non-hero images');
assert(lp.includes('Realistische Ergebnisse statt übertriebener Versprechen'), 'Aquafacial LP must keep expectation-setting visible');
assert(lp.includes('Persönliche Behandlung statt Standardprogramm'), 'Aquafacial LP must include the trust section before the form');
assert(lp.includes('<ul class="lp-checks lp-facts"'), 'Aquafacial LP trust facts must be one hairline row, not a second proof grid');
assert(!lp.includes('lp-proof-grid'), 'Aquafacial LP must not repeat the proof numbers in a grid');
const stepsIndex = lp.indexOf('id="lp-steps-title"');
const expectationIndex = lp.indexOf('id="lp-expectation-title"');
const trustIndex = lp.indexOf('id="lp-trust-title"');
const formIndex = lp.indexOf('id={LEAD_FORM_TARGET_ID}');
const faqIndex = lp.indexOf('id="lp-faq-title"');
assert(stepsIndex < expectationIndex && expectationIndex < trustIndex && trustIndex < formIndex && formIndex < faqIndex, 'Aquafacial LP must run steps, expectations, trust, form, then FAQ');
assert(!lp.includes('BookingCta'), 'Aquafacial LP must not carry a separate booking panel');
assert(!lp.includes('class="steps'), 'Aquafacial LP must not use the boxed step cards');
assert(lp.includes('<main class="lp-page" id="main-content">') && landingPage.includes('class="skip-link"'), 'Aquafacial LP must be reachable through the layout skip link');

// Lead form: two required inputs plus consent, inline success, Lead only after the server accepted the request.
assert(lp.includes('id={LEAD_FORM_ID}'), 'Aquafacial LP must include a lead form anchor');
assert(lp.includes("const LEAD_FORM_TARGET_ID = 'anfrage-form'"), 'Aquafacial LP must define a direct form anchor target');
assert(lp.includes('href={`#${LEAD_FORM_ID}`}'), 'Aquafacial LP CTAs must scroll to the form section');
assert(lp.includes('class="lp-lead-form" action="/api/contact" method="post" data-lead-form novalidate'), 'Aquafacial LP must submit the lead form through the existing contact API');
assert(lp.includes('<ol class="lp-next-steps"') && lp.includes('Sie senden Ihren Terminwunsch'), 'Aquafacial LP form must explain the next steps in two lines');
assert(lp.includes('name="name" type="text" maxlength="120" autocomplete="name" required'), 'Aquafacial LP lead form must require the name');
assert(lp.includes('name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+41 79 000 00 00" required'), 'Aquafacial LP lead form must require phone or WhatsApp with a tel keyboard');
assert(lp.includes('name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@email.ch" aria-describedby="aqua-lead-email-error" />'), 'Aquafacial LP lead form must keep email optional');
assert(lp.includes('name="skinGoal"') && !lp.includes('name="skinGoal" data-lead-goal required'), 'Aquafacial LP lead form must ask for the skin goal as an optional field');
assert(lp.includes('name="preferred_date" type="date"'), 'Aquafacial LP lead form must offer an optional appointment date');
assert(!lp.includes('name="preferredContactMethod"'), 'Aquafacial LP lead form must not ask for a contact method (phone is required)');
assert(!lp.includes('name="preferredCallbackTime"'), 'Aquafacial LP lead form must not require a callback time select');
assert(lp.includes("const CONTACT_SOURCE = 'aquafacial-microneedling-lp'") && lp.includes('name="source" value={CONTACT_SOURCE}'), 'Aquafacial LP lead form must identify its source for contact handling');
assert(lp.includes('name="privacyConsent"'), 'Aquafacial LP lead form must keep privacy consent');
assert(lp.includes('name="campaign" value={CONTACT_CAMPAIGN}') && lp.includes("const CONTACT_CAMPAIGN = 'aquafacial_microneedling'"), 'Aquafacial LP form must post the Turnstile-exempt campaign');
assert(!lp.includes('cf-turnstile') && !lp.includes('challenges.cloudflare.com/turnstile'), 'Aquafacial LP lead form must not depend on Turnstile rendering');
assert(lp.includes('class="lp-honeypot" aria-hidden="true" inert'), 'Honeypot must be hidden from users and assistive tech');
for (const field of ['name', 'phone', 'email', 'privacyConsent']) {
  assert(lp.includes(`data-field-error="${field}"`), `Aquafacial LP form must show a field-level error for ${field}`);
}
assert(lp.includes('role="alert"'), 'Aquafacial LP form must announce send errors');
assert(lp.includes('Vielen Dank! Ihre Anfrage ist eingegangen.'), 'Aquafacial LP form must show an inline success state instead of leaving the page');
const fetchIndex = lp.indexOf('const response = await fetch(form.action');
const responseOkIndex = lp.indexOf('if (!response.ok)');
const successShownIndex = lp.indexOf('success.hidden = false');
const leadTrackingIndex = lp.indexOf('window.bflTracking?.trackLead?.({');
assert(fetchIndex !== -1 && responseOkIndex > fetchIndex && successShownIndex > responseOkIndex && leadTrackingIndex > successShownIndex, 'Aquafacial LP must send JSON, check response.ok, show success and only then count the Lead');
assert(!lp.includes('queueLead'), 'Aquafacial LP no longer posts natively, so it must not queue the lead for /kontakt/danke/');
assert(lp.includes("source: 'aquafacial_microneedling_lp_form'") && lp.includes('value: 170'), 'Aquafacial LP Lead must carry its source and the CHF 170 value');
assert(lp.includes('Keine Online-Zahlung. Das Studio meldet sich persönlich bei Ihnen.'), 'Aquafacial LP form must show the no-payment microcopy under the submit button');
assert(/\.lp-lead-form input:not\(\[type='checkbox'\]\),[\s\S]*?border-radius:\s*var\(--radius-input\)/.test(lp), 'Aquafacial LP form fields must use the input radius token');

// Floating UI: sticky request bar after the hero, never over the form or the consent banner; floating WhatsApp disc.
assert(lp.includes('lp-mobile-sticky'), 'Aquafacial LP must include a mobile sticky CTA bar');
assert(lp.includes('data-mobile-sticky inert'), 'Aquafacial LP sticky CTA must start inert before the hero leaves the viewport');
assert(lp.includes('lp-sticky-visible'), 'Aquafacial LP sticky CTA must be revealed by a scroll-gated body state');
assert(lp.includes("sticky.inert = !visible"), 'Aquafacial LP sticky CTA must leave the tab order while hidden');
assert(lp.includes('body.lp-sticky-visible:not(.bfl-consent-visible):not(.lp-lead-success)'), 'Aquafacial LP sticky bar must hide while consent is open and after success');
assert(lp.includes('lp-form-in-view'), 'Aquafacial LP floating UI must step aside while the form is on screen');
assert(lp.includes('<WhatsAppButton variant="sticky"'), 'Aquafacial LP must use the shared floating WhatsApp disc');
assert(lp.includes('WhatsAppButton'), 'Aquafacial LP must use the reusable WhatsApp CTA component');

// FAQ, location (click-to-load map), claims.
assert(lp.includes('Wie viele Sitzungen sind sinnvoll?'), 'Aquafacial LP FAQ must address session expectations');
assert(lp.includes('Muss ich schon wissen, ob Aquafacial oder Microneedling besser für mich ist?'), 'Aquafacial LP FAQ must address treatment uncertainty');
assert(lp.includes('Wann sollte ich den Termin verschieben?'), 'Aquafacial LP FAQ must address suitability and safety objections');
assert(lp.includes('Muss ich jetzt schon bezahlen?'), 'Aquafacial LP FAQ must answer the payment objection');
assert(lp.includes('FAQAccordion items={faqs}'), 'Aquafacial LP must include the FAQ accordion');
assert(lp.includes('Bahnhofstrasse 94 · Zürich'), 'Aquafacial LP location section must make the address scannable');
assert(!lp.includes('>Studio & Anfahrt</p>'), 'Aquafacial LP location section must not carry a decorative overline');
assert(lp.includes('data-map-embed={googleMapsEmbedUrl}') && lp.includes('data-map-load') && !lp.includes('<iframe'), 'Aquafacial LP map must load only on request (click-to-load, as on /kontakt/)');
assert(lp.includes('Route in Google Maps öffnen'), 'Aquafacial LP location section must include a Google Maps route link');
assert(lp.includes('id="studio-map"'), 'Aquafacial LP Google Maps panel must expose a direct anchor');
assert(lp.includes('OPENING_HOURS'), 'Aquafacial LP location section must reuse shared opening hours');
assert(lp.includes("bookingLinkForService(BOOKING_SERVICE)"), 'Aquafacial LP must route booking through the existing /termin/ bridge');
assert(lp.includes("data-treatment={BOOKING_SERVICE}"), 'Aquafacial LP CTAs must expose the treatment for tracking');
assert(!lp.includes('garantiert'), 'Aquafacial LP must avoid guaranteed-result claims');
assert(!lp.includes('schmerzfrei'), 'Aquafacial LP must avoid unsupported pain-free claims');
assert(!lp.includes('keine Ausfallzeit'), 'Aquafacial LP must avoid no-downtime claims');
assert(!lp.includes('Poren verschwinden'), 'Aquafacial LP must avoid guaranteed pore claims');
assert(!lp.includes('Falten weg'), 'Aquafacial LP must avoid unsupported wrinkle claims');
assert(!lp.includes('straffere') && !lp.includes('regenerierte'), 'Aquafacial LP must avoid firming and regeneration claims');
// Copy only: single-line code (imports, URL constants) is dropped before the du/Sie check.
assert(!/\b(du|dich|dir|dein|deine|deinen|deiner)\b/i.test(lp.split('<style>')[0].replace(/^(import|const) .*$/gm, '')), 'Aquafacial LP must address visitors with "Sie"');
assert(lp.includes("absoluteUrl('/lp/aquafacial-microneedling/#product')"), 'Structured product id must use the Aquafacial LP slug');
assert(lp.includes("absoluteUrl('/lp/aquafacial-microneedling/')"), 'Structured product offer URL must use the Aquafacial LP slug');

assert(termin.includes('aquafacial-microneedling-aktion'), 'Booking bridge must recognize the Aquafacial campaign offer parameter');
assert(termin.includes('Aquafacial + Microneedling für CHF 170 statt CHF 250'), 'Booking bridge must expose Aquafacial promo context to users');
assert(termin.includes("'Aquafacial + Microneedling': 'TR4124140'"), 'Booking bridge must map Aquafacial + Microneedling to the Treatwell service detail id');
assert(termin.includes("target.hash = 'serviceDetails=' + encodeURIComponent(serviceDetailsId)"), 'Booking bridge must open the matching Treatwell service detail panel');
assert(!termin.includes(['hydro', 'facial-microneedling-aktion'].join('')), 'Booking bridge must not keep the old campaign offer parameter');
assert(!termin.includes(['hydra', 'facial-microneedling-aktion'].join('')), 'Booking bridge must not keep the old campaign offer parameter');

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
assert(tracking.includes('queueLead: typeof queueLead'), 'Tracking helper must keep queueLead for natively posted forms');
assert(
  /function settleQueuedLead\(\)[\s\S]*?removeItem\(PENDING_LEAD_KEY\)[\s\S]*?!window\.location\.pathname\.startsWith\('\/kontakt\/danke\/'\)\) return;[\s\S]*?trackLead\(payload\)/.test(tracking)
    && /trackLandingOrTreatmentView\(\);\s*settleQueuedLead\(\);/.test(tracking),
  'Every page load must settle the queued lead: only /kontakt/danke/ sends it, any other page drops it',
);
assert(!tracking.includes(["'/lp/", 'hydro', "facial-microneedling/'"].join('')), 'Tracking must not keep the old campaign route');
assert(!tracking.includes(["'/lp/", 'hydra', "facial-microneedling/'"].join('')), 'Tracking must not keep the old campaign route');

console.log('[ok] Aquafacial + Microneedling LP offer, metadata, bridge, and tracking are aligned.');
