import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

/** Lazy-load Stripe.js (client-side only) */
export function getStripe() {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
