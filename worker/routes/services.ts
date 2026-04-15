import { createClient } from '@supabase/supabase-js';
import type { Env } from '../env';

export async function servicesRoute(_request: Request, env: Env): Promise<Response> {
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

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
}
