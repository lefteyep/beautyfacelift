// Europe/Zurich <-> UTC for the lead cockpit and the automations, via Intl only (no library).
// Stored timestamps are ISO-8601 UTC strings; the studio thinks in Zurich local time.
import { OPENING_HOURS_WEEKLY } from '../../shared/leads';

const TIME_ZONE = 'Europe/Zurich';
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const PARTS_FORMAT = new Intl.DateTimeFormat('de-CH', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

type ZurichParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

/** Zurich wall-clock parts of a UTC instant. */
function zurichParts(date: Date): ZurichParts {
  const parts: Record<string, number> = {};
  for (const part of PARTS_FORMAT.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === 24 ? 0 : parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Offset of Zurich local time against UTC at `instantMs`, in ms (+1 h in winter, +2 h in summer). */
function zurichOffsetMs(instantMs: number): number {
  const p = zurichParts(new Date(instantMs));
  const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return localAsUtc - Math.floor(instantMs / 1000) * 1000;
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Zurich local date + time to an ISO UTC string with milliseconds:
 * `2026-11-03` + `14:30` → `2026-11-03T13:30:00.000Z`; `2026-07-01` + `14:30` → `2026-07-01T12:30:00.000Z`.
 * Null for anything that is not a real calendar date `YYYY-MM-DD` and a time `HH:MM` (00:00–23:59).
 */
export function zurichToUtc(date: string, time: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return null;
  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hour, minute] = timeMatch.slice(1).map(Number);
  if (hour > 23 || minute > 59) return null;

  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(localAsUtc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;

  // First guess with the offset at the local time read as UTC, then once more with the offset at the result
  // (only differs within a few hours of a DST switch).
  let instant = localAsUtc - zurichOffsetMs(localAsUtc);
  instant = localAsUtc - zurichOffsetMs(instant);
  return new Date(instant).toISOString();
}

/** `3.11.2026` or, with `withTime`, `3.11.2026, 14:30` (Zurich time). Empty string for an invalid date. */
export function formatZurich(iso: string | Date, { withTime = false }: { withTime?: boolean } = {}): string {
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const p = zurichParts(date);
  const day = `${p.day}.${p.month}.${p.year}`;
  return withTime ? `${day}, ${pad(p.hour)}:${pad(p.minute)}` : day;
}

/** Zurich date and time of an instant in the shapes of `<input type="date">` and `<input type="time">`. */
export function zurichInputValues(iso: string): { date: string; time: string } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const p = zurichParts(date);
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

/** Calendar date `YYYY-MM-DD` shifted by `days` (pure calendar arithmetic, no time zone). */
function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** Zurich calendar date and weekday (0 = Sunday, as Date#getDay()) of an instant. */
function zurichDay(date: Date): { date: string; weekday: number; minutes: number } {
  const p = zurichParts(date);
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    weekday: new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay(),
    minutes: p.hour * 60 + p.minute,
  };
}

export type IsoWeek = { year: number; week: number; start: string; end: string };

/**
 * ISO week (Monday–Sunday) of an instant in Zurich: week-numbering year, week number, and the
 * week's bounds as UTC ISO strings (`start` = Monday 00:00 Zurich, `end` = the next Monday 00:00 Zurich, exclusive).
 */
export function isoWeek(dateUtc: Date): IsoWeek {
  const { date, weekday } = zurichDay(dateUtc);
  const isoWeekday = weekday === 0 ? 7 : weekday; // Monday 1 … Sunday 7
  const monday = addDays(date, 1 - isoWeekday);
  const thursday = addDays(date, 4 - isoWeekday);
  const [thursdayYear] = thursday.split('-').map(Number);
  const dayOfYear = (Date.parse(`${thursday}T00:00:00Z`) - Date.UTC(thursdayYear, 0, 1)) / DAY_MS + 1;
  return {
    year: thursdayYear,
    week: Math.floor((dayOfYear - 1) / 7) + 1,
    start: zurichToUtc(monday, '00:00') as string,
    end: zurichToUtc(addDays(monday, 7), '00:00') as string,
  };
}

/** `gerade eben`, `vor 5 Min.`, `vor 2 Std.`, `vor 3 Tagen` (under a week); otherwise the date `d.M.yyyy`. */
export function relativeTime(iso: string, now: Date): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const diff = now.getTime() - then.getTime();
  if (diff < 0 || diff >= 7 * DAY_MS) return formatZurich(then);
  if (diff < MINUTE_MS) return 'gerade eben';
  if (diff < HOUR_MS) return `vor ${Math.floor(diff / MINUTE_MS)} Min.`;
  if (diff < DAY_MS) return `vor ${Math.floor(diff / HOUR_MS)} Std.`;
  const days = Math.floor(diff / DAY_MS);
  return days === 1 ? 'vor 1 Tag' : `vor ${days} Tagen`;
}

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** True while the studio is open (OPENING_HOURS_WEEKLY, Zurich time; closing time exclusive). */
export function isWithinOpeningHours(dateUtc: Date): boolean {
  const { weekday, minutes } = zurichDay(dateUtc);
  const window = OPENING_HOURS_WEEKLY[weekday];
  return window !== null && minutes >= toMinutes(window.open) && minutes < toMinutes(window.close);
}

/** The instant itself while the studio is open, else the start of the next opening window. */
export function nextOpening(dateUtc: Date): Date {
  if (isWithinOpeningHours(dateUtc)) return dateUtc;
  const { date, weekday, minutes } = zurichDay(dateUtc);
  for (let offset = 0; offset <= 7; offset += 1) {
    const window = OPENING_HOURS_WEEKLY[(weekday + offset) % 7];
    if (!window) continue;
    if (offset === 0 && minutes >= toMinutes(window.open)) continue;
    const start = zurichToUtc(addDays(date, offset), window.open);
    if (start) return new Date(start);
  }
  return dateUtc; // unreachable while at least one day has opening hours
}
