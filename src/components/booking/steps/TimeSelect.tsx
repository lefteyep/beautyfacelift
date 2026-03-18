interface Props {
  slots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  loading: boolean;
  selectedDate: string;
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

export function TimeSelect({ slots, selectedTime, onSelect, loading, selectedDate }: Props) {
  return (
    <div className="booking-time-select">
      <p className="booking-time-date">{formatDate(selectedDate)}</p>
      {loading ? (
        <div className="booking-loading">Verfügbare Zeiten werden geladen...</div>
      ) : slots.length === 0 ? (
        <div className="booking-empty">Keine freien Termine an diesem Tag. Bitte wählen Sie ein anderes Datum.</div>
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
