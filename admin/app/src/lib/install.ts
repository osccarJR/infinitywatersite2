/**
 * Documentos de una venta: la orden de instalacion que se le manda al
 * tecnico por WhatsApp y los datos con que se llena la garantia.
 */
import type { Client, InvoiceBrand, InvoiceData, InvoiceLine, Sale, WarrantyData, WarrantyLine } from '../../../shared/domain.ts';
import { WATER_LABEL, equipmentSummary, formatAddress, saleMoney } from '../../../shared/domain.ts';
import type { Data } from './store.tsx';
import { longDate } from './format.ts';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Direccion donde se instala: la de la venta o, si no, la del cliente (dos lineas). */
export function installAddress(sale: Sale, client: Client | undefined) {
  const own = sale.installAddress || sale.installCity;
  const street = own ? sale.installAddress : client?.address;
  const city = own ? sale.installCity : client?.city;
  const state = own ? sale.installStateCode : client?.state;
  const zip = own ? sale.installZip : client?.zip;
  return {
    street: street ?? '',
    cityLine: [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    city: city ?? '',
    state: state ?? '',
    full: formatAddress({ address: street, city, state, zip }),
  };
}

export const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Orden de instalacion para el tecnico (texto para WhatsApp). */
export function installOrderText(sale: Sale, data: Data): string {
  const client = data.clientById.get(sale.clientId);
  const tech = sale.installerId ? data.personById.get(sale.installerId) : undefined;
  const brand = sale.brandId ? data.brands.find((b) => b.id === sale.brandId)?.name : undefined;
  const address = installAddress(sale, client);
  const phones = [client?.phone, client?.phone2].filter(Boolean).join(' / ');
  const lines = [
    tech ? `Hola ${tech.name.split(' ')[0]}, esta es tu instalación:` : null,
    `*ORDEN DE INSTALACIÓN*${brand ? ` · ${brand}` : ''}`,
    '',
    `📅 *Fecha:* ${sale.installDate ? cap(longDate(sale.installDate)) : 'por confirmar'}`,
    `🕐 *Hora:* ${sale.installTime ? `${sale.installTime} (hora de Florida)` : 'por confirmar'}`,
    '',
    `👤 *Cliente:* ${client?.name ?? '—'}`,
    `📞 *Teléfono:* ${phones || '—'}`,
    `📍 *Dirección:* ${address.street || '—'}`,
    address.cityLine ? `     ${address.cityLine}` : null,
    address.full ? `🗺️ *Mapa:* ${mapsLink(address.full)}` : null,
    '',
    sale.waterSource ? `💧 *Agua:* ${WATER_LABEL[sale.waterSource]}` : null,
    `🔧 *Instalar:* ${equipmentSummary(sale.equipment)}`,
    sale.notes ? `📝 *Notas:* ${sale.notes}` : null,
  ];
  return lines.filter((l) => l !== null).join('\n');
}

/* ------------------------------------------------------------------ */
/* Garantia                                                             */
/* ------------------------------------------------------------------ */

const STATE_NAME: Record<string, string> = {
  FL: 'Florida', GA: 'Georgia', TX: 'Texas', NC: 'North Carolina', SC: 'South Carolina', AL: 'Alabama', NY: 'New York', NJ: 'New Jersey', CT: 'Connecticut', MA: 'Massachusetts', PA: 'Pennsylvania', CA: 'California', IL: 'Illinois', TN: 'Tennessee', VA: 'Virginia',
};

/** Equipos de la venta en ingles, con un codigo para el serial. */
function equipmentLines(sale: Sale): { item: string; code: string }[] {
  const e = sale.equipment;
  const out: { item: string; code: string }[] = [];
  if (e.wholeHouseRo > 0) out.push({ item: `Whole-house reverse osmosis system (${e.wholeHouseRo} ${e.wholeHouseRo === 1 ? 'membrane' : 'membranes'})`, code: 'WRO' });
  if (e.ro) out.push({ item: `Kitchen reverse osmosis system${e.roType === 'five_stage' ? ' (5-stage)' : e.roType === 'box' ? ' (cabinet unit)' : ''}${e.roUv ? ' with UV lamp' : ''}`, code: 'RO' });
  if (e.aerator) out.push({ item: 'Aerator tank', code: 'AIR' });
  for (let i = 1; i <= e.outdoorTanks; i++) out.push({ item: e.outdoorTanks === 1 ? 'Filter tank' : `Filter tank ${i}`, code: `FLT${e.outdoorTanks === 1 ? '' : i}` });
  if (e.other) out.push({ item: e.other, code: 'OTH' });
  return out;
}

/** Datos para llenar la garantia: lo ya guardado o lo que sale de la venta. */
export function warrantyDraft(sale: Sale, data: Data): Omit<WarrantyData, 'generatedAt'> {
  if (sale.warranty) return sale.warranty;
  const client = data.clientById.get(sale.clientId);
  const address = installAddress(sale, client);
  const issueDate = sale.installDate ?? sale.saleDate;
  const stamp = issueDate.replace(/-/g, '');
  const water = sale.waterSource === 'well' ? 'Well water' : sale.waterSource === 'city' ? 'City water' : '';
  const place = [address.city, STATE_NAME[address.state] ?? address.state].filter(Boolean).join(', ');
  const seq = String(sale.id).padStart(3, '0');
  const lines: WarrantyLine[] = equipmentLines(sale).map((l) => ({ item: l.item, serial: `MW-${l.code}-${stamp}-${seq}` }));
  return {
    issueDate,
    representative: sale.sellerId ? data.personById.get(sale.sellerId)?.name ?? '' : '',
    issuedIn: [place, water].filter(Boolean).join(' / '),
    lines: lines.length ? lines : [{ item: '', serial: `MW-EQ-${stamp}-${seq}` }],
  };
}

/* ------------------------------------------------------------------ */
/* Factura (Global Innovation Group, en ingles)                        */
/* ------------------------------------------------------------------ */

/** Quien emite la factura (los mismos datos del encabezado de la garantia). */
export const INVOICE_COMPANY = {
  name: 'Global Innovation Group, LLC',
  street: '3940 Metro Pkwy, Office 109',
  cityLine: 'Fort Myers, FL 33916',
  phone: '+1 (239) 223-5394 | +1 (475) 685-8464',
};

export const INVOICE_LABOR = 'Installation, materials, transportation and labor';

type DraftLine = InvoiceLine & { weight: number; code: string };

/** Lineas de la factura segun lo que se vendio (los tanques van juntos, con cantidad). */
function invoiceItems(sale: Sale, prefix: string): DraftLine[] {
  const e = sale.equipment;
  const out: DraftLine[] = [];
  if (e.wholeHouseRo > 0)
    out.push({ description: `Whole-house reverse osmosis system (${e.wholeHouseRo} ${e.wholeHouseRo === 1 ? 'membrane' : 'membranes'})`, itemNumber: `${prefix}WRO-${e.wholeHouseRo}M`, quantity: 1, unitPrice: 0, serial: '', weight: 3 + e.wholeHouseRo, code: 'WRO' });
  if (e.ro) {
    const type = e.roType === 'five_stage' ? ' (5-stage)' : e.roType === 'box' ? ' (cabinet unit)' : '';
    const item = `${prefix}RO${e.roType === 'five_stage' ? '-5STG' : e.roType === 'box' ? '-CAB' : ''}${e.roUv ? '-UV' : ''}`;
    out.push({ description: `Kitchen reverse osmosis system${type}${e.roUv ? ' with UV lamp' : ''}`, itemNumber: item, quantity: 1, unitPrice: 0, serial: '', weight: e.roUv ? 1.8 : 1.5, code: 'RO' });
  }
  if (e.aerator) out.push({ description: 'Aerator tank', itemNumber: `${prefix}AER-TANK`, quantity: 1, unitPrice: 0, serial: '', weight: 1, code: 'AIR' });
  if (e.outdoorTanks > 0) out.push({ description: 'Outdoor filter tank', itemNumber: `${prefix}FLT-TANK`, quantity: e.outdoorTanks, unitPrice: 0, serial: '', weight: e.outdoorTanks, code: 'FLT' });
  if (e.other) out.push({ description: e.other, itemNumber: `${prefix}OTH`, quantity: 1, unitPrice: 0, serial: '', weight: 1, code: 'OTH' });
  return out;
}

/**
 * Reparte un total entre las lineas en proporcion a su peso (o a lo que ya
 * tienen), en dolares redondos. La linea de mano de obra en $0 ("Included")
 * no entra. Lo que sobra del redondeo va a la primera linea de cantidad 1.
 */
export function fitToTotal(lines: InvoiceLine[], total: number, weights?: number[]): InvoiceLine[] {
  const current = lines.map((l) => Math.round(l.quantity * l.unitPrice));
  const base = weights ?? (current.some((c) => c > 0) ? current : lines.map((l) => (l.description === INVOICE_LABOR ? 0 : 1)));
  const sum = base.reduce((a, b) => a + b, 0);
  if (!sum || total <= 0) return lines;
  const out = lines.map((l, i) => {
    const target = (total * base[i]) / sum;
    // En dolares redondos; lo que sobra va a una sola linea.
    return { ...l, unitPrice: base[i] ? Math.floor(target / l.quantity / 100) * 100 : l.unitPrice };
  });
  const diff = total - out.reduce((a, l) => a + Math.round(l.quantity * l.unitPrice), 0);
  const fix = out.findIndex((l, i) => base[i] > 0 && l.quantity === 1);
  if (fix >= 0) out[fix] = { ...out[fix], unitPrice: out[fix].unitPrice + diff };
  return out;
}

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Datos para emitir la factura: la ya emitida o lo que sale de la venta. */
export type InvoiceForm = Omit<InvoiceData, 'issuedAt' | 'number'> & { number: number | null };

export function invoiceDraft(sale: Sale, data: Data, nextNumber: number | null): InvoiceForm {
  if (sale.invoice) return { ...sale.invoice, discount: sale.invoice.discount ?? 0 };
  const brandName = (sale.brandId ? data.brands.find((b) => b.id === sale.brandId)?.name : '') ?? '';
  const brand: InvoiceBrand = /magic/i.test(brandName) ? 'magic' : 'infinity';
  const items = invoiceItems(sale, brand === 'magic' ? 'MW-' : 'IW-');

  // Los seriales son los mismos de la garantia (MW-WRO-..., MW-FLT1-...).
  const serials = warrantyDraft(sale, data).lines.map((l) => l.serial);
  for (const item of items) item.serial = serials.filter((s) => new RegExp(`^[A-Z]+-${item.code}\\d*-`).test(s)).join(', ');

  const price = sale.price ?? 0;
  let lines: InvoiceLine[] = items.map(({ weight: _w, code: _c, ...l }) => l);
  if (lines.length) lines = fitToTotal(lines, price, items.map((i) => i.weight));
  else lines = [{ description: 'Water treatment system', itemNumber: `${brand === 'magic' ? 'MW' : 'IW'}-SYS`, quantity: 1, unitPrice: price, serial: '' }];
  lines.push({ description: INVOICE_LABOR, itemNumber: 'INSTALL', quantity: 1, unitPrice: 0, serial: '' });

  const m = saleMoney(sale);
  const financier = sale.financierId ? data.financierById.get(sale.financierId)?.name ?? '' : '';
  const amountPaid = m.cashDown;
  const financedAmount = m.financed ? m.financedAmount : 0;
  const balance = Math.max(price - amountPaid - financedAmount, 0);
  const issueDate = data.today;
  return {
    number: nextNumber,
    issueDate,
    dueDate: issueDate,
    brand,
    terms: balance === 0 ? (m.financed ? `Financed${financier ? ` — ${financier}` : ''}` : 'Paid in full') : 'Due upon receipt',
    discount: 0,
    taxRate: 0,
    taxAmount: null,
    amountPaid,
    financedAmount,
    financedBy: m.financed ? financier : '',
    customerPo: '',
    lines,
  };
}

export { addDays };
