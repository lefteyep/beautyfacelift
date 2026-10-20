// Shared look of the automatic lead e-mails: a single-column table layout with inline styles (mail
// clients ignore <style> and web fonts), plus the plain-text twin. Colours are the Atelier Glow tokens
// of src/styles/main.css. No images, no tracking pixels.
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, FULL_ADDRESS, OPENING_HOURS } from '../../shared/site';
import { esc } from '../leads/html';

/** A paragraph: plain text (escaped in HTML), or prepared markup with its plain-text twin. */
export type EmailParagraph = string | { html: string; text: string };
export type EmailButton = { label: string; href: string };

export type EmailContent = {
  heading: string;
  paragraphs: EmailParagraph[];
  /** One call to action; rendered after the paragraphs. */
  button?: EmailButton;
  /** Several calls to action (rendered after `button`). */
  buttons?: EmailButton[];
  /** Paragraphs after the buttons. */
  after?: EmailParagraph[];
  /** Small print at the very end. */
  footer?: string;
  /** Studio signature with address and opening hours (default true). */
  signature?: boolean;
};

export const SIGNATURE_LINE = `Teresa Stimac · Beauty Face Lift · ${FULL_ADDRESS} · ${CONTACT_PHONE_DISPLAY} · ${CONTACT_EMAIL}`;

/** `Montag bis Freitag 10:00 - 20:00`, `Samstag 10:00 - 16:00`, `Sonntag Geschlossen`. */
export const OPENING_HOURS_LINES: readonly string[] = OPENING_HOURS.map(({ label, value }) => `${label} ${value}`);

const COLORS = {
  cream: '#FAF6F1',
  paper: '#FFFCF9',
  cocoa: '#2A1E18',
  text: '#4A3B33',
  muted: '#76655A',
  clay: '#8F5A2E',
  line: 'rgba(42,30,24,.1)',
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/** Escaped link for prepared paragraphs. */
export function emailLink(href: string, label: string): string {
  return `<a href="${esc(href)}" style="color: ${COLORS.cocoa}; text-decoration: underline;">${esc(label)}</a>`;
}

function paragraphHtml(paragraph: EmailParagraph): string {
  const inner = typeof paragraph === 'string' ? esc(paragraph).replaceAll('\n', '<br>') : paragraph.html;
  return `<p style="margin: 0 0 16px; font-family: ${SANS}; font-size: 16px; line-height: 1.6; color: ${COLORS.text};">${inner}</p>`;
}

function paragraphText(paragraph: EmailParagraph): string {
  return typeof paragraph === 'string' ? paragraph : paragraph.text;
}

function buttonHtml(button: EmailButton): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 12px;"><tr>
<td style="border-radius: 999px; background: ${COLORS.clay};"><a href="${esc(button.href)}" style="display: inline-block; padding: 14px 28px; border-radius: 999px; background: ${COLORS.clay}; color: #FFFFFF; font-family: ${SANS}; font-size: 16px; font-weight: 600; line-height: 1.2; text-decoration: none;">${esc(button.label)}</a></td>
</tr></table>`;
}

/** Renders the mail as HTML and plain text. Every dynamic value is escaped. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const buttons = [...(content.button ? [content.button] : []), ...(content.buttons ?? [])];
  const after = content.after ?? [];
  const withSignature = content.signature !== false;

  const signatureHtml = withSignature
    ? `<p style="margin: 24px 0 0; padding-top: 16px; border-top: 1px solid ${COLORS.line}; font-family: ${SANS}; font-size: 14px; line-height: 1.6; color: ${COLORS.muted};">${esc(SIGNATURE_LINE)}<br>${OPENING_HOURS_LINES.map(esc).join('<br>')}</p>`
    : '';
  const footerHtml = content.footer
    ? `<p style="margin: 16px 0 0; font-family: ${SANS}; font-size: 13px; line-height: 1.5; color: ${COLORS.muted};">${esc(content.footer)}</p>`
    : '';

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(content.heading)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${COLORS.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${COLORS.cream};">
<tr><td align="center" style="padding: 32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: ${COLORS.paper}; border: 1px solid ${COLORS.line}; border-radius: 20px;">
<tr><td style="padding: 32px 28px;">
<h1 style="margin: 0 0 20px; font-family: ${SERIF}; font-size: 28px; font-weight: 400; line-height: 1.2; color: ${COLORS.cocoa};">${esc(content.heading)}</h1>
${content.paragraphs.map(paragraphHtml).join('\n')}
${buttons.map(buttonHtml).join('\n')}
${after.map(paragraphHtml).join('\n')}
${signatureHtml}
${footerHtml}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const blocks = [
    content.heading,
    ...content.paragraphs.map(paragraphText),
    ...buttons.map((button) => `${button.label}: ${button.href}`),
    ...after.map(paragraphText),
    ...(withSignature ? [`--\n${SIGNATURE_LINE}\n${OPENING_HOURS_LINES.join('\n')}`] : []),
    ...(content.footer ? [content.footer] : []),
  ];
  return { html, text: `${blocks.join('\n\n')}\n` };
}
