export interface Env {
  ASSETS: Fetcher;
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  META_PIXEL_ID?: string;
  META_ACCESS_TOKEN?: string;
  GA4_MEASUREMENT_ID?: string;
  GA4_API_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  OWNER_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENABLE_LEGACY_BOOKING?: string;
  ENVIRONMENT?: string;
}
