// Helpers used by both cockpit views (list rows and the detail page): the treatment named in the
// WhatsApp prefill and the contact links (WhatsApp, Anrufen, E-Mail).
import { CAMPAIGN_OFFERS, whatsappPrefillText } from '../../../shared/leads';
import type { LeadRow } from '../db';

/** The treatment named in the WhatsApp prefill. */
export function treatmentLabel(lead: Pick<LeadRow, 'treatment' | 'campaign' | 'topic'>): string {
  const offer = (CAMPAIGN_OFFERS as Record<string, { label: string } | undefined>)[lead.campaign];
  return lead.treatment || offer?.label || lead.topic || 'Ihrer Anfrage';
}

export type ContactLink = { href: string; label: string };

/** WhatsApp, Anrufen and E-Mail links for whatever contact data the lead has. */
export function contactLinks(name: string, treatment: string, phoneNormalized: string | null, email: string | null): ContactLink[] {
  const links: ContactLink[] = [];
  if (phoneNormalized) {
    const firstName = name.trim().split(/\s+/)[0] ?? '';
    const text = encodeURIComponent(whatsappPrefillText(firstName, treatment));
    links.push({ href: `https://wa.me/${phoneNormalized}?text=${text}`, label: 'WhatsApp' });
    links.push({ href: `tel:+${phoneNormalized}`, label: 'Anrufen' });
  }
  if (email) links.push({ href: `mailto:${email}`, label: 'E-Mail' });
  return links;
}
