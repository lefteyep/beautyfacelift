import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const month = url.searchParams.get('month'); // YYYY-MM
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return new Response(JSON.stringify({ error: 'Parameter "month" fehlt oder ist ungültig (YYYY-MM).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // last day of month

  // Get working hours per weekday
  const { data: availability, error: availError } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('is_active', true);

  if (availError) {
    return new Response(JSON.stringify({ error: 'Verfügbarkeit konnte nicht geladen werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get blocked dates for this month
  const { data: blocked, error: blockError } = await supabase
    .from('blocked_dates')
    .select('date')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (blockError) {
    return new Response(JSON.stringify({ error: 'Blockierte Tage konnten nicht geladen werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const blockedSet = new Set((blocked || []).map(b => b.date));
  const workingDays = new Set((availability || []).map(a => a.day_of_week));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ...

    if (current >= today && workingDays.has(dayOfWeek) && !blockedSet.has(dateStr)) {
      dates.push(dateStr);
    }

    current.setDate(current.getDate() + 1);
  }

  return new Response(JSON.stringify({ dates }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60', // 1 min cache
    },
  });
};
