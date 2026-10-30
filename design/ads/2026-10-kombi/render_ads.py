import sys
from PIL import Image, ImageDraw, ImageFont
FONTS = sys.argv[1]; OUT = sys.argv[2]
SERIF = f'{FONTS}/InstrumentSerif-Regular.ttf'; SANS = f'{FONTS}/InstrumentSans-Var.ttf'
CREAM=(250,246,241); COCOA=(42,30,24); CLAY=(143,90,46); CLAY_L=(215,174,132); ON_DARK=(233,220,207); TEXT=(74,59,51); LINE=(214,204,194)
END='30. November'

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
    d.text((x, y), 'Aquafacial + Microneedling in Zürich', font=sans(30, 600), fill=CLAY); y += 70
    for ln in ['Zum ersten Mal', 'Microneedling?']:
        d.text((x, y), ln, font=serif(104), fill=COCOA); y += 104
    y += 40
    rows = [('Tut es weh?', 'Viele empfinden ein leichtes Piksen. Die Intensität wird individuell angepasst.'),
            ('Passt es zu mir?', 'Das klärt die persönliche Hautanalyse vor Ort.'),
            ('Und danach?', 'Rötungen sind möglich und beruhigen sich meist innerhalb von 24–48 Stunden.')]
    for q, a in rows:
        d.line((x, y, W-x, y), fill=LINE, width=2); y += 26
        d.text((x, y), q, font=sans(36, 600), fill=COCOA); y += 52
        for ln in wrap(d, a, sans(31), w):
            d.text((x, y), ln, font=sans(31), fill=TEXT); y += 42
        y += 22
    d.line((x, y, W-x, y), fill=LINE, width=2)
    d.rectangle((0, footer_top, W, footer_top+footer_h), fill=COCOA)
    fy = footer_top + 44
    d.text((x, fy), 'CHF 170 statt CHF 250 · 1 Std. 30 Min.', font=sans(38, 600), fill=CREAM); fy += 58
    d.text((x, fy), f'Angebot bis {END} · Bahnhofstrasse 94, Zürich', font=sans(30), fill=ON_DARK)
    im.save(f'{OUT}/{name}', quality=92); return y

T = 'src/assets/lp/aquafacial/aquafacial-behandlung-zuerich.webp'; P = 'src/assets/marketing/teresa_portrait.jpg'
glow = [('Aquafacial + Microneedling', serif(76), CREAM, 8),
        ('CHF 170 statt CHF 250 · 1 Std. 30 Min.', sans(38, 600), CLAY_L, 6),
        (f'Angebot bis {END} · Bahnhofstrasse 94, Zürich', sans(30), ON_DARK, 0)]
teresa = [('Persönlich von Teresa Stimac', serif(72), CREAM, 8),
          ('20+ Jahre Erfahrung · 4,8 aus 248+ Bewertungen', sans(36, 600), CLAY_L, 6),
          ('Aquafacial + Microneedling · CHF 170 statt CHF 250', sans(30), ON_DARK, 0),
          (f'Angebot bis {END} · Bahnhofstrasse 94, Zürich', sans(30), ON_DARK, 0)]
r = {}
r['glow_45'] = photo_ad(T, 0.30, glow, 1080, 1350, 1040, 1086, 'glow_45.jpg')
r['glow_916'] = photo_ad(T, 0.30, glow, 1080, 1920, 1240, 1290, 'glow_916.jpg')
r['teresa_45'] = photo_ad(P, 0.12, teresa, 1080, 1350, 1000, 1040, 'teresa_45.jpg')
r['teresa_916'] = photo_ad(P, 0.12, teresa, 1080, 1920, 1200, 1250, 'teresa_916.jpg')
r['card_45'] = card_ad(1080, 1350, 70, 1128, 222, 'first-needling_45.jpg')
r['card_916'] = card_ad(1080, 1920, 290, 1300, 236, 'first-needling_916.jpg')
print(r)
