import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date');
  const serviceId = url.searchParams.get('service_id');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({ error: 'Parameter "date" fehlt (YYYY-MM-DD).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!serviceId) {
    return new Response(JSON.stringify({ error: 'Parameter "service_id" fehlt.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dayOfWeek = new Date(date).getDay();

  // Get working hours for this day of week
  const { data: availability } = await supabase
    .from('availability')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .single();

  if (!availability) {
    return new Response(JSON.stringify({ slots: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single();

  if (!service) {
    return new Response(JSON.stringify({ error: 'Behandlung nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get existing bookings for this date
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time, end_time')
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed']);

  const BUFFER_MINUTES = 15;
  const duration = service.duration_minutes;

  // Generate all possible slots
  const [startH, startM] = availability.start_time.split(':').map(Number);
  const [endH, endM] = availability.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const slots: string[] = [];
  const bookedRanges = (bookings || []).map(b => {
    const [bh, bm] = b.booking_time.split(':').map(Number);
    const [eh, em] = b.end_time.split(':').map(Number);
    return { start: bh * 60 + bm, end: eh * 60 + em };
  });

  // Check if we're looking at today — filter out past slots
  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  for (let slotStart = startMinutes; slotStart + duration <= endMinutes; slotStart += 30) {
    // Skip past slots for today
    if (isToday && slotStart <= currentMinutes) continue;

    const slotEnd = slotStart + duration;

    // Check overlap with existing bookings (including buffer)
    const hasConflict = bookedRanges.some(booked =>
      slotStart < booked.end + BUFFER_MINUTES && slotEnd + BUFFER_MINUTES > booked.start
    );

    if (!hasConflict) {
      const hours = String(Math.floor(slotStart / 60)).padStart(2, '0');
      const mins = String(slotStart % 60).padStart(2, '0');
      slots.push(`${hours}:${mins}`);
    }
  }

  return new Response(JSON.stringify({ slots }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
