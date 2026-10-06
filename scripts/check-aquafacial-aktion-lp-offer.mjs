import { readFile, stat } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/aquafacial/index.astro', import.meta.url),
  contactRoute: new URL('../worker/routes/contact.ts', import.meta.url),
  worker: new URL('../worker/index.ts', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
  landingPage: new URL('../src/layouts/LandingPage.astro', import.meta.url),
  resultsComponent: new URL('../src/components/lp/AquafacialResultsSection.astro', import.meta.url),
  docs: new URL('../docs/current/AQUAFACIAL-LANDING-PAGE-LEAD-GEN.md', import.meta.url),
};

const heroVideoAssets = {
  desktopPoster: new URL('../public/assets/lp-aquafacial/hero-poster-1080.webp', import.meta.url),
  mobilePoster: new URL('../public/assets/lp-aquafacial/hero-poster-720.webp', import.meta.url),
  desktopMp4: new URL('../public/assets/lp-aquafacial/hero-video.mp4', import.meta.url),
  mobileMp4: new URL('../public/assets/lp-aquafacial/hero-video-mobile.mp4', import.meta.url),
  desktopWebm: new URL('../public/assets/lp-aquafacial/hero-video.webm', import.meta.url),
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

const [lp, contactRoute, worker, tracking, landingPage, resultsComponent, docs] = await Promise.all([
  readNamedFile('lp'),
  readNamedFile('contactRoute'),
  readNamedFile('worker'),
  readNamedFile('tracking'),
  readNamedFile('landingPage'),
  readNamedFile('resultsComponent'),
  readNamedFile('docs'),
]);
const heroAssetStats = await Promise.all(
  Object.entries(heroVideoAssets).map(async ([name, url]) => [name, await stat(url)]),
);
const heroAssetSizes = Object.fromEntries(heroAssetStats.map(([name, stats]) => [name, stats.size]));
const normalizedLp = lp.replace(/\r\n/g, '\n');

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
assert(lp.includes("const HERO_VIDEO_POSTER = '/assets/lp-aquafacial/hero-poster-1080.webp'"), 'Aquafacial LP must define the optimized desktop hero poster');
assert(lp.includes("const HERO_VIDEO_POSTER_MOBILE = '/assets/lp-aquafacial/hero-poster-720.webp'"), 'Aquafacial LP must define the optimized mobile hero poster');
assert(lp.includes("const HERO_VIDEO_MP4 = '/assets/lp-aquafacial/hero-video.mp4'"), 'Aquafacial LP must define the optimized desktop MP4 hero video');
assert(lp.includes("const HERO_VIDEO_MOBILE_MP4 = '/assets/lp-aquafacial/hero-video-mobile.mp4'"), 'Aquafacial LP must define the optimized mobile MP4 hero video');
assert(lp.includes("const HERO_VIDEO_WEBM = '/assets/lp-aquafacial/hero-video.webm'"), 'Aquafacial LP must define the optional WebM hero video source');
assert(lp.includes('class="lp-hero-video-card"'), 'Aquafacial hero media must use the premium video card');
assert(lp.includes('data-hero-video-card'), 'Aquafacial hero video card must expose a stable JS hook');
assert(lp.includes('data-hero-video-poster'), 'Aquafacial hero video must render a poster-first image layer');
assert(lp.includes('preload="none"'), 'Aquafacial hero video must not preload video automatically');
assert(lp.includes('muted') && lp.includes('playsinline') && lp.includes('loop'), 'Aquafacial hero video must be muted, inline, and looped');
assert(lp.includes('aria-hidden="true"'), 'Decorative Aquafacial hero video must be hidden from assistive tech');
assert(lp.includes('data-desktop-mp4={HERO_VIDEO_MP4}'), 'Aquafacial hero video must defer the desktop MP4 URL into a data attribute');
assert(lp.includes('data-mobile-mp4={HERO_VIDEO_MOBILE_MP4}'), 'Aquafacial hero video must defer the mobile MP4 URL into a data attribute');
assert(lp.includes('data-desktop-webm={HERO_VIDEO_WEBM}'), 'Aquafacial hero video must defer the WebM URL into a data attribute');
assert(lp.includes('prefers-reduced-motion: reduce'), 'Aquafacial hero video must respect reduced motion');
assert(lp.includes('navigator.connection') && lp.includes('saveData'), 'Aquafacial hero video must respect save-data mode');
assert(lp.includes('IntersectionObserver'), 'Aquafacial hero video must wait for viewport intersection before loading sources');
assert(lp.includes('requestIdleCallback'), 'Aquafacial hero video must defer source loading until idle when available');
assert(lp.includes('Video pausieren') && lp.includes('Video abspielen'), 'Aquafacial hero video toggle must expose German accessible labels');
assert(!lp.includes('<source src={HERO_VIDEO_MP4}'), 'Aquafacial hero video must not place MP4 sources directly in initial HTML');
assert(heroAssetSizes.desktopPoster > 0 && heroAssetSizes.desktopPoster <= 260_000, 'Desktop Aquafacial hero poster should stay lightweight');
assert(heroAssetSizes.mobilePoster > 0 && heroAssetSizes.mobilePoster <= 160_000, 'Mobile Aquafacial hero poster should stay lightweight');
assert(heroAssetSizes.desktopMp4 > 1_000_000 && heroAssetSizes.desktopMp4 <= 2_300_000, 'Desktop Aquafacial MP4 should be production-compressed near the requested target');
assert(heroAssetSizes.mobileMp4 > 500_000 && heroAssetSizes.mobileMp4 <= 1_300_000, 'Mobile Aquafacial MP4 should be production-compressed near the requested target');
assert(heroAssetSizes.desktopWebm > 500_000 && heroAssetSizes.desktopWebm <= 2_300_000, 'Aquafacial WebM source should be production-compressed near the requested target');
assert(worker.includes("const AQUAFACIAL_HERO_ASSET_PREFIX = '/assets/lp-aquafacial/'"), 'Worker must define a stable cache scope for Aquafacial hero assets');
assert(worker.includes("const LONG_LIVED_STATIC_ASSET_CACHE = 'public, max-age=31536000, immutable'"), 'Worker must define long-lived cache headers for optimized Aquafacial hero assets');
assert(worker.includes('isAquafacialHeroAssetRequest(request)') && worker.includes("headers.set('Cache-Control', LONG_LIVED_STATIC_ASSET_CACHE)"), 'Worker must apply long-lived cache headers to Aquafacial hero assets');
assert(lp.includes('Aquafacial in Zürich: frischer Glow in 60 Minuten'), 'Aquafacial LP must use the approved H1');
assert(lp.includes('Premium Aquafacial Behandlung für ein sichtbar frisches, gepflegtes und hydratisiertes Hautgefühl.'), 'Aquafacial LP must use the approved hero subheadline');
assert(!lp.includes('Aquafacial Aktion in Zürich: Frischer Glow für CHF 99 statt CHF 180'), 'Aquafacial LP must remove the old price-led H1');
assert(lp.includes('Aquafacial Aktion Zürich | CHF 99 statt CHF 180 | Beauty Face Lift'), 'Aquafacial LP must set the requested SEO/OG title');
assert(lp.includes('Professionelle Aquafacial Behandlung in Zürich: Cleansing, Fruchtsäurepeeling und Hyaluron Booster für CHF 99 statt CHF 180. Jetzt unverbindlich anfragen.'), 'Aquafacial LP must set the requested meta description');
assert(landingPage.includes('<link rel="canonical" href={canonicalUrl}>'), 'Landing page layout must expose canonical metadata');
assert(landingPage.includes('og:title'), 'Landing page layout must expose Open Graph metadata');

assert(lp.includes('id="aquafacial-lead-form"'), 'Aquafacial LP must expose the lead-form anchor');
assert(lp.includes("import AquafacialResultsSection from '../../../components/lp/AquafacialResultsSection.astro'"), 'Aquafacial LP must use the reusable Aquafacial results section component');
assert(lp.includes('const resultExamples = ['), 'Aquafacial LP must define multiple reusable result examples');
assert(lp.includes('<AquafacialResultsSection'), 'Aquafacial LP must render the Aquafacial results section');
assert(resultsComponent.includes('id="aquafacial-results"'), 'Aquafacial results section must expose a stable section id');
const resultSectionIndex = lp.indexOf('<AquafacialResultsSection');
const leadSectionIndex = lp.indexOf('<section class="container lp-section lp-lead" id="aquafacial-lead-form">');
assert(resultSectionIndex !== -1 && leadSectionIndex !== -1 && resultSectionIndex < leadSectionIndex, 'Aquafacial results section must be placed directly before the lead form section');
assert(lp.includes('Sichtbar frischeres Hautgefühl nach der Aquafacial Behandlung'), 'Aquafacial results section must use the approved headline');
assert(lp.includes('Die Beispiele zeigen, wie die Haut nach einer professionellen Aquafacial Behandlung sichtbar frischer, gepflegter und hydratisierter wirken kann.'), 'Aquafacial results section must use compliant intro copy');
assert(lp.includes('ctaLabel="Unverbindlich Termin anfragen"'), 'Aquafacial results CTA must use the requested copy');
assert(resultsComponent.includes('data-button-location="results_section" data-aquafacial-scroll'), 'Aquafacial results CTA must scroll to the existing lead form without creating a lead event');
assert(lp.includes('image: {'), 'Aquafacial result examples must define single approved composite images');
assert(resultsComponent.includes('example.image.src'), 'Aquafacial result cards must render one single image from each approved composite');
assert(!lp.includes('composite: true'), 'Aquafacial result examples must not use the old composite flag workaround');
assert(!resultsComponent.includes('example.before'), 'Aquafacial results component must not render a separate before image');
assert(!resultsComponent.includes('example.after'), 'Aquafacial results component must not render a separate after image');
assert(!resultsComponent.includes('aquafacial-result-label'), 'Aquafacial results component must not render visible before/after label pills');
assert(resultsComponent.includes('padding-bottom: clamp(72px, 8vw, 112px);'), 'Aquafacial results section must keep breathing room below the CTA');
assert(resultsComponent.includes('.aquafacial-results-head .lp-eyebrow') && resultsComponent.includes('width: 100%;') && resultsComponent.includes('text-align: center;'), 'Aquafacial results header text must stay centered above the image grid');
for (const caption of [
  'Frischer Glow nach der Behandlung',
  'Gepflegteres und hydratisierter wirkendes Hautbild',
  'Professionelle Reinigung für ein frisches Hautgefühl',
]) {
  assert(lp.includes(caption), `Aquafacial results section must include caption: ${caption}`);
}
assert(lp.includes('Individuelle Ergebnisse können variieren'), 'Aquafacial results section must include a result-variation disclaimer');
assert(lp.includes('<div class="lp-lead-header">'), 'Aquafacial lead section must use a centered heading above the form');
assert(lp.includes('<p class="lp-eyebrow">Termin unverbindlich anfragen</p>'), 'Aquafacial lead section must use the requested overline');
assert(lp.includes('<h2 class="lp-section-title">Sichere dir jetzt einen Aquafacial-Termin zum Kennenlernpreis!</h2>'), 'Aquafacial lead section must use the requested title');
assert(!lp.includes('<h2 class="lp-section-title">Aquafacial Aktion anfragen</h2>'), 'Aquafacial lead section must remove the old side-column title');
assert(!lp.includes('Sende uns kurz deinen Terminwunsch oder deine Frage.'), 'Aquafacial lead section must remove the old side-column intro copy');
assert(!lp.includes('formReassurance'), 'Aquafacial lead section must remove the old reassurance-list data');
assert(!lp.includes('lp-reassurance-list'), 'Aquafacial lead section must remove the old reassurance list');
assert(normalizedLp.includes('.lp-lead-grid {\n    display: grid;\n    grid-template-columns: 1fr;'), 'Aquafacial lead section must be a one-column layout');
assert(lp.includes('width: min(100%, 860px);') && lp.includes('margin: 0 auto;'), 'Aquafacial lead form shell must be centered with a stable max width');
assert(lp.includes('.lp-lead-header .lp-eyebrow') && lp.includes('width: 100%;') && lp.includes('text-align: center;'), 'Aquafacial lead form overline must stay centered above the form title');
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

assert(lp.includes('Beauty Face Lift meldet sich persönlich'), 'Aquafacial LP must promise personal studio follow-up');
assert(lp.includes('Fragen stellen und deinen Terminwunsch persönlich abstimmen'), 'Aquafacial LP must reassure visitors that questions are possible before confirmation');
assert(lp.includes('Termin unverbindlich anfragen'), 'Aquafacial LP must clarify the form request is non-binding');
assert(lp.includes('Ich habe die') && lp.includes('Datenschutzerklärung') && lp.includes('gelesen und bin einverstanden'), 'Aquafacial LP must include privacy consent copy');
assert(lp.includes('href="/datenschutz/"'), 'Privacy consent must link to the existing privacy policy');
for (const location of ['lp_hero', 'what_section', 'trust_section', 'final_cta']) {
  assert(
    lp.includes(`data-button-location="${location}" data-aquafacial-scroll>Unverbindlich Termin anfragen</a>`),
    `Aquafacial LP ${location} CTA must use the requested main CTA copy`,
  );
}
assert(lp.includes('<span data-submit-label>Unverbindlich Termin anfragen</span>'), 'Aquafacial form submit CTA must use the requested main CTA copy');
assert(lp.includes("submitLabel.textContent = 'Unverbindlich Termin anfragen'"), 'Aquafacial form submit reset must restore the requested main CTA copy');
assert(!lp.includes('Jetzt Termin sichern'), 'Aquafacial LP must replace the old booking-style CTA copy everywhere');
assert(lp.includes('Keine Online-Zahlung. Wir melden uns zur Terminbestätigung.'), 'Aquafacial form must show the no-payment microcopy under the submit button');
assert(lp.includes('Aquafacial an der Bahnhofstrasse 94</p>'), 'Aquafacial hero must use the approved location kicker');
assert(!lp.includes('In Zürich nur für kurze Zeit'), 'Aquafacial hero must remove the unproven urgency kicker');
assert(
  lp.includes('Kennenlernpreis</span>') && lp.includes('CHF {PROMO_PRICE}.–') && lp.includes('statt CHF {REGULAR_PRICE}.–'),
  'Aquafacial hero must use the approved price line "Kennenlernpreis CHF 99.– · statt CHF 180.–"',
);
assert(lp.includes('data-button-location="mobile_sticky_lead" data-aquafacial-scroll>Termin anfragen</a>'), 'Aquafacial floating bar CTA must use the requested sticky CTA copy');
assert(lp.includes('Anfrage wird gesendet'), 'Aquafacial form must expose a loading state');
assert(lp.includes('Vielen Dank! Deine Anfrage ist eingegangen.'), 'Aquafacial form must expose the requested success message');
assert(lp.includes('Leider konnte deine Anfrage gerade nicht gesendet werden.'), 'Aquafacial form must expose the requested error message');
assert(lp.includes('Direkt online buchen'), 'Treatwell CTA must be available only as a secondary action after success/lower on page');
assert(lp.includes('https://buchung.treatwell.ch/ort/beauty-face-lift/?service=Aquafacial+Aktion&offer=aquafacial-aktion&price=99#serviceDetails=TR4122487'), 'After-submit Treatwell link must use the requested destination');
const fetchIndex = lp.indexOf('const response = await fetch(form.action');
const responseOkIndex = lp.indexOf('if (!response.ok)');
const successShownIndex = lp.indexOf('success.hidden = false');
const leadTrackingIndex = lp.indexOf('trackAquafacialLeadSubmit({ email:');
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
assert(lp.includes('Warum Aquafacial so beliebt ist'), 'Aquafacial LP must include the updated benefits headline');
assert(!lp.includes('Warum Kundinnen die Aquafacial Behandlung anfragen'), 'Aquafacial LP must remove the old benefits headline');
assert(!lp.includes('ohne übertriebene Versprechen und ohne Druck zur Sofortentscheidung'), 'Aquafacial LP must remove the requested benefits subheadline phrase');
assert(lp.includes('Premium Kosmetikstudio an der Bahnhofstrasse 94'), 'Aquafacial LP must include the trust/location section');
assert(!lp.includes("'Beauty Face Lift Zürich',"), 'Aquafacial proof strip must remove the generic studio label');
assert(!lp.includes("'Bahnhofstrasse 94, 8001 Zürich',"), 'Aquafacial proof strip must remove the address label');
assert(!lp.includes("'Professionelles Kosmetikinstitut',"), 'Aquafacial proof strip must remove the generic institute label');
assert(!lp.includes('class="lp-offer-price"'), 'Aquafacial included-treatment section must not render a duplicate price box');
assert(!lp.includes('Keine Online-Zahlung auf dieser Seite'), 'Aquafacial hero must remove the note below the CTA buttons');
assert(!lp.includes('Du hast eine kurze Frage oder möchtest schneller'), 'Aquafacial hero must remove the WhatsApp note below the CTA buttons');
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
assert(docs.includes('# Aquafacial Before / After Section Update'), 'Before/after section documentation must exist');
assert(docs.includes('Placement: directly before `#aquafacial-lead-form`'), 'Before/after docs must document the placement');
assert(docs.includes('CTA behavior: scrolls to `#aquafacial-lead-form`'), 'Before/after docs must document the CTA behavior');
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
