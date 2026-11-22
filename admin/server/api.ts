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
import { normalizePermissions, type PermissionFlag, type User } from '../shared/domain.ts';
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

  /** Resuelve el cliente de una venta o servicio: existente o nuevo. */
  const resolveClient = (ref: SaleInput['client'], userId: number, user?: User) => {
    if ('id' in ref) {
      if (!repo.getClient(db, ref.id)) throw new HttpError(400, 'El cliente elegido ya no existe');
      if (user) need(seesClient(scopeOf(db, user), ref.id), 'No tienes acceso a ese cliente.');
      return ref.id;
    }
    const id = repo.insertClient(db, ref.create, userId);
    repo.audit(db, userId, 'create', 'client', id);
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
        throw new HttpError(401, 'Usuario o contraseña incorrectos');
      }
      clearLoginFailures(ctx.ip, username);
      const token = createSession(db, row.id, ctx.ip, String(ctx.req.headers['user-agent'] ?? ''));
      ctx.res.setHeader('Set-Cookie', sessionCookie(SESSION_COOKIE, token, SESSION_DAYS * 86400, ctx.secure));
      repo.audit(db, row.id, 'login', 'user', row.id, { ip: ctx.ip });
      return { user: toUser(row) };
    },
    { public: true }
  );

  api.add(
    'POST',
    '/auth/logout',
    (ctx) => {
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
    repo.audit(db, user.id, 'password', 'user', user.id);
    return { ok: true };
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
    repo.audit(db, user.id, 'create', 'client', id);
    return { client: shapeClient(repo.getClient(db, id)!, user.permissions) };
  });

  api.add('PUT', '/clients/:id', (ctx) => {
    const user = allowed(ctx, can('clients.edit'));
    need(seesClient(scopeOf(db, user), num(ctx)), 'No tienes acceso a este cliente.');
    const input = parse(ClientInput, protectClientBody(ctx.body, repo.getClient(db, num(ctx)), user.permissions));
    checkVersion(db, 'clients', num(ctx), input.expectedUpdatedAt);
    notFound(repo.updateClient(db, num(ctx), input, user.id), 'El cliente');
    repo.audit(db, user.id, 'update', 'client', num(ctx));
    return { client: shapeClient(repo.getClient(db, num(ctx))!, user.permissions) };
  });

  api.add('DELETE', '/clients/:id', (ctx) => {
    // Borrar un cliente borra todas sus ventas y servicios: solo con alcance total.
    const user = allowed(ctx, (p) => p.flags['clients.delete'] && p.scope === 'all');
    const client = repo.getClient(db, num(ctx));
    notFound(client ? 1 : 0, 'El cliente');
    repo.deleteClient(db, num(ctx));
    repo.audit(db, user.id, 'delete', 'client', num(ctx), { name: client!.name });
    return { ok: true };
  });

  /* ------------------------------ ventas ------------------------------ */

  api.add('POST', '/sales', (ctx) => {
    const user = allowed(ctx, can('sales.create'));
    const input = parse(SaleInput, protectSaleBody(ctx.body, null, user.permissions));
    const id = friendly(() =>
      db.transaction(() => {
        const clientId = resolveClient(input.client, user.id, user);
        const saleId = repo.insertSale(db, input, clientId, user.id);
        repo.audit(db, user.id, 'create', 'sale', saleId);
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
        const clientId = resolveClient(input.client, user.id, sameClient ? undefined : user);
        notFound(repo.updateSale(db, num(ctx), input, clientId, user.id), 'La venta');
        repo.audit(db, user.id, 'update', 'sale', num(ctx));
      })()
    );
    return { sale: shapeSale(repo.getSale(db, num(ctx))!, user.permissions) };
  });

  /** Marcar pagado: la comision con "Pagar comisiones"; lo de la financiera con "Registrar pagos de financieras". */
  const markFlag = (field: 'fundedPaid' | 'commissionPaid'): PermissionFlag => (field === 'fundedPaid' ? 'payments.financiers' : 'payments.commissions');

  api.add('POST', '/sales/:id/mark', (ctx) => {
    const user = me(ctx);
    const { field, paid, date } = parse(MarkInput, ctx.body);
    need(user.permissions.flags[markFlag(field)]);
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    notFound(repo.markSale(db, num(ctx), field, paid, date, user.id), 'La venta');
    repo.audit(db, user.id, 'mark', 'sale', num(ctx), { field, paid });
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
        repo.audit(db, user.id, 'mark-batch', 'sale', null, { field, paid, ids: unique });
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
        repo.audit(db, user.id, 'tech-payment', 'technician', null, { saleIds, serviceIds, date });
      })()
    );
    return { updated: total };
  });

  api.add('DELETE', '/sales/:id', (ctx) => {
    const user = allowed(ctx, can('sales.delete'));
    need(seesSale(scopeOf(db, user), num(ctx)), 'No tienes acceso a esta venta.');
    notFound(repo.deleteSale(db, num(ctx)), 'La venta');
    repo.audit(db, user.id, 'delete', 'sale', num(ctx));
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
        const clientId = resolveClient(input.client, user.id, sameClient ? undefined : user);
        if (input.saleId) {
          const sale = repo.getSale(db, input.saleId);
          if (!sale || sale.clientId !== clientId) throw new HttpError(400, 'La venta elegida es de otro cliente');
          // Una venta que no ve solo puede quedarse si ya estaba enlazada.
          need((p.flags['sales.view'] && seesSale(scope, input.saleId)) || existing?.saleId === input.saleId, 'No tienes acceso a esa venta.');
          if (input.nextServiceDate !== undefined) repo.setNextServiceDate(db, input.saleId, input.nextServiceDate);
        }
        if (id == null) {
          const newId = repo.insertService(db, input, clientId, user.id);
          repo.audit(db, user.id, 'create', 'service', newId);
          return newId;
        }
        checkVersion(db, 'services', id, input.expectedUpdatedAt);
        notFound(repo.updateService(db, id, input, clientId, user.id), 'El servicio');
        repo.audit(db, user.id, 'update', 'service', id);
        return id;
      })()
    );
  };

  api.add('POST', '/services', (ctx) => ({ service: shapeService(repo.getService(db, saveService(ctx, null))!, me(ctx).permissions) }));
  api.add('PUT', '/services/:id', (ctx) => ({ service: shapeService(repo.getService(db, saveService(ctx, num(ctx)))!, me(ctx).permissions) }));

  api.add('DELETE', '/services/:id', (ctx) => {
    const user = allowed(ctx, can('services.delete'));
    need(seesService(scopeOf(db, user), num(ctx)), 'No tienes acceso a este servicio.');
    notFound(repo.deleteService(db, num(ctx)), 'El servicio');
    repo.audit(db, user.id, 'delete', 'service', num(ctx));
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

  api.add('POST', '/people', (ctx) => {
    allowed(ctx, createsCatalog('people'));
    const id = repo.insertPerson(db, parse(PersonInput, ctx.body));
    return { person: repo.listPeople(db).find((p) => p.id === id) };
  });

  api.add('PUT', '/people/:id', (ctx) => {
    allowed(ctx, editsCatalog('people'));
    notFound(repo.updatePerson(db, num(ctx), parse(PersonInput, ctx.body)), 'La persona');
    return { person: repo.listPeople(db).find((p) => p.id === num(ctx)) };
  });

  for (const table of ['financiers', 'suppliers', 'brands'] as const) {
    api.add('POST', `/${table}`, (ctx) => {
      allowed(ctx, createsCatalog(table));
      const { name } = parse(CatalogInput, ctx.body);
      const id = friendly(() => repo.insertCatalog(db, table, name));
      return { item: repo.listCatalog(db, table).find((i) => i.id === id) };
    });
    api.add('PUT', `/${table}/:id`, (ctx) => {
      allowed(ctx, editsCatalog(table));
      const { name, active } = parse(CatalogInput, ctx.body);
      notFound(
        friendly(() => repo.updateCatalog(db, table, num(ctx), name, active)),
        'El elemento'
      );
      return { item: repo.listCatalog(db, table).find((i) => i.id === num(ctx)) };
    });
  }

  for (const kind of ['people', 'financiers', 'suppliers', 'brands'] as const) {
    api.add('DELETE', `/${kind}/:id`, (ctx) => {
      allowed(ctx, editsCatalog(kind));
      const used = repo.catalogUsage(db, kind, num(ctx));
      if (used > 0) {
        throw new HttpError(409, `Se usa en ${used} ${used === 1 ? 'registro' : 'registros'}. Desactívalo en vez de borrarlo.`);
      }
      notFound(repo.deleteCatalog(db, kind, num(ctx)), 'El elemento');
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
    const user = allowed(ctx, isAdmin);
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
    repo.audit(db, user.id, 'create', 'user', id, { role: input.role });
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
      repo.audit(db, user.id, 'permissions', 'user', target, { role, permissions: input.permissions ?? null });
    }
    if (input.active !== undefined) {
      db.prepare('UPDATE users SET active = ? WHERE id = ?').run(input.active ? 1 : 0, target);
      if (!input.active) deleteUserSessions(db, target);
    }
    if (input.password) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(input.password), target);
      if (target !== user.id) deleteUserSessions(db, target);
    }
    repo.audit(db, user.id, 'update', 'user', target);
    return { users: listUsers() };
  });

  /* ------------------------- cuentas por pagar ------------------------- */

  /** La cuenta existe y el usuario la puede ver. */
  const accountExists = (id: number, user?: User) => {
    if (!books.listPayableAccounts(db).some((a) => a.id === id)) throw new HttpError(400, 'La cuenta elegida ya no existe', 'accountId');
    const allowedAccounts = user?.permissions.payableAccounts;
    if (allowedAccounts && !allowedAccounts.includes(id)) throw new HttpError(403, 'No tienes acceso a esa cuenta.', 'accountId');
  };

  api.add('POST', '/payable-accounts', (ctx) => {
    const user = allowed(ctx, can('payables.accounts'));
    const id = friendly(() => books.insertPayableAccount(db, parse(PayableAccountInput, ctx.body)));
    repo.audit(db, user.id, 'create', 'payable-account', id);
    return { account: books.listPayableAccounts(db).find((a) => a.id === id) };
  });

  api.add('PUT', '/payable-accounts/:id', (ctx) => {
    const user = allowed(ctx, can('payables.accounts'));
    notFound(friendly(() => books.updatePayableAccount(db, num(ctx), parse(PayableAccountInput, ctx.body))), 'La cuenta');
    repo.audit(db, user.id, 'update', 'payable-account', num(ctx));
    return { account: books.listPayableAccounts(db).find((a) => a.id === num(ctx)) };
  });

  api.add('DELETE', '/payable-accounts/:id', (ctx) => {
    const user = allowed(ctx, (p) => p.flags['payables.accounts'] && p.flags['payables.delete']);
    const used = books.payableAccountUsage(db, num(ctx));
    if (used > 0) throw new HttpError(409, `Tiene ${used} ${used === 1 ? 'movimiento' : 'movimientos'}. Desactívala en vez de borrarla.`);
    notFound(books.deletePayableAccount(db, num(ctx)), 'La cuenta');
    repo.audit(db, user.id, 'delete', 'payable-account', num(ctx));
    return { ok: true };
  });

  api.add('POST', '/payables', (ctx) => {
    const user = allowed(ctx, can('payables.charges'));
    const input = parse(PayableInput, ctx.body);
    accountExists(input.accountId, user);
    const id = friendly(() => books.insertPayable(db, input, user.id));
    repo.audit(db, user.id, 'create', 'payable', id);
    return { payable: books.getPayable(db, id) };
  });

  api.add('PUT', '/payables/:id', (ctx) => {
    const user = allowed(ctx, can('payables.charges'));
    const input = parse(PayableInput, ctx.body);
    accountExists(input.accountId, user);
    const current = books.payableVersion(db, num(ctx));
    notFound(current ? 1 : 0, 'El cargo');
    accountExists(books.getPayable(db, num(ctx))!.accountId, user);
    if (input.expectedUpdatedAt && current !== input.expectedUpdatedAt) {
      throw new HttpError(409, 'Alguien cambió este cargo mientras lo editabas. Vuelve a abrirlo.');
    }
    friendly(() =>
      db.transaction(() => {
        books.updatePayable(db, num(ctx), input, user.id);
        // Si el cargo cambia de cuenta, sus pagos van con el.
        db.prepare('UPDATE payable_payments SET account_id = ? WHERE payable_id = ?').run(input.accountId, num(ctx));
      })()
    );
    repo.audit(db, user.id, 'update', 'payable', num(ctx));
    return { payable: books.getPayable(db, num(ctx)) };
  });

  api.add('DELETE', '/payables/:id', (ctx) => {
    const user = allowed(ctx, can('payables.delete'));
    const payable = books.getPayable(db, num(ctx));
    notFound(payable ? 1 : 0, 'El cargo');
    accountExists(payable!.accountId, user);
    friendly(() =>
      db.transaction(() => {
        // Los pagos hechos a este cargo quedan como abonos a la cuenta.
        db.prepare('UPDATE payable_payments SET payable_id = NULL WHERE payable_id = ?').run(num(ctx));
        books.deletePayable(db, num(ctx));
      })()
    );
    repo.audit(db, user.id, 'delete', 'payable', num(ctx), { description: payable!.description, amount: payable!.amount });
    return { ok: true };
  });

  api.add('POST', '/payable-payments', (ctx) => {
    const user = allowed(ctx, can('payables.pay'));
    const input = parse(PayablePaymentInput, ctx.body);
    accountExists(input.accountId, user);
    if (input.payableId) {
      const payable = books.getPayable(db, input.payableId);
      if (!payable) throw new HttpError(400, 'El cargo elegido ya no existe', 'payableId');
      if (payable.accountId !== input.accountId) throw new HttpError(400, 'El cargo es de otra cuenta', 'payableId');
    }
    const id = friendly(() => books.insertPayablePayment(db, input, user.id));
    repo.audit(db, user.id, 'create', 'payable-payment', id, { amount: input.amount });
    return { payment: books.getPayablePayment(db, id) };
  });

  api.add('DELETE', '/payable-payments/:id', (ctx) => {
    const user = allowed(ctx, can('payables.delete'));
    const payment = books.getPayablePayment(db, num(ctx));
    notFound(payment ? 1 : 0, 'El pago');
    accountExists(payment!.accountId, user);
    books.deletePayablePayment(db, num(ctx));
    repo.audit(db, user.id, 'delete', 'payable-payment', num(ctx), { amount: payment!.amount, date: payment!.date });
    return { ok: true };
  });

  /* ----------------------------- inventario ----------------------------- */

  api.add('POST', '/inventory-items', (ctx) => {
    const user = allowed(ctx, can('inventory.products'));
    const input = parse(InventoryItemInput, ctx.body);
    if (!user.permissions.flags['money.costs']) input.cost = null;
    const id = friendly(() => books.insertInventoryItem(db, input));
    repo.audit(db, user.id, 'create', 'inventory-item', id);
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
    repo.audit(db, user.id, 'update', 'inventory-item', num(ctx));
    return { item: books.getInventoryItem(db, num(ctx)) };
  });

  api.add('DELETE', '/inventory-items/:id', (ctx) => {
    const user = allowed(ctx, can('inventory.delete'));
    const used = books.inventoryItemUsage(db, num(ctx));
    if (used > 0) throw new HttpError(409, `Tiene ${used} ${used === 1 ? 'movimiento' : 'movimientos'}. Desactívalo en vez de borrarlo.`);
    notFound(books.deleteInventoryItem(db, num(ctx)), 'El producto');
    repo.audit(db, user.id, 'delete', 'inventory-item', num(ctx));
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
        return books.insertInventoryMovement(db, input, user.id);
      })()
    );
    repo.audit(db, user.id, 'create', 'inventory-movement', id, { itemId: input.itemId, kind: input.kind, quantity: input.quantity });
    const movement = books.getInventoryMovement(db, id)!;
    return { movement: p.flags['money.costs'] ? movement : { ...movement, unitCost: null } };
  });

  api.add('DELETE', '/inventory-movements/:id', (ctx) => {
    const user = allowed(ctx, can('inventory.delete'));
    const movement = books.getInventoryMovement(db, num(ctx));
    notFound(movement ? 1 : 0, 'El movimiento');
    if (books.stockOf(db, movement!.itemId) - (movement!.kind === 'out' ? -movement!.quantity : movement!.quantity) < 0) {
      throw new HttpError(409, 'Si se borra este movimiento la existencia quedaría en negativo. Borra antes las salidas posteriores.');
    }
    books.deleteInventoryMovement(db, num(ctx));
    repo.audit(db, user.id, 'delete', 'inventory-movement', num(ctx), { itemId: movement!.itemId, kind: movement!.kind, quantity: movement!.quantity });
    return { ok: true };
  });

  /* ----------------------- exportar y respaldo ----------------------- */

  for (const kind of ['sales', 'clients', 'services'] as const satisfies readonly ExportKind[]) {
    api.add('GET', `/export/${kind}`, (ctx) => {
      // El Excel completo del servidor lleva todos los montos de todo el negocio.
      const user = allowed(ctx, (p) => p.flags.export && p.scope === 'all' && p.flags['money.profit'] && p.flags['clients.contact'] && p.flags[`${kind}.view`]);
      repo.audit(db, user.id, 'export', kind, null);
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
    const user = allowed(ctx, isAdmin, 'Solo un administrador puede descargar el respaldo completo.');
    const dir = mkdtempSync(path.join(tmpdir(), 'iw-backup-'));
    try {
      const file = path.join(dir, 'admin.db');
      await db.backup(file);
      const data = readFileSync(file);
      const stamp = todayISO();
      repo.audit(db, user.id, 'backup', 'database', null);
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
