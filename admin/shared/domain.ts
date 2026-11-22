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
export type ClientSource = 'referral' | 'door' | 'google' | 'social' | 'event' | 'website' | 'other';

/* ------------------------------------------------------------------ */
/* Entidades (tal como las devuelve la API)                             */
/* ------------------------------------------------------------------ */

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin';
  active: boolean;
  lastLoginAt: string | null;
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

/** Todo lo que la app necesita, en una sola respuesta. */
export interface Bootstrap {
  me: User;
  /** Funciones que dependen de la configuracion del servidor. */
  features: { places: boolean };
  clients: Client[];
  sales: Sale[];
  services: Service[];
  people: Person[];
  financiers: CatalogItem[];
  suppliers: CatalogItem[];
}

/* ------------------------------------------------------------------ */
/* Etiquetas                                                            */
/* ------------------------------------------------------------------ */

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

export function installState(sale: Pick<Sale, 'installDate' | 'isLegacy'>, today: string): InstallState {
  // Una venta anterior al sistema ya esta instalada aunque no se sepa la fecha.
  if (!sale.installDate) return sale.isLegacy ? 'done' : 'pending';
  return sale.installDate > today ? 'scheduled' : 'done';
}

/** Datos que faltan para que la venta este completa. */
export function saleMissing(s: Sale): string[] {
  const missing: string[] = [];
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
