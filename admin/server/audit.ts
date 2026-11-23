/**
 * Registro de actividad (auditoria).
 *
 * - Cada movimiento guarda quien, cuando, desde que IP y equipo, sobre que
 *   registro (con su nombre, por si despues se borra) y QUE cambio: el valor
 *   anterior y el nuevo de cada campo.
 * - Es solo de agregar: la app no tiene forma de editarlo ni borrarlo.
 * - Esta sellado: cada fila lleva una firma HMAC que incluye la firma de la
 *   fila anterior (una cadena). Si alguien con acceso al servidor cambia o
 *   borra una fila, la cadena se rompe y el panel lo avisa. La clave vive en
 *   DATA_DIR/audit.key (fuera de la base).
 */
import { createHmac, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { DB } from './db.ts';
import {
  EXPENSE_CATEGORY_LABEL,
  INVENTORY_CATEGORY_LABEL,
  PAYABLE_KIND_LABEL,
  SALE_STATUS_LABEL,
  SERVICE_KIND_LABEL,
  SERVICE_PAYMENT_LABEL,
  SOURCE_LABEL,
  WATER_LABEL,
  equipmentSummary,
  permissionsSummary,
  PERMISSION_AREAS,
  areaSummary,
  type Permissions,
} from '../shared/domain.ts';

/* ------------------------------------------------------------------ */
/* Clave y sello                                                        */
/* ------------------------------------------------------------------ */

let key: Buffer | null = null;

export function initAudit(db: DB, dataDir: string) {
  const file = path.join(dataDir, 'audit.key');
  if (!existsSync(file)) writeFileSync(file, randomBytes(32).toString('hex'), { mode: 0o600 });
  key = Buffer.from(readFileSync(file, 'utf8').trim(), 'hex');
  sealPending(db);
}

type Row = {
  id: number;
  at: string;
  user_id: number | null;
  action: string;
  entity: string;
  entity_id: number | null;
  detail: string | null;
  ip: string | null;
  device: string | null;
  label: string | null;
  hash: string | null;
};

const sign = (row: Row, prev: string) => {
  if (!key) throw new Error('auditoria sin inicializar');
  const parts = [row.id, row.at, row.user_id ?? '', row.action, row.entity, row.entity_id ?? '', row.detail ?? '', row.ip ?? '', row.device ?? '', row.label ?? '', prev];
  return createHmac('sha256', key).update(parts.join('\u001f')).digest('hex');
};

/** Sella las filas que aun no tienen firma (las anteriores a esta version y las nuevas). */
function sealPending(db: DB) {
  const pending = db.prepare('SELECT * FROM audit WHERE hash IS NULL ORDER BY id').all() as Row[];
  if (!pending.length) return;
  const update = db.prepare('UPDATE audit SET hash = ? WHERE id = ?');
  db.transaction(() => {
    for (const row of pending) {
      const prev = (db.prepare('SELECT hash FROM audit WHERE id < ? ORDER BY id DESC LIMIT 1').get(row.id) as { hash: string | null } | undefined)?.hash ?? '';
      update.run(sign(row, prev), row.id);
    }
  })();
}

/** Revisa toda la cadena. */
export function verifyAudit(db: DB) {
  const rows = db.prepare('SELECT * FROM audit ORDER BY id').iterate() as IterableIterator<Row>;
  let prev = '';
  let count = 0;
  let first: string | null = null;
  for (const row of rows) {
    count++;
    first ??= row.at;
    if (!row.hash || row.hash !== sign(row, prev)) {
      return { ok: false, count, first, brokenAt: { id: row.id, at: row.at } };
    }
    prev = row.hash;
  }
  return { ok: true, count, first, brokenAt: null };
}

/* ------------------------------------------------------------------ */
/* Escribir                                                             */
/* ------------------------------------------------------------------ */

/** "iPhone · Safari", "Windows · Chrome"... a partir del navegador. */
export function deviceOf(ua: string | undefined): string | null {
  if (!ua) return null;
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Otro';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
  return `${os} · ${browser}`;
}

export interface Who {
  userId: number | null;
  ip?: string | null;
  device?: string | null;
}

export interface Change {
  /** Campo ("Valor de la venta"). */
  f: string;
  /** Antes. */
  a?: string;
  /** Despues. */
  b?: string;
}

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: number | null;
  /** Nombre legible del registro ("la venta de María Pérez"). */
  label?: string | null;
  changes?: Change[];
  /** Otros datos (lista de ventas pagadas, monto total...). */
  extra?: Record<string, unknown>;
}

export function writeAudit(db: DB, who: Who, entry: AuditEntry) {
  // En una transaccion: la fila y su firma (que depende de la anterior) van juntas,
  // aunque el servidor y la terminal escriban a la vez.
  db.transaction(() => insertSealed(db, who, entry))();
}

function insertSealed(db: DB, who: Who, entry: AuditEntry) {
  const detail = entry.changes?.length || entry.extra ? JSON.stringify({ ...(entry.changes?.length ? { changes: entry.changes } : {}), ...(entry.extra ?? {}) }).slice(0, 12000) : null;
  const info = db
    .prepare(`INSERT INTO audit (at, user_id, action, entity, entity_id, detail, ip, device, label) VALUES (strftime('%Y-%m-%d %H:%M:%S','now'), ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(who.userId, entry.action, entry.entity, entry.entityId ?? null, detail, who.ip ?? null, who.device ?? null, entry.label?.slice(0, 200) ?? null);
  const row = db.prepare('SELECT * FROM audit WHERE id = ?').get(Number(info.lastInsertRowid)) as Row;
  const prev = (db.prepare('SELECT hash FROM audit WHERE id < ? ORDER BY id DESC LIMIT 1').get(row.id) as { hash: string | null } | undefined)?.hash ?? '';
  db.prepare('UPDATE audit SET hash = ? WHERE id = ?').run(sign(row, prev), row.id);
}

/* ------------------------------------------------------------------ */
/* Que cambio: campos legibles                                          */
/* ------------------------------------------------------------------ */

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtMoney = (v: unknown) => (v == null ? '—' : usd.format(Number(v) / 100));
const fmtDate = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : v == null || v === '' ? '—' : String(v));
const fmtBool = (v: unknown) => (v ? 'Sí' : 'No');
const fmtText = (v: unknown) => (v == null || v === '' ? '—' : String(v).length > 140 ? String(v).slice(0, 137) + '…' : String(v));

type Fmt = (v: unknown, db: DB) => string;
const nameFrom = (table: string, field = 'name'): Fmt => (v, db) => {
  if (v == null) return '—';
  const row = db.prepare(`SELECT ${field} AS n FROM ${table} WHERE id = ?`).get(v) as { n: string } | undefined;
  return row?.n ?? `#${v}`;
};
const enumOf = (labels: Record<string, string>): Fmt => (v) => (v == null ? '—' : labels[String(v)] ?? String(v));

type Spec = [field: string, label: string, fmt: Fmt];

const money: Fmt = (v) => fmtMoney(v);
const date: Fmt = (v) => fmtDate(v);
const bool: Fmt = (v) => fmtBool(v);
const text: Fmt = (v) => fmtText(v);

export const SPECS: Record<string, Spec[]> = {
  sale: [
    ['clientId', 'Cliente', nameFrom('clients')],
    ['saleDate', 'Fecha de venta', date],
    ['status', 'Estado', enumOf(SALE_STATUS_LABEL)],
    ['brandId', 'Marca', nameFrom('brands')],
    ['equipment', 'Equipo', (v) => (v ? equipmentSummary(v as any) : '—')],
    ['waterSource', 'Agua', enumOf(WATER_LABEL)],
    ['price', 'Valor de la venta', money],
    ['paymentMethod', 'Forma de pago', enumOf({ financed: 'Financiado', cash: 'Cash' })],
    ['financierId', 'Financiera', nameFrom('financiers')],
    ['cashDown', 'Abono / cobrado', money],
    ['fundedAmount', 'Pagó la financiera', money],
    ['fundedPaid', 'La financiera pagó', bool],
    ['fundedDate', 'Fecha pago financiera', date],
    ['sellerId', 'Vendedor', nameFrom('people')],
    ['commission', 'Comisión', money],
    ['commissionPaid', 'Comisión pagada', bool],
    ['commissionPaidDate', 'Fecha pago comisión', date],
    ['installDate', 'Fecha de instalación', date],
    ['installTime', 'Hora de instalación', text],
    ['installerId', 'Técnico', nameFrom('people')],
    ['installerPay', 'Pago al técnico', money],
    ['installerPaid', 'Técnico pagado', bool],
    ['installAddress', 'Dirección de instalación', text],
    ['installCity', 'Ciudad de instalación', text],
    ['suppliers', 'Proveedores', (v, db) => (Array.isArray(v) && v.length ? v.map((s: any) => `${nameFrom('suppliers')(s.supplierId, db)} ${fmtMoney(s.cost)}`).join(', ') : '—')],
    ['nextServiceDate', 'Próximo mantenimiento', date],
    ['notes', 'Notas', text],
  ],
  client: [
    ['name', 'Nombre', text],
    ['phone', 'Teléfono', text],
    ['phone2', 'Teléfono 2', text],
    ['email', 'Correo', text],
    ['address', 'Dirección', text],
    ['city', 'Ciudad', text],
    ['state', 'Estado', text],
    ['zip', 'ZIP', text],
    ['language', 'Idioma', enumOf({ es: 'Español', en: 'Inglés' })],
    ['source', 'Cómo nos conoció', enumOf(SOURCE_LABEL)],
    ['notes', 'Notas', text],
  ],
  service: [
    ['clientId', 'Cliente', nameFrom('clients')],
    ['reportedDate', 'Fecha del reporte', date],
    ['kind', 'Tipo', enumOf(SERVICE_KIND_LABEL)],
    ['problem', 'Problema', text],
    ['solution', 'Qué se hizo', text],
    ['technicianId', 'Técnico', nameFrom('people')],
    ['visitDate', 'Visita', date],
    ['visitTime', 'Hora de la visita', text],
    ['status', 'Estado', enumOf({ open: 'Abierto', closed: 'Resuelto' })],
    ['closedDate', 'Cierre', date],
    ['billing', 'Cobro', enumOf({ warranty: 'Garantía', charged: 'Se cobró' })],
    ['amount', 'Cobrado', money],
    ['paymentMethod', 'Medio de pago', enumOf(SERVICE_PAYMENT_LABEL)],
    ['technicianPay', 'Pago al técnico', money],
    ['technicianPaid', 'Técnico pagado', bool],
    ['notes', 'Notas', text],
  ],
  payable: [
    ['accountId', 'Cuenta', nameFrom('payable_accounts')],
    ['date', 'Fecha', date],
    ['description', 'Qué es', text],
    ['category', 'Categoría', enumOf(EXPENSE_CATEGORY_LABEL)],
    ['amount', 'Monto', money],
    ['dueDate', 'Vence', date],
    ['notes', 'Notas', text],
  ],
  'payable-account': [
    ['name', 'Nombre', text],
    ['kind', 'Tipo', enumOf(PAYABLE_KIND_LABEL)],
    ['last4', 'Últimos 4', text],
    ['dueDay', 'Día de pago', text],
    ['creditLimit', 'Cupo', money],
    ['notes', 'Notas', text],
    ['active', 'Activa', bool],
    ['color', 'Color', enumOf({ black: 'Negro', silver: 'Plata', gold: 'Dorado', blue: 'Azul', navy: 'Azul oscuro', green: 'Verde', teal: 'Turquesa', purple: 'Morado', red: 'Rojo', pink: 'Rosado', orange: 'Naranja' })],
    ['network', 'Red', enumOf({ visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', none: 'Sin logo' })],
  ],
  'inventory-item': [
    ['name', 'Nombre', text],
    ['category', 'Categoría', enumOf(INVENTORY_CATEGORY_LABEL)],
    ['sku', 'Código', text],
    ['cost', 'Costo', money],
    ['minStock', 'Mínimo', text],
    ['notes', 'Notas', text],
    ['active', 'Activo', bool],
  ],
  person: [
    ['name', 'Nombre', text],
    ['phone', 'Teléfono', text],
    ['isSeller', 'Vende', bool],
    ['isInstaller', 'Instala', bool],
    ['active', 'Activo', bool],
  ],
  catalog: [
    ['name', 'Nombre', text],
    ['active', 'Activo', bool],
  ],
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Campos que cambiaron, con el valor anterior y el nuevo, legibles. */
export function diff(db: DB, kind: keyof typeof SPECS, before: any, after: any): Change[] {
  const out: Change[] = [];
  for (const [field, label, fmt] of SPECS[kind]) {
    if (!same(before?.[field], after?.[field])) out.push({ f: label, a: fmt(before?.[field], db), b: fmt(after?.[field], db) });
  }
  return out;
}

/** Foto de los campos con valor (al crear o al borrar). */
export function snapshot(db: DB, kind: keyof typeof SPECS, record: any): Change[] {
  const out: Change[] = [];
  for (const [field, label, fmt] of SPECS[kind]) {
    const v = record?.[field];
    if (v == null || v === '' || v === false || (Array.isArray(v) && !v.length) || (field === 'status' && v === 'active')) continue;
    out.push({ f: label, b: fmt(v, db) });
  }
  return out;
}

/** Cambios de permisos en palabras, seccion por seccion. */
export function permissionChanges(before: Permissions, after: Permissions): Change[] {
  const out: Change[] = [];
  if (before.admin !== after.admin) out.push({ f: 'Tipo', a: before.admin ? 'Administrador' : 'Con permisos', b: after.admin ? 'Administrador' : 'Con permisos' });
  if (permissionsSummary(before) !== permissionsSummary(after)) out.push({ f: 'Perfil', a: permissionsSummary(before), b: permissionsSummary(after) });
  for (const area of PERMISSION_AREAS) {
    const a = areaSummary(before, area.key);
    const b = areaSummary(after, area.key);
    if (a !== b) out.push({ f: area.label, a, b });
  }
  if (JSON.stringify(before.payableAccounts) !== JSON.stringify(after.payableAccounts)) {
    out.push({ f: 'Cuentas que ve', a: before.payableAccounts ? `${before.payableAccounts.length} cuentas` : 'Todas', b: after.payableAccounts ? `${after.payableAccounts.length} cuentas` : 'Todas' });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Leer                                                                 */
/* ------------------------------------------------------------------ */

/** Grupos para filtrar en la pantalla. */
export const AUDIT_GROUPS: Record<string, { entities?: string[]; actions?: string[] }> = {
  sales: { entities: ['sale'] },
  clients: { entities: ['client'] },
  services: { entities: ['service'] },
  payments: { actions: ['mark', 'mark-batch', 'tech-payment'] },
  payables: { entities: ['payable', 'payable-account', 'payable-payment'] },
  inventory: { entities: ['inventory-item', 'inventory-movement'] },
  team: { entities: ['person', 'financier', 'supplier', 'brand'] },
  users: { entities: ['user'], actions: ['permissions', 'password', 'create', 'update', 'deactivate', 'activate'] },
  access: { actions: ['login', 'login-failed', 'logout', 'preview'] },
  downloads: { actions: ['export', 'backup', 'print'] },
  deletes: { actions: ['delete'] },
};

export interface AuditQuery {
  before?: number;
  limit?: number;
  userId?: number;
  group?: string;
  from?: string;
  to?: string;
  q?: string;
}

export function listAudit(db: DB, query: AuditQuery) {
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (query.before) {
    where.push('a.id < @before');
    params.before = query.before;
  }
  if (query.userId) {
    where.push('a.user_id = @userId');
    params.userId = query.userId;
  }
  const group = query.group ? AUDIT_GROUPS[query.group] : undefined;
  if (group) {
    const parts: string[] = [];
    if (group.entities) parts.push(`a.entity IN (${group.entities.map((e) => `'${e}'`).join(',')})`);
    if (group.actions) parts.push(`a.action IN (${group.actions.map((e) => `'${e}'`).join(',')})`);
    // Usuarios: solo lo que toca a usuarios; accesos y descargas por accion.
    where.push(query.group === 'users' ? `a.entity = 'user' AND a.action NOT IN ('login','login-failed','logout','preview')` : `(${parts.join(' OR ')})`);
  }
  if (query.from) {
    where.push('a.at >= @from');
    params.from = `${query.from} 00:00:00`;
  }
  if (query.to) {
    where.push('a.at <= @to');
    params.to = `${query.to} 23:59:59`;
  }
  if (query.q) {
    where.push(`(a.label LIKE @q OR a.detail LIKE @q OR u.name LIKE @q OR a.ip LIKE @q)`);
    params.q = `%${query.q.replace(/[%_]/g, '')}%`;
  }
  const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
  const rows = db
    .prepare(
      `SELECT a.id, a.at, a.user_id, u.name AS user_name, a.action, a.entity, a.entity_id, a.detail, a.ip, a.device, a.label
         FROM audit a LEFT JOIN users u ON u.id = a.user_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY a.id DESC LIMIT ${limit + 1}`
    )
    .all(params) as any[];
  const more = rows.length > limit;
  return {
    entries: rows.slice(0, limit).map((r) => {
      let detail: any = null;
      try {
        detail = r.detail ? JSON.parse(r.detail) : null;
      } catch {
        detail = { raw: r.detail };
      }
      return {
        id: r.id,
        at: r.at,
        userId: r.user_id,
        userName: r.user_name,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        label: r.label ?? legacyLabel(db, r.entity, r.entity_id, detail),
        ip: r.ip,
        device: r.device,
        changes: (detail?.changes ?? null) as Change[] | null,
        extra: detail ? Object.fromEntries(Object.entries(detail).filter(([k]) => k !== 'changes')) : null,
      };
    }),
    more,
  };
}

/** Movimientos anteriores a esta version (sin nombre guardado): se nombran con lo que hay hoy. */
function legacyLabel(db: DB, entity: string, id: number | null, detail: any): string | null {
  const name = (sql: string) => (id == null ? undefined : (db.prepare(sql).get(id) as { n: string } | undefined)?.n);
  switch (entity) {
    case 'sale': {
      const client = name('SELECT c.name AS n FROM sales s JOIN clients c ON c.id = s.client_id WHERE s.id = ?');
      return id == null ? 'varias ventas' : client ? `la venta de ${client} (#${id})` : `la venta #${id}`;
    }
    case 'client': {
      const n = name('SELECT name AS n FROM clients WHERE id = ?') ?? detail?.name;
      return n ? `al cliente ${n}` : `al cliente #${id}`;
    }
    case 'service': {
      const client = name('SELECT c.name AS n FROM services v JOIN clients c ON c.id = v.client_id WHERE v.id = ?');
      return client ? `el servicio de ${client} (#${id})` : `el servicio #${id}`;
    }
    case 'user':
      return name('SELECT name AS n FROM users WHERE id = ?') ?? null;
    case 'person':
      return name('SELECT name AS n FROM people WHERE id = ?') ?? null;
    case 'payable-account':
      return `la cuenta ${name('SELECT name AS n FROM payable_accounts WHERE id = ?') ?? `#${id}`}`;
    case 'payable':
      return `el gasto ${name('SELECT description AS n FROM payables WHERE id = ?') ?? `#${id}`}`;
    case 'inventory-item':
      return `el producto ${name('SELECT name AS n FROM inventory_items WHERE id = ?') ?? `#${id}`}`;
    default:
      return id != null ? `#${id}` : null;
  }
}

/** Resumen para la cabecera: hoy, borrados y accesos fallidos recientes. */
export function auditStats(db: DB) {
  const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    today: count(`SELECT COUNT(*) AS n FROM audit WHERE at >= datetime('now', '-1 day') AND action NOT IN ('login','logout','preview')`),
    deletes7: count(`SELECT COUNT(*) AS n FROM audit WHERE at >= datetime('now', '-7 days') AND action = 'delete'`),
    failed7: count(`SELECT COUNT(*) AS n FROM audit WHERE at >= datetime('now', '-7 days') AND action = 'login-failed'`),
    logins7: count(`SELECT COUNT(*) AS n FROM audit WHERE at >= datetime('now', '-7 days') AND action = 'login'`),
  };
}
