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

  const { data: booking } = await supabase
    .from('bookings')
    .select('stripe_payment_id, deposit_paid')
    .eq('id', bookingId)
    .single();

  if (!booking || !booking.deposit_paid || !booking.stripe_payment_id) {
    return new Response(JSON.stringify({ error: 'Keine erstattungsfähige Anzahlung gefunden.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create refund via Stripe REST API
  const stripeRes = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      payment_intent: booking.stripe_payment_id,
    }).toString(),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.json();
    console.error('Stripe refund error:', err);
    return new Response(JSON.stringify({ error: 'Erstattung fehlgeschlagen.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'refunded' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
