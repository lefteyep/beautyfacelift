export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price_chf: number;
  price_label?: string;
  price_min_chf?: number;
  price_max_chf?: number;
  deposit_chf: number;
  category: string;
}
