/**
 * Prerenderiza cada ruta dentro de su index.html.
 *
 * Sin esto, el HTML que devuelve el servidor es solo `<div id="root"></div>`
 * y todo el contenido lo pinta React en el navegador. Eso es un problema en
 * dos frentes:
 *
 *  - A2P 10DLC: la operadora exige que las paginas legales y el formulario
 *    muestren contenido real. Una comprobacion automatica que no ejecute
 *    JavaScript veria una pagina en blanco.
 *  - SEO y redes sociales: aunque Google ejecuta JS, lo hace mas tarde y
 *    peor; el resto de rastreadores directamente no lo hace.
 *
 * Se ejecuta despues de `vite build`, sobre el dist ya generado.
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { listAllPages } from '../src/i18n/seo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'node_modules', '.prerender');

const ROOT_DIV = '<div id="root"></div>';

async function main() {
  if (!existsSync(dist)) {
    console.error('No existe dist/. Ejecuta primero `vite build`.');
    process.exit(1);
  }

  // El bundle SSR se compila con rollup para que react-router quede
  // deduplicado; cargarlo con ssrLoadModule daria dos instancias del router
  // y el contexto no se encontraria.
  execFileSync(
    'npx',
    ['vite', 'build', '--ssr', 'scripts/prerender-entry.jsx', '--outDir', 'node_modules/.prerender', '--logLevel', 'error'],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }
  );

  const { render } = await import(pathToFileURL(path.join(ssrDir, 'prerender-entry.js')).href);

  let count = 0;
  for (const page of listAllPages()) {
    const file =
      page.path === '/'
        ? path.join(dist, 'index.html')
        : path.join(dist, page.path.replace(/^\//, ''), 'index.html');

    if (!existsSync(file)) {
      console.warn(`  ! falta ${file}, se omite`);
      continue;
    }

    const template = await readFile(file, 'utf8');
    if (!template.includes(ROOT_DIV)) {
      throw new Error(`${file} no contiene ${ROOT_DIV}; el prerenderizado no se puede inyectar.`);
    }

    const html = render(page.path);
    await writeFile(file, template.replace(ROOT_DIV, `<div id="root">${html}</div>`), 'utf8');
    count++;
  }

  console.log(`  prerender: ${count} paginas con HTML completo`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
