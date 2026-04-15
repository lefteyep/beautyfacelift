export const onRequestPost: PagesFunction<{
  META_PIXEL_ID?: string;
  META_ACCESS_TOKEN?: string;
  GA4_MEASUREMENT_ID?: string;
  GA4_API_SECRET?: string;
}> = async (context) => {
  let body: Record<string, any>;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { event_name, event_id, event_data, user_data, event_source_url } = body;
  if (!event_name || !event_source_url) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp = context.request.headers.get('CF-Connecting-IP') || '';
  const userAgent = context.request.headers.get('User-Agent') || '';
  const results: Record<string, string> = {};

  // Meta CAPI
  if (context.env.META_PIXEL_ID && context.env.META_ACCESS_TOKEN) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${context.env.META_PIXEL_ID}/events?access_token=${context.env.META_ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              event_name, event_time: Math.floor(Date.now() / 1000), event_id, event_source_url,
              action_source: 'website',
              user_data: { client_ip_address: clientIp, client_user_agent: userAgent, ...user_data },
              ...(event_data?.value ? { custom_data: { value: event_data.value, currency: event_data.currency || 'CHF' } } : {}),
            }],
          }),
        }
      );
      results.meta = res.ok ? 'ok' : 'error';
    } catch { results.meta = 'error'; }
  }

  // GA4
  if (context.env.GA4_MEASUREMENT_ID && context.env.GA4_API_SECRET) {
    try {
      const res = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${context.env.GA4_MEASUREMENT_ID}&api_secret=${context.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: user_data?.fbp || `server.${Date.now()}`,
            events: [{ name: event_name === 'Lead' ? 'generate_lead' : event_name.toLowerCase(), params: { event_id, ...event_data } }],
          }),
        }
      );
      results.ga4 = res.ok ? 'ok' : 'error';
    } catch { results.ga4 = 'error'; }
  }

  return new Response(JSON.stringify({ status: 'ok', results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
