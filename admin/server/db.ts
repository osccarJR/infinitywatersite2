/**
 * Base de datos SQLite (un solo archivo en DATA_DIR/admin.db).
 *
 * Las migraciones se aplican en orden segun `PRAGMA user_version`. Para
 * cambiar el esquema se AGREGA una migracion nueva al final; nunca se edita
 * una que ya corrio en produccion.
 *
 * Los catalogos (equipo, financieras, proveedores) no se pueden borrar si
 * alguna venta los usa (FOREIGN KEY sin ON DELETE): se desactivan.
 */
import Database from 'better-sqlite3';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { todayISO } from '../shared/domain.ts';

const MIGRATIONS: string[] = [
  /* 1: esquema inicial */ `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );

  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,               -- sha256 del token; el token solo vive en la cookie
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE people (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    is_seller INTEGER NOT NULL DEFAULT 0,
    is_installer INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE financiers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE clients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    phone2 TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    zip TEXT,
    language TEXT,
    source TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE sales (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sale_date TEXT NOT NULL,
    install_date TEXT,
    installer_id INTEGER REFERENCES people(id),
    install_address TEXT,
    install_city TEXT,
    install_zip TEXT,
    water_source TEXT,
    eq_outdoor_tanks INTEGER NOT NULL DEFAULT 0,
    eq_aerator INTEGER NOT NULL DEFAULT 0,
    eq_ro INTEGER NOT NULL DEFAULT 0,
    eq_ro_type TEXT,
    eq_ro_uv INTEGER NOT NULL DEFAULT 0,
    eq_other TEXT,
    price INTEGER,
    payment_method TEXT,
    financier_id INTEGER REFERENCES financiers(id),
    cash_down INTEGER,
    funded_amount INTEGER,
    funded_paid INTEGER NOT NULL DEFAULT 0,
    funded_date TEXT,
    seller_id INTEGER REFERENCES people(id),
    commission INTEGER,
    commission_paid INTEGER NOT NULL DEFAULT 0,
    commission_paid_date TEXT,
    installer_pay INTEGER,
    next_service_date TEXT,
    notes TEXT,
    is_legacy INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX sales_client ON sales(client_id);
  CREATE INDEX sales_date ON sales(sale_date);

  CREATE TABLE sale_suppliers (
    id INTEGER PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    cost INTEGER,
    position INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX sale_suppliers_sale ON sale_suppliers(sale_id);

  CREATE TABLE services (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
    reported_date TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'problem',
    problem TEXT NOT NULL,
    solution TEXT,
    technician_id INTEGER REFERENCES people(id),
    visit_date TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    closed_date TEXT,
    billing TEXT,
    amount INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX services_client ON services(client_id);

  CREATE TABLE audit (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL DEFAULT (datetime('now')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    detail TEXT
  );
  `,
  /* 2: estado (FL, GA, TX...) del cliente y del lugar de instalacion: el
        negocio puede atender en cualquier parte de EE. UU. */ `
  ALTER TABLE clients ADD COLUMN state TEXT;
  ALTER TABLE sales ADD COLUMN install_state TEXT;
  `,
  /* 3: osmosis inversa de toda la casa (numero de membranas, 0 = no tiene) */ `
  ALTER TABLE sales ADD COLUMN eq_whole_ro INTEGER NOT NULL DEFAULT 0;
  `,
];

export type DB = Database.Database;

export function openDatabase(dataDir: string): DB {
  mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, 'admin.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  migrate(db);
  return db;
}

function migrate(db: DB) {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let version = current; version < MIGRATIONS.length; version++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[version]);
      db.pragma(`user_version = ${version + 1}`);
    })();
  }
}

/**
 * Copia diaria en DATA_DIR/backups (se conservan las ultimas `keep`).
 * Usa la API de backup de SQLite: es segura con la base en uso.
 */
export async function backupDatabase(db: DB, dataDir: string, keep = 30) {
  const dir = path.join(dataDir, 'backups');
  mkdirSync(dir, { recursive: true });
  const stamp = todayISO();
  await db.backup(path.join(dir, `admin-${stamp}.db`));
  const files = readdirSync(dir)
    .filter((f) => /^admin-\d{4}-\d{2}-\d{2}\.db$/.test(f))
    .sort();
  for (const old of files.slice(0, Math.max(files.length - keep, 0))) rmSync(path.join(dir, old));
  const predeploy = readdirSync(dir).filter((f) => f.startsWith('pre-deploy-')).sort();
  for (const old of predeploy.slice(0, Math.max(predeploy.length - 10, 0))) rmSync(path.join(dir, old));
}
