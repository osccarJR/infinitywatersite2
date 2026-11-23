/**
 * Servidor del panel de Infinity Water.
 *
 *   /admin/api/*     API JSON (con sesion)
 *   /admin/assets/*  JS y CSS de la app (con hash: cache de un ano)
 *   /admin/*         la app (index.html): el enrutado lo hace el navegador
 *
 * En produccion corre detras de nginx (location /admin) en 127.0.0.1:PORT.
 *
 * Variables: PORT (3042), HOST (127.0.0.1), DATA_DIR (./data),
 * NODE_ENV=production (cookie Secure y cabeceras estrictas).
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync as envExists } from 'node:fs';

// Secretos (GOOGLE_MAPS_API_KEY) en .env junto al servicio: el despliegue no
// lo toca y sobrevive a los reinicios de pm2.
if (envExists('.env')) process.loadEnvFile('.env');
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { backupDatabase, openDatabase } from './db.ts';
import { buildApi } from './api.ts';
import { HttpError, clientIp, parseCookies, readJson, sendJson, sessionCookie, type Ctx } from './http.ts';
import { SESSION_COOKIE, SESSION_DAYS, findUserById, purgeExpiredSessions, toUser, userFromSession } from './auth.ts';
import type { User } from '../shared/domain.ts';
import { bumpVersion } from './version.ts';
import { purgeCreditSecrets } from './credit.ts';
import { writeAudit } from './audit.ts';

const PORT = Number(process.env.PORT ?? 3042);
const HOST = process.env.HOST ?? '127.0.0.1';
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? 'data');
const PROD = process.env.NODE_ENV === 'production';

const here = path.dirname(fileURLToPath(import.meta.url));
// Compilado: dist/server -> dist/app. En desarrollo: server -> dist/app.
const APP_DIR = [path.resolve(here, '../app'), path.resolve(here, '../dist/app')].find((dir) =>
  existsSync(path.join(dir, 'index.html'))
);

const db = openDatabase(DATA_DIR);
const api = buildApi(db, DATA_DIR);

const TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

function baseHeaders(res: ServerResponse) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  // Solo por HTTPS (el sitio ya redirige; asi el navegador no vuelve a intentar por HTTP).
  if (PROD) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  // Otro sitio (aunque sea del mismo dominio, como www) no puede incrustar ni leer
  // lo que responde el panel: fotos de IDs, firmas, datos.
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // nginx ya pone nosniff, Referrer-Policy y X-Frame-Options en produccion;
  // repetirlos duplicaria las cabeceras.
  if (!PROD) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
  }
}

function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string) {
  if (!APP_DIR) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('La app no esta compilada (npm run build).');
    return;
  }
  let relative: string;
  try {
    relative = decodeURIComponent(pathname.replace(/^\/admin\/?/, ''));
  } catch {
    throw new HttpError(400, 'Dirección no válida');
  }
  const file = path.resolve(APP_DIR, relative);
  const insideApp = file.startsWith(APP_DIR + path.sep);
  const isFile = insideApp && existsSync(file) && statSync(file).isFile();

  if (isFile) {
    const hashed = relative.startsWith('assets/');
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
    return;
  }
  // Un archivo que no existe (p. ej. un asset viejo) es 404; una ruta de la app, index.html.
  if (path.extname(relative)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
  res.end(req.method === 'HEAD' ? undefined : readFileSync(path.join(APP_DIR, 'index.html')));
}

/**
 * Proteccion CSRF: toda peticion que cambia datos debe traer la cabecera
 * propia de la app (un formulario de otra web no puede ponerla sin CORS, y
 * aqui no hay CORS) y, si trae Origin, debe ser este mismo sitio.
 */
function checkCsrf(req: IncomingMessage) {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  if (req.headers['x-iw-admin'] !== '1') throw new HttpError(403, 'Petición no permitida');
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try {
      host = new URL(origin).host;
    } catch {
      throw new HttpError(403, 'Petición no permitida');
    }
    const expected = req.headers['x-forwarded-host'] ?? req.headers.host;
    if (host !== expected) throw new HttpError(403, 'Petición no permitida');
  }
}

async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL) {
  const apiPath = url.pathname.slice('/admin/api'.length) || '/';
  const found = api.match(req.method ?? 'GET', apiPath);
  if (!found) throw new HttpError(404, 'Ruta no encontrada');

  checkCsrf(req);
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  const secure = PROD || req.headers['x-forwarded-proto'] === 'https';
  const session = userFromSession(db, token);
  if (!session && !found.route.public) throw new HttpError(401, 'Tu sesión terminó. Vuelve a entrar.');
  if (session?.renewed && token) {
    res.setHeader('Set-Cookie', sessionCookie(SESSION_COOKIE, token, SESSION_DAYS * 86400, secure));
  }

  // Vista previa ("Ver como"): un administrador ve el sistema exactamente
  // como lo ve otro usuario, con sus permisos. Solo lectura: nada se guarda.
  let user = session?.user ?? null;
  let viewer: User | null = null;
  const viewAs = req.headers['x-iw-view-as'];
  if (user && typeof viewAs === 'string' && viewAs) {
    if (!user.permissions.admin) throw new HttpError(403, 'Solo un administrador puede usar la vista previa.');
    const target = /^\d{1,9}$/.test(viewAs) ? findUserById(db, Number(viewAs)) : undefined;
    if (!target) throw new HttpError(404, 'Ese usuario ya no existe. Sal de la vista previa.');
    // Solo se ve como un usuario con permisos (nunca como otro administrador o el dueno).
    if (target.role === 'admin' || target.is_owner) throw new HttpError(403, 'La vista previa es solo para usuarios con permisos.');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(403, `Estás viendo el sistema como ${target.name}: en la vista previa no se guarda nada.`);
    }
    viewer = user;
    user = toUser(target);
  }

  const ctx: Ctx = {
    req,
    res,
    params: found.params,
    query: url.searchParams,
    body: req.method === 'GET' || req.method === 'HEAD' ? {} : await readJson(req),
    ip: clientIp(req),
    user,
    viewer,
    token,
    secure,
  };
  // Borrar es solo del dueno (el superadministrador). Lo demas que usa DELETE
  // no borra datos: quitar la foto de perfil propia o una foto de ID mientras se llena.
  if (req.method === 'DELETE' && user && !/^\/(auth\/avatar|credit\/\d+\/files\/[a-z0-9-]+)$/.test(apiPath)) {
    if (!user.owner) throw new HttpError(403, 'Solo el dueño puede borrar. Pídeselo a él.');
  }
  const result = await found.route.handler(ctx);
  // Toda escritura que llega hasta aqui cambia la version de los datos.
  if (req.method !== 'GET' && req.method !== 'HEAD') bumpVersion();
  if (!res.headersSent) sendJson(res, 200, result ?? { ok: true });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  baseHeaders(res);
  try {
    if (url.pathname.startsWith('/admin/api/')) return await handleApi(req, res, url);
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Método no permitido');
      return serveStatic(req, res, url.pathname);
    }
    if (url.pathname === '/healthz') return sendJson(res, 200, { ok: true });
    throw new HttpError(404, 'No encontrado');
  } catch (error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    if (error instanceof HttpError) return sendJson(res, error.status, { error: error.message, ...(error.field ? { field: error.field } : {}) });
    console.error(`[error] ${req.method} ${url.pathname}`, error);
    sendJson(res, 500, { error: 'Algo salió mal en el servidor. Intenta de nuevo.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[admin] escuchando en http://${HOST}:${PORT}/admin  datos: ${DATA_DIR}  app: ${APP_DIR ?? '(sin compilar)'}`);
});

/* Mantenimiento: respaldo al arrancar y cada 24 h; limpieza de sesiones. */
const daily = async () => {
  try {
    purgeExpiredSessions(db);
    // Datos de identidad de creditos ya decididos: se guardan solo un tiempo.
    const purged = purgeCreditSecrets(db);
    for (const id of purged) {
      writeAudit(db, { userId: null, ip: null, device: 'sistema' }, { action: 'credit-purge', entity: 'credit', entityId: id, label: `la solicitud de crédito #${id}` });
    }
    if (purged.length) {
      // Que no quede rastro en el diario de la base y la app vea el cambio.
      db.pragma('wal_checkpoint(TRUNCATE)');
      bumpVersion();
    }
    await backupDatabase(db, DATA_DIR);
  } catch (error) {
    console.error('[admin] fallo el respaldo diario', error);
  }
};
setTimeout(daily, 10_000).unref();
setInterval(daily, 24 * 60 * 60 * 1000).unref();

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
