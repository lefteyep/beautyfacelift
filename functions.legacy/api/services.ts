import { createClient } from '@supabase/supabase-js';

export const onRequestGet: PagesFunction<{ PUBLIC_SUPABASE_URL: string; PUBLIC_SUPABASE_ANON_KEY: string }> = async (context) => {
  const supabase = createClient(
    context.env.PUBLIC_SUPABASE_URL,
    context.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description, duration_minutes, price_chf, deposit_chf, category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Dienste konnten nicht geladen werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ services: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
};
