const baseUrl = new URL(process.env.BFL_WORKER_URL || 'http://127.0.0.1:8787');

function endpoint(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchJson(path) {
  const response = await fetch(endpoint(path), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchOptionalJson(path) {
  const response = await fetch(endpoint(path), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    await response.text().catch(() => '');
    return { ok: false, status: response.status, data: null };
  }

  return { ok: true, status: response.status, data: await response.json() };
}

async function fetchText(path) {
  const response = await fetch(endpoint(path), {
    headers: { Accept: 'text/html' },
  });

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchRaw(path, init = {}) {
  return fetch(endpoint(path), init);
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

try {
  console.log(`Checking Worker-backed API at ${baseUrl.origin}`);

  const bookingPage = await fetchText('/termin/?utm_source=meta&fbclid=test');
  if (!bookingPage.includes('https://buchung.treatwell.ch/ort/beauty-face-lift/')) {
    throw new Error('/termin/ did not include the Treatwell booking target');
  }
  if (!bookingPage.includes('utm_source') || !bookingPage.includes('fbclid') || !bookingPage.includes('bfl_utm')) {
    throw new Error('/termin/ did not include attribution forwarding logic');
  }
  console.log('[ok] /termin/ includes Treatwell forwarding and attribution handling');

  const disabledBookingResponse = await fetchRaw('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({}),
  });
  if (disabledBookingResponse.status !== 410) {
    throw new Error(`/api/bookings returned HTTP ${disabledBookingResponse.status}; expected 410 while legacy booking is disabled`);
  }
  console.log('[ok] POST /api/bookings is disabled by default');

  const servicesResponse = await fetchOptionalJson('/api/services');
  if (!servicesResponse.ok) {
    console.log(`[warn] Skipped Supabase-backed read API checks because /api/services returned HTTP ${servicesResponse.status}`);
    console.log('Worker API smoke check passed.');
  } else {
    const servicesData = servicesResponse.data;
    const services = Array.isArray(servicesData.services) ? servicesData.services : [];
    if (services.length === 0) {
      throw new Error('/api/services returned no services');
    }
    console.log(`[ok] /api/services returned ${services.length} services`);

    const month = currentMonth();
    const availabilityData = await fetchJson(`/api/availability?month=${month}`);
    const dates = Array.isArray(availabilityData.dates) ? availabilityData.dates : [];
    console.log(`[ok] /api/availability returned ${dates.length} dates for ${month}`);

    if (dates.length > 0) {
      const serviceId = services[0].id;
      const slotsData = await fetchJson(`/api/slots?date=${encodeURIComponent(dates[0])}&service_id=${encodeURIComponent(serviceId)}`);
      const slots = Array.isArray(slotsData.slots) ? slotsData.slots : [];
      console.log(`[ok] /api/slots returned ${slots.length} slots for ${dates[0]}`);
    } else {
      console.log('[warn] Skipped /api/slots because the current month has no available dates');
    }

    console.log('Worker API smoke check passed.');
  }
} catch (error) {
  console.error('[fail]', error instanceof Error ? error.message : error);
  console.error('Start with `npm run build` and `npm run cf:dev`, then run this check again.');
  process.exitCode = 1; // natural exit: process.exit() while sockets close crashes Node on Windows (libuv async.c)
}
