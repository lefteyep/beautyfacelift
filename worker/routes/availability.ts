import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

const SLOT_INTERVAL_MINUTES = 30;
const BOOKING_BUFFER_MINUTES = 15;

type AvailabilityRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type BookingRow = {
  booking_date: string;
  booking_time: string;
  end_time: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': cacheControl,
    },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getZurichDateTime(date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function dayOfWeek(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function hasAvailableSlot(
  date: string,
  duration: number,
  availability: AvailabilityRow[],
  bookings: BookingRow[],
  zurichNow: { date: string; minutes: number },
): boolean {
  if (duration <= 0) return false;

  const activeWindows = availability.filter((window) => window.day_of_week === dayOfWeek(date));
  if (activeWindows.length === 0) return false;

  const bookedRanges = bookings
    .filter((booking) => booking.booking_date === date)
    .map((booking) => {
      const start = parseTimeToMinutes(booking.booking_time);
      const end = parseTimeToMinutes(booking.end_time);
      return start === null || end === null ? null : { start, end };
    })
    .filter((range): range is { start: number; end: number } => Boolean(range));

  const isToday = date === zurichNow.date;

  return activeWindows.some((window) => {
    const startMin = parseTimeToMinutes(window.start_time);
    const endMin = parseTimeToMinutes(window.end_time);
    if (startMin === null || endMin === null || startMin >= endMin) return false;

    for (let start = startMin; start + duration <= endMin; start += SLOT_INTERVAL_MINUTES) {
      if (isToday && start <= zurichNow.minutes) continue;

      const slotEnd = start + duration;
      const conflict = bookedRanges.some((booking) => (
        start < booking.end + BOOKING_BUFFER_MINUTES
        && slotEnd + BOOKING_BUFFER_MINUTES > booking.start
      ));

      if (!conflict) return true;
    }

    return false;
  });
}

export async function availabilityRoute(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const month = url.searchParams.get('month');
  const serviceId = url.searchParams.get('service_id')?.trim() ?? '';

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return jsonResponse({ error: 'Parameter "month" fehlt (YYYY-MM).' }, 400);
  }

  if (serviceId && !isUuid(serviceId)) {
    return jsonResponse({ error: 'Ungültige Behandlung.' }, 400);
  }

  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  const startDate = formatDate(year, monthNum, 1);
  const endDate = formatDate(year, monthNum, daysInMonth);

  const { data: availability } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('is_active', true);

  const { data: blocked } = await supabase
    .from('blocked_dates').select('date')
    .gte('date', startDate)
    .lte('date', endDate);

  const blockedSet = new Set((blocked || []).map(b => b.date));
  const activeAvailability = (availability || []) as AvailabilityRow[];
  const workingDays = new Set(activeAvailability.map(a => a.day_of_week));
  const zurichNow = getZurichDateTime();
  let serviceDuration: number | null = null;
  let bookings: BookingRow[] = [];

  if (serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .eq('is_active', true)
      .maybeSingle<{ duration_minutes: number }>();

    if (!service) {
      return jsonResponse({ error: 'Behandlung nicht gefunden.' }, 404);
    }

    serviceDuration = service.duration_minutes;

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('booking_date, booking_time, end_time')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .in('status', ['pending', 'confirmed']);

    bookings = (existingBookings || []) as BookingRow[];
  }

  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = formatDate(year, monthNum, day);
    const isBaseAvailable = dateStr >= zurichNow.date
      && workingDays.has(dayOfWeek(dateStr))
      && !blockedSet.has(dateStr);

    const hasServiceSlot = serviceDuration === null
      || hasAvailableSlot(dateStr, serviceDuration, activeAvailability, bookings, zurichNow);

    if (isBaseAvailable && hasServiceSlot) {
      dates.push(dateStr);
    }
  }

  return jsonResponse({ dates }, 200, 'public, max-age=60');
}
