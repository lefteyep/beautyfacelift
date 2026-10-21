// /api/track with a browser-like payload from an ad visit (utm_* keys, fbp/fbc, test code). Runs the
// real Worker route; the Graph API call is captured, never sent. Usage: tsx capi-harness.mts <worktree>
const WT = process.argv[2];
const graphCalls: any[] = [];
globalThis.fetch = (async (input: any, init: any) => {
  const url = String(input);
  if (url.includes('graph.facebook.com')) { graphCalls.push(JSON.parse(init.body)); return new Response('{"events_received":1}', { status: 200 }); }
  throw new Error(`blocked outbound fetch: ${url}`);
}) as typeof fetch;
const { trackRoute } = await import(`file:///${WT.replace(/\\/g, '/')}/worker/routes/track.ts`);
const env = { META_PIXEL_ID: '1147246982373946', META_ACCESS_TOKEN: 'stub' };
const page = 'https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_content=p_zh15km_adv__test_ad&fbclid=TESTCLICK123';
const adVisit = {
  utm_id: 'test', utm_source: 'meta', utm_medium: 'paid_social', utm_campaign: 'bfl_ch_meta_lead_aquafacial-microneedling_202610',
  utm_content: 'p_zh15km_adv__test_ad', utm_term: 'test_placement', utm_source_platform: 'meta', fbclid: 'TESTCLICK123',
  page_path: '/lp/aquafacial-microneedling/', page_type: 'landing_page', treatment_name: 'Aquafacial + Microneedling',
};
let n = 0;
async function post(body: Record<string, unknown>) {
  const res = await trackRoute(new Request('https://beautyfacelift-zuerich.ch/api/track', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.4.0.${++n}`, 'user-agent': 'harness' },
  }), env as any);
  return { status: res.status, text: await res.text() };
}
const cases: Array<[string, Record<string, unknown>, number]> = [
  ['PageView from an ad visit', { event_name: 'PageView', event_id: 'e1', event_source_url: page, event_data: adVisit, user_data: { fbp: 'fb.1.1.2', fbc: 'fb.1.1792448587910.TESTCLICK123' }, test_event_code: 'TEST93840' }, 200],
  ['BookingButtonClick from an ad visit', { event_name: 'BookingButtonClick', event_id: 'e2', event_source_url: page, event_data: { ...adVisit, button_location: 'lp_hero_booking', destination_url: '/termin/?service=x', link_domain: 'beautyfacelift-zuerich.ch', value: 170, currency: 'CHF' }, user_data: { fbp: 'fb.1.1.2' } }, 200],
  ['Lead with campaign + offer + hashed contact', { event_name: 'Lead', event_id: 'e3', event_source_url: page, event_data: { ...adVisit, campaign: 'aquafacial_microneedling', offer: 'aquafacial-microneedling-aktion', source: 'aquafacial_microneedling_lp_form', value: 170, currency: 'CHF', content_name: 'Aquafacial Microneedling Aktion', content_category: 'lead_form' }, user_data: { em: 'a'.repeat(64), ph: 'b'.repeat(64), fbp: 'fb.1.1.2' } }, 200],
  ['unknown key is still rejected', { event_name: 'PageView', event_id: 'e4', event_source_url: page, event_data: { ...adVisit, injected: 'x' }, user_data: {} }, 400],
  ['raw PII is still rejected', { event_name: 'Lead', event_id: 'e5', event_source_url: page, event_data: adVisit, user_data: { em: 'kunde@example.test' } }, 400],
];
let fails = 0;
for (const [label, body, expected] of cases) {
  const r = await post(body);
  const ok = r.status === expected;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  (expected ${expected}, got ${r.status} ${r.text.slice(0, 80)})`);
}
const lead = graphCalls.find((c) => c.data?.[0]?.event_name === 'Lead')?.data?.[0];
const cd = lead?.custom_data || {};
const ud = lead?.user_data || {};
const checks = [
  [cd.utm_content === 'p_zh15km_adv__test_ad', 'Lead custom_data carries utm_content'],
  [cd.campaign === 'aquafacial_microneedling' && cd.offer === 'aquafacial-microneedling-aktion', 'Lead custom_data carries campaign and offer'],
  [cd.value === 170 && cd.currency === 'CHF', 'Lead value 170 CHF'],
  [typeof ud.em === 'string' && typeof ud.ph === 'string' && !!ud.fbp && !!ud.client_ip_address && !!ud.client_user_agent, 'Lead user_data has em, ph, fbp, ip, user agent'],
  [graphCalls[0]?.test_event_code === 'TEST93840', 'test_event_code forwarded on the first event'],
  [graphCalls.length === 3, `3 Graph calls captured (got ${graphCalls.length})`],
] as const;
for (const [ok, label] of checks) { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); }
console.log(fails ? `${fails} failing` : 'all pass');
