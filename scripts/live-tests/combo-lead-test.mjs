// Combo LP lead timing test on a local build. /api/contact is simulated (accepted = 303 to
// /kontakt/danke/, rejected = 400); Meta, Google and /api/track are captured and aborted.
import { chromium } from 'playwright-core';
const BASE = process.argv[2] ?? 'http://localhost:4342';
const exe = `${process.env.LOCALAPPDATA}/ms-playwright/chromium-1228/chrome-win64/chrome.exe`;
const browser = await chromium.launch({ executablePath: exe });

async function scenario(label, contactStatus) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('bfl_marketing_consent', 'granted'); } catch {} });
  const capi = [];
  await ctx.route(/facebook\.(net|com)|googletagmanager|google-analytics/, (r) => r.abort());
  await ctx.route('**/api/track', (r) => { try { capi.push(JSON.parse(r.request().postData() || '{}').event_name); } catch {} r.abort(); });
  await ctx.route('**/api/contact', (r) => contactStatus === 303
    ? r.fulfill({ status: 303, headers: { Location: '/kontakt/danke/' } })
    : r.fulfill({ status: 400, contentType: 'text/html', body: '<!doctype html><title>Fehler</title><p>Fehler</p>' }));
  const page = await ctx.newPage();
  const leadsOn = async () => page.evaluate(() => (window.dataLayer || []).filter((e) => e && e.event === 'generate_lead').length).catch(() => -1);
  await page.goto(`${BASE}/lp/aquafacial-microneedling/`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const form = document.querySelector('form[data-lead-form]');
    const set = (name, value) => { const el = form.querySelector(`[name="${name}"]`); if (!el) return; if (el.type === 'checkbox') el.checked = true; else if (el.tagName === 'SELECT') el.selectedIndex = Math.max(1, el.selectedIndex); else el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    set('name', 'Test Person'); set('phone', '+41 79 000 00 00'); set('email', 'test@example.test');
    set('skinGoal', 'Glow'); set('preferredCallbackTime', 'Vormittag'); set('privacyConsent', 'on');
    const radio = form.querySelector('input[type="radio"][name="preferredContactMethod"]'); if (radio) radio.checked = true;
  });
  const queuedBefore = await page.evaluate(() => sessionStorage.getItem('bfl_pending_lead'));
  const leadsBeforeSubmit = await leadsOn();
  const capiBeforeSubmit = capi.filter((e) => e === 'Lead').length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => null),
    page.evaluate(() => document.querySelector('form[data-lead-form]').requestSubmit()),
  ]);
  await page.waitForTimeout(2500);
  const url = new URL(page.url()).pathname;
  const leadsAfter = await leadsOn();
  const capiLeads = capi.filter((e) => e === 'Lead').length;
  const queuedAfter = await page.evaluate(() => sessionStorage.getItem('bfl_pending_lead')).catch(() => 'n/a');
  console.log(`== ${label}: landed on ${url} | before submit: queued=${!!queuedBefore} generate_lead=${leadsBeforeSubmit} CAPI Lead=${capiBeforeSubmit} | after: generate_lead on page=${leadsAfter} CAPI Lead total=${capiLeads} queue left=${queuedAfter ? 'yes' : 'no'}`);
  if (contactStatus !== 303) {
    // The visitor goes back to the form, later reaches the thank-you page by another route.
    await page.goto(`${BASE}/lp/aquafacial-microneedling/`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const queuedOnReturn = await page.evaluate(() => sessionStorage.getItem('bfl_pending_lead'));
    await page.goto(`${BASE}/kontakt/danke/`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    console.log(`   then back to the form: queue left=${queuedOnReturn ? 'yes' : 'no'}; then /kontakt/danke/: generate_lead=${await leadsOn()}`);
  }
  await ctx.close();
}

await scenario('accepted (303 to /kontakt/danke/)', 303);
await scenario('rejected (400)', 400);

// Thank-you page opened directly, no queued lead.
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.setItem('bfl_marketing_consent', 'granted'); } catch {} });
const capi = [];
await ctx.route(/facebook\.(net|com)|googletagmanager|google-analytics/, (r) => r.abort());
await ctx.route('**/api/track', (r) => { try { capi.push(JSON.parse(r.request().postData() || '{}').event_name); } catch {} r.abort(); });
const page = await ctx.newPage();
await page.goto(`${BASE}/kontakt/danke/`, { waitUntil: 'load' });
await page.waitForTimeout(2000);
const leads = await page.evaluate(() => (window.dataLayer || []).filter((e) => e && e.event === 'generate_lead').length);
console.log(`== thank-you page opened directly: generate_lead=${leads} CAPI Lead=${capi.filter((e) => e === 'Lead').length}`);
await browser.close();
