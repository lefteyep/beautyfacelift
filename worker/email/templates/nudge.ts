// Reminder to the studio about a lead that is still "neu" an hour after it arrived (sent by
// worker/cron/automations.ts to LEADS_NUDGE_TO). Internal mail: it carries the enquiry data, one-tap
// call / WhatsApp links and the link into the lead cockpit. It never goes to a customer.
import { absoluteUrl } from '../../../shared/site';
import { mailtoHref } from '../../../shared/leads';
import type { LeadRow } from '../../leads/db';
import { esc, SOURCE_LABELS } from '../../leads/html';
import { formatZurich } from '../../leads/time';
import { contactLinks, treatmentLabel } from '../../leads/views/shared';
import { emailLink, renderEmail, type EmailButton, type EmailParagraph } from '../layout';

const MESSAGE_EXCERPT_MAX = 300;

/** The message cut to at most 300 characters (an ellipsis marks the cut). */
function excerpt(message: string): string {
  const trimmed = message.trim();
  return trimmed.length > MESSAGE_EXCERPT_MAX ? `${trimmed.slice(0, MESSAGE_EXCERPT_MAX - 1).trimEnd()}…` : trimmed;
}

/** One line for the subject: no line breaks, at most 80 characters. */
function oneLine(value: string): string {
  const line = value.replace(/\s+/g, ' ').trim();
  return line.length > 80 ? `${line.slice(0, 79)}…` : line;
}

export function nudgeMail(lead: LeadRow, { cockpitUrl, minutesOpen }: { cockpitUrl?: string; minutesOpen: number }): { subject: string; html: string; text: string } {
  const name = oneLine(lead.name) || 'Unbekannt';
  const subject = `Noch offen: Anfrage von ${name} (seit ${minutesOpen} Min.)`;
  const url = cockpitUrl ?? `${absoluteUrl('/admin/leads/')}${lead.id}/`;
  const treatment = treatmentLabel(lead);
  const source = SOURCE_LABELS[lead.source] ?? lead.source;

  const details: [string, string][] = [
    ['Name', lead.name],
    ['Quelle', source],
    ['Behandlung / Thema', lead.treatment || lead.topic || treatment],
    ['Eingang', formatZurich(lead.created_at, { withTime: true })],
    ['Telefon', lead.phone ?? ''],
    ['E-Mail', lead.email ?? ''],
    ['Bevorzugter Kontaktweg', lead.preferred_contact_method],
    ['Zeitwunsch', lead.preferred_callback_time],
    ['Terminwunsch', lead.preferred_date],
    ['Nachricht', excerpt(lead.message)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const detailParagraph: EmailParagraph = {
    html: details
      .map(([label, value]) => {
        const mailto = label === 'E-Mail' ? mailtoHref(value) : null;
        const shown = mailto ? emailLink(mailto, value) : escapeLines(value);
        return `<strong>${label}:</strong> ${shown}`;
      })
      .join('<br>'),
    text: details.map(([label, value]) => `${label}: ${value}`).join('\n'),
  };

  const phoneLinks = contactLinks(lead.name, treatment, lead.phone_normalized, null);
  const buttons: EmailButton[] = [
    ...['Anrufen', 'WhatsApp'].flatMap((label) => phoneLinks.filter((link) => link.label === label)),
    { label: 'Im Lead-Cockpit öffnen', href: url },
  ];

  return {
    subject,
    ...renderEmail({
      heading: `Noch offen: ${name}`,
      paragraphs: [
        'Guten Tag Teresa',
        `Diese Anfrage ist seit ${minutesOpen} Minuten unbeantwortet (Status «Neu»).`,
        detailParagraph,
      ],
      buttons,
      after: ['Nach dem ersten Kontakt bitte im Lead-Cockpit «Jetzt kontaktiert» antippen.'],
      footer: 'Automatische Erinnerung aus dem Lead-Cockpit: einmal pro Anfrage, nur während der Öffnungszeiten.',
      signature: false,
    }),
  };
}

function escapeLines(value: string): string {
  return value.split('\n').map((line) => esc(line)).join('<br>');
}
