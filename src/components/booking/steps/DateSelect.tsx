import { Calendar } from '../ui/Calendar';

interface Props {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
  loading: boolean;
  error?: string | null;
}

export function DateSelect({ availableDates, selectedDate, onSelect, onMonthChange, loading, error }: Props) {
  return (
    <div className="booking-date-select">
      {loading ? (
        <div className="booking-loading" role="status" aria-live="polite">Verfügbarkeit wird geladen...</div>
      ) : error ? (
        <div className="booking-state" role="alert">
          <h3>Verfügbarkeit konnte nicht geladen werden.</h3>
          <p>{error} Bitte kontaktieren Sie uns direkt oder versuchen Sie es später nochmals.</p>
          <div className="booking-state-actions">
            <a href="/kontakt/" className="pill-btn pill-btn-outline">Kontakt aufnehmen</a>
            <a href="https://wa.me/41792143462" className="booking-text-link">WhatsApp schreiben</a>
          </div>
        </div>
      ) : (
        <>
          {availableDates.size === 0 && (
            <div className="booking-inline-note" role="status">
              Keine freien Termine in diesem Monat. Bitte prüfen Sie den nächsten Monat oder kontaktieren Sie uns direkt.
            </div>
          )}
          <Calendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={onSelect}
            onMonthChange={onMonthChange}
          />
        </>
      )}
    </div>
  );
}
