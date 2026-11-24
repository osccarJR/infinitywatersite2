/**
 * Caja y bancos: cuentas con saldo inicial y sus ingresos y egresos, como un
 * estado de cuenta. Modulo aparte con su propio permiso ("bank.manage"), que
 * no viene en ningun perfil: lo maneja el dueno (o a quien el se lo de).
 */
import type { DB } from './db.ts';
import { HttpError, type Ctx, type Router } from './http.ts';
import { need } from './permissions.ts';
import { BankAccountInput, BankMovementInput, firstIssue } from './schemas.ts';
import type { BankAccount, BankMovement, BankPending, User } from '../shared/domain.ts';
import type { AuditEntry } from './audit.ts';
import type { z } from 'zod';

const toAccount = (r: any): BankAccount => ({ id: r.id, name: r.name, openingBalance: r.opening_balance, openingDate: r.opening_date, notes: r.notes, active: Boolean(r.active) });
const toMovement = (r: any): BankMovement => ({ id: r.id, accountId: r.account_id, date: r.date, kind: r.kind, amount: r.amount, description: r.description, notes: r.notes, createdAt: r.created_at, createdBy: r.created_by_name ?? null, source: r.source ?? null });

export const listBankAccounts = (db: DB) => (db.prepare('SELECT * FROM bank_accounts ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map(toAccount);
export const listBankMovements = (db: DB) =>
  (db.prepare('SELECT m.*, (SELECT name FROM users WHERE id = m.created_by) AS created_by_name FROM bank_movements m ORDER BY m.date DESC, m.id DESC').all() as any[]).map(toMovement);

export const managesBank = (u: User) => Boolean(u.permissions.flags['bank.manage']);

/**
 * Lo que ya se registro en el sistema y es dinero que entro o salio:
 *  - pagos a tarjetas, proveedores y prestamos (cuentas por pagar): egreso
 *  - comisiones pagadas a vendedores (por vendedor y dia): egreso
 *  - pagos a tecnicos, de instalaciones y servicios (por tecnico y dia): egreso
 *  - lo que pagaron las financieras (por financiera y dia): ingreso
 * Cada uno tiene una clave ("source") para no pasarlo dos veces a caja.
 */
export function systemMovements(db: DB): Omit<BankPending, 'movementId' | 'previousAmount'>[] {
  const out: Omit<BankPending, 'movementId' | 'previousAmount'>[] = [];
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  for (const r of db
    .prepare(`SELECT p.id, p.date, p.amount, p.method, a.name AS account FROM payable_payments p JOIN payable_accounts a ON a.id = p.account_id`)
    .all() as any[]) {
    out.push({ source: `payable-payment:${r.id}`, date: r.date, kind: 'out', amount: r.amount, description: `Pago a ${r.account}` });
  }
  for (const r of db
    .prepare(
      `SELECT s.seller_id AS pid, s.commission_paid_date AS date, SUM(s.commission) AS amount, COUNT(*) AS n, p.name
         FROM sales s LEFT JOIN people p ON p.id = s.seller_id
        WHERE s.commission_paid = 1 AND s.commission_paid_date IS NOT NULL AND COALESCE(s.commission, 0) > 0
        GROUP BY s.seller_id, s.commission_paid_date`
    )
    .all() as any[]) {
    out.push({ source: `commission:${r.pid ?? 0}:${r.date}`, date: r.date, kind: 'out', amount: r.amount, description: `Comisión ${r.name ?? 'vendedor'} (${plural(r.n, 'venta', 'ventas')})` });
  }
  const tech = new Map<string, { pid: number; date: string; amount: number; n: number; name: string }>();
  for (const r of db
    .prepare(
      `SELECT s.installer_id AS pid, s.installer_paid_date AS date, s.installer_pay AS amount, p.name FROM sales s LEFT JOIN people p ON p.id = s.installer_id
        WHERE s.installer_paid = 1 AND s.installer_paid_date IS NOT NULL AND COALESCE(s.installer_pay, 0) > 0
       UNION ALL
       SELECT v.technician_id, v.technician_paid_date, v.technician_pay, p.name FROM services v LEFT JOIN people p ON p.id = v.technician_id
        WHERE v.technician_paid = 1 AND v.technician_paid_date IS NOT NULL AND COALESCE(v.technician_pay, 0) > 0`
    )
    .all() as any[]) {
    const key = `${r.pid ?? 0}:${r.date}`;
    const t = tech.get(key) ?? { pid: r.pid ?? 0, date: r.date, amount: 0, n: 0, name: r.name ?? 'técnico' };
    t.amount += r.amount;
    t.n += 1;
    tech.set(key, t);
  }
  for (const t of tech.values()) out.push({ source: `technician:${t.pid}:${t.date}`, date: t.date, kind: 'out', amount: t.amount, description: `Pago técnico ${t.name} (${plural(t.n, 'trabajo', 'trabajos')})` });
  for (const r of db
    .prepare(
      `SELECT s.financier_id AS fid, s.funded_date AS date, SUM(s.funded_amount) AS amount, COUNT(*) AS n, f.name
         FROM sales s LEFT JOIN financiers f ON f.id = s.financier_id
        WHERE s.funded_paid = 1 AND s.funded_date IS NOT NULL AND COALESCE(s.funded_amount, 0) > 0
        GROUP BY s.financier_id, s.funded_date`
    )
    .all() as any[]) {
    out.push({ source: `funded:${r.fid ?? 0}:${r.date}`, date: r.date, kind: 'in', amount: r.amount, description: `Pago de ${r.name ?? 'la financiera'} (${plural(r.n, 'venta', 'ventas')})` });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.description.localeCompare(b.description));
}

/** Lo del sistema que falta pasar a caja desde una fecha (o que cambio de monto). */
export function pendingFor(db: DB, since: string): BankPending[] {
  const imported = new Map((db.prepare('SELECT id, source, amount FROM bank_movements WHERE source IS NOT NULL').all() as { id: number; source: string; amount: number }[]).map((m) => [m.source, m]));
  const ignored = new Set((db.prepare('SELECT source FROM bank_ignored').all() as { source: string }[]).map((r) => r.source));
  const list: BankPending[] = [];
  for (const m of systemMovements(db)) {
    if (m.date < since || ignored.has(m.source)) continue;
    const done = imported.get(m.source);
    if (done && done.amount === m.amount) continue;
    list.push({ ...m, movementId: done?.id ?? null, previousAmount: done?.amount ?? null });
  }
  return list;
}

function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const { message, field } = firstIssue(result.error);
    throw new HttpError(400, message, field);
  }
  return result.data;
}

export function bankRoutes(api: Router, db: DB, log: (ctx: Ctx, entry: AuditEntry) => void) {
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const dollars = (cents: number) => usd.format(cents / 100);
  const me = (ctx: Ctx) => {
    if (!ctx.user) throw new HttpError(401, 'Inicia sesión');
    need(managesBank(ctx.user), 'No tienes acceso a caja y bancos.');
    return ctx.user;
  };
  const num = (ctx: Ctx) => Number(ctx.params.id);
  const account = (id: number) => db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(id) as any;
  const movement = (id: number) => db.prepare('SELECT * FROM bank_movements WHERE id = ?').get(id) as any;
  const fresh = () => ({ bankAccounts: listBankAccounts(db), bankMovements: listBankMovements(db) });
  const unique = (fn: () => void) => {
    try {
      fn();
    } catch (error: any) {
      if (String(error?.code ?? '').startsWith('SQLITE_CONSTRAINT_UNIQUE')) throw new HttpError(409, 'Ya existe una cuenta con ese nombre', 'name');
      throw error;
    }
  };

  api.add('POST', '/bank-accounts', (ctx) => {
    const user = me(ctx);
    const input = parse(BankAccountInput, ctx.body);
    let id = 0;
    unique(() => {
      id = Number(db.prepare('INSERT INTO bank_accounts (name, opening_balance, opening_date, notes, active, created_by) VALUES (?, ?, ?, ?, ?, ?)').run(input.name, input.openingBalance, input.openingDate, input.notes, input.active ? 1 : 0, user.id).lastInsertRowid);
    });
    log(ctx, { action: 'create', entity: 'bank-account', entityId: id, label: `la cuenta ${input.name}`, changes: [{ f: 'Saldo inicial', b: dollars(input.openingBalance) }, { f: 'Desde', b: input.openingDate }] });
    return fresh();
  });

  api.add('PUT', '/bank-accounts/:id', (ctx) => {
    me(ctx);
    const before = account(num(ctx));
    if (!before) throw new HttpError(404, 'La cuenta no existe');
    const input = parse(BankAccountInput, ctx.body);
    unique(() => {
      db.prepare('UPDATE bank_accounts SET name = ?, opening_balance = ?, opening_date = ?, notes = ?, active = ? WHERE id = ?').run(input.name, input.openingBalance, input.openingDate, input.notes, input.active ? 1 : 0, num(ctx));
    });
    const changes = [
      ...(before.name !== input.name ? [{ f: 'Nombre', a: before.name, b: input.name }] : []),
      ...(before.opening_balance !== input.openingBalance ? [{ f: 'Saldo inicial', a: dollars(before.opening_balance), b: dollars(input.openingBalance) }] : []),
      ...(before.opening_date !== input.openingDate ? [{ f: 'Desde', a: before.opening_date, b: input.openingDate }] : []),
      ...(Boolean(before.active) !== input.active ? [{ f: 'Activa', a: before.active ? 'Sí' : 'No', b: input.active ? 'Sí' : 'No' }] : []),
    ];
    if (changes.length) log(ctx, { action: 'update', entity: 'bank-account', entityId: num(ctx), label: `la cuenta ${input.name}`, changes });
    return fresh();
  });

  api.add('DELETE', '/bank-accounts/:id', (ctx) => {
    me(ctx);
    const before = account(num(ctx));
    if (!before) throw new HttpError(404, 'La cuenta no existe');
    const count = (db.prepare('SELECT COUNT(*) AS n FROM bank_movements WHERE account_id = ?').get(num(ctx)) as { n: number }).n;
    db.prepare('DELETE FROM bank_accounts WHERE id = ?').run(num(ctx));
    log(ctx, { action: 'delete', entity: 'bank-account', entityId: num(ctx), label: `la cuenta ${before.name}`, changes: [{ f: 'Movimientos borrados', b: String(count) }] });
    return fresh();
  });

  const movementLabel = (m: { kind: string; amount: number; description: string; account_id?: number; accountId?: number }) =>
    `${m.kind === 'in' ? 'un ingreso' : 'un egreso'} de ${dollars(m.amount)} (${m.description}) en ${account(m.accountId ?? m.account_id!)?.name ?? 'una cuenta'}`;

  /* ------------- traer lo del sistema (sin duplicar) ------------- */

  api.add('GET', '/bank-accounts/:id/pending', (ctx) => {
    me(ctx);
    const acc = account(num(ctx));
    if (!acc) throw new HttpError(404, 'La cuenta no existe');
    return { pending: pendingFor(db, acc.opening_date) };
  });

  api.add('POST', '/bank-accounts/:id/import', (ctx) => {
    const user = me(ctx);
    const acc = account(num(ctx));
    if (!acc) throw new HttpError(404, 'La cuenta no existe');
    const wanted = (ctx.body as { sources?: unknown })?.sources;
    if (!Array.isArray(wanted) || !wanted.length || wanted.some((x) => typeof x !== 'string')) throw new HttpError(400, 'Elige qué movimientos agregar.');
    // Los montos se vuelven a calcular aqui (no se confia en lo que manda la app).
    const pending = new Map(pendingFor(db, acc.opening_date).map((p) => [p.source, p]));
    const chosen = (wanted as string[]).map((s) => pending.get(s)).filter((p): p is BankPending => Boolean(p));
    if (!chosen.length) throw new HttpError(409, 'Esos movimientos ya se agregaron. Recarga la página.');
    db.transaction(() => {
      for (const p of chosen) {
        if (p.movementId) {
          db.prepare(`UPDATE bank_movements SET amount = ?, date = ?, description = ?, updated_at = datetime('now') WHERE id = ?`).run(p.amount, p.date, p.description, p.movementId);
        } else {
          db.prepare('INSERT INTO bank_movements (account_id, date, kind, amount, description, notes, created_by, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(acc.id, p.date, p.kind, p.amount, p.description, 'Del sistema', user.id, p.source);
        }
      }
    })();
    log(ctx, { action: 'create', entity: 'bank-movement', label: `${chosen.length} ${chosen.length === 1 ? 'movimiento' : 'movimientos'} del sistema en ${acc.name}`, changes: chosen.map((p) => ({ f: p.date, b: `${p.kind === 'in' ? '+' : '−'} ${dollars(p.amount)} · ${p.description}` })) });
    return { ...fresh(), pending: pendingFor(db, acc.opening_date) };
  });

  /** "No va en caja": no se vuelve a ofrecer (p. ej. se pago desde otra cuenta). */
  api.add('POST', '/bank-accounts/:id/ignore', (ctx) => {
    me(ctx);
    const acc = account(num(ctx));
    if (!acc) throw new HttpError(404, 'La cuenta no existe');
    const sources = (ctx.body as { sources?: unknown })?.sources;
    if (!Array.isArray(sources) || sources.some((x) => typeof x !== 'string' || x.length > 80)) throw new HttpError(400, 'Datos no válidos');
    const ins = db.prepare('INSERT OR IGNORE INTO bank_ignored (source) VALUES (?)');
    for (const s of sources as string[]) ins.run(s);
    log(ctx, { action: 'update', entity: 'bank-movement', label: `${sources.length} ${sources.length === 1 ? 'movimiento' : 'movimientos'} del sistema que no van en caja` });
    return { pending: pendingFor(db, acc.opening_date) };
  });

  api.add('POST', '/bank-movements', (ctx) => {
    const user = me(ctx);
    const input = parse(BankMovementInput, ctx.body);
    if (!account(input.accountId)) throw new HttpError(400, 'La cuenta elegida ya no existe', 'accountId');
    const id = Number(
      db.prepare('INSERT INTO bank_movements (account_id, date, kind, amount, description, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(input.accountId, input.date, input.kind, input.amount, input.description, input.notes, user.id).lastInsertRowid
    );
    log(ctx, { action: 'create', entity: 'bank-movement', entityId: id, label: movementLabel(input), changes: [{ f: 'Fecha', b: input.date }] });
    return fresh();
  });

  api.add('PUT', '/bank-movements/:id', (ctx) => {
    me(ctx);
    const before = movement(num(ctx));
    if (!before) throw new HttpError(404, 'El movimiento no existe');
    const input = parse(BankMovementInput, ctx.body);
    if (!account(input.accountId)) throw new HttpError(400, 'La cuenta elegida ya no existe', 'accountId');
    db.prepare(`UPDATE bank_movements SET account_id = ?, date = ?, kind = ?, amount = ?, description = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`).run(input.accountId, input.date, input.kind, input.amount, input.description, input.notes, num(ctx));
    log(ctx, {
      action: 'update',
      entity: 'bank-movement',
      entityId: num(ctx),
      label: movementLabel(input),
      changes: [
        ...(before.amount !== input.amount ? [{ f: 'Monto', a: dollars(before.amount), b: dollars(input.amount) }] : []),
        ...(before.kind !== input.kind ? [{ f: 'Tipo', a: before.kind === 'in' ? 'Ingreso' : 'Egreso', b: input.kind === 'in' ? 'Ingreso' : 'Egreso' }] : []),
        ...(before.date !== input.date ? [{ f: 'Fecha', a: before.date, b: input.date }] : []),
        ...(before.description !== input.description ? [{ f: 'Descripción', a: before.description, b: input.description }] : []),
      ],
    });
    return fresh();
  });

  api.add('DELETE', '/bank-movements/:id', (ctx) => {
    me(ctx);
    const before = movement(num(ctx));
    if (!before) throw new HttpError(404, 'El movimiento no existe');
    log(ctx, { action: 'delete', entity: 'bank-movement', entityId: num(ctx), label: movementLabel(before) });
    db.prepare('DELETE FROM bank_movements WHERE id = ?').run(num(ctx));
    return fresh();
  });
}
