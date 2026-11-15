"""Text layers for the Carbon avatar video (AVATAR-VIDEO-GUIDE.md), as transparent PNGs.

Same look as the overlay of carbon-ad-*.mp4: Instrument Serif headline in cream, Instrument Sans
lines, the struck «CHF 250» with the thin red diagonal of the page. Every layer is full frame
(1080 x 1920 for Reels/Stories, 1080 x 1350 for Feed), so it drops onto the timeline at 0/0.
In 9:16 nothing sits in the top 14 % or the bottom 20 % (text ends above y = 1536).

    py -I design/ads/2026-11-carbon/render_video_overlays.py <fonts-dir> <out-dir>

<fonts-dir> holds InstrumentSerif-Regular.ttf and InstrumentSans-Var.ttf (see README.md, «Neu erzeugen»).
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONTS, OUT = sys.argv[1], sys.argv[2]
SERIF = f'{FONTS}/InstrumentSerif-Regular.ttf'
SANS = f'{FONTS}/InstrumentSans-Var.ttf'

CREAM = (250, 246, 241); PAPER = (255, 252, 249); COCOA = (42, 30, 24); CLAY = (143, 90, 46)
CLAY_L = (215, 174, 132); ON_DARK = (233, 220, 207); MUTED = (118, 101, 90); GOLD = (185, 143, 71)
ERROR = (155, 44, 31)

# Approved texts only (AVATAR-VIDEO-GUIDE.md sections 2 and 3). No date in the video.
HOOKS = {
    'hook-h1': 'Carbon-Peeling + Microneedling',
    'hook-h2': 'Zum ersten Mal Microneedling?',
    'hook-h3': 'Carbon-Peeling oder Microneedling?',
    'hook-h3-b': 'Beides in einer Sitzung',
}
LABELS = {
    'label-1-hautanalyse': 'Mit Hautanalyse',
    'label-2-reinigung-peelings': 'Reinigung und Peelings',
    'label-3-carbon-peeling': 'Carbon-Peeling',
    'label-4-microneedling': 'Microneedling',
    'label-5-maske-led': 'Maske und LED-Licht',
}
# Sentence captions for the talking shots, only if Teresa says the lines word for word;
# otherwise type what she says. Shots 3–6 use the step labels as captions, shot 9 the price block.
H1_KICKER = '90 Minuten · zwei Behandlungen'
CAPTIONS = {
    'caption-04-frage': ('Mit Hautanalyse', 'Zuerst schaue ich mir Ihre Haut genau an – und stimme die Behandlung darauf ab.'),
    'caption-06-beweis': (None, 'Ich bin seit über 20 Jahren im Beruf – und behandle Sie persönlich.'),
}
REVIEW_QUOTE ='«Fühlte mich gut aufgehoben und kann Beauty Face Lift mit gutem Gewissen weiter empfehlen.»'
REVIEW_BY = 'Svenja · Microneedling · Treatwell, März 2025'
RATING = '4,8 aus 260+ Bewertungen auf Treatwell'  # read on Treatwell on the export day
KICKER = 'Aktion · nur für kurze Zeit'
OFFER = 'Carbon-Peeling + Microneedling'
STUDIO = 'Beauty Face Lift · Bahnhofstrasse 94, Zürich'

# Layout per format: left margin, text-block bottom (baseline area), font sizes.
FORMATS = {
    '916': dict(W=1080, H=1920, x=72, bottom=1515, serif=80, label=66, sans=40, small=31, scrim_from=0.50),
    '45': dict(W=1080, H=1350, x=64, bottom=1290, serif=72, label=60, sans=36, small=29, scrim_from=0.55),
}


def serif(px):
    return ImageFont.truetype(SERIF, px)


def sans(px, w=400):
    f = ImageFont.truetype(SANS, px)
    f.set_variation_by_axes([w])
    return f


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


def canvas(f):
    return Image.new('RGBA', (f['W'], f['H']), (0, 0, 0, 0))


def with_shadow(layer):
    """Soft dark halo under the text so it reads on bright footage without a visible box."""
    alpha = layer.split()[3]
    shadow = Image.new('RGBA', layer.size, (*COCOA, 0))
    shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(10)).point(lambda a: int(a * 0.55)))
    out = Image.alpha_composite(shadow, layer)
    return out


def scrim(f):
    """Bottom gradient like the existing ad videos: transparent at scrim_from, cocoa 0.62 at the bottom."""
    im = canvas(f)
    px = im.load()
    start = int(f['H'] * f['scrim_from'])
    for y in range(start, f['H']):
        a = int(158 * ((y - start) / (f['H'] - start)) ** 1.4)
        for x in range(f['W']):
            px[x, y] = (*COCOA, a)
    return im


def headline(f, text, size, kicker=None):
    im = canvas(f)
    d = ImageDraw.Draw(im)
    font = serif(size)
    lines = wrap(d, text, font, f['W'] - 2 * f['x'])
    lh = int(size * 1.08)
    y = f['bottom'] - lh * len(lines)
    if kicker:
        kf = sans(f['sans'] - 4, 600)
        d.text((f['x'], y - kf.size - 18), kicker, font=kf, fill=CLAY_L)
    for ln in lines:
        d.text((f['x'], y), ln, font=font, fill=CREAM)
        y += lh
    return with_shadow(im)


def caption(f, kicker, text):
    im = canvas(f)
    d = ImageDraw.Draw(im)
    font = sans(f['sans'] + 4, 600)
    lines = wrap(d, text, font, f['W'] - 2 * f['x'])
    lh = int(font.size * 1.25)
    y = f['bottom'] - lh * len(lines)
    if kicker:
        kf = sans(f['small'], 600)
        d.text((f['x'], y - kf.size - 16), kicker, font=kf, fill=CLAY_L)
    for ln in lines:
        d.text((f['x'], y), ln, font=font, fill=CREAM)
        y += lh
    return with_shadow(im)


def star(d, cx, cy, r, fill):
    import math
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.45
        a = math.pi / 2 + i * math.pi / 5
        pts.append((cx + rr * math.cos(a), cy - rr * math.sin(a)))
    d.polygon(pts, fill=fill)


def review_card(f):
    im = canvas(f)
    d = ImageDraw.Draw(im)
    x0, x1 = f['x'], f['W'] - f['x']
    pad = 44
    qf, bf, rf = serif(f['label'] - 14), sans(f['small']), sans(f['small'] + 1, 600)
    qlines = wrap(d, REVIEW_QUOTE, qf, x1 - x0 - 2 * pad)
    qlh = int(qf.size * 1.12)
    h = pad + 46 + len(qlines) * qlh + 22 + bf.size + 34 + rf.size + pad
    y0 = f['bottom'] - h
    d.rounded_rectangle((x0, y0, x1, y0 + h), radius=28, fill=(*PAPER, 246))
    y = y0 + pad
    for i in range(5):
        star(d, x0 + pad + 16 + i * 40, y + 16, 16, GOLD)
    y += 46
    for ln in qlines:
        d.text((x0 + pad, y), ln, font=qf, fill=COCOA)
        y += qlh
    y += 22
    d.text((x0 + pad, y), REVIEW_BY, font=bf, fill=MUTED)
    y += bf.size + 34
    d.text((x0 + pad, y), RATING, font=rf, fill=CLAY)
    return im


def price_block(f):
    """Kicker, offer, price line with the struck regular price, studio — the overlay of carbon-ad-*.mp4."""
    im = canvas(f)
    d = ImageDraw.Draw(im)
    x = f['x']
    kf, of, pf, pfb, af = sans(f['small'], 500), serif(f['serif'] - 4), sans(f['sans']), sans(f['sans'], 600), sans(f['small'])
    rows = [kf.size + 22, int(of.size * 1.08) + 14, pf.size + 26, af.size]
    y = f['bottom'] - sum(rows)
    d.text((x, y), KICKER, font=kf, fill=CLAY_L)
    y += rows[0]
    d.text((x, y), OFFER, font=of, fill=CREAM)
    y += rows[1]
    cx = x
    for txt, font, color, strike in [('CHF 175', pfb, CREAM, False), (' statt ', pf, CREAM, False),
                                     ('CHF 250', pf, ON_DARK, True), (' · ', pf, ON_DARK, False),
                                     ('Sie sparen CHF 75.–', pfb, CLAY_L, False)]:
        d.text((cx, y), txt, font=font, fill=color)
        w = d.textlength(txt, font=font)
        if strike:
            asc, desc = font.getmetrics()
            mid = y + asc * 0.62
            # thin diagonal like .lp-strike, a little wider than the word
            d.line((cx - 4, mid + 7, cx + w + 4, mid - 9), fill=ERROR, width=max(3, font.size // 13))
        cx += w
    y += rows[2]
    d.text((x, y), STUDIO, font=af, fill=ON_DARK)
    return with_shadow(im)


def main():
    import os
    for key, f in FORMATS.items():
        out = f'{OUT}/{key}'
        os.makedirs(out, exist_ok=True)
        scrim(f).save(f'{out}/00-scrim.png')
        for name, text in HOOKS.items():
            headline(f, text, f['serif'], H1_KICKER if name == 'hook-h1' else None).save(f'{out}/{name}.png')
        for name, (kicker, text) in CAPTIONS.items():
            caption(f, kicker, text).save(f'{out}/{name}.png')
        for name, text in LABELS.items():
            headline(f, text, f['label']).save(f'{out}/{name}.png')
        review_card(f).save(f'{out}/review-card.png')
        price_block(f).save(f'{out}/price-block.png')
        print(key, sorted(os.listdir(out)))


if __name__ == '__main__':
    main()
