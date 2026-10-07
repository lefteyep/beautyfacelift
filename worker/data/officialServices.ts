export type PublicServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price_chf: number;
  price_label?: string;
  price_min_chf?: number;
  price_max_chf?: number;
  deposit_chf: number | null;
  category: string | null;
};

type OfficialServiceOverride = Pick<
  PublicServiceRow,
  'name' | 'description' | 'duration_minutes' | 'price_chf' | 'category'
>;

type OfficialPriceRange = Pick<PublicServiceRow, 'price_label' | 'price_min_chf' | 'price_max_chf'>;

export const OFFICIAL_SERVICE_OVERRIDES: Record<string, OfficialServiceOverride> = {
  'aquafacial-signature': {
    name: 'Gesichtsbehandlung - Hydra4Face Basic Intensiv',
    description: 'Hydra4Face Tiefenreinigung, Peeling und Feuchtigkeitsaufbau für sichtbar frische Haut.',
    duration_minutes: 60,
    price_chf: 180,
    category: 'Aquafacial',
  },
  'aquafacial-platinum': {
    name: 'Gesichtsbehandlung - Hydra4Face Anti Aging',
    description: 'Hydra4Face Anti-Aging-Behandlung mit intensiver Feuchtigkeitspflege und Glow-Finish.',
    duration_minutes: 90,
    price_chf: 250,
    category: 'Aquafacial',
  },
  'microneedling-gesicht': {
    name: 'Gesichtsbehandlung - Microneedling',
    description: 'Kollagenstimulation für verfeinerte Poren, glattere Struktur und sichtbar frischere Haut.',
    duration_minutes: 90,
    price_chf: 210,
    category: 'Microneedling',
  },
  'microneedling-gesicht-hals': {
    name: 'Gesichtsbehandlung - Micro Needling Anti Aging mit coldPLASMA',
    description: 'Microneedling Anti-Aging-Behandlung kombiniert mit coldPLASMA zur kosmetischen Hautbildpflege.',
    duration_minutes: 90,
    price_chf: 220,
    category: 'Microneedling',
  },
  'fruchtsaeure-peeling': {
    name: 'Gesichtsbehandlung - Fruchtsäure',
    description: 'Professionelles Fruchtsäure-Peeling für Hauterneuerung, klares Hautbild und verfeinerte Poren.',
    duration_minutes: 45,
    price_chf: 150,
    category: 'Peeling',
  },
  coldplasma: {
    name: 'Gesichtsbehandlung - coldPLASMA Akne/unreine Haut',
    description: 'coldPLASMA Behandlung für unreine Haut, Hautbarriere und Wirkstoffaufnahme.',
    duration_minutes: 90,
    price_chf: 180,
    category: 'ColdPlasma',
  },
  'carbon-microneedling': {
    name: 'Gesichtsbehandlung - Carbon Laser Peeling + Microneedling',
    description: 'Carbon Laser Peeling kombiniert mit Microneedling in einer 90-minütigen Sitzung.',
    duration_minutes: 90,
    price_chf: 250,
    category: 'Carbon Microneedling',
  },
};

export const OFFICIAL_PRICE_RANGES: Record<string, OfficialPriceRange> = {
  'maske-soin-initiale-augenmaske': {
    price_label: 'CHF 30-150',
    price_min_chf: 30,
    price_max_chf: 150,
  },
  'klassische-ganzkoerpermassage': {
    price_label: 'CHF 135-1200',
    price_min_chf: 135,
    price_max_chf: 1200,
  },
};

export function applyOfficialServiceOverride<T extends PublicServiceRow>(service: T): T {
  const override = OFFICIAL_SERVICE_OVERRIDES[service.slug];
  const priceRange = OFFICIAL_PRICE_RANGES[service.slug];
  if (!override && !priceRange) return service;

  return {
    ...service,
    ...override,
    ...priceRange,
  };
}
