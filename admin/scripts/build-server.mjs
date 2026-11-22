// Compila el servidor a dist/server (un archivo por punto de entrada).
// Las dependencias (better-sqlite3, zod) quedan fuera del bundle: en el
// servidor se instalan con `npm ci --omit=dev`.
import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.ts', 'server/cli.ts'],
  outdir: 'dist/server',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  packages: 'external',
  logLevel: 'warning',
});
console.log('servidor compilado en dist/server');
