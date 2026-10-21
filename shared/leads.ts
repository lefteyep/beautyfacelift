// Lead-Cockpit vocabulary shared by the Worker, Astro pages and Node scripts.
// No imports on purpose: this module must load without Worker or Astro types.
// Drift against the pages is checked by `npm run qa:leads` (scripts/check-leads.mjs).

/** Lead statuses as stored in `leads.status` (ASCII slugs). */
export const LEAD_STATUSES = [
  'neu',
  'kontaktiert',
  'gebucht',
  'erschienen',
  'no_show',
  'abgesagt',
  'nicht_erreicht',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Readonly<Record<LeadStatus, string>> = {
  neu: 'Neu',
  kontaktiert: 'Kontaktiert',
  gebucht: 'Gebucht',
  erschienen: 'Erschienen',
  no_show: 'Nicht erschienen',
  abgesagt: 'Abgesagt',
  nicht_erreicht: 'Nicht erreicht',
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

/** Where a lead came from, as stored in `leads.source`. */
export const LEAD_SOURCES = [
  'kontakt-page',
  'aquafacial-lp',
  'aquafacial-microneedling-lp',
  'manual',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === 'string' && (LEAD_SOURCES as readonly string[]).includes(value);
}

/** Sources a public form may name itself. `manual` is reserved for leads entered in the cockpit. */
const FORM_LEAD_SOURCES: readonly LeadSource[] = ['kontakt-page', 'aquafacial-lp', 'aquafacial-microneedling-lp'];

/**
 * The source of a form submission: an explicit form source (kontakt-page, aquafacial-lp,
 * aquafacial-microneedling-lp) wins; anything else, including `manual`, is ignored. Then the
 * campaign decides (the ad pages post a campaign); everything else is the contact page.
 */
export function leadSourceFor(campaign: string, source?: string): LeadSource {
  const explicit = source?.trim();
  if (isLeadSource(explicit) && FORM_LEAD_SOURCES.includes(explicit)) return explicit;
  if (campaign === 'aquafacial_aktion') return 'aquafacial-lp';
  if (campaign === 'aquafacial_microneedling') return 'aquafacial-microneedling-lp';
  return 'kontakt-page';
}

export type CampaignOffer = {
  /** Last day of the offer (ISO date), or null when the page names no end date. */
  validUntil: string | null;
  /** Service name for `bookingLinkForService()` (shared/site.ts). */
  bookingService: string;
  label: string;
};

/**
 * Copies of the ad pages' constants. aquafacial_microneedling: OFFER_VALID_UNTIL, BOOKING_SERVICE and
 * OFFER_LABEL of src/pages/lp/aquafacial-microneedling/index.astro. aquafacial_aktion: OFFER_LABEL of
 * src/pages/lp/aquafacial/index.astro (the page has no BOOKING_SERVICE constant).
 */
export const CAMPAIGN_OFFERS = {
  aquafacial_microneedling: {
    validUntil: '2026-11-14',
    bookingService: 'Aquafacial + Microneedling',
    label: 'Aquafacial + Microneedling Kombi-Angebot',
  },
  aquafacial_aktion: {
    validUntil: null,
    bookingService: 'Aquafacial',
    label: 'Aquafacial Aktion',
  },
} as const satisfies Record<string, CampaignOffer>;
export type CampaignKey = keyof typeof CAMPAIGN_OFFERS;

export type OpeningWindow = { open: string; close: string };

/**
 * Structured studio hours (Europe/Zurich local time), the machine-readable twin of OPENING_HOURS in
 * shared/site.ts. Index = JavaScript weekday as returned by Date#getDay(): 0 = Sunday … 6 = Saturday.
 * null = closed.
 */
export const OPENING_HOURS_WEEKLY: readonly (OpeningWindow | null)[] = [
  null, // Sonntag
  { open: '10:00', close: '20:00' }, // Montag
  { open: '10:00', close: '20:00' }, // Dienstag
  { open: '10:00', close: '20:00' }, // Mittwoch
  { open: '10:00', close: '20:00' }, // Donnerstag
  { open: '10:00', close: '20:00' }, // Freitag
  { open: '10:00', close: '16:00' }, // Samstag
];

/** Enquiries with the same e-mail or phone within this window link to the earlier lead. */
export const DUPLICATE_WINDOW_DAYS = 30;
/** Reminder to the studio when a new lead is still "neu" after this long (within opening hours). */
export const NUDGE_AFTER_MINUTES = 60;
/** Follow-up mail to the customer when no booking followed. */
export const FOLLOWUP_AFTER_HOURS = 72;
/** Review request after the appointment. */
export const REVIEW_AFTER_HOURS = 24;

/** WhatsApp prefill for the studio's first reply to a lead. */
export function whatsappPrefillText(firstName: string, treatment: string): string {
  return `Guten Tag ${firstName}, hier ist Teresa Stimac von Beauty Face Lift. Vielen Dank für Ihre Anfrage zu ${treatment}. Wann passt es Ihnen für einen Termin?`;
}

// Plain dot-atom mailbox only: no display names, address lists or URI parameters.
// URI-significant characters are allowed in a valid local part, then encoded by mailtoHref().
const EMAIL_LOCAL_PATTERN = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const EMAIL_DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

/** Accepts one plain ASCII mailbox, including plus-addressing; never an address list or a URL. */
export function isSingleMailbox(email: string): boolean {
  if (email.length > 254) return false;
  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) return false;
  const local = email.slice(0, at);
  const labels = email.slice(at + 1).split('.');
  return local.length <= 64 && EMAIL_LOCAL_PATTERN.test(local)
    && labels.length >= 2 && labels.every((label) => EMAIL_DOMAIN_LABEL.test(label));
}

/** Trimmed, lower-case e-mail, or null when empty or invalid. */
export function normalizeEmail(value: string | null | undefined): string | null {
  const email = (value ?? '').trim().toLowerCase();
  return isSingleMailbox(email) ? email : null;
}

/** A safe mailto recipient without query parameters; invalid legacy values have no link. */
export function mailtoHref(value: string | null | undefined): string | null {
  const email = normalizeEmail(value);
  if (!email) return null;
  const at = email.indexOf('@');
  return `mailto:${encodeURIComponent(email.slice(0, at))}@${email.slice(at + 1)}`;
}

/**
 * Phone number as international digits without "+", e.g. "079 214 34 62", "+41 79 214 34 62" and
 * "0041 79 214 34 62" all become "41792143462". A trunk "0" right after the Swiss prefix is dropped,
 * so "+41 (0) 79 214 34 62" and "0041 (0)79 214 34 62" match too. Null when fewer than 8 or more
 * than 15 digits remain.
 */
export function normalizePhone(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  let digits = raw.replace(/\D/g, '');
  if (!raw.startsWith('+')) {
    if (digits.startsWith('00')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = `41${digits.slice(1)}`;
  }
  if (digits.startsWith('410')) digits = `41${digits.slice(3)}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Who caused a lead event (`lead_events.actor`). */
export const LEAD_ACTORS = ['teresa', 'agentur', 'system', 'email'] as const;
export type LeadActor = (typeof LEAD_ACTORS)[number];

/** Lead event types (`lead_events.type`). Extend the list; never rename a stored value. */
export const LEAD_EVENT_TYPES = [
  'created',
  'contacted',
  'status',
  'appointment',
  'revenue',
  'notes',
  'exclude',
  'mail_sent',
  'mail_failed',
  'nudge_sent',
  'automation_claimed',
] as const;
export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];
