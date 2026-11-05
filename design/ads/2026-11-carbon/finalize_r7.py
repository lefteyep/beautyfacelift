"""Round 7 finals: contact sheets of the raw candidates, and the final 1080 x 1350 / 1080 x 1920 JPGs from the chosen ones.

    py -I design/ads/2026-11-carbon/finalize_r7.py sheet [date]                  # raw/contact-r7-<date>.jpg, every 4:5 candidate
    py -I design/ads/2026-11-carbon/finalize_r7.py final [date] name=1 name=2 …  # <name>_45.jpg, and <name>_916.jpg when the
                                                                                # story (<name>-916_<date>_1.png) exists

Run from the repository root. <date> is the yyyymmdd in the raw file names (default: today). Needs Pillow.
"""
import datetime, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
NAMES = ['knockout-175', 'knockout-carbon', 'knockout-teresa',
         'facemap-schritte', 'facemap-hautanalyse', 'facemap-flatlay',
         'colorblock-pen', 'colorblock-bowl', 'colorblock-teresa',
         'bento-angebot', 'bento-reviews', 'bento-teresa',
         'sticker-angebot', 'sticker-ablauf', 'sticker-reviews']


def sheet(date):
    w, h = 272, 340
    cols = 6  # three motifs per row, two candidates each
    rows = (len(NAMES) + 2) // 3
    im = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 30) + 8), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, name in enumerate(NAMES):
        for cand in (1, 2):
            path = os.path.join(RAW, f'{name}-45_{date}_{cand}.png')
            col, row = (i % 3) * 2 + (cand - 1), i // 3
            x, y = 8 + col * (w + 8), 8 + row * (h + 30)
            if os.path.exists(path):
                im.paste(Image.open(path).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
            else:
                d.rectangle((x, y, x + w, y + h), outline=(200, 200, 200))
            d.text((x, y + h + 6), f'{name} · {cand}', fill=(0, 0, 0))
    out = os.path.join(RAW, f'contact-r7-{date}.jpg')
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
    elif mode == 'final':
        final(date, rest)
