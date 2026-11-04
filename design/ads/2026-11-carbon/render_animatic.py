"""Rough cut (animatic) of the Carbon avatar video, 9:16, silent, watermarked «ENTWURF».

It lays out the timing of AVATAR-VIDEO-GUIDE.md section 2.2 with the material that exists today:
the three approved clips (from public/assets/lp-carbon/hero-video.mp4), the page stills and the text
layers from render_video_overlays.py. Where Teresa will talk (clips T1–T7, not generated yet) it shows
a marked placeholder made from the consented page image hero-teresa.webp. Never upload this file.

    py -I design/ads/2026-11-carbon/render_animatic.py <overlays-dir>/916 <out-dir>

Run from the repository root. Needs ffmpeg and Pillow, and the fonts dir as the third argument.
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

OV, OUT, FONTS = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1080, 1920, 24  # the approved clips and Seedance run at 24 fps
HERO = 'public/assets/lp-carbon/hero-video.mp4'  # 1080x1350, clip 1 0.0–3.4, clip 2 4.0–6.8, clip 3 7.4–10.2
TERESA = 'src/assets/lp/carbon/hero-teresa.webp'
METHODE1 = 'src/assets/lp/carbon/methode-1.webp'
METHODE3 = 'src/assets/lp/carbon/methode-3.webp'
TMP = f'{OUT}/_work'
os.makedirs(TMP, exist_ok=True)

COCOA = (42, 30, 24); CREAM = (250, 246, 241); CLAY = (143, 90, 46)
sans = lambda px, w=600: (lambda f: (f.set_variation_by_axes([w]), f)[1])(ImageFont.truetype(f'{FONTS}/InstrumentSans-Var.ttf', px))


def cover(img, w, h, cx=0.5, cy=0.5):
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x = int((img.width - w) * cx); y = int((img.height - h) * cy)
    return img.crop((x, y, x + w, y + h))


def tag(im, text, y=300):
    d = ImageDraw.Draw(im)
    f = sans(34)
    tw = d.textlength(text, font=f)
    d.rounded_rectangle((72, y, 72 + tw + 48, y + 70), radius=14, fill=CREAM)
    d.text((96, y + 15), text, font=f, fill=CLAY)
    return im


def placeholder(name, label, zoom):
    """Teresa still (consented page image) cropped like angle A (wider) or B (closer), dimmed, with a tag."""
    im = Image.open(TERESA).convert('RGB')
    if zoom:  # angle B: closer on her face
        im = im.crop((250, 0, 250 + 600, 1067))
    im = cover(im, W, H, cx=0.45, cy=0.0)
    im = ImageEnhance.Brightness(ImageEnhance.Color(im).enhance(0.6)).enhance(0.8)
    path = f'{TMP}/{name}.png'
    tag(im, label).save(path)
    return path


def still(name, src, cx=0.5, cy=0.5):
    path = f'{TMP}/{name}.png'
    cover(Image.open(src).convert('RGB'), W, H, cx, cy).save(path)
    return path


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def segment(i, dur, src, overlays, video_in=None, crop_x=160, blur=False, zoom=True):
    """One shot: video (in-point, crop to 9:16) or still (slow 4 % push-in), plus full-frame PNG layers."""
    out = f'{TMP}/seg{i:02d}.mp4'
    args = ['ffmpeg', '-y']
    if video_in is not None:
        args += ['-ss', str(video_in), '-t', str(dur), '-i', src]
        base = f'[0:v]crop=759:1350:{crop_x}:0,scale={W}:{H},setsar=1,fps={FPS}'
    else:
        args += ['-loop', '1', '-t', str(dur), '-i', src]
        frames = int(dur * FPS)
        z = f"zoompan=z='1+0.04*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS}" if zoom else f'fps={FPS}'
        base = f'[0:v]scale={W * 2}:{H * 2},{z},setsar=1'
    if blur:
        base += ',boxblur=18:2,eq=brightness=-0.06'
    chain = [base + '[v0]']
    last = 'v0'
    for k, (png, start) in enumerate(overlays, start=1):
        args += ['-loop', '1', '-t', str(dur), '-i', png]
        chain.append(f'[{k}:v]format=rgba,fade=t=in:st={start}:d=0.35:alpha=1[o{k}]')
        chain.append(f'[{last}][o{k}]overlay=0:0[v{k}]')
        last = f'v{k}'
    args += ['-filter_complex', ';'.join(chain), '-map', f'[{last}]', '-t', str(dur), '-an',
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', str(FPS), out]
    run(args)
    return out


def watermark():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f = sans(30)
    text = 'ENTWURF · Animatic · nicht veröffentlichen'
    tw = d.textlength(text, font=f)
    d.rounded_rectangle(((W - tw) / 2 - 24, 120, (W + tw) / 2 + 24, 176), radius=12, fill=(*COCOA, 200))
    d.text(((W - tw) / 2, 131), text, font=f, fill=CREAM)
    path = f'{TMP}/watermark.png'
    im.save(path)
    return path


def concat(segs, name):
    lst = f'{TMP}/{name}.txt'
    with open(lst, 'w') as fh:
        fh.writelines(f"file '{os.path.abspath(s)}'\n" for s in segs)
    joined = f'{TMP}/{name}-joined.mp4'
    run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', joined])
    out = f'{OUT}/{name}.mp4'
    run(['ffmpeg', '-y', '-i', joined, '-i', watermark(), '-filter_complex', '[0:v][1:v]overlay=0:0',
         '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
    return out


ov = lambda n: f'{OV}/{n}.png'
SCRIM = ov('00-scrim')
pA = lambda n, line: placeholder(n, f'Platzhalter {n} · Teresa spricht · Winkel A', False)
pB = lambda n, line: placeholder(n, f'Platzhalter {n} · Teresa spricht · Winkel B', True)

# Full version, hook H1 (section 2.2). Times in seconds; overlay start is relative to the shot.
full = [
    segment(1, 2.8, HERO, [(SCRIM, 0), (ov('hook-h1'), 0.3)], video_in=0.3),
    segment(2, 5.2, pA('T3', ''), [(SCRIM, 0), (ov('caption-04-frage'), 0.2)]),
    segment(3, 2.5, HERO, [(SCRIM, 0), (ov('label-2-reinigung-peelings'), 0.1)], video_in=7.5),
    segment(4, 3.0, still('methode1', METHODE1, 0.5, 0.4), [(SCRIM, 0), (ov('label-3-carbon-peeling'), 0.1)]),
    segment(5, 2.5, HERO, [(SCRIM, 0), (ov('label-4-microneedling'), 0.1)], video_in=4.1, crop_x=321),
    segment(6, 2.0, pB('T4', ''), [(SCRIM, 0), (ov('label-5-maske-led'), 0.1)]),
    segment(7, 4.0, pA('T5', ''), [(SCRIM, 0), (ov('caption-06-beweis'), 0.2)]),
    segment(8, 2.5, HERO, [(ov('review-card'), 0.2)], video_in=7.5, blur=True),
    segment(9, 4.0, pB('T6', ''), [(SCRIM, 0), (ov('price-block'), 0.5)]),
    segment(10, 1.5, still('methode3', METHODE3), [(SCRIM, 0), (ov('price-block'), 0)]),
]
print(concat(full, 'carbon-avatar-animatic-30s-916'))

# 15-second cut (section 2.3): hook, the treatment shots shortened, T7 with the price block.
short = [
    segment(21, 3.0, HERO, [(SCRIM, 0), (ov('hook-h1'), 0.3)], video_in=0.3),
    segment(22, 1.7, HERO, [(SCRIM, 0), (ov('label-2-reinigung-peelings'), 0.05)], video_in=7.5),
    segment(23, 1.8, still('methode1', METHODE1, 0.5, 0.4), [(SCRIM, 0), (ov('label-3-carbon-peeling'), 0.05)]),
    segment(24, 1.8, HERO, [(SCRIM, 0), (ov('label-4-microneedling'), 0.05)], video_in=4.1, crop_x=321),
    segment(25, 1.7, pB('T4', ''), [(SCRIM, 0), (ov('label-5-maske-led'), 0.05)]),
    segment(26, 5.0, pB('T7', ''), [(SCRIM, 0), (ov('price-block'), 0.4)]),
]
print(concat(short, 'carbon-avatar-animatic-15s-916'))
