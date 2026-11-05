"""Round 7, Stories + Reels safe 9:16: the 4:5 ad as a rounded card on a text-free background plate.

    py -I design/ads/2026-11-carbon/cards_916_r7.py plates [name ...]   # gpt-image-2.6-flare: one 1088 x 1936 plate per ad,
                                                                        # raw/plate-<name>-916_<date>.png (needs OPENAI_API_KEY)
    py -I design/ads/2026-11-carbon/cards_916_r7.py cards <out-dir> [name ...]
                                                                        # <out-dir>/<name>_916.jpg, 1080 x 1920: the card
                                                                        # (768 x 960, rounded, shadow) between 14.5 % and 64.5 %
                                                                        # of the height, 156 px free at each side

Same layout as the 9:16 cards of rounds 4 and 5 (README.md, «9:16 Schutzzonen»): the text stays out of the Stories zones
(top 14 %, bottom 20 %) and the Reels zone (bottom 35 %). The card is taken from <name>_45.jpg in the folder given with
--finals (default: this folder). Needs Pillow for the cards; the plates need only Python 3.
"""
import base64, datetime, json, mimetypes, os, sys, time, urllib.error, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
DATE = datetime.date.today().strftime('%Y%m%d')
MODEL, QUALITY = 'gpt-image-2.6-flare', 'high'
NAMES = ['knockout-175', 'knockout-carbon', 'knockout-teresa',
         'facemap-schritte', 'facemap-hautanalyse', 'facemap-flatlay',
         'colorblock-pen', 'colorblock-bowl', 'colorblock-teresa',
         'bento-angebot', 'bento-reviews', 'bento-teresa',
         'sticker-angebot', 'sticker-ablauf', 'sticker-reviews']
PLATE_PROMPT = (
    "Create a vertical 9:16 background plate in exactly the style of the attached ad: the same colours, materials, textures, "
    "light and mood, continued across the whole frame as a calm, slightly soft backdrop. It will sit behind a framed card of the "
    "ad, so keep it quiet: no text, no letters, no numbers, no logos, no buttons, no people, no faces, no hands, no products, "
    "no devices. Only abstract surface, colour and light.")


def call_plate(src):
    key = os.environ.get('OPENAI_API_KEY', '')
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in [('model', MODEL), ('prompt', PLATE_PROMPT), ('size', '1088x1936'), ('quality', QUALITY), ('n', '1'), ('output_format', 'png')]:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    mime = mimetypes.guess_type(src)[0] or 'image/png'
    head = (f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(src)}"\r\n'
            f'Content-Type: {mime}\r\n\r\n').encode()
    parts.append(head + open(src, 'rb').read() + b'\r\n')
    body = b''.join(parts) + f'--{boundary}--\r\n'.encode()
    req = urllib.request.Request('https://api.openai.com/v1/images/edits', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read() or b'{}')


def plates(names, finals_dir):
    for name in names:
        src = os.path.join(finals_dir, f'{name}_45.jpg')
        t0 = time.time()
        data = call_plate(src)
        if 'error' in data:
            print(name, 'ERROR', data['error'].get('message')); continue
        out = os.path.join(RAW, f'plate-{name}-916_{DATE}.png')
        open(out, 'wb').write(base64.b64decode(data['data'][0]['b64_json']))
        with open(os.path.join(RAW, f'generation-log-{DATE}.jsonl'), 'a', encoding='utf-8') as fh:
            fh.write(json.dumps({'motif': f'{name}-plate', 'src': os.path.basename(src), 'size': '1088x1936',
                                 'seconds': round(time.time() - t0), 'usage': data.get('usage')}) + '\n')
        print(name, 'plate ok')


def cards(names, finals_dir, out_dir):
    from PIL import Image, ImageDraw, ImageFilter
    W, H = 1080, 1920
    CW, CH, RADIUS = 768, 960, 36
    X, Y = (W - CW) // 2, round(H * 0.145)          # 156 px at each side, card from 14.5 % to 64.5 %
    for name in names:
        plate_path = os.path.join(RAW, f'plate-{name}-916_{DATE}.png')
        plate = Image.open(plate_path).convert('RGB').resize((W, H), Image.LANCZOS)
        card = Image.open(os.path.join(finals_dir, f'{name}_45.jpg')).convert('RGB').resize((CW, CH), Image.LANCZOS)
        mask = Image.new('L', (CW, CH), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, CW - 1, CH - 1), radius=RADIUS, fill=255)
        shadow = Image.new('L', (W, H), 0)
        ImageDraw.Draw(shadow).rounded_rectangle((X + 6, Y + 26, X + CW + 6, Y + CH + 26), radius=RADIUS, fill=120)
        shadow = shadow.filter(ImageFilter.GaussianBlur(34))
        plate.paste(Image.new('RGB', (W, H), (0, 0, 0)), (0, 0), shadow)
        plate.paste(card, (X, Y), mask)
        out = os.path.join(out_dir, f'{name}_916.jpg')
        plate.save(out, quality=92)
        print(out, '<-', os.path.basename(plate_path))


if __name__ == '__main__':
    args = sys.argv[1:]
    finals_dir = HERE
    if '--finals' in args:
        i = args.index('--finals'); finals_dir = args[i + 1]; del args[i:i + 2]
    mode = args.pop(0)
    if mode == 'plates':
        plates(args or NAMES, finals_dir)
    elif mode == 'cards':
        out_dir = args.pop(0)
        cards(args or NAMES, finals_dir, out_dir)
