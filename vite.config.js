import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { listAllPages, OG_IMAGE, SITE_URL } from './src/i18n/seo.js';

const SEO_START = '<!--seo:start-->';
const SEO_END = '<!--seo:end-->';

/** Bloque de <head> especifico de cada pagina/idioma. */
function renderSeoBlock(page) {
  const alternates = page.alternates
    .map(({ hrefLang, href }) => `    <link rel="alternate" hreflang="${hrefLang}" href="${href}" />`)
    .join('\n');

  return [
    SEO_START,
    `    <title>${page.title}</title>`,
    `    <meta name="description" content="${page.description}" />`,
    `    <link rel="canonical" href="${page.canonical}" />`,
    alternates,
    `    <link rel="alternate" hreflang="x-default" href="${page.alternates[0].href}" />`,
    page.noindex ? '    <meta name="robots" content="noindex,follow" />' : null,
    `    <meta property="og:title" content="${page.ogTitle}" />`,
    `    <meta property="og:description" content="${page.ogDescription}" />`,
    `    <meta property="og:url" content="${page.canonical}" />`,
    `    <meta property="og:image" content="${OG_IMAGE}" />`,
    `    <meta property="og:locale" content="${page.lang === 'es' ? 'es_US' : 'en_US'}" />`,
    `    <meta name="twitter:title" content="${page.ogTitle}" />`,
    `    <meta name="twitter:description" content="${page.ogDescription}" />`,
    `    <meta name="twitter:image" content="${OG_IMAGE}" />`,
    `    ${SEO_END}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Genera un HTML estatico por ruta e idioma, mas el sitemap.
 *
 * Las redes sociales y buena parte de los rastreadores no ejecutan
 * JavaScript: solo leen el HTML que devuelve el servidor. Sin esto, /es
 * compartido por WhatsApp mostraria el titulo en ingles y Google tendria
 * una sola pagina indexable para dos idiomas.
 */
function staticSeoPages() {
  let isSsr = false;

  return {
    name: 'infinitywater-static-seo-pages',
    apply: 'build',
    configResolved(config) {
      // El bundle de la prueba de humo tambien es un build: no debe tocar dist/.
      isSsr = Boolean(config.build?.ssr);
    },
    async closeBundle() {
      if (isSsr) return;

      const dist = path.resolve('dist');
      const template = await readFile(path.join(dist, 'index.html'), 'utf8');

      // Sin marcadores no hay nada que sustituir: mejor fallar el build que
      // publicar en silencio seis paginas con los mismos metadatos.
      if (!template.includes(SEO_START) || !template.includes(SEO_END)) {
        throw new Error(`index.html no contiene ${SEO_START}/${SEO_END}; el SEO por ruta no se puede generar.`);
      }

      const pages = listAllPages();

      for (const page of pages) {
        const html = template
          .replace(/<html lang="[^"]*"/, `<html lang="${page.lang}"`)
          .replace(
            new RegExp(`${SEO_START}[\\s\\S]*?${SEO_END}`),
            () => renderSeoBlock(page)
          );

        const target =
          page.path === '/'
            ? path.join(dist, 'index.html')
            : path.join(dist, page.path.replace(/^\//, ''), 'index.html');

        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, html, 'utf8');
      }

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...pages
          .filter((page) => !page.noindex)
          .map((page) =>
            [
              '  <url>',
              `    <loc>${page.canonical}</loc>`,
              ...page.alternates.map(
                ({ hrefLang, href }) =>
                  `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${href}" />`
              ),
              `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`,
              `    <changefreq>weekly</changefreq>`,
              `    <priority>${page.routeKey === 'home' ? '1.0' : '0.3'}</priority>`,
              '  </url>',
            ].join('\n')
          ),
        '</urlset>',
        '',
      ].join('\n');

      await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
      await writeFile(
        path.join(dist, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
        'utf8'
      );

      console.log(`  seo: ${pages.length} paginas estaticas + sitemap generados`);
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), staticSeoPages()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // React cambia mucho menos que el contenido del sitio: separarlo
        // permite que vuelva del cache del navegador entre despliegues.
        // En SSR las dependencias son externas, asi que no aplica.
        manualChunks: isSsrBuild
          ? undefined
          : {
              react: ['react', 'react-dom', 'react-router-dom'],
            },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
