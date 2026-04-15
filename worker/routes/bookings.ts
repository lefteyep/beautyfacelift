import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^(\+41|0)\d{9,10}$/.test(phone.replace(/\s+/g, ''));
}

export async function bookingsRoute(request: Request, env: Env): Promise<Response> {
  let body: Record<string, any>;
  try {
    body = await request.json() as Record<string, any>;
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.service_id || !body.customer_name || !isValidEmail(body.customer_email) || !isValidPhone(body.customer_phone) || !body.booking_date || !body.booking_time) {
    return new Response(JSON.stringify({ error: 'Bitte füllen Sie alle Pflichtfelder korrekt aus.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, key);

  const { data: service } = await supabase
    .from('services').select('duration_minutes, deposit_chf').eq('id', body.service_id).single();

  if (!service) {
    return new Response(JSON.stringify({ error: 'Behandlung nicht gefunden.' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  const [hours, mins] = body.booking_time.split(':').map(Number);
  const totalMin = hours * 60 + mins + service.duration_minutes;
  const endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

  const { data: conflicts } = await supabase
    .from('bookings').select('id').eq('booking_date', body.booking_date)
    .in('status', ['pending', 'confirmed'])
    .or(`and(booking_time.lt.${endTime},end_time.gt.${body.booking_time})`);

  if (conflicts && conflicts.length > 0) {
    return new Response(JSON.stringify({ error: 'Termin nicht mehr verfügbar. Bitte andere Uhrzeit wählen.' }), {
      status: 409, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_id: body.service_id,
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email.trim().toLowerCase(),
      customer_phone: body.customer_phone.trim(),
      booking_date: body.booking_date,
      booking_time: body.booking_time,
      end_time: endTime,
      status: 'pending',
      deposit_amount: service.deposit_chf || 0,
      notes: body.notes || null,
      utm_data: body.utm_data || null,
    })
    .select('id').single();

  if (error) {
    console.error('Booking insert failed:', JSON.stringify(error));
    return new Response(JSON.stringify({ error: 'Buchung fehlgeschlagen.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ booking: { id: booking.id }, redirect: `/buchung-bestaetigt/?id=${booking.id}` }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
}
