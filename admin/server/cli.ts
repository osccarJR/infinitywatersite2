/**
 * Administracion de usuarios desde la terminal del servidor. No hay
 * registro publico: el primer usuario se crea aqui.
 *
 *   node dist/server/cli.js crear <usuario> "<Nombre>"       # genera la clave
 *   node dist/server/cli.js clave <usuario>                  # nueva clave
 *   node dist/server/cli.js lista
 *   node dist/server/cli.js borrar-datos --confirmar          # deja el sistema en cero
 *
 * `borrar-datos` elimina clientes, ventas, servicios, equipo, financieras y
 * proveedores (para quitar los datos de ejemplo antes de empezar de verdad).
 * Conserva los usuarios y guarda antes una copia en data/backups.
 *
 * Usa DATA_DIR igual que el servidor.
 */
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { openDatabase } from './db.ts';
import { deleteUserSessions, hashPassword } from './auth.ts';

const dataDir = path.resolve(process.env.DATA_DIR ?? 'data');
const db = openDatabase(dataDir);
const [command, username, name] = process.argv.slice(2);

/** Clave facil de dictar por telefono: 4 grupos sin letras ambiguas. */
function generatePassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(16);
  const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join('')).join('-');
}

async function main() {
  if (command === 'crear' && username && name) {
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw new Error('Usuario: de 3 a 40 letras minusculas, numeros, punto o guion');
    const password = process.env.PASSWORD || generatePassword();
    db.prepare('INSERT INTO users (username, name, password_hash) VALUES (?, ?, ?)').run(username, name, await hashPassword(password));
    console.log(`Usuario creado.\n  usuario:    ${username}\n  contrasena: ${password}`);
  } else if (command === 'clave' && username) {
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    if (!user) throw new Error(`No existe el usuario ${username}`);
    const password = process.env.PASSWORD || generatePassword();
    db.prepare('UPDATE users SET password_hash = ?, active = 1 WHERE id = ?').run(await hashPassword(password), user.id);
    deleteUserSessions(db, user.id);
    console.log(`Contrasena nueva para ${username}: ${password}\n(se cerraron sus sesiones abiertas)`);
  } else if (command === 'borrar-datos') {
    if (process.argv[3] !== '--confirmar') {
      throw new Error('Esto borra TODOS los clientes, ventas y servicios. Para hacerlo: borrar-datos --confirmar');
    }
    const backups = path.join(dataDir, 'backups');
    mkdirSync(backups, { recursive: true });
    const file = path.join(backups, `antes-de-borrar-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
    await db.backup(file);
    const count = (table: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
    const before = { clientes: count('clients'), ventas: count('sales'), servicios: count('services') };
    db.transaction(() => {
      for (const table of ['inventory_movements', 'inventory_items', 'payable_payments', 'payables', 'payable_accounts', 'services', 'sale_suppliers', 'sales', 'clients', 'people', 'financiers', 'suppliers', 'audit']) {
        db.prepare(`DELETE FROM ${table}`).run();
      }
    })();
    db.exec('VACUUM');
    console.log(`Datos borrados: ${before.clientes} clientes, ${before.ventas} ventas, ${before.servicios} servicios.`);
    console.log(`Los usuarios se conservan. Copia previa en ${file}`);
  } else if (command === 'lista') {
    console.table(db.prepare('SELECT id, username, name, active, last_login_at FROM users').all());
  } else {
    console.log('Uso:\n  crear <usuario> "<Nombre>"\n  clave <usuario>\n  lista\n  borrar-datos --confirmar');
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
