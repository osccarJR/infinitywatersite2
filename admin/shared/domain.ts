/**
 * Modelo del negocio, compartido por el servidor y la app.
 *
 * Todo el dinero va en CENTAVOS enteros (nunca decimales) para que las sumas
 * cuadren al centavo. La app convierte a dolares solo para mostrar.
 *
 * Una venta puede estar incompleta a proposito: al "ponerse al dia" con
 * clientes antiguos se registra lo que se sabe y el sistema marca lo que
 * falta (ver `saleMissing`).
 */

export type WaterSource = 'city' | 'well';
export type PaymentMethod = 'financed' | 'cash';
export type RoType = 'five_stage' | 'box';
export type ServiceKind = 'problem' | 'maintenance' | 'filters' | 'other';
export type ServiceStatus = 'open' | 'closed';
export type ServiceBilling = 'warranty' | 'charged';
/** Como pago el cliente un servicio tecnico. */
export type ServicePayment = 'zelle' | 'transfer' | 'card' | 'cash' | 'check';
export type SaleStatus = 'active' | 'cancelled' | 'declined' | 'uninstalled';
export type ClientSource = 'referral' | 'door' | 'google' | 'social' | 'event' | 'website' | 'other';

/* ------------------------------------------------------------------ */
/* Entidades (tal como las devuelve la API)                             */
/* ------------------------------------------------------------------ */

export interface User {
  id: number;
  username: string;
  name: string;
  /** admin: todo (incluidos usuarios y respaldo). member: lo que digan sus permisos. */
  role: 'admin' | 'member';
  active: boolean;
  lastLoginAt: string | null;
  /** Ya resueltos: para un administrador, todo permitido. */
  permissions: Permissions;
}

/* ------------------------------------------------------------------ */
/* Permisos                                                             */
/* ------------------------------------------------------------------ */

/** none: no ve la seccion. view: la ve sin poder cambiar nada. edit: ve y registra/edita. */
export type AccessLevel = 'none' | 'view' | 'edit';
/**
 * Que montos ve:
 *  - none: ningun dinero.
 *  - prices: lo que paga el cliente (valor de la venta, abono, cobro de servicio).
 *  - all: todo, incluidas ganancias, costos, comisiones y lo que pago la financiera.
 */
export type MoneyAccess = 'none' | 'prices' | 'all';

export interface Permissions {
  admin: boolean;
  /**
   * all: todo el negocio. own: solo lo suyo (las ventas que vendio o instalo,
   * los servicios que atendio y lo que el mismo registro), segun `personId`.
   */
  scope: 'all' | 'own';
  /** Persona del equipo que es este usuario (para "solo lo suyo"). */
  personId: number | null;
  clients: 'view' | 'edit';
  sales: AccessLevel;
  services: AccessLevel;
  money: MoneyAccess;
  /** Pagos: comisiones, tecnicos, financieras. Requiere ver todos los montos. */
  payments: AccessLevel;
  /** Cuentas por pagar (tarjetas, proveedores, prestamos). Requiere ver todos los montos. */
  payables: AccessLevel;
  /** Inventario de equipos y repuestos. Los costos solo con todos los montos. */
  inventory: AccessLevel;
  /** Pantalla de reportes (siempre con lo que el usuario puede ver). */
  reports: boolean;
  /** Descargar a Excel lo que puede ver. */
  export: boolean;
  /** Borrar clientes, ventas y servicios. */
  delete: boolean;
  /** Editar equipo, financieras, proveedores y marcas en Ajustes. */
  catalogs: boolean;
}

export const ADMIN_PERMISSIONS: Permissions = {
  admin: true,
  scope: 'all',
  personId: null,
  clients: 'edit',
  sales: 'edit',
  services: 'edit',
  money: 'all',
  payments: 'edit',
  payables: 'edit',
  inventory: 'edit',
  reports: true,
  export: true,
  delete: true,
  catalogs: true,
};

/** Perfiles listos para elegir; despues se ajusta lo que haga falta. */
export const PERMISSION_PRESETS = [
  {
    key: 'seller',
    label: 'Vendedor',
    text: 'Solo sus clientes y sus ventas, con el precio y su comisión. No ve ganancias ni lo de los demás.',
    permissions: { admin: false, scope: 'own', clients: 'edit', sales: 'edit', services: 'view', money: 'prices', payments: 'none', payables: 'none', inventory: 'none', reports: false, export: false, delete: false, catalogs: false },
  },
  {
    key: 'technician',
    label: 'Técnico',
    text: 'Sus instalaciones y sus servicios, con la dirección y el equipo, y el inventario. Sin dinero.',
    permissions: { admin: false, scope: 'own', clients: 'view', sales: 'view', services: 'edit', money: 'none', payments: 'none', payables: 'none', inventory: 'edit', reports: false, export: false, delete: false, catalogs: false },
  },
  {
    key: 'office',
    label: 'Oficina',
    text: 'Registra clientes, ventas y servicios de todos, con precios. No ve ganancias, costos ni pagos.',
    permissions: { admin: false, scope: 'all', clients: 'edit', sales: 'edit', services: 'edit', money: 'prices', payments: 'none', payables: 'none', inventory: 'edit', reports: true, export: false, delete: false, catalogs: true },
  },
  {
    key: 'accountant',
    label: 'Contador',
    text: 'Ve todo el negocio con todos los montos, reportes y Excel. No puede cambiar nada.',
    permissions: { admin: false, scope: 'all', clients: 'view', sales: 'view', services: 'view', money: 'all', payments: 'view', payables: 'view', inventory: 'view', reports: true, export: true, delete: false, catalogs: false },
  },
] as const satisfies readonly { key: string; label: string; text: string; permissions: Omit<Permissions, 'personId'> }[];

const LEVELS = ['none', 'view', 'edit'] as const;
const pick = <T extends string>(value: unknown, options: readonly T[], fallback: T): T => (options.includes(value as T) ? (value as T) : fallback);

/**
 * Permisos coherentes a partir de lo guardado (o de lo que llega de la app).
 * Lo que no tiene sentido se corrige aqui, en un solo lugar, para el
 * servidor y la app por igual: pagos sin ver todos los montos, etc.
 */
export function normalizePermissions(raw: Partial<Permissions> | null | undefined, admin: boolean): Permissions {
  if (admin) return ADMIN_PERMISSIONS;
  const r = raw ?? {};
  const money = pick(r.money, ['none', 'prices', 'all'] as const, 'none');
  const sales = pick(r.sales, LEVELS, 'view');
  const services = pick(r.services, LEVELS, 'view');
  const personId = typeof r.personId === 'number' && Number.isInteger(r.personId) && r.personId > 0 ? r.personId : null;
  return {
    admin: false,
    scope: pick(r.scope, ['all', 'own'] as const, 'own'),
    personId,
    clients: pick(r.clients, ['view', 'edit'] as const, 'view'),
    sales,
    services,
    money,
    payments: money === 'all' ? pick(r.payments, LEVELS, 'none') : 'none',
    payables: money === 'all' ? pick(r.payables, LEVELS, 'none') : 'none',
    inventory: pick(r.inventory, LEVELS, 'none'),
    reports: Boolean(r.reports),
    export: Boolean(r.export),
    delete: Boolean(r.delete) && (sales === 'edit' || services === 'edit' || r.clients === 'edit'),
    catalogs: Boolean(r.catalogs),
  };
}

/** Perfil que coincide con estos permisos (o null si es personalizado). */
export function presetOf(p: Permissions): string | null {
  if (p.admin) return 'admin';
  const found = PERMISSION_PRESETS.find((preset) =>
    (Object.keys(preset.permissions) as (keyof typeof preset.permissions)[]).every((key) => preset.permissions[key] === p[key])
  );
  return found?.key ?? null;
}

/** Resumen corto para la lista de usuarios ("Vendedor · solo lo suyo"). */
export function permissionsSummary(p: Permissions): string {
  if (p.admin) return 'Administrador · todo';
  const preset = PERMISSION_PRESETS.find((x) => x.key === presetOf(p));
  const scope = p.scope === 'own' ? 'solo lo suyo' : 'todo el negocio';
  const money = p.money === 'all' ? 'todos los montos' : p.money === 'prices' ? 'solo precios' : 'sin montos';
  return `${preset?.label ?? 'Personalizado'} · ${scope} · ${money}`;
}

/** Persona del equipo: puede vender, instalar o ambas cosas. */
export interface Person {
  id: number;
  name: string;
  phone: string | null;
  isSeller: boolean;
  isInstaller: boolean;
  active: boolean;
}

/** Financiera o proveedor: solo nombre. */
export interface CatalogItem {
  id: number;
  name: string;
  active: boolean;
}

export interface Client {
  id: number;
  name: string;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  /** Estado de EE. UU. en dos letras (FL, GA...). */
  state: string | null;
  zip: string | null;
  language: 'es' | 'en' | null;
  source: ClientSource | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Lo que se instalo. Generico a proposito: no hay marcas. */
export interface Equipment {
  /** Filtros (tanques) fuera de casa: 0 = ninguno. */
  outdoorTanks: number;
  aerator: boolean;
  /** Osmosis inversa de toda la casa: numero de membranas (0 = no tiene). */
  wholeHouseRo: number;
  /** Osmosis inversa dentro de la cocina. */
  ro: boolean;
  roType: RoType | null;
  roUv: boolean;
  other: string | null;
}

export interface SaleSupplier {
  supplierId: number;
  /** Lo que se le pago a ese proveedor por esta venta (opcional). */
  cost: number | null;
}

export interface Sale {
  id: number;
  clientId: number;
  /** Marca con la que se instalo (Infinity Water, Magic Water...). */
  brandId: number | null;
  /** Solo las activas suman en totales, cobros y comisiones. */
  status: SaleStatus;
  saleDate: string;
  installDate: string | null;
  installerId: number | null;
  /** null = se instalo en la direccion del cliente. */
  installAddress: string | null;
  installCity: string | null;
  installStateCode: string | null;
  installZip: string | null;
  waterSource: WaterSource | null;
  equipment: Equipment;
  price: number | null;
  paymentMethod: PaymentMethod | null;
  financierId: number | null;
  /** Financiado: abono en cash del cliente. Cash: lo cobrado al cliente. */
  cashDown: number | null;
  /** Lo que la financiera nos pago (o nos va a pagar). */
  fundedAmount: number | null;
  fundedPaid: boolean;
  fundedDate: string | null;
  sellerId: number | null;
  commission: number | null;
  commissionPaid: boolean;
  commissionPaidDate: string | null;
  installerPay: number | null;
  /** Ya se le pago al tecnico por esta instalacion. */
  installerPaid: boolean;
  installerPaidDate: string | null;
  nextServiceDate: string | null;
  notes: string | null;
  /** Registrada al ponerse al dia (venta anterior al sistema). */
  isLegacy: boolean;
  suppliers: SaleSupplier[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Service {
  id: number;
  clientId: number;
  saleId: number | null;
  reportedDate: string;
  kind: ServiceKind;
  problem: string;
  solution: string | null;
  technicianId: number | null;
  visitDate: string | null;
  status: ServiceStatus;
  closedDate: string | null;
  billing: ServiceBilling | null;
  /** Lo que se le cobro al cliente (si no fue garantia). */
  amount: number | null;
  /** Como pago el cliente; null = todavia no paga. */
  paymentMethod: ServicePayment | null;
  /** Lo que se le paga al tecnico por este servicio. */
  technicianPay: number | null;
  technicianPaid: boolean;
  technicianPaidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

/* ------------------------------------------------------------------ */
/* Cuentas por pagar                                                    */
/* ------------------------------------------------------------------ */

export type PayableAccountKind = 'card' | 'supplier' | 'loan' | 'person' | 'other';

/** A quien se le debe: una tarjeta (Visa, Mastercard, la personal de alguien), un proveedor, un prestamo... */
export interface PayableAccount {
  id: number;
  name: string;
  kind: PayableAccountKind;
  /** Ultimos 4 digitos de la tarjeta (opcional). */
  last4: string | null;
  /** Dia del mes en que vence el pago (tarjetas y prestamos). */
  dueDay: number | null;
  /** Cupo de la tarjeta o monto del prestamo. */
  creditLimit: number | null;
  notes: string | null;
  active: boolean;
}

export type ExpenseCategory = 'equipment' | 'materials' | 'fuel' | 'vehicle' | 'marketing' | 'office' | 'payroll' | 'other';

/** Un cargo o factura: lo que se debe. */
export interface Payable {
  id: number;
  accountId: number;
  date: string;
  description: string;
  category: ExpenseCategory | null;
  amount: number;
  /** Fecha limite para pagar este cargo (opcional). */
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

/** Un pago o abono a una cuenta. Si va a un cargo concreto, `payableId`. */
export interface PayablePayment {
  id: number;
  accountId: number;
  payableId: number | null;
  date: string;
  amount: number;
  method: ServicePayment | null;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
}

export const PAYABLE_KIND_LABEL: Record<PayableAccountKind, string> = {
  card: 'Tarjeta de crédito',
  supplier: 'Proveedor',
  loan: 'Préstamo',
  person: 'Persona',
  other: 'Otro',
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  equipment: 'Equipos',
  materials: 'Materiales y repuestos',
  fuel: 'Gasolina',
  vehicle: 'Vehículo',
  marketing: 'Publicidad',
  office: 'Oficina',
  payroll: 'Sueldos',
  other: 'Otro',
};

/* ------------------------------------------------------------------ */
/* Inventario                                                           */
/* ------------------------------------------------------------------ */

export type InventoryCategory = 'tank' | 'membrane' | 'filter' | 'media' | 'aerator' | 'uv' | 'part' | 'other';

export interface InventoryItem {
  id: number;
  name: string;
  category: InventoryCategory;
  /** Codigo o referencia del proveedor (opcional). */
  sku: string | null;
  /** Costo por unidad (null si no se sabe o el usuario no ve costos). */
  cost: number | null;
  /** Con esta cantidad o menos, avisa que hay que comprar. */
  minStock: number;
  notes: string | null;
  active: boolean;
}

/** in: entra (compra). out: sale (instalacion, servicio). adjust: conteo fisico (+/-). */
export type MovementKind = 'in' | 'out' | 'adjust';

export interface InventoryMovement {
  id: number;
  itemId: number;
  date: string;
  kind: MovementKind;
  /** Siempre positivo en in/out; con signo en adjust. */
  quantity: number;
  unitCost: number | null;
  supplierId: number | null;
  saleId: number | null;
  serviceId: number | null;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
}

export const INVENTORY_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  tank: 'Tanques',
  membrane: 'Membranas',
  filter: 'Filtros y cartuchos',
  media: 'Medios (resina, carbón)',
  aerator: 'Aireadores',
  uv: 'Luces UV',
  part: 'Repuestos y accesorios',
  other: 'Otro',
};

/** Efecto de un movimiento en la existencia. */
export const movementDelta = (m: Pick<InventoryMovement, 'kind' | 'quantity'>) => (m.kind === 'out' ? -m.quantity : m.quantity);

/** Todo lo que la app necesita, en una sola respuesta. */
export interface Bootstrap {
  me: User;
  /** Vista previa: el administrador que esta viendo el sistema como `me`. */
  viewer: User | null;
  /** Funciones que dependen de la configuracion del servidor. */
  features: { places: boolean };
  clients: Client[];
  sales: Sale[];
  services: Service[];
  people: Person[];
  financiers: CatalogItem[];
  suppliers: CatalogItem[];
  brands: CatalogItem[];
  payableAccounts: PayableAccount[];
  payables: Payable[];
  payablePayments: PayablePayment[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
}

/* ------------------------------------------------------------------ */
/* Etiquetas                                                            */
/* ------------------------------------------------------------------ */

export const SERVICE_PAYMENT_LABEL: Record<ServicePayment, string> = {
  zelle: 'Zelle',
  transfer: 'Transferencia',
  card: 'Tarjeta (Stripe)',
  cash: 'Cash',
  check: 'Cheque',
};

/** Numeros de un servicio: lo cobrado, lo del tecnico y lo que queda. */
export function serviceMoney(v: Pick<Service, 'billing' | 'amount' | 'technicianPay' | 'paymentMethod'>) {
  const charged = v.billing === 'charged' ? v.amount ?? 0 : 0;
  const technician = v.technicianPay ?? 0;
  return {
    charged,
    technician,
    profit: charged - technician,
    /** Se cobro pero el cliente aun no paga (sin medio de pago). */
    pendingClient: v.billing === 'charged' && !v.paymentMethod ? charged : 0,
  };
}

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  active: 'Activa',
  cancelled: 'Cancelada',
  declined: 'Declinada',
  uninstalled: 'Desinstalada',
};

/** Una venta cancelada, declinada o desinstalada no suma en nada. */
export const isActiveSale = (s: Pick<Sale, 'status'>) => (s.status ?? 'active') === 'active';

export const WATER_LABEL: Record<WaterSource, string> = { city: 'Ciudad', well: 'Pozo' };
export const RO_TYPE_LABEL: Record<RoType, string> = { five_stage: '5 pasos', box: 'En caja' };
export const SERVICE_KIND_LABEL: Record<ServiceKind, string> = {
  problem: 'Problema',
  maintenance: 'Mantenimiento',
  filters: 'Cambio de filtros',
  other: 'Otro',
};
export const SOURCE_LABEL: Record<ClientSource, string> = {
  referral: 'Referido',
  door: 'Puerta a puerta',
  google: 'Google',
  social: 'Facebook / Instagram',
  event: 'Feria o evento',
  website: 'Página web',
  other: 'Otro',
};

export const OUTDOOR_TANK_OPTIONS = [0, 1, 2, 3, 4] as const;

export const EMPTY_EQUIPMENT: Equipment = {
  outdoorTanks: 0,
  aerator: false,
  wholeHouseRo: 0,
  ro: false,
  roType: null,
  roUv: false,
  other: null,
};

export function hasEquipment(e: Equipment) {
  return e.outdoorTanks > 0 || e.aerator || (e.wholeHouseRo ?? 0) > 0 || e.ro || Boolean(e.other?.trim());
}

/** "2 filtros fuera de casa + aireador · Ósmosis de toda la casa (2 membranas) · Ósmosis de cocina de 5 pasos con UV" */
export function equipmentSummary(e: Equipment): string {
  const parts: string[] = [];
  if (e.outdoorTanks > 0) {
    parts.push(`${e.outdoorTanks} ${e.outdoorTanks === 1 ? 'filtro' : 'filtros'} fuera de casa${e.aerator ? ' + aireador' : ''}`);
  } else if (e.aerator) {
    parts.push('Aireador');
  }
  const whole = e.wholeHouseRo ?? 0;
  if (whole > 0) parts.push(`Ósmosis de toda la casa (${whole} ${whole === 1 ? 'membrana' : 'membranas'})`);
  if (e.ro) {
    const type = e.roType === 'five_stage' ? ' de 5 pasos' : e.roType === 'box' ? ' en caja' : '';
    parts.push(`Ósmosis de cocina${type} ${e.roUv ? 'con UV' : 'sin UV'}`);
  }
  if (e.other?.trim()) parts.push(e.other.trim());
  return parts.join(' · ') || 'Sin equipo registrado';
}

/* ------------------------------------------------------------------ */
/* Dinero                                                               */
/* ------------------------------------------------------------------ */

export type SaleMoneyInput = Pick<
  Sale,
  'price' | 'paymentMethod' | 'cashDown' | 'fundedAmount' | 'fundedPaid' | 'commission' | 'installerPay'
> & { suppliers: { cost: number | null }[] };

export interface SaleMoney {
  price: number;
  financed: boolean;
  /** Abono del cliente (financiado) o lo cobrado (cash). */
  cashDown: number;
  /** Lo que se mando a financiar: precio - abono. */
  financedAmount: number;
  /** Lo que paga la financiera; null si aun no se sabe. */
  funded: number | null;
  /** Lo que se queda la financiera: financiado - pagado. */
  financierFee: number | null;
  /** Lo que entra al negocio por esta venta (real o esperado). */
  income: number;
  /** Lo que ya entro. */
  received: number;
  pendingFinancier: number;
  pendingClient: number;
  supplierCost: number;
  commission: number;
  installerPay: number;
  costs: number;
  profit: number;
  /**
   * La ganancia es estimada: falta el precio, la forma de pago, el pago real
   * de la financiera o los costos de proveedores (sin costos, la "ganancia"
   * seria toda la venta y engañaria).
   */
  estimate: boolean;
  /** No se registro ningun costo de proveedor. */
  noCosts: boolean;
}

export function saleMoney(s: SaleMoneyInput): SaleMoney {
  const price = s.price ?? 0;
  const financed = s.paymentMethod === 'financed';
  const cash = s.paymentMethod === 'cash';
  const cashDown = s.cashDown ?? 0;
  const financedAmount = financed ? Math.max(price - cashDown, 0) : 0;
  const funded = financed ? s.fundedAmount : null;
  const financierFee = financed && funded != null ? financedAmount - funded : null;
  const fromFinancier = financed ? funded ?? financedAmount : 0;

  // Sin forma de pago (venta antigua a medio completar) se toma el precio.
  const income = financed ? cashDown + fromFinancier : cash ? price : price;
  const received = cashDown + (financed && s.fundedPaid ? fromFinancier : 0);
  const pendingFinancier = financed && !s.fundedPaid ? fromFinancier : 0;
  const pendingClient = cash ? Math.max(price - cashDown, 0) : 0;

  const supplierCost = s.suppliers.reduce((sum, row) => sum + (row.cost ?? 0), 0);
  const commission = s.commission ?? 0;
  const installerPay = s.installerPay ?? 0;
  const costs = supplierCost + commission + installerPay;

  return {
    price,
    financed,
    cashDown,
    financedAmount,
    funded,
    financierFee,
    income,
    received,
    pendingFinancier,
    pendingClient,
    supplierCost,
    commission,
    installerPay,
    costs,
    profit: income - costs,
    estimate: s.price == null || s.paymentMethod == null || (financed && s.fundedAmount == null) || s.suppliers.length === 0,
    noCosts: s.suppliers.length === 0,
  };
}

/* ------------------------------------------------------------------ */
/* Estado de una venta                                                  */
/* ------------------------------------------------------------------ */

export type InstallState = 'pending' | 'scheduled' | 'done';

export function installState(sale: Pick<Sale, 'installDate' | 'isLegacy'> & { status?: SaleStatus }, today: string): InstallState {
  if (sale.status && sale.status !== 'active') return 'done';
  // Una venta anterior al sistema ya esta instalada aunque no se sepa la fecha.
  if (!sale.installDate) return sale.isLegacy ? 'done' : 'pending';
  return sale.installDate > today ? 'scheduled' : 'done';
}

/** Datos que faltan para que la venta este completa. */
export function saleMissing(s: Sale): string[] {
  const missing: string[] = [];
  if (!isActiveSale(s)) return missing; // no se piden datos de una venta que no siguio
  if (!hasEquipment(s.equipment)) missing.push('Equipo instalado');
  if (!s.waterSource) missing.push('Ciudad o pozo');
  if (s.price == null) missing.push('Valor de la venta');
  if (!s.paymentMethod) missing.push('Forma de pago');
  if (s.paymentMethod === 'financed') {
    if (!s.financierId) missing.push('Financiera');
    if (s.fundedAmount == null) missing.push('Lo que pagó la financiera');
  }
  if (!s.sellerId) missing.push('Vendedor');
  if (s.sellerId && s.commission == null) missing.push('Comisión');
  if (s.installDate && !s.installerId) missing.push('Técnico que instaló');
  if (s.suppliers.length === 0) missing.push('Proveedores');
  return missing;
}

/* ------------------------------------------------------------------ */
/* Fechas (siempre YYYY-MM-DD, hora local de Florida)                   */
/* ------------------------------------------------------------------ */

export const TIME_ZONE = 'America/New_York';

export function todayISO(date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

export function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "123 Main St, Cape Coral, FL 33990" */
export function formatAddress(parts: { address?: string | null; city?: string | null; state?: string | null; zip?: string | null }) {
  const region = [parts.state, parts.zip].filter(Boolean).join(' ');
  return [parts.address, parts.city, region].filter(Boolean).join(', ');
}

/** Texto sin tildes ni mayusculas, para buscar. */
export function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
