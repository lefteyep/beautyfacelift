import type { APIRoute } from 'astro';
import { getServiceClient } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const bookingId = body.booking_id as string;
  if (!bookingId) {
    return new Response(JSON.stringify({ error: 'booking_id fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe nicht konfiguriert.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getServiceClient();

  // Get booking + service details
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, service_id, deposit_amount, deposit_paid, customer_email')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return new Response(JSON.stringify({ error: 'Buchung nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (booking.deposit_paid) {
    return new Response(JSON.stringify({ error: 'Anzahlung bereits bezahlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!booking.deposit_amount || booking.deposit_amount <= 0) {
    return new Response(JSON.stringify({ error: 'Keine Anzahlung erforderlich.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create PaymentIntent via Stripe REST API (no Node SDK needed on Workers)
  const amountInCents = Math.round(booking.deposit_amount * 100);

  const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: String(amountInCents),
      currency: 'chf',
      'metadata[booking_id]': bookingId,
      receipt_email: booking.customer_email,
    }).toString(),
  });

  const paymentIntent = await stripeRes.json();

  if (!stripeRes.ok) {
    console.error('Stripe error:', paymentIntent);
    return new Response(JSON.stringify({ error: 'Zahlung konnte nicht erstellt werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    client_secret: paymentIntent.client_secret,
    amount: booking.deposit_amount,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
