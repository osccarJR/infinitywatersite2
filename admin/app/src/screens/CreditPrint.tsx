/**
 * Solicitud de credito y autorizacion de instalacion, tamano carta, igual que
 * los formularios en papel del negocio (con la marca de la venta y los textos
 * corregidos). Se imprimen, se guardan en PDF o se mandan al cliente por
 * WhatsApp como PDF.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Loader2, Printer, Send } from 'lucide-react';
import {
  CONTRACT_SIGNATURE_FILE,
  CREDIT_SIGNATURE_FILE,
  brandLogo,
  cancelDeadline,
  contractTotals,
  formatSsn,
  isMasked,
  personName,
  type CreditApp,
  type CreditPerson,
  type CreditSecret,
  type SignatureProof,
} from '../../../shared/credit.ts';
import { equipmentSummary } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { api } from '../lib/api.ts';
import { formatPhone } from '../lib/format.ts';
import { ALIMONY_NOTE, COMPANY_ADDRESS, COMPANY_PHONES, CREDIT_AUTH, SECOND_OFFICE, contractText } from '../lib/creditText.ts';
import { documentPdf, sharePdf } from '../lib/pdf.ts';
import { GOODLEAP_DOC, isGoodLeap } from '../../../shared/goodleap.ts';

const longEn = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longEs = new Intl.DateTimeFormat('es-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const dateEn = (iso: string | null | undefined) => (iso ? longEn.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`)) : '');
const dateEs = (iso: string | null | undefined) => (iso ? longEs.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`)) : '');
/** Dia en Florida de una hora guardada en UTC ("2026-11-23 01:10:00" o ISO). */
const floridaDay = (stamp: string) => {
  const d = new Date(stamp.includes('T') ? stamp : `${stamp.replace(' ', 'T')}Z`);
  return Number.isNaN(d.getTime()) ? stamp.slice(0, 10) : new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
};
const mdy = (iso: string | null | undefined) => (iso ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}` : '');
const usd = (cents: number | null | undefined) => (cents == null ? '' : `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const phone = (v: string | null | undefined) => (v ? formatPhone(v) : '');
const fileUrl = (app: CreditApp, kind: string) => `/admin/api/credit/${app.id}/files/${kind}?v=${encodeURIComponent(app.updatedAt)}`;
const stamp = (p: SignatureProof | undefined) =>
  p ? `Signed electronically ${new Date(p.at).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })} ET · ID ${p.hash.slice(0, 12)}` : '';

function useApp(id: number) {
  const [app, setApp] = useState<CreditApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ app: CreditApp }>(`/credit/${id}`)
      .then((r) => setApp(r.app))
      .catch((err) => setError(err.message));
  }, [id]);
  return { app, error };
}

function Logo({ brand }: { brand: string }) {
  const src = brandLogo(brand);
  return src ? <img className="cp-logo" src={src} alt={brand} /> : <div className="cp-wordmark">{brand.toUpperCase()}</div>;
}

/** Barra de arriba: volver, enviar el PDF y la impresion. */
function Toolbar({ title, filename, canShare = true, done }: { title: string; filename: string; canShare?: boolean; done?: boolean }) {
  const [state, setState] = useState<'idle' | 'making' | 'ready'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const file = useRef<File | null>(null);

  const send = async () => {
    setMessage(null);
    try {
      if (!file.current) {
        setState('making');
        file.current = await documentPdf([...document.querySelectorAll<HTMLElement>('.wp-page')], filename);
      }
      setState('idle');
      const result = await sharePdf(file.current, title);
      if (result === 'blocked') {
        setState('ready');
        setMessage('PDF listo: toca «Enviar PDF» otra vez.');
        return;
      }
      setState('idle');
      if (result === 'downloaded') setMessage('PDF descargado. Búscalo en Descargas para mandarlo.');
    } catch (err: any) {
      setState('idle');
      setMessage(err?.message || 'No se pudo hacer el PDF. Usa Imprimir → Guardar como PDF.');
    }
  };

  return (
    <>
    {(message || done) && (
      <div className={`wp-message no-print${done && !message ? ' ok' : ''}`} role="status">
        {message ?? 'Firmado. La venta quedó registrada: envíale este PDF al cliente con «Enviar PDF».'}
        {done && !message && (
          <a href="/admin/" className="wp-message-link">
            Ir a Inicio
          </a>
        )}
      </div>
    )}
    <div className="wp-toolbar no-print">
      <button type="button" onClick={() => (history.length > 1 ? history.back() : window.close())}>
        <ArrowLeft size={18} /> Volver
      </button>
      <span>{title}</span>
      {canShare && (
        <button type="button" className={state === 'ready' ? 'primary pulse' : ''} onClick={send} disabled={state === 'making'}>
          {state === 'making' ? <Loader2 size={18} className="spin" /> : <Send size={18} />} {state === 'making' ? 'Preparando…' : 'Enviar PDF'}
        </button>
      )}
      <button type="button" className="primary" onClick={() => window.print()}>
        <Printer size={18} /> <span className="hide-sm">Imprimir</span>
      </button>
    </div>
    </>
  );
}

function Cell({ en, es, children, className = '' }: { en: string; es?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`cp-cell ${className}`}>
      <label>
        {en}
        {es && <> / {es}</>}
      </label>
      <span>{children}</span>
    </div>
  );
}

const Box = ({ on }: { on: boolean }) => <span className={`cp-box${on ? ' on' : ''}`}>{on ? '✕' : ''}</span>;

function Missing({ error }: { error: string | null }) {
  return (
    <div className="wp-missing">
      <p>{error ?? 'Cargando…'}</p>
      {error && <a href="/admin/creditos">Volver</a>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Solicitud de credito                                                 */
/* ------------------------------------------------------------------ */

export function CreditPrint({ id, copy }: { id: number; copy: boolean }) {
  const data = useData();
  const a = useAccess();
  const { app, error } = useApp(id);
  const [secret, setSecret] = useState<CreditSecret | null>(null);
  const full = a.can('credit.review') && !copy;

  useEffect(() => {
    if (!app) return;
    document.title = `Credit Application · ${app.applicantName}`;
    if (full && !app.purged && app.status !== 'draft') {
      api<{ secret: CreditSecret }>(`/credit/${id}/secret?para=imprimir`)
        .then((r) => setSecret(r.secret))
        .catch(() => setSecret(null));
    }
  }, [app, full, id]);

  if (!app) return <Missing error={error} />;
  const brand = (app.brandId ? data.brands.find((b) => b.id === app.brandId)?.name : '') || 'Infinity Water';
  const s = secret ?? app.secret;
  const seller = (app.sellerId ? data.personById.get(app.sellerId)?.name : null) ?? app.createdBy ?? '';
  const ssn = (v: string | undefined) => (!v ? '' : isMasked(v) ? v : formatSsn(v));
  const dob = (v: string | undefined) => (!v ? '' : isMasked(v) ? v : mdy(v));

  const person = (p: CreditPerson | null, id: CreditSecret['applicant'] | null) => (
    <div className="cp-grid">
      <Cell en="Last name" es="Apellido">{p?.lastName}</Cell>
      <Cell en="First name" es="Nombre">{p?.firstName}</Cell>
      <Cell en="SS #" es="No. de Seguro Social">{ssn(id?.ssn)}</Cell>
      <Cell en="Date of birth" es="Fecha de nacimiento">{dob(id?.dob)}</Cell>
      <Cell en="DL or ID #">{id?.dl}</Cell>
      <Cell en="Exp." es="Vence">{mdy(id?.dlExp)}</Cell>
      <Cell en="Cell Ph #" es="Celular">{phone(p?.cellPhone)}</Cell>
      <Cell en="Home Ph #" es="Teléfono casa">{phone(p?.homePhone)}</Cell>
      <Cell en="Email" className="wide">{p?.email}</Cell>
      <Cell en="Address" es="Dirección" className="wide">{p?.address}</Cell>
      <div className="cp-row3 wide">
        <Cell en="City" es="Ciudad">{p?.city}</Cell>
        <Cell en="St" es="Estado">{p?.state}</Cell>
        <Cell en="ZIP" es="Código postal">{p?.zip}</Cell>
      </div>
      <Cell en="Previous address (if less than 3 years at the above)" es="Dirección anterior (menos de 3 años)" className="wide">{p?.previousAddress}</Cell>
    </div>
  );
  const income = (p: CreditPerson | null) => (
    <div className="cp-grid">
      <div className="cp-row3 wide">
        <Cell en="Employer" es="Empleador">{p?.employer}</Cell>
        <Cell en="Years" es="Años">{p?.years}</Cell>
        <Cell en="Salary" es="Salario">{p?.salary}</Cell>
      </div>
      <div className="cp-row2 wide">
        <Cell en="Position" es="Posición">{p?.position}</Cell>
        <Cell en="Business Ph" es="Teléfono trabajo">{phone(p?.businessPhone)}</Cell>
      </div>
      <Cell en="Address" es="Dirección" className="wide">{p?.employerAddress}</Cell>
      <div className="cp-row3 wide">
        <Cell en="City" es="Ciudad">{p?.employerCity}</Cell>
        <Cell en="St" es="Estado">{p?.employerState}</Cell>
        <Cell en="ZIP" es="Código postal">{p?.employerZip}</Cell>
      </div>
      <Cell en="Previous employer (if less than 3 years at the above)" es="Trabajo anterior (menos de 3 años)" className="wide">{p?.previousEmployer}</Cell>
    </div>
  );
  const sig = (who: 'applicant' | 'coApplicant' | 'rep', en: string, es: string, name: string) => {
    const proof = app.signatures[who];
    const file = CREDIT_SIGNATURE_FILE[who];
    return (
      <div className="cp-sign">
        <div className="cp-sign-img">{proof && app.files.includes(file) && <img src={fileUrl(app, file)} alt="" />}</div>
        <div className="cp-sign-line">
          {en} / {es}
        </div>
        <div className="cp-sign-name">{name}</div>
        <div>Date / Fecha: {proof ? mdy(floridaDay(proof.at)) : ''}</div>
        {proof && <div className="cp-sign-proof">{stamp(proof)}</div>}
      </div>
    );
  };
  const home = app.data.home;

  return (
    <div className="wp-root">
      {/* La copia con el seguro social completo solo se imprime: no se manda por WhatsApp. */}
      <Toolbar title={`Solicitud de crédito · ${app.applicantName}`} filename={`Credit-Application-${app.applicantName.replace(/\s+/g, '-')}.pdf`} canShare={!full} />
      <div className="wp-page cp-page">
        {copy && <div className="cp-copy">CUSTOMER COPY · COPIA DEL CLIENTE</div>}
        <header className="cp-head">
          <div>
            <Logo brand={brand} />
            <h1>Credit Application / Solicitud de Crédito</h1>
          </div>
          <div className="cp-topbox">
            <Cell en="Date" es="Fecha">{mdy(app.appDate)}</Cell>
            <Cell en="Amount to finance" es="Monto a financiar">{usd(app.amount)}</Cell>
          </div>
        </header>

        <div className="cp-two">
          <section className="cp-section">
            <h2>Applicant / Aplicante</h2>
            {person(app.data.applicant, s.applicant)}
          </section>
          <section className="cp-section">
            <h2>Co-Applicant / Coaplicante</h2>
            {person(app.data.coApplicant, s.coApplicant)}
          </section>
        </div>

        <section className="cp-section">
          <h2>Mortgage Information / Información sobre su casa</h2>
          <div className="cp-row4">
            <Cell en="Status" es="Estado">
              <span className="cp-options">
                <Box on={home.status === 'paid'} /> Paid / Pagada <Box on={home.status === 'mortgaged'} /> Mortgaged / Financiada <Box on={home.status === 'rent'} /> Rent / Arriendo
              </span>
            </Cell>
            <Cell en="Mortgage company" es="Financiera">{home.company}</Cell>
            <Cell en="Monthly pmt." es="Pago mensual">{home.monthlyPayment}</Cell>
            <Cell en="How long" es="Cuánto tiempo">{home.howLong}</Cell>
          </div>
        </section>

        <div className="cp-two">
          <section className="cp-section">
            <h2>Income Info / Información de Ingresos</h2>
            {income(app.data.applicant)}
          </section>
          <section className="cp-section">
            <h2>Income Info / Información de Ingresos</h2>
            {income(app.data.coApplicant)}
          </section>
        </div>
        <p className="cp-note">
          {ALIMONY_NOTE.en}
          <br />
          {ALIMONY_NOTE.es}
        </p>
        <div className="cp-two cp-other">
          <Cell en="Source of other income" es="Origen de otro ingreso">{app.data.applicant.otherIncome}</Cell>
          <Cell en="Source of other income" es="Origen de otro ingreso">{app.data.coApplicant?.otherIncome}</Cell>
        </div>

        <section className="cp-section">
          <h2>Personal References / Referencias Personales</h2>
          {[0, 1, 2].map((i) => {
            const r = app.data.references[i];
            return (
              <div key={i} className="cp-row3">
                <Cell en="Name" es="Nombre">{r?.name}</Cell>
                <Cell en="Relationship" es="Relación">{r?.relationship}</Cell>
                <Cell en="Phone" es="Teléfono">{phone(r?.phone)}</Cell>
              </div>
            );
          })}
        </section>

        <section className="cp-section cp-auth">
          <p>{CREDIT_AUTH.en}</p>
          <p>{CREDIT_AUTH.es}</p>
          <div className="cp-signs">
            {sig('applicant', 'Signature Applicant', 'Firma Aplicante', personName(app.data.applicant))}
            {sig('coApplicant', 'Signature Co-Applicant', 'Firma Coaplicante', personName(app.data.coApplicant))}
            {sig('rep', 'Signature Representative', 'Firma Representante', seller)}
          </div>
        </section>

        <footer className="cp-foot">
          <div className="cp-phones">
            {COMPANY_PHONES.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
          <div className="cp-addr">
            <i>Address / Dirección</i>
            <span>• {COMPANY_ADDRESS.street}, {COMPANY_ADDRESS.city}</span>
            <span>• {SECOND_OFFICE}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Autorizacion de instalacion (contrato)                               */
/* ------------------------------------------------------------------ */

export function ContractPrint({ id, draft, justSigned }: { id: number; draft: boolean; justSigned?: boolean }) {
  const data = useData();
  const { app, error } = useApp(id);
  useEffect(() => {
    if (app) document.title = `Contract · ${app.applicantName}`;
  }, [app]);
  if (!app) return <Missing error={error} />;
  const c = app.contract;
  if (!c) return <Missing error="Esta autorización todavía no se ha llenado." />;

  const brandRaw = (app.brandId ? data.brands.find((b) => b.id === app.brandId)?.name : '') || 'Infinity Water';
  const B = brandRaw.toUpperCase();
  const text = contractText(B, c.state);
  const t = contractTotals(c);
  const signedDay = app.signedAt ? floridaDay(app.signedAt) : c.date;
  const deadline = cancelDeadline(signedDay);
  const notice = { en: text.notice(dateEn(signedDay), dateEn(deadline)).en, es: text.notice(dateEs(signedDay), dateEs(deadline)).es };
  const signed = app.status === 'signed' && !draft;
  const seller = (app.sellerId ? data.personById.get(app.sellerId)?.name : null) ?? app.createdBy ?? '';
  type Who = 'buyer1' | 'buyer2' | 'rep' | 'glCustomer' | 'glRep';
  const sig = (who: Who) => {
    const file = CONTRACT_SIGNATURE_FILE[who];
    return signed && app.files.includes(file) ? <img src={fileUrl(app, file)} alt="" /> : null;
  };
  const proof = (who: Who) => (signed ? app.contractSignatures[who] : undefined);
  const financeLine = c.payments && c.monthlyPayment ? `${c.payments} × ${usd(c.monthlyPayment)}` : c.payments ? String(c.payments) : usd(c.monthlyPayment);
  // Formulario de GoodLeap: si ya se firmo, o si el credito es con GoodLeap (borrador).
  const financierName = app.decision?.financierId ? data.financierById.get(app.decision.financierId)?.name : null;
  const goodleap = Boolean(app.contractSignatures.glCustomer) || (app.status !== 'signed' && isGoodLeap(financierName) && (c.amountToFinance ?? 0) > 0);
  const pages = 3;

  const Header = () => (
    <header className="ct-head">
      <div>
        <Logo brand={brandRaw} />
        <div className="ct-addr">
          {COMPANY_ADDRESS.street}
          <br />
          {COMPANY_ADDRESS.city}
        </div>
      </div>
      <h1>
        Proposal – Work Order – Contract
        <br />
        Propuesta – Orden de Trabajo – Contrato
      </h1>
    </header>
  );
  const Foot = ({ page }: { page: number }) => (
    <footer className="wp-footer">
      <span>
        {B} · {COMPANY_ADDRESS.line} · {COMPANY_PHONES.join(' | ')}
      </span>
      <span>
        Page {page} of {pages} / Página {page} de {pages}
      </span>
    </footer>
  );
  const Terms = ({ lang }: { lang: 'en' | 'es' }) => {
    const en = lang === 'en';
    return (
      <>
        <h2 className="ct-terms-title">{en ? 'OTHER TERMS AND CONDITIONS' : 'OTROS TÉRMINOS Y CONDICIONES'}</h2>
        <p className="ct-terms">{text.licensing[lang]}</p>
        <ol className="ct-terms">
          {text.terms[lang].map((term, i) => (
            <li key={i}>
              {term}
              {i === 0 && (
                <div className="ct-received">
                  <b>{en ? 'I have received a copy of this document:' : 'Recibí copia de este documento:'}</b>
                  <div className="ct-received-signs">
                    <span>
                      {en ? "Buyer 1's signature" : 'Firma Comprador 1'}: <i className="ct-mini-sign">{sig('buyer1')}</i>
                    </span>
                    <span>
                      {en ? "Buyer 2's signature" : 'Firma Comprador 2'}: <i className="ct-mini-sign">{c.buyer2 ? sig('buyer2') : null}</i>
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
        <div className="ct-notice">
          <h3>
            {en ? 'NOTICE OF CANCELLATION' : 'AVISO DE CANCELACIÓN'}
            <span>
              {en ? 'Date of transaction' : 'Fecha de la transacción'}: <b>{mdy(signedDay)}</b> · {en ? 'Cancel before midnight of' : 'Cancelar antes de la medianoche del'}: <b>{mdy(deadline)}</b>
            </span>
          </h3>
          <p>{notice[lang]}</p>
          <div className="ct-notice-to">
            <Logo brand={brandRaw} />
            <span>
              {B}
              <br />
              {COMPANY_ADDRESS.street}
              <br />
              {COMPANY_ADDRESS.city}
            </span>
          </div>
          <p className="ct-cancel-line">{en ? 'I hereby cancel this transaction.' : 'Por la presente anulo esta transacción.'}</p>
          <p className="ct-cancel-line">
            {en ? 'Date' : 'Fecha'}: ____/____/______ &nbsp; {en ? "Buyer 1's signature" : 'Firma Comprador 1'}: ______________________ &nbsp; {en ? 'Date' : 'Fecha'}: ____/____/______ &nbsp; {en ? "Buyer 2's signature" : 'Firma Comprador 2'}: ______________________
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="wp-root">
      <Toolbar title={`Autorización de instalación · ${app.applicantName}`} filename={`Contract-${app.applicantName.replace(/\s+/g, '-')}.pdf`} canShare={!draft} done={justSigned && app.status === 'signed'} />

      <div className="wp-page ct-page">
        {draft && <div className="ct-draft">DRAFT · BORRADOR</div>}
        <Header />
        <table className="ct-table">
          <tbody>
            <tr>
              <td colSpan={2}>
                <label>Buyer 1 / Comprador 1</label>
                {c.buyer1.name}
              </td>
              <td>
                <label>Cell Ph # / Celular</label>
                {phone(c.buyer1.phone)}
              </td>
              <td colSpan={2}>
                <label>Email</label>
                {c.buyer1.email}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <label>Buyer 2 / Comprador 2</label>
                {c.buyer2?.name}
              </td>
              <td>
                <label>Cell Ph # / Celular</label>
                {phone(c.buyer2?.phone)}
              </td>
              <td colSpan={2}>
                <label>Email</label>
                {c.buyer2?.email}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <label>Address / Dirección</label>
                {c.address}
              </td>
              <td>
                <label>City / Ciudad</label>
                {c.city}
              </td>
              <td>
                <label>St / Estado</label>
                {c.state}
              </td>
              <td>
                <label>ZIP / Código Postal</label>
                {c.zip}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="ct-block">
          <p className="ct-center">
            {text.proposal.en}
            <br />
            {text.proposal.es}
          </p>
          <table className="ct-table inner">
            <tbody>
              <tr>
                <td>
                  <label>Water Treatment / Planta de Tratamiento</label>
                  {equipmentSummary({ ...c.equipment, ro: false, roType: null, roUv: false })}
                </td>
                <td>
                  <label>Brand / Marca</label>
                  {c.waterTreatment.brand}
                </td>
                <td>
                  <label>Model / Modelo</label>
                  {c.waterTreatment.model}
                </td>
              </tr>
              <tr>
                <td>
                  <label>Reverse Osmosis / Sistema de Ósmosis Inversa</label>
                  {c.equipment.ro ? (c.equipment.roType === 'five_stage' ? '5-stage / 5 pasos' : c.equipment.roType === 'box' ? 'Cabinet unit / En caja' : 'Yes / Sí') + (c.equipment.roUv ? ' + UV' : '') : 'No'}
                </td>
                <td>
                  <label>Brand / Marca</label>
                  {c.reverseOsmosis.brand}
                </td>
                <td>
                  <label>Model / Modelo</label>
                  {c.reverseOsmosis.model}
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <label>Other products or promotions included / Otros productos o promociones incluidas</label>
                  {c.other}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ct-block">
          <h2>Installation Instructions / Instrucciones de Instalación</h2>
          <p className="ct-center">
            {text.placement.en}
            <br />
            {text.placement.es}
          </p>
          <table className="ct-table inner">
            <tbody>
              <tr>
                <td>
                  <label>Estimated installation day / Día estimado de instalación</label>
                  {mdy(c.installDate)}
                </td>
                <td>
                  <Box on={c.installSlot === 'am'} /> 8:00 a.m. – 1:00 p.m.
                  <br />
                  <Box on={c.installSlot === 'pm'} /> 1:00 p.m. – 6:00 p.m.
                </td>
                <td>
                  <label>Water source / Fuente de agua</label>
                  <Box on={c.waterSource === 'city'} /> City / Ciudad <Box on={c.waterSource === 'well'} /> Well / Pozo
                </td>
                <td>
                  <label>Ice maker connection / Conexión del hielo</label>
                  <Box on={c.iceMaker === true} /> Yes / Sí <Box on={c.iceMaker === false} /> No
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <label>Number of people living at home / Personas que viven en la casa</label>
                  {c.people ?? ''}
                </td>
                <td colSpan={2}>
                  <label>The floor is / El piso es</label>
                  <Box on={c.floor === 'raised'} /> Raised / Elevado <Box on={c.floor === 'slab'} /> Concrete slab / Concreto
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ct-block">
          <h2>Terms or Payment Method / Términos o Método de Pago</h2>
          <div className="ct-pay-method">
            <span>
              <Box on={c.payment === 'card'} /> Credit card (sign attached form) / Tarjeta de crédito (firme el formulario adjunto)
            </span>
            <span>
              <Box on={c.payment === 'check'} /> Check (payable to {B}) / Cheque (a nombre de {B})
            </span>
          </div>
          <p className="ct-center">
            {text.payment.en}
            <br />
            {text.payment.es}
          </p>
          <table className="ct-table ct-money">
            <tbody>
              <tr>
                <th>Cash price / Precio contado</th>
                <th>Installation / Instalación</th>
                <th>Taxes / Impuestos</th>
                <th>Total cash sales price / Total precio venta contado</th>
                <th>Total down payment / Total cuota inicial</th>
                <th>Balance / Saldo del precio de venta</th>
              </tr>
              <tr>
                <td>{usd(c.cashPrice)}</td>
                <td>{c.installation ? usd(c.installation) : 'Included / Incluida'}</td>
                <td>{usd(c.taxes ?? 0)}</td>
                <td>{usd(t.total)}</td>
                <td>{usd(c.downPayment ?? 0)}</td>
                <td>{usd(t.balance)}</td>
              </tr>
              <tr>
                <th>Amount to finance / Cantidad a financiar</th>
                <th colSpan={2}>Number of payments and monthly amount / Número de pagos y monto mensual</th>
                <th>A.P.R. / Porcentaje anual</th>
                <th colSpan={2} className="ct-blank" />
              </tr>
              <tr>
                <td>{usd(c.amountToFinance)}</td>
                <td colSpan={2}>{financeLine}</td>
                <td>{c.apr != null ? `${c.apr} %` : ''}</td>
                <td colSpan={2} className="ct-blank" />
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ct-cancel">
          <p>{text.rightToCancel.en}</p>
          <p>{text.rightToCancel.es}</p>
        </div>

        <div className="ct-block ct-signs">
          <p className="ct-center small">
            {text.beforeSigning.en}
            <br />
            {text.beforeSigning.es}
          </p>
          <div className="ct-sign-row">
            {(['buyer1', 'buyer2', 'rep'] as const).map((who) => (
              <div key={who} className="ct-sign">
                <div className="ct-sign-img">{who === 'buyer2' && !c.buyer2 ? null : sig(who)}</div>
                <div className="ct-sign-line">{who === 'buyer1' ? 'Buyer 1 / Comprador 1' : who === 'buyer2' ? 'Buyer 2 / Comprador 2' : 'Signature Rep / Firma representante'}</div>
                <div>{who === 'buyer1' ? c.buyer1.name : who === 'buyer2' ? c.buyer2?.name ?? '' : `Name / Nombre: ${seller}`}</div>
                <div>Date / Fecha: {proof(who) ? mdy(floridaDay(proof(who)!.at)) : ''}</div>
                {proof(who) && <div className="cp-sign-proof">{stamp(proof(who))}</div>}
              </div>
            ))}
          </div>
          <p className="ct-center small">
            {text.validity.en}
            <br />
            {text.validity.es}
          </p>
        </div>
        <Foot page={1} />
      </div>

      <div className="wp-page ct-page ct-terms-page">
        {draft && <div className="ct-draft">DRAFT · BORRADOR</div>}
        <Terms lang="en" />
        <Foot page={2} />
      </div>
      <div className="wp-page ct-page ct-terms-page">
        {draft && <div className="ct-draft">DRAFT · BORRADOR</div>}
        <Terms lang="es" />
        <Foot page={3} />
      </div>
      {goodleap && (
        <div className="wp-page gl-page">
          {draft && <div className="ct-draft">DRAFT · BORRADOR</div>}
          {/* Tal cual el formulario que manda GoodLeap. */}
          <h1>{GOODLEAP_DOC.title}</h1>
          <div className="gl-page-addr">{GOODLEAP_DOC.address}</div>
          <h2>{GOODLEAP_DOC.heading}</h2>
          <div className="gl-band">
            {GOODLEAP_DOC.sections.map((x) => (
              <p key={x.title}>
                <u>{x.title}</u> {x.en}
              </p>
            ))}
            <div className="gl-lines">
              <div className="gl-line wide">
                <span>Customer Signature:</span>
                <i>{sig('glCustomer')}</i>
              </div>
              <div className="gl-line">
                <span>Date:</span>
                <i>{proof('glCustomer') ? mdy(floridaDay(proof('glCustomer')!.at)) : ''}</i>
              </div>
              <div className="gl-line wide">
                <span>Contractor Signature:</span>
                <i>{sig('glRep')}</i>
              </div>
              <div className="gl-line">
                <span>Date:</span>
                <i>{proof('glRep') ? mdy(floridaDay(proof('glRep')!.at)) : ''}</i>
              </div>
              <div className="gl-line">
                <span>Estimated Start Date:</span>
                <i>{mdy(c.installDate)}</i>
              </div>
              <div className="gl-line">
                <span>Estimated Completion Date:</span>
                <i>{mdy(c.installDate)}</i>
              </div>
            </div>
            {proof('glCustomer') && (
              <div className="gl-proof">
                {stamp(proof('glCustomer'))} · {proof('glCustomer')!.name} / {proof('glRep')?.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
