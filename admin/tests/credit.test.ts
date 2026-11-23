// Solicitudes de credito: cifrado, huella de firma con llave y limpieza de datos de identidad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase } from '../server/db.ts';
import * as credit from '../server/credit.ts';
import { emptyCreditData } from '../shared/credit.ts';

test('créditos: la huella de firma no es un SHA-256 adivinable y la limpieza alcanza a las enviadas sin decidir', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'iw-credit-'));
  try {
    const db = openDatabase(dir);
    credit.initCreditKey(dir);
    db.prepare(`INSERT INTO users (id, username, name, password_hash) VALUES (1, 'u', 'U', 'x')`).run();
    const secret = { applicant: { ssn: '512347788', dob: '1984-07-19', dl: '', dlExp: '' }, coApplicant: null };
    const parts = { id: 1, secret };
    const hash = credit.signatureHash(parts);
    assert.notEqual(hash, createHash('sha256').update(JSON.stringify(parts)).digest('hex'), 'lleva llave');
    assert.equal(hash, credit.signatureHash(parts), 'es estable');

    const base = { brandId: null, clientId: null, sellerId: null, appDate: '2026-01-01', amount: 100, data: emptyCreditData(), secret };
    const draft = credit.insertCreditApp(db, base, 1);
    const sent = credit.insertCreditApp(db, base, 1);
    const fresh = credit.insertCreditApp(db, base, 1);
    credit.saveCreditFile(db, sent, 'id1-front', 'image/jpeg', Buffer.from([0xff, 0xd8, 1]));
    credit.saveCreditFile(db, sent, 'sig-applicant', 'image/png', Buffer.from('89504e470d0a1a0a', 'hex'));
    db.prepare(`UPDATE credit_apps SET updated_at = datetime('now', '-40 days') WHERE id = ?`).run(draft);
    db.prepare(`UPDATE credit_apps SET status = 'submitted', submitted_at = datetime('now', '-100 days') WHERE id = ?`).run(sent);
    db.prepare(`UPDATE credit_apps SET status = 'submitted', submitted_at = datetime('now', '-5 days') WHERE id = ?`).run(fresh);

    const purged = credit.purgeCreditSecrets(db).sort();
    assert.deepEqual(purged, [draft, sent].sort());
    const after = credit.getCreditApp(db, sent)!;
    assert.equal(after.rawSecret.applicant.ssn, '');
    assert.ok(after.purged);
    assert.deepEqual(after.files, ['sig-applicant'], 'las firmas se quedan; las IDs no');
    assert.equal(credit.getCreditApp(db, fresh)!.rawSecret.applicant.ssn, '512347788', 'la reciente no se toca');

    // Si se vuelven a escribir datos, deja de contar como limpiada (y se vuelve a limpiar a su tiempo).
    credit.updateCreditApp(db, draft, { ...base, secret: { applicant: { ssn: '111223333', dob: '1990-01-01', dl: '', dlExp: '' }, coApplicant: null } }, 1);
    assert.equal(credit.getCreditApp(db, draft)!.purged, false);
    assert.throws(() => credit.setCreditFields(db, draft, 1, { 'status = 1, secret': 'x' }), /no permitida/);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('créditos: las huellas de la primera versión se convierten a HMAC al arrancar', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'iw-credit-'));
  try {
    const db = openDatabase(dir);
    credit.initCreditKey(dir);
    db.prepare(`INSERT INTO users (id, username, name, password_hash) VALUES (1, 'u', 'U', 'x')`).run();
    const id = credit.insertCreditApp(db, { brandId: null, clientId: null, sellerId: null, appDate: '2026-01-01', amount: 1, data: emptyCreditData(), secret: { applicant: { ssn: '', dob: '', dl: '', dlExp: '' }, coApplicant: null } }, 1);
    const old = 'a'.repeat(64);
    db.prepare('UPDATE credit_apps SET signatures = ? WHERE id = ?').run(JSON.stringify({ applicant: { name: 'A', at: 'x', ip: null, device: null, hash: old } }), id);
    assert.equal(credit.upgradeLegacyHashes(db), 1);
    const sig = credit.getCreditApp(db, id)!.signatures.applicant!;
    assert.notEqual(sig.hash, old);
    assert.equal(sig.alg, 'hmac-legacy');
    assert.equal(credit.upgradeLegacyHashes(db), 0, 'una sola vez');
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
