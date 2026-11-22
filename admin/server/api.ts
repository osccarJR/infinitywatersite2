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
  UserCreateInput,
  UserUpdateInput,
} from './schemas.ts';
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  clearLoginFailures,
  createSession,
  deleteSession,
  deleteUserSessions,
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
  const resolveClient = (ref: SaleInput['client'], userId: number) => {
    if ('id' in ref) {
      if (!repo.getClient(db, ref.id)) throw new HttpError(400, 'El cliente elegido ya no existe');
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

  api.add('GET', '/bootstrap', (ctx) => ({
    me: me(ctx),
    features: { places: addressesEnabled() },
    clients: repo.listClients(db),
    sales: repo.listSales(db),
    services: repo.listServices(db),
    people: repo.listPeople(db),
    financiers: repo.listCatalog(db, 'financiers'),
    suppliers: repo.listCatalog(db, 'suppliers'),
    brands: repo.listCatalog(db, 'brands'),
  }));

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
    const user = me(ctx);
    const input = parse(ClientInput, ctx.body);
    const id = repo.insertClient(db, input, user.id);
    repo.audit(db, user.id, 'create', 'client', id);
    return { client: repo.getClient(db, id) };
  });

  api.add('PUT', '/clients/:id', (ctx) => {
    const user = me(ctx);
    const input = parse(ClientInput, ctx.body);
    checkVersion(db, 'clients', num(ctx), input.expectedUpdatedAt);
    notFound(repo.updateClient(db, num(ctx), input, user.id), 'El cliente');
    repo.audit(db, user.id, 'update', 'client', num(ctx));
    return { client: repo.getClient(db, num(ctx)) };
  });

  api.add('DELETE', '/clients/:id', (ctx) => {
    const user = me(ctx);
    const client = repo.getClient(db, num(ctx));
    notFound(client ? 1 : 0, 'El cliente');
    repo.deleteClient(db, num(ctx));
    repo.audit(db, user.id, 'delete', 'client', num(ctx), { name: client!.name });
    return { ok: true };
  });

  /* ------------------------------ ventas ------------------------------ */

  api.add('POST', '/sales', (ctx) => {
    const user = me(ctx);
    const input = parse(SaleInput, ctx.body);
    const id = friendly(() =>
      db.transaction(() => {
        const clientId = resolveClient(input.client, user.id);
        const saleId = repo.insertSale(db, input, clientId, user.id);
        repo.audit(db, user.id, 'create', 'sale', saleId);
        return saleId;
      })()
    );
    return { sale: repo.getSale(db, id) };
  });

  api.add('PUT', '/sales/:id', (ctx) => {
    const user = me(ctx);
    const input = parse(SaleInput, ctx.body);
    friendly(() =>
      db.transaction(() => {
        checkVersion(db, 'sales', num(ctx), input.expectedUpdatedAt);
        const clientId = resolveClient(input.client, user.id);
        notFound(repo.updateSale(db, num(ctx), input, clientId, user.id), 'La venta');
        repo.audit(db, user.id, 'update', 'sale', num(ctx));
      })()
    );
    return { sale: repo.getSale(db, num(ctx)) };
  });

  api.add('POST', '/sales/:id/mark', (ctx) => {
    const user = me(ctx);
    const { field, paid, date } = parse(MarkInput, ctx.body);
    notFound(repo.markSale(db, num(ctx), field, paid, date, user.id), 'La venta');
    repo.audit(db, user.id, 'mark', 'sale', num(ctx), { field, paid });
    return { sale: repo.getSale(db, num(ctx)) };
  });

  api.add('POST', '/sales/mark-batch', (ctx) => {
    const user = me(ctx);
    const { ids, field, paid, date } = parse(MarkBatchInput, ctx.body);
    const unique = [...new Set(ids)];
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
    const user = me(ctx);
    const { saleIds, serviceIds, date } = parse(TechPayInput, ctx.body);
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
    const user = me(ctx);
    notFound(repo.deleteSale(db, num(ctx)), 'La venta');
    repo.audit(db, user.id, 'delete', 'sale', num(ctx));
    return { ok: true };
  });

  /* -------------------------- servicio tecnico -------------------------- */

  const saveService = (ctx: Ctx, id: number | null) => {
    const user = me(ctx);
    const input = parse(ServiceInput, ctx.body);
    return friendly(() =>
      db.transaction(() => {
        const clientId = resolveClient(input.client, user.id);
        if (input.saleId) {
          const sale = repo.getSale(db, input.saleId);
          if (!sale || sale.clientId !== clientId) throw new HttpError(400, 'La venta elegida es de otro cliente');
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

  api.add('POST', '/services', (ctx) => ({ service: repo.getService(db, saveService(ctx, null)) }));
  api.add('PUT', '/services/:id', (ctx) => ({ service: repo.getService(db, saveService(ctx, num(ctx))) }));

  api.add('DELETE', '/services/:id', (ctx) => {
    const user = me(ctx);
    notFound(repo.deleteService(db, num(ctx)), 'El servicio');
    repo.audit(db, user.id, 'delete', 'service', num(ctx));
    return { ok: true };
  });

  /* ----------------------------- catalogos ----------------------------- */

  api.add('POST', '/people', (ctx) => {
    me(ctx);
    const id = repo.insertPerson(db, parse(PersonInput, ctx.body));
    return { person: repo.listPeople(db).find((p) => p.id === id) };
  });

  api.add('PUT', '/people/:id', (ctx) => {
    me(ctx);
    notFound(repo.updatePerson(db, num(ctx), parse(PersonInput, ctx.body)), 'La persona');
    return { person: repo.listPeople(db).find((p) => p.id === num(ctx)) };
  });

  for (const table of ['financiers', 'suppliers', 'brands'] as const) {
    api.add('POST', `/${table}`, (ctx) => {
      me(ctx);
      const { name } = parse(CatalogInput, ctx.body);
      const id = friendly(() => repo.insertCatalog(db, table, name));
      return { item: repo.listCatalog(db, table).find((i) => i.id === id) };
    });
    api.add('PUT', `/${table}/:id`, (ctx) => {
      me(ctx);
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
      me(ctx);
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
    me(ctx);
    return { users: listUsers() };
  });

  api.add('POST', '/users', async (ctx) => {
    const user = me(ctx);
    const input = parse(UserCreateInput, ctx.body);
    const hash = await hashPassword(input.password);
    const id = friendly(() =>
      Number(
        db.prepare('INSERT INTO users (username, name, password_hash) VALUES (?, ?, ?)').run(input.username, input.name, hash)
          .lastInsertRowid
      )
    );
    repo.audit(db, user.id, 'create', 'user', id);
    return { users: listUsers() };
  });

  api.add('PUT', '/users/:id', async (ctx) => {
    const user = me(ctx);
    const input = parse(UserUpdateInput, ctx.body);
    const target = num(ctx);
    if (target === user.id && input.active === false) throw new HttpError(400, 'No puedes desactivar tu propio usuario');
    const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(target);
    notFound(exists ? 1 : 0, 'El usuario');
    if (input.name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(input.name, target);
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

  /* ----------------------- exportar y respaldo ----------------------- */

  for (const kind of ['sales', 'clients', 'services'] as const satisfies readonly ExportKind[]) {
    api.add('GET', `/export/${kind}`, (ctx) => {
      const user = me(ctx);
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
    const user = me(ctx);
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
