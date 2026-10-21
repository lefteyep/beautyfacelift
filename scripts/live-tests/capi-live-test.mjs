// Events Manager test on the LIVE combo page (campaign plan 3.1): ad-style URL with test_event_code,
// consent accepted, scroll/time events, ONE labelled test enquiry, then the Treatwell click.
// Meta browser + server events are real (server ones carry the test code); Google requests are
// blocked so GA4 stays clean; the Treatwell site itself is never loaded.
import { chromium } from 'playwright-core';
const exe = `${process.env.LOCALAPPDATA}/ms-playwright/chromium-1228/chrome-win64/chrome.exe`;
const URL = 'https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202610&utm_content=p_zh15km_adv__test_ad&utm_term=test_placement&utm_id=test&utm_source_platform=meta&fbclid=TESTCLICK123&test_event_code=TEST93840';
const SUBMIT = process.argv.includes('--submit');
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/googletagmanager|google-analytics|analytics\.google|doubleclick|google\.com\/ccm|buchung\.treatwell\.ch/, (r) => r.abort());
const page = await ctx.newPage();
const track = [];
page.on('response', async (res) => {
  if (!res.url().includes('/api/track')) return;
  let ev = '?';
  try { ev = JSON.parse(res.request().postData() || '{}').event_name; } catch {}
  let text = '';
  try { text = (await res.text()).slice(0, 80); } catch {}
  track.push(`${ev} -> ${res.status()} ${text}`);
});
const fb = [];
page.on('request', (req) => { const u = req.url(); if (u.includes('facebook.com/tr')) { try { fb.push(new URL(u).searchParams.get('ev')); } catch {} } });

await page.goto(URL, { waitUntil: 'load' });
await page.getByRole('button', { name: /Marketing akzeptieren/i }).click();
await page.waitForTimeout(5000);
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(500); }
await page.waitForTimeout(32000); // TimeOnPage30s + HighIntentVisit
console.log('== page events: browser', JSON.stringify(fb));
console.log('== page events: /api/track'); track.forEach((t) => console.log('   ' + t));

if (SUBMIT) {
  track.length = 0; fb.length = 0;
  const form = page.locator('form[data-lead-form]');
  await form.scrollIntoViewIfNeeded();
  await form.locator('[name="name"]').fill('TEST Agentur bitte ignorieren');
  await form.locator('[name="phone"]').fill('+41 79 000 00 00');
  await form.locator('[name="email"]').fill('mediapaulo@gmail.com');
  await form.locator('[name="skinGoal"]').selectOption('Ich bin unsicher');
  await form.locator('[name="leadNote"]').fill('Testanfrage der Agentur (Tracking-Test), bitte ignorieren.');
  const consent = form.locator('[name="privacyConsent"]');
  try { await consent.check({ timeout: 3000 }); } catch { await consent.check({ force: true }); }
  await form.locator('button[type="submit"]').first().click();
  const ok = await page.locator('[data-lead-success]').first().waitFor({ state: 'visible', timeout: 25000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(6000);
  const successText = ok ? (await page.locator('[data-lead-success]').first().innerText()).replace(/\s+/g, ' ').slice(0, 160) : 'NO success panel';
  console.log(`== form submitted: success panel visible=${ok} | "${successText}"`);
  console.log('== after submit: browser', JSON.stringify(fb));
  console.log('== after submit: /api/track'); track.forEach((t) => console.log('   ' + t));
  // Treatwell click from the success panel: /termin/ fires the events, the Treatwell site is blocked.
  track.length = 0; fb.length = 0;
  const link = page.locator('[data-lead-success] a', { hasText: /online buchen/i }).first();
  if (await link.count()) {
    await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => null), link.click()]);
    await page.waitForTimeout(6000);
    console.log(`== Treatwell click: landed on ${page.url().split('?')[0]} | browser ${JSON.stringify(fb)}`);
    track.forEach((t) => console.log('   ' + t));
  } else {
    console.log('== Treatwell click: no "online buchen" link in the success panel');
  }
}
await browser.close();
