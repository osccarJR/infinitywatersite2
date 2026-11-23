/**
 * Creditos: el vendedor llena la solicitud en casa del cliente (fotos de las
 * IDs, datos y firmas), la oficina la aprueba o la niega, y con el credito
 * aprobado el vendedor llena y hace firmar la autorizacion de instalacion
 * (que crea la venta).
 */
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { BadgeCheck, ClipboardSignature, Eye, FileText, Plus, Send, Trash2, Undo2, UserRound, XCircle } from 'lucide-react';
import type { Equipment } from '../../../shared/domain.ts';
import { EMPTY_EQUIPMENT, SALE_STATUS_LABEL, equipmentSummary } from '../../../shared/domain.ts';
import {
  CREDIT_KEEP_DAYS,
  CREDIT_STATUS_LABEL,
  SLOT_LABEL,
  cancelDeadline,
  contractTotals,
  creditMissing,
  emptyCreditData,
  emptyIdentity,
  emptyPerson,
  formatSsn,
  isMasked,
  personName,
  slotOf,
  type ContractData,
  type CreditApp,
  type CreditData,
  type CreditPerson,
  type CreditSecret,
  type CreditStatus,
  type HomeStatus,
} from '../../../shared/credit.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { api } from '../lib/api.ts';
import { goBack, Link, navigate, useLeaveGuard } from '../lib/router.tsx';
import { focusField } from '../lib/focus.ts';
import { dateWithYear, formatPhone, localDate, moneyPlain } from '../lib/format.ts';
import { CREDIT_AUTH, contractText } from '../lib/creditText.ts';
import { Badge, Chips, Empty, Group, MoneyField, Page, Row, SearchBox, SegmentedRow, SwitchRow, TextField, StackField, type Tone } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { PersonPicker, PickerRow, StateZipRow, useCatalogCreate } from '../ui/pickers.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';
import { IdPhoto } from '../ui/idphoto.tsx';
import { SignSheet } from '../ui/signature.tsx';
import { GoodLeapReading } from '../ui/goodleapDoc.tsx';
import { isGoodLeap } from '../../../shared/goodleap.ts';

const STATUS_TONE: Record<CreditStatus, Tone> = { draft: 'orange', submitted: 'blue', approved: 'green', declined: 'red', signed: 'violet' };
/** Estado en palabras: "Devuelta" si la oficina la regreso para corregir; para el vendedor, "En la oficina". */
const statusLabel = (c: { status: CreditStatus; returnNote: string | null }, reviewer: boolean) =>
  c.status === 'draft' && c.returnNote ? 'Devuelta' : c.status === 'submitted' && !reviewer ? 'En la oficina' : CREDIT_STATUS_LABEL[c.status];

export const creditAccess = (a: ReturnType<typeof useAccess>) => ({ fills: a.can('credit.create'), reviews: a.can('credit.review') });

const fileUrl = (app: Pick<CreditApp, 'id' | 'updatedAt'>, kind: string) => `/admin/api/credit/${app.id}/files/${kind}?v=${encodeURIComponent(app.updatedAt)}`;

/** La solicitud completa (se pide aparte: no viene con el resto de los datos). */
function useCreditApp(id: number | null) {
  const [app, setApp] = useState<CreditApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api<{ app: CreditApp }>(`/credit/${id}`);
      setApp(r.app);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  return { app, setApp, error, load };
}

function brandName(data: ReturnType<typeof useData>, id: number | null) {
  return id ? data.brands.find((b) => b.id === id)?.name ?? '' : '';
}

/* ------------------------------------------------------------------ */
/* Lista                                                                */
/* ------------------------------------------------------------------ */

const FILTERS: { key: '' | CreditStatus; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'submitted', label: 'En la oficina' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'draft', label: 'Por firmar' },
  { key: 'declined', label: 'Negadas' },
  { key: 'signed', label: 'Instalación autorizada' },
];

export function CreditList({ initialFilter }: { initialFilter?: string | null }) {
  const data = useData();
  const a = useAccess();
  const { reviews } = creditAccess(a);
  const [filter, setFilter] = useState<'' | CreditStatus>((FILTERS.find((f) => f.key === initialFilter)?.key ?? '') as '' | CreditStatus);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = data.credit.filter((c) => (!filter || c.status === filter) && (!q || `${c.applicantName} ${c.coApplicantName ?? ''} ${c.city}`.toLowerCase().includes(q)));
  // Lo que espera algo primero: por revisar (oficina) o aprobadas por firmar (vendedor).
  const order: CreditStatus[] = reviews ? ['submitted', 'approved', 'draft', 'declined', 'signed'] : ['approved', 'draft', 'submitted', 'declined', 'signed'];
  const sorted = [...list].sort((x, y) => order.indexOf(x.status) - order.indexOf(y.status));

  return (
    <Page
      title="Créditos"
      headerAction={
        <Link to="/creditos/nueva" className="btn small">
          <Plus size={18} /> Nueva solicitud
        </Link>
      }
    >
      <SearchBox value={query} onChange={setQuery} placeholder="Buscar por nombre o ciudad" />
      <Chips options={FILTERS.map((f) => ({ key: f.key, label: f.label, count: f.key ? data.credit.filter((c) => c.status === f.key).length : undefined }))} value={filter} onChange={setFilter} />
      {sorted.length === 0 ? (
        <Empty
          icon={<ClipboardSignature size={40} />}
          title={data.credit.length ? 'Nada con ese filtro' : 'Todavía no hay solicitudes'}
          text={data.credit.length ? undefined : 'Toca «Nueva solicitud» en casa del cliente: fotos de las IDs, datos y firmas.'}
        />
      ) : (
        <div className="group">
          {sorted.map((c) => {
            const brand = brandName(data, c.brandId);
            const seller = c.sellerId ? data.personById.get(c.sellerId)?.name : c.createdBy;
            return (
              <Row
                key={c.id}
                to={c.status === 'draft' ? `/creditos/${c.id}/editar` : `/creditos/${c.id}`}
                title={
                  <>
                    {c.applicantName}
                    {c.coApplicantName && <span className="muted"> y {c.coApplicantName}</span>}
                  </>
                }
                subtitle={[brand, c.city, dateWithYear(c.appDate), reviews && seller ? `Vendedor: ${seller}` : null, c.amount ? moneyPlain(c.amount) : null].filter(Boolean).join(' · ')}
                trailing={<Badge tone={STATUS_TONE[c.status]}>{statusLabel(c, reviews)}</Badge>}
              />
            );
          })}
        </div>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Solicitud (llenar)                                                   */
/* ------------------------------------------------------------------ */

interface FormState {
  brandId: number | null;
  clientId: number | null;
  sellerId: number | null;
  appDate: string;
  amount: number | null;
  hasCo: boolean;
  data: CreditData;
  secret: CreditSecret;
}

function fromApp(app: CreditApp): FormState {
  return {
    brandId: app.brandId,
    clientId: app.clientId,
    sellerId: app.sellerId,
    appDate: app.appDate,
    amount: app.amount,
    hasCo: Boolean(app.data.coApplicant),
    data: { ...app.data, coApplicant: app.data.coApplicant ?? emptyPerson() },
    secret: { applicant: app.secret.applicant, coApplicant: app.secret.coApplicant ?? emptyIdentity() },
  };
}

const bodyOf = (f: FormState, updatedAt?: string) => ({
  brandId: f.brandId,
  clientId: f.clientId,
  sellerId: f.sellerId,
  appDate: f.appDate,
  amount: f.amount,
  data: { ...f.data, coApplicant: f.hasCo ? f.data.coApplicant : null, returnNote: undefined },
  secret: { applicant: f.secret.applicant, coApplicant: f.hasCo ? f.secret.coApplicant : null },
  ...(updatedAt ? { expectedUpdatedAt: updatedAt } : {}),
});

export function CreditForm({ id }: { id?: number }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const { fills, reviews } = creditAccess(a);
  const { app, setApp, error: loadError } = useCreditApp(id ?? null);
  const [form, setForm] = useState<FormState | null>(() =>
    id
      ? null
      : {
          brandId: data.brands.find((b) => b.active && /infinity/i.test(b.name))?.id ?? data.brands.find((b) => b.active)?.id ?? null,
          clientId: null,
          sellerId: a.personId,
          appDate: data.today,
          amount: null,
          hasCo: false,
          data: { ...emptyCreditData(), coApplicant: emptyPerson() },
          secret: { applicant: emptyIdentity(), coApplicant: emptyIdentity() },
        }
  );
  const initial = useRef<string>(form ? JSON.stringify(form) : '');
  const savedId = useRef<number | null>(id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const leaving = useRef(false);

  useEffect(() => {
    if (app && !form) {
      const f = fromApp(app);
      initial.current = JSON.stringify(f);
      setForm(f);
    }
  }, [app, form]);

  useLeaveGuard(
    () => !leaving.current && form != null && JSON.stringify(form) !== initial.current,
    () => confirm({ title: '¿Salir sin guardar?', message: 'Lo que escribiste se perderá.', confirm: 'Salir sin guardar', cancel: 'Seguir llenando', danger: true })
  );

  // Se guarda sola cada rato (la solicitud es larga y en el iPhone la pagina se puede recargar al abrir la camara).
  const [autoSaved, setAutoSaved] = useState<string | null>(null);
  const formJson = form ? JSON.stringify(form) : '';
  useEffect(() => {
    if (!form || !savedId.current || busy || signing || formJson === initial.current || app?.status !== 'draft') return;
    const timer = setTimeout(() => {
      api<{ app: CreditApp }>(`/credit/${savedId.current}`, { method: 'PUT', body: bodyOf(form, app?.updatedAt) })
        .then((r) => {
          setApp(r.app);
          initial.current = formJson;
          setAutoSaved(new Date().toLocaleTimeString('es-US', { hour: 'numeric', minute: '2-digit' }));
        })
        .catch(() => {});
    }, 15_000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formJson, busy, signing]);

  if (!fills && !reviews) return <Page title="Solicitud de crédito"><Empty title="No tienes acceso a créditos" /></Page>;
  if (id && loadError) return <Page title="Solicitud de crédito" back={{ label: 'Créditos', to: '/creditos' }}><Empty title={loadError} /></Page>;
  if (!form) return <Page title="Solicitud de crédito" back={{ label: 'Créditos', to: '/creditos' }}><div className="loading-block" /></Page>;
  if (app && app.status !== 'draft') {
    return (
      <Page title="Solicitud de crédito" back={{ label: 'Créditos', to: '/creditos' }}>
        <Empty title="Esta solicitud ya se envió" text="Ya no se puede cambiar." action={<Link to={`/creditos/${app.id}`} className="btn">Ver la solicitud</Link>} />
      </Page>
    );
  }

  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const setPerson = (who: 'applicant' | 'coApplicant', patch: Partial<CreditPerson>) =>
    setForm((f) => (f ? { ...f, data: { ...f.data, [who]: { ...(f.data[who] ?? emptyPerson()), ...patch } } } : f));
  const setId = (who: 'applicant' | 'coApplicant', patch: Partial<CreditSecret['applicant']>) =>
    setForm((f) => (f ? { ...f, secret: { ...f.secret, [who]: { ...(f.secret[who] ?? emptyIdentity()), ...patch } } } : f));
  const brand = brandName(data, form.brandId);
  const masked = app?.secretMasked ?? false;

  /** Guarda (crea la solicitud si es nueva) y devuelve la version del servidor. */
  const save = async (): Promise<CreditApp> => {
    const sid = savedId.current;
    const r = await api<{ app: CreditApp }>(sid ? `/credit/${sid}` : '/credit', { method: sid ? 'PUT' : 'POST', body: bodyOf(form, sid ? app?.updatedAt : undefined) });
    savedId.current = r.app.id;
    setApp(r.app);
    initial.current = JSON.stringify(form);
    if (!sid) {
      // La direccion pasa a ser la de la solicitud guardada.
      leaving.current = true;
      await navigate(`/creditos/${r.app.id}/editar`, { replace: true, force: true });
    }
    reload().catch(() => {});
    return r.app;
  };

  const fail = (message: string, field?: string) => {
    setError(message);
    if (field) focusField(formRef.current, field);
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await save();
      toast('Solicitud guardada');
    } catch (err: any) {
      fail(err.message, err.field);
    } finally {
      setBusy(false);
    }
  };

  const startSigning = async () => {
    setError(null);
    const p = form.data.applicant;
    if (!p.firstName.trim() || !p.lastName.trim()) return fail('Escribe el nombre y apellido del aplicante.', 'applicant.firstName');
    setBusy(true);
    try {
      const saved = await save();
      // Todo lo que falta, de una vez, ANTES de que el cliente firme.
      const missing = creditMissing({
        data: { ...form.data, coApplicant: form.hasCo ? form.data.coApplicant : null },
        secret: { applicant: form.secret.applicant, coApplicant: form.hasCo ? form.secret.coApplicant : null },
        files: saved.files,
        amount: form.amount,
      });
      if (missing.length) return fail(`Antes de firmar falta: ${missing.map((m) => m.label).join('; ')}.`, missing[0].field);
      setSigning(true);
    } catch (err: any) {
      fail(err.message, err.field);
    } finally {
      setBusy(false);
    }
  };

  const sign = async (sigs: Record<string, string>) => {
    const sid = savedId.current!;
    // Si falla, la hoja sigue abierta con el aviso y las firmas no se pierden.
    await api(`/credit/${sid}/submit`, { method: 'POST', body: { consent: true, expectedUpdatedAt: app?.updatedAt, signatures: { applicant: sigs.applicant, coApplicant: sigs.coApplicant ?? null, rep: sigs.rep } } });
    leaving.current = true;
    await reload();
    setSigning(false);
    toast('Solicitud enviada a la oficina');
    navigate(`/creditos/${sid}`, { replace: true, force: true });
  };

  const uploadPhoto = (kind: string) => async (image: string) => {
    let target = app;
    if (!savedId.current) {
      const p = form.data.applicant;
      if (!p.firstName.trim() && !p.lastName.trim()) {
        // Se puede empezar por las fotos: se guarda con lo que haya.
      }
      target = await save();
    }
    const r = await api<{ app: CreditApp }>(`/credit/${savedId.current ?? target!.id}/files/${kind}`, { method: 'PUT', body: { image } });
    setApp(r.app);
  };
  const removePhoto = (kind: string) => async () => {
    const r = await api<{ app: CreditApp }>(`/credit/${savedId.current}/files/${kind}`, { method: 'DELETE' });
    setApp(r.app);
  };
  const photo = (kind: string) => (app && app.files.includes(kind) ? fileUrl(app, kind) : null);

  const remove = async () => {
    const ok = await confirm({ title: '¿Borrar esta solicitud?', message: 'Se borran también las fotos de las IDs. No se puede deshacer.', confirm: 'Borrar solicitud', danger: true });
    if (!ok) return;
    try {
      await api(`/credit/${savedId.current}`, { method: 'DELETE' });
      leaving.current = true;
      await reload();
      toast('Solicitud borrada');
      goBack('/creditos', { force: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const chooseClient = (clientId: number | null) => {
    const c = clientId ? data.clientById.get(clientId) : undefined;
    if (!c) return set({ clientId: null });
    const [firstName, ...rest] = c.name.trim().split(/\s+/);
    setForm((f) =>
      f
        ? {
            ...f,
            clientId,
            data: {
              ...f.data,
              applicant: {
                ...f.data.applicant,
                firstName: f.data.applicant.firstName || firstName || '',
                lastName: f.data.applicant.lastName || rest.join(' '),
                cellPhone: f.data.applicant.cellPhone || c.phone || '',
                homePhone: f.data.applicant.homePhone || c.phone2 || '',
                email: f.data.applicant.email || c.email || '',
                address: f.data.applicant.address || c.address || '',
                city: f.data.applicant.city || c.city || '',
                state: f.data.applicant.state || c.state || '',
                zip: f.data.applicant.zip || c.zip || '',
              },
            },
          }
        : f
    );
  };

  const signers = [
    { key: 'applicant', role: 'Aplicante', name: personName(form.data.applicant) },
    ...(form.hasCo ? [{ key: 'coApplicant', role: 'Coaplicante', name: personName(form.data.coApplicant) }] : []),
    {
      key: 'rep',
      role: 'Vendedor',
      name: (a.personId ? data.personById.get(a.personId)?.name : null) ?? data.me.name,
      agreement: (
        <>
          <p>Certifico que vi la identificación original del cliente y que el cliente llenó (o revisó) y firmó esta solicitud en mi presencia.</p>
          <p className="muted">I certify that I saw the customer's original ID and that the customer completed (or reviewed) and signed this application in my presence.</p>
        </>
      ),
    },
  ];

  return (
    <Page title={id ? 'Solicitud de crédito' : 'Nueva solicitud de crédito'} back={{ label: 'Créditos', to: '/creditos' }} narrow>
      {app?.data.returnNote && (
        <div className="banner orange">
          <Undo2 size={20} />
          <div>
            <div className="banner-title">La oficina la devolvió para corregir</div>
            <div className="banner-text">{app.data.returnNote}</div>
          </div>
        </div>
      )}
      <form onSubmit={submit} noValidate ref={formRef} className="credit-form">
        <Group label="Marca y monto" footer="El formulario sale con el logo de la marca que elijas.">
          <PickerRow label="Marca" value={brand || null} onOpen={() => setBrandOpen(true)} field="brandId" />
          <DateField field="appDate" label="Fecha" value={form.appDate} onChange={(v) => set({ appDate: v || data.today })} />
          <MoneyField field="amount" label="Monto a financiar" value={form.amount} onChange={(v) => set({ amount: v })} />
          {(reviews || a.personId == null) && <PersonPicker field="sellerId" role="seller" label="Vendedor" value={form.sellerId} onChange={(v) => set({ sellerId: v })} />}
          {a.can('clients.view') && (
            <PickerRow label="Cliente del sistema" value={form.clientId ? data.clientById.get(form.clientId)?.name : null} placeholder="Cliente nuevo" onOpen={() => setClientOpen(true)} field="clientId" />
          )}
        </Group>
        <Picker
          open={brandOpen}
          onClose={() => setBrandOpen(false)}
          title="Marca"
          options={data.brands.filter((b) => b.active || b.id === form.brandId).map((b) => ({ id: b.id, label: b.name }))}
          value={form.brandId}
          onSelect={(v) => set({ brandId: v })}
        />
        <Picker
          open={clientOpen}
          onClose={() => setClientOpen(false)}
          title="Cliente que ya está en el sistema"
          options={data.clients.map((c) => ({ id: c.id, label: c.name, sublabel: [c.phone ? formatPhone(c.phone) : null, c.city].filter(Boolean).join(' · ') }))}
          value={form.clientId}
          onSelect={chooseClient}
          allowNone="Cliente nuevo"
          searchPlaceholder="Buscar cliente"
        />

        <Group label="Fotos de las IDs" footer="Licencia o ID por los dos lados. Se guardan protegidas y solo las ve la oficina.">
          <div className="id-photos" data-field="id1-front">
            <IdPhoto label="Aplicante · frente" src={photo('id1-front')} onPick={uploadPhoto('id1-front')} onRemove={removePhoto('id1-front')} field="id1-front" />
            <IdPhoto label="Aplicante · reverso" src={photo('id1-back')} onPick={uploadPhoto('id1-back')} onRemove={removePhoto('id1-back')} />
            {form.hasCo && (
              <>
                <IdPhoto label="Coaplicante · frente" src={photo('id2-front')} onPick={uploadPhoto('id2-front')} onRemove={removePhoto('id2-front')} field="id2-front" />
                <IdPhoto label="Coaplicante · reverso" src={photo('id2-back')} onPick={uploadPhoto('id2-back')} onRemove={removePhoto('id2-back')} />
              </>
            )}
          </div>
        </Group>

        <PersonFields who="applicant" title="Aplicante" person={form.data.applicant} id={form.secret.applicant} masked={masked} onPerson={(p) => setPerson('applicant', p)} onId={(p) => setId('applicant', p)} />

        <Group>
          <SwitchRow label="¿Hay otra persona que firma?" subtitle="Coaplicante: esposo(a) u otra persona" checked={form.hasCo} onChange={(v) => set({ hasCo: v })} />
        </Group>
        {form.hasCo && (
          <PersonFields
            who="coApplicant"
            title="Coaplicante"
            person={form.data.coApplicant ?? emptyPerson()}
            id={form.secret.coApplicant ?? emptyIdentity()}
            masked={masked}
            onPerson={(p) => setPerson('coApplicant', p)}
            onId={(p) => setId('coApplicant', p)}
            sameAddress={() =>
              setPerson('coApplicant', {
                address: form.data.applicant.address,
                city: form.data.applicant.city,
                state: form.data.applicant.state,
                zip: form.data.applicant.zip,
              })
            }
          />
        )}

        <Group label="Vivienda">
          <SegmentedRow<HomeStatus>
            title="La casa está"
            options={[
              { value: 'paid', label: 'Pagada' },
              { value: 'mortgaged', label: 'Financiada' },
              { value: 'rent', label: 'Alquilada' },
            ]}
            value={form.data.home.status}
            onChange={(v) => set({ data: { ...form.data, home: { ...form.data.home, status: v } } })}
          />
          {form.data.home.status === 'mortgaged' && (
            <TextField label="Financiera" value={form.data.home.company} onChange={(v) => set({ data: { ...form.data, home: { ...form.data.home, company: v } } })} autoComplete="off" field="home.company" />
          )}
          {form.data.home.status !== 'paid' && (
            <TextField label="Pago mensual" value={form.data.home.monthlyPayment} onChange={(v) => set({ data: { ...form.data, home: { ...form.data.home, monthlyPayment: v } } })} inputMode="decimal" placeholder="$" autoComplete="off" field="home.monthlyPayment" />
          )}
          <TextField label="Cuánto tiempo" value={form.data.home.howLong} onChange={(v) => set({ data: { ...form.data, home: { ...form.data.home, howLong: v } } })} placeholder="ej. 5 años" autoComplete="off" field="home.howLong" />
        </Group>

        <IncomeFields title="Ingresos del aplicante" who="applicant" person={form.data.applicant} onPerson={(p) => setPerson('applicant', p)} />
        {form.hasCo && <IncomeFields title="Ingresos del coaplicante" who="coApplicant" person={form.data.coApplicant ?? emptyPerson()} onPerson={(p) => setPerson('coApplicant', p)} />}

        <Group label="Referencias personales">
          {form.data.references.map((r, i) => (
            <div key={i} className="ref-row">
              <TextField label={`Nombre ${i + 1}`} value={r.name} onChange={(v) => set({ data: { ...form.data, references: form.data.references.map((x, j) => (j === i ? { ...x, name: v } : x)) } })} autoComplete="off" autoCapitalize="words" field={`ref${i}.name`} />
              <TextField label="Relación" value={r.relationship} onChange={(v) => set({ data: { ...form.data, references: form.data.references.map((x, j) => (j === i ? { ...x, relationship: v } : x)) } })} placeholder="Hermano, amigo…" autoComplete="off" field={`ref${i}.rel`} />
              <TextField label="Teléfono" value={r.phone} onChange={(v) => set({ data: { ...form.data, references: form.data.references.map((x, j) => (j === i ? { ...x, phone: v } : x)) } })} type="tel" inputMode="tel" autoComplete="off" field={`ref${i}.phone`} />
            </div>
          ))}
        </Group>

        <div className="form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          {!error && autoSaved && <p className="form-saved">Guardado solo a las {autoSaved}</p>}
          <button type="submit" className="btn gray" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" className="btn" disabled={busy} onClick={startSigning}>
            <Send size={18} /> Firmar y enviar
          </button>
        </div>
        {savedId.current && (
          <div className="group" style={{ marginTop: 20 }}>
            <button type="button" className="row danger" onClick={remove}>
              Borrar solicitud
            </button>
          </div>
        )}
      </form>

      <SignSheet
        open={signing}
        onClose={() => setSigning(false)}
        title="Firmas de la solicitud"
        signers={signers}
        finishLabel="Firmar y enviar a la oficina"
        agreement={
          <>
            <p>{CREDIT_AUTH.es}</p>
            <p className="muted">{CREDIT_AUTH.en}</p>
            <p className="sig-amount">
              {brand || 'Infinity Water'} · Monto a financiar: <b>{form.amount ? moneyPlain(form.amount) : '—'}</b>
            </p>
          </>
        }
        onDone={sign}
      />
    </Page>
  );
}

function PersonFields({
  who,
  title,
  person: p,
  id,
  masked,
  onPerson,
  onId,
  sameAddress,
}: {
  who: 'applicant' | 'coApplicant';
  title: string;
  person: CreditPerson;
  id: CreditSecret['applicant'];
  masked: boolean;
  onPerson: (p: Partial<CreditPerson>) => void;
  onId: (p: Partial<CreditSecret['applicant']>) => void;
  sameAddress?: () => void;
}) {
  const f = (k: string) => `${who}.${k}`;
  return (
    <>
      <Group label={title}>
        <TextField label="Nombre" value={p.firstName} onChange={(v) => onPerson({ firstName: v })} autoComplete="off" autoCapitalize="words" field={f('firstName')} />
        <TextField label="Apellido" value={p.lastName} onChange={(v) => onPerson({ lastName: v })} autoComplete="off" autoCapitalize="words" field={f('lastName')} />
        <TextField
          label="Seguro social"
          value={isMasked(id.ssn) ? id.ssn : formatSsn(id.ssn)}
          onChange={(v) => onId({ ssn: v.replace(/\D/g, '').slice(0, 9) })}
          inputMode="numeric"
          placeholder="9 números"
          autoComplete="off"
          field={f('ssn')}
          disabled={masked && isMasked(id.ssn)}
        />
        <TextField label="Fecha de nacimiento" type="date" value={isMasked(id.dob) ? '' : id.dob} onChange={(v) => onId({ dob: v })} autoComplete="off" field={f('dob')} />
        <TextField label="Licencia o ID #" value={id.dl} onChange={(v) => onId({ dl: v.toUpperCase() })} autoComplete="off" field={f('dl')} />
        <TextField label="Vence" type="date" value={id.dlExp} onChange={(v) => onId({ dlExp: v })} autoComplete="off" field={f('dlExp')} />
        <TextField label="Celular" type="tel" inputMode="tel" value={p.cellPhone} onChange={(v) => onPerson({ cellPhone: v })} autoComplete="off" field={f('cellPhone')} />
        <TextField label="Teléfono casa" type="tel" inputMode="tel" value={p.homePhone} onChange={(v) => onPerson({ homePhone: v })} autoComplete="off" field={f('homePhone')} />
        <TextField label="Correo" type="email" inputMode="email" value={p.email} onChange={(v) => onPerson({ email: v.trim() })} autoComplete="off" field={f('email')} />
      </Group>
      <Group label={`Dirección del ${title.toLowerCase()}`} footer={sameAddress ? <button type="button" className="link-btn" onClick={sameAddress}>Es la misma del aplicante</button> : undefined}>
        <TextField label="Dirección" value={p.address} onChange={(v) => onPerson({ address: v })} autoComplete="off" autoCapitalize="words" field={f('address')} />
        <TextField label="Ciudad" value={p.city} onChange={(v) => onPerson({ city: v })} autoComplete="off" autoCapitalize="words" field={f('city')} />
        <StateZipRow state={p.state} zip={p.zip} onState={(v) => onPerson({ state: v })} onZip={(v) => onPerson({ zip: v })} field={f('')} />
        <StackField label="Dirección anterior (si vive ahí hace menos de 3 años)" value={p.previousAddress} onChange={(v) => onPerson({ previousAddress: v })} placeholder="Opcional" field={f('previousAddress')} />
      </Group>
    </>
  );
}

function IncomeFields({ title, who, person: p, onPerson }: { title: string; who: string; person: CreditPerson; onPerson: (p: Partial<CreditPerson>) => void }) {
  const f = (k: string) => `${who}.${k}`;
  return (
    <Group label={title}>
      <TextField label="Empleador" value={p.employer} onChange={(v) => onPerson({ employer: v })} autoComplete="off" field={f('employer')} />
      <TextField label="Posición" value={p.position} onChange={(v) => onPerson({ position: v })} autoComplete="off" field={f('position')} />
      <TextField label="Años" value={p.years} onChange={(v) => onPerson({ years: v })} inputMode="decimal" autoComplete="off" field={f('years')} />
      <TextField label="Salario" value={p.salary} onChange={(v) => onPerson({ salary: v })} placeholder="ej. $4,000 al mes" autoComplete="off" field={f('salary')} />
      <TextField label="Teléfono trabajo" type="tel" inputMode="tel" value={p.businessPhone} onChange={(v) => onPerson({ businessPhone: v })} autoComplete="off" field={f('businessPhone')} />
      <TextField label="Dirección trabajo" value={p.employerAddress} onChange={(v) => onPerson({ employerAddress: v })} autoComplete="off" field={f('employerAddress')} />
      <TextField label="Ciudad" value={p.employerCity} onChange={(v) => onPerson({ employerCity: v })} autoComplete="off" field={f('employerCity')} />
      <StateZipRow state={p.employerState} zip={p.employerZip} onState={(v) => onPerson({ employerState: v })} onZip={(v) => onPerson({ employerZip: v })} field={f('employer')} />
      <StackField label="Trabajo anterior (si tiene menos de 3 años en este)" value={p.previousEmployer} onChange={(v) => onPerson({ previousEmployer: v })} placeholder="Opcional" field={f('previousEmployer')} />
      <StackField label="Otros ingresos" value={p.otherIncome} onChange={(v) => onPerson({ otherIncome: v })} placeholder="Opcional" field={f('otherIncome')} />
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Detalle, aprobacion                                                   */
/* ------------------------------------------------------------------ */

export function CreditDetail({ id }: { id: number }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const { reviews } = creditAccess(a);
  const { app, setApp, error, load } = useCreditApp(id);
  const [decision, setDecision] = useState<'approved' | 'declined' | 'return' | null>(null);
  const [secret, setSecret] = useState<CreditSecret | null>(null);

  if (error) return <Page title="Solicitud de crédito" back={{ label: 'Créditos', to: '/creditos' }}><Empty title={error} /></Page>;
  if (!app) return <Page title="Solicitud de crédito" back={{ label: 'Créditos', to: '/creditos' }}><div className="loading-block" /></Page>;

  const brand = brandName(data, app.brandId);
  const seller = app.sellerId ? data.personById.get(app.sellerId)?.name : app.createdBy;
  const financier = app.decision?.financierId ? data.financierById.get(app.decision.financierId)?.name : null;
  const shown = secret ?? app.secret;
  const mine = app.createdById === data.me.id || (a.personId != null && app.sellerId === a.personId);

  const reveal = async () => {
    try {
      const r = await api<{ secret: CreditSecret }>(`/credit/${id}/secret`);
      setSecret(r.secret);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const remove = async () => {
    const ok = await confirm({ title: '¿Borrar esta solicitud?', message: 'Se borra con sus fotos y firmas. No se puede deshacer.', confirm: 'Borrar solicitud', danger: true });
    if (!ok) return;
    try {
      await api(`/credit/${id}`, { method: 'DELETE' });
      await reload();
      toast('Solicitud borrada');
      goBack('/creditos', { force: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const person = (p: CreditPerson, s: CreditSecret['applicant'] | null, title: string) => (
    <Group label={title}>
      <Row title="Nombre" value={personName(p) || '—'} />
      <Row title="Seguro social" value={s?.ssn ? (isMasked(s.ssn) ? s.ssn : formatSsn(s.ssn)) : '—'} />
      <Row title="Nacimiento" value={s?.dob ? (isMasked(s.dob) ? s.dob : dateWithYear(s.dob)) : '—'} />
      <Row title="Licencia o ID" value={s?.dl ? `${s.dl}${s.dlExp ? ` · vence ${dateWithYear(s.dlExp)}` : ''}` : '—'} />
      <Row title="Teléfonos" value={[p.cellPhone, p.homePhone].filter(Boolean).map(formatPhone).join(' / ') || '—'} />
      {p.email && <Row title="Correo" value={p.email} />}
      <Row title="Dirección" subtitle={[p.address, [p.city, [p.state, p.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || '—'} />
      {p.previousAddress && <Row title="Dirección anterior" subtitle={p.previousAddress} />}
      <Row title="Trabajo" subtitle={[p.employer, p.position, p.years && `${p.years} años`, p.salary].filter(Boolean).join(' · ') || '—'} />
      {p.otherIncome && <Row title="Otros ingresos" subtitle={p.otherIncome} />}
    </Group>
  );

  const steps: { label: string; when: string | null; done: boolean }[] = [
    { label: `Llenada por ${app.createdBy ?? '—'}`, when: app.appDate, done: true },
    { label: 'Firmada y enviada a la oficina', when: app.submittedAt, done: Boolean(app.submittedAt) },
    {
      label: app.status === 'declined' ? `Negada${app.decidedBy ? ` por ${app.decidedBy}` : ''}` : `Aprobada${app.decidedBy && app.decidedAt ? ` por ${app.decidedBy}` : ''}${financier ? ` · ${financier}` : ''}`,
      when: app.decidedAt,
      done: Boolean(app.decidedAt),
    },
    ...(app.status !== 'declined' ? [{ label: 'Autorización de instalación firmada', when: app.signedAt, done: Boolean(app.signedAt) }] : []),
  ];

  return (
    <Page title={app.applicantName} subtitle={`${brand || 'Solicitud de crédito'} · ${dateWithYear(app.appDate)}`} back={{ label: 'Créditos', to: '/creditos' }} narrow>
      <div className="credit-status">
        <Badge tone={STATUS_TONE[app.status]}>{statusLabel(app, reviews)}</Badge>
        {app.amount != null && <span>Monto a financiar: <b>{moneyPlain(app.amount)}</b></span>}
      </div>

      <ol className="credit-steps">
        {steps.map((s, i) => (
          <li key={i} className={s.done ? 'done' : ''}>
            <span>{s.label}</span>
            {s.when && <small>{dateWithYear(s.when.length > 10 ? localDate(s.when) : s.when)}</small>}
          </li>
        ))}
      </ol>

      {app.status === 'draft' && (mine || reviews) && (
        <div className={`banner${app.data.returnNote ? '' : ' blue'}`}>
          <Undo2 size={20} />
          <div style={{ flex: 1 }}>
            <div className="banner-title">{app.data.returnNote ? 'La oficina la devolvió para corregir' : 'Todavía no se ha firmado ni enviado'}</div>
            {app.data.returnNote && <div className="banner-text">{app.data.returnNote}</div>}
            {app.createdById === data.me.id && (
              <Link to={`/creditos/${id}/editar`} className="btn small" style={{ marginTop: 10 }}>
                {app.data.returnNote ? 'Corregir y volver a firmar' : 'Seguir llenando'}
              </Link>
            )}
          </div>
        </div>
      )}
      {app.status === 'submitted' && !reviews && (
        <div className="banner blue">
          <Send size={20} />
          <div>
            <div className="banner-title">La oficina la está revisando</div>
            <div className="banner-text">Cuando la aprueben te aparece aquí y en Inicio para llenar y firmar la autorización de instalación con el cliente.</div>
          </div>
        </div>
      )}
      {app.status === 'approved' && app.decision && (
        <div className="banner green">
          <BadgeCheck size={20} />
          <div>
            <div className="banner-title">Crédito aprobado{financier ? ` con ${financier}` : ''}</div>
            <div className="banner-text">
              {[app.decision.approvedAmount != null && `Aprobado ${moneyPlain(app.decision.approvedAmount)}`, app.decision.termMonths && `${app.decision.termMonths} meses`, app.decision.monthlyPayment != null && `cuota ${moneyPlain(app.decision.monthlyPayment)}`, app.decision.apr != null && `APR ${app.decision.apr} %`].filter(Boolean).join(' · ')}
              {app.decision.notes ? ` · ${app.decision.notes}` : ''}
            </div>
          </div>
        </div>
      )}
      {app.status === 'declined' && (
        <div className="banner red">
          <XCircle size={20} />
          <div>
            <div className="banner-title">Crédito negado{financier ? ` por ${financier}` : ''}</div>
            {app.decision?.notes && <div className="banner-text">{app.decision.notes}</div>}
          </div>
        </div>
      )}

      <div className="doc-actions">
        {app.status === 'approved' && (mine || reviews) && (
          <Link to={`/creditos/${id}/autorizacion`} className="doc-action">
            <span className="doc-icon invoice">
              <ClipboardSignature size={20} />
            </span>
            <span>
              <b>Autorización de instalación</b>
              <span>{app.contract ? 'Continuar: firma del cliente y del vendedor' : 'Llenar y firmar con el cliente'}</span>
            </span>
          </Link>
        )}
        {app.status === 'signed' && (
          <>
            <Link to={`/imprimir/autorizacion/${id}`} className="doc-action">
              <span className="doc-icon invoice">
                <ClipboardSignature size={20} />
              </span>
              <span>
                <b>Autorización firmada</b>
                <span>Ver, imprimir o enviar al cliente</span>
              </span>
            </Link>
            {app.saleId && a.canSee('sales') && (
              <Link to={`/ventas/${app.saleId}`} className="doc-action">
                <span className="doc-icon order">
                  <FileText size={20} />
                </span>
                <span>
                  <b>Venta #{app.saleId}</b>
                  <span>
                    {(() => {
                      const sale = data.sales.find((x) => x.id === app.saleId);
                      return sale && sale.status !== 'active' ? `Venta ${SALE_STATUS_LABEL[sale.status].toLowerCase()} · el cliente sigue guardado` : 'Se creó al firmar la autorización · si el cliente se arrepiente, cámbiala a Cancelada';
                    })()}
                  </span>
                </span>
              </Link>
            )}
          </>
        )}
        {app.status !== 'draft' && (
          <Link to={`/imprimir/credito/${id}${reviews ? '' : '?copia=cliente'}`} className="doc-action">
            <span className="doc-icon warranty">
              <FileText size={20} />
            </span>
            <span>
              <b>Solicitud de crédito</b>
              <span>{reviews ? 'Con el seguro social completo (se registra quién la abre)' : 'Copia para el cliente (PDF o WhatsApp)'}</span>
            </span>
          </Link>
        )}
        {app.status !== 'draft' && reviews && (
          <Link to={`/imprimir/credito/${id}?copia=cliente`} className="doc-action">
            <span className="doc-icon order">
              <Send size={20} />
            </span>
            <span>
              <b>Copia para el cliente</b>
              <span>Seguro social tapado · PDF o WhatsApp</span>
            </span>
          </Link>
        )}
      </div>

      {reviews && (app.status === 'submitted' || app.status === 'approved' || app.status === 'declined') && (
        <Group label="Decisión de la oficina" footer="Con estos datos lo llenas en la página de la financiera. Al aprobarla, al vendedor le aparece la autorización de instalación.">
          <Row title={app.status === 'approved' ? 'Cambiar la aprobación' : 'Aprobar crédito'} leading={<BadgeCheck size={20} color="#1d9a46" />} onClick={() => setDecision('approved')} />
          <Row title="Negar crédito" leading={<XCircle size={20} color="#e5484d" />} onClick={() => setDecision('declined')} />
          {app.status === 'submitted' && <Row title="Devolver al vendedor para corregir" subtitle="Se borran las firmas: tienen que firmar otra vez" leading={<Undo2 size={20} color="#ff9500" />} onClick={() => setDecision('return')} />}
        </Group>
      )}

      {reviews && !app.purged && (
        <Group label="Datos de identidad" footer={`Cada vez que alguien los abre se registra en el Registro de actividad. Se borran solos ${CREDIT_KEEP_DAYS} días después de aprobar o negar.`}>
          {!secret && <Row title="Mostrar seguro social y licencia completos" leading={<Eye size={20} />} onClick={reveal} />}
          <div className="id-photos read-only">
            {['id1-front', 'id1-back', 'id2-front', 'id2-back']
              .filter((k) => app.files.includes(k))
              .map((k) => (
                <a key={k} href={fileUrl(app, k)} target="_blank" rel="noopener" className="id-photo-img">
                  <img src={fileUrl(app, k)} alt={k} />
                  <span>{k.startsWith('id1') ? 'Aplicante' : 'Coaplicante'} · {k.endsWith('front') ? 'frente' : 'reverso'}</span>
                </a>
              ))}
          </div>
        </Group>
      )}
      {app.purged && <p className="group-foot">El seguro social, la licencia y las fotos de las IDs ya se borraron (se guardan solo {CREDIT_KEEP_DAYS} días).</p>}

      {person(app.data.applicant, shown.applicant, 'Aplicante')}
      {app.data.coApplicant && person(app.data.coApplicant, shown.coApplicant, 'Coaplicante')}

      <Group label="Vivienda">
        <Row title="La casa está" value={app.data.home.status === 'paid' ? 'Pagada' : app.data.home.status === 'mortgaged' ? 'Financiada' : app.data.home.status === 'rent' ? 'Alquilada' : '—'} />
        {app.data.home.company && <Row title="Financiera" value={app.data.home.company} />}
        {app.data.home.monthlyPayment && <Row title="Pago mensual" value={app.data.home.monthlyPayment} />}
        {app.data.home.howLong && <Row title="Tiempo" value={app.data.home.howLong} />}
      </Group>

      {app.data.references.some((r) => r.name) && (
        <Group label="Referencias">
          {app.data.references.filter((r) => r.name).map((r, i) => (
            <Row key={i} title={r.name} subtitle={[r.relationship, r.phone && formatPhone(r.phone)].filter(Boolean).join(' · ')} />
          ))}
        </Group>
      )}

      <Group label="Vendedor">
        <Row title={seller ?? '—'} leading={<UserRound size={20} />} />
      </Group>

      {(reviews || (mine && app.status === 'draft')) && app.status !== 'signed' && (
        <div className="group" style={{ marginTop: 20 }}>
          <button type="button" className="row danger" onClick={remove}>
            <Trash2 size={18} /> Borrar solicitud
          </button>
        </div>
      )}

      <DecisionSheet
        app={app}
        mode={decision}
        onClose={() => setDecision(null)}
        onDone={async (next, message) => {
          setApp(next);
          setDecision(null);
          await reload();
          load();
          toast(message);
        }}
      />
    </Page>
  );
}

function DecisionSheet({ app, mode, onClose, onDone }: { app: CreditApp; mode: 'approved' | 'declined' | 'return' | null; onClose: () => void; onDone: (app: CreditApp, message: string) => Promise<void> }) {
  const data = useData();
  const a = useAccess();
  const createFinancier = useCatalogCreate('financiers');
  const [financierId, setFinancierId] = useState<number | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<number | null>(null);
  const [apr, setApr] = useState('');
  const [term, setTerm] = useState('');
  const [monthly, setMonthly] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickOpen, setPickOpen] = useState(false);

  // Al cambiar algo, el aviso anterior ya no aplica.
  useEffect(() => setError(null), [financierId, approvedAmount, apr, term, monthly, notes]);
  useEffect(() => {
    if (!mode) return;
    const d = app.decision;
    setFinancierId(d?.financierId ?? null);
    setApprovedAmount(d?.approvedAmount ?? app.amount);
    setApr(d?.apr != null ? String(d.apr) : '');
    setTerm(d?.termMonths ? String(d.termMonths) : '');
    setMonthly(d?.monthlyPayment ?? null);
    setNotes(mode === 'return' ? '' : d?.notes ?? '');
    setError(null);
  }, [mode, app]);

  const submit = async () => {
    setError(null);
    if (mode === 'return' && !notes.trim()) return setError('Escribe qué hay que corregir.');
    if (mode === 'approved' && !financierId) return setError('Elige la financiera que lo aprobó.');
    setBusy(true);
    try {
      const body =
        mode === 'approved'
          ? { result: 'approved', financierId, approvedAmount, apr: apr ? Number(apr.replace(',', '.')) : null, termMonths: term ? Number(term) : null, monthlyPayment: monthly, notes: notes || null }
          : mode === 'declined'
            ? { result: 'declined', financierId, notes: notes || null }
            : { result: 'return', notes };
      const r = await api<{ app: CreditApp }>(`/credit/${app.id}/decision`, { method: 'POST', body });
      await onDone(r.app, mode === 'approved' ? 'Crédito aprobado: al vendedor ya le aparece la autorización' : mode === 'declined' ? 'Crédito negado' : 'Devuelta al vendedor');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'approved' ? 'Aprobar crédito' : mode === 'declined' ? 'Negar crédito' : 'Devolver para corregir';
  return (
    <Sheet open={mode != null} onClose={onClose} title={title} onSubmit={submit} submitLabel={mode === 'approved' ? 'Aprobar' : mode === 'declined' ? 'Negar' : 'Devolver'} busy={busy} error={error}>
      {mode !== 'return' && (
        <>
          <div className="group">
            <PickerRow label="Financiera" value={financierId ? data.financierById.get(financierId)?.name : null} onOpen={() => setPickOpen(true)} />
          </div>
          <Picker
            open={pickOpen}
            onClose={() => setPickOpen(false)}
            title="Financiera"
            options={data.financiers.filter((f) => f.active || f.id === financierId).map((f) => ({ id: f.id, label: f.name }))}
            value={financierId}
            onSelect={setFinancierId}
            {...(a.can('catalogs.financiers') ? { onCreate: createFinancier, createLabel: 'Agregar financiera' } : {})}
          />
        </>
      )}
      {mode === 'approved' && (
        <div className="group">
          <MoneyField label="Monto aprobado" value={approvedAmount} onChange={setApprovedAmount} />
          <TextField label="APR (%)" value={apr} onChange={(v) => setApr(v.replace(/[^\d.,]/g, ''))} inputMode="decimal" placeholder="ej. 9.99" autoComplete="off" />
          <TextField label="Plazo (meses)" value={term} onChange={(v) => setTerm(v.replace(/\D/g, ''))} inputMode="numeric" placeholder="ej. 120" autoComplete="off" />
          <MoneyField label="Cuota mensual" value={monthly} onChange={setMonthly} />
        </div>
      )}
      <div className="group">
        <StackField label={mode === 'return' ? 'Qué hay que corregir' : 'Notas'} value={notes} onChange={setNotes} multiline placeholder={mode === 'return' ? 'El seguro social del coaplicante está mal…' : 'Opcional'} />
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Autorizacion de instalacion                                          */
/* ------------------------------------------------------------------ */

function contractDraft(app: CreditApp, data: ReturnType<typeof useData>, today: string): ContractData {
  const p = app.data.applicant;
  const co = app.data.coApplicant;
  const brand = brandName(data, app.brandId);
  const client = app.clientId ? data.clientById.get(app.clientId) : undefined;
  const latest = app.clientId ? data.salesByClient.get(app.clientId)?.[0] : undefined;
  const finance = app.decision?.approvedAmount ?? app.amount;
  return {
    date: today,
    buyer1: { name: personName(p), phone: p.cellPhone || p.homePhone, email: p.email },
    buyer2: co ? { name: personName(co), phone: co.cellPhone || co.homePhone, email: co.email } : null,
    address: p.address || client?.address || '',
    city: p.city || client?.city || '',
    state: p.state || client?.state || 'FL',
    zip: p.zip || client?.zip || '',
    waterTreatment: { brand, model: '' },
    reverseOsmosis: { brand: '', model: '' },
    other: '',
    equipment: { ...EMPTY_EQUIPMENT },
    installDate: null,
    installSlot: slotOf(latest?.installTime),
    waterSource: null,
    iceMaker: null,
    people: null,
    floor: null,
    payment: null,
    cashPrice: finance,
    installation: null,
    taxes: null,
    downPayment: null,
    amountToFinance: finance,
    payments: app.decision?.termMonths ?? null,
    monthlyPayment: app.decision?.monthlyPayment ?? null,
    apr: app.decision?.apr ?? null,
  };
}

export function ContractForm({ id }: { id: number }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const { app, setApp, error: loadError } = useCreditApp(id);
  const [form, setForm] = useState<ContractData | null>(null);
  const initial = useRef('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [apr, setApr] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const leaving = useRef(false);

  useEffect(() => {
    if (app && !form) {
      const f = app.contract ?? contractDraft(app, data, data.today);
      initial.current = JSON.stringify(f);
      setForm(f);
      setApr(f.apr != null ? String(f.apr) : '');
    }
  }, [app, form, data]);

  useLeaveGuard(
    () => !leaving.current && form != null && JSON.stringify(form) !== initial.current,
    () => confirm({ title: '¿Salir sin guardar?', message: 'Lo que escribiste se perderá.', confirm: 'Salir sin guardar', cancel: 'Seguir llenando', danger: true })
  );

  const back = { label: 'Solicitud', to: `/creditos/${id}` };
  if (loadError) return <Page title="Autorización de instalación" back={back}><Empty title={loadError} /></Page>;
  if (!app || !form) return <Page title="Autorización de instalación" back={back}><div className="loading-block" /></Page>;
  if (app.status !== 'approved') {
    return (
      <Page title="Autorización de instalación" back={back}>
        <Empty
          title={app.status === 'signed' ? 'La autorización ya se firmó' : 'El crédito todavía no está aprobado'}
          action={app.status === 'signed' ? <Link to={`/imprimir/autorizacion/${id}`} className="btn">Ver la autorización</Link> : undefined}
        />
      </Page>
    );
  }

  const brand = brandName(data, app.brandId) || 'Infinity Water';
  const text = contractText(brand.toUpperCase(), form.state);
  const set = (patch: Partial<ContractData>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const setEq = <K extends keyof Equipment>(key: K, value: Equipment[K]) => setForm((f) => (f ? { ...f, equipment: { ...f.equipment, [key]: value } } : f));
  const t = contractTotals(form);
  const hasEq = form.equipment.outdoorTanks > 0 || form.equipment.aerator || (form.equipment.wholeHouseRo ?? 0) > 0 || form.equipment.ro || Boolean(form.equipment.other);

  const save = async () => {
    const body = { ...form, apr: apr ? Number(apr.replace(',', '.')) : null, equipment: { ...form.equipment, roType: form.equipment.ro ? form.equipment.roType : null, roUv: form.equipment.ro && form.equipment.roUv } };
    const r = await api<{ app: CreditApp }>(`/credit/${id}/contract`, { method: 'PUT', body: { ...body, expectedUpdatedAt: app.updatedAt } });
    setApp(r.app);
    initial.current = JSON.stringify(form);
    return r.app;
  };

  const fail = (message: string, field?: string) => {
    setError(message);
    if (field) focusField(formRef.current, field);
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await save();
      toast('Autorización guardada');
    } catch (err: any) {
      fail(err.message, err.field);
    } finally {
      setBusy(false);
    }
  };

  const startSigning = async () => {
    setError(null);
    if (!form.buyer1.name.trim()) return fail('Falta el nombre del comprador.', 'buyer1.name');
    if (!form.address.trim() || !form.city.trim()) return fail('Falta la dirección de la instalación.', 'address');
    if (!hasEq) return fail('Marca lo que se va a instalar.', 'equipment');
    if (!form.installDate) return fail('Falta el día de la instalación.', 'installDate');
    if (!form.installSlot) return fail('Marca la hora de la instalación (mañana o tarde).', 'installSlot');
    if (!form.waterSource) return fail('Marca la fuente de agua (ciudad o pozo).', 'waterSource');
    if (!form.cashPrice) return fail('Falta el precio.', 'cashPrice');
    if (form.buyer2 && !form.buyer2.name.trim()) return fail('Escribe el nombre del comprador 2 o quítalo.', 'buyer2.name');
    // El contrato dice que no se firme con espacios en blanco: se avisa cuales quedan.
    const blanks = [
      form.iceMaker == null && 'conexión del hielo',
      form.people == null && 'personas en la casa',
      form.floor == null && 'tipo de piso',
      (form.downPayment ?? 0) > 0 && !form.payment && 'pago de la cuota inicial',
      !form.waterTreatment.model && !form.reverseOsmosis.model && 'modelo del equipo',
    ].filter(Boolean);
    if (blanks.length && !(await confirm({ title: 'Quedan espacios en blanco', message: `${blanks.join(', ')}. El contrato dice que no se firme con espacios en blanco. ¿Firmar igual?`, confirm: 'Firmar igual', cancel: 'Completar' }))) return;
    setBusy(true);
    try {
      await save();
      setSigning(true);
    } catch (err: any) {
      fail(err.message, err.field);
    } finally {
      setBusy(false);
    }
  };

  const sign = async (sigs: Record<string, string>) => {
    const r = await api<{ app: CreditApp; saleId: number }>(`/credit/${id}/contract/sign`, { method: 'POST', body: { consent: true, expectedUpdatedAt: app.updatedAt, signatures: { buyer1: sigs.buyer1, buyer2: sigs.buyer2 ?? null, rep: sigs.rep, glCustomer: sigs.glCustomer ?? null, glRep: sigs.glRep ?? null } } });
    leaving.current = true;
    setApp(r.app);
    await reload();
    setSigning(false);
    toast('Autorización firmada: la venta quedó registrada');
    navigate(`/imprimir/autorizacion/${id}?firmado=1`, { replace: true, force: true });
  };

  const repName = (a.personId ? data.personById.get(a.personId)?.name : null) ?? data.me.name;
  const financier = app.decision?.financierId ? data.financierById.get(app.decision.financierId)?.name : null;
  // GoodLeap exige su formulario "Warranties & Right to Cancel" firmado por el cliente y el vendedor.
  const goodleap = isGoodLeap(financier) && (form.amountToFinance ?? 0) > 0;
  const start = form.installDate ? dateWithYear(form.installDate) : '';
  const signers = [
    { key: 'buyer1', role: 'Comprador 1', name: form.buyer1.name },
    ...(form.buyer2 ? [{ key: 'buyer2', role: 'Comprador 2', name: form.buyer2.name }] : []),
    { key: 'rep', role: 'Vendedor', name: repName },
    ...(goodleap
      ? [
          { key: 'glCustomer', role: 'Cliente', name: form.buyer1.name, document: 'Formulario de GoodLeap', mustRead: true, agreement: <GoodLeapReading start={start} signer="customer" /> },
          { key: 'glRep', role: 'Vendedor', name: repName, document: 'Formulario de GoodLeap', mustRead: true, agreement: <GoodLeapReading start={start} signer="rep" /> },
        ]
      : []),
  ];

  return (
    <Page title="Autorización de instalación" subtitle={`${brand} · ${app.applicantName}`} back={back} narrow>
      <div className="banner green">
        <BadgeCheck size={20} />
        <div>
          <div className="banner-title">Crédito aprobado{financier ? ` con ${financier}` : ''}</div>
          <div className="banner-text">Llénala con el cliente, revísenla juntos y firmen. Al firmar se registra la venta.</div>
        </div>
      </div>
      {goodleap && (
        <div className="banner blue">
          <ClipboardSignature size={20} />
          <div>
            <div className="banner-title">GoodLeap: hay un formulario más</div>
            <div className="banner-text">Además de la autorización, el cliente y tú firman el formulario de GoodLeap «Warranties &amp; Right to Cancel». Sin esas dos firmas no se puede terminar.</div>
          </div>
        </div>
      )}
      <form onSubmit={submit} noValidate ref={formRef} className="credit-form">
        <Group label="Compradores">
          <TextField label="Comprador 1" value={form.buyer1.name} onChange={(v) => set({ buyer1: { ...form.buyer1, name: v } })} autoComplete="off" autoCapitalize="words" field="buyer1.name" />
          <TextField label="Celular" type="tel" inputMode="tel" value={form.buyer1.phone} onChange={(v) => set({ buyer1: { ...form.buyer1, phone: v } })} autoComplete="off" />
          <TextField label="Correo" type="email" inputMode="email" value={form.buyer1.email} onChange={(v) => set({ buyer1: { ...form.buyer1, email: v.trim() } })} autoComplete="off" />
          <SwitchRow label="Comprador 2" subtitle="Otra persona que también compra (esposo/a)" checked={form.buyer2 != null} onChange={(v) => set({ buyer2: v ? form.buyer2 ?? { name: '', phone: '', email: '' } : null })} />
          {form.buyer2 && (
            <>
              <TextField label="Nombre" value={form.buyer2.name} onChange={(v) => set({ buyer2: { ...form.buyer2!, name: v } })} autoComplete="off" autoCapitalize="words" field="buyer2.name" />
              <TextField label="Celular" type="tel" inputMode="tel" value={form.buyer2.phone} onChange={(v) => set({ buyer2: { ...form.buyer2!, phone: v } })} autoComplete="off" />
              <TextField label="Correo" type="email" inputMode="email" value={form.buyer2.email} onChange={(v) => set({ buyer2: { ...form.buyer2!, email: v.trim() } })} autoComplete="off" />
            </>
          )}
        </Group>

        <Group label="Dirección de la instalación">
          <TextField label="Dirección" value={form.address} onChange={(v) => set({ address: v })} autoComplete="off" autoCapitalize="words" field="address" />
          <TextField label="Ciudad" value={form.city} onChange={(v) => set({ city: v })} autoComplete="off" autoCapitalize="words" field="city" />
          <StateZipRow state={form.state} zip={form.zip} onState={(v) => set({ state: v })} onZip={(v) => set({ zip: v })} field="contract" />
        </Group>

        <Group label="Lo que se instala" field="equipment" footer={hasEq ? equipmentSummary(form.equipment) : 'Marca lo que se va a instalar (así queda la venta).'}>
          <SegmentedRow title="Filtros fuera de casa" options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: n === 0 ? 'No' : String(n) }))} value={form.equipment.outdoorTanks} onChange={(n) => setEq('outdoorTanks', n)} />
          <SwitchRow label="Aireador" checked={form.equipment.aerator} onChange={(v) => setEq('aerator', v)} />
          <SegmentedRow title="Ósmosis de toda la casa" subtitle="membranas" options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: n === 0 ? 'No' : String(n) }))} value={form.equipment.wholeHouseRo ?? 0} onChange={(n) => setEq('wholeHouseRo', n)} />
          <SwitchRow label="Ósmosis inversa en la cocina" checked={form.equipment.ro} onChange={(v) => setEq('ro', v)} />
          {form.equipment.ro && (
            <>
              <SegmentedRow
                title="Equipo de ósmosis"
                options={[
                  { value: 'five_stage', label: 'De 5 pasos' },
                  { value: 'box', label: 'En caja' },
                ]}
                value={form.equipment.roType}
                onChange={(v) => setEq('roType', v)}
              />
              <SwitchRow label="Con luz UV" checked={form.equipment.roUv} onChange={(v) => setEq('roUv', v)} />
            </>
          )}
          <TextField label="Otro" value={form.equipment.other ?? ''} onChange={(v) => setEq('other', v)} placeholder="Opcional" autoComplete="off" />
        </Group>

        <Group label="Marca y modelo (como sale en el contrato)">
          <TextField label="Planta · marca" value={form.waterTreatment.brand} onChange={(v) => set({ waterTreatment: { ...form.waterTreatment, brand: v } })} autoComplete="off" />
          <TextField label="Planta · modelo" value={form.waterTreatment.model} onChange={(v) => set({ waterTreatment: { ...form.waterTreatment, model: v } })} autoComplete="off" />
          <TextField label="Ósmosis · marca" value={form.reverseOsmosis.brand} onChange={(v) => set({ reverseOsmosis: { ...form.reverseOsmosis, brand: v } })} autoComplete="off" />
          <TextField label="Ósmosis · modelo" value={form.reverseOsmosis.model} onChange={(v) => set({ reverseOsmosis: { ...form.reverseOsmosis, model: v } })} autoComplete="off" />
          <StackField label="Otros productos o promociones incluidas" value={form.other} onChange={(v) => set({ other: v })} placeholder="Opcional" />
        </Group>

        <Group label="Instalación" footer={`El cliente puede cancelar sin costo hasta la medianoche del ${dateWithYear(cancelDeadline(data.today))} (3 días hábiles).`}>
          <DateField field="installDate" label="Día estimado" value={form.installDate ?? ''} onChange={(v) => set({ installDate: v || null })} quick="future" min={form.date} />
          <SegmentedRow
            field="installSlot"
            title="Hora"
            options={[
              { value: 'am', label: '8 am – 1 pm' },
              { value: 'pm', label: '1 pm – 6 pm' },
            ]}
            value={form.installSlot}
            onChange={(v) => set({ installSlot: v })}
          />
          <SegmentedRow
            field="waterSource"
            title="Fuente de agua"
            options={[
              { value: 'city', label: 'Ciudad' },
              { value: 'well', label: 'Pozo' },
            ]}
            value={form.waterSource}
            onChange={(v) => set({ waterSource: v })}
          />
          <SegmentedRow
            title="Conexión al hielo del refrigerador"
            options={[
              { value: 'yes', label: 'Sí' },
              { value: 'no', label: 'No' },
            ]}
            value={form.iceMaker == null ? null : form.iceMaker ? 'yes' : 'no'}
            onChange={(v) => set({ iceMaker: v === 'yes' })}
          />
          <TextField label="Personas en la casa" value={form.people != null ? String(form.people) : ''} onChange={(v) => set({ people: v ? Math.min(30, Number(v.replace(/\D/g, '')) || 0) || null : null })} inputMode="numeric" autoComplete="off" />
          <SegmentedRow
            title="El piso es"
            options={[
              { value: 'raised', label: 'Elevado' },
              { value: 'slab', label: 'Concreto' },
            ]}
            value={form.floor}
            onChange={(v) => set({ floor: v })}
          />
        </Group>

        <Group
          label="Precio y pago"
          footer={
            form.amountToFinance != null && form.amountToFinance !== t.balance
              ? `Ojo: el saldo (${moneyPlain(t.balance)}) no es igual a la cantidad a financiar (${moneyPlain(form.amountToFinance)}).`
              : undefined
          }
        >
          <MoneyField field="cashPrice" label="Precio contado" value={form.cashPrice} onChange={(v) => set({ cashPrice: v })} />
          <MoneyField label="Instalación" value={form.installation} onChange={(v) => set({ installation: v })} placeholder="Incluida" />
          <MoneyField label="Impuestos" value={form.taxes} onChange={(v) => set({ taxes: v })} />
          <Row title="Total precio contado" value={<b>{moneyPlain(t.total)}</b>} />
          <MoneyField label="Cuota inicial" value={form.downPayment} onChange={(v) => set({ downPayment: v })} />
          <Row title="Saldo" value={<b>{moneyPlain(t.balance)}</b>} />
          <SegmentedRow
            title="Pago de la cuota inicial"
            options={[
              { value: 'card', label: 'Tarjeta' },
              { value: 'check', label: 'Cheque' },
            ]}
            value={form.payment}
            onChange={(v) => set({ payment: v })}
          />
        </Group>

        <Group label="Financiamiento" footer={financier ? `Aprobado con ${financier}.` : undefined}>
          <MoneyField field="amountToFinance" label="Cantidad a financiar" value={form.amountToFinance} onChange={(v) => set({ amountToFinance: v })} />
          <TextField label="Número de pagos" value={form.payments != null ? String(form.payments) : ''} onChange={(v) => set({ payments: v ? Number(v.replace(/\D/g, '')) || null : null })} inputMode="numeric" autoComplete="off" />
          <MoneyField label="Pago mensual" value={form.monthlyPayment} onChange={(v) => set({ monthlyPayment: v })} />
          <TextField label="APR (%)" value={apr} onChange={(v) => setApr(v.replace(/[^\d.,]/g, ''))} inputMode="decimal" autoComplete="off" />
        </Group>

        <div className="form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn gray" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" className="btn" disabled={busy} onClick={startSigning}>
            <ClipboardSignature size={18} /> Firmar autorización
          </button>
        </div>
      </form>

      <SignSheet
        open={signing}
        onClose={() => setSigning(false)}
        title="Firmas de la autorización"
        signers={signers}
        finishLabel="Firmar y registrar la venta"
        agreement={
          <>
            <p className="sig-amount">
              {brand} · {equipmentSummary(form.equipment)} · Total <b>{moneyPlain(t.total)}</b>
              {form.installDate ? ` · instalación ${dateWithYear(form.installDate)}${form.installSlot ? ` (${SLOT_LABEL[form.installSlot]})` : ''}` : ''}
            </p>
            <p>{text.payment.es}</p>
            <p className="muted">{text.payment.en}</p>
            <p>
              <b>{text.rightToCancel.es}</b>
            </p>
            <p className="muted">{text.rightToCancel.en}</p>
            <p>
              {text.receivedCopy.es} <span className="muted">{text.receivedCopy.en}</span>
            </p>
          </>
        }
        readMore={{ href: `/admin/imprimir/autorizacion/${id}?borrador=1`, label: 'Leer el contrato completo' }}
        onDone={sign}
      />
    </Page>
  );
}

