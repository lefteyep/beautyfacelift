import type { ImageMetadata } from 'astro';
import {
  aquafacialCard,
  coldplasmaCard,
  microneedlingCard,
  peelingCard,
  spaProducts,
} from '../../lib/site-images';

/**
 * The five facial treatments with detail pages. Lines, prices and durations
 * mirror the approved cards on /behandlungen/ — keep both in sync.
 */
export interface TreatmentCard {
  href: string;
  name: string;
  line: string;
  meta: string;
  image: ImageMetadata;
  alt: string;
}

export const FACIAL_TREATMENTS: TreatmentCard[] = [
  {
    href: '/behandlungen/aquafacial-zuerich/',
    name: 'Aquafacial',
    line: 'Tiefenreinigung, Peeling und Feuchtigkeit in einer Behandlung.',
    meta: 'ab CHF 180 · 60–90 Min.',
    image: aquafacialCard,
    alt: 'Aquafacial Behandlung mit Handstück an der Wange',
  },
  {
    href: '/behandlungen/microneedling-zuerich/',
    name: 'Microneedling',
    line: 'Für feinere Poren, glattere Struktur und feine Linien.',
    meta: 'ab CHF 210 · 90 Min.',
    image: microneedlingCard,
    alt: 'Microneedling Behandlung im Gesicht',
  },
  {
    href: '/behandlungen/fruchtsaeure-peeling-zuerich/',
    name: 'Fruchtsäure Peeling',
    line: 'AHA-Peeling für einen klaren, ebenmässigen Teint.',
    meta: 'CHF 150 · 45–60 Min.',
    image: peelingCard,
    alt: 'Fruchtsäure Peeling wird mit dem Pinsel aufgetragen',
  },
  {
    href: '/behandlungen/coldplasma-zuerich/',
    name: 'ColdPlasma',
    line: 'Plasma-Technologie als Ergänzung bei unreiner Haut.',
    meta: 'ab CHF 180 · 90 Min.',
    image: coldplasmaCard,
    alt: 'ColdPlasma Handstück an der Schläfe',
  },
  {
    href: '/behandlungen/exosome-therapie-zuerich/',
    name: 'Exosome Therapie',
    line: 'Regenerative Wirkstoffpflege für Feuchtigkeit und Glow.',
    meta: 'Persönliche Beratung',
    image: spaProducts,
    alt: 'Serumflaschen mit Pipette auf hellem Stein',
  },
];

/** Every other facial treatment, in catalogue order. */
export function relatedTreatments(currentHref: string): TreatmentCard[] {
  return FACIAL_TREATMENTS.filter((treatment) => treatment.href !== currentHref);
}
