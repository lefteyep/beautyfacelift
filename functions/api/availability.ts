import { createClient } from '@supabase/supabase-js';

export const onRequestGet: PagesFunction<{ PUBLIC_SUPABASE_URL: string; PUBLIC_SUPABASE_ANON_KEY: string }> = async (context) => {
  const url = new URL(context.request.url);
  const month = url.searchParams.get('month');

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return new Response(JSON.stringify({ error: 'Parameter "month" fehlt (YYYY-MM).' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(context.env.PUBLIC_SUPABASE_URL, context.env.PUBLIC_SUPABASE_ANON_KEY);

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0);

  const { data: availability } = await supabase
    .from('availability').select('day_of_week').eq('is_active', true);

  const { data: blocked } = await supabase
    .from('blocked_dates').select('date')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  const blockedSet = new Set((blocked || []).map(b => b.date));
  const workingDays = new Set((availability || []).map(a => a.day_of_week));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (current >= today && workingDays.has(current.getDay()) && !blockedSet.has(dateStr)) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return new Response(JSON.stringify({ dates }), {
    status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
};
