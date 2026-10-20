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
  /** Optional blind-copy recipients for enquiry emails, comma-separated (e.g. the agency). */
  CONTACT_BCC_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_ALLOWED_HOSTS?: string;
  ENABLE_LEGACY_BOOKING?: string;
  ENVIRONMENT?: string;
  /** Lead database (D1 `beautyfacelift-leads`). Optional: without it the contact form works as before. */
  LEADS_DB?: D1Database;
  /** Cloudflare Access team domain for /admin/: the full origin `https://<team>.cloudflareaccess.com`, no trailing slash. */
  ACCESS_TEAM_DOMAIN?: string;
  /** Audience (AUD) tag of the Cloudflare Access application that protects /admin/. */
  ACCESS_AUD?: string;
  /** Comma-separated e-mail addresses allowed into the lead cockpit. */
  ACCESS_ALLOWED_EMAILS?: string;
  /** Secret for the cockpit CSRF tokens and signed lead links (unsubscribe). Missing = every cockpit POST answers 503. */
  LEADS_SIGNING_SECRET?: string;
  /** Local development only: identity used instead of Cloudflare Access. */
  LEADS_DEV_EMAIL?: string;
  /** Recipient of forwarded booking mails (agency address until go-live). */
  LEADS_FORWARD_TO?: string;
  /** Recipient of reminders about unanswered leads (agency address until go-live). */
  LEADS_NUDGE_TO?: string;
  /** "on" enables automated e-mails to customers; anything else keeps them off. */
  LEADS_CUSTOMER_MAILS?: string;
  /** Resend audience for contacts with marketing consent. */
  RESEND_AUDIENCE_ID?: string;
  /** Review link used in review requests. */
  GOOGLE_REVIEW_URL?: string;
}
