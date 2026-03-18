import type { APIRoute } from 'astro';
import { getServiceClient } from '../../lib/supabase';
import { validateBookingInput } from '../../lib/validation';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate input
  const validationError = validateBookingInput(body);
  if (validationError) {
    return new Response(JSON.stringify({ error: validationError }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getServiceClient();

  // Get service details for duration + end_time calculation
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration_minutes, deposit_chf')
    .eq('id', body.service_id)
    .single();

  if (serviceError || !service) {
    return new Response(JSON.stringify({ error: 'Behandlung nicht gefunden.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Calculate end time
  const [hours, mins] = (body.booking_time as string).split(':').map(Number);
  const totalMinutes = hours * 60 + mins + service.duration_minutes;
  const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const endMins = String(totalMinutes % 60).padStart(2, '0');
  const endTime = `${endHours}:${endMins}`;

  // Atomic check: verify slot is still available
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', body.booking_date)
    .in('status', ['pending', 'confirmed'])
    .or(`and(booking_time.lt.${endTime},end_time.gt.${body.booking_time})`);

  if (conflicts && conflicts.length > 0) {
    return new Response(JSON.stringify({
      error: 'Dieser Termin ist leider nicht mehr verfügbar. Bitte wählen Sie eine andere Uhrzeit.'
    }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      service_id: body.service_id,
      customer_name: (body.customer_name as string).trim(),
      customer_email: (body.customer_email as string).trim().toLowerCase(),
      customer_phone: (body.customer_phone as string).trim(),
      booking_date: body.booking_date,
      booking_time: body.booking_time,
      end_time: endTime,
      status: 'pending',
      deposit_amount: service.deposit_chf || 0,
      notes: body.notes || null,
      utm_data: body.utm_data || null,
    })
    .select('id')
    .single();

  if (bookingError) {
    console.error('Booking creation failed:', bookingError);
    return new Response(JSON.stringify({ error: 'Buchung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    booking: { id: booking.id },
    redirect: `/buchung-bestaetigt/?id=${booking.id}`,
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
