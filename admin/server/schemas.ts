/**
 * Validacion de todo lo que entra a la API. Los textos vacios se guardan
 * como null; el dinero llega en centavos enteros.
 */
import { z } from 'zod';

const text = (max = 200) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres`)
    .nullish()
    .transform((v) => (v == null || v.trim() === '' ? null : v.trim()));

const requiredText = (message: string, max = 200) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo ${max} caracteres`);

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida')
  // Fecha que existe de verdad (Date.parse acepta "2026-02-31").
  .refine((v) => {
    const [y, m, d] = v.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d && y >= 2000 && y <= 2100;
  }, 'Fecha no válida');

const optionalDate = date.nullish().transform((v) => v ?? null);

/** Centavos: de 0 a 10 millones de dolares. */
const money = z
  .number({ error: 'Monto no válido' })
  .int('Monto no válido')
  .min(0, 'El monto no puede ser negativo')
  .max(1_000_000_000, 'Monto demasiado alto')
  .nullish()
  .transform((v) => v ?? null);

const id = z.number().int().positive();

/** Telefono: de 7 a 15 digitos (EE. UU. o internacional), con el formato que sea. */
const phone = text(40).refine((v) => v == null || /^\d{7,15}$/.test(v.replace(/\D/g, '')), 'Teléfono no válido: revisa los números');

/** ZIP de EE. UU.: 5 digitos (o ZIP+4). */
const zip = text(12).refine((v) => v == null || /^\d{5}(-?\d{4})?$/.test(v), 'ZIP no válido: son 5 números');

/** Estado de EE. UU.: dos letras, en mayusculas. */
const stateCode = z
  .string()
  .trim()
  .toUpperCase()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v == null || /^[A-Z]{2}$/.test(v), 'El estado va en dos letras, por ejemplo FL');
const optionalId = id.nullish().transform((v) => v ?? null);

export const ClientInput = z.object({
  name: requiredText('Escribe el nombre del cliente', 120),
  phone,
  phone2: phone,
  email: z
    .string()
    .trim()
    .max(160)
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo no válido'),
  address: text(200),
  city: text(80),
  state: stateCode,
  zip,
  language: z.enum(['es', 'en']).nullish().transform((v) => v ?? null),
  source: z
    .enum(['referral', 'door', 'google', 'social', 'event', 'website', 'other'])
    .nullish()
    .transform((v) => v ?? null),
  notes: text(4000),
  expectedUpdatedAt: z.string().max(40).optional(),
});
export type ClientInput = z.infer<typeof ClientInput>;

/** Una venta o un servicio puede crear el cliente en el mismo paso. */
const ClientRef = z.union([z.object({ id }), z.object({ create: ClientInput })], {
  error: 'Elige o crea el cliente',
});

export const EquipmentInput = z.object({
  outdoorTanks: z.number().int().min(0).max(10),
  aerator: z.boolean(),
  wholeHouseRo: z.number().int().min(0, 'Membranas no válidas').max(4, 'Son de 1 a 4 membranas').default(0),
  ro: z.boolean(),
  roType: z.enum(['five_stage', 'box']).nullish().transform((v) => v ?? null),
  roUv: z.boolean(),
  other: text(300),
});

export const SaleInput = z.object({
  client: ClientRef,
  brandId: optionalId,
  status: z.enum(['active', 'cancelled', 'declined', 'uninstalled']).default('active'),
  saleDate: date,
  installDate: optionalDate,
  installTime: text(40),
  installerId: optionalId,
  installAddress: text(200),
  installCity: text(80),
  installStateCode: stateCode,
  installZip: zip,
  waterSource: z.enum(['city', 'well']).nullish().transform((v) => v ?? null),
  equipment: EquipmentInput,
  price: money,
  paymentMethod: z.enum(['financed', 'cash']).nullish().transform((v) => v ?? null),
  financierId: optionalId,
  cashDown: money,
  fundedAmount: money,
  fundedPaid: z.boolean().default(false),
  fundedDate: optionalDate,
  sellerId: optionalId,
  commission: money,
  commissionPaid: z.boolean().default(false),
  commissionPaidDate: optionalDate,
  installerPay: money,
  installerPaid: z.boolean().default(false),
  installerPaidDate: optionalDate,
  nextServiceDate: optionalDate,
  notes: text(4000),
  isLegacy: z.boolean().default(false),
  suppliers: z
    .array(z.object({ supplierId: id, cost: money }))
    .max(20)
    .default([])
    .refine((rows) => new Set(rows.map((r) => r.supplierId)).size === rows.length, 'Un proveedor está repetido'),
  /** updatedAt que vio quien edita: si cambio entretanto, se rechaza (409). */
  expectedUpdatedAt: z.string().max(40).optional(),
})
  .refine((s) => s.price == null || s.cashDown == null || s.cashDown <= s.price, { message: 'El abono no puede ser mayor que el valor de la venta', path: ['cashDown'] })
  .refine((s) => !s.installDate || s.installDate >= s.saleDate, { message: 'La instalación no puede ser antes de la venta', path: ['installDate'] })
  .refine((s) => s.price == null || s.commission == null || s.commission <= s.price, { message: 'La comisión no puede ser mayor que el valor de la venta', path: ['commission'] })
  .refine((s) => s.price == null || s.fundedAmount == null || s.fundedAmount <= s.price, { message: 'Lo que pagó la financiera no puede ser mayor que el valor de la venta', path: ['fundedAmount'] });
export type SaleInput = z.infer<typeof SaleInput>;

const ServiceBase = z.object({
  client: ClientRef,
  saleId: optionalId,
  reportedDate: date,
  kind: z.enum(['problem', 'maintenance', 'filters', 'other']).default('problem'),
  problem: requiredText('Describe el problema o el motivo de la visita', 4000),
  solution: text(4000),
  technicianId: optionalId,
  visitDate: optionalDate,
  status: z.enum(['open', 'closed']).default('open'),
  closedDate: optionalDate,
  billing: z.enum(['warranty', 'charged']).nullish().transform((v) => v ?? null),
  amount: money,
  paymentMethod: z.enum(['zelle', 'transfer', 'card', 'cash', 'check']).nullish().transform((v) => v ?? null),
  technicianPay: money,
  technicianPaid: z.boolean().default(false),
  technicianPaidDate: optionalDate,
  notes: text(4000),
  /** Si viene, se guarda como proximo mantenimiento de la venta enlazada. */
  nextServiceDate: optionalDate.optional(),
  expectedUpdatedAt: z.string().max(40).optional(),
});
const closedAfterReport = (v: { status: string; closedDate: string | null; reportedDate: string }) =>
  v.status !== 'closed' || !v.closedDate || v.closedDate >= v.reportedDate;
export const ServiceInput = ServiceBase
  .refine(closedAfterReport, { message: 'El cierre no puede ser antes del reporte', path: ['closedDate'] })
  .refine((v) => v.billing !== 'charged' || v.amount != null, { message: 'Pon cuánto se le cobró (o marca garantía)', path: ['amount'] });
/** Para quien no ve montos: puede marcar "se cobró" sin poner cuánto (lo completa el administrador). */
export const ServiceInputNoAmount = ServiceBase.refine(closedAfterReport, { message: 'El cierre no puede ser antes del reporte', path: ['closedDate'] });
export type ServiceInput = z.infer<typeof ServiceInput>;

export const PersonInput = z
  .object({
    name: requiredText('Escribe el nombre', 80),
    phone: text(40),
    isSeller: z.boolean(),
    isInstaller: z.boolean(),
    active: z.boolean().default(true),
  })
  .refine((p) => p.isSeller || p.isInstaller, { message: 'Marca si vende, instala o ambas', path: ['isSeller'] });
export type PersonInput = z.infer<typeof PersonInput>;

export const CatalogInput = z.object({
  name: requiredText('Escribe el nombre', 80),
  active: z.boolean().default(true),
});

export const MarkInput = z.object({
  field: z.enum(['fundedPaid', 'commissionPaid']),
  paid: z.boolean(),
  date: optionalDate,
});

/** Pagarle a un tecnico: instalaciones y servicios juntos. */
export const TechPayInput = z.object({
  saleIds: z.array(z.number().int().positive()).max(500).default([]),
  serviceIds: z.array(z.number().int().positive()).max(500).default([]),
  date: optionalDate,
}).refine((v) => v.saleIds.length + v.serviceIds.length > 0, { message: 'Elige al menos un trabajo', path: ['saleIds'] });

/** Marcar varias ventas de una vez (pago de comisiones o de una financiera). */
export const MarkBatchInput = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Elige al menos una venta').max(500),
  field: z.enum(['fundedPaid', 'commissionPaid']),
  paid: z.boolean(),
  date: optionalDate,
});

export const LoginInput = z.object({
  username: z.string().trim().min(1, 'Escribe tu usuario').max(60),
  password: z.string().min(1, 'Escribe tu contraseña').max(200),
});

const newPassword = z.string().min(10, 'La contraseña debe tener al menos 10 caracteres').max(200);

export const PasswordInput = z.object({ current: z.string().min(1).max(200), next: newPassword });

/** Permisos tal como llegan de la app; se completan y corrigen con normalizePermissions. */
export const PermissionsInput = z.object({
  scope: z.enum(['all', 'own']),
  personId: id.nullable(),
  flags: z.record(z.string().max(40), z.boolean()).refine((f) => Object.keys(f).length <= 80, 'Demasiados permisos'),
  payableAccounts: z.array(id).max(200).nullable().default(null),
  profiles: z.array(z.enum(['seller', 'technician', 'office', 'cashier', 'accountant'])).max(5).optional(),
});

export const UserCreateInput = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,40}$/, 'Usuario: de 3 a 40 letras, números, punto o guion'),
  name: requiredText('Escribe el nombre', 80),
  password: newPassword,
  role: z.enum(['admin', 'member']).default('member'),
  permissions: PermissionsInput.optional(),
});

export const UserUpdateInput = z.object({
  name: requiredText('Escribe el nombre', 80).optional(),
  active: z.boolean().optional(),
  password: newPassword.optional(),
  role: z.enum(['admin', 'member']).optional(),
  permissions: PermissionsInput.optional(),
});

/** Garantia: lo que se imprime (equipos con su serial, fecha y representante). */
export const WarrantyInput = z.object({
  issueDate: date,
  representative: requiredText('Escribe el nombre del representante', 80),
  issuedIn: text(120).transform((v) => v ?? ''),
  lines: z
    .array(z.object({ item: requiredText('Escribe el equipo', 120), serial: text(60).transform((v) => v ?? '') }))
    .min(1, 'Agrega al menos un equipo')
    .max(8, 'Máximo 8 equipos'),
});

/* ------------------------- cuentas por pagar ------------------------- */

export const PayableAccountInput = z.object({
  name: requiredText('Escribe el nombre de la cuenta', 80),
  kind: z.enum(['card', 'supplier', 'loan', 'person', 'other']),
  last4: text(4).refine((v) => v == null || /^\d{4}$/.test(v), 'Los últimos 4 dígitos son 4 números'),
  dueDay: z.number().int().min(1, 'Día del 1 al 31').max(31, 'Día del 1 al 31').nullish().transform((v) => v ?? null),
  creditLimit: money,
  notes: text(1000),
  active: z.boolean().default(true),
  color: z.enum(['black', 'silver', 'gold', 'blue', 'navy', 'green', 'teal', 'purple', 'red', 'pink', 'orange']).nullish().transform((v) => v ?? null),
  network: z.enum(['visa', 'mastercard', 'amex', 'discover', 'none']).nullish().transform((v) => v ?? null),
});
export type PayableAccountInput = z.infer<typeof PayableAccountInput>;

const expenseCategory = z.enum(['equipment', 'materials', 'fuel', 'vehicle', 'marketing', 'office', 'payroll', 'other']);

export const PayableInput = z
  .object({
    accountId: id,
    date,
    description: requiredText('Escribe qué se compró o se debe', 200),
    category: expenseCategory.nullish().transform((v) => v ?? null),
    amount: z.number({ error: 'Pon el monto' }).int('Monto no válido').min(1, 'Pon el monto').max(1_000_000_000, 'Monto demasiado alto'),
    dueDate: optionalDate,
    notes: text(2000),
    expectedUpdatedAt: z.string().max(40).optional(),
  })
  .refine((v) => !v.dueDate || v.dueDate >= v.date, { message: 'El vencimiento no puede ser antes de la fecha del gasto', path: ['dueDate'] });
export type PayableInput = z.infer<typeof PayableInput>;

export const PayablePaymentInput = z.object({
  accountId: id,
  payableId: id.nullish().transform((v) => v ?? null),
  date,
  amount: z.number({ error: 'Pon el monto' }).int('Monto no válido').min(1, 'Pon el monto').max(1_000_000_000, 'Monto demasiado alto'),
  method: z.enum(['zelle', 'transfer', 'card', 'cash', 'check']).nullish().transform((v) => v ?? null),
  notes: text(1000),
});
export type PayablePaymentInput = z.infer<typeof PayablePaymentInput>;

/* ----------------------------- inventario ----------------------------- */

const quantity = z.number({ error: 'Pon la cantidad' }).int('La cantidad va en unidades enteras');

export const InventoryItemInput = z.object({
  name: requiredText('Escribe el nombre del producto', 120),
  category: z.enum(['tank', 'membrane', 'filter', 'media', 'aerator', 'uv', 'part', 'other']),
  sku: text(60),
  cost: money,
  minStock: z.number().int().min(0, 'El mínimo no puede ser negativo').max(100000).default(0),
  notes: text(1000),
  active: z.boolean().default(true),
});
export type InventoryItemInput = z.infer<typeof InventoryItemInput>;

export const InventoryMovementInput = z
  .object({
    itemId: id,
    date,
    kind: z.enum(['in', 'out', 'adjust']),
    quantity: quantity.min(-100000).max(100000),
    unitCost: money,
    supplierId: id.nullish().transform((v) => v ?? null),
    saleId: id.nullish().transform((v) => v ?? null),
    serviceId: id.nullish().transform((v) => v ?? null),
    notes: text(1000),
    /** Compra que se le debe al proveedor: se anota la factura en cuentas por pagar. */
    bill: z
      .object({ dueDate: optionalDate, reference: text(80) })
      .nullish()
      .transform((v) => v ?? null),
  })
  .refine((v) => !v.bill || (v.kind === 'in' && v.supplierId != null), { message: 'Para anotar la factura elige el proveedor', path: ['supplierId'] })
  .refine((v) => !v.bill || (v.unitCost != null && v.unitCost > 0), { message: 'Para anotar la factura pon el costo por unidad', path: ['unitCost'] })
  .refine((v) => v.kind === 'adjust' || v.quantity > 0, { message: 'La cantidad debe ser mayor que cero', path: ['quantity'] })
  .refine((v) => v.kind !== 'adjust' || v.quantity !== 0, { message: 'El ajuste no puede ser cero', path: ['quantity'] });
export type InventoryMovementInput = z.infer<typeof InventoryMovementInput>;

/** Mensaje legible y campo del primer error de validacion. */
export function firstIssue(error: z.ZodError): { message: string; field?: string } {
  const issue = error.issues[0];
  const field = issue?.path?.length ? issue.path.join('.') : undefined;
  return { message: issue?.message || 'Datos no válidos', field };
}
