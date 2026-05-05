export type PublicServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price_chf: number;
  deposit_chf: number | null;
  category: string | null;
};

type OfficialServiceOverride = Pick<
  PublicServiceRow,
  'name' | 'description' | 'duration_minutes' | 'price_chf' | 'category'
>;

export const OFFICIAL_SERVICE_OVERRIDES: Record<string, OfficialServiceOverride> = {
  'hydrafacial-signature': {
    name: 'Gesichtsbehandlung - Hydra4Face Basic Intensiv',
    description: 'Hydra4Face Tiefenreinigung, Peeling und Feuchtigkeitsaufbau für sichtbar frische Haut.',
    duration_minutes: 60,
    price_chf: 180,
    category: 'Hydrafacial',
  },
  'hydrafacial-platinum': {
    name: 'Gesichtsbehandlung - Hydra4Face Anti Aging',
    description: 'Hydra4Face Anti-Aging-Behandlung mit intensiver Feuchtigkeitspflege und Glow-Finish.',
    duration_minutes: 90,
    price_chf: 250,
    category: 'Hydrafacial',
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
    description: 'Microneedling Anti-Aging-Behandlung kombiniert mit coldPLASMA zur Regeneration.',
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

export function applyOfficialServiceOverride<T extends PublicServiceRow>(service: T): T {
  const override = OFFICIAL_SERVICE_OVERRIDES[service.slug];
  if (!override) return service;

  return {
    ...service,
    ...override,
  };
}
