"""Round 3 image ads (M8–M12): photo on top, cocoa text band below, in the look of render_ads.py.

The band: headline (Instrument Serif), a second line, the price line with «CHF 250» struck by the page's thin
red diagonal, and the end date with the address. 9:16 keeps all text above the bottom 20 % (y < 1536).

    py -I design/ads/2026-11-carbon/render_ads_r3.py <fonts-dir> design/ads/2026-11-carbon

The raw sources are not in the repository: copy them from ../ads/2026-11-carbon-runden-3-6/raw/ into raw/ first.
hautanalyse, teresa-portrait and danach show Teresa and wait for her approval: their outputs stay out of git
(.gitignore) and belong in ../ads/2026-11-carbon-runden-3-6/final-teresa/.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONTS, OUT = sys.argv[1], sys.argv[2]
RAW = f'{OUT}/raw'
SERIF = f'{FONTS}/InstrumentSerif-Regular.ttf'
SANS = f'{FONTS}/InstrumentSans-Var.ttf'
CREAM = (250, 246, 241); COCOA = (42, 30, 24); CLAY_L = (215, 174, 132); ON_DARK = (233, 220, 207); ERROR = (184, 105, 94)  # the page's strike on dark bands: color-mix(--error 70 %, --cream)
END = '30. November 2026'  # the only place the end date lives in this script
DATE_LINE = f'Nur bis {END} · Bahnhofstrasse 94, Zürich'

# motif: (source, vertical focus 4:5, vertical focus 9:16, headline, second line). Texts from the doc tab «Image ads».
ADS = {
    'hautanalyse': ('hautanalyse_20261105_1.png', 0.25, 0.20, 'Zum ersten Mal Microneedling?',
                    'Teresa prüft zuerst Ihre Haut und erklärt jeden Schritt.'),
    'zwei-in-einer': ('zwei-in-einer_20261105_1.png', 0.35, 0.30, 'Zwei Behandlungen, eine Sitzung',
                      'Carbon-Peeling + Microneedling in 90 Minuten.'),
    'ruhe': ('ruhe_20261105_1.png', 0.50, 0.45, '90 Minuten für Ihre Haut',
             'Reinigung, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske und LED-Licht.'),
    'teresa-portrait': ('teresa-portrait_20261105_1.png', 0.20, 0.15, 'Persönlich von Teresa Stimac',
                        'Dipl. Visagistin & Kosmetikerin, seit über 20 Jahren im Beruf.'),
    'danach': ('danach_20261105_1.png', 0.30, 0.25, 'Auch danach gut beraten',
               'Klare Hinweise für die Tage danach: Sonnenschutz, Feuchtigkeit, kurze Pause von Hitze und Sport.'),
}


def serif(px):
    return ImageFont.truetype(SERIF, px)


def sans(px, w=400):
    f = ImageFont.truetype(SANS, px)
    f.set_variation_by_axes([w])
    return f


def cover(img, w, h, fy):
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x = (img.width - w) // 2
    y = int((img.height - h) * fy)
    return img.crop((x, y, x + w, y + h))


def wrap(d, text, font, width):
    words, lines, cur = text.split(' '), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    return lines


def price_line(d, x, y, font, bold):
    """CHF 175 statt ~~CHF 250~~ · Sie sparen CHF 75.– with the thin red diagonal of .lp-strike."""
    for txt, f, color, strike in [('CHF 175', bold, CREAM, False), (' statt ', font, CREAM, False), ('CHF 250', font, ON_DARK, True),
                                  (' · ', font, ON_DARK, False), ('Sie sparen CHF 75.–', bold, CLAY_L, False)]:
        d.text((x, y), txt, font=f, fill=color)
        w = d.textlength(txt, font=f)
        if strike:
            asc, _ = f.getmetrics()
            mid = y + asc * 0.62
            d.line((x - 4, mid + 6, x + w + 4, mid - 8), fill=ERROR, width=max(3, f.size // 13))
        x += w


def render(name, src, fy, W, H, text_bottom, head, sub):
    probe = ImageDraw.Draw(Image.new('RGB', (W, H)))
    x = 72
    hf, sf, pf, pb, df = serif(64), sans(30), sans(36), sans(36, 600), sans(28)
    head_lines = wrap(probe, head, hf, W - 2 * x)
    sub_lines = wrap(probe, sub, sf, W - 2 * x)
    block = len(head_lines) * 70 + 14 + len(sub_lines) * 40 + 18 + 46 + 10 + 34
    text_top = text_bottom - block
    photo_h = text_top - 40
    im = Image.new('RGB', (W, H), COCOA)
    im.paste(cover(Image.open(f'{RAW}/{src}').convert('RGB'), W, photo_h, fy), (0, 0))
    d = ImageDraw.Draw(im)
    y = text_top
    for ln in head_lines:
        d.text((x, y), ln, font=hf, fill=CREAM)
        y += 70
    y += 14
    for ln in sub_lines:
        d.text((x, y), ln, font=sf, fill=ON_DARK)
        y += 40
    y += 18
    price_line(d, x, y, pf, pb)
    y += 46 + 10
    d.text((x, y), DATE_LINE, font=df, fill=ON_DARK)
    y += 34
    path = f'{OUT}/{name}'
    im.save(path, quality=92)
    return path, photo_h, y


for key, (src, fy45, fy916, head, sub) in ADS.items():
    print(render(f'{key}_45.jpg', src, fy45, 1080, 1350, 1310, head, sub))
    print(render(f'{key}_916.jpg', src, fy916, 1080, 1920, 1500, head, sub))
