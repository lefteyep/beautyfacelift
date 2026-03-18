import { useState, useEffect } from 'react';
import { getStripe } from '../../../lib/stripe';

interface Props {
  bookingId: string;
  depositAmount: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function DepositStep({ bookingId, depositAmount, onComplete, onSkip }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [cardElement, setCardElement] = useState<any>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);

  useEffect(() => {
    // Create PaymentIntent on mount
    fetch('/api/create-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.client_secret) {
          setClientSecret(data.client_secret);
          initStripeElements(data.client_secret);
        } else {
          setError(data.error || 'Fehler beim Erstellen der Zahlung.');
        }
      })
      .catch(() => setError('Netzwerkfehler. Bitte versuchen Sie es erneut.'));
  }, [bookingId]);

  async function initStripeElements(secret: string) {
    const stripe = await getStripe();
    if (!stripe) {
      setError('Stripe konnte nicht geladen werden.');
      return;
    }
    setStripeInstance(stripe);
    const elements = stripe.elements({ clientSecret: secret });
    const card = elements.create('payment');
    card.mount('#stripe-card-element');
    card.on('ready', () => setCardReady(true));
    setCardElement(card);
  }

  async function handlePay() {
    if (!stripeInstance || !clientSecret) return;
    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripeInstance.confirmPayment({
      elements: stripeInstance.elements,
      confirmParams: { return_url: window.location.origin + '/buchung-bestaetigt/?id=' + bookingId },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Zahlung fehlgeschlagen.');
      setLoading(false);
    } else {
      onComplete();
    }
  }

  return (
    <div className="booking-deposit">
      <div className="booking-summary" style={{ marginBottom: '2rem' }}>
        <div className="booking-summary-row">
          <span>Anzahlung</span>
          <strong>CHF {depositAmount.toFixed(2)}</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: 'none' }}>
          Die Anzahlung wird bei Ihrem Termin verrechnet. Bei Stornierung wird sie vollständig erstattet.
        </p>
      </div>

      <div id="stripe-card-element" style={{
        padding: '14px 16px',
        border: '1px solid rgba(18,18,18,0.15)',
        borderRadius: '12px',
        background: 'var(--bg-secondary)',
        minHeight: '44px',
        marginBottom: '1.5rem',
      }} />

      {error && <div className="booking-error-banner">{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button
          className="pill-btn booking-submit"
          onClick={handlePay}
          disabled={loading || !cardReady}
        >
          {loading ? 'Wird verarbeitet...' : `CHF ${depositAmount.toFixed(2)} bezahlen`}
        </button>
        <button
          className="pill-btn pill-btn-outline booking-submit"
          onClick={onSkip}
          disabled={loading}
          type="button"
        >
          Ohne Anzahlung buchen
        </button>
      </div>
    </div>
  );
}
