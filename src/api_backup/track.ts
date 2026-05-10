import type { APIRoute } from 'astro';

/**
 * Server-side conversion tracking endpoint.
 * Forwards events to Meta Conversions API and GA4 Measurement Protocol.
 * This ensures conversions are tracked even when ad blockers block client-side pixels.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    event_name,
    event_id,
    event_data,
    user_data,
    event_source_url,
  } = body as {
    event_name: string;
    event_id: string;
    event_data?: { value?: number; currency?: string; content_name?: string };
    user_data?: { email?: string; phone?: string; fbc?: string; fbp?: string };
    event_source_url: string;
  };

  if (!event_name || !event_source_url) {
    return new Response(JSON.stringify({ error: 'Missing event_name or event_source_url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const results: Record<string, string> = {};

  // 1. Meta Conversions API
  const metaPixelId = import.meta.env.META_PIXEL_ID;
  const metaAccessToken = import.meta.env.META_ACCESS_TOKEN;

  if (metaPixelId && metaAccessToken) {
    try {
      const metaPayload = {
        data: [{
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          event_source_url,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            ...(user_data?.email ? { em: [user_data.email] } : {}),
            ...(user_data?.phone ? { ph: [user_data.phone] } : {}),
            ...(user_data?.fbc ? { fbc: user_data.fbc } : {}),
            ...(user_data?.fbp ? { fbp: user_data.fbp } : {}),
          },
          ...(event_data?.value ? {
            custom_data: {
              value: event_data.value,
              currency: event_data.currency || 'CHF',
              content_name: event_data.content_name,
            }
          } : {}),
        }],
      };

      const metaRes = await fetch(
        `https://graph.facebook.com/v25.0/${metaPixelId}/events?access_token=${metaAccessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload),
        }
      );
      results.meta = metaRes.ok ? 'ok' : 'error';
    } catch {
      results.meta = 'error';
    }
  }

  // 2. GA4 Measurement Protocol
  const ga4MeasurementId = import.meta.env.GA4_MEASUREMENT_ID;
  const ga4ApiSecret = import.meta.env.GA4_API_SECRET;

  if (ga4MeasurementId && ga4ApiSecret) {
    try {
      const ga4Payload = {
        client_id: user_data?.fbp || `server.${Date.now()}`,
        events: [{
          name: event_name === 'Lead' ? 'generate_lead' : event_name.toLowerCase(),
          params: {
            event_id,
            source: 'server',
            ...(event_data?.value ? { value: event_data.value, currency: event_data.currency || 'CHF' } : {}),
            ...(event_data?.content_name ? { content_name: event_data.content_name } : {}),
          },
        }],
      };

      const ga4Res = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ga4Payload),
        }
      );
      results.ga4 = ga4Res.ok ? 'ok' : 'error';
    } catch {
      results.ga4 = 'error';
    }
  }

  return new Response(JSON.stringify({ status: 'ok', results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
