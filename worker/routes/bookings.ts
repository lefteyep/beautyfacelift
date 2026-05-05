import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

const BOOKING_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const BOOKING_RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_BOOKING_DAYS_AHEAD = 90;
const SLOT_INTERVAL_MINUTES = 30;
const BOOKING_BUFFER_MINUTES = 15;
const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;
const bookingRateLimit = new Map<string, number[]>();

type BookingRequestBody = {
  service_id?: unknown;
  customer_name?: unknown;
  customer_email?: unknown;
  customer_phone?: unknown;
  booking_date?: unknown;
  booking_time?: unknown;
  notes?: unknown;
  utm_data?: unknown;
};

type ServiceRow = {
  duration_minutes: number;
  deposit_chf: number | null;
};

type AvailabilityRow = {
  start_time: string;
  end_time: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = bookingRateLimit.get(ip) ?? [];
  const activeHits = existing.filter((timestamp) => now - timestamp < BOOKING_RATE_LIMIT_WINDOW_MS);

  if (activeHits.length >= BOOKING_RATE_LIMIT_MAX_REQUESTS) {
    bookingRateLimit.set(ip, activeHits);
    return false;
  }

  activeHits.push(now);
  bookingRateLimit.set(ip, activeHits);

  if (bookingRateLimit.size > 1000) {
    for (const [key, hits] of bookingRateLimit.entries()) {
      const freshHits = hits.filter((timestamp) => now - timestamp < BOOKING_RATE_LIMIT_WINDOW_MS);
      if (freshHits.length === 0) bookingRateLimit.delete(key);
      else bookingRateLimit.set(key, freshHits);
    }
  }

  return true;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSwissPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return `+41${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith('41')) return `+${digits}`;
  return null;
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

function minutesToTime(totalMinutes: number): string | null {
  if (totalMinutes < 0 || totalMinutes > 24 * 60) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeUtmData(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const serialized = JSON.stringify(value);
  if (serialized.length > 4000) return null;
  return value as Record<string, unknown>;
}

function validateRequestBody(body: BookingRequestBody): {
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  bookingStartMinutes: number;
  notes: string | null;
  utmData: Record<string, unknown> | null;
} | { error: string } {
  const serviceId = getString(body.service_id);
  const customerName = getString(body.customer_name);
  const customerEmail = getString(body.customer_email).toLowerCase();
  const customerPhone = normalizeSwissPhone(getString(body.customer_phone));
  const bookingDate = getString(body.booking_date);
  const bookingTime = getString(body.booking_time);
  const notes = getString(body.notes);
  const bookingStartMinutes = parseTimeToMinutes(bookingTime);

  if (!serviceId || !isUuid(serviceId)) return { error: 'Bitte wählen Sie eine gültige Behandlung aus.' };
  if (!customerName || customerName.length < 2 || customerName.length > 120) return { error: 'Bitte geben Sie einen gültigen Namen an.' };
  if (!customerEmail || !isValidEmail(customerEmail)) return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' };
  if (!customerPhone) return { error: 'Bitte geben Sie eine gültige Schweizer Telefonnummer an.' };
  if (!isValidDateString(bookingDate)) return { error: 'Bitte wählen Sie ein gültiges Datum aus.' };
  if (bookingStartMinutes === null) return { error: 'Bitte wählen Sie eine gültige Uhrzeit aus.' };
  if (bookingStartMinutes % SLOT_INTERVAL_MINUTES !== 0) return { error: 'Bitte wählen Sie einen Termin im 30-Minuten-Raster aus.' };
  if (notes.length > 1000) return { error: 'Die Anmerkungen sind zu lang.' };

  const today = getZurichDateString();
  if (bookingDate < today) return { error: 'Termine in der Vergangenheit sind nicht möglich.' };
  if (bookingDate > addDays(today, MAX_BOOKING_DAYS_AHEAD)) return { error: 'Termine sind maximal 90 Tage im Voraus möglich.' };

  const utmData = normalizeUtmData(body.utm_data);
  if (body.utm_data && !utmData) return { error: 'Die Tracking-Daten sind ungültig.' };

  return {
    serviceId,
    customerName,
    customerEmail,
    customerPhone,
    bookingDate,
    bookingTime,
    bookingStartMinutes,
    notes: notes || null,
    utmData,
  };
}

export async function bookingsRoute(request: Request, env: Env): Promise<Response> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Buchungen sind gerade nicht verfügbar.' }, 503);
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: 'Zu viele Buchungsversuche. Bitte versuchen Sie es in einigen Minuten erneut.' }, 429);
  }

  let body: BookingRequestBody;
  try {
    body = await request.json() as BookingRequestBody;
  } catch {
    return jsonResponse({ error: 'Ungültige Anfrage.' }, 400);
  }

  const validated = validateRequestBody(body);
  if ('error' in validated) {
    return jsonResponse({ error: validated.error }, 400);
  }

  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes, deposit_chf')
    .eq('id', validated.serviceId)
    .eq('is_active', true)
    .maybeSingle<ServiceRow>();

  if (!service) {
    return jsonResponse({ error: 'Behandlung nicht gefunden.' }, 404);
  }

  const bookingEndMinutes = validated.bookingStartMinutes + service.duration_minutes;
  const endTime = minutesToTime(bookingEndMinutes);
  if (!endTime || bookingEndMinutes > 24 * 60) {
    return jsonResponse({ error: 'Die gewählte Behandlung passt nicht in diesen Tag.' }, 400);
  }

  const { data: blockedDate } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', validated.bookingDate)
    .maybeSingle<{ id: string }>();

  if (blockedDate) {
    return jsonResponse({ error: 'An diesem Datum sind keine Termine verfügbar.' }, 400);
  }

  const { data: availability } = await supabase
    .from('availability')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek(validated.bookingDate))
    .eq('is_active', true)
    .maybeSingle<AvailabilityRow>();

  if (!availability) {
    return jsonResponse({ error: 'An diesem Wochentag sind keine Termine verfügbar.' }, 400);
  }

  const availabilityStart = parseTimeToMinutes(availability.start_time);
  const availabilityEnd = parseTimeToMinutes(availability.end_time);
  if (availabilityStart === null || availabilityEnd === null || validated.bookingStartMinutes < availabilityStart || bookingEndMinutes > availabilityEnd) {
    return jsonResponse({ error: 'Der gewählte Termin liegt außerhalb der Öffnungszeiten.' }, 400);
  }

  const bufferedStartTime = minutesToTime(Math.max(0, validated.bookingStartMinutes - BOOKING_BUFFER_MINUTES));
  const bufferedEndTime = minutesToTime(Math.min(24 * 60, bookingEndMinutes + BOOKING_BUFFER_MINUTES));
  if (!bufferedStartTime || !bufferedEndTime) {
    return jsonResponse({ error: 'Die gewählte Uhrzeit ist ungültig.' }, 400);
  }

  const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const [emailDuplicate, phoneDuplicate] = await Promise.all([
    supabase
      .from('bookings')
      .select('id')
      .eq('service_id', validated.serviceId)
      .eq('booking_date', validated.bookingDate)
      .eq('booking_time', validated.bookingTime)
      .eq('customer_email', validated.customerEmail)
      .gte('created_at', duplicateSince)
      .in('status', ['pending', 'confirmed'])
      .limit(1),
    supabase
      .from('bookings')
      .select('id')
      .eq('service_id', validated.serviceId)
      .eq('booking_date', validated.bookingDate)
      .eq('booking_time', validated.bookingTime)
      .eq('customer_phone', validated.customerPhone)
      .gte('created_at', duplicateSince)
      .in('status', ['pending', 'confirmed'])
      .limit(1),
  ]);

  if ((emailDuplicate.data && emailDuplicate.data.length > 0) || (phoneDuplicate.data && phoneDuplicate.data.length > 0)) {
    return jsonResponse({ error: 'Diese Buchungsanfrage wurde bereits übermittelt.' }, 409);
  }

  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', validated.bookingDate)
    .in('status', ['pending', 'confirmed'])
    .lt('booking_time', bufferedEndTime)
    .gt('end_time', bufferedStartTime)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    return jsonResponse({ error: 'Termin nicht mehr verfügbar. Bitte andere Uhrzeit wählen.' }, 409);
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_id: validated.serviceId,
      customer_name: validated.customerName,
      customer_email: validated.customerEmail,
      customer_phone: validated.customerPhone,
      booking_date: validated.bookingDate,
      booking_time: validated.bookingTime,
      end_time: endTime,
      status: 'pending',
      deposit_amount: service.deposit_chf || 0,
      notes: validated.notes,
      utm_data: validated.utmData,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23P01' || error.code === '23505') {
      return jsonResponse({ error: 'Termin nicht mehr verfügbar. Bitte andere Uhrzeit wählen.' }, 409);
    }

    console.error('Booking insert failed:', error.code);
    return jsonResponse({ error: 'Buchung fehlgeschlagen.' }, 500);
  }

  return jsonResponse({ booking: { id: booking.id }, redirect: `/buchung-bestaetigt/?id=${booking.id}` }, 201);
}
