import sys
from PIL import Image, ImageDraw, ImageFont
FONTS = sys.argv[1]; OUT = sys.argv[2]; RAW = f'{OUT}/raw'
SERIF = f'{FONTS}/InstrumentSerif-Regular.ttf'; SANS = f'{FONTS}/InstrumentSans-Var.ttf'
CREAM=(250,246,241); COCOA=(42,30,24); CLAY=(143,90,46); CLAY_L=(215,174,132); ON_DARK=(233,220,207); TEXT=(74,59,51); LINE=(214,204,194)
END='30. November 2026'
OFFER='Carbon-Peeling + Microneedling'
PRICE='CHF 175 statt CHF 250'
SAVE='Sie sparen CHF 75.–'
STUDIO='Beauty Face Lift · Bahnhofstrasse 94, Zürich'

def serif(px): return ImageFont.truetype(SERIF, px)
def sans(px, w=400):
    f = ImageFont.truetype(SANS, px)
    f.set_variation_by_axes([w]); return f

def cover(img, w, h, fy=0.4):
    s = max(w/img.width, h/img.height); img = img.resize((round(img.width*s), round(img.height*s)), Image.LANCZOS)
    x = (img.width-w)//2; y = int((img.height-h)*fy); return img.crop((x, y, x+w, y+h))

def wrap(d, text, font, width):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur+' '+wd).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur); return lines

def photo_ad(src, fy, lines, W, H, photo_h, text_top, name):
    im = Image.new('RGB', (W, H), COCOA)
    im.paste(cover(Image.open(src).convert('RGB'), W, photo_h, fy), (0, 0))
    d = ImageDraw.Draw(im); y = text_top; x = 72
    for txt, font, color, gap in lines:
        for ln in wrap(d, txt, font, W-2*x):
            d.text((x, y), ln, font=font, fill=color); y += font.size + 10
        y += gap
    im.save(f'{OUT}/{name}', quality=92); return y

def card_ad(W, H, top, footer_top, footer_h, name):
    im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im); x = 80; w = W-2*x
    y = top
    d.text((x, y), 'Beauty Face Lift · Zürich', font=sans(30, 600), fill=CLAY); y += 70
    for ln in ['Carbon-Peeling', '+ Microneedling']:
        d.text((x, y), ln, font=serif(104), fill=COCOA); y += 104
    y += 40
    # Answers only from the treatment description the user gave on 2026-10-31.
    rows = [('Wie läuft es ab?', 'Carbon-Peeling und Microneedling in einer Sitzung von 90 Minuten.'),
            ('Passt es zu mir?', 'Das klärt die Hautanalyse vor Ort.'),
            ('Und danach?', 'Täglich SPF 30–50, einige Tage kein Retinol und keine Säuren, 24–48 Std. keine Hitze.')]
    for q, a in rows:
        d.line((x, y, W-x, y), fill=LINE, width=2); y += 26
        d.text((x, y), q, font=sans(36, 600), fill=COCOA); y += 52
        for ln in wrap(d, a, sans(31), w):
            d.text((x, y), ln, font=sans(31), fill=TEXT); y += 42
        y += 22
    d.line((x, y, W-x, y), fill=LINE, width=2)
    d.rectangle((0, footer_top, W, footer_top+footer_h), fill=COCOA)
    fy = footer_top + 40
    d.text((x, fy), f'{PRICE} · {SAVE}', font=sans(38, 600), fill=CREAM); fy += 58
    d.text((x, fy), f'Nur bis {END} · Bahnhofstrasse 94', font=sans(30), fill=ON_DARK)
    im.save(f'{OUT}/{name}', quality=92); return y

M = f'{RAW}/maske-v2_20261031_1.png'; P = f'{RAW}/pen-v2_20261031_2.png'; S = f'{RAW}/stillleben-v2_20261031_1.png'
offer = [(OFFER, serif(72), CREAM, 8),
         (f'{PRICE} · {SAVE}', sans(38, 600), CLAY_L, 6),
         (f'Nur bis {END}', sans(32, 600), ON_DARK, 0),
         (STUDIO, sans(28), ON_DARK, 0)]
trust = [('Persönlich von Teresa Stimac', serif(68), CREAM, 8),
         ('Über 20 Jahre Erfahrung · 90 Min.', sans(34, 600), CLAY_L, 6),
         (f'{OFFER} · {PRICE}', sans(30), ON_DARK, 0),
         (f'Nur bis {END} · Bahnhofstrasse 94, Zürich', sans(28), ON_DARK, 0)]
r = {}
for key, src, fy, lines in [('maske', M, 0.25, offer), ('pen', P, 0.30, offer), ('vertrauen', S, 0.35, trust)]:
    r[f'{key}_45'] = photo_ad(src, fy, lines, 1080, 1350, 1000, 1036, f'{key}_45.jpg')
    r[f'{key}_11'] = photo_ad(src, fy, lines, 1080, 1080, 740, 774, f'{key}_11.jpg')
    r[f'{key}_916'] = photo_ad(src, fy, lines, 1080, 1920, 1240, 1280, f'{key}_916.jpg')
r['karte_45'] = card_ad(1080, 1350, 70, 1128, 222, 'karte_45.jpg')
r['karte_916'] = card_ad(1080, 1920, 290, 1300, 236, 'karte_916.jpg')
print(r)
