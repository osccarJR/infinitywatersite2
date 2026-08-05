/**
 * Arranque para paneles tipo Pterodactyl, donde solo se puede ejecutar
 * `node index.js` y el puerto llega por la variable PORT.
 *
 * Para un despliegue normal es preferible el Dockerfile + nginx: sirve los
 * mismos ficheros con compresion, cabeceras de cache y sin un proceso de
 * Node haciendo de servidor de estaticos.
 *
 * Frente a la version anterior: usa spawn en vez de exec (que bufferizaba
 * toda la salida del build y podia desbordarse), propaga los codigos de
 * salida en vez de morir en silencio, y no reconstruye si dist ya existe.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;
const distDir = path.join(root, 'dist');
const skipBuild = process.env.SKIP_BUILD === '1' && existsSync(distDir);

/** Ejecuta un comando heredando stdio y resuelve con su codigo de salida. */
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', resolve);
  });
}

async function main() {
  if (!skipBuild) {
    console.log('> compilando el sitio...');
    const code = await run('npm', ['run', 'build']);
    if (code !== 0) {
      console.error(`El build fallo con codigo ${code}. No se arranca el servidor.`);
      process.exit(code ?? 1);
    }
  } else {
    console.log('> SKIP_BUILD=1 y dist/ ya existe: se omite la compilacion.');
  }

  if (!existsSync(distDir)) {
    console.error('No existe dist/ despues del build. Abortando.');
    process.exit(1);
  }

  console.log(`> sirviendo dist/ en el puerto ${port}`);
  const code = await run('npx', ['serve', '-s', 'dist', '-l', String(port)]);
  process.exit(code ?? 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
