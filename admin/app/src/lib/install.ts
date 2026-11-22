/**
 * Documentos de una venta: la orden de instalacion que se le manda al
 * tecnico por WhatsApp y los datos con que se llena la garantia.
 */
import type { Client, Sale, WarrantyData, WarrantyLine } from '../../../shared/domain.ts';
import { WATER_LABEL, equipmentSummary, formatAddress } from '../../../shared/domain.ts';
import type { Data } from './store.tsx';
import { longDate, phoneDigits } from './format.ts';

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

/** WhatsApp con el texto ya escrito (al tecnico, o a quien se elija si no hay numero). */
export function whatsappWithText(text: string, phone?: string | null) {
  const digits = phone ? phoneDigits(phone) : '';
  const to = digits ? (digits.length === 10 ? '1' + digits : digits) : '';
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
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
