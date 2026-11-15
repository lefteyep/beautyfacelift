# WARNING, read before running: calls the PAID OpenAI image API through gen_ads.py and uploads the finished ads
# (including those that show Teresa Stimac) to OpenAI. Run it only on the user's explicit go, with OPENAI_API_KEY set
# for the terminal at runtime (never stored). Ad images never go into this public repository (see README.md).
"""Round 6: Stories+Reels-safe 9:16 versions, built like the round-4/5 ones of 2026-11-05 (SAFE-ZONES-20261105.txt):
the finished 4:5 ad as a rounded card (768 x 960, soft shadow) between 14.5 % and 64.5 % of the height, 156 px free on
each side, on a text-free background plate in the ad's own style (gpt-image-2.6-flare, 1088 x 1936).

    py -I design/ads/2026-11-carbon/reels_916_r6.py plates <out-dir> [name ...]   # <out-dir>/_plates-r6/plate-<name>-916_<date>.png
    py -I design/ads/2026-11-carbon/reels_916_r6.py build  <out-dir> [name ...]   # <out-dir>/<name>_916.jpg from the 4:5 final + plate
    py -I design/ads/2026-11-carbon/reels_916_r6.py sheet  <out-dir>              # <out-dir>/_plates-r6/contact-reels-r6-<date>.jpg

Run from the repository root with OPENAI_API_KEY set for the terminal. The images are written to <out-dir> only (the user's
local ads folder, outside the repository: by the user's decision of 2026-11-05 no ad image files are pushed to GitHub from
round 6 onwards). Names come from motifs_r6.py. Every plate must be checked for text before the build (no OCR on this machine).
"""
import base64, os, sys, time
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen_ads  # noqa: E402

NAMES = list(__import__('motifs_r6').MOTIFS)
CARD_W, CARD_H, CARD_X, CARD_Y, RADIUS = 768, 960, 156, 278, 30   # 278 = 14.5 % of 1920, bottom edge 1238 = 64.5 %

PLATE_PROMPT = (
    "Create a vertical 9:16 background image (1088 x 1936 px) in exactly the visual style of the attached Instagram ad (image 1): "
    "the same colours, materials, textures, light and decorative elements (its spheres, arch, split, shapes, gradients or studio "
    "atmosphere), but as a completely EMPTY background plate: no text, no letters, no numbers, no words, no logos, no watermark, no "
    "button, no card, no pills, no icons, no people, no faces, no hands, no products, no device. If the ad is photographic, paint a "
    "softly blurred, empty treatment-room scene in the same warm light with nobody in it. Keep the centre of the frame calm and "
    "plain, because a card will be placed on it; decorative elements only near the edges. Seamless, high quality.")


def plates(out, names):
    pdir = os.path.join(out, '_plates-r6'); os.makedirs(pdir, exist_ok=True)
    for name in names:
        src = os.path.join(HERE, f'{name}_45.jpg')
        t0 = time.time()
        data = gen_ads.call(PLATE_PROMPT, [src], '1088x1936', 1)
        if 'error' in data:
            print(name, 'ERROR', data['error'].get('message')); continue
        path = os.path.join(pdir, f'plate-{name}-916_{gen_ads.DATE}.png')
        open(path, 'wb').write(base64.b64decode(data['data'][0]['b64_json']))
        gen_ads.log({'motif': name + '-plate-916', 'size': '1088x1936', 'refs': [os.path.basename(src)],
                     'seconds': round(time.time() - t0), 'usage': data.get('usage')})
        print(name, 'plate ok')


def card(path):
    im = Image.open(path).convert('RGB').resize((CARD_W, CARD_H), Image.LANCZOS)
    mask = Image.new('L', (CARD_W, CARD_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, CARD_W - 1, CARD_H - 1), radius=RADIUS, fill=255)
    return im, mask


def build(out, names):
    pdir = os.path.join(out, '_plates-r6')
    for name in names:
        plate_path = os.path.join(pdir, f'plate-{name}-916_{gen_ads.DATE}.png')
        if not os.path.exists(plate_path):
            print(name, 'MISSING plate', plate_path); continue
        bg = Image.open(plate_path).convert('RGB').resize((1080, 1920), Image.LANCZOS)
        im, mask = card(os.path.join(HERE, f'{name}_45.jpg'))
        shadow = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
        sh = Image.new('L', (CARD_W, CARD_H), 0)
        ImageDraw.Draw(sh).rounded_rectangle((0, 0, CARD_W - 1, CARD_H - 1), radius=RADIUS, fill=110)
        shadow.paste((0, 0, 0, 110), (CARD_X, CARD_Y + 22), sh)
        shadow = shadow.filter(ImageFilter.GaussianBlur(26))
        bg = Image.alpha_composite(bg.convert('RGBA'), shadow).convert('RGB')
        bg.paste(im, (CARD_X, CARD_Y), mask)
        dst = os.path.join(out, f'{name}_916.jpg')
        bg.save(dst, quality=92)
        print(f'{name}_916.jpg  <- {name}_45.jpg + {os.path.basename(plate_path)}')


def sheet(out):
    w, h = 216, 384
    per_row = 5
    rows = (len(NAMES) + per_row - 1) // per_row
    im = Image.new('RGB', (per_row * (w + 8) + 8, rows * (h + 30) + 8), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, name in enumerate(NAMES):
        path = os.path.join(out, f'{name}_916.jpg')
        x, y = 8 + (i % per_row) * (w + 8), 8 + (i // per_row) * (h + 30)
        if os.path.exists(path):
            im.paste(Image.open(path).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
            for frac in (0.14, 0.65, 0.80):
                d.line((x, y + round(h * frac), x + w, y + round(h * frac)), fill=(255, 0, 0), width=1)
        else:
            d.rectangle((x, y, x + w, y + h), outline=(200, 200, 200))
        d.text((x, y + h + 6), name, fill=(0, 0, 0))
    path = os.path.join(out, '_plates-r6', f'contact-reels-r6-{gen_ads.DATE}.jpg')
    im.save(path, quality=85)
    print(path)


if __name__ == '__main__':
    mode, out = sys.argv[1], os.path.abspath(sys.argv[2])
    names = sys.argv[3:] or NAMES
    if mode == 'plates':
        plates(out, names)
    elif mode == 'build':
        build(out, names)
    elif mode == 'sheet':
        sheet(out)
