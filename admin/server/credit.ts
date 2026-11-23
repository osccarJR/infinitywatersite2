/**
 * Solicitudes de credito: guardado, cifrado y limpieza.
 *
 * - El SSN, la fecha de nacimiento y la licencia (`secret`) y todos los
 *   archivos (fotos de IDs y firmas) se guardan cifrados con AES-256-GCM. La
 *   llave vive en DATA_DIR/credit.key, fuera de la base: una copia de la base
 *   sola (la descarga de respaldo, por ejemplo) no deja leer esos datos.
 * - Pasados CREDIT_KEEP_DAYS dias de decidida (o 30 dias sin tocar si quedo a
 *   medias) se borran el SSN, la licencia y las fotos de las IDs. Las firmas
 *   y el resto de la solicitud se quedan.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { DB } from './db.ts';
import {
  CREDIT_KEEP_DAYS,
  ID_PHOTOS,
  emptyCreditData,
  personName,
  type ContractData,
  type ContractSigner,
  type CreditApp,
  type CreditData,
  type CreditDecision,
  type CreditSecret,
  type CreditSigner,
  type CreditStatus,
  type CreditSummary,
  type SignatureProof,
} from '../shared/credit.ts';

/* ------------------------------------------------------------------ */
/* Cifrado                                                              */
/* ------------------------------------------------------------------ */

let key: Buffer | null = null;

export function initCreditKey(dataDir: string) {
  const file = path.join(dataDir, 'credit.key');
  if (!existsSync(file)) writeFileSync(file, randomBytes(32).toString('hex'), { mode: 0o600 });
  key = Buffer.from(readFileSync(file, 'utf8').trim(), 'hex');
  if (key.length !== 32) throw new Error('credit.key no es valida');
}

/** iv (12) + tag (16) + datos cifrados. */
export function encrypt(plain: Buffer): Buffer {
  if (!key) throw new Error('Falta la llave de creditos');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

export function decrypt(sealed: Buffer): Buffer {
  if (!key) throw new Error('Falta la llave de creditos');
  const decipher = createDecipheriv('aes-256-gcm', key, sealed.subarray(0, 12));
  decipher.setAuthTag(sealed.subarray(12, 28));
  return Buffer.concat([decipher.update(sealed.subarray(28)), decipher.final()]);
}

const sealJson = (value: unknown) => encrypt(Buffer.from(JSON.stringify(value))).toString('base64');
const openJson = <T>(text: string | null): T | null => (text ? (JSON.parse(decrypt(Buffer.from(text, 'base64')).toString('utf8')) as T) : null);

/* ------------------------------------------------------------------ */
/* Lectura                                                              */
/* ------------------------------------------------------------------ */

const json = <T>(text: string | null, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

const SELECT = `SELECT a.*, (SELECT name FROM users WHERE id = a.created_by) AS created_by_name,
                       (SELECT name FROM users WHERE id = a.decided_by) AS decided_by_name
                  FROM credit_apps a`;

function toSummary(r: any): CreditSummary {
  const data = json<CreditData>(r.data, emptyCreditData());
  const decision = json<CreditDecision | null>(r.decision, null);
  return {
    id: r.id,
    status: r.status as CreditStatus,
    brandId: r.brand_id,
    clientId: r.client_id,
    sellerId: r.seller_id,
    saleId: r.sale_id,
    appDate: r.app_date,
    amount: r.amount,
    applicantName: personName(data.applicant) || 'Sin nombre',
    coApplicantName: data.coApplicant ? personName(data.coApplicant) || null : null,
    city: [data.applicant.city, data.applicant.state].filter(Boolean).join(', '),
    financierId: decision?.financierId ?? null,
    submittedAt: r.submitted_at,
    decidedAt: r.decided_at,
    signedAt: r.signed_at,
    createdBy: r.created_by_name,
    createdById: r.created_by,
    updatedAt: r.updated_at,
    purged: Boolean(r.purged_at),
  };
}

export const listCreditApps = (db: DB): CreditSummary[] =>
  (db.prepare(`${SELECT} ORDER BY COALESCE(a.submitted_at, a.created_at) DESC, a.id DESC`).all() as any[]).map(toSummary);

export function getCreditApp(db: DB, id: number): (CreditApp & { rawSecret: CreditSecret }) | null {
  const r = db.prepare(`${SELECT} WHERE a.id = ?`).get(id) as any;
  if (!r) return null;
  const files = (db.prepare('SELECT kind FROM credit_files WHERE app_id = ?').all(id) as { kind: string }[]).map((f) => f.kind);
  const secret = openJson<CreditSecret>(r.secret) ?? { applicant: { ssn: '', dob: '', dl: '', dlExp: '' }, coApplicant: null };
  return {
    ...toSummary(r),
    data: json<CreditData>(r.data, emptyCreditData()),
    secret,
    rawSecret: secret,
    secretMasked: false,
    signatures: json(r.signatures, {}),
    decision: json<CreditDecision | null>(r.decision, null),
    decidedBy: r.decided_by_name,
    contract: json<ContractData | null>(r.contract, null),
    contractSignatures: json(r.contract_signatures, {}),
    files,
  };
}

/* ------------------------------------------------------------------ */
/* Escritura                                                            */
/* ------------------------------------------------------------------ */

export interface CreditWrite {
  brandId: number | null;
  clientId: number | null;
  sellerId: number | null;
  appDate: string;
  amount: number | null;
  data: CreditData;
  secret: CreditSecret;
}

export function insertCreditApp(db: DB, v: CreditWrite, userId: number): number {
  return Number(
    db
      .prepare(
        `INSERT INTO credit_apps (brand_id, client_id, seller_id, app_date, amount, data, secret, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(v.brandId, v.clientId, v.sellerId, v.appDate, v.amount, JSON.stringify(v.data), sealJson(v.secret), userId, userId).lastInsertRowid
  );
}

export function updateCreditApp(db: DB, id: number, v: CreditWrite, userId: number) {
  return db
    .prepare(
      `UPDATE credit_apps SET brand_id = ?, client_id = ?, seller_id = ?, app_date = ?, amount = ?, data = ?, secret = ?,
              updated_by = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .run(v.brandId, v.clientId, v.sellerId, v.appDate, v.amount, JSON.stringify(v.data), sealJson(v.secret), userId, id).changes;
}

export const setCreditFields = (db: DB, id: number, userId: number, fields: Record<string, unknown>) => {
  const keys = Object.keys(fields);
  const sets = keys.map((k) => `${k} = @${k}, `).join('');
  return db
    .prepare(`UPDATE credit_apps SET ${sets}updated_by = @__user, updated_at = datetime('now') WHERE id = @__id`)
    .run({ ...Object.fromEntries(keys.map((k) => [k, fields[k] === undefined ? null : fields[k]])), __user: userId, __id: id }).changes;
};

export function saveCreditFile(db: DB, appId: number, kind: string, mime: string, data: Buffer) {
  db.prepare(
    `INSERT INTO credit_files (app_id, kind, mime, data) VALUES (?, ?, ?, ?)
     ON CONFLICT(app_id, kind) DO UPDATE SET mime = excluded.mime, data = excluded.data, created_at = datetime('now')`
  ).run(appId, kind, mime, encrypt(data));
}

export function readCreditFile(db: DB, appId: number, kind: string): { mime: string; data: Buffer } | null {
  const row = db.prepare('SELECT mime, data FROM credit_files WHERE app_id = ? AND kind = ?').get(appId, kind) as { mime: string; data: Buffer } | undefined;
  return row ? { mime: row.mime, data: decrypt(row.data) } : null;
}

export const deleteCreditFiles = (db: DB, appId: number, kinds: readonly string[]) => {
  const del = db.prepare('DELETE FROM credit_files WHERE app_id = ? AND kind = ?');
  for (const k of kinds) del.run(appId, k);
};

/** Huella del documento que se firma: si algo cambia despues, ya no coincide. */
export function documentHash(parts: unknown): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export type { ContractSigner, CreditSigner, SignatureProof };

/* ------------------------------------------------------------------ */
/* Limpieza de datos de identidad                                       */
/* ------------------------------------------------------------------ */

/**
 * Borra el SSN, la licencia y las fotos de las IDs de las solicitudes ya
 * decididas hace mas de CREDIT_KEEP_DAYS dias, y de las que quedaron a medias
 * hace mas de 30. Devuelve cuantas limpio.
 */
export function purgeCreditSecrets(db: DB): number[] {
  const rows = db
    .prepare(
      `SELECT id FROM credit_apps WHERE purged_at IS NULL AND (
         (decided_at IS NOT NULL AND decided_at < datetime('now', ?)) OR
         (status = 'draft' AND updated_at < datetime('now', '-30 days'))
       )`
    )
    .all(`-${CREDIT_KEEP_DAYS} days`) as { id: number }[];
  const empty = sealJson({ applicant: { ssn: '', dob: '', dl: '', dlExp: '' }, coApplicant: null });
  db.transaction(() => {
    for (const { id } of rows) {
      deleteCreditFiles(db, id, ID_PHOTOS);
      db.prepare(`UPDATE credit_apps SET secret = ?, purged_at = datetime('now') WHERE id = ?`).run(empty, id);
    }
  })();
  return rows.map((r) => r.id);
}
