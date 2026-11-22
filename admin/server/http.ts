/**
 * Piezas HTTP minimas (sin framework): enrutador, cuerpo JSON, cookies,
 * respuestas y errores.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { User } from '../shared/domain.ts';

export class HttpError extends Error {
  status: number;
  /** Campo que fallo ("saleDate", "client.create.phone"...), para que la app lleve al usuario ahi. */
  field?: string;
  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  ip: string;
  /** Usuario efectivo. En vista previa, el usuario que se esta viendo. */
  user: User | null;
  /** Vista previa: el administrador que mira el sistema como `user`. */
  viewer: User | null;
  token: string | undefined;
  secure: boolean;
}

export type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
  public: boolean;
}

export class Router {
  routes: Route[] = [];

  add(method: string, path: string, handler: Handler, options: { public?: boolean } = {}) {
    const keys: string[] = [];
    const pattern = new RegExp(
      '^' +
        path.replace(/:(\w+)/g, (_, key) => {
          keys.push(key);
          return '(\\d+)';
        }) +
        '$'
    );
    this.routes.push({ method, pattern, keys, handler, public: Boolean(options.public) });
  }

  match(method: string, path: string) {
    let pathMatched = false;
    for (const route of this.routes) {
      const m = route.pattern.exec(path);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, m[i + 1]]));
      return { route, params };
    }
    if (pathMatched) throw new HttpError(405, 'Método no permitido');
    return null;
  }
}

const MAX_BODY = 1024 * 1024;

export async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Los datos son demasiado grandes');
    chunks.push(chunk as Buffer);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Datos no válidos');
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      /* cookie mal formada: se ignora */
    }
  }
  return out;
}

export function sessionCookie(name: string, value: string, maxAgeSeconds: number, secure: boolean) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/admin',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Strict',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

/** IP real del visitante: nginx la pasa en X-Real-IP (ya resuelta desde Cloudflare). */
export function clientIp(req: IncomingMessage): string {
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real;
  return req.socket.remoteAddress ?? 'unknown';
}
