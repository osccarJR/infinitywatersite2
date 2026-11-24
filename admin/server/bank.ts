/**
 * Caja y bancos: cuentas con saldo inicial y sus ingresos y egresos, como un
 * estado de cuenta. Modulo aparte con su propio permiso ("bank.manage"), que
 * no viene en ningun perfil: lo maneja el dueno (o a quien el se lo de).
 */
import type { DB } from './db.ts';
import { HttpError, type Ctx, type Router } from './http.ts';
import { need } from './permissions.ts';
import { BankAccountInput, BankMovementInput, firstIssue } from './schemas.ts';
import type { BankAccount, BankMovement, User } from '../shared/domain.ts';
import type { AuditEntry } from './audit.ts';
import type { z } from 'zod';

const toAccount = (r: any): BankAccount => ({ id: r.id, name: r.name, openingBalance: r.opening_balance, openingDate: r.opening_date, notes: r.notes, active: Boolean(r.active) });
const toMovement = (r: any): BankMovement => ({ id: r.id, accountId: r.account_id, date: r.date, kind: r.kind, amount: r.amount, description: r.description, notes: r.notes, createdAt: r.created_at, createdBy: r.created_by_name ?? null });

export const listBankAccounts = (db: DB) => (db.prepare('SELECT * FROM bank_accounts ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map(toAccount);
export const listBankMovements = (db: DB) =>
  (db.prepare('SELECT m.*, (SELECT name FROM users WHERE id = m.created_by) AS created_by_name FROM bank_movements m ORDER BY m.date DESC, m.id DESC').all() as any[]).map(toMovement);

export const managesBank = (u: User) => Boolean(u.permissions.flags['bank.manage']);

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
