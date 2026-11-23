/**
 * Rutas de solicitudes de credito y autorizacion de instalacion.
 *
 * Quien ve que:
 *  - "credit.review" (el dueno y quien pasa los datos a la financiera): todas,
 *    con el SSN completo (cada vez que lo abre queda en el registro).
 *  - "credit.create" (vendedor): solo las que lleno o en las que es el
 *    vendedor. El SSN completo solo mientras la llena; despues, tapado.
 */
import type { z } from 'zod';
import type { DB } from './db.ts';
import { HttpError, type Router, type Ctx } from './http.ts';
import * as repo from './repo.ts';
import * as credit from './credit.ts';
import { need, scopeOf, seesClient } from './permissions.ts';
import { ClientInput, ContractInput, ContractSignInput, CreditDecisionInput, CreditInput, CreditSignInput, SaleInput, firstIssue } from './schemas.ts';
import {
  CONTRACT_SIGNATURE_FILE,
  CREDIT_FILE_KINDS,
  CREDIT_SIGNATURE_FILE,
  ID_PHOTOS,
  SLOT_LABEL,
  contractTotals,
  creditMissing,
  isMasked,
  maskSecret,
  personName,
  type ContractData,
  type ContractSigner,
  type CreditApp,
  type CreditIdentity,
  type CreditSecret,
  type CreditSigner,
  type CreditSummary,
  type SignatureProof,
} from '../shared/credit.ts';
import { todayISO, type User } from '../shared/domain.ts';
import { GOODLEAP_DOC_VERSION, isGoodLeap } from '../shared/goodleap.ts';
import { deviceOf, type AuditEntry } from './audit.ts';

type Log = (ctx: Ctx, entry: AuditEntry) => void;

function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const { message, field } = firstIssue(result.error);
    throw new HttpError(400, message, field);
  }
  return result.data;
}

const me = (ctx: Ctx) => {
  if (!ctx.user) throw new HttpError(401, 'Inicia sesión');
  return ctx.user;
};

export const reviews = (u: User) => u.permissions.flags['credit.review'];
const fills = (u: User) => u.permissions.flags['credit.create'];

/** Las que puede ver este usuario. */
export function seesCredit(u: User, app: Pick<CreditSummary, 'createdById' | 'sellerId'>) {
  if (reviews(u)) return true;
  if (!fills(u)) return false;
  return app.createdById === u.id || (u.permissions.personId != null && app.sellerId === u.permissions.personId);
}

export const visibleCredit = (db: DB, u: User): CreditSummary[] =>
  reviews(u) || fills(u) ? credit.listCreditApps(db).filter((a) => seesCredit(u, a)) : [];

const digits = (v: string) => v.replace(/\D/g, '');

/** Lo que falta para poder firmar y enviar la solicitud (la app revisa lo mismo antes). */
function missingForSubmit(app: CreditApp & { rawSecret: CreditSecret }): { message: string; field: string } | null {
  const missing = creditMissing({ data: app.data, secret: app.rawSecret, files: app.files, amount: app.amount });
  return missing.length ? { message: `Falta ${missing.map((m) => m.label).join(', ')}.`, field: missing[0].field } : null;
}

/** Version del texto de consentimiento de firma electronica que ve cada firmante. */
const CONSENT_VERSION = 'esign-es-en-v1';

/** Cliente nuevo con los datos de la solicitud: lo que no pasa la validacion se deja vacio, campo por campo. */
function cleanClient(draft: Record<string, string | null>, homePhone: string): ClientInput {
  const attempt = { ...draft };
  for (let i = 0; i < 12; i++) {
    const result = ClientInput.safeParse(attempt);
    if (result.success) return result.data;
    const field = String(result.error.issues[0]?.path[0] ?? '');
    if (!field || field === 'name' || attempt[field] == null) return ClientInput.parse({ name: attempt.name || 'Cliente' });
    // El celular malo: se intenta con el telefono de la casa antes de dejarlo vacio.
    attempt[field] = field === 'phone' && homePhone && attempt.phone !== homePhone ? homePhone : null;
    if (field === 'phone' && attempt.phone === homePhone) attempt.phone2 = null;
  }
  return ClientInput.parse({ name: attempt.name || 'Cliente' });
}

export function creditRoutes(api: Router, db: DB, log: Log) {
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const dollars = (cents: number | null | undefined) => (cents == null ? '—' : usd.format(cents / 100));
  const label = (app: Pick<CreditSummary, 'id' | 'applicantName'>) => `la solicitud de crédito de ${app.applicantName} (#${app.id})`;
  const num = (ctx: Ctx) => Number(ctx.params.id);

  /** La solicitud, comprobando que este usuario la pueda ver. */
  const load = (ctx: Ctx) => {
    const user = me(ctx);
    need(reviews(user) || fills(user));
    const app = credit.getCreditApp(db, num(ctx));
    if (!app || !seesCredit(user, app)) throw new HttpError(404, 'Esa solicitud no existe o no tienes acceso.');
    return { user, app };
  };
  /** El vendedor de la solicitud (o quien la lleno): llena la autorizacion de instalacion. */
  const isFiller = (user: User, app: CreditApp) => app.createdById === user.id || (user.permissions.personId != null && app.sellerId === user.permissions.personId);
  /** Puede cambiarla: quien la lleno (o la oficina) mientras no se haya enviado. */
  const canEditDraft = (user: User, app: CreditApp) => app.status === 'draft' && (reviews(user) || app.createdById === user.id);
  /** Nombre de quien firma como vendedor: el usuario que esta firmando. */
  const signerName = (user: User) => (user.permissions.personId ? repo.listPeople(db).find((p) => p.id === user.permissions.personId)?.name : null) ?? user.name;
  const exists = (table: 'people' | 'brands' | 'financiers', id: number | null) => id == null || Boolean(db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id));
  /** Firma dibujada: PNG de verdad (cabecera del archivo). */
  const png = (dataUrl: string, field: string) => {
    const data = Buffer.from(dataUrl.split(',')[1], 'base64');
    if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new HttpError(400, 'La firma no es válida. Fírmala otra vez.', field);
    return data;
  };
  /** Lo que se firmo tiene que ser lo que se vio en pantalla. */
  const sameVersion = (ctx: Ctx, app: CreditApp) => {
    const seen = (ctx.body as { expectedUpdatedAt?: unknown })?.expectedUpdatedAt;
    if (typeof seen === 'string' && seen !== app.updatedAt) throw new HttpError(409, 'La solicitud cambió mientras la tenías abierta. Ciérrala y vuelve a abrirla antes de firmar.');
  };

  /** Lo que se le manda a la app: el SSN tapado salvo a quien la esta llenando. */
  const shape = (ctx: Ctx, user: User, app: CreditApp & { rawSecret?: CreditSecret }): CreditApp => {
    const { rawSecret: _raw, ...rest } = app;
    // Completo solo para quien la lleno, mientras la llena. La oficina lo ve con /secret (queda anotado).
    const full = !ctx.viewer && app.status === 'draft' && app.createdById === user.id;
    return { ...rest, secret: full ? app.secret : maskSecret(app.secret), secretMasked: !full };
  };

  /** Mezcla lo que llega con lo guardado: lo tapado (•••) se queda como estaba. */
  const mergeIdentity = (incoming: CreditIdentity | null, stored: CreditIdentity | null | undefined): CreditIdentity | null => {
    if (!incoming) return null;
    const keep = (field: keyof CreditIdentity) => (isMasked(incoming[field]) ? stored?.[field] ?? '' : incoming[field]);
    return { ssn: digits(keep('ssn')).slice(0, 9), dob: keep('dob'), dl: keep('dl'), dlExp: keep('dlExp') };
  };

  const writeOf = (input: CreditInput, user: User, stored?: CreditApp & { rawSecret: CreditSecret }): credit.CreditWrite => {
    if (input.clientId) {
      if (!repo.getClient(db, input.clientId)) throw new HttpError(400, 'El cliente elegido ya no existe', 'clientId');
      // Solo un cliente que este usuario ya puede ver.
      const own = user.permissions.flags['clients.view'] && seesClient(scopeOf(db, user), input.clientId);
      if (!reviews(user) && !own && input.clientId !== stored?.clientId) throw new HttpError(403, 'No tienes acceso a ese cliente.', 'clientId');
    }
    // El vendedor es quien la llena; solo la oficina la puede poner a nombre de otro.
    const sellerId = reviews(user) ? input.sellerId ?? user.permissions.personId : stored ? stored.sellerId : user.permissions.personId;
    if (!exists('people', sellerId)) throw new HttpError(400, 'El vendedor elegido ya no existe', 'sellerId');
    if (!exists('brands', input.brandId)) throw new HttpError(400, 'La marca elegida ya no existe', 'brandId');
    return {
      brandId: input.brandId,
      clientId: input.clientId,
      sellerId,
      appDate: input.appDate,
      amount: input.amount,
      data: {
        ...input.data,
        references: [0, 1, 2].map((i) => input.data.references[i] ?? { name: '', relationship: '', phone: '' }),
        // La nota de la oficina sigue a la vista hasta que se vuelve a enviar.
        returnNote: stored?.data.returnNote ?? null,
      },
      secret: {
        applicant: mergeIdentity(input.secret.applicant, stored?.rawSecret.applicant)!,
        coApplicant: input.data.coApplicant ? mergeIdentity(input.secret.coApplicant ?? { ssn: '', dob: '', dl: '', dlExp: '' }, stored?.rawSecret.coApplicant) : null,
      },
    };
  };

  const fresh = (ctx: Ctx, user: User, id: number) => ({ app: shape(ctx, user, credit.getCreditApp(db, id)!) });

  /* ------------------------------ solicitud ------------------------------ */

  api.add('GET', '/credit/:id', (ctx) => {
    const { user, app } = load(ctx);
    return { app: shape(ctx, user, app) };
  });

  api.add('POST', '/credit', (ctx) => {
    const user = me(ctx);
    need(fills(user) || reviews(user));
    const input = parse(CreditInput, ctx.body);
    const id = credit.insertCreditApp(db, writeOf(input, user), user.id);
    const app = credit.getCreditApp(db, id)!;
    log(ctx, { action: 'create', entity: 'credit', entityId: id, label: label(app), changes: [{ f: 'Monto a financiar', b: dollars(app.amount) }] });
    return fresh(ctx, user, id);
  });

  api.add('PUT', '/credit/:id', (ctx) => {
    const { user, app } = load(ctx);
    need(canEditDraft(user, app), app.status === 'draft' ? undefined : 'Esta solicitud ya se envió: no se puede cambiar. Si hay que corregir algo, la oficina la devuelve.');
    const input = parse(CreditInput, ctx.body);
    if (input.expectedUpdatedAt && input.expectedUpdatedAt !== app.updatedAt) throw new HttpError(409, 'Alguien cambió esta solicitud mientras la editabas. Sal sin guardar y vuelve a abrirla.');
    const write = writeOf(input, user, app);
    credit.updateCreditApp(db, app.id, write, user.id);
    // Sin coaplicante, sus fotos de ID tampoco quedan.
    if (!write.data.coApplicant) credit.deleteCreditFiles(db, app.id, ['id2-front', 'id2-back']);
    log(ctx, { action: 'update', entity: 'credit', entityId: app.id, label: label(credit.getCreditApp(db, app.id)!) });
    return fresh(ctx, user, app.id);
  });

  api.add('DELETE', '/credit/:id', (ctx) => {
    const { user, app } = load(ctx);
    // Firmada: queda ligada a la venta (salvo que la venta ya se haya borrado).
    need(app.status !== 'signed' || (reviews(user) && !app.saleId), 'La instalación ya se autorizó: esta solicitud quedó ligada a la venta.');
    need(reviews(user) || canEditDraft(user, app), 'Solo se puede borrar mientras está por firmar.');
    db.prepare('DELETE FROM credit_apps WHERE id = ?').run(app.id);
    log(ctx, { action: 'delete', entity: 'credit', entityId: app.id, label: label(app) });
    return { ok: true };
  });

  /* ------------------------------ archivos ------------------------------ */

  api.add('PUT', '/credit/:id/files/:kind', (ctx) => {
    const { user, app } = load(ctx);
    const kind = ctx.params.kind;
    need((ID_PHOTOS as readonly string[]).includes(kind), 'Archivo no válido');
    need(canEditDraft(user, app), 'Esta solicitud ya se envió: no se pueden cambiar las fotos.');
    const image = (ctx.body as { image?: unknown })?.image;
    const match = typeof image === 'string' ? /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(image) : null;
    if (!match) throw new HttpError(400, 'La foto no es válida. Tómala otra vez.');
    const data = Buffer.from(match[1], 'base64');
    if (data.length > 900_000) throw new HttpError(400, 'La foto es demasiado pesada.');
    if (!(data[0] === 0xff && data[1] === 0xd8)) throw new HttpError(400, 'La foto no es válida. Tómala otra vez.');
    credit.saveCreditFile(db, app.id, kind, 'image/jpeg', data);
    credit.setCreditFields(db, app.id, user.id, {});
    log(ctx, { action: 'update', entity: 'credit', entityId: app.id, label: label(app), changes: [{ f: 'Foto de ID', b: kind.startsWith('id1') ? 'aplicante' : 'coaplicante' }] });
    return fresh(ctx, user, app.id);
  });

  api.add('DELETE', '/credit/:id/files/:kind', (ctx) => {
    const { user, app } = load(ctx);
    need((ID_PHOTOS as readonly string[]).includes(ctx.params.kind) && canEditDraft(user, app));
    credit.deleteCreditFiles(db, app.id, [ctx.params.kind]);
    credit.setCreditFields(db, app.id, user.id, {});
    return fresh(ctx, user, app.id);
  });

  /** Fotos de IDs: la oficina (o quien la llena, mientras la llena). Firmas: quien ve la solicitud. */
  const idViews = new Map<string, number>();
  api.add('GET', '/credit/:id/files/:kind', (ctx) => {
    const { user, app } = load(ctx);
    const kind = ctx.params.kind;
    need(CREDIT_FILE_KINDS.includes(kind), 'Archivo no válido');
    const isId = (ID_PHOTOS as readonly string[]).includes(kind);
    if (isId) {
      need((reviews(user) && !ctx.viewer) || canEditDraft(user, app), 'Las fotos de las IDs solo las ve la oficina.');
      const key = `${user.id}:${app.id}`;
      if (reviews(user) && Date.now() - (idViews.get(key) ?? 0) > 30 * 60 * 1000) {
        idViews.set(key, Date.now());
        log(ctx, { action: 'credit-ids', entity: 'credit', entityId: app.id, label: label(app) });
      }
    }
    const file = credit.readCreditFile(db, app.id, kind);
    if (!file) throw new HttpError(404, 'No hay ese archivo');
    ctx.res.writeHead(200, { 'Content-Type': file.mime, 'Content-Length': file.data.length, 'Cache-Control': 'private, no-store' });
    ctx.res.end(file.data);
    return undefined;
  });

  /** SSN, fecha de nacimiento y licencia completos: solo la oficina, y queda anotado. */
  api.add('GET', '/credit/:id/secret', (ctx) => {
    const { user, app } = load(ctx);
    need(reviews(user), 'Solo la oficina ve el seguro social completo.');
    need(!ctx.viewer, 'En la vista previa no se muestran estos datos.');
    if (app.purged) throw new HttpError(410, 'Estos datos ya se borraron (se guardan solo un tiempo).');
    log(ctx, { action: 'credit-secret', entity: 'credit', entityId: app.id, label: label(app), extra: { motivo: ctx.query.get('para') === 'imprimir' ? 'imprimir' : 'ver' } });
    return { secret: app.rawSecret };
  });

  /* ------------------------------ firmas ------------------------------ */

  const proof = (ctx: Ctx, name: string, hash: string): SignatureProof => ({
    name,
    at: new Date().toISOString(),
    ip: ctx.ip,
    device: deviceOf(String(ctx.req.headers['user-agent'] ?? '')),
    hash,
    alg: 'hmac-v1',
  });
  api.add('POST', '/credit/:id/submit', (ctx) => {
    const { user, app } = load(ctx);
    need(canEditDraft(user, app), 'Esta solicitud ya se envió.');
    const input = parse(CreditSignInput, ctx.body);
    const missing = missingForSubmit(app);
    if (missing) throw new HttpError(400, missing.message, missing.field);
    if (app.data.coApplicant && !input.signatures.coApplicant) throw new HttpError(400, 'Falta la firma del coaplicante.', 'sig-co');
    sameVersion(ctx, app);
    const images = {
      applicant: png(input.signatures.applicant, 'sig-applicant'),
      coApplicant: app.data.coApplicant && input.signatures.coApplicant ? png(input.signatures.coApplicant, 'sig-co') : null,
      rep: png(input.signatures.rep, 'sig-rep'),
    };
    const data = { ...app.data, returnNote: null };
    // La huella cubre la solicitud tal como se firmo, las firmas y el texto que se acepto.
    const hash = credit.signatureHash({
      doc: 'credit-application', v: 1, id: app.id, brandId: app.brandId, appDate: app.appDate, amount: app.amount, data, secret: app.rawSecret,
      files: app.files.filter((f) => (ID_PHOTOS as readonly string[]).includes(f)).sort(),
      signatures: { applicant: credit.imageHash(images.applicant), coApplicant: images.coApplicant ? credit.imageHash(images.coApplicant) : null, rep: credit.imageHash(images.rep) },
      consent: CONSENT_VERSION,
    });
    const signatures: Partial<Record<CreditSigner, SignatureProof>> = {
      applicant: proof(ctx, personName(app.data.applicant), hash),
      ...(app.data.coApplicant ? { coApplicant: proof(ctx, personName(app.data.coApplicant), hash) } : {}),
      rep: proof(ctx, signerName(user), hash),
    };
    db.transaction(() => {
      credit.saveCreditFile(db, app.id, CREDIT_SIGNATURE_FILE.applicant, 'image/png', images.applicant);
      if (images.coApplicant) credit.saveCreditFile(db, app.id, CREDIT_SIGNATURE_FILE.coApplicant, 'image/png', images.coApplicant);
      credit.saveCreditFile(db, app.id, CREDIT_SIGNATURE_FILE.rep, 'image/png', images.rep);
      credit.setCreditFields(db, app.id, user.id, { status: 'submitted', signatures: JSON.stringify(signatures), submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 19), data: JSON.stringify(data) });
    })();
    log(ctx, { action: 'credit-submit', entity: 'credit', entityId: app.id, label: label(app), changes: [{ f: 'Monto a financiar', b: dollars(app.amount) }, { f: 'Firmaron', b: Object.values(signatures).map((s) => s!.name).join(', ') }], extra: { huella: hash } });
    return fresh(ctx, user, app.id);
  });

  /* ------------------------------ decision ------------------------------ */

  api.add('POST', '/credit/:id/decision', (ctx) => {
    const { user, app } = load(ctx);
    need(reviews(user), 'Solo la oficina aprueba o niega créditos.');
    need(app.status === 'submitted' || app.status === 'approved' || app.status === 'declined', app.status === 'signed' ? 'La instalación ya se autorizó.' : 'La solicitud todavía no se ha enviado.');
    const input = parse(CreditDecisionInput, ctx.body);
    if (input.result !== 'return' && !exists('financiers', input.financierId)) throw new HttpError(400, 'La financiera elegida ya no existe', 'financierId');
    const financier = (id: number | null) => (id ? repo.listCatalog(db, 'financiers').find((f) => f.id === id)?.name ?? `#${id}` : '—');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (input.result === 'return') {
      db.transaction(() => {
        credit.deleteCreditFiles(db, app.id, Object.values(CREDIT_SIGNATURE_FILE));
        credit.setCreditFields(db, app.id, user.id, { status: 'draft', signatures: null, submitted_at: null, decision: null, decided_at: null, decided_by: null, data: JSON.stringify({ ...app.data, returnNote: input.notes }) });
      })();
      log(ctx, { action: 'credit-return', entity: 'credit', entityId: app.id, label: label(app), changes: [{ f: 'Corregir', b: input.notes }] });
      return fresh(ctx, user, app.id);
    }
    const decision =
      input.result === 'approved'
        ? { financierId: input.financierId, approvedAmount: input.approvedAmount, apr: input.apr, termMonths: input.termMonths, monthlyPayment: input.monthlyPayment, notes: input.notes }
        : { financierId: input.financierId, approvedAmount: null, apr: null, termMonths: null, monthlyPayment: null, notes: input.notes };
    credit.setCreditFields(db, app.id, user.id, { status: input.result, decision: JSON.stringify(decision), decided_at: now, decided_by: user.id });
    log(ctx, {
      action: input.result === 'approved' ? 'credit-approve' : 'credit-decline',
      entity: 'credit',
      entityId: app.id,
      label: label(app),
      changes: [
        { f: 'Financiera', b: financier(decision.financierId) },
        ...(input.result === 'approved' ? [{ f: 'Aprobado', b: dollars(decision.approvedAmount) }, ...(decision.apr != null ? [{ f: 'APR', b: `${decision.apr} %` }] : []), ...(decision.termMonths ? [{ f: 'Plazo', b: `${decision.termMonths} meses` }] : []), ...(decision.monthlyPayment ? [{ f: 'Cuota', b: dollars(decision.monthlyPayment) }] : [])] : []),
        ...(decision.notes ? [{ f: 'Notas', b: decision.notes }] : []),
      ],
    });
    return fresh(ctx, user, app.id);
  });

  /* ---------------------- autorizacion de instalacion ---------------------- */

  /** La venta va financiada con GoodLeap: hace falta su formulario firmado. */
  const needsGoodLeapForm = (financierId: number | null) =>
    financierId != null && isGoodLeap((db.prepare('SELECT name FROM financiers WHERE id = ?').get(financierId) as { name: string } | undefined)?.name);

  /** El vendedor no puede firmar condiciones distintas a las que aprobo la financiera. */
  const withinDecision = (user: User, app: CreditApp, c: ContractData) => {
    if (reviews(user) || !app.decision) return;
    const d = app.decision;
    if (d.approvedAmount != null && (c.amountToFinance ?? 0) > d.approvedAmount) throw new HttpError(400, `La cantidad a financiar no puede pasar de lo aprobado (${dollars(d.approvedAmount)}).`, 'amountToFinance');
    if (d.apr != null && c.apr != null && c.apr !== d.apr) throw new HttpError(400, `El APR aprobado es ${d.apr} %.`, 'apr');
    if (d.termMonths != null && c.payments != null && c.payments !== d.termMonths) throw new HttpError(400, `El plazo aprobado es de ${d.termMonths} pagos.`, 'payments');
    if (d.monthlyPayment != null && c.monthlyPayment != null && c.monthlyPayment !== d.monthlyPayment) throw new HttpError(400, `La cuota aprobada es ${dollars(d.monthlyPayment)}.`, 'monthlyPayment');
  };

  api.add('PUT', '/credit/:id/contract', (ctx) => {
    const { user, app } = load(ctx);
    need(app.status === 'approved', app.status === 'signed' ? 'La autorización ya se firmó.' : 'El crédito todavía no está aprobado.');
    need(reviews(user) || isFiller(user, app));
    const input = parse(ContractInput, ctx.body);
    sameVersion(ctx, app);
    withinDecision(user, app, input);
    credit.setCreditFields(db, app.id, user.id, { contract: JSON.stringify(input) });
    return fresh(ctx, user, app.id);
  });

  api.add('POST', '/credit/:id/contract/sign', (ctx) => {
    const { user, app } = load(ctx);
    need(app.status === 'approved', app.status === 'signed' ? 'La autorización ya se firmó.' : 'El crédito todavía no está aprobado.');
    need(reviews(user) || isFiller(user, app));
    if (!app.contract) throw new HttpError(400, 'Primero guarda la autorización.');
    sameVersion(ctx, app);
    // La fecha del contrato y de la venta es el dia en que se firma (en Florida).
    const c: ContractData = { ...app.contract, date: todayISO() };
    withinDecision(user, app, c);
    const checks: [boolean, string, string][] = [
      [!c.buyer1.name, 'Falta el nombre del comprador.', 'buyer1.name'],
      [!c.address || !c.city || !c.state, 'Falta la dirección de la instalación.', 'address'],
      [!c.installDate, 'Falta el día de la instalación.', 'installDate'],
      [Boolean(c.installDate && c.installDate < c.date), 'El día de la instalación ya pasó: elige otro.', 'installDate'],
      [Boolean(c.buyer2 && !c.buyer2.name), 'Falta el nombre del comprador 2.', 'buyer2.name'],
      [!c.cashPrice, 'Falta el precio.', 'cashPrice'],
    ];
    const bad = checks.find(([fail]) => fail);
    if (bad) throw new HttpError(400, bad[1], bad[2]);
    const input = parse(ContractSignInput, ctx.body);
    if (c.buyer2 && !input.signatures.buyer2) throw new HttpError(400, 'Falta la firma del comprador 2.', 'sig-buyer2');
    const financierId = (c.amountToFinance ?? 0) > 0 && exists('financiers', app.decision?.financierId ?? null) ? app.decision?.financierId ?? null : null;
    // Con GoodLeap, la financiera exige ademas su formulario "Warranties & Right to Cancel" firmado.
    const goodleap = needsGoodLeapForm(financierId);
    if (goodleap && (!input.signatures.glCustomer || !input.signatures.glRep)) {
      throw new HttpError(400, 'Con GoodLeap, el cliente y el vendedor tienen que firmar también el formulario de GoodLeap.', 'sig-gl');
    }

    const images = {
      buyer1: png(input.signatures.buyer1, 'sig-buyer1'),
      buyer2: c.buyer2 && input.signatures.buyer2 ? png(input.signatures.buyer2, 'sig-buyer2') : null,
      rep: png(input.signatures.rep, 'sig-rep'),
      glCustomer: goodleap ? png(input.signatures.glCustomer!, 'sig-gl') : null,
      glRep: goodleap ? png(input.signatures.glRep!, 'sig-gl') : null,
    };
    const hash = credit.signatureHash({
      doc: 'installation-contract', v: 1, id: app.id, brandId: app.brandId, contract: c, decision: app.decision,
      signatures: { buyer1: credit.imageHash(images.buyer1), buyer2: images.buyer2 ? credit.imageHash(images.buyer2) : null, rep: credit.imageHash(images.rep) },
      ...(goodleap ? { goodleap: { doc: GOODLEAP_DOC_VERSION, customer: credit.imageHash(images.glCustomer!), rep: credit.imageHash(images.glRep!) } } : {}),
      consent: CONSENT_VERSION,
    });
    const signatures: Partial<Record<ContractSigner, SignatureProof>> = {
      buyer1: proof(ctx, c.buyer1.name, hash),
      ...(c.buyer2 ? { buyer2: proof(ctx, c.buyer2.name, hash) } : {}),
      rep: proof(ctx, signerName(user), hash),
      ...(goodleap ? { glCustomer: proof(ctx, c.buyer1.name, hash), glRep: proof(ctx, signerName(user), hash) } : {}),
    };
    const sellerId = exists('people', app.sellerId) ? app.sellerId : null;
    const { total } = contractTotals(c);

    const saleId = db.transaction(() => {
      credit.saveCreditFile(db, app.id, CONTRACT_SIGNATURE_FILE.buyer1, 'image/png', images.buyer1);
      if (images.buyer2) credit.saveCreditFile(db, app.id, CONTRACT_SIGNATURE_FILE.buyer2, 'image/png', images.buyer2);
      credit.saveCreditFile(db, app.id, CONTRACT_SIGNATURE_FILE.rep, 'image/png', images.rep);
      if (images.glCustomer) credit.saveCreditFile(db, app.id, CONTRACT_SIGNATURE_FILE.glCustomer, 'image/png', images.glCustomer);
      if (images.glRep) credit.saveCreditFile(db, app.id, CONTRACT_SIGNATURE_FILE.glRep, 'image/png', images.glRep);

      // El cliente: el que ya estaba elegido o uno nuevo con los datos del aplicante.
      let clientId = app.clientId && repo.getClient(db, app.clientId) ? app.clientId : null;
      if (!clientId) {
        const a = app.data.applicant;
        const draft = {
          name: c.buyer1.name || personName(a),
          phone: c.buyer1.phone || a.cellPhone || a.homePhone || null,
          phone2: a.homePhone && a.homePhone !== (c.buyer1.phone || a.cellPhone) ? a.homePhone : null,
          email: c.buyer1.email || a.email || null,
          address: a.address || c.address || null,
          city: a.city || c.city || null,
          state: a.state || c.state || null,
          zip: a.zip || c.zip || null,
          notes: c.buyer2 ? `Comprador 2: ${c.buyer2.name}` : null,
        };
        // Si un dato no pasa (un correo o un ZIP mal escrito), se crea igual sin ese dato.
        const clean = cleanClient(draft, a.homePhone);
        clientId = repo.insertClient(db, clean, user.id);
        log(ctx, { action: 'create', entity: 'client', entityId: clientId, label: `al cliente ${clean.name}` });
      }
      const sameAsClient = (() => {
        const cl = repo.getClient(db, clientId!);
        return cl && (cl.address ?? '').trim().toLowerCase() === c.address.trim().toLowerCase();
      })();
      const sale = parse(SaleInput, {
        client: { id: clientId },
        brandId: app.brandId,
        status: 'active',
        saleDate: c.date,
        installDate: c.installDate,
        installTime: c.installSlot ? SLOT_LABEL[c.installSlot] : null,
        installAddress: sameAsClient ? null : c.address || null,
        installCity: sameAsClient ? null : c.city || null,
        installStateCode: sameAsClient ? null : c.state || null,
        installZip: sameAsClient ? null : c.zip || null,
        waterSource: c.waterSource,
        equipment: c.equipment,
        price: total || null,
        paymentMethod: (c.amountToFinance ?? 0) > 0 ? 'financed' : 'cash',
        financierId,
        cashDown: c.downPayment,
        sellerId,
        notes: `Autorización de instalación firmada (solicitud de crédito #${app.id}).`,
      });
      const id = repo.insertSale(db, sale, clientId!, user.id);
      // La venta guarda tambien el formulario de GoodLeap (asi se ve e imprime desde la venta).
      if (images.glCustomer && images.glRep) {
        credit.saveSaleFile(db, id, 'gl-customer', 'image/png', images.glCustomer);
        credit.saveSaleFile(db, id, 'gl-rep', 'image/png', images.glRep);
        const form = { source: 'credit', creditId: app.id, doc: GOODLEAP_DOC_VERSION, installDate: c.installDate, customer: signatures.glCustomer, rep: signatures.glRep };
        db.prepare('UPDATE sales SET goodleap_form = ? WHERE id = ?').run(JSON.stringify(form), id);
      }
      credit.setCreditFields(db, app.id, user.id, {
        status: 'signed',
        contract_signatures: JSON.stringify(signatures),
        signed_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sale_id: id,
        client_id: clientId,
        contract: JSON.stringify(c),
      });
      return id;
    })();
    log(ctx, {
      action: 'contract-sign',
      entity: 'credit',
      entityId: app.id,
      label: label(app),
      changes: [{ f: 'Total', b: dollars(total) }, { f: 'Firmaron', b: Object.values(signatures).map((s) => s!.name).join(', ') }, { f: 'Venta', b: `#${saleId}` }],
      extra: { huella: hash },
    });
    return { ...fresh(ctx, user, app.id), saleId };
  });
}
