/**
 * Autocompletado local (sin Google): busca en data/geo.db, construido con
 * scripts/build_geo.py a partir del padron oficial de Florida y de GeoNames.
 *
 *  - Direcciones: se escribe el numero y la calle ("3940 metro", "1420 se 8th
 *    ter"); acepta palabras completas o abreviadas y la ciudad o el ZIP al final.
 *  - Ciudades de todo EE. UU. (primero Florida) y ZIP -> ciudad/estado.
 */
import Database from 'better-sqlite3';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

export interface GeoPlace {
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface GeoSuggestion {
  id: string;
  /** address = direccion completa; street = solo la calle (falta el numero). */
  kind: 'address' | 'street';
  main: string;
  secondary: string;
  place: GeoPlace;
}

/** Mismo mapa que scripts/build_geo.py. */
const ABBR: Record<string, string> = {
  STREET: 'ST', AVENUE: 'AVE', BOULEVARD: 'BLVD', DRIVE: 'DR', ROAD: 'RD', LANE: 'LN', COURT: 'CT', CIRCLE: 'CIR',
  PLACE: 'PL', TERRACE: 'TER', PARKWAY: 'PKWY', HIGHWAY: 'HWY', TRAIL: 'TRL', WAY: 'WAY', COVE: 'CV', POINT: 'PT',
  SQUARE: 'SQ', LOOP: 'LOOP', NORTH: 'N', SOUTH: 'S', EAST: 'E', WEST: 'W', NORTHEAST: 'NE', NORTHWEST: 'NW',
  SOUTHEAST: 'SE', SOUTHWEST: 'SW',
};
const DIRECTIONS = new Set(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']);

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ABBR[t] ?? t);

/** "SE 8TH TER" -> "SE 8th Ter"; "FORT MYERS" -> "Fort Myers". */
export function prettify(text: string) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (DIRECTIONS.has(word)) return word;
      if (/^\d+(ST|ND|RD|TH)$/.test(word)) return word.toLowerCase();
      if (/^\d/.test(word)) return word;
      if (/^MC[A-Z]+/.test(word)) return 'Mc' + word[2] + word.slice(3).toLowerCase();
      return word[0] + word.slice(1).toLowerCase();
    })
    .join(' ');
}

let db: Database.Database | null = null;
let hasStreet2 = false;
let openedMtime = 0;
let lastCheck = 0;

/**
 * Abre geo.db y lo vuelve a revisar cada minuto: si aun no existia o si se
 * reconstruyo (otro archivo), se reabre solo, sin reiniciar el panel.
 */
function open(dataDir: string) {
  if (Date.now() - lastCheck > 60_000) {
    lastCheck = Date.now();
    const file = path.join(dataDir, 'geo.db');
    if (existsSync(file)) {
      const mtime = statSync(file).mtimeMs;
      if (!db || mtime !== openedMtime) {
        db?.close();
        db = new Database(file, { readonly: true, fileMustExist: true });
        openedMtime = mtime;
        hasStreet2 = (db.prepare('PRAGMA table_info(addr)').all() as { name: string }[]).some((c) => c.name === 'street2');
      }
    }
  }
  return db;
}

export const geoEnabled = (dataDir: string) => Boolean(open(dataDir));

/** Condados del area principal: sus resultados salen primero. */
const HOME_COUNTIES = `('Lee','Collier','Charlotte','Sarasota','Hendry','Glades')`;

type Row = { id: number; num_text: string; street: string; city: string | null; zip: string | null };

const cityZip = (city: string, zip: string | null) => [city, 'FL'].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');

const toSuggestion = (r: Row): GeoSuggestion => {
  const address = `${r.num_text} ${prettify(r.street)}`;
  const city = r.city ? prettify(r.city) : '';
  return {
    id: `fl-${r.id}`,
    kind: 'address',
    main: address,
    secondary: cityZip(city, r.zip),
    place: { address, city, state: 'FL', zip: r.zip ?? '' },
  };
};

/**
 * Patron GLOB por palabras, cada una como prefijo: "SE 8 TE" -> "SE* 8* TE*".
 * Asi "8" encuentra "8TH" y "te" encuentra "TER". GLOB (no LIKE) para que
 * SQLite use el indice: los datos estan en mayusculas.
 */
const globOf = (tokens: string[]) => tokens.map((t) => `${t}*`).join(' ');

export function searchAddresses(dataDir: string, input: string, limit = 6): GeoSuggestion[] {
  const geo = open(dataDir);
  if (!geo) return [];
  const tokens = normalize(input);
  if (!tokens.length) return [];
  const first = tokens[0].match(/^(\d+)([A-Z]?)$/);

  // La calle puede ir seguida de ciudad o ZIP: se prueban cortes de mayor a menor.
  const cuts = (rest: string[]) =>
    Array.from({ length: rest.length }, (_, i) => rest.length - i).map((cut) => ({
      street: globOf(rest.slice(0, cut)),
      extra: rest.slice(cut).join(' '),
    }));
  const extraSql = `(@extra = '' OR (COALESCE(city, '') || ' ' || COALESCE(zip, '')) LIKE '%' || @extra || '%')`;

  if (first) {
    // Numero y calle: "3940 metro", "1420 se 8 ter cape".
    const rest = tokens.slice(1);
    if (!rest.length) return [];
    const num = Number(first[1]);
    const query = (column: string) =>
      geo.prepare(
        `SELECT id, num_text, street, city, zip FROM addr
          WHERE num = @num AND ${column} GLOB @street AND ${extraSql}
          GROUP BY num_text, street, city, zip
          ORDER BY (county IN ${HOME_COUNTIES}) DESC, length(street), street
          LIMIT @limit`
      );
    for (const { street, extra } of cuts(rest)) {
      let rows = query('street').all({ num, street, extra, limit }) as Row[];
      // Sin el punto cardinal ("8th ter" en vez de "SE 8th ter").
      if (!rows.length && hasStreet2 && !DIRECTIONS.has(rest[0])) rows = query('street2').all({ num, street, extra, limit }) as Row[];
      if (rows.length) return rows.map(toSuggestion);
    }
    return [];
  }

  // Solo la calle ("metro pkwy"): se sugieren calles con su ciudad.
  if (tokens.join(' ').length < 3) return [];
  const query = (column: string) =>
    geo.prepare(
      `SELECT street, city, MIN(zip) AS zip, COUNT(*) AS n FROM addr
        WHERE ${column} GLOB @street AND ${extraSql}
        GROUP BY street, city
        ORDER BY MAX(county IN ${HOME_COUNTIES}) DESC, n DESC
        LIMIT @limit`
    );
  for (const { street, extra } of cuts(tokens)) {
    let rows = query('street').all({ street, extra, limit }) as (Row & { n: number })[];
    if (!rows.length && hasStreet2 && !DIRECTIONS.has(tokens[0])) rows = query('street2').all({ street, extra, limit }) as (Row & { n: number })[];
    if (rows.length) {
      return rows.map((r) => {
        const name = prettify(r.street);
        const city = r.city ? prettify(r.city) : '';
        return {
          id: `st-${r.street}|${r.city ?? ''}`,
          kind: 'street' as const,
          main: name,
          secondary: cityZip(city, null),
          place: { address: name, city, state: 'FL', zip: r.zip ?? '' },
        };
      });
    }
  }
  return [];
}

export function addressById(dataDir: string, id: string): GeoPlace | null {
  const geo = open(dataDir);
  const m = /^fl-(\d+)$/.exec(id);
  if (!geo || !m) return null;
  const row = geo.prepare('SELECT id, num_text, street, city, zip FROM addr WHERE id = ?').get(Number(m[1])) as Row | undefined;
  return row ? toSuggestion(row).place : null;
}

export function searchCities(dataDir: string, input: string, limit = 7) {
  const geo = open(dataDir);
  const q = normalize(input).join(' ');
  if (!geo || q.length < 2) return [];
  return (
    geo
      .prepare(
        `SELECT name, state, (SELECT zip FROM zips WHERE zips.city = cities.name AND zips.state = cities.state ORDER BY zip LIMIT 1) AS zip, zips
           FROM cities WHERE norm LIKE ? ESCAPE '\\'
          ORDER BY (state = 'FL') DESC, zips DESC, name
          LIMIT ?`
      )
      .all(`${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`, limit) as { name: string; state: string; zip: string | null; zips: number }[]
  ).map((c) => ({ city: c.name, state: c.state, zip: c.zips === 1 ? c.zip : null }));
}

export function zipLookup(dataDir: string, zip: string) {
  const geo = open(dataDir);
  if (!geo || !/^\d{5}$/.test(zip)) return null;
  return (geo.prepare('SELECT city, state FROM zips WHERE zip = ?').get(zip) as { city: string; state: string } | undefined) ?? null;
}
