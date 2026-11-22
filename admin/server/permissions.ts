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
import type { Permissions, Sale, Service, User } from '../shared/domain.ts';

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

/** Venta con solo los montos que el usuario puede ver. */
export function shapeSale(sale: Sale, p: Permissions): Sale {
  if (p.money === 'all') return sale;
  const own = p.scope === 'own' && p.personId != null;
  const out: Sale = {
    ...sale,
    fundedAmount: null,
    // "Solo lo suyo": ve lo que le toca a el (su comision, su pago por instalar).
    commission: own && sale.sellerId === p.personId ? sale.commission : null,
    installerPay: own && sale.installerId === p.personId ? sale.installerPay : null,
    suppliers: [],
  };
  if (p.money === 'none') {
    out.price = null;
    out.cashDown = null;
    out.commission = null;
    out.installerPay = null;
  }
  return out;
}

export function shapeService(service: Service, p: Permissions): Service {
  if (p.money === 'all') return service;
  const own = p.scope === 'own' && p.personId != null && service.technicianId === p.personId;
  return {
    ...service,
    amount: p.money === 'none' ? null : service.amount,
    technicianPay: own && p.money !== 'none' ? service.technicianPay : null,
  };
}

/* ------------------------------------------------------------------ */
/* Lo que se acepta al guardar                                          */
/* ------------------------------------------------------------------ */

type Body = Record<string, unknown>;
const asBody = (body: unknown): Body | null => (body && typeof body === 'object' && !Array.isArray(body) ? { ...(body as Body) } : null);

const SALE_COSTS = ['fundedAmount', 'commission', 'installerPay', 'suppliers'] as const;
const SALE_PRICES = ['price', 'cashDown'] as const;
const SALE_PAID = ['fundedPaid', 'fundedDate', 'commissionPaid', 'commissionPaidDate', 'installerPaid', 'installerPaidDate'] as const;

/**
 * Reemplaza en lo que llega de la app los campos que el usuario no puede
 * cambiar: al editar, por lo que ya habia; al crear, por vacio. Se aplica
 * ANTES de validar, asi las reglas (abono <= precio...) se revisan con los
 * valores reales.
 */
export function protectSaleBody(raw: unknown, existing: Sale | null, p: Permissions): unknown {
  const body = asBody(raw);
  if (!body) return raw;
  const keep = (fields: readonly string[], blank: (field: string) => unknown) => {
    for (const field of fields) body[field] = existing ? structuredClone((existing as unknown as Body)[field]) : blank(field);
  };
  if (p.money !== 'all') keep(SALE_COSTS, (f) => (f === 'suppliers' ? [] : null));
  if (p.money === 'none') keep(SALE_PRICES, () => null);
  if (p.payments !== 'edit') {
    // Venta nueva: las de clientes anteriores se dan por pagadas (igual que en el formulario).
    const legacy = body.isLegacy === true;
    keep(SALE_PAID, (f) => (f.endsWith('Date') ? null : f === 'fundedPaid' ? legacy && body.paymentMethod === 'financed' : legacy));
  }
  // El proximo mantenimiento lo cambia quien edita ventas; el estado, tambien.
  return body;
}

export function protectServiceBody(raw: unknown, existing: Service | null, p: Permissions): unknown {
  const body = asBody(raw);
  if (!body) return raw;
  const keep = (field: keyof Service, blank: unknown) => {
    body[field] = existing ? existing[field] : blank;
  };
  if (p.money !== 'all') keep('technicianPay', null);
  if (p.money === 'none') keep('amount', null);
  if (p.payments !== 'edit') {
    keep('technicianPaid', false);
    keep('technicianPaidDate', null);
  }
  // Cambiar el proximo mantenimiento es cambiar la venta.
  if (p.sales !== 'edit') delete body.nextServiceDate;
  return body;
}
