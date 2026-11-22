/** Formatos para mostrar: dinero en dolares, fechas en espanol, telefonos de EE. UU. */
import { amountsHidden } from './privacy.ts';

/**
 * Monto tapado (modo privado). Siempre igual, sin importar el valor, para
 * que no se adivine si es grande o pequeno.
 */
export const MASK = '$ ••••';

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** Centavos -> "$12,500" (o "$12,500.50" si hay centavos). */
export function money(cents: number | null | undefined): string {
  if (cents == null) return '—';
  if (amountsHidden()) return MASK;
  return (cents % 100 === 0 ? usd0 : usd2).format(cents / 100);
}

/** Centavos -> dolares redondeados ("$36,449"), para numeros grandes de resumen. */
export const moneyRound = (cents: number) => (amountsHidden() ? MASK : usd0.format(Math.round(cents / 100)));

/** Para tarjetas pequenas: cifra completa hasta $100,000; despues abreviada ("$438k", "$4.4M"). */
export const moneyFit = (cents: number) => (Math.abs(cents) >= 10_000_000 ? moneyCompact(cents) : moneyRound(cents));

/** Centavos -> "$12.5k" para espacios pequenos. */
export function moneyCompact(cents: number): string {
  if (amountsHidden()) return MASK;
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(dollars) >= 10_000) return `$${Math.round(dollars / 1000)}k`;
  if (Math.abs(dollars) >= 1000) return `$${(dollars / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return usd0.format(Math.round(dollars));
}

/** Centavos -> texto editable con comas ("8,500" o "1,250.50"). */
const groupInput = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: true });
export const centsToInput = (cents: number | null | undefined) =>
  cents == null ? '' : cents % 100 === 0 ? groupInput.format(cents / 100) : (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Monto siempre visible (formularios: lo que se esta escribiendo no se tapa). */
export function moneyPlain(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return (cents % 100 === 0 ? usd0 : usd2).format(cents / 100);
}

/** Porcentaje que se tapa junto con los montos ("7%" o "••%"). */
export const percentText = (part: number, whole: number) => (amountsHidden() ? '••%' : `${whole ? Math.round((part / whole) * 100) : 0}%`);

/**
 * Texto escrito -> centavos. Acepta "$1,250.5". Devuelve null si esta vacio
 * y undefined si no es un monto valido.
 */
export function parseMoney(text: string): number | null | undefined {
  let clean = text.replace(/[\s$]/g, '');
  if (clean === '') return null;
  if (/^\d+,\d{1,2}$/.test(clean) || /^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(clean)) {
    // Coma decimal: "2500,50" o "2.500,50".
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(clean)) {
    // Coma de miles: "1,500" o "1,500.50".
    clean = clean.replace(/,/g, '');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
    // "1.500" puede ser mil quinientos o uno con cincuenta: no se adivina.
    return undefined;
  }
  if (!/^\d+(\.\d{0,2})?$/.test(clean) && !/^\.\d{1,2}$/.test(clean)) return undefined;
  return Math.round(parseFloat(clean) * 100);
}

/** Fecha local (Florida) de una marca de tiempo UTC de SQLite ("2026-11-21 23:40:00"). */
export function localDate(sqliteUtc: string): string {
  const date = new Date(sqliteUtc.replace(' ', 'T') + 'Z');
  return Number.isNaN(date.getTime()) ? sqliteUtc.slice(0, 10) : new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(date);
}

const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

const dateShort = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dateFull = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dateLong = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const monthName = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' });

const clean = (text: string) => text.replace(/\./g, '');

/** "21 nov" este ano, "21 nov 2025" otro ano. */
export function date(iso: string | null | undefined, today?: string): string {
  if (!iso) return '—';
  const sameYear = today ? iso.slice(0, 4) === today.slice(0, 4) : false;
  return clean((sameYear ? dateShort : dateFull).format(fromISO(iso)));
}

export const dateWithYear = (iso: string | null | undefined) => (iso ? clean(dateFull.format(fromISO(iso))) : '—');

/** "sábado, 21 de noviembre" */
export const longDate = (iso: string) => dateLong.format(fromISO(iso));

/** "noviembre de 2026" */
export const monthLabel = (iso: string) => monthName.format(fromISO(iso));

/** "nov" */
export const monthAbbr = (iso: string) => clean(monthShort.format(fromISO(iso)));

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((fromISO(toIso).getTime() - fromISO(fromIso).getTime()) / 86_400_000);
}

/** "hoy", "mañana", "en 5 días", "hace 3 días" */
export function relativeDay(iso: string, today: string): string {
  const diff = daysBetween(today, iso);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff === -1) return 'ayer';
  return diff > 0 ? `en ${diff} días` : `hace ${-diff} días`;
}

/* ------------------------------------------------------------------ */
/* Telefonos                                                            */
/* ------------------------------------------------------------------ */

export const phoneDigits = (phone: string) => phone.replace(/\D/g, '');

/** "2395551234" -> "(239) 555-1234". Otros formatos se dejan como estan. */
export function formatPhone(phone: string): string {
  const digits = phoneDigits(phone);
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length === 10) return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  return phone.trim();
}

export function telHref(phone: string) {
  const digits = phoneDigits(phone);
  return `tel:${digits.length === 10 ? '+1' + digits : '+' + digits}`;
}

export function whatsappHref(phone: string) {
  const digits = phoneDigits(phone);
  return `https://wa.me/${digits.length === 10 ? '1' + digits : digits}`;
}

export const mapsHref = (address: string) => `https://maps.apple.com/?q=${encodeURIComponent(address)}`;

/* ------------------------------------------------------------------ */
/* Varios                                                               */
/* ------------------------------------------------------------------ */

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

const AVATAR_GRADIENTS = [
  ['#5ac8fa', '#007aff'],
  ['#64d2ff', '#0a72c2'],
  ['#bf5af2', '#6a3fdc'],
  ['#ff9f0a', '#ff6b00'],
  ['#30d158', '#1d8a3a'],
  ['#ff6482', '#e0245e'],
  ['#8e8e93', '#5c5c61'],
  ['#40c8e0', '#16b3d4'],
];

/** Color estable por nombre, como en Contactos. */
export function avatarStyle(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return { background: `linear-gradient(180deg, ${a}, ${b})` };
}

export const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
