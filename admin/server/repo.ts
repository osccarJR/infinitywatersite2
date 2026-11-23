/**
 * Lectura y escritura en la base. Convierte filas (snake_case, 0/1) en los
 * objetos de la API (camelCase, booleanos) y al reves.
 *
 * better-sqlite3 no acepta booleanos como parametro: siempre se pasa 1/0.
 */
import type { DB } from './db.ts';
import type { CatalogItem, Client, Person, Sale, Service } from '../shared/domain.ts';
import { FIRST_INVOICE } from '../shared/domain.ts';
import type { ClientInput, PersonInput, SaleInput, ServiceInput } from './schemas.ts';

const b = (value: boolean) => (value ? 1 : 0);

function parseWarranty(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export const saveWarranty = (db: DB, saleId: number, data: unknown) => db.prepare('UPDATE sales SET warranty = ? WHERE id = ?').run(JSON.stringify(data), saleId).changes;

export const nextInvoiceNumber = (db: DB) => ((db.prepare('SELECT MAX(invoice_no) AS n FROM sales').get() as { n: number | null }).n ?? FIRST_INVOICE - 1) + 1;
/** Venta que ya usa ese numero (otra distinta a la indicada). */
export const invoiceNumberOwner = (db: DB, number: number, saleId: number) =>
  (db.prepare('SELECT id FROM sales WHERE invoice_no = ? AND id <> ?').get(number, saleId) as { id: number } | undefined)?.id ?? null;
export const saveInvoice = (db: DB, saleId: number, data: { number: number }) =>
  db.prepare('UPDATE sales SET invoice = ?, invoice_no = ? WHERE id = ?').run(JSON.stringify(data), data.number, saleId).changes;
const userName = `(SELECT name FROM users WHERE id = %s)`;

/* ------------------------------------------------------------------ */
/* Catalogos                                                            */
/* ------------------------------------------------------------------ */

export const listPeople = (db: DB): Person[] =>
  (db.prepare('SELECT * FROM people ORDER BY active DESC, name COLLATE NOCASE').all() as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    isSeller: Boolean(r.is_seller),
    isInstaller: Boolean(r.is_installer),
    active: Boolean(r.active),
  }));

export function insertPerson(db: DB, p: PersonInput): number {
  return Number(
    db
      .prepare('INSERT INTO people (name, phone, is_seller, is_installer, active) VALUES (?, ?, ?, ?, ?)')
      .run(p.name, p.phone, b(p.isSeller), b(p.isInstaller), b(p.active)).lastInsertRowid
  );
}

export function updatePerson(db: DB, id: number, p: PersonInput) {
  return db
    .prepare('UPDATE people SET name = ?, phone = ?, is_seller = ?, is_installer = ?, active = ? WHERE id = ?')
    .run(p.name, p.phone, b(p.isSeller), b(p.isInstaller), b(p.active), id).changes;
}

export type CatalogTable = 'financiers' | 'suppliers' | 'brands';

export const listCatalog = (db: DB, table: CatalogTable): CatalogItem[] =>
  (db.prepare(`SELECT * FROM ${table} ORDER BY active DESC, name COLLATE NOCASE`).all() as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    active: Boolean(r.active),
  }));

export const insertCatalog = (db: DB, table: CatalogTable, name: string) =>
  Number(db.prepare(`INSERT INTO ${table} (name) VALUES (?)`).run(name).lastInsertRowid);

export const updateCatalog = (db: DB, table: CatalogTable, id: number, name: string, active: boolean) =>
  db.prepare(`UPDATE ${table} SET name = ?, active = ? WHERE id = ?`).run(name, b(active), id).changes;

/** Cuantas ventas o servicios usan un elemento del catalogo. */
export function catalogUsage(db: DB, kind: 'people' | CatalogTable, id: number): number {
  const queries: Record<typeof kind, string> = {
    people: `SELECT (SELECT COUNT(*) FROM sales WHERE seller_id = @id OR installer_id = @id)
                  + (SELECT COUNT(*) FROM services WHERE technician_id = @id) AS n`,
    financiers: 'SELECT COUNT(*) AS n FROM sales WHERE financier_id = @id',
    suppliers: 'SELECT (SELECT COUNT(*) FROM sale_suppliers WHERE supplier_id = @id) + (SELECT COUNT(*) FROM inventory_movements WHERE supplier_id = @id) AS n',
    brands: 'SELECT COUNT(*) AS n FROM sales WHERE brand_id = @id',
  };
  return (db.prepare(queries[kind]).get({ id }) as { n: number }).n;
}

export const deleteCatalog = (db: DB, kind: 'people' | CatalogTable, id: number) =>
  db.prepare(`DELETE FROM ${kind} WHERE id = ?`).run(id).changes;

/* ------------------------------------------------------------------ */
/* Clientes                                                             */
/* ------------------------------------------------------------------ */

const toClient = (r: any): Client => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  phone2: r.phone2,
  email: r.email,
  address: r.address,
  city: r.city,
  state: r.state,
  zip: r.zip,
  language: r.language,
  source: r.source,
  notes: r.notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const listClients = (db: DB): Client[] =>
  (db.prepare('SELECT * FROM clients ORDER BY name COLLATE NOCASE').all() as any[]).map(toClient);

export const getClient = (db: DB, id: number): Client | null => {
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  return row ? toClient(row) : null;
};

const clientParams = (c: ClientInput) => ({
  name: c.name,
  phone: c.phone,
  phone2: c.phone2,
  email: c.email,
  address: c.address,
  city: c.city,
  state: c.state,
  zip: c.zip,
  language: c.language,
  source: c.source,
  notes: c.notes,
});

export function insertClient(db: DB, c: ClientInput, userId: number): number {
  return Number(
    db
      .prepare(
        `INSERT INTO clients (name, phone, phone2, email, address, city, state, zip, language, source, notes, created_by, updated_by)
         VALUES (@name, @phone, @phone2, @email, @address, @city, @state, @zip, @language, @source, @notes, @user, @user)`
      )
      .run({ ...clientParams(c), user: userId }).lastInsertRowid
  );
}

export function updateClient(db: DB, id: number, c: ClientInput, userId: number) {
  return db
    .prepare(
      `UPDATE clients SET name = @name, phone = @phone, phone2 = @phone2, email = @email, address = @address,
              city = @city, state = @state, zip = @zip, language = @language, source = @source, notes = @notes,
              updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now'), updated_by = @user
        WHERE id = @id`
    )
    .run({ ...clientParams(c), user: userId, id }).changes;
}

export const deleteClient = (db: DB, id: number) => db.prepare('DELETE FROM clients WHERE id = ?').run(id).changes;

/* ------------------------------------------------------------------ */
/* Ventas                                                               */
/* ------------------------------------------------------------------ */

const toSale = (r: any, suppliers: Sale['suppliers']): Sale => ({
  id: r.id,
  clientId: r.client_id,
  brandId: r.brand_id,
  status: r.status ?? 'active',
  saleDate: r.sale_date,
  installDate: r.install_date,
  installerId: r.installer_id,
  installAddress: r.install_address,
  installCity: r.install_city,
  installStateCode: r.install_state,
  installZip: r.install_zip,
  waterSource: r.water_source,
  equipment: {
    outdoorTanks: r.eq_outdoor_tanks,
    aerator: Boolean(r.eq_aerator),
    wholeHouseRo: r.eq_whole_ro ?? 0,
    ro: Boolean(r.eq_ro),
    roType: r.eq_ro_type,
    roUv: Boolean(r.eq_ro_uv),
    other: r.eq_other,
  },
  price: r.price,
  paymentMethod: r.payment_method,
  financierId: r.financier_id,
  cashDown: r.cash_down,
  fundedAmount: r.funded_amount,
  fundedPaid: Boolean(r.funded_paid),
  fundedDate: r.funded_date,
  sellerId: r.seller_id,
  commission: r.commission,
  commissionPaid: Boolean(r.commission_paid),
  commissionPaidDate: r.commission_paid_date,
  installerPay: r.installer_pay,
  installerPaid: Boolean(r.installer_paid),
  installerPaidDate: r.installer_paid_date,
  nextServiceDate: r.next_service_date,
  notes: r.notes,
  isLegacy: Boolean(r.is_legacy),
  installTime: r.install_time ?? null,
  warranty: parseWarranty(r.warranty),
  invoice: parseWarranty(r.invoice ?? null),
  suppliers,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  createdBy: r.created_by_name,
  updatedBy: r.updated_by_name,
});

const SALE_SELECT = `SELECT s.*, ${userName.replace('%s', 's.created_by')} AS created_by_name,
                            ${userName.replace('%s', 's.updated_by')} AS updated_by_name
                       FROM sales s`;

export function listSales(db: DB): Sale[] {
  const bySale = new Map<number, Sale['suppliers']>();
  for (const row of db.prepare('SELECT * FROM sale_suppliers ORDER BY sale_id, position, id').all() as any[]) {
    const list = bySale.get(row.sale_id) ?? [];
    list.push({ supplierId: row.supplier_id, cost: row.cost });
    bySale.set(row.sale_id, list);
  }
  return (db.prepare(`${SALE_SELECT} ORDER BY s.sale_date DESC, s.id DESC`).all() as any[]).map((r) =>
    toSale(r, bySale.get(r.id) ?? [])
  );
}

export function getSale(db: DB, id: number): Sale | null {
  const row = db.prepare(`${SALE_SELECT} WHERE s.id = ?`).get(id);
  if (!row) return null;
  const suppliers = (
    db.prepare('SELECT * FROM sale_suppliers WHERE sale_id = ? ORDER BY position, id').all(id) as any[]
  ).map((r) => ({ supplierId: r.supplier_id, cost: r.cost }));
  return toSale(row, suppliers);
}

const saleParams = (s: SaleInput, clientId: number) => {
  const financed = s.paymentMethod === 'financed';
  return {
    client_id: clientId,
    brand_id: s.brandId,
    status: s.status,
    sale_date: s.saleDate,
    install_date: s.installDate,
    install_time: s.installTime,
    installer_id: s.installerId,
    install_address: s.installAddress,
    install_city: s.installCity,
    install_state: s.installStateCode,
    install_zip: s.installZip,
    water_source: s.waterSource,
    eq_outdoor_tanks: s.equipment.outdoorTanks,
    eq_whole_ro: s.equipment.wholeHouseRo,
    eq_aerator: b(s.equipment.aerator),
    eq_ro: b(s.equipment.ro),
    eq_ro_type: s.equipment.ro ? s.equipment.roType : null,
    eq_ro_uv: b(s.equipment.ro && s.equipment.roUv),
    eq_other: s.equipment.other,
    price: s.price,
    payment_method: s.paymentMethod,
    // Si no es financiado, los datos de financiera no aplican.
    financier_id: financed ? s.financierId : null,
    cash_down: s.cashDown,
    funded_amount: financed ? s.fundedAmount : null,
    funded_paid: b(financed && s.fundedPaid),
    funded_date: financed && s.fundedPaid ? s.fundedDate : null,
    seller_id: s.sellerId,
    commission: s.commission,
    commission_paid: b(s.commissionPaid),
    commission_paid_date: s.commissionPaid ? s.commissionPaidDate : null,
    installer_pay: s.installerPay,
    installer_paid: b(s.installerPaid && (s.installerPay ?? 0) > 0),
    installer_paid_date: s.installerPaid ? s.installerPaidDate : null,
    next_service_date: s.nextServiceDate,
    notes: s.notes,
    is_legacy: b(s.isLegacy),
  };
};

function writeSaleSuppliers(db: DB, saleId: number, suppliers: SaleInput['suppliers']) {
  db.prepare('DELETE FROM sale_suppliers WHERE sale_id = ?').run(saleId);
  const insert = db.prepare('INSERT INTO sale_suppliers (sale_id, supplier_id, cost, position) VALUES (?, ?, ?, ?)');
  suppliers.forEach((row, index) => insert.run(saleId, row.supplierId, row.cost, index));
}

export function insertSale(db: DB, s: SaleInput, clientId: number, userId: number): number {
  const params = saleParams(s, clientId);
  const columns = Object.keys(params);
  const id = Number(
    db
      .prepare(
        `INSERT INTO sales (${columns.join(', ')}, created_by, updated_by)
         VALUES (${columns.map((c) => '@' + c).join(', ')}, @user, @user)`
      )
      .run({ ...params, user: userId }).lastInsertRowid
  );
  writeSaleSuppliers(db, id, s.suppliers);
  return id;
}

export function updateSale(db: DB, id: number, s: SaleInput, clientId: number, userId: number) {
  const params = saleParams(s, clientId);
  const changes = db
    .prepare(
      `UPDATE sales SET ${Object.keys(params)
        .map((c) => `${c} = @${c}`)
        .join(', ')}, updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now'), updated_by = @user WHERE id = @id`
    )
    .run({ ...params, user: userId, id }).changes;
  if (changes) {
    writeSaleSuppliers(db, id, s.suppliers);
    // Si la venta cambio de cliente, sus servicios tecnicos van con ella.
    db.prepare('UPDATE services SET client_id = ? WHERE sale_id = ? AND client_id != ?').run(clientId, id, clientId);
  }
  return changes;
}

export const deleteSale = (db: DB, id: number) => db.prepare('DELETE FROM sales WHERE id = ?').run(id).changes;

/** Acciones rapidas desde el detalle: marcar pagos sin abrir el formulario. */
export function markSale(
  db: DB,
  id: number,
  field: 'fundedPaid' | 'commissionPaid',
  paid: boolean,
  date: string | null,
  userId: number
) {
  const sql =
    field === 'fundedPaid'
      ? `UPDATE sales SET funded_paid = @paid, funded_date = @date WHERE id = @id AND payment_method = 'financed'`
      : `UPDATE sales SET commission_paid = @paid, commission_paid_date = @date WHERE id = @id`;
  const changes = db.prepare(sql).run({ id, paid: b(paid), date: paid ? date : null }).changes;
  if (changes) db.prepare(`UPDATE sales SET updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now'), updated_by = ? WHERE id = ?`).run(userId, id);
  return changes;
}

/* ------------------------------------------------------------------ */
/* Servicio tecnico                                                     */
/* ------------------------------------------------------------------ */

const toService = (r: any): Service => ({
  id: r.id,
  clientId: r.client_id,
  saleId: r.sale_id,
  reportedDate: r.reported_date,
  kind: r.kind,
  problem: r.problem,
  solution: r.solution,
  technicianId: r.technician_id,
  visitDate: r.visit_date,
  visitTime: r.visit_time ?? null,
  status: r.status,
  closedDate: r.closed_date,
  billing: r.billing,
  amount: r.amount,
  paymentMethod: r.payment_method,
  technicianPay: r.technician_pay,
  technicianPaid: Boolean(r.technician_paid),
  technicianPaidDate: r.technician_paid_date,
  notes: r.notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  createdBy: r.created_by_name,
  updatedBy: r.updated_by_name,
});

const SERVICE_SELECT = `SELECT v.*, ${userName.replace('%s', 'v.created_by')} AS created_by_name,
                               ${userName.replace('%s', 'v.updated_by')} AS updated_by_name
                          FROM services v`;

export const listServices = (db: DB): Service[] =>
  (db.prepare(`${SERVICE_SELECT} ORDER BY v.reported_date DESC, v.id DESC`).all() as any[]).map(toService);

export const getService = (db: DB, id: number): Service | null => {
  const row = db.prepare(`${SERVICE_SELECT} WHERE v.id = ?`).get(id);
  return row ? toService(row) : null;
};

const serviceParams = (v: ServiceInput, clientId: number) => ({
  client_id: clientId,
  sale_id: v.saleId,
  reported_date: v.reportedDate,
  kind: v.kind,
  problem: v.problem,
  solution: v.solution,
  technician_id: v.technicianId,
  visit_date: v.visitDate,
  visit_time: v.visitDate ? v.visitTime : null,
  status: v.status,
  closed_date: v.status === 'closed' ? v.closedDate : null,
  billing: v.billing,
  amount: v.billing === 'charged' ? v.amount : null,
  payment_method: v.billing === 'charged' ? v.paymentMethod : null,
  technician_pay: v.technicianPay,
  technician_paid: b(v.technicianPaid && (v.technicianPay ?? 0) > 0),
  technician_paid_date: v.technicianPaid ? v.technicianPaidDate : null,
  notes: v.notes,
});

export function insertService(db: DB, v: ServiceInput, clientId: number, userId: number): number {
  const params = serviceParams(v, clientId);
  const columns = Object.keys(params);
  return Number(
    db
      .prepare(
        `INSERT INTO services (${columns.join(', ')}, created_by, updated_by)
         VALUES (${columns.map((c) => '@' + c).join(', ')}, @user, @user)`
      )
      .run({ ...params, user: userId }).lastInsertRowid
  );
}

export function updateService(db: DB, id: number, v: ServiceInput, clientId: number, userId: number) {
  const params = serviceParams(v, clientId);
  return db
    .prepare(
      `UPDATE services SET ${Object.keys(params)
        .map((c) => `${c} = @${c}`)
        .join(', ')}, updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now'), updated_by = @user WHERE id = @id`
    )
    .run({ ...params, user: userId, id }).changes;
}

export const deleteService = (db: DB, id: number) => db.prepare('DELETE FROM services WHERE id = ?').run(id).changes;

/** Al cerrar un mantenimiento se puede dejar fijado el siguiente en la venta. */
export const setNextServiceDate = (db: DB, saleId: number, date: string | null) =>
  db.prepare('UPDATE sales SET next_service_date = ? WHERE id = ?').run(date, saleId).changes;

/** Pagarle a un tecnico: marca instalaciones y servicios como pagados. Devuelve cuantos cambio. */
export function payTechnician(db: DB, saleIds: number[], serviceIds: number[], date: string | null, userId: number) {
  let changed = 0;
  const now = `strftime('%Y-%m-%d %H:%M:%f', 'now')`;
  const sale = db.prepare(`UPDATE sales SET installer_paid = 1, installer_paid_date = ?, updated_at = ${now}, updated_by = ? WHERE id = ? AND COALESCE(installer_pay, 0) > 0 AND installer_paid = 0`);
  const service = db.prepare(`UPDATE services SET technician_paid = 1, technician_paid_date = ?, updated_at = ${now}, updated_by = ? WHERE id = ? AND COALESCE(technician_pay, 0) > 0 AND technician_paid = 0`);
  for (const id of saleIds) changed += sale.run(date, userId, id).changes;
  for (const id of serviceIds) changed += service.run(date, userId, id).changes;
  return changed;
}

/** updatedAt actual de un registro, para detectar ediciones simultaneas. */
export function currentVersion(db: DB, table: 'clients' | 'sales' | 'services', id: number): string | null {
  const row = db.prepare(`SELECT updated_at FROM ${table} WHERE id = ?`).get(id) as { updated_at: string } | undefined;
  return row?.updated_at ?? null;
}

/* ------------------------------------------------------------------ */
/* Auditoria                                                            */
/* ------------------------------------------------------------------ */

