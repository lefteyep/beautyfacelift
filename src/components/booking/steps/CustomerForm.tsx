import { useState } from 'react';
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (name.trim().length < 2) errors.name = 'Bitte geben Sie Ihren Namen ein.';
    if (!isValidEmail(email)) errors.email = 'Bitte geben Sie eine gültige E-Mail ein.';
    if (!isValidSwissPhone(phone)) errors.phone = 'Bitte geben Sie eine gültige Telefonnummer ein (+41...).';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
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

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="booking-field">
          <label htmlFor="booking-name">Name *</label>
          <input
            id="booking-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ihr vollständiger Name"
            required
            autoComplete="name"
          />
          {validationErrors.name && <span className="booking-error">{validationErrors.name}</span>}
        </div>

        <div className="booking-field">
          <label htmlFor="booking-email">E-Mail *</label>
          <input
            id="booking-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ihre@email.ch"
            required
            autoComplete="email"
          />
          {validationErrors.email && <span className="booking-error">{validationErrors.email}</span>}
        </div>

        <div className="booking-field">
          <label htmlFor="booking-phone">Telefon *</label>
          <input
            id="booking-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+41 79 123 45 67"
            required
            autoComplete="tel"
          />
          {validationErrors.phone && <span className="booking-error">{validationErrors.phone}</span>}
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

        {error && <div className="booking-error-banner">{error}</div>}

        <button type="submit" className="pill-btn booking-submit" disabled={submitting}>
          {submitting ? 'Wird gebucht...' : 'Jetzt verbindlich buchen'}
        </button>
      </form>
    </div>
  );
}
