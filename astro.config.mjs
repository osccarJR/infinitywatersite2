import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * El codigo del sitio vive en web/ (srcDir).
 *
 * - build.format 'directory' genera /es/index.html, /free-water-test/index.html...
 *   que es justo lo que espera el try_files de deploy/infinitywater-common.conf.
 * - trailingSlash 'never': las URL canonicas y las declaradas en el registro
 *   A2P van sin barra final.
 */
export default defineConfig({
  site: 'https://www.infinitywatersite.com',
  srcDir: './web',
  publicDir: './public',
  trailingSlash: 'never',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
    // Mantener los nombres VITE_* que ya usan el .env del VPS y el Dockerfile.
    envPrefix: ['VITE_', 'PUBLIC_'],
    // postcss.config.cjs pertenece al sitio anterior (Tailwind 3); no aplicarlo.
    css: { postcss: { plugins: [] } },
  },
});
