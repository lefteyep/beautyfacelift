import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const shoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(shoot, '../../../..');
const entries = [
  { slot: 4, candidate: 3, path: 'public/assets/aquafacial_treatment.png', width: 1200, height: 630, format: 'png' },
  { slot: 6, candidate: 1, path: 'src/assets/lp/aquafacial/hero-aquafacial-microneedling-zuerich.webp', width: 1672, height: 941, format: 'webp', limit: 160000 },
  { slot: 7, candidate: 4, path: 'src/assets/lp/aquafacial/personal-treatment-zuerich.webp', width: 1122, height: 1402, format: 'webp', limit: 120000 },
  { slot: 13, candidate: 1, path: 'src/assets/lp/aquafacial/hautanalyse-beratung-zuerich.webp', width: 1448, height: 1086, format: 'webp', limit: 120000 },
];
const exports = [];
for (const entry of entries) {
  const original = `slot-${String(entry.slot).padStart(2, '0')}-candidate-${String(entry.candidate).padStart(2, '0')}.png`;
  const source = path.join(shoot, original);
  const native = await sharp(source).metadata();
  let pipeline = sharp(source).resize(entry.width, entry.height, { fit: 'cover', position: 'centre' }).withIccProfile('srgb');
  pipeline = entry.format === 'png'
    ? pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
    : pipeline.webp({ quality: 82, effort: 6, smartSubsample: true, smartDeblock: true, preset: entry.webpPreset ?? 'photo' });
  const buffer = await pipeline.toBuffer();
  const metadata = await sharp(buffer).metadata();
  exports.push({ ...entry, original, native: [native.width, native.height], bytes: buffer.length, quality: entry.format === 'webp' ? 82 : null, icc: Boolean(metadata.icc), sha256: createHash('sha256').update(buffer).digest('hex') });
  await fs.writeFile(path.join(root, entry.path), buffer);
  console.log(`Slot ${entry.slot}: ${entry.width}x${entry.height} ${entry.format}, ${buffer.length} bytes${entry.limit && buffer.length >= entry.limit ? ' EXCEEDS LIMIT' : ''}`);
}
await fs.writeFile(path.join(shoot, 'exports.json'), JSON.stringify(exports, null, 2) + '\n');
if (exports.some(entry => entry.limit && entry.bytes >= entry.limit)) process.exitCode = 1;
