export const SITE_NAME = 'Beauty Face Lift';

export const CONTACT_PHONE = '+41792143462';
export const CONTACT_PHONE_DISPLAY = '+41 79 214 34 62';
export const CONTACT_EMAIL = 'info@beautyfacelift.ch';
export const CONTACT_TO_EMAIL_FALLBACK = 'info@beautyfacelift.ch';

const whatsappMessage = encodeURIComponent('Guten Tag, ich habe eine Frage zu einer Behandlung bei Beauty Face Lift.');
export const CONTACT_WHATSAPP_URL = `https://wa.me/41792143462?text=${whatsappMessage}`;

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
  'Erstberatung',
  'Behandlungsempfehlung',
  'Terminverschiebung oder Absage',
  'Preise und Behandlungsdauer',
  'Anfahrt und Studio',
  'Allgemeine Frage',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];
