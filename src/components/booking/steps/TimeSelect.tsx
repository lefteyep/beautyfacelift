interface Props {
  slots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  loading: boolean;
  selectedDate: string;
  error?: string | null;
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

export function TimeSelect({ slots, selectedTime, onSelect, loading, selectedDate, error }: Props) {
  return (
    <div className="booking-time-select">
      <p className="booking-time-date">{formatDate(selectedDate)}</p>
      {loading ? (
        <div className="booking-loading" role="status" aria-live="polite">Verfügbare Zeiten werden geladen...</div>
      ) : error ? (
        <div className="booking-state" role="alert">
          <h3>Zeiten konnten nicht geladen werden.</h3>
          <p>{error} Bitte wählen Sie ein anderes Datum oder kontaktieren Sie uns direkt.</p>
          <div className="booking-state-actions">
            <a href="/kontakt/" className="pill-btn pill-btn-outline">Kontakt aufnehmen</a>
            <a href="https://wa.me/41792143462" className="booking-text-link">WhatsApp schreiben</a>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <div className="booking-state" role="status">
          <h3>Keine freien Zeiten an diesem Tag.</h3>
          <p>Bitte wählen Sie ein anderes Datum. Für kurzfristige Wünsche erreichen Sie uns direkt per WhatsApp.</p>
          <div className="booking-state-actions">
            <a href="https://wa.me/41792143462" className="booking-text-link">Per WhatsApp anfragen</a>
          </div>
        </div>
      ) : (
        <div className="booking-time-grid">
          {slots.map(slot => (
            <button
              key={slot}
              type="button"
              className={`booking-time-pill ${selectedTime === slot ? 'selected' : ''}`}
              onClick={() => onSelect(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
