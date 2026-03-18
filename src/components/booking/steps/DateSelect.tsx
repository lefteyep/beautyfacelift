import { Calendar } from '../ui/Calendar';

interface Props {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
  loading: boolean;
}

export function DateSelect({ availableDates, selectedDate, onSelect, onMonthChange, loading }: Props) {
  return (
    <div className="booking-date-select">
      {loading ? (
        <div className="booking-loading">Verfügbarkeit wird geladen...</div>
      ) : (
        <Calendar
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelect={onSelect}
          onMonthChange={onMonthChange}
        />
      )}
    </div>
  );
}
