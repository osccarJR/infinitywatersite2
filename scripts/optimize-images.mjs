/**
 * Optimiza las imagenes maestras de assets/source/ y escribe versiones
 * listas para produccion en public/images/.
 *
 * Los PNG originales pesaban ~32 MB en total, lo que hundia el tiempo de
 * carga en movil y la calificacion de landing page de Google Ads. Este
 * script los convierte a WebP al ancho maximo que realmente se muestra.
 *
 *   npm run optimize:images
 *
 * Solo hay que volver a ejecutarlo cuando cambie una imagen maestra.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(root, 'assets', 'source');
const OUTPUT_DIR = path.join(root, 'public', 'images');

/**
 * `width` es el ancho renderizado maximo x2 (para pantallas retina).
 * Pasarse de ahi solo suma bytes que nadie ve.
 */
const IMAGES = [
  { source: 'imagenfamiliar.png', output: 'hero-familia.webp', width: 1400, quality: 80 },

  { source: 'sistemas-filtracion-completos.png', output: 'servicio-filtracion.webp', width: 900, quality: 80 },
  { source: 'tratamiento-especializado-pozo.png', output: 'servicio-pozo.webp', width: 900, quality: 80 },
  { source: 'osmosis-premium.png', output: 'servicio-osmosis.webp', width: 900, quality: 80 },
  { source: 'plomeria-mantenimiento.png', output: 'servicio-plomeria.webp', width: 900, quality: 80 },

  { source: 'Agua con mal olor o sabor.png', output: 'problema-olor-sabor.webp', width: 700, quality: 78 },
  { source: 'Manchas y sarro en la casa.png', output: 'problema-manchas-sarro.webp', width: 700, quality: 78 },
  { source: 'Contaminantes invisibles.png', output: 'problema-contaminantes.webp', width: 700, quality: 78 },

  { source: 'BBB Accredited Business.png', output: 'cert-bbb.webp', width: 240, quality: 85 },
  { source: 'water-quality-association.png', output: 'cert-wqa.webp', width: 240, quality: 85 },
  { source: 'Make Alkaline Water.png', output: 'cert-alkaline.webp', width: 240, quality: 85 },

  { source: 'logo.png', output: 'logo.webp', width: 420, quality: 90 },
];

// El favicon y la imagen de Open Graph necesitan formatos que WebP no cubre
// del todo (compatibilidad de navegadores antiguos y de scrapers sociales).
const RASTER_EXTRAS = [
  { source: 'logo.png', output: 'favicon.png', width: 180, height: 180, fit: 'contain', format: 'png' },
  { source: 'logo.png', output: 'apple-touch-icon.png', width: 180, height: 180, fit: 'contain', format: 'png' },
  { source: 'imagenfamiliar.png', output: 'og-image.jpg', width: 1200, height: 630, fit: 'cover', format: 'jpeg', quality: 82 },
];

/**
 * Envuelve un PNG en un contenedor ICO.
 *
 * Los navegadores piden /favicon.ico a la raiz aunque el HTML declare otro
 * icono, y en los logs de produccion eso eran 404 constantes. sharp no sabe
 * escribir ICO, pero el formato admite incrustar un PNG tal cual desde
 * Windows Vista: basta con anteponer la cabecera de 22 bytes.
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: 1 = icono
  header.writeUInt16LE(1, 4); // numero de imagenes
  header.writeUInt8(size >= 256 ? 0 : size, 6); // ancho (0 significa 256)
  header.writeUInt8(size >= 256 ? 0 : size, 7); // alto
  header.writeUInt8(0, 8); // colores de la paleta
  header.writeUInt8(0, 9); // reservado
  header.writeUInt16LE(1, 10); // planos
  header.writeUInt16LE(32, 12); // bits por pixel
  header.writeUInt32LE(png.length, 14); // tamano de la imagen
  header.writeUInt32LE(22, 18); // desplazamiento de los datos
  return Buffer.concat([header, png]);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function sizeOf(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`No existe ${SOURCE_DIR}. Ahi deben vivir los PNG originales.`);
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const available = new Set(await readdir(SOURCE_DIR));
  const manifest = {};
  let before = 0;
  let after = 0;

  for (const image of [...IMAGES, ...RASTER_EXTRAS]) {
    if (!available.has(image.source)) {
      console.warn(`  ! falta el original ${image.source}, se omite`);
      continue;
    }

    const from = path.join(SOURCE_DIR, image.source);
    const to = path.join(OUTPUT_DIR, image.output);

    let pipeline = sharp(from).resize({
      width: image.width,
      height: image.height,
      fit: image.fit ?? 'inside',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement: true,
    });

    if (image.format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (image.format === 'jpeg') {
      pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: image.quality ?? 82, mozjpeg: true });
    } else {
      pipeline = pipeline.webp({ quality: image.quality ?? 80, effort: 6 });
    }

    await pipeline.toFile(to);

    const originalSize = await sizeOf(from);
    const newSize = await sizeOf(to);
    before += originalSize;
    after += newSize;

    // Las dimensiones reales alimentan los atributos width/height del HTML,
    // que son los que evitan el layout shift (CLS) al cargar.
    const meta = await sharp(to).metadata();
    manifest[image.output] = { width: meta.width, height: meta.height, bytes: newSize };

    console.log(`  ${image.source.padEnd(38)} -> ${image.output.padEnd(30)} ${kb(originalSize).padStart(9)} -> ${kb(newSize).padStart(8)}`);
  }

  // El favicon.ico va en la raiz del sitio, no en /images, porque es ahi
  // donde lo piden los navegadores por convencion.
  const icoSize = 32;
  const icoPng = await sharp(path.join(SOURCE_DIR, 'logo.png'))
    .resize({ width: icoSize, height: icoSize, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const ico = pngToIco(icoPng, icoSize);
  await writeFile(path.join(root, 'public', 'favicon.ico'), ico);
  after += ico.length;
  console.log(`  ${'logo.png'.padEnd(38)} -> ${'favicon.ico'.padEnd(30)} ${''.padStart(9)} -> ${kb(ico.length).padStart(8)}`);

  await writeFile(
    path.join(OUTPUT_DIR, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );

  const saved = before > 0 ? (((before - after) / before) * 100).toFixed(1) : '0';
  console.log(`\n  Total: ${kb(before)} -> ${kb(after)}  (-${saved}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
