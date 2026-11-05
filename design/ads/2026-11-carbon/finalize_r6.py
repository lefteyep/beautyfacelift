"""Round 6 finals: contact sheets of the raw candidates, and the final 1080 x 1350 / 1080 x 1920 JPGs from the chosen ones.

    py -I design/ads/2026-11-carbon/finalize_r6.py sheet [date]                  # raw/contact-r6-<date>.jpg, every 4:5 candidate
    py -I design/ads/2026-11-carbon/finalize_r6.py stories [date]                # raw/contact-r6-stories-<date>.jpg with the
                                                                                # safe zones (top 14 %, bottom 20 %) drawn in
    py -I design/ads/2026-11-carbon/finalize_r6.py final [date] name=1 name=2 …  # <name>_45.jpg, and <name>_916.jpg when the
                                                                                # story (<name>-916_<date>_1.png) exists

Run from the repository root. <date> is the yyyymmdd in the raw file names (default: today). Needs Pillow. The names come
from motifs_r6.py, so the script follows the prompt file.
"""
import datetime, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
RAW = os.path.join(HERE, 'raw')
NAMES = list(__import__('motifs_r6').MOTIFS)


def sheet(date):
    w, h = 272, 340
    per_row = 4  # four motifs per row, two candidates each
    rows = (len(NAMES) + per_row - 1) // per_row
    im = Image.new('RGB', (per_row * 2 * (w + 8) + 8, rows * (h + 30) + 8), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, name in enumerate(NAMES):
        for cand in (1, 2):
            path = os.path.join(RAW, f'{name}-45_{date}_{cand}.png')
            col, row = (i % per_row) * 2 + (cand - 1), i // per_row
            x, y = 8 + col * (w + 8), 8 + row * (h + 30)
            if os.path.exists(path):
                im.paste(Image.open(path).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
            else:
                d.rectangle((x, y, x + w, y + h), outline=(200, 200, 200))
            d.text((x, y + h + 6), f'{name} · {cand}', fill=(0, 0, 0))
    out = os.path.join(RAW, f'contact-r6-{date}.jpg')
    im.save(out, quality=85)
    print(out)


def stories(date):
    w, h = 216, 384
    per_row = 5
    rows = (len(NAMES) + per_row - 1) // per_row
    im = Image.new('RGB', (per_row * (w + 8) + 8, rows * (h + 30) + 8), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, name in enumerate(NAMES):
        path = os.path.join(RAW, f'{name}-916_{date}_1.png')
        x, y = 8 + (i % per_row) * (w + 8), 8 + (i // per_row) * (h + 30)
        if os.path.exists(path):
            im.paste(Image.open(path).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
            d.line((x, y + round(h * 0.14), x + w, y + round(h * 0.14)), fill=(255, 0, 0), width=1)
            d.line((x, y + round(h * 0.80), x + w, y + round(h * 0.80)), fill=(255, 0, 0), width=1)
        else:
            d.rectangle((x, y, x + w, y + h), outline=(200, 200, 200))
        d.text((x, y + h + 6), name, fill=(0, 0, 0))
    out = os.path.join(RAW, f'contact-r6-stories-{date}.jpg')
    im.save(out, quality=85)
    print(out)


def final(date, picks):
    for pick in picks:
        name, cand = pick.split('=')
        src = os.path.join(RAW, f'{name}-45_{date}_{cand}.png')
        Image.open(src).convert('RGB').resize((1080, 1350), Image.LANCZOS).save(os.path.join(HERE, f'{name}_45.jpg'), quality=92)
        print(f'{name}_45.jpg  <- {os.path.basename(src)}')
        story = os.path.join(RAW, f'{name}-916_{date}_1.png')
        if os.path.exists(story):
            Image.open(story).convert('RGB').resize((1080, 1920), Image.LANCZOS).save(os.path.join(HERE, f'{name}_916.jpg'), quality=92)
            print(f'{name}_916.jpg <- {os.path.basename(story)}')


if __name__ == '__main__':
    mode = sys.argv[1]
    rest = sys.argv[2:]
    date = rest.pop(0) if rest and rest[0].isdigit() else datetime.date.today().strftime('%Y%m%d')
    if mode == 'sheet':
        sheet(date)
    elif mode == 'stories':
        stories(date)
    elif mode == 'final':
        final(date, rest)
