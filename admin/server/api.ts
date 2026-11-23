/**
 * Rutas de la API (todas bajo /admin/api).
 *
 * La app carga todo con GET /bootstrap y, despues de cada cambio, lo vuelve
 * a pedir: los datos de un negocio familiar caben de sobra en una respuesta
 * y asi la busqueda, los filtros y los totales son instantaneos.
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { z } from 'zod';
import type { DB } from './db.ts';
import { HttpError, Router, sessionCookie, type Ctx } from './http.ts';
import * as repo from './repo.ts';
import {
  CatalogInput,
  ClientInput,
  firstIssue,
  LoginInput,
  MarkBatchInput,
  TechPayInput,
  MarkInput,
  PasswordInput,
  PersonInput,
  SaleInput,
  ServiceInput,
  ServiceInputNoAmount,
  WarrantyInput,
  InvoiceInput,
  UserCreateInput,
  UserUpdateInput,
  PayableAccountInput,
  PayableInput,
  PayablePaymentInput,
  InventoryItemInput,
  InventoryMovementInput,
} from './schemas.ts';
import * as books from './books.ts';
import { createdTodayBy, need, protectClientBody, protectSaleBody, protectServiceBody, scopeOf, seesClient, seesSale, seesService, shapeClient, shapeSale, shapeService } from './permissions.ts';
import { invoiceLabel, invoiceTotals, normalizePermissions, permissionsSummary, type PermissionFlag, type User } from '../shared/domain.ts';
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  clearLoginFailures,
  createSession,
  deleteSession,
  deleteUserSessions,
  findUserById,
  findUserByUsername,
  getDummyHash,
  hashPassword,
  loginBlocked,
  recordLoginFailure,
  toUser,
  verifyPassword,
} from './auth.ts';
import { exportCsv, type ExportKind } from './export.ts';
import { autocomplete, placeAddress, placesAllowed, placesEnabled } from './places.ts';
import { addressById, geoEnabled, searchAddresses, searchCities, zipLookup } from './geo.ts';
import { todayISO } from '../shared/domain.ts';
import { dataVersion } from './version.ts';
import { createHash } from 'node:crypto';
import { creditRoutes, visibleCredit } from './creditApi.ts';
import { initCreditKey } from './credit.ts';
import { AUDIT_GROUPS, auditStats, deviceOf, diff, initAudit, listAudit, permissionChanges, snapshot, verifyAudit, writeAudit, type AuditEntry, type Change } from './audit.ts';

function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const { message, field } = firstIssue(result.error);
    throw new HttpError(400, message, field);
  }
  return result.data;
}

const me = (ctx: Ctx) => {
  if (!ctx.user) throw new HttpError(401, 'Inicia sesión');
  return ctx.user;
};

/** Usuario y sus permisos, exigiendo una condicion. */
const allowed = (ctx: Ctx, check: (p: User['permissions']) => boolean, message?: string) => {
  const user = me(ctx);
  need(check(user.permissions), message);
  return user;
};
const isAdmin = (p: User['permissions']) => p.admin;
/** Atajo: el permiso detallado (p. ej. can('sales.create')). */
const can = (flag: PermissionFlag) => (p: User['permissions']) => p.flags[flag];

const num = (ctx: Ctx, key = 'id') => Number(ctx.params[key]);

/** Rechaza el guardado si otra persona cambio el registro mientras se editaba. */
function checkVersion(db: DB, table: 'clients' | 'sales' | 'services', id: number, expected: string | undefined) {
  if (!expected) return;
  const current = repo.currentVersion(db, table, id);
  if (current && current !== expected) {
    throw new HttpError(409, 'Alguien cambió este registro mientras lo editabas. Sal sin guardar y vuelve a abrirlo para ver los cambios.');
  }
}

function notFound(changes: number, what: string) {
  if (!changes) throw new HttpError(404, `${what} no existe`);
}

/** Traduce los errores de SQLite que el usuario puede provocar. */
function friendly<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error: any) {
    const code = String(error?.code ?? '');
    if (code.startsWith('SQLITE_CONSTRAINT_UNIQUE')) throw new HttpError(409, 'Ya existe uno con ese nombre');
    if (code.startsWith('SQLITE_CONSTRAINT_FOREIGNKEY'))
      throw new HttpError(409, 'Uno de los datos elegidos ya no existe. Recarga la página.');
    throw error;
  }
}

export function buildApi(db: DB, dataDir: string) {
  const addressesEnabled = () => geoEnabled(dataDir) || placesEnabled();
  const api = new Router();
  initAudit(db, dataDir);
  initCreditKey(dataDir);

  /* ------------------------- registro de actividad ------------------------- */

  /** Anota un movimiento con quien, IP y equipo. */
  const log = (ctx: Ctx, entry: AuditEntry, userId?: number | null) =>
    writeAudit(db, { userId: userId === undefined ? ctx.user?.id ?? null : userId, ip: ctx.ip, device: deviceOf(String(ctx.req.headers['user-agent'] ?? '')) }, entry);
  const clientName = (id: number | null | undefined) => (id ? repo.getClient(db, id)?.name ?? `cliente #${id}` : 'sin cliente');
  const saleLabel = (s: { id: number; clientId: number } | null | undefined) => (s ? `la venta de ${clientName(s.clientId)} (#${s.id})` : 'una venta');
  const serviceLabel = (s: { id: number; clientId: number } | null | undefined) => (s ? `el servicio de ${clientName(s.clientId)} (#${s.id})` : 'un servicio');
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const dollars = (cents: number) => usd.format(cents / 100);
  /** "Oscar vio el sistema como Adriana": una vez cada 30 minutos por pareja. */
  const previewSeen = new Map<string, number>();
  const logPreview = (ctx: Ctx, target: User) => {
    const key = `${ctx.viewer!.id}:${target.id}`;
    if (Date.now() - (previewSeen.get(key) ?? 0) < 30 * 60 * 1000) return;
    previewSeen.set(key, Date.now());
    log(ctx, { action: 'preview', entity: 'user', entityId: target.id, label: target.name }, ctx.viewer!.id);
  };
  const accountName = (id: number) => books.listPayableAccounts(db).find((a) => a.id === id)?.name ?? `cuenta #${id}`;
  const payableLabel = (p: { description: string; accountId: number; amount: number } | null | undefined) =>
    p ? `el gasto «${p.description}» de ${accountName(p.accountId)} (${dollars(p.amount)})` : 'un gasto';
  const paymentLabel = (p: { accountId: number; amount: number }) => `un pago de ${dollars(p.amount)} a ${accountName(p.accountId)}`;
  const paymentChanges = (p: { payableId: number | null; date: string; method: string | null; notes: string | null }): Change[] => [
    { f: 'Fecha', b: p.date.split('-').reverse().join('/') },
    ...(p.payableId ? [{ f: 'Para', b: books.getPayable(db, p.payableId)?.description ?? `gasto #${p.payableId}` }] : []),
    ...(p.method ? [{ f: 'Medio', b: p.method }] : []),
    ...(p.notes ? [{ f: 'Notas', b: p.notes }] : []),
  ];
  const itemName = (id: number) => books.getInventoryItem(db, id)?.name ?? `producto #${id}`;
  const movementLabel = (m: { kind: string; quantity: number; itemId: number }) =>
    `${m.kind === 'in' ? 'una entrada' : m.kind === 'out' ? 'una salida' : 'un conteo'} de ${Math.abs(m.quantity)} ${itemName(m.itemId)}`;
  const movementChanges = (m: { kind: string; quantity: number; date: string; saleId: number | null; serviceId: number | null; notes: string | null }): Change[] => [
    { f: 'Fecha', b: m.date.split('-').reverse().join('/') },
    { f: 'Cantidad', b: m.kind === 'out' ? `−${m.quantity}` : m.quantity > 0 ? `+${m.quantity}` : String(m.quantity) },
    ...(m.saleId ? [{ f: 'Para', b: saleLabel(repo.getSale(db, m.saleId)) }] : []),
    ...(m.serviceId ? [{ f: 'Para', b: serviceLabel(repo.getService(db, m.serviceId)) }] : []),
    ...(m.notes ? [{ f: 'Notas', b: m.notes }] : []),
  ];

  /** Resuelve el cliente de una venta o servicio: existente o nuevo. */
  const resolveClient = (ctx: Ctx, ref: SaleInput['client'], userId: number, user?: User) => {
    if ('id' in ref) {
      if (!repo.getClient(db, ref.id)) throw new HttpError(400, 'El cliente elegido ya no existe');
      if (user) need(seesClient(scopeOf(db, user), ref.id), 'No tienes acceso a ese cliente.');
      return ref.id;
    }
    const id = repo.insertClient(db, ref.create, userId);
    log(ctx, { action: 'create', entity: 'client', entityId: id, label: `al cliente ${ref.create.name}`, changes: snapshot(db, 'client', repo.getClient(db, id)) });
    return id;
  };

  /* ---------------------------- acceso ---------------------------- */

  api.add(
    'POST',
    '/auth/login',
    async (ctx) => {
      const { username, password } = parse(LoginInput, ctx.body);
      if (loginBlocked(ctx.ip, username)) {
        throw new HttpError(429, 'Demasiados intentos. Espera 15 minutos y vuelve a probar.');
      }
      const row = findUserByUsername(db, username);
      const ok = await verifyPassword(password, row?.password_hash ?? (await getDummyHash()));
      if (!row || !ok || !row.active) {
        recordLoginFailure(ctx.ip, username);
        log(ctx, { action: 'login-failed', entity: 'user', entityId: row?.id ?? null, label: username.slice(0, 60), extra: { reason: !row ? 'usuario no existe' : !ok ? 'contraseña incorrecta' : 'usuario sin acceso' } }, row?.id ?? null);
        throw new HttpError(401, 'Usuario o contraseña incorrectos');
      }
      clearLoginFailures(ctx.ip, username);
      const token = createSession(db, row.id, ctx.ip, String(ctx.req.headers['user-agent'] ?? ''));
      ctx.res.setHeader('Set-Cookie', sessionCookie(SESSION_COOKIE, token, SESSION_DAYS * 86400, ctx.secure));
      log(ctx, { action: 'login', entity: 'user', entityId: row.id, label: row.name }, row.id);
      return { user: toUser(row) };
    },
    { public: true }
  );

  api.add(
    'POST',
    '/auth/logout',
    (ctx) => {
      if (ctx.user && !ctx.viewer) log(ctx, { action: 'logout', entity: 'user', entityId: ctx.user.id, label: ctx.user.name });
      deleteSession(db, ctx.token);
      ctx.res.setHeader('Set-Cookie', sessionCookie(SESSION_COOKIE, '', 0, ctx.secure));
      // Los datos se guardan en la cache del navegador para responder 304:
      // al salir se borran (equipo compartido).
      ctx.res.setHeader('Clear-Site-Data', '"cache"');
      return { ok: true };
    },
    { public: true }
  );

  api.add('GET', '/auth/me', (ctx) => ({ user: me(ctx) }));

  api.add('POST', '/auth/password', async (ctx) => {
    const user = me(ctx);
    const { current, next } = parse(PasswordInput, ctx.body);
    const row = findUserByUsername(db, user.username);
    if (!row || !(await verifyPassword(current, row.password_hash))) {
      throw new HttpError(400, 'La contraseña actual no es correcta');
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(next), user.id);
    // Cierra las demas sesiones abiertas con la clave anterior.
    deleteUserSessions(db, user.id, ctx.token);
    log(ctx, { action: 'password', entity: 'user', entityId: user.id, label: 'su propia contraseña' });
    return { ok: true };
  });

  /* --------------------------- foto de perfil --------------------------- */

  /** Cada uno pone su propia foto (ya recortada en la app: cuadrada y liviana). */
  api.add('PUT', '/auth/avatar', (ctx) => {
    const user = me(ctx);
    const image = (ctx.body as { image?: unknown })?.image;
    const match = typeof image === 'string' ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image) : null;
    if (!match) throw new HttpError(400, 'La foto no es válida. Prueba con otra.');
    const data = Buffer.from(match[2], 'base64');
    if (data.length > 400_000) throw new HttpError(400, 'La foto es demasiado pesada.');
    // Que de verdad sea una imagen (cabecera del archivo).
    const isJpeg = data[0] === 0xff && data[1] === 0xd8;
    const isPng = data.subarray(0, 4).toString('hex') === '89504e47';
    const isWebp = data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) throw new HttpError(400, 'La foto no es válida. Prueba con otra.');
    db.transaction(() => {
      db.prepare(`INSERT INTO user_avatars (user_id, mime, data, updated_at) VALUES (?, ?, ?, datetime('now'))
                  ON CONFLICT(user_id) DO UPDATE SET mime = excluded.mime, data = excluded.data, updated_at = excluded.updated_at`).run(user.id, match[1], data);
      db.prepare(`UPDATE users SET avatar_at = datetime('now') WHERE id = ?`).run(user.id);
    })();
    log(ctx, { action: 'avatar', entity: 'user', entityId: user.id, label: 'su foto de perfil' });
    return { user: toUser(findUserById(db, user.id)!) };
  });

  api.add('DELETE', '/auth/avatar', (ctx) => {
    const user = me(ctx);
    db.prepare('DELETE FROM user_avatars WHERE user_id = ?').run(user.id);
    db.prepare('UPDATE users SET avatar_at = NULL WHERE id = ?').run(user.id);
    log(ctx, { action: 'avatar', entity: 'user', entityId: user.id, label: 'su foto de perfil (la quitó)' });
    return { user: toUser(findUserById(db, user.id)!) };
  });

  api.add('GET', '/avatars/:id', (ctx) => {
    me(ctx);
    const row = db.prepare('SELECT mime, data FROM user_avatars WHERE user_id = ?').get(num(ctx)) as { mime: string; data: Buffer } | undefined;
    notFound(row ? 1 : 0, 'La foto');
    ctx.res.writeHead(200, {
      'Content-Type': row!.mime,
      'Content-Length': row!.data.length,
      // La URL cambia con cada foto nueva (?v=...): se puede guardar mucho tiempo.
      'Cache-Control': 'private, max-age=31536000, immutable',
    });
    ctx.res.end(row!.data);
    return undefined;
  });

  /* ------------------------------ datos ------------------------------ */

  api.add('GET', '/bootstrap', (ctx) => {
    const user = me(ctx);
    // Huella de los datos (por usuario: la respuesta incluye "me"). Si el
    // navegador ya tiene esta version, 304 sin cuerpo.
    const fingerprint = `${dataVersion(db)}:${user.id}:${user.name}:${JSON.stringify(user.permissions)}:${ctx.viewer?.id ?? 0}`;
    const etag = `"${createHash('sha1').update(fingerprint).digest('base64url')}"`;
    const seen = String(ctx.req.headers['if-none-match'] ?? '').split(',').map((t) => t.trim().replace(/^W\//, ''));
    if (seen.includes(etag)) {
      ctx.res.writeHead(304, { ETag: etag, 'Cache-Control': 'private, no-cache' });
      ctx.res.end();
      return undefined;
    }
    if (ctx.viewer) logPreview(ctx, user);
    const body = JSON.stringify(bootstrapData(user, ctx.viewer));
    ctx.res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      ETag: etag,
      // Se guarda pero se revalida siempre: el navegador pregunta "¿cambio?" cada vez.
      'Cache-Control': 'private, no-cache',
    });
    ctx.res.end(body);
    return undefined;
  });

  /** Todo lo que el usuario puede ver, y nada mas. */
  const bootstrapData = (user: User, viewer: User | null) => {
    const p = user.permissions;
    const scope = scopeOf(db, user);
    const f = p.flags;
    const costs = f['money.costs'];
    // Cuentas por pagar: todas o solo las que se le asignaron.
    const accountOk = (id: number) => p.payableAccounts === null || p.payableAccounts.includes(id);
    return {
      me: user,
      viewer,
      features: { places: addressesEnabled() },
      clients: !f['clients.view'] ? [] : repo.listClients(db).filter((c) => seesClient(scope, c.id)).map((c) => shapeClient(c, p)),
      sales: !f['sales.view'] ? [] : repo.listSales(db).filter((s) => seesSale(scope, s.id)).map((s) => shapeSale(s, p)),
      services: !f['services.view'] ? [] : repo.listServices(db).filter((s) => seesService(scope, s.id)).map((s) => shapeService(s, p)),
      people: repo.listPeople(db),
      credit: visibleCredit(db, user),
      financiers: repo.listCatalog(db, 'financiers'),
      suppliers: costs || f['inventory.view'] || f['catalogs.suppliers'] ? repo.listCatalog(db, 'suppliers') : [],
      brands: repo.listCatalog(db, 'brands'),
      payableAccounts: !f['payables.view'] ? [] : books.listPayableAccounts(db).filter((a) => accountOk(a.id)),
      payables: !f['payables.view'] ? [] : books.listPayables(db).filter((x) => accountOk(x.accountId)),
      payablePayments: !f['payables.view'] ? [] : books.listPayablePayments(db).filter((x) => accountOk(x.accountId)),
      inventoryItems: !f['inventory.view'] ? [] : books.listInventoryItems(db).map((i) => (costs ? i : { ...i, cost: null })),
      inventoryMovements:
        !f['inventory.view']
          ? []
          : books
              .listInventoryMovements(db)
              .map((m) => ({ ...m, unitCost: costs ? m.unitCost : null, saleId: m.saleId && seesSale(scope, m.saleId) && f['sales.view'] ? m.saleId : null, serviceId: m.serviceId && seesService(scope, m.serviceId) && f['services.view'] ? m.serviceId : null })),
    };
  };

  /* ------------------------ autocompletado de direcciones ------------------------ */

  const placesGuard = (ctx: Ctx) => {
    const user = me(ctx);
    if (!addressesEnabled()) throw new HttpError(404, 'El autocompletado de direcciones no está activado');
    if (!placesAllowed(user.id)) throw new HttpError(429, 'Demasiadas búsquedas seguidas. Espera un momento.');
    const session = ctx.query.get('s') ?? '';
    if (!/^[A-Za-z0-9-]{8,64}$/.test(session)) throw new HttpError(400, 'Sesión de búsqueda no válida');
    return session;
  };

  api.add('GET', '/places/autocomplete', async (ctx) => {
    const session = placesGuard(ctx);
    const q = (ctx.query.get('q') ?? '').trim().slice(0, 120);
    if (q.length < 3) return { suggestions: [] };
    // Primero el indice propio (Florida, al instante); Google solo si hay clave y no hubo resultados.
    const local = searchAddresses(dataDir, q);
    if (local.length || !placesEnabled()) return { suggestions: local };
    try {
      return { suggestions: await autocomplete(q, session) };
    } catch {
      throw new HttpError(502, 'No se pudo consultar Google. Escribe la dirección a mano.');
    }
  });

  api.add('GET', '/places/cities', (ctx) => {
    placesGuard(ctx);
    return { cities: searchCities(dataDir, (ctx.query.get('q') ?? '').slice(0, 60)) };
  });

  api.add('GET', '/places/zip', (ctx) => {
    placesGuard(ctx);
    return { place: zipLookup(dataDir, (ctx.query.get('zip') ?? '').trim()) };
  });

  api.add('GET', '/places/detail', async (ctx) => {
    const session = placesGuard(ctx);
    const id = ctx.query.get('id') ?? '';
    const local = addressById(dataDir, id);
    if (local) return { place: { ...local, formatted: `${local.address}, ${local.city}, ${local.state} ${local.zip}` } };
    if (!/^[A-Za-z0-9_-]{10,300}$/.test(id)) throw new HttpError(400, 'Lugar no válido');
    try {
      return { place: await placeAddress(id, session) };
    } catch {
      throw new HttpError(502, 'No se pudo consultar Google. Escribe la dirección a mano.');
    }
  });

  /* ----------------------------- clientes ----------------------------- */

  api.add('POST', '/clients', (ctx) => {
    const user = allowed(ctx, can('clients.create'));
    const input = parse(ClientInput, ctx.body);
    const id = repo.insertClient(db, input, user.id);
    log(ctx, { action: 'create', entity: 'client', entityId: id, label: `al cliente ${input.name}`, changes: snapshot(db, 'client', repo.getClient(db, id)) });
    return { client: shapeClient(repo.getClient(db, id)!, user.permissions) };
  });

  api.add('PUT', '/clients/:id', (ctx) => {
    const user = allowed(ctx, can('clients.edit'));
    need(seesClient(scopeOf(db, user), num(ctx)), 'No tienes acceso a este cliente.');
    const before = repo.getClient(db, num(ctx));
    const input = parse(ClientInput, protectClientBody(ctx.body, before, user.permissions));
    checkVersion(db, 'clients', num(ctx), input.expectedUpdatedAt);
    notFound(repo.updateClient(db, num(ctx), input, user.id), 'El cliente');
    const after = repo.getClient(db, num(ctx));
    const changes = diff(db, 'client', before, after);
    if (changes.length) log(ctx, { action: 'update', entity: 'client', entityId: num(ctx), label: `al cliente ${after?.name}`, changes });
    return { client: shapeClient(repo.getClient(db, num(ctx))!, user.permissions) };
  });

  api.add('DELETE', '/clients/:id', (ctx) => {
    // Borrar un cliente borra todas sus ventas y servicios: solo con alcance total.
    allowed(ctx, (p) => p.flags['clients.delete'] && p.scope === 'all');
    const client = repo.getClient(db, num(ctx));
    notFound(client ? 1 : 0, 'El cliente');
    const sales = (db.prepare('SELECT COUNT(*) AS n FROM sales WHERE client_id = ?').get(num(ctx)) as { n: number }).n;
    const services = (db.prepare('SELECT COUNT(*) AS n FROM services WHERE client_id = ?').get(num(ctx)) as { n: number }).n;
    log(ctx, {
      action: 'delete',
      entity: 'client',
      entityId: num(ctx),
      label: `al cliente ${client!.name}`,
      changes: [...snapshot(db, 'client', client), { f: 'Se borraron también', b: `${sales} ventas y ${services} servicios` }],
    });
    repo.deleteClient(db, num(ctx));
    return { ok: true };
  });

  /* ------------------------- solicitudes de credito ------------------------- */

  creditRoutes(api, db, log);

  /* ------------------------------ ventas ------------------------------ */

  api.add('POST', '/sales', (ctx) => {
    const user = allowed(ctx, can('sales.create'));
    const input = parse(SaleInput, protectSaleBody(ctx.body, null, user.permissions));
    const id = friendly(() =>
      db.transaction(() => {
        const clientId = resolveClient(ctx, input.client, user.id, user);
        const saleId = repo.insertSale(db, input, clientId, user.id);
        const sale = repo.getSale(db, saleId);
        log(ctx, { action: 'create', entity: 'sale', entityId: saleId, label: saleLabel(sale), changes: snapshot(db, 'sale', sale) });
        return saleId;
      })()
    );
    return { sale: shapeSale(repo.getSale(db, id)!, user.permissions) };
  });

  api.add('PUT', '/sales/:id', (ctx) => {
    const user = me(ctx);
    const existing = repo.getSale(db, num(ctx));
    notFound(existing ? 1 : 0, 'La venta');
    // Editar, o corregir el mismo dia lo que el mismo registro ("Guardar y otro", un error de dedo).
    need(user.permissions.flags['sales.edit'] || (user.permissions.flags['sales.create'] && createdTodayBy(db, 'sales', num(ctx), user.id)));
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    const input = parse(SaleInput, protectSaleBody(ctx.body, existing, user.permissions));
    friendly(() =>
      db.transaction(() => {
        checkVersion(db, 'sales', num(ctx), input.expectedUpdatedAt);
        const sameClient = 'id' in input.client && input.client.id === existing!.clientId;
        const clientId = resolveClient(ctx, input.client, user.id, sameClient ? undefined : user);
        notFound(repo.updateSale(db, num(ctx), input, clientId, user.id), 'La venta');
        const after = repo.getSale(db, num(ctx));
        const changes = diff(db, 'sale', existing, after);
        if (changes.length) log(ctx, { action: 'update', entity: 'sale', entityId: num(ctx), label: saleLabel(after), changes });
      })()
    );
    return { sale: shapeSale(repo.getSale(db, num(ctx))!, user.permissions) };
  });

  /** Guarda la garantia que se va a imprimir (asi se reimprime con los mismos seriales). */
  api.add('POST', '/sales/:id/warranty', (ctx) => {
    const user = allowed(ctx, (p) => p.flags['sales.view'] && (p.flags['sales.edit'] || p.flags['sales.create']));
    const sale = repo.getSale(db, num(ctx));
    notFound(sale ? 1 : 0, 'La venta');
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    const input = parse(WarrantyInput, ctx.body);
    const data = { ...input, generatedAt: new Date().toISOString() };
    repo.saveWarranty(db, num(ctx), data);
    log(ctx, {
      action: sale!.warranty ? 'warranty-update' : 'warranty',
      entity: 'sale',
      entityId: num(ctx),
      label: `la garantía de ${saleLabel(sale)}`,
      changes: [
        { f: 'Fecha', b: input.issueDate.split('-').reverse().join('/') },
        { f: 'Representante', b: input.representative },
        ...input.lines.map((l) => ({ f: l.item, b: l.serial || 'sin serial' })),
      ],
    });
    return { sale: shapeSale(repo.getSale(db, num(ctx))!, user.permissions) };
  });

  /** Siguiente numero de factura libre (el formulario lo propone). */
  api.add('GET', '/invoices/next', (ctx) => {
    allowed(ctx, (p) => p.flags['sales.view'] && p.flags['money.prices'] && (p.flags['sales.edit'] || p.flags['sales.create']));
    return { number: repo.nextInvoiceNumber(db) };
  });

  /** Emite (o vuelve a emitir) la factura de la venta; el numero no se repite entre ventas. */
  api.add('POST', '/sales/:id/invoice', (ctx) => {
    const user = allowed(ctx, (p) => p.flags['sales.view'] && p.flags['money.prices'] && (p.flags['sales.edit'] || p.flags['sales.create']));
    const sale = repo.getSale(db, num(ctx));
    notFound(sale ? 1 : 0, 'La venta');
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    const input = parse(InvoiceInput, ctx.body);
    const fmtDate = (d: string) => d.split('-').reverse().join('/');
    db.transaction(() => {
      const number = input.number ?? sale!.invoice?.number ?? repo.nextInvoiceNumber(db);
      if (input.discount > invoiceTotals({ ...input, discount: 0 }).subtotal) throw new HttpError(400, 'El descuento no puede ser mayor que la suma de las líneas.', 'discount');
      const owner = repo.invoiceNumberOwner(db, number, num(ctx));
      if (owner) throw new HttpError(409, `La factura ${invoiceLabel(number)} ya es de la venta #${owner}. La siguiente libre es la ${invoiceLabel(repo.nextInvoiceNumber(db))}.`, 'number');
      const data = { ...input, number, issuedAt: new Date().toISOString() };
      repo.saveInvoice(db, num(ctx), data);
      const t = invoiceTotals(data);
      const usd = (c: number) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      log(ctx, {
        action: sale!.invoice ? 'invoice-update' : 'invoice',
        entity: 'sale',
        entityId: num(ctx),
        label: `la factura ${invoiceLabel(number)} de ${saleLabel(sale)}`,
        changes: [
          { f: 'Número', b: invoiceLabel(number) },
          { f: 'Fecha', b: fmtDate(input.issueDate) },
          ...data.lines.map((l) => ({ f: l.description, b: `${l.quantity} × ${usd(l.unitPrice)}` })),
          ...(t.discount ? [{ f: 'Descuento', b: usd(t.discount) }] : []),
          ...(t.tax ? [{ f: 'Impuesto', b: `${usd(t.tax)} (${t.rate} %)` }] : []),
          { f: 'Total', b: usd(t.total) },
          { f: 'Saldo pendiente', b: usd(t.balance) },
        ],
      });
    })();
    return { sale: shapeSale(repo.getSale(db, num(ctx))!, user.permissions) };
  });

  /** Marcar pagado: la comision con "Pagar comisiones"; lo de la financiera con "Registrar pagos de financieras". */
  const markFlag = (field: 'fundedPaid' | 'commissionPaid'): PermissionFlag => (field === 'fundedPaid' ? 'payments.financiers' : 'payments.commissions');

  api.add('POST', '/sales/:id/mark', (ctx) => {
    const user = me(ctx);
    const { field, paid, date } = parse(MarkInput, ctx.body);
    need(user.permissions.flags[markFlag(field)]);
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    const before = repo.getSale(db, num(ctx));
    notFound(repo.markSale(db, num(ctx), field, paid, date, user.id), 'La venta');
    log(ctx, {
      action: 'mark',
      entity: 'sale',
      entityId: num(ctx),
      label: `${field === 'fundedPaid' ? 'el pago de la financiera' : 'la comisión'} de ${saleLabel(before)} como ${paid ? 'pagado' : 'pendiente'}`,
      changes: diff(db, 'sale', before, repo.getSale(db, num(ctx))),
    });
    return { sale: shapeSale(repo.getSale(db, num(ctx))!, user.permissions) };
  });

  api.add('POST', '/sales/mark-batch', (ctx) => {
    const user = me(ctx);
    const { ids, field, paid, date } = parse(MarkBatchInput, ctx.body);
    need(user.permissions.flags[markFlag(field)]);
    const unique = [...new Set(ids)];
    const scope = scopeOf(db, user);
    need(unique.every((id) => seesSale(scope, id)), 'Una de las ventas no es tuya.');
    // Todo o nada: si una venta no aplica (ya no existe o no es financiada), no se marca ninguna.
    friendly(() =>
      db.transaction(() => {
        for (const id of unique) {
          if (!repo.markSale(db, id, field, paid, date, user.id)) {
            throw new HttpError(409, 'Una de las ventas cambió o ya no aplica. Recarga e intenta de nuevo.');
          }
        }
        const list = unique.map((id) => repo.getSale(db, id)!);
        const amount = list.reduce((n, s) => n + (field === 'commissionPaid' ? s.commission ?? 0 : s.fundedAmount ?? s.price ?? 0), 0);
        log(ctx, {
          action: 'mark-batch',
          entity: 'sale',
          label: `${field === 'fundedPaid' ? 'como recibido el pago de la financiera en' : 'como pagada la comisión de'} ${unique.length} ${unique.length === 1 ? 'venta' : 'ventas'} (${dollars(amount)})`,
          changes: list.map((s) => ({ f: saleLabel(s), b: field === 'commissionPaid' ? `${dollars(s.commission ?? 0)} · ${s.sellerId ? repo.listPeople(db).find((p) => p.id === s.sellerId)?.name ?? '' : ''}` : dollars(s.fundedAmount ?? 0) })),
          extra: { ids: unique, date },
        });
      })()
    );
    return { updated: unique.length };
  });

  api.add('POST', '/tech-payments', (ctx) => {
    const user = allowed(ctx, can('payments.technicians'));
    const { saleIds, serviceIds, date } = parse(TechPayInput, ctx.body);
    const scope = scopeOf(db, user);
    need(saleIds.every((id) => seesSale(scope, id)) && serviceIds.every((id) => seesService(scope, id)), 'Uno de los trabajos no es tuyo.');
    const total = new Set(saleIds).size + new Set(serviceIds).size;
    friendly(() =>
      db.transaction(() => {
        const changed = repo.payTechnician(db, [...new Set(saleIds)], [...new Set(serviceIds)], date, user.id);
        if (changed !== total) throw new HttpError(409, 'Uno de los trabajos cambió o ya no aplica. Recarga e intenta de nuevo.');
        const sales = [...new Set(saleIds)].map((id) => repo.getSale(db, id)!);
        const services = [...new Set(serviceIds)].map((id) => repo.getService(db, id)!);
        const amount = sales.reduce((n, s) => n + (s.installerPay ?? 0), 0) + services.reduce((n, s) => n + (s.technicianPay ?? 0), 0);
        const techId = sales[0]?.installerId ?? services[0]?.technicianId ?? null;
        log(ctx, {
          action: 'tech-payment',
          entity: 'technician',
          entityId: techId,
          label: `a ${techId ? repo.listPeople(db).find((p) => p.id === techId)?.name ?? 'un técnico' : 'un técnico'}: ${total} ${total === 1 ? 'trabajo' : 'trabajos'} por ${dollars(amount)}`,
          changes: [
            ...sales.map((s) => ({ f: `Instalación · ${saleLabel(s)}`, b: dollars(s.installerPay ?? 0) })),
            ...services.map((s) => ({ f: `Servicio · ${serviceLabel(s)}`, b: dollars(s.technicianPay ?? 0) })),
          ],
          extra: { date },
        });
      })()
    );
    return { updated: total };
  });

  api.add('DELETE', '/sales/:id', (ctx) => {
    const user = allowed(ctx, can('sales.delete'));
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    const sale = repo.getSale(db, num(ctx));
    notFound(sale ? 1 : 0, 'La venta');
    log(ctx, { action: 'delete', entity: 'sale', entityId: num(ctx), label: saleLabel(sale), changes: snapshot(db, 'sale', sale) });
    notFound(repo.deleteSale(db, num(ctx)), 'La venta');
    return { ok: true };
  });

  /* -------------------------- servicio tecnico -------------------------- */

  const saveService = (ctx: Ctx, id: number | null) => {
    const user = me(ctx);
    const p = user.permissions;
    const scope = scopeOf(db, user);
    const existing = id == null ? null : repo.getService(db, id);
    if (id == null) need(p.flags['services.create']);
    else {
      notFound(existing ? 1 : 0, 'El servicio');
      need(p.flags['services.edit'] || (p.flags['services.create'] && createdTodayBy(db, 'services', id, user.id)));
      need(seesService(scope, id), 'No tienes acceso a este servicio.');
    }
    const input = parse(p.flags['money.prices'] ? ServiceInput : ServiceInputNoAmount, protectServiceBody(ctx.body, existing, p));
    return friendly(() =>
      db.transaction(() => {
        const sameClient = existing != null && 'id' in input.client && input.client.id === existing.clientId;
        const clientId = resolveClient(ctx, input.client, user.id, sameClient ? undefined : user);
        if (input.saleId) {
          const sale = repo.getSale(db, input.saleId);
          if (!sale || sale.clientId !== clientId) throw new HttpError(400, 'La venta elegida es de otro cliente');
          // Una venta que no ve solo puede quedarse si ya estaba enlazada.
          need((p.flags['sales.view'] && seesSale(scope, input.saleId)) || existing?.saleId === input.saleId, 'No tienes acceso a esa venta.');
          if (input.nextServiceDate !== undefined) repo.setNextServiceDate(db, input.saleId, input.nextServiceDate);
        }
        if (id == null) {
          const newId = repo.insertService(db, input, clientId, user.id);
          const created = repo.getService(db, newId);
          log(ctx, { action: 'create', entity: 'service', entityId: newId, label: serviceLabel(created), changes: snapshot(db, 'service', created) });
          return newId;
        }
        checkVersion(db, 'services', id, input.expectedUpdatedAt);
        notFound(repo.updateService(db, id, input, clientId, user.id), 'El servicio');
        const after = repo.getService(db, id);
        const changes = diff(db, 'service', existing, after);
        if (changes.length) log(ctx, { action: 'update', entity: 'service', entityId: id, label: serviceLabel(after), changes });
        return id;
      })()
    );
  };

  api.add('POST', '/services', (ctx) => ({ service: shapeService(repo.getService(db, saveService(ctx, null))!, me(ctx).permissions) }));
  api.add('PUT', '/services/:id', (ctx) => ({ service: shapeService(repo.getService(db, saveService(ctx, num(ctx)))!, me(ctx).permissions) }));

  api.add('DELETE', '/services/:id', (ctx) => {
    const user = allowed(ctx, can('services.delete'));
    need(seesService(scopeOf(db, user), num(ctx)), 'No tienes acceso a este servicio.');
    const service = repo.getService(db, num(ctx));
    notFound(service ? 1 : 0, 'El servicio');
    log(ctx, { action: 'delete', entity: 'service', entityId: num(ctx), label: serviceLabel(service), changes: snapshot(db, 'service', service) });
    notFound(repo.deleteService(db, num(ctx)), 'El servicio');
    return { ok: true };
  });

  /* ----------------------------- catalogos ----------------------------- */

  // Crear se puede desde los formularios (vendedor, financiera, marca nuevos);
  // editar y borrar, solo con permiso de catalogos.
  const CATALOG_FLAG = { people: 'catalogs.team', financiers: 'catalogs.financiers', suppliers: 'catalogs.suppliers', brands: 'catalogs.brands' } as const;
  const createsCatalog = (kind: keyof typeof CATALOG_FLAG) => (p: User['permissions']) => {
    const f = p.flags;
    return f[CATALOG_FLAG[kind]] || f['sales.create'] || f['sales.edit'] || f['services.create'] || f['services.edit'] || f['inventory.move'] || f['inventory.products'];
  };
  const editsCatalog = (kind: keyof typeof CATALOG_FLAG) => can(CATALOG_FLAG[kind]);

  const CATALOG_NOUN = { people: 'del equipo a', financiers: 'la financiera', suppliers: 'el proveedor', brands: 'la marca' } as const;
  const ENTITY_OF = { people: 'person', financiers: 'financier', suppliers: 'supplier', brands: 'brand' } as const;
  const catalogLabel = (kind: keyof typeof CATALOG_NOUN, name: string) => (kind === 'people' ? `a ${name} en el equipo` : `${CATALOG_NOUN[kind]} ${name}`);
  const catalogItem = (kind: keyof typeof CATALOG_NOUN, id: number) =>
    kind === 'people' ? repo.listPeople(db).find((p) => p.id === id) : repo.listCatalog(db, kind).find((i) => i.id === id);

  api.add('POST', '/people', (ctx) => {
    allowed(ctx, createsCatalog('people'));
    const id = repo.insertPerson(db, parse(PersonInput, ctx.body));
    const person = repo.listPeople(db).find((p) => p.id === id);
    log(ctx, { action: 'create', entity: 'person', entityId: id, label: catalogLabel('people', person!.name), changes: snapshot(db, 'person', person) });
    return { person };
  });

  api.add('PUT', '/people/:id', (ctx) => {
    allowed(ctx, editsCatalog('people'));
    const before = repo.listPeople(db).find((p) => p.id === num(ctx));
    notFound(repo.updatePerson(db, num(ctx), parse(PersonInput, ctx.body)), 'La persona');
    const person = repo.listPeople(db).find((p) => p.id === num(ctx));
    const changes = diff(db, 'person', before, person);
    if (changes.length) log(ctx, { action: 'update', entity: 'person', entityId: num(ctx), label: catalogLabel('people', person!.name), changes });
    return { person };
  });

  for (const table of ['financiers', 'suppliers', 'brands'] as const) {
    api.add('POST', `/${table}`, (ctx) => {
      allowed(ctx, createsCatalog(table));
      const { name } = parse(CatalogInput, ctx.body);
      const id = friendly(() => repo.insertCatalog(db, table, name));
      log(ctx, { action: 'create', entity: ENTITY_OF[table], entityId: id, label: catalogLabel(table, name) });
      return { item: repo.listCatalog(db, table).find((i) => i.id === id) };
    });
    api.add('PUT', `/${table}/:id`, (ctx) => {
      allowed(ctx, editsCatalog(table));
      const { name, active } = parse(CatalogInput, ctx.body);
      const before = catalogItem(table, num(ctx));
      notFound(
        friendly(() => repo.updateCatalog(db, table, num(ctx), name, active)),
        'El elemento'
      );
      const item = repo.listCatalog(db, table).find((i) => i.id === num(ctx));
      const changes = diff(db, 'catalog', before, item);
      if (changes.length) log(ctx, { action: 'update', entity: ENTITY_OF[table], entityId: num(ctx), label: catalogLabel(table, item!.name), changes });
      return { item };
    });
  }

  for (const kind of ['people', 'financiers', 'suppliers', 'brands'] as const) {
    api.add('DELETE', `/${kind}/:id`, (ctx) => {
      allowed(ctx, editsCatalog(kind));
      const used = repo.catalogUsage(db, kind, num(ctx));
      if (used > 0) {
        throw new HttpError(409, `Se usa en ${used} ${used === 1 ? 'registro' : 'registros'}. Desactívalo en vez de borrarlo.`);
      }
      const item = catalogItem(kind, num(ctx));
      notFound(repo.deleteCatalog(db, kind, num(ctx)), 'El elemento');
      log(ctx, { action: 'delete', entity: ENTITY_OF[kind], entityId: num(ctx), label: catalogLabel(kind, item?.name ?? `#${num(ctx)}`) });
      return { ok: true };
    });
  }

  /* ------------------------------ usuarios ------------------------------ */

  const listUsers = () =>
    (db.prepare('SELECT * FROM users ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map(toUser);

  api.add('GET', '/users', (ctx) => {
    allowed(ctx, isAdmin);
    return { users: listUsers() };
  });

  /** La persona elegida para "solo lo suyo" tiene que existir. */
  const checkPerson = (personId: number | null | undefined) => {
    if (personId != null && !db.prepare('SELECT id FROM people WHERE id = ?').get(personId)) {
      throw new HttpError(400, 'La persona del equipo elegida ya no existe', 'permissions.personId');
    }
  };
  const storedPermissions = (role: 'admin' | 'member', permissions: unknown) => {
    if (role === 'admin') return null;
    const p = normalizePermissions(permissions as any, false);
    // Solo cuentas por pagar que existen.
    if (p.payableAccounts) {
      const ids = new Set(books.listPayableAccounts(db).map((a) => a.id));
      p.payableAccounts = p.payableAccounts.filter((id) => ids.has(id));
    }
    return JSON.stringify(p);
  };

  api.add('POST', '/users', async (ctx) => {
    allowed(ctx, isAdmin);
    const input = parse(UserCreateInput, ctx.body);
    checkPerson(input.permissions?.personId);
    const hash = await hashPassword(input.password);
    const id = friendly(() =>
      Number(
        db
          .prepare('INSERT INTO users (username, name, password_hash, role, permissions) VALUES (?, ?, ?, ?, ?)')
          .run(input.username, input.name, hash, input.role, storedPermissions(input.role, input.permissions)).lastInsertRowid
      )
    );
    const created = toUser(findUserById(db, id)!);
    log(ctx, {
      action: 'create',
      entity: 'user',
      entityId: id,
      label: `al usuario ${created.name} (${created.username})`,
      changes: [{ f: 'Permisos', b: permissionsSummary(created.permissions) }],
    });
    return { users: listUsers(), id };
  });

  api.add('PUT', '/users/:id', async (ctx) => {
    const user = allowed(ctx, isAdmin);
    const input = parse(UserUpdateInput, ctx.body);
    const target = num(ctx);
    if (target === user.id && input.active === false) throw new HttpError(400, 'No puedes desactivar tu propio usuario');
    if (target === user.id && input.role === 'member') throw new HttpError(400, 'No puedes quitarte a ti mismo el acceso de administrador', 'role');
    const row = findUserById(db, target);
    notFound(row ? 1 : 0, 'El usuario');
    // La cuenta del dueno solo la toca el dueno, y nunca pierde el acceso.
    if (row!.is_owner) {
      if (!user.owner) throw new HttpError(403, `Solo ${row!.name} puede cambiar su propia cuenta.`);
      if (input.role === 'member' || input.active === false) throw new HttpError(400, 'La cuenta del dueño siempre es administrador y siempre tiene acceso.', 'role');
    }
    const before = toUser(row!);
    // Siempre tiene que quedar al menos un administrador que pueda entrar.
    const losesAdmin = row!.role === 'admin' && (input.role === 'member' || input.active === false);
    if (losesAdmin) {
      const others = (db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND active = 1 AND id != ?`).get(target) as { n: number }).n;
      if (others === 0) throw new HttpError(400, 'Tiene que quedar al menos un administrador activo', 'role');
    }
    checkPerson(input.permissions?.personId);
    if (input.name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(input.name, target);
    if (input.role || input.permissions) {
      const role = input.role ?? row!.role;
      const current = row!.permissions ? JSON.parse(row!.permissions) : null;
      db.prepare('UPDATE users SET role = ?, permissions = ? WHERE id = ?').run(role, storedPermissions(role, input.permissions ?? current), target);
      const changes = permissionChanges(before.permissions, toUser(findUserById(db, target)!).permissions);
      if (changes.length) log(ctx, { action: 'permissions', entity: 'user', entityId: target, label: before.name, changes });
    }
    if (input.name && input.name !== before.name) log(ctx, { action: 'update', entity: 'user', entityId: target, label: `al usuario ${before.name}`, changes: [{ f: 'Nombre', a: before.name, b: input.name }] });
    if (input.active !== undefined && input.active !== before.active) {
      db.prepare('UPDATE users SET active = ? WHERE id = ?').run(input.active ? 1 : 0, target);
      if (!input.active) deleteUserSessions(db, target);
      log(ctx, { action: input.active ? 'activate' : 'deactivate', entity: 'user', entityId: target, label: before.name });
    }
    if (input.password) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(input.password), target);
      if (target !== user.id) deleteUserSessions(db, target);
      log(ctx, { action: 'password', entity: 'user', entityId: target, label: target === user.id ? 'su propia contraseña' : `la contraseña de ${before.name}` });
    }
    return { users: listUsers() };
  });

  /* ------------------------- registro de actividad ------------------------- */

  /** Solo el dueno, y nunca desde la vista previa. */
  const ownerOnly = (ctx: Ctx) => {
    const user = me(ctx);
    if (ctx.viewer || !user.owner) throw new HttpError(403, 'Solo el dueño puede ver el registro de actividad.');
    return user;
  };
  const auditQuery = (ctx: Ctx) => {
    const q = ctx.query;
    const isDate = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
    const group = q.get('group') ?? '';
    return {
      before: Number(q.get('before')) || undefined,
      limit: Number(q.get('limit')) || 80,
      userId: Number(q.get('user')) || undefined,
      group: group in AUDIT_GROUPS ? group : undefined,
      from: isDate(q.get('from')),
      to: isDate(q.get('to')),
      q: (q.get('q') ?? '').trim().slice(0, 80) || undefined,
    };
  };

  api.add('GET', '/audit', (ctx) => {
    ownerOnly(ctx);
    return listAudit(db, auditQuery(ctx));
  });

  api.add('GET', '/audit/summary', (ctx) => {
    ownerOnly(ctx);
    return { integrity: verifyAudit(db), stats: auditStats(db) };
  });

  /** Descargas e impresiones hechas en la app (Excel de una lista, PDF de un reporte). */
  api.add('POST', '/audit/event', (ctx) => {
    me(ctx);
    const body = (ctx.body ?? {}) as { kind?: unknown; what?: unknown; rows?: unknown };
    const kind = body.kind === 'print' ? 'print' : 'export';
    const what = typeof body.what === 'string' ? body.what.slice(0, 120) : 'datos';
    const rows = typeof body.rows === 'number' && Number.isInteger(body.rows) ? body.rows : null;
    log(ctx, { action: kind, entity: 'app', label: rows != null ? `${what} (${rows} filas)` : what });
    return { ok: true };
  });

  /* ------------------------- cuentas por pagar ------------------------- */

  /** La cuenta existe y el usuario la puede ver. */
  const accountExists = (id: number, user?: User) => {
    if (!books.listPayableAccounts(db).some((a) => a.id === id)) throw new HttpError(400, 'La cuenta elegida ya no existe', 'accountId');
    const allowedAccounts = user?.permissions.payableAccounts;
    if (allowedAccounts && !allowedAccounts.includes(id)) throw new HttpError(403, 'No tienes acceso a esa cuenta.', 'accountId');
  };

  api.add('POST', '/payable-accounts', (ctx) => {
    allowed(ctx, can('payables.accounts'));
    const input = parse(PayableAccountInput, ctx.body);
    const id = friendly(() =>
      db.transaction(() => {
        const newId = books.insertPayableAccount(db, input);
        // Un proveedor de cuentas por pagar es el mismo de ventas e inventario.
        if (input.kind === 'supplier') books.linkSupplier(db, newId, input.name);
        return newId;
      })()
    );
    const account = books.listPayableAccounts(db).find((a) => a.id === id);
    log(ctx, { action: 'create', entity: 'payable-account', entityId: id, label: `la cuenta ${account!.name}`, changes: snapshot(db, 'payable-account', account) });
    return { account };
  });

  api.add('PUT', '/payable-accounts/:id', (ctx) => {
    allowed(ctx, can('payables.accounts'));
    const before = books.listPayableAccounts(db).find((a) => a.id === num(ctx));
    const input = parse(PayableAccountInput, ctx.body);
    notFound(
      friendly(() =>
        db.transaction(() => {
          const changed = books.updatePayableAccount(db, num(ctx), input);
          if (changed && input.kind === 'supplier') {
            // Si cambia el nombre, el proveedor del catalogo tambien.
            if (before?.supplierId) db.prepare('UPDATE suppliers SET name = ? WHERE id = ?').run(input.name, before.supplierId);
            else books.linkSupplier(db, num(ctx), input.name);
          }
          return changed;
        })()
      ),
      'La cuenta'
    );
    const account = books.listPayableAccounts(db).find((a) => a.id === num(ctx));
    const changes = diff(db, 'payable-account', before, account);
    if (changes.length) log(ctx, { action: 'update', entity: 'payable-account', entityId: num(ctx), label: `la cuenta ${account!.name}`, changes });
    return { account };
  });

  api.add('DELETE', '/payable-accounts/:id', (ctx) => {
    allowed(ctx, (p) => p.flags['payables.accounts'] && p.flags['payables.delete']);
    const account = books.listPayableAccounts(db).find((a) => a.id === num(ctx));
    notFound(account ? 1 : 0, 'La cuenta');
    // Con movimientos, solo si se pide expresamente borrar todo (la app lo confirma antes).
    const charges = books.listPayables(db).filter((p) => p.accountId === num(ctx));
    const payments = books.listPayablePayments(db).filter((p) => p.accountId === num(ctx));
    if ((charges.length || payments.length) && ctx.query.get('todo') !== '1') {
      throw new HttpError(409, `Tiene ${charges.length} gastos y ${payments.length} pagos. Confirma que quieres borrarla con todo.`);
    }
    friendly(() =>
      db.transaction(() => {
        db.prepare('DELETE FROM payable_payments WHERE account_id = ?').run(num(ctx));
        db.prepare('DELETE FROM payables WHERE account_id = ?').run(num(ctx));
        books.deletePayableAccount(db, num(ctx));
        log(ctx, {
          action: 'delete',
          entity: 'payable-account',
          entityId: num(ctx),
          label: `la cuenta ${account!.name}`,
          changes: [
            ...snapshot(db, 'payable-account', account),
            ...(charges.length || payments.length ? [{ f: 'Se borraron también', b: `${charges.length} gastos (${dollars(charges.reduce((n, p) => n + p.amount, 0))}) y ${payments.length} pagos (${dollars(payments.reduce((n, p) => n + p.amount, 0))})` }] : []),
            ...charges.map((p) => ({ f: `Gasto ${p.date.split('-').reverse().join('/')}`, b: `${p.description} · ${dollars(p.amount)}` })),
            ...payments.map((p) => ({ f: `Pago ${p.date.split('-').reverse().join('/')}`, b: dollars(p.amount) })),
          ],
        });
      })()
    );
    return { ok: true };
  });

  api.add('POST', '/payables', (ctx) => {
    const user = allowed(ctx, can('payables.charges'));
    const input = parse(PayableInput, ctx.body);
    accountExists(input.accountId, user);
    const id = friendly(() => books.insertPayable(db, input, user.id));
    const created = books.getPayable(db, id);
    log(ctx, { action: 'create', entity: 'payable', entityId: id, label: payableLabel(created), changes: snapshot(db, 'payable', created) });
    return { payable: books.getPayable(db, id) };
  });

  api.add('PUT', '/payables/:id', (ctx) => {
    const user = allowed(ctx, can('payables.charges'));
    const input = parse(PayableInput, ctx.body);
    accountExists(input.accountId, user);
    const current = books.payableVersion(db, num(ctx));
    notFound(current ? 1 : 0, 'El gasto');
    const beforePayable = books.getPayable(db, num(ctx));
    accountExists(beforePayable!.accountId, user);
    if (input.expectedUpdatedAt && current !== input.expectedUpdatedAt) {
      throw new HttpError(409, 'Alguien cambió este gasto mientras lo editabas. Vuelve a abrirlo.');
    }
    friendly(() =>
      db.transaction(() => {
        books.updatePayable(db, num(ctx), input, user.id);
        // Si el cargo cambia de cuenta, sus pagos van con el.
        db.prepare('UPDATE payable_payments SET account_id = ? WHERE payable_id = ?').run(input.accountId, num(ctx));
      })()
    );
    const afterPayable = books.getPayable(db, num(ctx));
    const changes = diff(db, 'payable', beforePayable, afterPayable);
    if (changes.length) log(ctx, { action: 'update', entity: 'payable', entityId: num(ctx), label: payableLabel(afterPayable), changes });
    return { payable: afterPayable };
  });

  api.add('DELETE', '/payables/:id', (ctx) => {
    const user = allowed(ctx, can('payables.delete'));
    const payable = books.getPayable(db, num(ctx));
    notFound(payable ? 1 : 0, 'El gasto');
    accountExists(payable!.accountId, user);
    friendly(() =>
      db.transaction(() => {
        // Los pagos hechos a este cargo quedan como abonos a la cuenta.
        db.prepare('UPDATE payable_payments SET payable_id = NULL WHERE payable_id = ?').run(num(ctx));
        books.deletePayable(db, num(ctx));
      })()
    );
    log(ctx, { action: 'delete', entity: 'payable', entityId: num(ctx), label: payableLabel(payable), changes: snapshot(db, 'payable', payable) });
    return { ok: true };
  });

  api.add('POST', '/payable-payments', (ctx) => {
    const user = allowed(ctx, can('payables.pay'));
    const input = parse(PayablePaymentInput, ctx.body);
    accountExists(input.accountId, user);
    if (input.payableId) {
      const payable = books.getPayable(db, input.payableId);
      if (!payable) throw new HttpError(400, 'El gasto elegido ya no existe', 'payableId');
      if (payable.accountId !== input.accountId) throw new HttpError(400, 'El gasto es de otra cuenta', 'payableId');
    }
    const id = friendly(() => books.insertPayablePayment(db, input, user.id));
    log(ctx, { action: 'create', entity: 'payable-payment', entityId: id, label: paymentLabel(input), changes: paymentChanges(input) });
    return { payment: books.getPayablePayment(db, id) };
  });

  api.add('DELETE', '/payable-payments/:id', (ctx) => {
    const user = allowed(ctx, can('payables.delete'));
    const payment = books.getPayablePayment(db, num(ctx));
    notFound(payment ? 1 : 0, 'El pago');
    accountExists(payment!.accountId, user);
    books.deletePayablePayment(db, num(ctx));
    log(ctx, { action: 'delete', entity: 'payable-payment', entityId: num(ctx), label: paymentLabel(payment!), changes: paymentChanges(payment!) });
    return { ok: true };
  });

  /* ----------------------------- inventario ----------------------------- */

  api.add('POST', '/inventory-items', (ctx) => {
    const user = allowed(ctx, can('inventory.products'));
    const input = parse(InventoryItemInput, ctx.body);
    if (!user.permissions.flags['money.costs']) input.cost = null;
    const id = friendly(() => books.insertInventoryItem(db, input));
    log(ctx, { action: 'create', entity: 'inventory-item', entityId: id, label: `el producto ${input.name}`, changes: snapshot(db, 'inventory-item', books.getInventoryItem(db, id)) });
    return { item: books.getInventoryItem(db, id) };
  });

  api.add('PUT', '/inventory-items/:id', (ctx) => {
    const user = allowed(ctx, can('inventory.products'));
    const existing = books.getInventoryItem(db, num(ctx));
    notFound(existing ? 1 : 0, 'El producto');
    const input = parse(InventoryItemInput, ctx.body);
    // Quien no ve costos no los cambia.
    if (!user.permissions.flags['money.costs']) input.cost = existing!.cost;
    friendly(() => books.updateInventoryItem(db, num(ctx), input));
    const afterItem = books.getInventoryItem(db, num(ctx));
    const changes = diff(db, 'inventory-item', existing, afterItem);
    if (changes.length) log(ctx, { action: 'update', entity: 'inventory-item', entityId: num(ctx), label: `el producto ${afterItem!.name}`, changes });
    return { item: books.getInventoryItem(db, num(ctx)) };
  });

  api.add('DELETE', '/inventory-items/:id', (ctx) => {
    allowed(ctx, can('inventory.delete'));
    const used = books.inventoryItemUsage(db, num(ctx));
    if (used > 0) throw new HttpError(409, `Tiene ${used} ${used === 1 ? 'movimiento' : 'movimientos'}. Desactívalo en vez de borrarlo.`);
    const item = books.getInventoryItem(db, num(ctx));
    notFound(books.deleteInventoryItem(db, num(ctx)), 'El producto');
    log(ctx, { action: 'delete', entity: 'inventory-item', entityId: num(ctx), label: `el producto ${item?.name ?? ''}` });
    return { ok: true };
  });

  api.add('POST', '/inventory-movements', (ctx) => {
    const user = me(ctx);
    const p = user.permissions;
    const input = parse(InventoryMovementInput, ctx.body);
    need(input.kind === 'adjust' ? p.flags['inventory.count'] : p.flags['inventory.move']);
    if (!p.flags['money.costs']) input.unitCost = null;
    if (input.kind !== 'in') input.supplierId = null;
    const id = friendly(() =>
      db.transaction(() => {
        const item = books.getInventoryItem(db, input.itemId);
        if (!item) throw new HttpError(400, 'El producto ya no existe', 'itemId');
        const scope = scopeOf(db, user);
        if (input.saleId) need(p.flags['sales.view'] && seesSale(scope, input.saleId) && !!repo.getSale(db, input.saleId), 'No tienes acceso a esa venta.');
        if (input.serviceId) need(p.flags['services.view'] && seesService(scope, input.serviceId) && !!repo.getService(db, input.serviceId), 'No tienes acceso a ese servicio.');
        const stock = books.stockOf(db, input.itemId);
        const after = stock + (input.kind === 'out' ? -input.quantity : input.quantity);
        if (after < 0) {
          throw new HttpError(400, `Solo hay ${stock} de ${item.name}. Registra primero la compra o haz un ajuste de conteo.`, 'quantity');
        }
        // Una salida sin costo propio toma el costo actual del producto (para saber cuanto se gasto).
        if (input.kind === 'out' && input.unitCost == null) input.unitCost = item.cost;
        const movementId = books.insertInventoryMovement(db, input, user.id);
        // Compra a credito: la factura queda en la cuenta del proveedor.
        if (input.bill && input.supplierId && input.unitCost) {
          need(p.flags['payables.charges'] && p.payableAccounts === null, 'No tienes permiso para anotar facturas de proveedores.');
          const accountId = books.accountForSupplier(db, input.supplierId);
          const payableId = books.insertPayable(
            db,
            {
              accountId,
              date: input.date,
              description: `${input.bill.reference ? `Factura ${input.bill.reference} · ` : 'Compra: '}${input.quantity} × ${item.name}`,
              category: 'equipment',
              amount: input.quantity * input.unitCost,
              dueDate: input.bill.dueDate && input.bill.dueDate >= input.date ? input.bill.dueDate : null,
              notes: null,
            },
            user.id
          );
          log(ctx, { action: 'create', entity: 'payable', entityId: payableId, label: payableLabel(books.getPayable(db, payableId)), changes: snapshot(db, 'payable', books.getPayable(db, payableId)) });
        }
        return movementId;
      })()
    );
    log(ctx, { action: 'create', entity: 'inventory-movement', entityId: id, label: movementLabel(input), changes: movementChanges(input) });
    const movement = books.getInventoryMovement(db, id)!;
    return { movement: p.flags['money.costs'] ? movement : { ...movement, unitCost: null } };
  });

  api.add('DELETE', '/inventory-movements/:id', (ctx) => {
    allowed(ctx, can('inventory.delete'));
    const movement = books.getInventoryMovement(db, num(ctx));
    notFound(movement ? 1 : 0, 'El movimiento');
    if (books.stockOf(db, movement!.itemId) - (movement!.kind === 'out' ? -movement!.quantity : movement!.quantity) < 0) {
      throw new HttpError(409, 'Si se borra este movimiento la existencia quedaría en negativo. Borra antes las salidas posteriores.');
    }
    books.deleteInventoryMovement(db, num(ctx));
    log(ctx, { action: 'delete', entity: 'inventory-movement', entityId: num(ctx), label: movementLabel(movement!), changes: movementChanges(movement!) });
    return { ok: true };
  });

  /* ----------------------- exportar y respaldo ----------------------- */

  for (const kind of ['sales', 'clients', 'services'] as const satisfies readonly ExportKind[]) {
    api.add('GET', `/export/${kind}`, (ctx) => {
      // El Excel completo del servidor lleva todos los montos de todo el negocio.
      allowed(ctx, (p) => p.flags.export && p.scope === 'all' && p.flags['money.profit'] && p.flags['clients.contact'] && p.flags[`${kind}.view`]);
      log(ctx, { action: 'export', entity: kind, label: { sales: 'todas las ventas', clients: 'todos los clientes', services: 'todo el servicio técnico' }[kind] });
      const csv = exportCsv(db, kind);
      const stamp = todayISO();
      ctx.res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="infinitywater-${kind}-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      });
      ctx.res.end(csv);
      return undefined;
    });
  }

  api.add('GET', '/backup', async (ctx) => {
    allowed(ctx, isAdmin, 'Solo un administrador puede descargar el respaldo completo.');
    const dir = mkdtempSync(path.join(tmpdir(), 'iw-backup-'));
    try {
      const file = path.join(dir, 'admin.db');
      await db.backup(file);
      const data = readFileSync(file);
      const stamp = todayISO();
      log(ctx, { action: 'backup', entity: 'database', label: 'la copia completa de la base' });
      ctx.res.writeHead(200, {
        'Content-Type': 'application/vnd.sqlite3',
        'Content-Disposition': `attachment; filename="infinitywater-respaldo-${stamp}.db"`,
        'Content-Length': data.length,
        'Cache-Control': 'no-store',
      });
      ctx.res.end(data);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    return undefined;
  });

  return api;
}
