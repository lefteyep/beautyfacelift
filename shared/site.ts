export const SITE_NAME = 'Beauty Face Lift Zürich';
export const CANONICAL_HOST = 'beautyfacelift-zuerich.ch';
export const CANONICAL_ORIGIN = 'https://beautyfacelift-zuerich.ch';
export const WWW_HOST = 'www.beautyfacelift-zuerich.ch';
export const TEMP_WORKERS_DEV_HOST = 'beautyfacelift.mediapaulo.workers.dev';
export const SITE_URL = CANONICAL_ORIGIN;
export const SITE_DOMAIN = CANONICAL_HOST;
export const STAGING_HOST = TEMP_WORKERS_DEV_HOST;

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).href;
}

export const TREATWELL_BOOKING_URL = 'https://buchung.treatwell.ch/ort/beauty-face-lift/';
export const AESTHETIKA_BOOKING_URL = TREATWELL_BOOKING_URL;
export const TREATWELL_URL = 'https://www.treatwell.ch/ort/beauty-face-lift/';

export const BOOKING_ATTRIBUTION_KEYS = [
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_source_platform',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'matchtype',
  'network',
  'device',
] as const;

export const BOOKING_INTENT_KEYS = ['service', 'offer', 'price'] as const;

export const BOOKING_FORWARD_KEYS = [
  ...BOOKING_ATTRIBUTION_KEYS,
  ...BOOKING_INTENT_KEYS,
] as const;

export function bookingLinkForService(service?: string): string {
  if (!service) return '/termin/';

  const params = new URLSearchParams({ service });
  return `/termin/?${params.toString()}`;
}

export const CONTACT_PHONE = '+41792143462';
export const CONTACT_PHONE_DISPLAY = '+41 79 214 34 62';
export const CONTACT_EMAIL = 'info@beautyfacelift.ch';
export const CONTACT_TO_EMAIL_FALLBACK = 'info@beautyfacelift.ch';

const whatsappMessage = encodeURIComponent('Guten Tag, ich habe eine Frage zu einer Behandlung bei Beauty Face Lift.');
export const CONTACT_WHATSAPP_URL = `https://wa.me/41792143462?text=${whatsappMessage}`;

export const TURNSTILE_ALLOWED_HOSTS = [
  CANONICAL_HOST,
  WWW_HOST,
  TEMP_WORKERS_DEV_HOST,
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
  { href: '/behandlungen/aquafacial-zuerich/', label: 'Aquafacial' },
  { href: '/behandlungen/microneedling-zuerich/', label: 'Microneedling' },
  { href: '/behandlungen/fruchtsaeure-peeling-zuerich/', label: 'Fruchtsäure Peeling' },
  { href: '/behandlungen/coldplasma-zuerich/', label: 'ColdPlasma' },
  { href: '/behandlungen/exosome-therapie-zuerich/', label: 'Exosome Therapie' },
] as const;

export const SERVICE_GROUPS = [
  {
    label: 'Gesicht & Haut',
    href: '/behandlungen/gesichtsbehandlung-zuerich/',
    description: 'Gesichtsbehandlungen, Hautanalyse und moderne kosmetisch-ästhetische Pflege.',
    services: [
      {
        href: '/behandlungen/gesichtsbehandlung-zuerich/',
        label: 'Gesichtsbehandlung Zürich',
        description: 'Individuelle Gesichtsbehandlung und Hautpflege als Einstieg in die persönliche Beratung.',
        bookingService: 'Gesichtsbehandlungen',
      },
      {
        href: '/behandlungen/aquafacial-zuerich/',
        label: 'Aquafacial',
        description: 'Hydra4Face Tiefenreinigung, sanftes Peeling und Feuchtigkeitspflege.',
        bookingService: 'Aquafacial',
      },
      {
        href: '/behandlungen/microneedling-zuerich/',
        label: 'Microneedling',
        description: 'Kosmetisches Needling für Hautstruktur, Poren und ein verfeinertes Hautbild.',
        bookingService: 'Microneedling',
      },
      {
        href: '/behandlungen/fruchtsaeure-peeling-zuerich/',
        label: 'Fruchtsäure Peeling',
        description: 'AHA-Peeling zur kosmetischen Hauterneuerung und Klärung des Hautbilds.',
        bookingService: 'Peeling',
      },
      {
        href: '/behandlungen/coldplasma-zuerich/',
        label: 'ColdPlasma',
        description: 'Kosmetische Plasma-Technologie als unterstützende Wirkstoffpflege.',
        bookingService: 'ColdPlasma',
      },
      {
        href: '/behandlungen/exosome-therapie-zuerich/',
        label: 'Exosome Therapie',
        description: 'Kosmetisch-regenerative Wirkstoffpflege mit vorsichtiger Einordnung.',
        bookingService: 'Exosome Therapie',
      },
    ],
  },
  {
    label: 'Laser-Haarentfernung',
    href: '/behandlungen/laser-haarentfernung-zuerich/',
    description: 'Professionelle dauerhafte Haarentfernung für viele Zonen, diskret in Zürich.',
    services: [
      {
        href: '/behandlungen/laser-haarentfernung-zuerich/',
        label: 'Laser-Haarentfernung Zürich',
        description: 'Dauerhafte Haarentfernung für Gesicht, Beine, Bikini, Achseln, Rücken und weitere Zonen.',
        bookingService: 'Dauerhafte Haarentfernung',
      },
    ],
  },
  {
    label: 'Waxing',
    href: '/behandlungen/waxing-zuerich/',
    description: 'Sorgfältige Haarentfernung mit Waxing für Damen und Herren.',
    services: [
      {
        href: '/behandlungen/waxing-zuerich/',
        label: 'Waxing Zürich',
        description: 'Waxing für Beine, Bikini, Achseln, Gesicht und Herren-Rücken.',
        bookingService: 'Waxing',
      },
    ],
  },
  {
    label: 'Wimpern & Brauen',
    href: '/behandlungen/wimpern-brauen-zuerich/',
    description: 'Färben, Formen und Lifting für einen gepflegten Ausdruck.',
    services: [
      {
        href: '/behandlungen/wimpern-brauen-zuerich/',
        label: 'Wimpern & Brauen Zürich',
        description: 'Augenbrauenkorrektur, Färben, Brauenlifting und Wimpernlifting.',
        bookingService: 'Augenbrauen & Wimpern',
      },
    ],
  },
  {
    label: 'Make-up',
    href: '/behandlungen/make-up-zuerich/',
    description: 'Make-up für Tageslook, Gala und Hochzeit.',
    services: [
      {
        href: '/behandlungen/make-up-zuerich/',
        label: 'Make-up Zürich',
        description: 'Tages-Make-up, Gala-Make-up und Hochzeits-Make-up mit Probe.',
        bookingService: 'Make-Up',
      },
    ],
  },
  {
    label: 'Massage',
    href: '/behandlungen/massage-zuerich-bahnhofstrasse/',
    description: 'Massagen in ruhiger Atmosphäre an der Bahnhofstrasse.',
    services: [
      {
        href: '/behandlungen/massage-zuerich-bahnhofstrasse/',
        label: 'Massage Zürich Bahnhofstrasse',
        description: 'Nacken- und Rückenmassage sowie klassische Ganzkörpermassage nach Buchungsumfang.',
        bookingService: 'Massagen',
      },
    ],
  },
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
