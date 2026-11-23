/**
 * Permisos: que ve y que puede cambiar cada usuario.
 *
 * Todo se decide AQUI, en el servidor. La app solo esconde botones para que
 * la pantalla sea clara; aunque alguien manipule la app, el servidor no
 * entrega lo que el usuario no puede ver ni acepta cambios que no le tocan.
 *
 *  - Alcance "solo lo suyo": las ventas que vendio o instalo (segun la
 *    persona del equipo que es), los servicios que atendio o de esas ventas,
 *    lo que el mismo registro y los clientes de todo eso.
 *  - Montos: sin montos / solo precios / todo. Lo que no ve, el servidor lo
 *    manda vacio y, al guardar, conserva el valor que ya habia (asi un
 *    usuario sin montos no borra precios ni comisiones al editar).
 */
import type { DB } from './db.ts';
import { HttpError } from './http.ts';
import type { Client, Permissions, Sale, Service, User } from '../shared/domain.ts';

export const NO_PERMISSION = 'No tienes permiso para esto. Pídeselo al administrador.';

export function need(ok: boolean, message = NO_PERMISSION): asserts ok {
  if (!ok) throw new HttpError(403, message);
}

/* ------------------------------------------------------------------ */
/* Alcance                                                              */
/* ------------------------------------------------------------------ */

export interface Scope {
  all: boolean;
  sales: Set<number>;
  services: Set<number>;
  clients: Set<number>;
}

const ids = (rows: unknown[]) => new Set((rows as { id: number }[]).map((r) => r.id));

export function scopeOf(db: DB, user: User): Scope {
  const p = user.permissions;
  if (p.scope === 'all') return { all: true, sales: new Set(), services: new Set(), clients: new Set() };
  // Sin persona asignada solo ve lo que el mismo registro.
  const person = p.personId ?? -1;
  const params = { person, user: user.id };
  const mySales = `SELECT id FROM sales WHERE seller_id = @person OR installer_id = @person OR created_by = @user`;
  const myServices = `SELECT id FROM services WHERE technician_id = @person OR created_by = @user OR sale_id IN (${mySales})`;
  return {
    all: false,
    sales: ids(db.prepare(mySales).all(params)),
    services: ids(db.prepare(myServices).all(params)),
    clients: ids(
      db
        .prepare(
          `SELECT id FROM clients WHERE created_by = @user
              OR id IN (SELECT client_id FROM sales WHERE id IN (${mySales}))
              OR id IN (SELECT client_id FROM services WHERE id IN (${myServices}))`
        )
        .all(params)
    ),
  };
}

export const seesSale = (scope: Scope, id: number) => scope.all || scope.sales.has(id);
export const seesService = (scope: Scope, id: number) => scope.all || scope.services.has(id);
export const seesClient = (scope: Scope, id: number) => scope.all || scope.clients.has(id);

/* ------------------------------------------------------------------ */
/* Lo que se entrega                                                    */
/* ------------------------------------------------------------------ */

/** Datos de contacto que se tapan sin "Ver telefono, correo y direccion". */
export function shapeClient(client: Client, p: Permissions): Client {
  if (p.flags['clients.contact']) return client;
  return { ...client, phone: null, phone2: null, email: null, address: null, zip: null };
}

/** Venta con solo los montos que el usuario puede ver. */
export function shapeSale(sale: Sale, p: Permissions): Sale {
  const f = p.flags;
  // Lo que le toca a el (su comision, su pago por instalar) lo ve siempre que
  // este vinculado a una persona del equipo y vea al menos precios.
  const mine = p.personId != null && f['money.prices'];
  const out: Sale = { ...sale };
  if (!f['money.prices']) {
    out.price = null;
    out.cashDown = null;
    out.invoice = null; // la factura lleva precios
  }
  if (!f['money.financier']) out.fundedAmount = null;
  if (!f['money.commissions'] && !(mine && sale.sellerId === p.personId)) out.commission = null;
  if (!f['money.techpay'] && !(mine && sale.installerId === p.personId)) out.installerPay = null;
  if (!f['money.costs']) out.suppliers = [];
  if (!f['clients.contact']) {
    out.installAddress = null;
    out.installZip = null;
  }
  return out;
}

export function shapeService(service: Service, p: Permissions): Service {
  const f = p.flags;
  const mine = p.personId != null && f['money.prices'] && service.technicianId === p.personId;
  return {
    ...service,
    amount: f['money.prices'] ? service.amount : null,
    technicianPay: f['money.techpay'] || mine ? service.technicianPay : null,
  };
}

/* ------------------------------------------------------------------ */
/* Lo que se acepta al guardar                                          */
/* ------------------------------------------------------------------ */

type Body = Record<string, unknown>;
const asBody = (body: unknown): Body | null => (body && typeof body === 'object' && !Array.isArray(body) ? { ...(body as Body) } : null);

/**
 * Reemplaza en lo que llega de la app los campos que el usuario no puede
 * cambiar: al editar, por lo que ya habia; al crear, por vacio. Se aplica
 * ANTES de validar, asi las reglas (abono <= precio...) se revisan con los
 * valores reales.
 */
export function protectSaleBody(raw: unknown, existing: Sale | null, p: Permissions): unknown {
  const body = asBody(raw);
  if (!body) return raw;
  const f = p.flags;
  const keep = (fields: readonly string[], blank: (field: string) => unknown) => {
    for (const field of fields) body[field] = existing ? structuredClone((existing as unknown as Body)[field]) : blank(field);
  };
  const legacy = body.isLegacy === true;
  if (!f['money.prices']) keep(['price', 'cashDown'], () => null);
  if (!f['money.financier']) keep(['fundedAmount'], () => null);
  if (!f['money.commissions']) keep(['commission'], () => null);
  if (!f['money.techpay']) keep(['installerPay'], () => null);
  if (!f['money.costs']) keep(['suppliers'], () => []);
  // Venta nueva de un cliente anterior: se da por pagada (igual que en el formulario).
  if (!f['payments.financiers']) keep(['fundedPaid', 'fundedDate'], (k) => (k === 'fundedPaid' ? legacy && body.paymentMethod === 'financed' : null));
  if (!f['payments.commissions']) keep(['commissionPaid', 'commissionPaidDate'], (k) => (k === 'commissionPaid' ? legacy : null));
  if (!f['payments.technicians']) keep(['installerPaid', 'installerPaidDate'], (k) => (k === 'installerPaid' ? legacy : null));
  if (!f['sales.status']) keep(['status'], () => 'active');
  if (!f['clients.contact'] && existing) keep(['installAddress', 'installZip'], () => null);
  return body;
}

export function protectServiceBody(raw: unknown, existing: Service | null, p: Permissions): unknown {
  const body = asBody(raw);
  if (!body) return raw;
  const f = p.flags;
  const keep = (field: keyof Service, blank: unknown) => {
    body[field] = existing ? existing[field] : blank;
  };
  if (!f['money.prices']) keep('amount', null);
  if (!f['money.techpay']) keep('technicianPay', null);
  if (!f['payments.technicians']) {
    keep('technicianPaid', false);
    keep('technicianPaidDate', null);
  }
  // Cambiar el proximo mantenimiento es cambiar la venta.
  if (!f['sales.edit']) delete body.nextServiceDate;
  return body;
}

/** Al editar un cliente sin ver sus datos de contacto, esos datos no se tocan. */
export function protectClientBody(raw: unknown, existing: Client | null, p: Permissions): unknown {
  const body = asBody(raw);
  if (!body || !existing || p.flags['clients.contact']) return body ?? raw;
  for (const field of ['phone', 'phone2', 'email', 'address', 'zip'] as const) body[field] = existing[field];
  return body;
}

/** Lo que el mismo registro hoy lo puede corregir aunque no tenga permiso de editar. */
export function createdTodayBy(db: DB, table: 'sales' | 'services', id: number, userId: number) {
  const row = db.prepare(`SELECT created_by, created_at FROM ${table} WHERE id = ?`).get(id) as { created_by: number | null; created_at: string } | undefined;
  return Boolean(row && row.created_by === userId && Date.now() - Date.parse(row.created_at.replace(' ', 'T') + 'Z') < 24 * 3600 * 1000);
}
