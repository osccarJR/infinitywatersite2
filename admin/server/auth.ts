/**
 * Acceso al panel.
 *
 * - Contrasenas con scrypt (sal aleatoria por usuario).
 * - La cookie lleva un token aleatorio; en la base solo se guarda su hash,
 *   asi una copia robada de la base no sirve para entrar.
 * - Sesion de 30 dias que se renueva sola con el uso (el dueno entra desde
 *   el telefono y no queremos pedirle la clave cada dia).
 * - Limite de intentos por IP y por usuario contra fuerza bruta.
 */
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { DB } from './db.ts';
import type { User } from '../shared/domain.ts';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

export const SESSION_COOKIE = 'iw_admin';
export const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEY_LEN, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Hash de relleno para que un usuario inexistente tarde lo mismo que uno real. */
let dummyHash: Promise<string> | null = null;
export const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

type UserRow = {
  id: number;
  username: string;
  name: string;
  role: 'admin';
  active: number;
  last_login_at: string | null;
  password_hash: string;
};

export const toUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  name: row.name,
  role: row.role,
  active: Boolean(row.active),
  lastLoginAt: row.last_login_at,
});

export function findUserByUsername(db: DB, username: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as UserRow | undefined;
}

export function createSession(db: DB, userId: number, ip: string, userAgent: string): string {
  const token = randomBytes(32).toString('base64url');
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, ip, user_agent)
     VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'), ?, ?)`
  ).run(sha256(token), userId, ip, userAgent.slice(0, 300));
  db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(userId);
  return token;
}

/** Usuario de la sesion, o null. Renueva la sesion si le queda menos de la mitad. */
export function userFromSession(db: DB, token: string | undefined): { user: User; renewed: boolean } | null {
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const row = db
    .prepare(
      `SELECT u.*, s.expires_at AS session_expires,
              (julianday(s.expires_at) - julianday('now')) AS days_left
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = ? AND s.expires_at > datetime('now') AND u.active = 1`
    )
    .get(id) as (UserRow & { days_left: number }) | undefined;
  if (!row) return null;

  let renewed = false;
  if (row.days_left < SESSION_DAYS / 2) {
    db.prepare(`UPDATE sessions SET expires_at = datetime('now', '+${SESSION_DAYS} days') WHERE id = ?`).run(id);
    renewed = true;
  }
  return { user: toUser(row), renewed };
}

export function deleteSession(db: DB, token: string | undefined) {
  if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(sha256(token));
}

export function deleteUserSessions(db: DB, userId: number, exceptToken?: string) {
  if (exceptToken) db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(userId, sha256(exceptToken));
  else db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function purgeExpiredSessions(db: DB) {
  db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run();
}

/* ------------------------------------------------------------------ */
/* Limite de intentos                                                   */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
/** Por usuario Y por IP: asi un tercero no puede dejar fuera al dueno fallando a proposito. */
const MAX_PER_USER_IP = 6;
const failures = new Map<string, number[]>();

function recent(key: string) {
  const now = Date.now();
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list;
}

export function loginBlocked(ip: string, username: string): boolean {
  return recent(`ip:${ip}`).length >= MAX_PER_IP || recent(`u:${username.toLowerCase()}@${ip}`).length >= MAX_PER_USER_IP;
}

export function recordLoginFailure(ip: string, username: string) {
  recent(`ip:${ip}`).push(Date.now());
  recent(`u:${username.toLowerCase()}@${ip}`).push(Date.now());
}

export function clearLoginFailures(ip: string, username: string) {
  failures.delete(`u:${username.toLowerCase()}@${ip}`);
}

// Limpieza periodica para que el mapa no crezca sin limite.
setInterval(() => {
  for (const key of failures.keys()) if (recent(key).length === 0) failures.delete(key);
}, WINDOW_MS).unref();
