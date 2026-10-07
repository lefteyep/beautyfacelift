import { readFileSync } from 'node:fs';

const page = readFileSync('src/pages/kontakt/index.astro', 'utf8');
const site = readFileSync('shared/site.ts', 'utf8');
const worker = readFileSync('worker/routes/contact.ts', 'utf8');

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} missing: ${needle}`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label} must not include: ${needle}`);
  }
}

function assertOrdered(source, needles, label) {
  let lastIndex = -1;
  for (const needle of needles) {
    const index = source.indexOf(needle);
    if (index === -1) throw new Error(`${label} missing ordered item: ${needle}`);
    if (index < lastIndex) throw new Error(`${label} order violation at: ${needle}`);
    lastIndex = index;
  }
}

assertOrdered(page, [
  'ContactHero',
  'ContactMethodCards',
  'AppointmentInquiryForm',
  'TreatmentIntentGuide',
  'TrustSection',
  'LocationHoursMap',
  'ContactFAQ',
  'FinalCTA',
  'MobileStickyContactBar',
], 'contact page sections');

const pageRequirements = [
  'Kontakt & Beratung | Beauty Face Lift Zürich',
  'Kontaktieren Sie Beauty Face Lift in Zürich für persönliche Hautberatung, Terminwünsche und Behandlungsfragen. Teresa Stimac berät Sie direkt an der Bahnhofstrasse 94.',
  'Persönliche Hautberatung &amp; Termine in Zürich',
  'Sie möchten einen Termin buchen, eine Behandlung abklären oder sind unsicher, was zu Ihrer Haut passt?',
  '4.8/5 Treatwell Bewertung',
  '249 Bewertungen',
  'Über 20 Jahre Erfahrung',
  'id="kontaktformular"',
  'Beratung anfragen',
  'WhatsApp schreiben',
  'Direkt online buchen',
  'Anrufen',
  'name="name"',
  'name="topic"',
  'name="treatment_interest"',
  'name="email"',
  'name="phone"',
  'name="preferred_contact"',
  'name="preferred_time"',
  'name="message"',
  'name="privacy"',
  'name="company"',
  'aria-hidden="true"',
  'tabindex="-1"',
  'Anfrage an Teresa senden',
  'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an, damit Teresa Ihnen antworten kann.',
  'Vielen Dank — Ihre Anfrage wurde gesendet.',
  'Noch unsicher, welche Behandlung passt?',
  'Warum Kundinnen Teresa vertrauen',
  'Beauty Face Lift an der Bahnhofstrasse 94',
  'Anfahrt auf der Karte',
  'Häufige Fragen vor der Kontaktaufnahme',
  'Bereit für Ihre persönliche Hautberatung?',
  'kontakt-mobile-bar',
  'contact_form_view',
  'contact_form_start',
  'contact_form_submit_success',
  'contact_form_submit_error',
  'contact_whatsapp_click',
  'contact_phone_click',
  'contact_email_click',
  'contact_booking_click',
  'contact_route_click',
  'contact_address_copy',
  'faq_open',
  '"@type": "BeautySalon"',
  'openingHoursSpecification',
  'sameAs',
];

for (const requirement of pageRequirements) {
  assertIncludes(page, requirement, 'contact page');
}

assertNotIncludes(page, '>Nachricht senden<', 'contact page');
assertNotIncludes(page, '<label for="contact-company">Firma</label>', 'contact page');

const topicRequirements = [
  'Ich möchte einen Termin buchen',
  'Ich wünsche eine Behandlungsempfehlung',
  'Ich bin unsicher, welche Behandlung passt',
  'Frage zu Preisen oder Dauer',
  'Termin verschieben oder absagen',
  'Frage zur Anfahrt',
  'Allgemeine Frage',
];

for (const requirement of topicRequirements) {
  assertIncludes(site, requirement, 'contact topics');
}

const workerRequirements = [
  'treatmentInterest: string',
  "treatmentInterest: getString(payload.treatment_interest || payload.treatmentInterest)",
  "preferredContactMethod: getString(payload.preferred_contact || payload.preferredContactMethod)",
  "preferredTime: getString(payload.preferred_time || payload.preferredCallbackTime)",
  "privacyConsent: getString(payload.privacy || payload.privacyConsent)",
  "treatmentInterest: getString(formData.get('treatment_interest') || formData.get('treatmentInterest'))",
  "preferredContactMethod: getString(formData.get('preferred_contact') || formData.get('preferredContactMethod'))",
  "preferredTime: getString(formData.get('preferred_time') || formData.get('preferredCallbackTime'))",
  "privacyConsent: getString(formData.get('privacy') || formData.get('privacyConsent'))",
  'Bitte geben Sie Ihren Namen ein.',
  'Bitte wählen Sie aus, worum es bei Ihrer Anfrage geht.',
  'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an, damit Teresa Ihnen antworten kann.',
  'Bitte prüfen Sie die E-Mail-Adresse. Beispiel: name@email.ch',
  'Bitte beschreiben Sie kurz Ihr Anliegen oder Ihren Terminwunsch.',
  'Bitte bestätigen Sie die Datenschutzhinweise, damit wir Ihre Anfrage beantworten dürfen.',
  'Welche Behandlung interessiert Sie',
  'Wunschtermin oder bevorzugte Zeit',
];

for (const requirement of workerRequirements) {
  assertIncludes(worker, requirement, 'contact worker');
}

console.log('Contact page source checks passed.');
