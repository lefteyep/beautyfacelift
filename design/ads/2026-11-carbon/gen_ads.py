# WARNING, read before running:
# - This script calls the PAID OpenAI image API (gpt-image-2.6-flare, quality high); every run costs money.
# - It uploads the reference images named in the motif files to OpenAI, including Teresa Stimac's real
#   portrait src/assets/marketing/teresa_portrait.jpg and generated images of her.
# - It writes the results into the tracked folder design/ads/2026-11-carbon/raw/ (ignored by .gitignore there;
#   unapproved images of Teresa never go into this public repository, see README.md).
# - Run it only on the user's explicit go, with the key provided at runtime in the terminal
#   (OPENAI_API_KEY); never store the key in a file, never commit it. No session runs it on its own.
"""Generate the Carbon image ads with OpenAI's image model (gpt-image-2.6-flare), rounds 4 to 7.

    python design/ads/2026-11-carbon/gen_ads.py feed  motifs_r6            [motif ...]   # 4:5, two candidates each
    python design/ads/2026-11-carbon/gen_ads.py story motifs_r6 name=1 ...                 # 9:16 from the chosen 4:5 candidate

Run from the repository root. Needs no packages beyond Python 3. The key comes from the environment variable
OPENAI_API_KEY (on your computer: set it for the terminal, never commit it); in the cloud session the proxy adds it.
Output goes to design/ads/2026-11-carbon/raw/ as <motif>-45_<date>_<n>.png and <motif>-916_<date>_1.png, and every call
is logged in raw/generation-log-<date>.jsonl. Prompts live in motifs_r4.py to motifs_r7.py next to this file.
"""
import base64, datetime, importlib, json, mimetypes, os, sys, time, urllib.error, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
RAW = os.path.join(HERE, 'raw')
DATE = datetime.date.today().strftime('%Y%m%d')
MODEL, QUALITY = 'gpt-image-2.6-flare', 'high'
STORY_PROMPT = (
    "Re-design the attached Instagram feed ad (image 1) as a vertical 9:16 Instagram Story ad of the same campaign. Keep the same "
    "style, colours, 3D elements, photos, people and every text element with exactly the same words and spelling, including the struck-through "
    "old price; do not add, remove or change any words. Re-arrange the layout for the tall frame: extend the background naturally, give the hero "
    "element more room, keep generous spacing and the same visual hierarchy. Safe zones: the top 14 % and the bottom 20 % of the frame hold "
    "only background, with no text and no button; all text and the button sit between them. The canvas is 1088 x 1936 px: the top 290 px "
    "and the bottom 400 px are an empty continuation of the background (no words, no price, no labels, no button); everything else fits between "
    "y = 290 and y = 1536, a little smaller if needed. No other text, no logos, no watermarks.")


def call(prompt, images, size, n):
    key = os.environ.get('OPENAI_API_KEY', 'proxy-injected')
    if not images:  # no reference image: the generations endpoint takes plain JSON
        req = urllib.request.Request('https://api.openai.com/v1/images/generations', method='POST',
                                     data=json.dumps({'model': MODEL, 'prompt': prompt, 'size': size, 'quality': QUALITY, 'n': n,
                                                      'output_format': 'png'}).encode(),
                                     headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            return json.loads(e.read() or b'{}')
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in [('model', MODEL), ('prompt', prompt), ('size', size), ('quality', QUALITY), ('n', str(n)), ('output_format', 'png')]:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for path in images:
        mime = mimetypes.guess_type(path)[0] or 'image/png'
        head = (f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(path)}"\r\n'
                f'Content-Type: {mime}\r\n\r\n').encode()
        parts.append(head + open(path, 'rb').read() + b'\r\n')
    body = b''.join(parts) + f'--{boundary}--\r\n'.encode()
    req = urllib.request.Request('https://api.openai.com/v1/images/edits', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read() or b'{}')


def log(entry):
    with open(os.path.join(RAW, f'generation-log-{DATE}.jsonl'), 'a', encoding='utf-8') as fh:
        fh.write(json.dumps(entry) + '\n')


def main():
    mode, module = sys.argv[1], sys.argv[2]
    motifs = importlib.import_module(module).MOTIFS
    args = sys.argv[3:]
    if mode == 'feed':
        for name, (refs, prompt) in motifs.items():
            if args and name not in args:
                continue
            t0 = time.time()
            data = call(prompt, refs, '1088x1360', 2)
            if 'error' in data:
                print(name, 'ERROR', data['error'].get('message')); continue
            for i, item in enumerate(data['data'], 1):
                open(os.path.join(RAW, f'{name}-45_{DATE}_{i}.png'), 'wb').write(base64.b64decode(item['b64_json']))
            log({'motif': name, 'size': '1088x1360', 'refs': [os.path.basename(r) for r in refs], 'seconds': round(time.time() - t0), 'usage': data.get('usage')})
            print(name, 'ok')
    elif mode == 'story':
        for pick in args:
            name, i = pick.split('=')
            src = os.path.join(RAW, f'{name}-45_{DATE}_{i}.png')
            t0 = time.time()
            data = call(STORY_PROMPT, [src], '1088x1936', 1)
            if 'error' in data:
                print(name, 'ERROR', data['error'].get('message')); continue
            open(os.path.join(RAW, f'{name}-916_{DATE}_1.png'), 'wb').write(base64.b64decode(data['data'][0]['b64_json']))
            log({'motif': name + '-916', 'size': '1088x1936', 'refs': [os.path.basename(src)], 'seconds': round(time.time() - t0), 'usage': data.get('usage')})
            print(name, 'story ok')


if __name__ == '__main__':
    main()
