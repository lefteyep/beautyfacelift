import sys
from PIL import Image
# Page images for /lp/carbon-microneedling/, 4:5 like the page's hero arch and step cards, no text.
RAW = 'design/ads/2026-11-carbon/raw'; OUT = 'src/assets/lp/carbon'
JOBS = [('hero.webp', 'maske-v2_20261031_1.png'),
        ('methode-1.webp', 'maske-v2_20261031_2.png'),
        ('methode-2.webp', 'pen-v2_20261031_2.png'),
        ('methode-3.webp', 'stillleben-v2_20261031_1.png')]
for name, src in JOBS:
    im = Image.open(f'{RAW}/{src}').convert('RGB')
    w = round(im.height * 4 / 5)
    if im.width > w:
        x = (im.width - w) // 2; im = im.crop((x, 0, x + w, im.height))
    im.save(f'{OUT}/{name}', 'WEBP', quality=82, method=6)
    print(name, im.size)
