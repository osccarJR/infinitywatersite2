#!/usr/bin/env python3
"""
Construye data/geo.db: el indice local de direcciones, ciudades y ZIP que
usa el autocompletado del panel (sin Google ni claves).

Fuentes (publicas y gratuitas):
  * Direcciones: padron oficial de propiedades del Departamento de Hacienda de
    Florida (archivos NAL por condado, campos PHY_ADDR1/PHY_CITY/PHY_ZIPCD).
    https://floridarevenue.com/property/dataportal
  * Ciudades y ZIP de todo EE. UU.: GeoNames (CC BY 4.0).
    https://download.geonames.org/export/zip/

Uso (en el servidor, desde /opt/apps/infinitywater-admin):
    python3 scripts/build_geo.py                 # todo Florida (67 condados, ~30 min)
    python3 scripts/build_geo.py Lee Collier     # solo esos condados

Se construye en un archivo temporal y se cambia al final: el panel sigue
funcionando durante el proceso. Repetirlo una vez al año (cuando Hacienda
publica el padron "Final" nuevo) basta.
"""
import csv
import io
import json
import os
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
import zipfile

DEFAULT_COUNTIES = ['all']  # todo Florida
DOR = 'https://floridarevenue.com'
NAL_ROOT = '/property/dataportal/Documents/PTO Data Portal/Tax Roll Data Files/NAL'
GEONAMES = 'https://download.geonames.org/export/zip/US.zip'
UA = 'infinitywater-admin/1.0 (geo index builder)'

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.environ.get('DATA_DIR', os.path.join(ROOT, 'data'))
TARGET = os.path.join(DATA, 'geo.db')
TMP = TARGET + '.building'

# Abreviaturas USPS: el padron ya las usa; se aplican igual por si acaso.
# (Mismo mapa que server/geo.ts para que busqueda y datos coincidan.)
ABBR = {
    'STREET': 'ST', 'AVENUE': 'AVE', 'BOULEVARD': 'BLVD', 'DRIVE': 'DR', 'ROAD': 'RD', 'LANE': 'LN',
    'COURT': 'CT', 'CIRCLE': 'CIR', 'PLACE': 'PL', 'TERRACE': 'TER', 'PARKWAY': 'PKWY', 'HIGHWAY': 'HWY',
    'TRAIL': 'TRL', 'WAY': 'WAY', 'COVE': 'CV', 'POINT': 'PT', 'SQUARE': 'SQ', 'LOOP': 'LOOP',
    'NORTH': 'N', 'SOUTH': 'S', 'EAST': 'E', 'WEST': 'W',
    'NORTHEAST': 'NE', 'NORTHWEST': 'NW', 'SOUTHEAST': 'SE', 'SOUTHWEST': 'SW',
}


DIRECTIONS = {'N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'}


def norm(text):
    text = re.sub(r'[^A-Z0-9 ]+', ' ', (text or '').upper())
    return ' '.join(ABBR.get(t, t) for t in text.split())


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json;odata=nometadata'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except Exception as e:  # red inestable: se reintenta
            if attempt == 3:
                raise
            print(f'  reintento ({e})', flush=True)
            time.sleep(5 * (attempt + 1))


def nal_files():
    """Archivos NAL del ultimo padron Final publicado."""
    api = f"{DOR}/property/dataportal/_api/web/GetFolderByServerRelativeUrl('{urllib.parse.quote(NAL_ROOT)}')/Folders?$select=Name"
    folders = sorted(f['Name'] for f in json.loads(get(api))['value'] if f['Name'].endswith('F'))
    if not folders:
        raise SystemExit('No hay padron Final publicado')
    folder = folders[-1]
    api = f"{DOR}/property/dataportal/_api/web/GetFolderByServerRelativeUrl('{urllib.parse.quote(NAL_ROOT + '/' + folder)}')/Files?$select=Name,ServerRelativeUrl"
    return folder, json.loads(get(api))['value']


def main():
    counties = sys.argv[1:] or DEFAULT_COUNTIES
    os.makedirs(DATA, exist_ok=True)
    if os.path.exists(TMP):
        os.remove(TMP)
    db = sqlite3.connect(TMP)
    db.executescript('''
        PRAGMA journal_mode = OFF;
        PRAGMA synchronous = OFF;
        CREATE TABLE addr (
            id INTEGER PRIMARY KEY,
            num INTEGER NOT NULL,
            num_text TEXT NOT NULL,
            street TEXT NOT NULL,
            street2 TEXT NOT NULL,   -- la calle sin el punto cardinal inicial ("8TH TER" de "SE 8TH TER")
            city TEXT,
            zip TEXT,
            county TEXT
        );
        CREATE TABLE zips (zip TEXT PRIMARY KEY, city TEXT NOT NULL, state TEXT NOT NULL) WITHOUT ROWID;
        CREATE TABLE cities (name TEXT NOT NULL, state TEXT NOT NULL, norm TEXT NOT NULL, zips INTEGER NOT NULL, PRIMARY KEY (state, name)) WITHOUT ROWID;
        CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT) WITHOUT ROWID;
    ''')

    # ---------------- ciudades y ZIP de EE. UU. (GeoNames) ----------------
    print('> GeoNames: ciudades y codigos postales de EE. UU.', flush=True)
    with zipfile.ZipFile(io.BytesIO(get(GEONAMES))) as z:
        text = z.read('US.txt').decode('utf-8')
    city_zips = {}
    for row in csv.reader(io.StringIO(text), delimiter='\t'):
        if len(row) < 5 or not row[1] or not row[4]:
            continue
        zip5, city, state = row[1][:5], row[2].strip(), row[4].strip()
        db.execute('INSERT OR IGNORE INTO zips VALUES (?, ?, ?)', (zip5, city, state))
        city_zips[(state, city)] = city_zips.get((state, city), 0) + 1
    db.executemany('INSERT OR IGNORE INTO cities VALUES (?, ?, ?, ?)',
                   [(c, s, norm(c), n) for (s, c), n in city_zips.items()])
    print(f'  {len(city_zips)} ciudades', flush=True)

    # ---------------- direcciones de Florida (Hacienda) ----------------
    folder, files = nal_files()
    print(f'> Padron {folder}', flush=True)
    total = 0
    if counties == ['all']:
        targets = sorted(files, key=lambda f: f['Name'])
    else:
        targets = []
        for county in counties:
            match = [f for f in files if f['Name'].lower().startswith(county.lower() + ' ')]
            if match:
                targets.append(match[0])
            else:
                print(f'  (no encontrado: {county})', flush=True)
    for f in targets:
        county = re.sub(r'\s+\d+\s+Final.*$', '', f['Name'])  # "Miami-Dade 23 Final NAL 2026.zip" -> "Miami-Dade"
        print(f"  {f['Name']} ...", end=' ', flush=True)
        blob = get(DOR + urllib.parse.quote(f['ServerRelativeUrl']))
        rows = []
        count = 0
        insert = 'INSERT INTO addr (num, num_text, street, street2, city, zip, county) VALUES (?, ?, ?, ?, ?, ?, ?)'
        with zipfile.ZipFile(io.BytesIO(blob)) as z:
            inner = next(n for n in z.namelist() if n.lower().endswith('.csv'))
            with z.open(inner) as raw:
                reader = csv.DictReader(io.TextIOWrapper(raw, encoding='latin-1', newline=''))
                for r in reader:
                    addr = norm(r.get('PHY_ADDR1'))
                    m = re.match(r'^(\d+)([A-Z]?) (.+)$', addr)
                    if not m:
                        continue
                    num, suffix, street = int(m.group(1)), m.group(2), m.group(3)
                    num_text = f'{m.group(1)}{suffix}'
                    # Rango de numeros ("1500-1526 LEE BLVD"): el guion se pierde al normalizar.
                    rng = re.match(r'^(\d+) (.+)$', street)
                    if rng and not suffix:
                        num_text, street = f'{num_text}-{rng.group(1)}', rng.group(2)
                    zip5 = (r.get('PHY_ZIPCD') or '').strip()[:5]
                    city = (r.get('PHY_CITY') or '').strip().upper()
                    parts = street.split(' ', 1)
                    street2 = parts[1] if len(parts) == 2 and parts[0] in DIRECTIONS else street
                    rows.append((num, num_text, street, street2, city or None, zip5 or None, county))
                    # Por lotes: poca memoria aunque el condado sea grande.
                    if len(rows) >= 50_000:
                        db.executemany(insert, rows)
                        count += len(rows)
                        rows = []
        db.executemany(insert, rows)
        count += len(rows)
        del blob
        total += count
        print(f'{count} direcciones', flush=True)

    print('> indices', flush=True)
    # Quita duplicados exactos (varias parcelas con la misma direccion).
    db.executescript('''
        DELETE FROM addr WHERE id NOT IN (SELECT MIN(id) FROM addr GROUP BY num_text, street, city, zip);
        CREATE INDEX addr_num ON addr (num, street);
        CREATE INDEX addr_street ON addr (street);
        CREATE INDEX addr_street2 ON addr (street2);
        CREATE INDEX cities_norm ON cities (norm);
    ''')
    unique = db.execute('SELECT COUNT(*) FROM addr').fetchone()[0]
    db.executemany('INSERT INTO meta VALUES (?, ?)', [
        ('built_at', time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())),
        ('roll', folder),
        ('counties', ','.join(counties)),
        ('addresses', str(unique)),
    ])
    db.commit()
    db.execute('VACUUM')
    db.close()
    os.replace(TMP, TARGET)
    size = os.path.getsize(TARGET) / 1e6
    print(f'> listo: {unique} direcciones unicas, {size:.0f} MB en {TARGET}', flush=True)


if __name__ == '__main__':
    main()
