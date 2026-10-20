// Confirmation of receipt to the customer after an enquiry (sent by worker/email/confirmation.ts,
// switched off until go-live). Three variants: the contact page, the Aquafacial ad page and the
// Aquafacial + Microneedling ad page. No prices, no result claims, no opt-out link (this mail only
// answers the customer's own request), and no link into the lead cockpit.
import { CAMPAIGN_OFFERS, type CampaignOffer } from '../../../shared/leads';
import { absoluteUrl, bookingLinkForService, CONTACT_PHONE_DISPLAY, CONTACT_PHONE, FULL_ADDRESS } from '../../../shared/site';
import type { LeadRow } from '../../leads/db';
import { esc } from '../../leads/html';
import { zurichInputValues } from '../../leads/time';
import { emailLink, renderEmail, type EmailParagraph } from '../layout';

const WHATSAPP_URL = 'https://wa.me/41792143462';
const FOOTER = 'Diese E-Mail bestätigt den Eingang Ihrer Anfrage.';

export type ConfirmationVariant = 'kontakt' | 'aquafacial_aktion' | 'aquafacial_microneedling';

const SUBJECTS: Readonly<Record<ConfirmationVariant, string>> = {
  kontakt: 'Ihre Anfrage bei Beauty Face Lift',
  aquafacial_aktion: 'Ihre Aquafacial-Anfrage bei Beauty Face Lift',
  aquafacial_microneedling: 'Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift',
};

/** Contact methods of the forms (CONTACT_PREFERRED_METHODS) that name one channel. */
const CONTACT_CHANNELS: Readonly<Record<string, string>> = {
  'E-Mail': 'E-Mail',
  Telefon: 'Telefon',
  WhatsApp: 'WhatsApp',
};

const OFFER_DATE_FORMAT = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function confirmationVariant(campaign: string): ConfirmationVariant {
  return campaign === 'aquafacial_aktion' || campaign === 'aquafacial_microneedling' ? campaign : 'kontakt';
}

/** `Das Angebot gilt bis 14. November 2026.` while today (Zurich) is on or before the offer's last day. */
function offerLine(offer: CampaignOffer | undefined, now: Date): string | null {
  if (!offer?.validUntil) return null;
  const today = zurichInputValues(now.toISOString())?.date;
  if (!today || today > offer.validUntil) return null;
  return `Das Angebot gilt bis ${OFFER_DATE_FORMAT.format(new Date(`${offer.validUntil}T00:00:00Z`))}.`;
}

export function confirmationMail(
  lead: Pick<LeadRow, 'name' | 'campaign' | 'treatment' | 'topic' | 'preferred_contact_method'>,
  now: Date = new Date(),
): { subject: string; html: string; text: string } {
  const variant = confirmationVariant(lead.campaign);
  const offer: CampaignOffer | undefined = variant === 'kontakt' ? undefined : CAMPAIGN_OFFERS[variant];
  const subject = SUBJECTS[variant];
  const about = offer?.label || lead.treatment || lead.topic;
  const channel = CONTACT_CHANNELS[lead.preferred_contact_method] ?? 'Telefon oder E-Mail';
  const bookingUrl = absoluteUrl(offer ? bookingLinkForService(offer.bookingService) : '/termin/');
  const offerSentence = offerLine(offer, now);

  const paragraphs: EmailParagraph[] = [
    `Guten Tag ${lead.name.trim()}`,
    about ? `Vielen Dank für Ihre Anfrage zum Thema «${about}».` : 'Vielen Dank für Ihre Anfrage.',
    `Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages, per ${channel}.`,
    ...(offerSentence ? [offerSentence] : []),
    {
      html: `Bei Fragen erreichen Sie uns per ${emailLink(WHATSAPP_URL, 'WhatsApp')} oder telefonisch unter ${emailLink(`tel:${CONTACT_PHONE}`, CONTACT_PHONE_DISPLAY)}.`,
      text: `Bei Fragen erreichen Sie uns per WhatsApp (${WHATSAPP_URL}) oder telefonisch unter ${CONTACT_PHONE_DISPLAY}.`,
    },
    'Wenn Sie lieber gleich selbst einen Termin wählen möchten, können Sie online buchen:',
  ];

  const { html, text } = renderEmail({
    heading: 'Ihre Anfrage ist bei uns angekommen',
    paragraphs,
    button: { label: 'Termin online buchen', href: bookingUrl },
    after: [{ html: `Sie finden uns an der ${esc(FULL_ADDRESS)}.`, text: `Sie finden uns an der ${FULL_ADDRESS}.` }],
    footer: FOOTER,
  });
  return { subject, html, text };
}
