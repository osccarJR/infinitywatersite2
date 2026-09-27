/**
 * Genera las imagenes estaticas de public/ a partir de los originales de
 * assets/source/: logo, sellos, imagen de Open Graph y favicons.
 *
 *   npm run optimize:images
 *
 * Las FOTOS del contenido no pasan por aqui: viven en web/assets/photos y
 * Astro las convierte en el build a WebP en varios tamanos (srcset). Solo
 * hay que volver a ejecutar este script cuando cambie un original.
 */
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(root, 'assets', 'source');
const OUTPUT_DIR = path.join(root, 'public', 'images');

/** `width` es el ancho maximo mostrado x2 (pantallas retina). */
const IMAGES = [
  { source: 'BBB Accredited Business.png', output: 'cert-bbb.webp', width: 240, quality: 85 },
  { source: 'water-quality-association.png', output: 'cert-wqa.webp', width: 240, quality: 85 },
  { source: 'Make Alkaline Water.png', output: 'cert-alkaline.webp', width: 240, quality: 85 },
  { source: 'logo.png', output: 'logo.webp', width: 420, quality: 90 },
];

/** Los scrapers sociales (WhatsApp, Facebook) necesitan JPEG. */
const OG_IMAGE = { source: 'imagenfamiliar.png', output: 'og-image.jpg', width: 1200, height: 630 };

/**
 * Zona del logo que contiene solo la gota (sin letras). El logo completo es
 * un wordmark horizontal: encogido a 32 px era ilegible como favicon.
 */
const DROP_CROP = { left: 432, top: 0, width: 176, height: 181 };
const NAVY = { r: 10, g: 26, b: 47, alpha: 1 };

/** Envuelve un PNG en un contenedor ICO (valido desde Windows Vista). */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: 1 = icono
  header.writeUInt16LE(1, 4); // numero de imagenes
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); // planos
  header.writeUInt16LE(32, 12); // bits por pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

/** Gota del logo centrada sobre un cuadrado azul marino. */
async function dropIcon(size, padding) {
  const drop = await sharp(path.join(SOURCE_DIR, 'logo.png')).extract(DROP_CROP).trim().toBuffer();
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await sharp(drop)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: icon, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const sizeOf = async (file) => (await stat(file).catch(() => ({ size: 0 }))).size;

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`No existe ${SOURCE_DIR}. Ahi deben vivir los PNG originales.`);
    process.exit(1);
  }
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const image of IMAGES) {
    const from = path.join(SOURCE_DIR, image.source);
    const to = path.join(OUTPUT_DIR, image.output);
    await sharp(from).resize({ width: image.width, withoutEnlargement: true }).webp({ quality: image.quality, effort: 6 }).toFile(to);
    console.log(`  ${image.source.padEnd(34)} -> ${image.output.padEnd(22)} ${kb(await sizeOf(to)).padStart(7)}`);
  }

  const ogTo = path.join(OUTPUT_DIR, OG_IMAGE.output);
  await sharp(path.join(SOURCE_DIR, OG_IMAGE.source))
    .resize({ width: OG_IMAGE.width, height: OG_IMAGE.height, fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(ogTo);
  console.log(`  ${OG_IMAGE.source.padEnd(34)} -> ${OG_IMAGE.output.padEnd(22)} ${kb(await sizeOf(ogTo)).padStart(7)}`);

  await writeFile(path.join(OUTPUT_DIR, 'favicon.png'), await dropIcon(192, 0.14));
  await writeFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'), await dropIcon(180, 0.16));
  await writeFile(path.join(root, 'public', 'favicon.ico'), pngToIco(await dropIcon(32, 0.08), 32));
  console.log('  logo.png (gota)                    -> favicon.png, apple-touch-icon.png, favicon.ico');

  // Logo para fondos claros: las letras grises del original pasan a casi
  // negro; la gota (con color) se conserva.
  const { data, info } = await sharp(path.join(SOURCE_DIR, 'logo.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (max === 0 || (max - min) / max < 0.18) {
      data[i] = 29;
      data[i + 1] = 29;
      data[i + 2] = 31;
    }
  }
  await sharp(data, { raw: info }).resize({ width: 420 }).webp({ quality: 90 }).toFile(path.join(OUTPUT_DIR, 'logo-dark.webp'));
  console.log('  logo.png (letras oscuras)          -> logo-dark.webp');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
