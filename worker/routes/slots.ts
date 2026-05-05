import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

const SLOT_INTERVAL_MINUTES = 30;
const BOOKING_BUFFER_MINUTES = 15;
const MAX_BOOKING_DAYS_AHEAD = 90;

type AvailabilityRow = {
  start_time: string;
  end_time: string;
};

type BookingRow = {
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

function isValidDateString(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function getZurichDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day + days));
  return parsed.toISOString().slice(0, 10);
}

function dayOfWeek(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export async function slotsRoute(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const date = url.searchParams.get('date')?.trim() ?? '';
  const serviceId = url.searchParams.get('service_id')?.trim() ?? '';

  if (!date || !serviceId) {
    return jsonResponse({ error: 'Parameter date und service_id fehlen.' }, 400);
  }

  if (!isValidDateString(date) || !isUuid(serviceId)) {
    return jsonResponse({ error: 'Ungültige Parameter.' }, 400);
  }

  const today = getZurichDateString();
  if (date < today || date > addDays(today, MAX_BOOKING_DAYS_AHEAD)) {
    return jsonResponse({ error: 'Datum außerhalb des Buchungsfensters.' }, 400);
  }

  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .eq('is_active', true)
    .maybeSingle<{ duration_minutes: number }>();

  if (!service) {
    return jsonResponse({ error: 'Behandlung nicht gefunden.' }, 404);
  }

  const { data: blockedDate } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', date)
    .maybeSingle<{ id: string }>();

  if (blockedDate) {
    return jsonResponse({ slots: [] }, 200, 'public, max-age=60');
  }

  const { data: availability } = await supabase
    .from('availability')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek(date))
    .eq('is_active', true)
    .maybeSingle<AvailabilityRow>();

  if (!availability) {
    return jsonResponse({ slots: [] }, 200, 'public, max-age=60');
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time, end_time')
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed']);

  const duration = service.duration_minutes;
  const startMin = parseTimeToMinutes(availability.start_time);
  const endMin = parseTimeToMinutes(availability.end_time);

  if (startMin === null || endMin === null || duration <= 0 || startMin >= endMin) {
    return jsonResponse({ slots: [] }, 200, 'public, max-age=60');
  }

  const bookedRanges = ((bookings || []) as BookingRow[]).map((booking) => {
    const start = parseTimeToMinutes(booking.booking_time);
    const end = parseTimeToMinutes(booking.end_time);
    return start === null || end === null ? null : { start, end };
  }).filter((range): range is { start: number; end: number } => Boolean(range));

  const now = new Date();
  const isToday = date === today;
  const zurichParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const zurichTime = Object.fromEntries(zurichParts.map((part) => [part.type, part.value]));
  const currentMin = isToday ? Number(zurichTime.hour) * 60 + Number(zurichTime.minute) : 0;

  const slots: string[] = [];
  for (let start = startMin; start + duration <= endMin; start += SLOT_INTERVAL_MINUTES) {
    if (isToday && start <= currentMin) continue;

    const slotEnd = start + duration;
    const conflict = bookedRanges.some((booking) => (
      start < booking.end + BOOKING_BUFFER_MINUTES
      && slotEnd + BOOKING_BUFFER_MINUTES > booking.start
    ));

    if (!conflict) {
      slots.push(minutesToTime(start));
    }
  }

  return jsonResponse({ slots }, 200, 'public, max-age=60');
}
