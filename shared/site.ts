export const SITE_NAME = 'Beauty Face Lift';
export const SITE_URL = 'https://beautyfacelift-zuerich.ch';

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).href;
}

export const CONTACT_PHONE = '+41792143462';
export const CONTACT_PHONE_DISPLAY = '+41 79 214 34 62';
export const CONTACT_EMAIL = 'info@beautyfacelift.ch';
export const CONTACT_TO_EMAIL_FALLBACK = 'info@beautyfacelift.ch';
export const TREATWELL_BOOKING_URL = 'https://buchung.treatwell.ch/ort/beauty-face-lift/';
export const TREATWELL_URL = 'https://www.treatwell.ch/ort/beauty-face-lift/';

const whatsappMessage = encodeURIComponent('Guten Tag, ich habe eine Frage zu einer Behandlung bei Beauty Face Lift.');
export const CONTACT_WHATSAPP_URL = `https://wa.me/41792143462?text=${whatsappMessage}`;

export const TURNSTILE_ALLOWED_HOSTS = [
  'beautyfacelift.ch',
  'www.beautyfacelift.ch',
  'beautyfacelift.mediapaulo.workers.dev',
] as const;

export const ADDRESS = {
  street: 'Bahnhofstrasse 94',
  postalCode: '8001',
  city: 'Zürich',
  country: 'CH',
};

export const FULL_ADDRESS = `${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}`;

export const OPENING_HOURS = [
  { label: 'Montag bis Freitag', value: '09:00 - 18:00' },
  { label: 'Samstag', value: '10:00 - 16:00' },
  { label: 'Sonntag', value: 'Nach Vereinbarung geschlossen' },
] as const;

export const TREATMENTS = [
  { href: '/behandlungen/hydrafacial-zuerich/', label: 'Hydrafacial' },
  { href: '/behandlungen/microneedling-zuerich/', label: 'Microneedling' },
  { href: '/behandlungen/fruchtsaeure-peeling-zuerich/', label: 'Fruchtsäure Peeling' },
  { href: '/behandlungen/coldplasma-zuerich/', label: 'ColdPlasma' },
] as const;

export const CONTACT_TOPICS = [
  'Ich möchte einen Termin buchen',
  'Ich möchte eine Behandlungsempfehlung',
  'Frage zu Preisen',
  'Termin verschieben oder absagen',
  'Anfahrt & Studio',
  'Allgemeine Frage',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];
