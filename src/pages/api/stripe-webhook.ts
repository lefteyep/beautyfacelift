import type { APIRoute } from 'astro';
import { getServiceClient } from '../../lib/supabase';

/** Verify Stripe webhook signature using Web Crypto API (Cloudflare Workers compatible) */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) return false;

  // Check timestamp is within 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === sig;
}

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const payload = await request.text();

  const isValid = await verifyStripeSignature(payload, signature, webhookSecret);
  if (!isValid) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);
  const supabase = getServiceClient();

  if (event.type === 'payment_intent.succeeded') {
    const bookingId = event.data.object.metadata?.booking_id;
    if (bookingId) {
      await supabase
        .from('bookings')
        .update({
          deposit_paid: true,
          stripe_payment_id: event.data.object.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
    }
  }

  if (event.type === 'charge.refunded') {
    const paymentIntentId = event.data.object.payment_intent;
    if (paymentIntentId) {
      await supabase
        .from('bookings')
        .update({
          deposit_paid: false,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_id', paymentIntentId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
