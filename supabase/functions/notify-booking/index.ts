/**
 * Supabase Edge Function: notify-booking
 *
 * Triggered by database webhook on INSERT into bookings table.
 * Sends notifications to Teresa (owner) and confirmation to customer.
 *
 * Deploy: supabase functions deploy notify-booking
 * Webhook: Supabase Dashboard → Database → Webhooks → Add → INSERT on bookings
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') || 'info@beautyfacelift.ch';
const OWNER_PHONE = Deno.env.get('OWNER_PHONE') || '+41792143462';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';

interface BookingRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  service_id: string;
  notes?: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: BookingRecord;
  old_record?: BookingRecord;
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM === 'onboarding@resend.dev' ? EMAIL_FROM : `Beauty Face Lift <${EMAIL_FROM}>`,
      to: [to],
      subject,
      html,
    }),
  });
}

Deno.serve(async (req: Request) => {
  const payload: WebhookPayload = await req.json();
  const booking = payload.record;

  if (payload.type === 'INSERT') {
    // --- New Booking ---

    // 1. Email to Teresa (owner)
    await sendEmail(
      OWNER_EMAIL,
      `Neue Buchung: ${booking.customer_name} — ${formatDate(booking.booking_date)}`,
      `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
        <h2 style="font-family: 'Cormorant Garamond', serif; color: #121212; margin-bottom: 1.5rem;">Neue Buchung</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #5C5A55;">Kundin</td><td style="padding: 8px 0; font-weight: 500;">${booking.customer_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #5C5A55;">Datum</td><td style="padding: 8px 0; font-weight: 500;">${formatDate(booking.booking_date)} um ${booking.booking_time}</td></tr>
          <tr><td style="padding: 8px 0; color: #5C5A55;">Telefon</td><td style="padding: 8px 0;"><a href="tel:${booking.customer_phone}">${booking.customer_phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #5C5A55;">E-Mail</td><td style="padding: 8px 0;"><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></td></tr>
          ${booking.notes ? `<tr><td style="padding: 8px 0; color: #5C5A55;">Anmerkungen</td><td style="padding: 8px 0;">${booking.notes}</td></tr>` : ''}
        </table>
        <div style="margin-top: 2rem;">
          <a href="https://beautyfacelift.ch/admin/" style="display: inline-block; padding: 12px 24px; background: #CFA65E; color: white; text-decoration: none; border-radius: 100px; font-size: 14px;">Admin öffnen</a>
        </div>
      </div>
      `
    );

    // 2. Confirmation email to customer
    await sendEmail(
      booking.customer_email,
      `Ihre Buchung bei Beauty Face Lift — ${formatDate(booking.booking_date)}`,
      `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #EDEBE6;">
        <h2 style="font-family: 'Cormorant Garamond', serif; color: #121212; margin-bottom: 0.5rem;">Vielen Dank, ${booking.customer_name}!</h2>
        <p style="color: #5C5A55; margin-bottom: 2rem;">Ihre Buchung wurde erfolgreich erstellt.</p>

        <div style="background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #5C5A55; font-size: 14px;">Datum</td><td style="padding: 8px 0; font-weight: 500;">${formatDate(booking.booking_date)}</td></tr>
            <tr><td style="padding: 8px 0; color: #5C5A55; font-size: 14px;">Uhrzeit</td><td style="padding: 8px 0; font-weight: 500;">${booking.booking_time} Uhr</td></tr>
          </table>
        </div>

        <div style="background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
          <p style="font-weight: 500; margin-bottom: 0.5rem;">Adresse</p>
          <p style="color: #5C5A55; margin: 0;">Beauty Face Lift<br>Bahnhofstrasse 94<br>8001 Zürich</p>
          <a href="https://maps.google.com/?q=Bahnhofstrasse+94+8001+Zürich" style="display: inline-block; margin-top: 0.75rem; color: #CFA65E; text-decoration: underline;">In Google Maps öffnen</a>
        </div>

        <p style="color: #5C5A55; font-size: 13px;">
          Bei Fragen oder Änderungen erreichen Sie uns unter
          <a href="tel:+41792143462" style="color: #CFA65E;">+41 79 214 34 62</a> oder
          <a href="mailto:info@beautyfacelift.ch" style="color: #CFA65E;">info@beautyfacelift.ch</a>.
        </p>
      </div>
      `
    );
  }

  if (payload.type === 'UPDATE' && payload.old_record) {
    const oldStatus = payload.old_record.status;
    const newStatus = (payload.record as any).status;

    if (oldStatus !== newStatus && newStatus === 'confirmed') {
      await sendEmail(
        booking.customer_email,
        `Buchung bestätigt — ${formatDate(booking.booking_date)}`,
        `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #121212;">Ihre Buchung wurde bestätigt!</h2>
          <p>Wir freuen uns auf Sie am <strong>${formatDate(booking.booking_date)} um ${booking.booking_time} Uhr</strong>.</p>
          <p style="color: #5C5A55;">Beauty Face Lift, Bahnhofstrasse 94, 8001 Zürich</p>
        </div>
        `
      );
    }

    if (oldStatus !== newStatus && newStatus === 'cancelled') {
      await sendEmail(
        booking.customer_email,
        `Buchung storniert — ${formatDate(booking.booking_date)}`,
        `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #121212;">Buchung storniert</h2>
          <p>Ihre Buchung am <strong>${formatDate(booking.booking_date)} um ${booking.booking_time} Uhr</strong> wurde storniert.</p>
          <p style="color: #5C5A55;">Falls eine Anzahlung geleistet wurde, wird diese automatisch erstattet.</p>
          <p>Bei Fragen: <a href="tel:+41792143462" style="color: #CFA65E;">+41 79 214 34 62</a></p>
        </div>
        `
      );
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
