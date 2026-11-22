/**
 * Reportes: cada uno con su tablero (cifras clave, grafica y tabla), para
 * el periodo y los filtros elegidos. Se descargan a Excel o se imprimen /
 * guardan en PDF. Siempre con lo que el usuario puede ver: el servidor ya
 * entrega solo eso, y aqui se esconden los reportes de montos que no ve.
 */
import { useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3,
  Boxes,
  CalendarRange,
  CreditCard,
  Download,
  Droplets,
  Filter,
  HandCoins,
  HardHat,
  Landmark,
  MapPin,
  Printer,
  Tag,
  Users,
  Wrench,
} from 'lucide-react';
import type { PermissionFlag, Sale, Service } from '../../../shared/domain.ts';
import {
  EXPENSE_CATEGORY_LABEL,
  INVENTORY_CATEGORY_LABEL,
  SERVICE_KIND_LABEL,
  SERVICE_PAYMENT_LABEL,
  addMonthsISO,
  isActiveSale,
  movementDelta,
  saleMoney,
  serviceMoney,
} from '../../../shared/domain.ts';
import { useData, type Data } from '../lib/store.tsx';
import { useAccess, type Access } from '../lib/access.ts';
import { setAmountsHidden, useAmountsHidden } from '../lib/privacy.ts';
import { dollars, exportRows, type Column } from '../lib/exports.ts';
import { accountStatuses, stockLevels } from '../lib/books.ts';
import { dateWithYear, daysBetween, money, moneyFit, monthAbbr, percentText } from '../lib/format.ts';
import { Empty, Page, PrivacyToggle } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';

/* ------------------------------------------------------------------ */
/* Periodo y filtros                                                    */
/* ------------------------------------------------------------------ */

type PeriodKey = 'month' | 'last_month' | 'quarter' | 'year' | 'last_year' | '12m' | 'all' | 'custom';
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: 'Este mes' },
  { key: 'last_month', label: 'Mes pasado' },
  { key: 'quarter', label: 'Últimos 3 meses' },
  { key: 'year', label: 'Este año' },
  { key: 'last_year', label: 'Año pasado' },
  { key: '12m', label: 'Últimos 12 meses' },
  { key: 'all', label: 'Todo' },
  { key: 'custom', label: 'Fechas…' },
];

interface Range {
  from: string;
  to: string;
}

function rangeFor(key: PeriodKey, today: string, custom: Range): Range {
  const y = today.slice(0, 4);
  const monthStart = `${today.slice(0, 7)}-01`;
  switch (key) {
    case 'month':
      return { from: monthStart, to: today };
    case 'last_month': {
      const start = addMonthsISO(monthStart, -1);
      const end = new Date(`${monthStart}T12:00:00Z`);
      end.setUTCDate(0);
      return { from: start, to: end.toISOString().slice(0, 10) };
    }
    case 'quarter':
      return { from: addMonthsISO(monthStart, -2), to: today };
    case 'year':
      return { from: `${y}-01-01`, to: today };
    case 'last_year':
      return { from: `${Number(y) - 1}-01-01`, to: `${Number(y) - 1}-12-31` };
    case '12m':
      return { from: addMonthsISO(monthStart, -11), to: today };
    case 'all':
      return { from: '2000-01-01', to: '2100-12-31' };
    case 'custom':
      return custom.from <= custom.to ? custom : { from: custom.to, to: custom.from };
  }
}

const within = (iso: string | null | undefined, r: Range) => Boolean(iso) && iso! >= r.from && iso! <= r.to;

interface Filters {
  brandId: number | null;
  sellerId: number | null;
}

/* ------------------------------------------------------------------ */
/* Definicion de reportes                                               */
/* ------------------------------------------------------------------ */

type Kind = 'money' | 'int' | 'pct' | 'text' | 'days';
interface Col<T> {
  label: string;
  value: (row: T) => string | number | null;
  kind?: Kind;
  /** Columna solo para quien tiene este permiso (un monto). */
  need?: PermissionFlag;
}
interface Kpi {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'green' | 'red' | 'orange';
}
interface ChartRow {
  label: string;
  value: number;
  /** Segunda serie (ganancia dentro de lo vendido, etc.). */
  inner?: number;
}
interface Result<T = any> {
  kpis: Kpi[];
  chart?: { title: string; kind: 'columns' | 'bars'; money: boolean; rows: ChartRow[]; legend?: [string, string?] };
  table: { title: string; columns: Col<T>[]; rows: T[]; total?: T };
  note?: string;
}

interface Ctx {
  data: Data;
  a: Access;
  range: Range;
  /** Ventas activas del periodo con los filtros. */
  sales: Sale[];
  /** Todas las del periodo (incluye canceladas), con filtros. */
  allSales: Sale[];
  services: Service[];
}

interface ReportDef {
  key: string;
  label: string;
  text: string;
  icon: ReactNode;
  color: string;
  show: (a: Access) => boolean;
  build: (ctx: Ctx) => Result;
}

const sum = <T,>(list: T[], fn: (x: T) => number) => list.reduce((n, x) => n + fn(x), 0);
const share = (part: number, whole: number) => (whole ? part / whole : 0);

function groupBy<T, K>(list: T[], key: (x: T) => K) {
  const map = new Map<K, T[]>();
  for (const x of list) {
    const k = key(x);
    const l = map.get(k);
    if (l) l.push(x);
    else map.set(k, [x]);
  }
  return map;
}

/** Cubetas por mes del periodo (o por semana si es un solo mes). */
function buckets(range: Range, today: string) {
  const to = range.to > today ? today : range.to;
  const months: string[] = [];
  let m = `${range.from.slice(0, 7)}-01`;
  while (m <= to && months.length < 120) {
    months.push(m);
    m = addMonthsISO(m, 1);
  }
  if (months.length <= 1) {
    const start = range.from;
    const weeks: { label: string; from: string; to: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const from = addDays(start, i * 7);
      if (from > to) break;
      const end = addDays(from, 6);
      weeks.push({ label: `Sem ${i + 1}`, from, to: end > to ? to : end });
    }
    return weeks;
  }
  return months.slice(-24).map((month) => ({ label: monthAbbr(month), from: month, to: addDays(addMonthsISO(month, 1), -1) }));
}

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const nameOf = (data: Data, id: number | null, fallback: string) => (id ? data.personById.get(id)?.name ?? fallback : fallback);

const REPORTS: ReportDef[] = [
  {
    key: 'summary',
    label: 'Resumen del negocio',
    text: 'Ventas, ganancia, servicio y gastos del periodo.',
    icon: <BarChart3 size={20} />,
    color: '#0a72c2',
    show: (a) => a.can('report.summary'),
    build: ({ data, a, range, sales, allSales, services }) => {
      const sold = sum(sales, (s) => s.price ?? 0);
      const profit = sum(sales, (s) => saleMoney(s).profit);
      const estimates = sales.filter((s) => saleMoney(s).estimate).length;
      const svc = services.map(serviceMoney);
      const svcCharged = sum(svc, (m) => m.charged);
      const expenses = a.canSee('payables') ? sum(data.payables.filter((p) => within(p.date, range)), (p) => p.amount) : null;
      const cancelled = allSales.filter((s) => !isActiveSale(s)).length;
      const periods = buckets(range, data.today);
      const rows = periods.map((b) => {
        const list = sales.filter((s) => within(s.saleDate, b));
        return { label: b.label, count: list.length, sold: sum(list, (s) => s.price ?? 0), profit: sum(list, (s) => saleMoney(s).profit), services: services.filter((s) => within(s.reportedDate, b)).length };
      });
      const kpis: Kpi[] = [{ label: 'Ventas', value: sales.length, note: cancelled ? `${cancelled} canceladas o declinadas (no suman)` : 'Activas en el periodo' }];
      if (a.prices) kpis.push({ label: 'Vendido', value: moneyFit(sold), note: sales.length ? `Promedio ${money(Math.round(sold / sales.length))}` : '—' });
      if (a.costs) kpis.push({ label: estimates ? 'Ganancia (estimada)' : 'Ganancia', value: moneyFit(profit), note: `Margen ${percentText(profit, sold)}${estimates ? ` · ${estimates} sin costos` : ''}`, tone: profit < 0 ? 'red' : 'green' });
      kpis.push({ label: 'Servicios', value: services.length, note: a.prices ? `Cobrado ${money(svcCharged)}` : `${services.filter((s) => s.billing === 'warranty').length} de garantía` });
      if (expenses != null) kpis.push({ label: 'Gastos registrados', value: moneyFit(expenses), note: 'Cuentas por pagar del periodo' });
      return {
        kpis,
        chart: a.prices
          ? { title: 'Vendido por periodo', kind: 'columns', money: true, rows: rows.map((r) => ({ label: r.label, value: r.sold, inner: a.costs ? Math.max(r.profit, 0) : undefined })), legend: ['Vendido', a.costs ? 'Ganancia' : undefined] }
          : { title: 'Ventas por periodo', kind: 'columns', money: false, rows: rows.map((r) => ({ label: r.label, value: r.count })), legend: ['Ventas'] },
        table: {
          title: 'Detalle por periodo',
          columns: [
            { label: 'Periodo', value: (r) => r.label, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: 'Vendido', value: (r) => r.sold, kind: 'money', need: 'money.prices' },
            { label: 'Ganancia', value: (r) => r.profit, kind: 'money', need: 'money.profit' },
            { label: 'Servicios', value: (r) => r.services, kind: 'int' },
          ],
          rows,
          total: { label: 'Total', count: sales.length, sold, profit, services: services.length },
        },
        note: expenses != null && a.costs ? 'Los gastos de cuentas por pagar se muestran aparte: los equipos comprados con tarjeta ya pueden estar como costo de proveedor en cada venta.' : undefined,
      };
    },
  },
  {
    key: 'sellers',
    label: 'Vendedores',
    text: 'Ventas, monto y comisiones de cada vendedor.',
    icon: <Users size={20} />,
    color: '#6a3fdc',
    show: (a) => a.can('report.sellers'),
    build: ({ data, sales, a }) => {
      const rows = [...groupBy(sales, (s) => s.sellerId).entries()]
        .map(([id, list]) => ({
          name: nameOf(data, id, 'Sin vendedor'),
          count: list.length,
          sold: sum(list, (s) => s.price ?? 0),
          avg: list.length ? Math.round(sum(list, (s) => s.price ?? 0) / list.length) : 0,
          commission: sum(list, (s) => s.commission ?? 0),
          owed: sum(list.filter((s) => !s.commissionPaid), (s) => s.commission ?? 0),
        }))
        .sort((x, y) => y.sold - x.sold || y.count - x.count);
      const total = { name: 'Total', count: sales.length, sold: sum(rows, (r) => r.sold), avg: sales.length ? Math.round(sum(rows, (r) => r.sold) / sales.length) : 0, commission: sum(rows, (r) => r.commission), owed: sum(rows, (r) => r.owed) };
      return {
        kpis: [
          { label: 'Vendedores con ventas', value: rows.filter((r) => r.name !== 'Sin vendedor').length },
          { label: 'Mejor vendedor', value: rows[0]?.name ?? '—', note: rows[0] ? `${rows[0].count} ventas` : undefined },
          ...(a.can('money.commissions') ? [{ label: 'Comisiones', value: moneyFit(total.commission), note: `Por pagar ${money(total.owed)}` }] : []),
        ],
        chart: { title: 'Ventas por vendedor', kind: 'bars', money: false, rows: rows.map((r) => ({ label: r.name, value: r.count })) },
        table: {
          title: 'Por vendedor',
          columns: [
            { label: 'Vendedor', value: (r) => r.name, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: 'Vendido', value: (r) => r.sold, kind: 'money', need: 'money.prices' },
            { label: 'Promedio', value: (r) => r.avg, kind: 'money', need: 'money.prices' },
            { label: 'Comisión', value: (r) => r.commission, kind: 'money', need: 'money.commissions' },
            { label: 'Por pagar', value: (r) => r.owed, kind: 'money', need: 'money.commissions' },
          ],
          rows,
          total,
        },
      };
    },
  },
  {
    key: 'brands',
    label: 'Marcas',
    text: 'Infinity Water, Magic Water, 4Elements: cuánto vende cada una.',
    icon: <Tag size={20} />,
    color: '#16a3c4',
    show: (a) => a.can('report.brands'),
    build: ({ data, sales }) => {
      const sold = sum(sales, (s) => s.price ?? 0);
      const rows = [...groupBy(sales, (s) => s.brandId).entries()]
        .map(([id, list]) => {
          const value = sum(list, (s) => s.price ?? 0);
          return {
            name: id ? data.brands.find((b) => b.id === id)?.name ?? '—' : 'Sin marca',
            count: list.length,
            sold: value,
            profit: sum(list, (s) => saleMoney(s).profit),
            share: share(list.length, sales.length),
          };
        })
        .sort((x, y) => y.count - x.count);
      return {
        kpis: rows.slice(0, 4).map((r) => ({ label: r.name, value: r.count, note: `${Math.round(r.share * 100)}% de las ventas` })),
        chart: { title: 'Ventas por marca', kind: 'bars', money: false, rows: rows.map((r) => ({ label: r.name, value: r.count })) },
        table: {
          title: 'Por marca',
          columns: [
            { label: 'Marca', value: (r) => r.name, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: '% ventas', value: (r) => r.share, kind: 'pct' },
            { label: 'Vendido', value: (r) => r.sold, kind: 'money', need: 'money.prices' },
            { label: 'Ganancia', value: (r) => r.profit, kind: 'money', need: 'money.profit' },
          ],
          rows,
          total: { name: 'Total', count: sales.length, share: 1, sold, profit: sum(rows, (r) => r.profit) },
        },
      };
    },
  },
  {
    key: 'equipment',
    label: 'Qué se vende',
    text: 'Ósmosis de cocina y de toda la casa, filtros, aireadores, UV.',
    icon: <Droplets size={20} />,
    color: '#0a9396',
    show: (a) => a.can('report.equipment'),
    build: ({ sales }) => {
      const items: { name: string; match: (s: Sale) => boolean }[] = [
        { name: 'Ósmosis de cocina · 5 pasos', match: (s) => s.equipment.ro && s.equipment.roType === 'five_stage' },
        { name: 'Ósmosis de cocina · en caja', match: (s) => s.equipment.ro && s.equipment.roType === 'box' },
        { name: 'Ósmosis de cocina con UV', match: (s) => s.equipment.ro && s.equipment.roUv },
        ...[1, 2, 3, 4].map((n) => ({ name: `Ósmosis de toda la casa · ${n} ${n === 1 ? 'membrana' : 'membranas'}`, match: (s: Sale) => s.equipment.wholeHouseRo === n })),
        ...[1, 2, 3, 4].map((n) => ({ name: `${n} ${n === 1 ? 'filtro' : 'filtros'} fuera de casa`, match: (s: Sale) => s.equipment.outdoorTanks === n })),
        { name: 'Aireador', match: (s) => s.equipment.aerator },
        { name: 'Agua de ciudad', match: (s) => s.waterSource === 'city' },
        { name: 'Agua de pozo', match: (s) => s.waterSource === 'well' },
      ];
      const rows = items
        .map((i) => {
          const list = sales.filter(i.match);
          return { name: i.name, count: list.length, share: share(list.length, sales.length), sold: sum(list, (s) => s.price ?? 0) };
        })
        .filter((r) => r.count > 0);
      const kitchen = sales.filter((s) => s.equipment.ro).length;
      const whole = sales.filter((s) => s.equipment.wholeHouseRo > 0).length;
      return {
        kpis: [
          { label: 'Ventas', value: sales.length },
          { label: 'Ósmosis de cocina', value: kitchen, note: `${Math.round(share(kitchen, sales.length) * 100)}% de las ventas` },
          { label: 'Ósmosis de toda la casa', value: whole, note: `${Math.round(share(whole, sales.length) * 100)}% de las ventas` },
        ],
        chart: { title: 'Equipos instalados', kind: 'bars', money: false, rows: rows.filter((r) => !r.name.startsWith('Agua')).map((r) => ({ label: r.name, value: r.count })) },
        table: {
          title: 'Por equipo',
          columns: [
            { label: 'Equipo', value: (r) => r.name, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: '% ventas', value: (r) => r.share, kind: 'pct' },
            { label: 'Vendido (ventas que lo incluyen)', value: (r) => r.sold, kind: 'money', need: 'money.prices' },
          ],
          rows,
        },
        note: 'Una venta puede incluir varios equipos, por eso los porcentajes no suman 100%.',
      };
    },
  },
  {
    key: 'financiers',
    label: 'Financieras',
    text: 'Cuánto se financió, cuánto pagaron y su descuento.',
    icon: <Landmark size={20} />,
    color: '#5856d6',
    show: (a) => a.can('report.financiers'),
    build: ({ data, sales }) => {
      const financed = sales.filter((s) => s.paymentMethod === 'financed');
      const rows = [...groupBy(financed, (s) => s.financierId).entries()]
        .map(([id, list]) => {
          const ms = list.map(saleMoney);
          const known = list.filter((s) => s.fundedAmount != null);
          const knownFinanced = sum(known.map(saleMoney), (m) => m.financedAmount);
          const funded = sum(known, (s) => s.fundedAmount ?? 0);
          return {
            name: id ? data.financierById.get(id)?.name ?? '—' : 'Sin financiera',
            count: list.length,
            financed: sum(ms, (m) => m.financedAmount),
            funded,
            fee: knownFinanced - funded,
            feePct: share(knownFinanced - funded, knownFinanced),
            pending: sum(ms, (m) => m.pendingFinancier),
          };
        })
        .sort((x, y) => y.financed - x.financed);
      const total = { name: 'Total', count: financed.length, financed: sum(rows, (r) => r.financed), funded: sum(rows, (r) => r.funded), fee: sum(rows, (r) => r.fee), feePct: share(sum(rows, (r) => r.fee), sum(rows, (r) => r.fee + r.funded)), pending: sum(rows, (r) => r.pending) };
      return {
        kpis: [
          { label: 'Financiado', value: moneyFit(total.financed), note: `${financed.length} de ${sales.length} ventas` },
          { label: 'Descuento promedio', value: `${Math.round(total.feePct * 100)}%`, note: `${money(total.fee)} se quedaron las financieras` },
          { label: 'Por cobrar', value: moneyFit(total.pending), tone: total.pending ? 'orange' : undefined },
        ],
        chart: { title: 'Financiado por financiera', kind: 'bars', money: true, rows: rows.map((r) => ({ label: r.name, value: r.financed, inner: r.funded })), legend: ['Financiado', 'Pagado'] },
        table: {
          title: 'Por financiera',
          columns: [
            { label: 'Financiera', value: (r) => r.name, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: 'Financiado', value: (r) => r.financed, kind: 'money', need: 'money.financier' },
            { label: 'Pagó', value: (r) => r.funded, kind: 'money', need: 'money.financier' },
            { label: 'Descuento', value: (r) => r.fee, kind: 'money', need: 'money.financier' },
            { label: '% desc.', value: (r) => r.feePct, kind: 'pct' },
            { label: 'Por cobrar', value: (r) => r.pending, kind: 'money', need: 'money.financier' },
          ],
          rows,
          total,
        },
      };
    },
  },
  {
    key: 'receivables',
    label: 'Cuentas por cobrar',
    text: 'Lo que deben financieras y clientes, por antigüedad.',
    icon: <HandCoins size={20} />,
    color: '#f08c00',
    show: (a) => a.can('report.receivables'),
    build: ({ data }) => {
      // No depende del periodo: es lo que se debe hoy.
      const owed = data.sales
        .filter(isActiveSale)
        .map((s) => ({ s, m: saleMoney(s) }))
        .filter(({ m }) => m.pendingFinancier + m.pendingClient > 0)
        .map(({ s, m }) => {
          const days = Math.max(daysBetween(s.installDate ?? s.saleDate, data.today), 0);
          return {
            client: data.clientById.get(s.clientId)?.name ?? 'Cliente',
            who: m.pendingFinancier > 0 ? (s.financierId ? data.financierById.get(s.financierId)?.name ?? 'Financiera' : 'Financiera') : 'Cliente',
            date: s.installDate ?? s.saleDate,
            days,
            amount: m.pendingFinancier + m.pendingClient,
          };
        })
        .sort((x, y) => y.days - x.days);
      const ages = [
        { label: '0–30 días', test: (d: number) => d <= 30 },
        { label: '31–60 días', test: (d: number) => d > 30 && d <= 60 },
        { label: '61–90 días', test: (d: number) => d > 60 && d <= 90 },
        { label: 'Más de 90', test: (d: number) => d > 90 },
      ].map((b) => ({ label: b.label, value: sum(owed.filter((o) => b.test(o.days)), (o) => o.amount) }));
      return {
        kpis: [
          { label: 'Te deben', value: moneyFit(sum(owed, (o) => o.amount)), note: `${owed.length} ventas`, tone: 'orange' },
          { label: 'Más de 90 días', value: moneyFit(ages[3].value), tone: ages[3].value ? 'red' : undefined },
          { label: 'Más antiguo', value: owed[0] ? `${owed[0].days} días` : '—', note: owed[0]?.client },
        ],
        chart: { title: 'Por antigüedad', kind: 'bars', money: true, rows: ages },
        table: {
          title: 'Detalle (lo que se debe hoy)',
          columns: [
            { label: 'Cliente', value: (r) => r.client, kind: 'text' },
            { label: 'Debe', value: (r) => r.who, kind: 'text' },
            { label: 'Desde', value: (r) => r.date, kind: 'text' },
            { label: 'Días', value: (r) => r.days, kind: 'days' },
            { label: 'Monto', value: (r) => r.amount, kind: 'money', need: 'money.financier' },
          ],
          rows: owed,
        },
        note: 'Este reporte no depende del periodo: muestra lo pendiente a hoy.',
      };
    },
  },
  {
    key: 'technicians',
    label: 'Técnicos',
    text: 'Instalaciones y servicios de cada técnico, y lo que se le paga.',
    icon: <HardHat size={20} />,
    color: '#8e8e93',
    show: (a) => a.can('report.technicians'),
    build: ({ data, range, services, a }) => {
      const installs = data.sales.filter((s) => isActiveSale(s) && within(s.installDate, range));
      const ids = new Set<number | null>([...installs.map((s) => s.installerId), ...services.map((s) => s.technicianId)]);
      const rows = [...ids]
        .map((id) => {
          const ins = installs.filter((s) => s.installerId === id);
          const svc = services.filter((s) => s.technicianId === id);
          return {
            name: nameOf(data, id, 'Sin técnico'),
            installs: ins.length,
            services: svc.length,
            pay: sum(ins, (s) => s.installerPay ?? 0) + sum(svc, (s) => s.technicianPay ?? 0),
            owed: sum(ins.filter((s) => !s.installerPaid), (s) => s.installerPay ?? 0) + sum(svc.filter((s) => !s.technicianPaid), (s) => s.technicianPay ?? 0),
          };
        })
        .sort((x, y) => y.installs + y.services - (x.installs + x.services));
      return {
        kpis: [
          { label: 'Instalaciones', value: installs.length },
          { label: 'Servicios', value: services.length },
          ...(a.can('money.techpay') ? [{ label: 'Pago a técnicos', value: moneyFit(sum(rows, (r) => r.pay)), note: `Por pagar ${money(sum(rows, (r) => r.owed))}` }] : []),
        ],
        chart: { title: 'Trabajos por técnico', kind: 'bars', money: false, rows: rows.map((r) => ({ label: r.name, value: r.installs + r.services, inner: r.installs })), legend: ['Servicios', 'Instalaciones'] },
        table: {
          title: 'Por técnico',
          columns: [
            { label: 'Técnico', value: (r) => r.name, kind: 'text' },
            { label: 'Instalaciones', value: (r) => r.installs, kind: 'int' },
            { label: 'Servicios', value: (r) => r.services, kind: 'int' },
            { label: 'A pagar', value: (r) => r.pay, kind: 'money', need: 'money.techpay' },
            { label: 'Pendiente', value: (r) => r.owed, kind: 'money', need: 'money.techpay' },
          ],
          rows,
          total: { name: 'Total', installs: installs.length, services: services.length, pay: sum(rows, (r) => r.pay), owed: sum(rows, (r) => r.owed) },
        },
        note: 'Instalaciones por fecha de instalación; servicios por fecha de reporte.',
      };
    },
  },
  {
    key: 'service',
    label: 'Servicio técnico',
    text: 'Tipos de servicio, garantías, cobros y tiempo de respuesta.',
    icon: <Wrench size={20} />,
    color: '#e5484d',
    show: (a) => a.can('report.service'),
    build: ({ services, a }) => {
      const closed = services.filter((s) => s.status === 'closed' && s.closedDate);
      const avgDays = closed.length ? Math.round(sum(closed, (s) => Math.max(daysBetween(s.reportedDate, s.closedDate!), 0)) / closed.length) : null;
      const rows = (Object.keys(SERVICE_KIND_LABEL) as (keyof typeof SERVICE_KIND_LABEL)[])
        .map((k) => {
          const list = services.filter((s) => s.kind === k);
          return {
            name: SERVICE_KIND_LABEL[k],
            count: list.length,
            warranty: list.filter((s) => s.billing === 'warranty').length,
            charged: list.filter((s) => s.billing === 'charged').length,
            amount: sum(list, (s) => serviceMoney(s).charged),
            open: list.filter((s) => s.status === 'open').length,
          };
        })
        .filter((r) => r.count > 0);
      const methods = groupBy(services.filter((s) => s.billing === 'charged' && s.paymentMethod), (s) => s.paymentMethod!);
      return {
        kpis: [
          { label: 'Servicios', value: services.length, note: `${services.filter((s) => s.status === 'open').length} abiertos` },
          { label: 'Garantía', value: services.filter((s) => s.billing === 'warranty').length, note: `${Math.round(share(services.filter((s) => s.billing === 'warranty').length, services.length) * 100)}% de los servicios` },
          ...(a.prices ? [{ label: 'Cobrado', value: moneyFit(sum(services, (s) => serviceMoney(s).charged)), note: [...methods.entries()].map(([k, l]) => `${SERVICE_PAYMENT_LABEL[k]} ${money(sum(l, (s) => s.amount ?? 0))}`).join(' · ') || undefined }] : []),
          { label: 'Tiempo para resolver', value: avgDays == null ? '—' : `${avgDays} ${avgDays === 1 ? 'día' : 'días'}`, note: 'Promedio, del reporte al cierre' },
        ],
        chart: { title: 'Servicios por tipo', kind: 'bars', money: false, rows: rows.map((r) => ({ label: r.name, value: r.count, inner: r.warranty })), legend: ['Total', 'Garantía'] },
        table: {
          title: 'Por tipo',
          columns: [
            { label: 'Tipo', value: (r) => r.name, kind: 'text' },
            { label: 'Servicios', value: (r) => r.count, kind: 'int' },
            { label: 'Garantía', value: (r) => r.warranty, kind: 'int' },
            { label: 'Cobrados', value: (r) => r.charged, kind: 'int' },
            { label: 'Cobrado', value: (r) => r.amount, kind: 'money', need: 'money.prices' },
            { label: 'Abiertos', value: (r) => r.open, kind: 'int' },
          ],
          rows,
        },
      };
    },
  },
  {
    key: 'cities',
    label: 'Ciudades',
    text: 'Dónde se vende más.',
    icon: <MapPin size={20} />,
    color: '#1d9a46',
    show: (a) => a.can('report.cities'),
    build: ({ data, sales }) => {
      const cityOf = (s: Sale) => {
        const c = data.clientById.get(s.clientId);
        const city = (s.installCity || c?.city || '').trim();
        const state = s.installStateCode || c?.state || '';
        return city ? `${city.replace(/\b\w/g, (x) => x.toUpperCase())}${state ? `, ${state}` : ''}` : 'Sin ciudad';
      };
      const rows = [...groupBy(sales, (s) => cityOf(s).toLowerCase()).values()]
        .map((list) => ({ name: cityOf(list[0]), count: list.length, sold: sum(list, (s) => s.price ?? 0), share: share(list.length, sales.length) }))
        .sort((x, y) => y.count - x.count);
      return {
        kpis: [
          { label: 'Ciudades', value: rows.filter((r) => r.name !== 'Sin ciudad').length },
          { label: 'Donde más se vende', value: rows[0]?.name ?? '—', note: rows[0] ? `${rows[0].count} ventas` : undefined },
        ],
        chart: { title: 'Top 12 ciudades', kind: 'bars', money: false, rows: rows.slice(0, 12).map((r) => ({ label: r.name, value: r.count })) },
        table: {
          title: 'Por ciudad',
          columns: [
            { label: 'Ciudad', value: (r) => r.name, kind: 'text' },
            { label: 'Ventas', value: (r) => r.count, kind: 'int' },
            { label: '% ventas', value: (r) => r.share, kind: 'pct' },
            { label: 'Vendido', value: (r) => r.sold, kind: 'money', need: 'money.prices' },
          ],
          rows,
        },
      };
    },
  },
  {
    key: 'expenses',
    label: 'Gastos y cuentas por pagar',
    text: 'En qué se gasta, con qué tarjeta, y lo que se ha pagado.',
    icon: <CreditCard size={20} />,
    color: '#e5484d',
    show: (a) => a.can('report.expenses'),
    build: ({ data, range }) => {
      const charges = data.payables.filter((p) => within(p.date, range));
      const payments = data.payablePayments.filter((p) => within(p.date, range));
      const statuses = accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today);
      const byCategory = [...groupBy(charges, (p) => p.category ?? 'other').entries()]
        .map(([k, list]) => ({ label: EXPENSE_CATEGORY_LABEL[k], value: sum(list, (p) => p.amount) }))
        .sort((x, y) => y.value - x.value);
      const rows = statuses
        .map((s) => ({
          name: s.account.name,
          charged: sum(charges.filter((p) => p.accountId === s.account.id), (p) => p.amount),
          paid: sum(payments.filter((p) => p.accountId === s.account.id), (p) => p.amount),
          balance: s.balance,
          overdue: s.overdue,
        }))
        .filter((r) => r.charged || r.paid || r.balance)
        .sort((x, y) => y.balance - x.balance);
      return {
        kpis: [
          { label: 'Gastado en el periodo', value: moneyFit(sum(charges, (p) => p.amount)), note: `${charges.length} gastos` },
          { label: 'Pagado en el periodo', value: moneyFit(sum(payments, (p) => p.amount)), tone: 'green' },
          { label: 'Saldo hoy', value: moneyFit(sum(statuses, (s) => s.balance)), note: `Vencido ${money(sum(statuses, (s) => s.overdue))}`, tone: sum(statuses, (s) => s.overdue) ? 'red' : undefined },
        ],
        chart: { title: 'Gastos por categoría', kind: 'bars', money: true, rows: byCategory },
        table: {
          title: 'Por cuenta',
          columns: [
            { label: 'Cuenta', value: (r) => r.name, kind: 'text' },
            { label: 'Gastado', value: (r) => r.charged, kind: 'money', need: 'payables.view' },
            { label: 'Pagado', value: (r) => r.paid, kind: 'money', need: 'payables.view' },
            { label: 'Saldo hoy', value: (r) => r.balance, kind: 'money', need: 'payables.view' },
            { label: 'Vencido', value: (r) => r.overdue, kind: 'money', need: 'payables.view' },
          ],
          rows,
          total: { name: 'Total', charged: sum(rows, (r) => r.charged), paid: sum(rows, (r) => r.paid), balance: sum(rows, (r) => r.balance), overdue: sum(rows, (r) => r.overdue) },
        },
      };
    },
  },
  {
    key: 'inventory',
    label: 'Inventario',
    text: 'Existencias, consumo del periodo y valor en bodega.',
    icon: <Boxes size={20} />,
    color: '#6a3fdc',
    show: (a) => a.can('report.inventory'),
    build: ({ data, range, a }) => {
      const levels = stockLevels(data.inventoryItems, data.inventoryMovements).filter((s) => s.item.active || s.stock !== 0);
      const rows = levels
        .map((s) => {
          const moves = s.movements.filter((m) => within(m.date, range));
          return {
            name: s.item.name,
            category: INVENTORY_CATEGORY_LABEL[s.item.category],
            in: sum(moves.filter((m) => m.kind === 'in'), (m) => m.quantity),
            out: sum(moves.filter((m) => m.kind === 'out'), (m) => m.quantity),
            adjust: sum(moves.filter((m) => m.kind === 'adjust'), (m) => movementDelta(m)),
            stock: s.stock,
            min: s.item.minStock,
            value: s.value ?? 0,
          };
        })
        .sort((x, y) => y.out - x.out || x.name.localeCompare(y.name));
      return {
        kpis: [
          { label: 'Productos', value: levels.length },
          { label: 'Salieron en el periodo', value: sum(rows, (r) => r.out), note: 'Unidades' },
          { label: 'Por comprar', value: levels.filter((s) => s.low || s.out).length, tone: levels.some((s) => s.low || s.out) ? 'orange' : undefined },
          ...(a.can('money.costs') ? [{ label: 'Valor en bodega', value: moneyFit(sum(rows, (r) => Math.max(r.value, 0))) }] : []),
        ],
        chart: { title: 'Lo que más sale', kind: 'bars', money: false, rows: rows.filter((r) => r.out > 0).slice(0, 12).map((r) => ({ label: r.name, value: r.out })) },
        table: {
          title: 'Por producto',
          columns: [
            { label: 'Producto', value: (r) => r.name, kind: 'text' },
            { label: 'Categoría', value: (r) => r.category, kind: 'text' },
            { label: 'Entró', value: (r) => r.in, kind: 'int' },
            { label: 'Salió', value: (r) => r.out, kind: 'int' },
            { label: 'Ajustes', value: (r) => r.adjust, kind: 'int' },
            { label: 'Hay hoy', value: (r) => r.stock, kind: 'int' },
            { label: 'Mínimo', value: (r) => r.min, kind: 'int' },
            { label: 'Valor', value: (r) => r.value, kind: 'money', need: 'money.costs' },
          ],
          rows,
        },
      };
    },
  },
];

/* ------------------------------------------------------------------ */
/* Pantalla                                                             */
/* ------------------------------------------------------------------ */

export function Reports({ initial }: { initial: string | null }) {
  const data = useData();
  const a = useAccess();
  const { toast, confirm } = useFeedback();
  const hidden = useAmountsHidden();
  const available = REPORTS.filter((r) => r.show(a));
  const [key, setKey] = useState(available.some((r) => r.key === initial) ? initial! : available[0]?.key ?? '');
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [custom, setCustom] = useState<Range>({ from: `${data.today.slice(0, 7)}-01`, to: data.today });
  const [customOpen, setCustomOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ brandId: null, sellerId: null });
  const [picker, setPicker] = useState<'brand' | 'seller' | null>(null);
  const report = available.find((r) => r.key === key) ?? available[0];
  const range = rangeFor(period, data.today, custom);

  const result = useMemo(() => {
    if (!report) return null;
    const match = (s: Sale) => (!filters.brandId || s.brandId === filters.brandId) && (!filters.sellerId || s.sellerId === filters.sellerId);
    const allSales = data.sales.filter((s) => within(s.saleDate, range) && match(s));
    const filteredSaleIds = filters.brandId || filters.sellerId ? new Set(data.sales.filter(match).map((s) => s.id)) : null;
    const services = data.services.filter((s) => within(s.reportedDate, range) && (!filteredSaleIds || (s.saleId != null && filteredSaleIds.has(s.saleId))));
    return report.build({ data, a, range, sales: allSales.filter(isActiveSale), allSales, services });
  }, [report, data, range.from, range.to, filters, a]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!report || !result) {
    return (
      <Page title="Reportes">
        <Empty icon={<BarChart3 size={40} />} title="No hay reportes disponibles" text="Tus permisos no incluyen secciones con reportes." />
      </Page>
    );
  }

  const periodText = period === 'all' ? 'Todo el historial' : `${dateWithYear(range.from)} – ${dateWithYear(range.to > data.today ? data.today : range.to)}`;
  const visibleColumns = result.table.columns.filter((c) => !c.need || a.can(c.need));
  const filterText = [filters.brandId && `Marca: ${data.brands.find((b) => b.id === filters.brandId)?.name}`, filters.sellerId && `Vendedor: ${data.personById.get(filters.sellerId)?.name}`].filter(Boolean).join(' · ');

  /** Imprimir o guardar en PDF; si los montos estan tapados, pregunta si mostrarlos. */
  const printReport = async () => {
    if (a.prices && hidden) {
      const show = await confirm({ title: 'Los montos están ocultos', message: '¿Los muestro para que salgan en el PDF?', confirm: 'Mostrar e imprimir', cancel: 'Imprimir así' });
      if (show) {
        setAmountsHidden(false);
        await new Promise((r) => setTimeout(r, 120));
      }
    }
    window.print();
  };

  const toExcel = () => {
    try {
      const columns: Column<any>[] = result.table.columns.map((c) => ({
        label: c.label,
        need: c.need,
        value: (row: any) => {
          const v = c.value(row);
          if (v == null) return '';
          if (c.kind === 'money') return dollars(v as number);
          if (c.kind === 'pct') return `${Math.round((v as number) * 1000) / 10}%`;
          return v;
        },
      }));
      exportRows(`reporte-${report.key}-${range.from}-a-${range.to > data.today ? data.today : range.to}`, [...result.table.rows, ...(result.table.total ? [result.table.total] : [])], columns, a, data.today);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page title="Reportes" subtitle="Elige un reporte, el periodo y, si quieres, una marca o un vendedor.">
      <div className="report-picker no-print" role="tablist" aria-label="Reportes">
        {available.map((r) => (
          <button key={r.key} type="button" role="tab" aria-selected={r.key === report.key} className={`report-tab${r.key === report.key ? ' on' : ''}`} onClick={() => setKey(r.key)}>
            <span className="report-tab-icon" style={{ background: r.color }}>{r.icon}</span>
            <span className="report-tab-text">
              <b>{r.label}</b>
              <span>{r.text}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="report-controls no-print">
        <div className="period-chips" role="group" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" className={`chip${period === p.key ? ' on' : ''}`} aria-pressed={period === p.key} onClick={() => (p.key === 'custom' ? setCustomOpen(true) : setPeriod(p.key))}>
              {p.key === 'custom' && <CalendarRange size={14} />} {p.key === 'custom' && period === 'custom' ? periodText : p.label}
            </button>
          ))}
        </div>
        {a.canSee('sales') && report.key !== 'receivables' && report.key !== 'expenses' && report.key !== 'inventory' && (
          <div className="period-chips">
            <button type="button" className={`chip${filters.brandId ? ' on' : ''}`} onClick={() => setPicker('brand')}>
              <Filter size={14} /> {filters.brandId ? data.brands.find((b) => b.id === filters.brandId)?.name : 'Todas las marcas'}
            </button>
            {a.scope === 'all' && report.key !== 'sellers' && (
              <button type="button" className={`chip${filters.sellerId ? ' on' : ''}`} onClick={() => setPicker('seller')}>
                <Users size={14} /> {filters.sellerId ? data.personById.get(filters.sellerId)?.name : 'Todos los vendedores'}
              </button>
            )}
            {(filters.brandId || filters.sellerId) && (
              <button type="button" className="chip clear" onClick={() => setFilters({ brandId: null, sellerId: null })}>Quitar filtros</button>
            )}
          </div>
        )}
      </div>

      <article className="report">
        <header className="report-head">
          <div>
            <span className="report-kicker" style={{ color: report.color }}>{report.icon} Reporte</span>
            <h2>{report.label}</h2>
            <p className="muted">
              {report.key === 'receivables' ? `Al ${dateWithYear(data.today)}` : periodText}
              {filterText && ` · ${filterText}`}
            </p>
          </div>
          <div className="report-actions no-print">
            {a.prices && <PrivacyToggle inline />}
            {a.export && (
              <button type="button" className="btn small gray" onClick={toExcel}>
                <Download size={16} /> Excel
              </button>
            )}
            <button type="button" className="btn small" onClick={printReport}>
              <Printer size={16} /> PDF
            </button>
          </div>
          <div className="print-only report-brand">
            <img src="/admin/logo-infinity.webp" alt="Infinity Water" />
            <img src="/admin/logo-magic.webp" alt="Magic Water" />
          </div>
        </header>

        <div className="report-kpis">
          {result.kpis.map((k) => (
            <div key={k.label} className="report-kpi">
              <span className="report-kpi-label">{k.label}</span>
              <span className={`report-kpi-value num${k.tone ? ' ' + k.tone : ''}`}>{k.value}</span>
              {k.note && <span className="report-kpi-note">{k.note}</span>}
            </div>
          ))}
        </div>

        {result.chart && result.chart.rows.some((r) => r.value > 0) && <Chart chart={result.chart} />}

        <section className="report-table-wrap">
          <h3>{result.table.title}</h3>
          {result.table.rows.length === 0 ? (
            <p className="muted" style={{ padding: '18px 0' }}>Sin datos en este periodo.</p>
          ) : (
            <div className="report-table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    {visibleColumns.map((c) => (
                      <th key={c.label} className={c.kind && c.kind !== 'text' ? 'n' : undefined}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.table.rows.map((row, i) => (
                    <tr key={i}>
                      {visibleColumns.map((c) => (
                        <td key={c.label} className={c.kind && c.kind !== 'text' ? 'n num' : undefined}>{fmt(c.value(row), c.kind)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {result.table.total && (
                  <tfoot>
                    <tr>
                      {visibleColumns.map((c) => (
                        <td key={c.label} className={c.kind && c.kind !== 'text' ? 'n num' : undefined}>{fmt(c.value(result.table.total), c.kind)}</td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>
        {result.note && <p className="report-note">{result.note}</p>}
        <p className="report-foot print-only">Generado el {dateWithYear(data.today)} por {data.me.name} · Infinity Water</p>
      </article>

      <Sheet open={customOpen} onClose={() => setCustomOpen(false)} title="Elegir fechas" right={<button type="button" className="link-btn strong" onClick={() => { setPeriod('custom'); setCustomOpen(false); }}>Listo</button>}>
        <div className="group">
          <DateField label="Desde" value={custom.from} onChange={(from) => setCustom((c) => ({ ...c, from: from || c.from }))} max={data.today} />
          <DateField label="Hasta" value={custom.to} onChange={(to) => setCustom((c) => ({ ...c, to: to || c.to }))} min={custom.from} />
        </div>
      </Sheet>
      <Picker
        open={picker === 'brand'}
        onClose={() => setPicker(null)}
        title="Marca"
        options={data.brands.map((b) => ({ id: b.id, label: b.name, inactive: !b.active }))}
        value={filters.brandId}
        onSelect={(brandId) => setFilters((f) => ({ ...f, brandId }))}
        allowNone="Todas las marcas"
      />
      <Picker
        open={picker === 'seller'}
        onClose={() => setPicker(null)}
        title="Vendedor"
        options={data.people.filter((p) => p.isSeller).map((p) => ({ id: p.id, label: p.name, inactive: !p.active }))}
        value={filters.sellerId}
        onSelect={(sellerId) => setFilters((f) => ({ ...f, sellerId }))}
        allowNone="Todos los vendedores"
      />
    </Page>
  );
}

function fmt(value: string | number | null, kind: Kind = 'text') {
  if (value == null || value === '') return '—';
  if (kind === 'money') return money(value as number);
  if (kind === 'pct') return `${Math.round((value as number) * 100)}%`;
  if (kind === 'int' || kind === 'days') return Number(value).toLocaleString('es-US');
  return String(value);
}

/** Grafica de columnas (periodos) o barras horizontales (grupos), sin librerias. */
function Chart({ chart }: { chart: NonNullable<Result['chart']> }) {
  const hidden = useAmountsHidden();
  const max = Math.max(...chart.rows.map((r) => r.value), 1);
  const show = (v: number) => (chart.money ? (hidden ? '••' : moneyFit(v)) : v.toLocaleString('es-US'));
  if (chart.money && hidden) {
    return (
      <section className="report-chart">
        <h3>{chart.title}</h3>
        <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>Montos ocultos. Toca «Mostrar» para ver la gráfica.</p>
      </section>
    );
  }
  return (
    <section className="report-chart">
      <h3>{chart.title}</h3>
      {chart.kind === 'columns' ? (
        <div className="bars report-bars" role="img" aria-label={chart.title}>
          {chart.rows.map((r) => (
            <div key={r.label} className="bar-col" title={`${r.label}: ${show(r.value)}`}>
              <span className="bar-value num">{r.value ? show(r.value) : ''}</span>
              <div className="bar-track">
                <div className="bar" style={{ height: `${(r.value / max) * 100}%` }}>
                  {r.inner != null && <div className="bar-profit" style={{ height: `${r.value ? Math.min(100, (r.inner / r.value) * 100) : 0}%` }} />}
                </div>
              </div>
              <span className="bar-label">{r.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="hbars" role="img" aria-label={chart.title}>
          {chart.rows.map((r) => (
            <div key={r.label} className="hbar">
              <span className="hbar-label">{r.label}</span>
              <span className="hbar-track">
                <span className="hbar-fill" style={{ width: `${(r.value / max) * 100}%` }}>
                  {r.inner != null && <span className="hbar-inner" style={{ width: `${r.value ? Math.min(100, (r.inner / r.value) * 100) : 0}%` }} />}
                </span>
              </span>
              <span className="hbar-value num">{show(r.value)}</span>
            </div>
          ))}
        </div>
      )}
      {chart.legend && (
        <div className="legend">
          <span><i style={{ background: chart.kind === 'columns' ? 'var(--fill)' : 'var(--accent-soft-strong)' }} />{chart.legend[0]}</span>
          {chart.legend[1] && <span><i style={{ background: 'var(--accent)' }} />{chart.legend[1]}</span>}
        </div>
      )}
    </section>
  );
}

