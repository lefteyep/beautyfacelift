import argparse
import functools
import json
import pathlib
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('worktree', nargs='?', default=str(pathlib.Path(__file__).resolve().parents[2]))
parser.add_argument('--chromium', help='Optional path to a locally installed Chromium executable')
parser.add_argument('--output', help='Output directory for results and screenshots')
parser.add_argument('--port', type=int, default=0)
args = parser.parse_args()
output = pathlib.Path(args.output) if args.output else pathlib.Path(args.worktree) / '.tmp-qa' / 'browser-repairs'
output.mkdir(parents=True, exist_ok=True)
results = []
external_requests = []
track_requests = []


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


handler = functools.partial(Handler, directory=str(pathlib.Path(args.worktree) / 'dist'))
server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_address[1]}'


def check(condition, label, details=None):
    row = {'passed': bool(condition), 'label': label, 'details': details}
    results.append(row)
    print(json.dumps(row), flush=True)


def safe_context(browser, *, viewport=None, consent=None, contact_status=201):
    context = browser.new_context(viewport=viewport or {'width': 1280, 'height': 900})
    if consent:
        context.add_init_script(f"try {{ localStorage.setItem('bfl_marketing_consent', {json.dumps(consent)}); }} catch (_) {{}}")

    def route_request(route):
        url = urlparse(route.request.url)
        if url.hostname not in ('127.0.0.1', 'localhost'):
            external_requests.append(route.request.url)
            route.abort()
        elif url.path == '/api/track':
            track_requests.append(route.request.post_data)
            route.fulfill(status=200, content_type='application/json', body='{"status":"ok"}')
        elif url.path == '/api/contact':
            if contact_status == 201:
                route.fulfill(status=201, content_type='application/json', body='{"ok":true}')
            else:
                route.fulfill(status=400, content_type='application/json', body='{"error":"Simulierter Fehler: Anfrage nicht angenommen."}')
        elif url.path.startswith('/api/'):
            route.abort()
        else:
            route.continue_()

    context.route('**/*', route_request)
    return context


def lead_count(page):
    return page.evaluate("(window.dataLayer || []).filter(e => e && e.event === 'generate_lead').length")


try:
    with sync_playwright() as playwright:
        launch_options = {'headless': True, 'args': ['--disable-dev-shm-usage']}
        if args.chromium:
            launch_options['executable_path'] = args.chromium
        browser = playwright.chromium.launch(**launch_options)
        pages = [('/', 'home'), ('/kontakt/', 'contact'), ('/lp/aquafacial/', 'aquafacial'), ('/lp/aquafacial-microneedling/', 'combo')]
        for width, label in [(1440, 'desktop'), (390, 'mobile')]:
            context = safe_context(browser, viewport={'width': width, 'height': 900})
            page = context.new_page()
            for path, name in pages:
                response = page.goto(base + path, wait_until='load')
                page.wait_for_timeout(1200)
                check(response.status == 200, f'{label}: {path} renders', response.status)
                check(page.locator('h1').count() == 1, f'{label}: {path} has one H1')
                screenshot = output / f'{label}-{name}.png'
                page.screenshot(path=str(screenshot), full_page=True, animations='disabled')
                page.screenshot(path=str(output / f'{label}-{name}-viewport.png'), animations='disabled')
                check(page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'{label}: {path} has no horizontal overflow')
                if name == 'home':
                    lazy_count = page.locator('img[loading="lazy"]').count()
                    check(lazy_count > 0, f'{label}: native lazy loading remains enabled', lazy_count)
                    if label == 'mobile':
                        page.locator('[data-nav-toggle]').click()
                        check(page.locator('[data-nav-toggle]').get_attribute('aria-expanded') == 'true', 'mobile: navigation opens')
                        page.wait_for_function("document.querySelector('[data-nav-overlay]').contains(document.activeElement)")
                        check(page.evaluate("document.querySelector('[data-nav-overlay]').contains(document.activeElement)"), 'mobile: navigation receives keyboard focus')
                        page.keyboard.press('Escape')
                        check(page.locator('[data-nav-toggle]').get_attribute('aria-expanded') == 'false', 'mobile: navigation closes with Escape')
            context.close()

        context = safe_context(browser)
        page = context.new_page()
        page.goto(base + '/', wait_until='load')
        check(page.locator('#bfl-marketing-consent').is_visible(), 'consent: first visit shows choice')
        check(len(track_requests) == 0, 'consent: no marketing API requests before a choice')
        page.locator('[data-bfl-consent-deny]').click()
        check(page.evaluate("localStorage.getItem('bfl_marketing_consent')") == 'denied', 'consent: rejection persists')
        page.locator('[data-bfl-consent-open]').first.click()
        check(page.locator('#bfl-marketing-consent').is_visible(), 'consent: settings reopen')
        page.locator('[data-bfl-consent-accept]').click()
        check(page.evaluate("localStorage.getItem('bfl_marketing_consent')") == 'granted', 'consent: acceptance persists')
        context.close()

        for path in ['/', '/termin/']:
            context = safe_context(browser, consent='granted')
            context.add_cookies([{'name': '_fbc', 'value': 'fb.1.1000.OLD_CLICK', 'url': base}])
            page = context.new_page()
            try:
                page.goto(base + path + '?fbclid=NEW_CLICK', wait_until='domcontentloaded')
                page.wait_for_timeout(100)
            except Exception:
                # The bridge attempts a Treatwell navigation, which is intentionally blocked.
                pass
            cookie = next((c['value'] for c in context.cookies(base) if c['name'] == '_fbc'), '')
            check(cookie.endswith('.NEW_CLICK'), f'attribution: {path} refreshes an old click cookie', cookie)
            context.close()

        for status in [201, 400]:
            context = safe_context(browser, consent='granted', contact_status=status)
            page = context.new_page()
            page.goto(base + '/lp/aquafacial-microneedling/', wait_until='load')
            check(lead_count(page) == 0, f'form {status}: no lead before acceptance')
            page.evaluate("""() => {
                const form = document.querySelector('form[data-lead-form]');
                for (const [name, value] of Object.entries({name:'Test Person', phone:'+41 79 000 00 00', email:'test@example.test', skinGoal:'Glow', preferredCallbackTime:'Vormittag', privacyConsent:'on'})) {
                    const el = form.querySelector(`[name="${name}"]`);
                    if (!el) continue;
                    if (el.type === 'checkbox') el.checked = true;
                    else if (el.tagName === 'SELECT') el.selectedIndex = Math.max(1, el.selectedIndex);
                    else el.value = value;
                    el.dispatchEvent(new Event('input', {bubbles:true}));
                    el.dispatchEvent(new Event('change', {bubbles:true}));
                }
                const radio = form.querySelector('input[type="radio"][name="preferredContactMethod"]');
                if (radio) radio.checked = true;
            }""")
            page.evaluate("document.querySelector('form[data-lead-form]').requestSubmit()")
            page.wait_for_selector('[data-lead-success]:not([hidden])' if status == 201 else '[data-lead-status]:not([hidden])')
            page.wait_for_timeout(500)
            if status == 201:
                check(page.locator('[data-lead-success]').is_visible() and page.locator('form[data-lead-form]').is_hidden(), 'accepted form shows inline confirmation')
                check(lead_count(page) == 1, 'accepted form counts exactly one lead')
            else:
                check(lead_count(page) == 0, 'rejected form counts no lead')
                check(page.locator('form[data-lead-form]').is_visible(), 'rejected form remains available for correction')
                page.goto(base + '/lp/aquafacial-microneedling/', wait_until='load')
                check(page.evaluate("sessionStorage.getItem('bfl_pending_lead')") is None, 'return after rejection clears pending lead')
                page.goto(base + '/kontakt/danke/', wait_until='load')
                check(lead_count(page) == 0, 'thank-you visit after rejection does not create a lead')
            context.close()
        browser.close()
finally:
    server.shutdown()
    report = {'worktree':args.worktree, 'results':results, 'external_requests_blocked':external_requests, 'tracking_requests_intercepted':len(track_requests)}
    (output / 'results.json').write_text(json.dumps(report, indent=2) + '\n')

raise SystemExit(0 if results and all(r['passed'] for r in results) else 1)
