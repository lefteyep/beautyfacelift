// One description of the business for every page's JSON-LD. Google reads it for the local listing,
// so all pages must say the same thing: one @id, one name, one phone, the hours from OPENING_HOURS.
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, OPENING_HOURS, SITE_NAME, TREATWELL_URL, absoluteUrl } from '../../shared/site';

export const BUSINESS_ID = absoluteUrl('/#beauty-salon');
export const INSTAGRAM_URL = 'https://www.instagram.com/beautyfacelift.zh/';

// Building at Bahnhofstrasse 94 (OpenStreetMap), same as the geo meta in Base.astro.
const GEO = { latitude: 47.376, longitude: 8.5397 };

const SCHEMA_DAYS: Record<string, string | string[]> = {
  'Montag bis Freitag': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  'Samstag': 'Saturday',
};

export function openingHoursSpecification() {
  return OPENING_HOURS
    .filter((item) => SCHEMA_DAYS[item.label] && /\d{1,2}:\d{2} - \d{1,2}:\d{2}/.test(item.value))
    .map((item) => {
      const [opens, closes] = item.value.split(' - ');
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DAYS[item.label], opens, closes };
    });
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: ADDRESS.street,
    addressLocality: ADDRESS.city,
    postalCode: ADDRESS.postalCode,
    addressCountry: ADDRESS.country,
  };
}

/** The full business node (homepage, /kontakt/, /termin/, /ueber-mich/). */
export function beautySalon() {
  return {
    '@type': 'BeautySalon',
    '@id': BUSINESS_ID,
    name: SITE_NAME,
    alternateName: 'Beauty Face Lift',
    url: absoluteUrl('/'),
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', ...GEO },
    openingHoursSpecification: openingHoursSpecification(),
    image: absoluteUrl('/assets/hero_editorial_portrait.png'),
    logo: absoluteUrl('/assets/logo.png'),
    sameAs: [INSTAGRAM_URL, TREATWELL_URL],
    areaServed: ['Zürich', 'Switzerland'],
  };
}

/** A compact reference to the same business, e.g. Service.provider: same @id, enough to stand alone. */
export function beautySalonRef() {
  return {
    '@type': 'BeautySalon',
    '@id': BUSINESS_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    telephone: CONTACT_PHONE,
    address: postalAddress(),
  };
}
