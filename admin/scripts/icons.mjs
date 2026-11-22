// Iconos de la app (pantalla de inicio del telefono) a partir de la gota del
// logo original. Usa sharp del sitio principal: node scripts/icons.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sharp = createRequire(path.join(root, 'package.json'))('sharp');
const SOURCE = path.join(root, 'assets/source/logo.png');
const OUT = path.resolve(root, 'admin/app/public');
const DROP_CROP = { left: 432, top: 0, width: 176, height: 181 };
const NAVY = { r: 10, g: 26, b: 47, alpha: 1 };

const drop = await sharp(SOURCE).extract(DROP_CROP).trim().toBuffer();

async function icon(size, padding, file) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = await sharp(drop).resize({ width: inner, height: inner, fit: 'contain', kernel: 'lanczos3', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, file));
}

await icon(512, 0.2, 'icon-512.png'); // "maskable": margen amplio para el recorte circular de Android
await icon(192, 0.16, 'icon-192.png');
await icon(180, 0.16, 'icon-180.png');
await sharp(drop).resize({ height: 96, kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'mark.png'));
console.log('iconos en app/public');
