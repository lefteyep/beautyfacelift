import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';

const SRC = 'C:/Users/Nutzer/Desktop/beautyfacelift - teresa.png';
const OUT_MARKETING = 'src/assets/marketing/teresa_portrait.jpg';
const OUT_PUBLIC = 'public/assets/teresa_portrait.jpg';

const input = readFileSync(SRC);

const highRes = await sharp(input)
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toBuffer();
writeFileSync(OUT_MARKETING, highRes);

const ogImage = await sharp(input)
  .resize({ width: 1080, withoutEnlargement: true })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toBuffer();
writeFileSync(OUT_PUBLIC, ogImage);

const fmt = (b) => `${(b / 1024).toFixed(1)} KB`;
console.log(`src/assets/marketing/teresa_portrait.jpg: ${fmt(statSync(OUT_MARKETING).size)}`);
console.log(`public/assets/teresa_portrait.jpg: ${fmt(statSync(OUT_PUBLIC).size)}`);
