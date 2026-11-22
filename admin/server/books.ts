/**
 * Cuentas por pagar e inventario: lectura y escritura en la base.
 *
 * El saldo de cada cuenta y la existencia de cada producto NO se guardan:
 * se calculan de los cargos/pagos y de los movimientos. Asi nunca se
 * descuadran.
 */
import type { DB } from './db.ts';
import type { InventoryItem, InventoryMovement, Payable, PayableAccount, PayablePayment } from '../shared/domain.ts';
import type { InventoryItemInput, InventoryMovementInput, PayableAccountInput, PayableInput, PayablePaymentInput } from './schemas.ts';

const b = (value: boolean) => (value ? 1 : 0);
const createdByName = (alias: string) => `(SELECT name FROM users WHERE id = ${alias}.created_by) AS created_by_name`;

/* ------------------------------------------------------------------ */
/* Cuentas por pagar                                                    */
/* ------------------------------------------------------------------ */

export const listPayableAccounts = (db: DB): PayableAccount[] =>
  (db.prepare('SELECT * FROM payable_accounts ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    last4: r.last4,
    dueDay: r.due_day,
    creditLimit: r.credit_limit,
    notes: r.notes,
    active: Boolean(r.active),
    color: r.color ?? null,
    network: r.network ?? null,
    supplierId: r.supplier_id ?? null,
  }));

/**
 * Una cuenta de proveedor queda ligada al proveedor del catalogo con el mismo
 * nombre (se crea si no existe). Devuelve el id del proveedor.
 */
export function linkSupplier(db: DB, accountId: number, name: string) {
  const found = db.prepare('SELECT id FROM suppliers WHERE name = ? COLLATE NOCASE').get(name) as { id: number } | undefined;
  const supplierId = found?.id ?? Number(db.prepare('INSERT INTO suppliers (name) VALUES (?)').run(name).lastInsertRowid);
  db.prepare('UPDATE payable_accounts SET supplier_id = ? WHERE id = ?').run(supplierId, accountId);
  return supplierId;
}

/** Cuenta por pagar de un proveedor del catalogo (la crea si no existe). */
export function accountForSupplier(db: DB, supplierId: number): number {
  const found = db.prepare('SELECT id FROM payable_accounts WHERE supplier_id = ?').get(supplierId) as { id: number } | undefined;
  if (found) return found.id;
  const supplier = db.prepare('SELECT name FROM suppliers WHERE id = ?').get(supplierId) as { name: string } | undefined;
  if (!supplier) throw new Error('proveedor inexistente');
  const sameName = db.prepare(`SELECT id FROM payable_accounts WHERE name = ? COLLATE NOCASE`).get(supplier.name) as { id: number } | undefined;
  if (sameName) {
    db.prepare(`UPDATE payable_accounts SET supplier_id = ?, kind = 'supplier' WHERE id = ?`).run(supplierId, sameName.id);
    return sameName.id;
  }
  return Number(db.prepare(`INSERT INTO payable_accounts (name, kind, supplier_id) VALUES (?, 'supplier', ?)`).run(supplier.name, supplierId).lastInsertRowid);
}

export const insertPayableAccount = (db: DB, a: PayableAccountInput) =>
  Number(
    db
      .prepare('INSERT INTO payable_accounts (name, kind, last4, due_day, credit_limit, notes, active, color, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(a.name, a.kind, a.last4, a.dueDay, a.creditLimit, a.notes, b(a.active), a.color, a.network).lastInsertRowid
  );

export const updatePayableAccount = (db: DB, id: number, a: PayableAccountInput) =>
  db
    .prepare('UPDATE payable_accounts SET name = ?, kind = ?, last4 = ?, due_day = ?, credit_limit = ?, notes = ?, active = ?, color = ?, network = ? WHERE id = ?')
    .run(a.name, a.kind, a.last4, a.dueDay, a.creditLimit, a.notes, b(a.active), a.color, a.network, id).changes;

export const payableAccountUsage = (db: DB, id: number) =>
  (
    db
      .prepare('SELECT (SELECT COUNT(*) FROM payables WHERE account_id = @id) + (SELECT COUNT(*) FROM payable_payments WHERE account_id = @id) AS n')
      .get({ id }) as { n: number }
  ).n;

export const deletePayableAccount = (db: DB, id: number) => db.prepare('DELETE FROM payable_accounts WHERE id = ?').run(id).changes;

const toPayable = (r: any): Payable => ({
  id: r.id,
  accountId: r.account_id,
  date: r.date,
  description: r.description,
  category: r.category,
  amount: r.amount,
  dueDate: r.due_date,
  notes: r.notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  createdBy: r.created_by_name,
});

export const listPayables = (db: DB): Payable[] =>
  (db.prepare(`SELECT p.*, ${createdByName('p')} FROM payables p ORDER BY p.date DESC, p.id DESC`).all() as any[]).map(toPayable);

export const getPayable = (db: DB, id: number): Payable | null => {
  const row = db.prepare(`SELECT p.*, ${createdByName('p')} FROM payables p WHERE p.id = ?`).get(id);
  return row ? toPayable(row) : null;
};

export const insertPayable = (db: DB, p: PayableInput, userId: number) =>
  Number(
    db
      .prepare(
        `INSERT INTO payables (account_id, date, description, category, amount, due_date, notes, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(p.accountId, p.date, p.description, p.category, p.amount, p.dueDate, p.notes, userId, userId).lastInsertRowid
  );

export const updatePayable = (db: DB, id: number, p: PayableInput, userId: number) =>
  db
    .prepare(
      `UPDATE payables SET account_id = ?, date = ?, description = ?, category = ?, amount = ?, due_date = ?, notes = ?,
              updated_at = datetime('now'), updated_by = ? WHERE id = ?`
    )
    .run(p.accountId, p.date, p.description, p.category, p.amount, p.dueDate, p.notes, userId, id).changes;

export const deletePayable = (db: DB, id: number) => db.prepare('DELETE FROM payables WHERE id = ?').run(id).changes;

export const payableVersion = (db: DB, id: number) =>
  (db.prepare('SELECT updated_at FROM payables WHERE id = ?').get(id) as { updated_at: string } | undefined)?.updated_at ?? null;

const toPayment = (r: any): PayablePayment => ({
  id: r.id,
  accountId: r.account_id,
  payableId: r.payable_id,
  date: r.date,
  amount: r.amount,
  method: r.method,
  notes: r.notes,
  createdAt: r.created_at,
  createdBy: r.created_by_name,
});

export const listPayablePayments = (db: DB): PayablePayment[] =>
  (db.prepare(`SELECT x.*, ${createdByName('x')} FROM payable_payments x ORDER BY x.date DESC, x.id DESC`).all() as any[]).map(toPayment);

export const getPayablePayment = (db: DB, id: number): PayablePayment | null => {
  const row = db.prepare(`SELECT x.*, ${createdByName('x')} FROM payable_payments x WHERE x.id = ?`).get(id);
  return row ? toPayment(row) : null;
};

export const insertPayablePayment = (db: DB, p: PayablePaymentInput, userId: number) =>
  Number(
    db
      .prepare('INSERT INTO payable_payments (account_id, payable_id, date, amount, method, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(p.accountId, p.payableId, p.date, p.amount, p.method, p.notes, userId).lastInsertRowid
  );

export const deletePayablePayment = (db: DB, id: number) => db.prepare('DELETE FROM payable_payments WHERE id = ?').run(id).changes;

/* ------------------------------------------------------------------ */
/* Inventario                                                           */
/* ------------------------------------------------------------------ */

export const listInventoryItems = (db: DB): InventoryItem[] =>
  (db.prepare('SELECT * FROM inventory_items ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    sku: r.sku,
    cost: r.cost,
    minStock: r.min_stock,
    notes: r.notes,
    active: Boolean(r.active),
  }));

export const getInventoryItem = (db: DB, id: number) => listInventoryItems(db).find((i) => i.id === id) ?? null;

export const insertInventoryItem = (db: DB, i: InventoryItemInput) =>
  Number(
    db
      .prepare('INSERT INTO inventory_items (name, category, sku, cost, min_stock, notes, active) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(i.name, i.category, i.sku, i.cost, i.minStock, i.notes, b(i.active)).lastInsertRowid
  );

export const updateInventoryItem = (db: DB, id: number, i: InventoryItemInput) =>
  db
    .prepare('UPDATE inventory_items SET name = ?, category = ?, sku = ?, cost = ?, min_stock = ?, notes = ?, active = ? WHERE id = ?')
    .run(i.name, i.category, i.sku, i.cost, i.minStock, i.notes, b(i.active), id).changes;

export const inventoryItemUsage = (db: DB, id: number) =>
  (db.prepare('SELECT COUNT(*) AS n FROM inventory_movements WHERE item_id = ?').get(id) as { n: number }).n;

export const deleteInventoryItem = (db: DB, id: number) => db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id).changes;

/** Existencia actual de un producto. */
export const stockOf = (db: DB, itemId: number) =>
  (
    db
      .prepare(`SELECT COALESCE(SUM(CASE WHEN kind = 'out' THEN -quantity ELSE quantity END), 0) AS n FROM inventory_movements WHERE item_id = ?`)
      .get(itemId) as { n: number }
  ).n;

const toMovement = (r: any): InventoryMovement => ({
  id: r.id,
  itemId: r.item_id,
  date: r.date,
  kind: r.kind,
  quantity: r.quantity,
  unitCost: r.unit_cost,
  supplierId: r.supplier_id,
  saleId: r.sale_id,
  serviceId: r.service_id,
  notes: r.notes,
  createdAt: r.created_at,
  createdBy: r.created_by_name,
});

export const listInventoryMovements = (db: DB): InventoryMovement[] =>
  (db.prepare(`SELECT m.*, ${createdByName('m')} FROM inventory_movements m ORDER BY m.date DESC, m.id DESC`).all() as any[]).map(toMovement);

export const getInventoryMovement = (db: DB, id: number): InventoryMovement | null => {
  const row = db.prepare(`SELECT m.*, ${createdByName('m')} FROM inventory_movements m WHERE m.id = ?`).get(id);
  return row ? toMovement(row) : null;
};

export function insertInventoryMovement(db: DB, m: InventoryMovementInput, userId: number) {
  const id = Number(
    db
      .prepare(
        `INSERT INTO inventory_movements (item_id, date, kind, quantity, unit_cost, supplier_id, sale_id, service_id, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(m.itemId, m.date, m.kind, m.quantity, m.unitCost, m.supplierId, m.saleId, m.serviceId, m.notes, userId).lastInsertRowid
  );
  // Una compra con costo actualiza el costo por unidad del producto (el ultimo que se pago).
  if (m.kind === 'in' && m.unitCost != null) db.prepare('UPDATE inventory_items SET cost = ? WHERE id = ?').run(m.unitCost, m.itemId);
  return id;
}

export const deleteInventoryMovement = (db: DB, id: number) => db.prepare('DELETE FROM inventory_movements WHERE id = ?').run(id).changes;
