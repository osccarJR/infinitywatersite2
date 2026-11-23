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
  /* 4: marca con la que se instala (Infinity Water, Magic Water...) y estado
        de la venta (las canceladas, declinadas o desinstaladas no suman). */ `
  CREATE TABLE brands (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  INSERT INTO brands (name) VALUES ('Infinity Water'), ('Magic Water'), ('4Elements');
  ALTER TABLE sales ADD COLUMN brand_id INTEGER REFERENCES brands(id);
  ALTER TABLE sales ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  `,
  /* 5: servicio tecnico como rubro propio (medio de pago, pago al tecnico) y
        pago a tecnicos unificado (instalaciones + servicios). */ `
  ALTER TABLE services ADD COLUMN payment_method TEXT;
  ALTER TABLE services ADD COLUMN technician_pay INTEGER;
  ALTER TABLE services ADD COLUMN technician_paid INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE services ADD COLUMN technician_paid_date TEXT;
  ALTER TABLE sales ADD COLUMN installer_paid INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE sales ADD COLUMN installer_paid_date TEXT;
  `,
  /* 6: permisos por usuario, cuentas por pagar e inventario. Los usuarios que
        ya existian siguen siendo administradores (veian todo). */ `
  ALTER TABLE users ADD COLUMN permissions TEXT;

  CREATE TABLE payable_accounts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    kind TEXT NOT NULL DEFAULT 'card',
    last4 TEXT,
    due_day INTEGER,
    credit_limit INTEGER,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE payables (
    id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES payable_accounts(id),
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    amount INTEGER NOT NULL,
    due_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX payables_account ON payables(account_id);

  CREATE TABLE payable_payments (
    id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES payable_accounts(id),
    payable_id INTEGER REFERENCES payables(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    method TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX payable_payments_account ON payable_payments(account_id);

  CREATE TABLE inventory_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    category TEXT NOT NULL DEFAULT 'other',
    sku TEXT,
    cost INTEGER,
    min_stock INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    kind TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost INTEGER,
    supplier_id INTEGER REFERENCES suppliers(id),
    sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX inventory_movements_item ON inventory_movements(item_id);
  `,
  /* 7: dueno (Oscar: solo el ve el registro de actividad y nadie mas toca su
        cuenta) y registro de actividad con IP, equipo, nombre del registro y
        firma encadenada. */ `
  ALTER TABLE users ADD COLUMN is_owner INTEGER NOT NULL DEFAULT 0;
  UPDATE users SET is_owner = 1 WHERE id = COALESCE(
    (SELECT id FROM users WHERE username = 'oscar' AND role = 'admin'),
    (SELECT MIN(id) FROM users WHERE role = 'admin')
  );
  ALTER TABLE audit ADD COLUMN ip TEXT;
  ALTER TABLE audit ADD COLUMN device TEXT;
  ALTER TABLE audit ADD COLUMN label TEXT;
  ALTER TABLE audit ADD COLUMN hash TEXT;
  CREATE INDEX audit_at ON audit(at);
  CREATE INDEX audit_user ON audit(user_id);
  `,
  /* 8: color y red (Visa, Mastercard...) elegidos para cada tarjeta. */ `
  ALTER TABLE payable_accounts ADD COLUMN color TEXT;
  ALTER TABLE payable_accounts ADD COLUMN network TEXT;
  `,
  /* 9: cada cuenta de proveedor es el mismo proveedor del catalogo (el de las
        ventas y el inventario): asi sus facturas, costos y compras van juntos. */ `
  ALTER TABLE payable_accounts ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL;
  `,
  /* 10: foto de perfil de cada usuario (aparte, para no cargarla en cada peticion). */ `
  CREATE TABLE user_avatars (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mime TEXT NOT NULL,
    data BLOB NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  ALTER TABLE users ADD COLUMN avatar_at TEXT;
  `,
  /* 11: hora de la instalacion (franja que se le pasa al tecnico) y la
        garantia generada (equipos y seriales, para reimprimirla igual). */ `
  ALTER TABLE sales ADD COLUMN install_time TEXT;
  ALTER TABLE sales ADD COLUMN warranty TEXT;
  `,
  /* 12: factura en ingles emitida por Global Innovation Group (una por
        venta, con numero unico y correlativo). */ `
  ALTER TABLE sales ADD COLUMN invoice TEXT;
  ALTER TABLE sales ADD COLUMN invoice_no INTEGER;
  CREATE UNIQUE INDEX sales_invoice_no ON sales(invoice_no) WHERE invoice_no IS NOT NULL;
  `,
  /* 13: hora de la visita de servicio (sale en el reporte de mantenimiento). */ `
  ALTER TABLE services ADD COLUMN visit_time TEXT;
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
