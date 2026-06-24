import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/aquafacial/index.astro', import.meta.url),
  contactRoute: new URL('../worker/routes/contact.ts', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
  landingPage: new URL('../src/layouts/LandingPage.astro', import.meta.url),
  docs: new URL('../docs/current/AQUAFACIAL-LANDING-PAGE-LEAD-GEN.md', import.meta.url),
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

const [lp, contactRoute, tracking, landingPage, docs] = await Promise.all([
  readNamedFile('lp'),
  readNamedFile('contactRoute'),
  readNamedFile('tracking'),
  readNamedFile('landingPage'),
  readNamedFile('docs'),
]);

const forbiddenLpTerms = [
  'Hydrofacial',
  'HydroFacial',
  'Hydro Facial',
  'Hydrafacial',
  'HydraFacial',
  'Hydra Facial',
];

const leadFormFields = [
  'name="name"',
  'name="phone"',
  'name="email"',
  'name="privacy_consent"',
  'name="preferred_time"',
  'name="preferred_date"',
  'name="campaign"',
  'name="offer"',
  'name="landing_page"',
  'name="page_path"',
  'name="page_url"',
  'name="referrer"',
  'name="utm_source"',
  'name="utm_medium"',
  'name="utm_campaign"',
  'name="utm_content"',
  'name="utm_term"',
  'name="fbclid"',
  'name="gclid"',
  'name="msclkid"',
];

const removedLeadFormFields = [
  'name="preferred_contact_method"',
  'name="skin_concern"',
  'name="message"',
];

const requiredAnchorLocations = [
  'lp_hero',
  'what_section',
  'trust_section',
  'final_cta',
  'mobile_sticky_lead',
];

assert(lp.includes('const PROMO_PRICE = 99'), 'Aquafacial LP must define CHF 99 promo price');
assert(lp.includes('const REGULAR_PRICE = 180'), 'Aquafacial LP must define CHF 180 regular price');
assert(lp.includes("const OFFER_LABEL = 'Aquafacial Aktion'"), 'Aquafacial LP must use the requested treatment offer name');
assert(lp.includes("const CAMPAIGN = 'aquafacial_aktion'"), 'Aquafacial LP must identify the campaign as aquafacial_aktion');
assert(lp.includes("const OFFER_SLUG = 'aquafacial_aktion_99'"), 'Aquafacial LP must identify the offer as aquafacial_aktion_99');
assert(lp.includes('Aquafacial Aktion in Zürich: Frischer Glow für CHF 99 statt CHF 180'), 'Aquafacial LP must use the approved H1');
assert(lp.includes('Aquafacial Aktion Zürich | CHF 99 statt CHF 180 | Beauty Face Lift'), 'Aquafacial LP must set the requested SEO/OG title');
assert(lp.includes('Professionelle Aquafacial Behandlung in Zürich: Cleansing, Fruchtsäurepeeling und Hyaluron Booster für CHF 99 statt CHF 180. Jetzt unverbindlich anfragen.'), 'Aquafacial LP must set the requested meta description');
assert(landingPage.includes('<link rel="canonical" href={canonicalUrl}>'), 'Landing page layout must expose canonical metadata');
assert(landingPage.includes('og:title'), 'Landing page layout must expose Open Graph metadata');

assert(lp.includes('id="aquafacial-lead-form"'), 'Aquafacial LP must expose the lead-form anchor');
assert(lp.includes('action="/api/contact"'), 'Aquafacial lead form must post to the existing contact backend');
assert(lp.includes('method="post"'), 'Aquafacial lead form must support server-side form submission');
assert(lp.includes('data-aquafacial-lead-form'), 'Aquafacial LP must initialize campaign-specific lead form behavior');
for (const field of leadFormFields) {
  assert(lp.includes(field), `Aquafacial lead form must include ${field}`);
}
for (const field of removedLeadFormFields) {
  assert(!lp.includes(field), `Aquafacial lead form must not include removed field ${field}`);
}
assert(lp.includes('Vor- und Nachname<span aria-hidden="true">*</span>'), 'Aquafacial lead form must use the requested name label');
assert(!lp.includes('Vorname und Name'), 'Aquafacial lead form must not use the old name label');
assert(!lp.includes('Wie dürfen wir dich kontaktieren?'), 'Aquafacial lead form must remove the contact-method question');
assert(lp.includes('Wann erreichen wir dich telefonisch?'), 'Aquafacial lead form must use the requested callback-time label');
assert(lp.includes('<select id="aquafacial-time" name="preferred_time">'), 'Aquafacial callback-time field must be an optional dropdown');
for (const option of ['Vormittags', 'Mittags', 'Nachmittags']) {
  assert(lp.includes(`<option>${option}</option>`), `Aquafacial callback-time dropdown must include ${option}`);
}
assert(lp.includes('<label for="aquafacial-date">Terminwunsch</label>'), 'Aquafacial lead form must include the requested appointment-date label');
assert(lp.includes('id="aquafacial-date" name="preferred_date" type="date"'), 'Aquafacial appointment preference must use a native date calendar field');
assert(!lp.includes('Was möchtest du verbessern?'), 'Aquafacial lead form must remove the skin concern question');
assert(!lp.includes('Nachricht, falls du Fragen hast'), 'Aquafacial lead form must remove the message question');

assert(lp.includes('Keine Online-Zahlung auf dieser Seite'), 'Aquafacial LP must reduce payment anxiety near the CTA/form');
assert(lp.includes('Beauty Face Lift meldet sich persönlich'), 'Aquafacial LP must promise personal studio follow-up');
assert(lp.includes('Fragen vor der Terminbestätigung möglich'), 'Aquafacial LP must reassure visitors that questions are possible before confirmation');
assert(lp.includes('Deine Anfrage ist unverbindlich'), 'Aquafacial LP must clarify the form request is non-binding');
assert(lp.includes('Ich habe die') && lp.includes('Datenschutzerklärung') && lp.includes('gelesen und bin einverstanden'), 'Aquafacial LP must include privacy consent copy');
assert(lp.includes('href="/datenschutz/"'), 'Privacy consent must link to the existing privacy policy');
for (const location of ['lp_hero', 'what_section', 'trust_section', 'final_cta']) {
  assert(
    lp.includes(`data-button-location="${location}" data-aquafacial-scroll>Jetzt Termin sichern</a>`),
    `Aquafacial LP ${location} CTA must use the requested main CTA copy`,
  );
}
assert(lp.includes('<span data-submit-label>Jetzt Termin sichern</span>'), 'Aquafacial form submit CTA must use the requested main CTA copy');
assert(lp.includes("submitLabel.textContent = 'Jetzt Termin sichern'"), 'Aquafacial form submit reset must restore the requested main CTA copy');
assert(lp.includes('data-button-location="mobile_sticky_lead" data-aquafacial-scroll>Termin anfragen</a>'), 'Aquafacial floating bar CTA must use the requested sticky CTA copy');
assert(lp.includes('Anfrage wird gesendet'), 'Aquafacial form must expose a loading state');
assert(lp.includes('Vielen Dank! Deine Anfrage ist eingegangen.'), 'Aquafacial form must expose the requested success message');
assert(lp.includes('Leider konnte deine Anfrage gerade nicht gesendet werden.'), 'Aquafacial form must expose the requested error message');
assert(lp.includes('Direkt online buchen'), 'Treatwell CTA must be available only as a secondary action after success/lower on page');
assert(lp.includes('https://buchung.treatwell.ch/ort/beauty-face-lift/?service=Aquafacial+Aktion&offer=aquafacial-aktion&price=99#serviceDetails=TR4122487'), 'After-submit Treatwell link must use the requested destination');
const fetchIndex = lp.indexOf('const response = await fetch(form.action');
const responseOkIndex = lp.indexOf('if (!response.ok)');
const successShownIndex = lp.indexOf('success.hidden = false');
const leadTrackingIndex = lp.indexOf('trackAquafacialLeadSubmit();');
assert(fetchIndex !== -1, 'Aquafacial form must submit to the backend before showing success');
assert(responseOkIndex > fetchIndex, 'Aquafacial form must check the backend response before showing success');
assert(successShownIndex > responseOkIndex, 'Aquafacial form must show success only after response.ok');
assert(leadTrackingIndex > successShownIndex, 'Aquafacial Lead tracking must fire only after the success UI is shown');
assert(!lp.includes('PUBLIC_TURNSTILE_SITE_KEY'), 'Aquafacial LP must not depend on a public Turnstile site key');
assert(!lp.includes('cf-turnstile'), 'Aquafacial LP lead form must not render a Turnstile widget');
assert(!lp.includes('challenges.cloudflare.com/turnstile/v0/api.js'), 'Aquafacial LP lead form must not load the Turnstile widget script');
assert(contactRoute.includes('TURNSTILE_OPTIONAL_CAMPAIGNS'), 'Contact route must explicitly exempt selected campaigns from Turnstile');
assert(contactRoute.includes('TURNSTILE_OPTIONAL_CAMPAIGNS.has(data.campaign)'), 'Aquafacial campaign Turnstile exemption must be campaign-based');
assert(contactRoute.includes('preferredDate'), 'Contact route must accept the optional preferred date field');
assert(contactRoute.includes('preferred_date'), 'Contact route must accept preferred_date from the form payload');
assert(!contactRoute.includes('aquafacialLead && !data.preferredContactMethod'), 'Aquafacial campaign leads must not require a removed contact-method field');
assert(lp.includes('CONTACT_PHONE'), 'Aquafacial LP must reuse the shared WhatsApp phone number');
assert(lp.includes('new URLSearchParams({ text: WHATSAPP_MESSAGE })'), 'Aquafacial LP must build the WhatsApp prefilled message safely');
assert(lp.includes('class="lp-floating-whatsapp wa-sticky"'), 'Aquafacial LP must include the floating WhatsApp CTA and opt out of global text-link styling');
assert(lp.includes('aria-label="Per WhatsApp Termin zur Aquafacial Aktion anfragen"'), 'Floating WhatsApp CTA must have an accessible label');
assert(lp.includes('data-button-location="floating_whatsapp"'), 'Floating WhatsApp CTA must identify its placement');
assert(lp.includes('data-aquafacial-whatsapp'), 'Floating WhatsApp CTA must opt into campaign-specific tracking');
assert(lp.includes('rel="noopener noreferrer"'), 'External WhatsApp links must use noopener noreferrer');
assert(lp.includes('aria-hidden="true" focusable="false"'), 'Floating WhatsApp icon must be hidden from assistive tech');
assert(lp.includes('viewBox="0 0 24 24"') && lp.includes('M17.472 14.382'), 'Floating WhatsApp icon must use the WhatsApp logo SVG');
assert(
  lp.includes('position: fixed')
    && lp.includes('right: calc(24px + env(safe-area-inset-right, 0px))')
    && lp.includes('bottom: calc(24px + env(safe-area-inset-bottom, 0px))'),
  'Floating WhatsApp CTA must be fixed near the bottom-right edge',
);
assert(lp.includes('background: #25d366'), 'Floating WhatsApp CTA must use WhatsApp green styling');
assert(lp.includes('focus-visible'), 'Floating WhatsApp CTA must expose a visible keyboard focus state');
assert(lp.includes('class="lp-honeypot" aria-hidden="true" inert'), 'Honeypot must be hidden from users and assistive tech');
assert(lp.includes('tabindex="-1" autocomplete="off" aria-hidden="true"'), 'Honeypot input must not be keyboard focusable or announced');

for (const location of requiredAnchorLocations) {
  assert(lp.includes(`data-button-location="${location}"`), `Aquafacial LP must tag ${location}`);
}
assert(lp.includes('href="#aquafacial-lead-form"'), 'Primary CTAs must scroll to the lead-form anchor');
assert(!lp.includes('lp-hero-primary" href={bookingHref}'), 'Hero primary CTA must not point to Treatwell/booking');
assert(!lp.includes('Buchung über Treatwell'), 'Main page copy must not promote Treatwell as the primary flow');
assert(!lp.includes('So funktioniert Ihre Buchung'), 'Old Treatwell-first booking flow must be replaced');
assert(lp.includes('So funktioniert deine Anfrage'), 'Aquafacial LP must explain the lead request flow');
assert(lp.includes('Warum Kundinnen die Aquafacial Behandlung anfragen'), 'Aquafacial LP must include lead-generation benefits');
assert(lp.includes('Premium Kosmetikstudio an der Bahnhofstrasse 94'), 'Aquafacial LP must include the trust/location section');
assert(lp.includes('Häufige Fragen zur Aquafacial Aktion'), 'Aquafacial LP must include the requested FAQ heading');
assert(lp.includes('data-aquafacial-sticky'), 'Aquafacial LP must include a mobile sticky lead CTA');
assert(lp.includes('body.bfl-consent-visible'), 'Mobile sticky CTA must hide while the cookie consent banner is visible');
assert(lp.includes('data-aquafacial-success'), 'Mobile sticky CTA must hide after successful lead submission');

assert(lp.includes('trackAquafacialLeadSubmit'), 'Aquafacial LP must call one success-only tracking helper');
assert(tracking.includes('trackAquafacialLeadSubmit'), 'Tracking module must export the Aquafacial lead helper');
assert(tracking.includes('aquafacial_lead_submit'), 'Tracking helper must push aquafacial_lead_submit');
assert(tracking.includes('trackAquafacialWhatsappClick'), 'Tracking module must export the floating WhatsApp helper');
assert(tracking.includes('aquafacial_whatsapp_click'), 'Tracking helper must push aquafacial_whatsapp_click');
assert(tracking.includes("placement = 'floating_whatsapp'"), 'Floating WhatsApp tracking must default to the floating_whatsapp placement');
assert(tracking.includes("content_name: 'Aquafacial Aktion WhatsApp'"), 'Floating WhatsApp tracking must use the requested Contact content name');
assert(tracking.includes("metaEventName: 'Contact'"), 'Floating WhatsApp tracking must use Meta Contact, not Lead');
assert(tracking.includes("'aquafacialWhatsapp' in link.dataset"), 'Floating WhatsApp links must avoid duplicate generic WhatsApp tracking');
assert(tracking.includes("campaign: 'aquafacial_aktion'"), 'Tracking helper must push the campaign identifier');
assert(tracking.includes("offer: 'aquafacial_aktion_99'"), 'Tracking helper must push the offer identifier');
assert(tracking.includes("content_name: 'Aquafacial Aktion'"), 'Tracking helper must name the Meta Lead content');
assert(tracking.includes("content_category: 'Beauty Treatment'"), 'Tracking helper must set the Meta content category');
assert(tracking.includes('value: 99'), 'Tracking helper must set the CHF 99 value');
assert(tracking.includes("currency: 'CHF'"), 'Tracking helper must set CHF currency');
assert(tracking.includes('aquafacialLeadTracked'), 'Tracking helper must prevent duplicate success events');

assert(contactRoute.includes('preferred_contact_method'), 'Contact route must accept the requested preferred_contact_method field');
assert(contactRoute.includes('privacy_consent'), 'Contact route must accept the requested privacy_consent field');
assert(contactRoute.includes('aquafacial_aktion'), 'Contact route must recognize Aquafacial campaign leads');
assert(contactRoute.includes('Neue Aquafacial Aktion Anfrage'), 'Contact route must use the requested Aquafacial notification subject');
assert(contactRoute.includes('utm_source'), 'Contact route must include attribution fields in lead handling');

assert(docs.includes('# Aquafacial Landing Page Lead Generation Update'), 'Implementation documentation must exist');
assert(docs.includes('PUBLIC_TURNSTILE_SITE_KEY'), 'Implementation docs must mention the production Turnstile site key dependency');
assert(docs.includes('dataLayer event: aquafacial_lead_submit'), 'Implementation docs must document the GTM event');
assert(docs.includes('dataLayer event: `aquafacial_whatsapp_click`'), 'Implementation docs must document the WhatsApp GTM event');
assert(docs.includes('Placement parameter: `floating_whatsapp`'), 'Implementation docs must document the floating WhatsApp placement');
assert(docs.includes('WhatsApp clicks do not call `trackAquafacialLeadSubmit()`'), 'Implementation docs must document tracking separation');
assert(docs.includes('Trigger type: Custom Event'), 'Implementation docs must document GTM trigger setup');
assert(docs.includes('only after successful form submission'), 'Implementation docs must document the tracking trigger condition');

for (const term of forbiddenLpTerms) {
  assert(!lp.includes(term), `Aquafacial LP must not use forbidden term "${term}"`);
}
assert(!lp.includes('Microneedling'), 'Aquafacial Aktion LP must not mention the combo treatment');
assert(!lp.includes('garantiert'), 'Aquafacial Aktion LP must avoid guaranteed-result claims');

console.log('[ok] Aquafacial lead-generation LP, form, backend, docs, and tracking are aligned.');
