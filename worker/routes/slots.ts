import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

export async function slotsRoute(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const serviceId = url.searchParams.get('service_id');

  if (!date || !serviceId) {
    return new Response(JSON.stringify({ error: 'Parameter date und service_id fehlen.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
  const dayOfWeek = new Date(date).getDay();

  const { data: availability } = await supabase
    .from('availability').select('start_time, end_time')
    .eq('day_of_week', dayOfWeek).eq('is_active', true).single();

  if (!availability) {
    return new Response(JSON.stringify({ slots: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: service } = await supabase
    .from('services').select('duration_minutes').eq('id', serviceId).single();

  if (!service) {
    return new Response(JSON.stringify({ error: 'Behandlung nicht gefunden.' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: bookings } = await supabase
    .from('bookings').select('booking_time, end_time')
    .eq('booking_date', date).in('status', ['pending', 'confirmed']);

  const BUFFER = 15;
  const duration = service.duration_minutes;
  const [startH, startM] = availability.start_time.split(':').map(Number);
  const [endH, endM] = availability.end_time.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  const bookedRanges = (bookings || []).map((b: { booking_time: string; end_time: string }) => {
    const [bh, bm] = b.booking_time.split(':').map(Number);
    const [eh, em] = b.end_time.split(':').map(Number);
    return { start: bh * 60 + bm, end: eh * 60 + em };
  });

  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];
  const currentMin = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  const slots: string[] = [];
  for (let s = startMin; s + duration <= endMin; s += 30) {
    if (isToday && s <= currentMin) continue;
    const slotEnd = s + duration;
    const conflict = bookedRanges.some((b: { start: number; end: number }) => s < b.end + BUFFER && slotEnd + BUFFER > b.start);
    if (!conflict) {
      slots.push(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`);
    }
  }

  return new Response(JSON.stringify({ slots }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
