import { useState } from 'react';

interface Props {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export function Calendar({ availableDates, selectedDate, onSelect, onMonthChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday-based: 0=Mon, 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function navigateMonth(delta: number) {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
    const monthStr = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
    onMonthChange(monthStr);
  }

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="booking-calendar">
      <div className="calendar-header">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          disabled={!canGoPrev}
          className="calendar-nav"
          aria-label="Vorheriger Monat"
        >
          ←
        </button>
        <span className="calendar-title">{MONTHS[viewMonth]} {viewYear}</span>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="calendar-nav"
          aria-label="Nächster Monat"
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="calendar-cell empty" />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isAvailable = availableDates.has(dateStr);
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              className={`calendar-cell ${isAvailable ? 'available' : 'disabled'} ${isSelected ? 'selected' : ''}`}
              disabled={!isAvailable}
              onClick={() => onSelect(dateStr)}
              aria-label={`${day}. ${MONTHS[viewMonth]}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
