import { useRef, useState } from 'react';
import { isValidEmail, isValidSwissPhone } from '../../../lib/validation';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_chf: number;
}

interface Props {
  service: Service;
  selectedDate: string;
  selectedTime: string;
  onSubmit: (data: { name: string; email: string; phone: string; notes: string }) => void;
  submitting: boolean;
  error: string | null;
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

export function CustomerForm({ service, selectedDate, selectedTime, onSubmit, submitting, error }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (name.trim().length < 2) errors.name = 'Bitte geben Sie Ihren Namen ein.';
    if (!isValidEmail(email)) errors.email = 'Bitte geben Sie eine gültige E-Mail ein.';
    if (!isValidSwissPhone(phone)) errors.phone = 'Bitte geben Sie eine gültige Telefonnummer ein (+41...).';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.keys(errors)[0] as keyof typeof fieldRefs;
      fieldRefs[firstError]?.current?.focus();
      return;
    }

    setValidationErrors({});
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim() });
  }

  return (
    <div className="booking-customer-form">
      {/* Summary */}
      <div className="booking-summary">
        <div className="booking-summary-row">
          <span>Behandlung</span>
          <strong>{service.name}</strong>
        </div>
        <div className="booking-summary-row">
          <span>Datum</span>
          <strong>{formatDate(selectedDate)}</strong>
        </div>
        <div className="booking-summary-row">
          <span>Uhrzeit</span>
          <strong>{selectedTime} Uhr</strong>
        </div>
        <div className="booking-summary-row">
          <span>Dauer</span>
          <strong>{service.duration_minutes} Min.</strong>
        </div>
        <div className="booking-summary-row">
          <span>Preis</span>
          <strong>CHF {service.price_chf.toFixed(0)}</strong>
        </div>
      </div>
      <p className="booking-reassurance">Ihre Anfrage wird direkt an Beauty Face Lift übermittelt. Bei Rückfragen melden wir uns persönlich per Telefon oder E-Mail.</p>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="booking-field">
          <label htmlFor="booking-name">Name *</label>
          <input
            id="booking-name"
            ref={fieldRefs.name}
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (validationErrors.name) setValidationErrors({ ...validationErrors, name: '' });
            }}
            placeholder="Ihr vollständiger Name"
            required
            autoComplete="name"
            aria-invalid={Boolean(validationErrors.name)}
            aria-describedby={validationErrors.name ? 'booking-name-error' : undefined}
          />
          {validationErrors.name && <span className="booking-error" id="booking-name-error" role="alert">{validationErrors.name}</span>}
        </div>

        <div className="booking-field">
          <label htmlFor="booking-email">E-Mail *</label>
          <input
            id="booking-email"
            ref={fieldRefs.email}
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' });
            }}
            placeholder="ihre@email.ch"
            required
            autoComplete="email"
            aria-invalid={Boolean(validationErrors.email)}
            aria-describedby={validationErrors.email ? 'booking-email-error' : undefined}
          />
          {validationErrors.email && <span className="booking-error" id="booking-email-error" role="alert">{validationErrors.email}</span>}
        </div>

        <div className="booking-field">
          <label htmlFor="booking-phone">Telefon *</label>
          <input
            id="booking-phone"
            ref={fieldRefs.phone}
            type="tel"
            value={phone}
            onChange={e => {
              setPhone(e.target.value);
              if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: '' });
            }}
            placeholder="+41 79 123 45 67"
            required
            autoComplete="tel"
            aria-invalid={Boolean(validationErrors.phone)}
            aria-describedby={validationErrors.phone ? 'booking-phone-error' : undefined}
          />
          {validationErrors.phone && <span className="booking-error" id="booking-phone-error" role="alert">{validationErrors.phone}</span>}
        </div>

        <div className="booking-field">
          <label htmlFor="booking-notes">Anmerkungen (optional)</label>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Besondere Wünsche, Hautprobleme, etc."
            rows={3}
          />
        </div>

        {error && <div className="booking-error-banner" role="alert">{error}</div>}

        <button type="submit" className="pill-btn booking-submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Wird gebucht...' : 'Jetzt verbindlich buchen'}
        </button>
      </form>
    </div>
  );
}
