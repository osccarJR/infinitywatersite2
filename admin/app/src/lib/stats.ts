/**
 * Numeros del negocio para el inicio y los listados. Todo se calcula en el
 * navegador a partir de las ventas: con `saleMoney` como unica formula.
 */
import { addDaysISO, addMonthsISO, installState, saleMissing, saleMoney, type Sale, type Service } from '../../../shared/domain.ts';

export type PeriodKey = 'month' | 'last_month' | 'year' | 'all';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: 'Este mes' },
  { key: 'last_month', label: 'Mes pasado' },
  { key: 'year', label: 'Este año' },
  { key: 'all', label: 'Todo' },
];

export interface Range {
  from: string | null;
  to: string | null;
}

export function periodRange(key: PeriodKey, today: string): Range {
  const monthStart = today.slice(0, 8) + '01';
  if (key === 'month') return { from: monthStart, to: addDaysISO(addMonthsISO(monthStart, 1), -1) };
  if (key === 'last_month') {
    const start = addMonthsISO(monthStart, -1);
    return { from: start, to: addDaysISO(monthStart, -1) };
  }
  if (key === 'year') return { from: today.slice(0, 4) + '-01-01', to: today.slice(0, 4) + '-12-31' };
  return { from: null, to: null };
}

export const inRange = (iso: string | null, range: Range) =>
  Boolean(iso) && (!range.from || iso! >= range.from) && (!range.to || iso! <= range.to);

export interface Totals {
  count: number;
  sold: number;
  income: number;
  received: number;
  profit: number;
  costs: number;
  commission: number;
  financierFee: number;
  estimates: number;
  /** Lo esperado solo de ventas con forma de pago registrada. */
  knownIncome: number;
  /** Ventas sin forma de pago (antiguas a medio completar). */
  unknownPayment: number;
}

export function totals(sales: Sale[]): Totals {
  const t: Totals = { count: 0, sold: 0, income: 0, received: 0, profit: 0, costs: 0, commission: 0, financierFee: 0, estimates: 0, knownIncome: 0, unknownPayment: 0 };
  for (const sale of sales) {
    const m = saleMoney(sale);
    t.count++;
    t.sold += m.price;
    t.income += m.income;
    t.received += m.received;
    t.profit += m.profit;
    t.costs += m.costs;
    t.commission += m.commission;
    t.financierFee += m.financierFee ?? 0;
    if (m.estimate) t.estimates++;
    if (sale.paymentMethod) t.knownIncome += m.income;
    else t.unknownPayment++;
  }
  return t;
}

/* ------------------------------------------------------------------ */
/* Estado de cada venta (filtros y avisos)                              */
/* ------------------------------------------------------------------ */

export type SaleFilter = 'all' | 'to_install' | 'to_collect' | 'commission' | 'incomplete';

export const SALE_FILTERS: { key: SaleFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'to_install', label: 'Por instalar' },
  { key: 'to_collect', label: 'Por cobrar' },
  { key: 'commission', label: 'Comisión pendiente' },
  { key: 'incomplete', label: 'Por completar' },
];

export function saleMatches(sale: Sale, filter: SaleFilter, today: string): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'to_install':
      return installState(sale, today) !== 'done';
    case 'to_collect': {
      const m = saleMoney(sale);
      return m.pendingFinancier > 0 || m.pendingClient > 0;
    }
    case 'commission':
      return (sale.commission ?? 0) > 0 && !sale.commissionPaid;
    case 'incomplete':
      return saleMissing(sale).length > 0;
  }
}

/* ------------------------------------------------------------------ */
/* Panel de inicio                                                      */
/* ------------------------------------------------------------------ */

/** Lo pendiente no depende del periodo: es lo que hay hoy. */
export function pending(sales: Sale[], services: Service[], today: string) {
  let fromFinanciers = 0;
  let fromClients = 0;
  let commissionsOwed = 0;
  const toCollect: Sale[] = [];
  const commissionSales: Sale[] = [];
  for (const sale of sales) {
    const m = saleMoney(sale);
    fromFinanciers += m.pendingFinancier;
    fromClients += m.pendingClient;
    if (m.pendingFinancier > 0 || m.pendingClient > 0) toCollect.push(sale);
    if ((sale.commission ?? 0) > 0 && !sale.commissionPaid) {
      commissionsOwed += sale.commission!;
      commissionSales.push(sale);
    }
  }
  const soon = addDaysISO(today, 30);
  const maintenance = sales
    .filter((s) => s.nextServiceDate && s.nextServiceDate <= soon)
    .sort((a, b) => a.nextServiceDate!.localeCompare(b.nextServiceDate!));
  const toInstall = sales
    .filter((s) => installState(s, today) !== 'done')
    .sort((a, b) => (a.installDate ?? '9999').localeCompare(b.installDate ?? '9999'));
  const openServices = services.filter((s) => s.status === 'open');
  const incomplete = sales.filter((s) => saleMissing(s).length > 0);

  return {
    fromFinanciers,
    fromClients,
    commissionsOwed,
    toCollect,
    commissionSales,
    maintenance,
    toInstall,
    openServices,
    incomplete,
  };
}

/** Ultimos 12 meses: vendido y ganancia por mes. */
export function monthly(sales: Sale[], today: string, months = 12) {
  const start = addMonthsISO(today.slice(0, 8) + '01', -(months - 1));
  const buckets = Array.from({ length: months }, (_, i) => ({
    month: addMonthsISO(start, i),
    sold: 0,
    profit: 0,
    count: 0,
  }));
  const index = new Map(buckets.map((b, i) => [b.month.slice(0, 7), i]));
  for (const sale of sales) {
    const i = index.get(sale.saleDate.slice(0, 7));
    if (i == null) continue;
    const m = saleMoney(sale);
    buckets[i].sold += m.price;
    buckets[i].profit += m.profit;
    buckets[i].count++;
  }
  return buckets;
}

export function bySeller(sales: Sale[]) {
  const map = new Map<number | null, { id: number | null; count: number; sold: number; commission: number; owed: number }>();
  for (const sale of sales) {
    const row = map.get(sale.sellerId) ?? { id: sale.sellerId, count: 0, sold: 0, commission: 0, owed: 0 };
    row.count++;
    row.sold += sale.price ?? 0;
    row.commission += sale.commission ?? 0;
    if (!sale.commissionPaid) row.owed += sale.commission ?? 0;
    map.set(sale.sellerId, row);
  }
  return [...map.values()].sort((a, b) => b.sold - a.sold);
}

export function byFinancier(sales: Sale[]) {
  const map = new Map<number | null, { id: number | null; count: number; financed: number; funded: number; fee: number; feeKnown: number }>();
  for (const sale of sales) {
    if (sale.paymentMethod !== 'financed') continue;
    const m = saleMoney(sale);
    const row = map.get(sale.financierId) ?? { id: sale.financierId, count: 0, financed: 0, funded: 0, fee: 0, feeKnown: 0 };
    row.count++;
    row.financed += m.financedAmount;
    if (m.funded != null) {
      row.funded += m.funded;
      row.fee += m.financierFee ?? 0;
      row.feeKnown += m.financedAmount;
    }
    map.set(sale.financierId, row);
  }
  return [...map.values()].sort((a, b) => b.financed - a.financed);
}

export function serviceTotals(services: Service[]) {
  let warranty = 0;
  let charged = 0;
  let chargedAmount = 0;
  for (const service of services) {
    if (service.billing === 'warranty') warranty++;
    if (service.billing === 'charged') {
      charged++;
      chargedAmount += service.amount ?? 0;
    }
  }
  return { count: services.length, warranty, charged, chargedAmount };
}
