// Turns a validated contact-form submission into a lead row (worker/routes/contact.ts calls this
// after Turnstile and before the owner e-mail).
import type { Env } from '../env';
import { DUPLICATE_WINDOW_DAYS, leadSourceFor, normalizeEmail, normalizePhone } from '../../shared/leads';
import { findRecentDuplicate, insertLeadWithEvent, type LeadRow } from './db';

/** The fields of ContactSubmission (worker/routes/contact.ts) that a lead stores. */
export type LeadSubmission = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  preferredCallbackTime: string;
  preferredDate: string;
  topic: string;
  message: string;
  source: string;
  marketingConsent: string;
  campaign: string;
  offer: string;
  treatment: string;
  landingPage: string;
  pageUrl: string;
  referrer: string;
  skinConcern: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  gclid: string;
  msclkid: string;
};

// Fields the contact route does not length-check (attribution, page data, e-mail, phone) are capped before storage.
const MAX_STORED_LENGTH = 2000;
const DAY_MS = 24 * 60 * 60 * 1000;

function capped(value: string): string {
  return value.length > MAX_STORED_LENGTH ? value.slice(0, MAX_STORED_LENGTH) : value;
}

/** Checkbox and JSON spellings of "yes". */
export function isConsentGiven(value: string): boolean {
  return /^(yes|on|true|1)$/i.test(value.trim());
}

/**
 * Stores the submission as a new lead with status "neu" plus its "created" event, linked to an
 * earlier lead with the same e-mail or phone within DUPLICATE_WINDOW_DAYS. Returns the stored row,
 * or null when no lead database is bound. D1 errors are thrown; the caller logs them and continues.
 */
export async function createLeadFromSubmission(env: Env, data: LeadSubmission, now: Date, enquiryId: string = crypto.randomUUID()): Promise<LeadRow | null> {
  const db = env.LEADS_DB;
  if (!db) return null;

  const at = now.toISOString();
  const email = capped(data.email);
  const phone = capped(data.phone);
  const emailNormalized = normalizeEmail(email);
  const phoneNormalized = normalizePhone(phone);
  const returningOfLeadId = await findRecentDuplicate(db, {
    emailNormalized,
    phoneNormalized,
    since: new Date(now.getTime() - DUPLICATE_WINDOW_DAYS * DAY_MS).toISOString(),
  });
  const marketingConsent = isConsentGiven(data.marketingConsent);
  const source = leadSourceFor(data.campaign, data.source);

  const lead: LeadRow = {
    id: enquiryId,
    created_at: at,
    updated_at: at,
    source,
    campaign: capped(data.campaign),
    offer: capped(data.offer),
    treatment: capped(data.treatment),
    topic: data.topic,
    landing_page: capped(data.landingPage),
    page_url: capped(data.pageUrl),
    referrer: capped(data.referrer),
    name: data.name,
    email: email || null,
    email_normalized: emailNormalized,
    phone: phone || null,
    phone_normalized: phoneNormalized,
    preferred_contact_method: data.preferredContactMethod,
    preferred_callback_time: data.preferredCallbackTime,
    preferred_date: data.preferredDate,
    skin_goal: capped(data.skinConcern),
    message: data.message,
    utm_source: capped(data.utmSource),
    utm_medium: capped(data.utmMedium),
    utm_campaign: capped(data.utmCampaign),
    utm_content: capped(data.utmContent),
    utm_term: capped(data.utmTerm),
    fbclid: capped(data.fbclid),
    gclid: capped(data.gclid),
    msclkid: capped(data.msclkid),
    status: 'neu',
    status_changed_at: at,
    first_contact_at: null,
    contact_attempts: 0,
    appointment_at: null,
    revenue_first_visit_chf: null,
    follow_up_booked: null,
    notes: '',
    marketing_consent: marketingConsent ? 1 : 0,
    marketing_consent_at: marketingConsent ? at : null,
    marketing_synced_at: null,
    confirmation_sent_at: null,
    nudge_sent_at: null,
    followup_sent_at: null,
    review_sent_at: null,
    unsubscribed_at: null,
    returning_of_lead_id: returningOfLeadId,
    treatwell_booking_ref: null,
    exclude: null,
  };

  await insertLeadWithEvent(db, lead, {
    at,
    type: 'created',
    actor: 'system',
    to_status: 'neu',
    meta: JSON.stringify({
      campaign: lead.campaign,
      source,
      ...(returningOfLeadId ? { returning_of_lead_id: returningOfLeadId } : {}),
    }),
  });

  return lead;
}
