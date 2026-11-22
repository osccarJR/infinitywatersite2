import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La app se sirve en /admin. En desarrollo, la API la da el servidor de
// server/index.ts (npm run dev arranca los dos).
export default defineConfig({
  root: 'app',
  base: '/admin/',
  plugins: [react()],
  build: { outDir: '../dist/app', emptyOutDir: true, sourcemap: false },
  server: {
    port: 5173,
    proxy: { '/admin/api': 'http://127.0.0.1:3042' },
  },
});
