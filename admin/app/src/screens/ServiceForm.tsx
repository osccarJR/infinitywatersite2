/**
 * Servicio tecnico: el cliente reporta un problema (o toca mantenimiento).
 * Sirve tambien para ponerse al dia: el cliente se puede crear aqui mismo.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Service, ServiceBilling, ServiceKind, ServicePayment, ServiceStatus } from '../../../shared/domain.ts';
import { SERVICE_KIND_LABEL, SERVICE_PAYMENT_LABEL, equipmentSummary, serviceMoney } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { goBack, useLeaveGuard } from '../lib/router.tsx';
import { focusField, focusInvalid } from '../lib/focus.ts';
import { api } from '../lib/api.ts';
import { dateWithYear, moneyPlain } from '../lib/format.ts';
import { Empty, Group, MoneyField, hasInvalidMoney, Page, SegmentedRow, StackField, SwitchRow } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { ClientPicker, PersonPicker, PickerRow, clientRef, type ClientChoice } from '../ui/pickers.tsx';
import { Picker, useFeedback } from '../ui/sheet.tsx';

interface FormState {
  client: ClientChoice;
  saleId: number | null;
  reportedDate: string;
  kind: ServiceKind;
  problem: string;
  solution: string;
  technicianId: number | null;
  visitDate: string;
  status: ServiceStatus;
  closedDate: string;
  billing: ServiceBilling | null;
  amount: number | null;
  paymentMethod: ServicePayment | null;
  technicianPay: number | null;
  technicianPaid: boolean;
  technicianPaidDate: string;
  notes: string;
  nextServiceDate: string;
}

export function ServiceForm({ id, clientId = null, saleId = null }: { id?: number; clientId?: number | null; saleId?: number | null }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const existing = id ? data.services.find((s) => s.id === id) : undefined;

  const [form, setForm] = useState<FormState>(() => {
    const linkedSaleId = existing?.saleId ?? saleId ?? (clientId ? data.salesByClient.get(clientId)?.[0]?.id ?? null : null);
    const linked = linkedSaleId ? data.sales.find((s) => s.id === linkedSaleId) : undefined;
    return {
      client: existing ? { mode: 'existing', id: existing.clientId } : clientId ? { mode: 'existing', id: clientId } : null,
      saleId: linkedSaleId,
      reportedDate: existing?.reportedDate ?? data.today,
      kind: existing?.kind ?? 'problem',
      problem: existing?.problem ?? '',
      solution: existing?.solution ?? '',
      technicianId: existing?.technicianId ?? null,
      visitDate: existing?.visitDate ?? '',
      status: existing?.status ?? 'open',
      closedDate: existing?.closedDate ?? '',
      billing: existing?.billing ?? null,
      amount: existing?.amount ?? null,
      paymentMethod: existing?.paymentMethod ?? null,
      technicianPay: existing?.technicianPay ?? null,
      technicianPaid: existing?.technicianPaid ?? false,
      technicianPaidDate: existing?.technicianPaidDate ?? '',
      notes: existing?.notes ?? '',
      nextServiceDate: linked?.nextServiceDate ?? '',
    };
  });
  const initial = useRef(JSON.stringify(form));
  const [salePickerOpen, setSalePickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const savedId = useRef<number | null>(id ?? null);
  const savedClientId = useRef<number | null>(null);
  const version = useRef<string | undefined>(existing?.updatedAt);
  const leaving = useRef(false);

  useEffect(() => setError(null), [form]);

  useLeaveGuard(
    () => !leaving.current && JSON.stringify(form) !== initial.current,
    () => confirm({ title: '¿Salir sin guardar?', message: 'Lo que escribiste se perderá.', confirm: 'Salir sin guardar', cancel: 'Seguir editando', danger: true })
  );

  if (id && !existing) {
    return (
      <Page title="Servicio" back={{ label: 'Servicio', to: '/servicio' }}>
        <Empty title="Este servicio no existe" text="Puede que se haya borrado." />
      </Page>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const money = serviceMoney(form);
  const clientSales = form.client?.mode === 'existing' ? data.salesByClient.get(form.client.id) ?? [] : [];
  const linkedSale = form.saleId ? data.sales.find((s) => s.id === form.saleId) : undefined;
  const back = existing
    ? { label: 'Servicio', to: '/servicio' }
    : clientId
      ? { label: 'Cliente', to: `/clientes/${clientId}` }
      : { label: 'Servicio', to: '/servicio' };

  const chooseClient = (client: ClientChoice) =>
    setForm((f) => {
      const sales = client?.mode === 'existing' ? data.salesByClient.get(client.id) ?? [] : [];
      const sale = sales[0];
      return { ...f, client, saleId: sale?.id ?? null, nextServiceDate: sale?.nextServiceDate ?? '' };
    });

  const cancel = () => goBack(back.to);

  const fail = (message: string, field?: string) => {
    setError(message);
    if (field) focusField(formRef.current, field);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.client) return fail('Elige el cliente o créalo.', 'client');
    if (form.client.mode === 'new' && !form.client.draft.name.trim()) return fail('Escribe el nombre del cliente nuevo.', 'client.create.name');
    if (!form.problem.trim()) return fail('Describe el problema o el motivo de la visita.', 'problem');
    if (form.billing === 'charged' && form.amount == null) return fail('Pon cuánto se le cobró (o marca garantía).', 'amount');
    if (hasInvalidMoney(formRef.current)) {
      setError('Hay un monto mal escrito (en rojo). Corrígelo para guardar.');
      return void focusInvalid(formRef.current);
    }
    if (form.status === 'closed' && form.closedDate && form.closedDate < form.reportedDate) return fail('El cierre no puede ser antes del reporte.', 'closedDate');

    setBusy(true);
    let service: Service;
    try {
      const saveId = savedId.current;
      ({ service } = await api<{ service: Service }>(saveId ? `/services/${saveId}` : '/services', {
        method: saveId ? 'PUT' : 'POST',
        body: {
          ...(saveId ? { expectedUpdatedAt: version.current } : {}),
          client: savedClientId.current ? { id: savedClientId.current } : clientRef(form.client),
          saleId: form.client.mode === 'existing' ? form.saleId : null,
          reportedDate: form.reportedDate,
          kind: form.kind,
          problem: form.problem,
          solution: form.solution || null,
          technicianId: form.technicianId,
          visitDate: form.visitDate || null,
          status: form.status,
          closedDate: form.status === 'closed' ? form.closedDate || data.today : null,
          billing: form.billing,
          amount: form.billing === 'charged' ? form.amount : null,
          paymentMethod: form.billing === 'charged' ? form.paymentMethod : null,
          technicianPay: form.technicianPay,
          technicianPaid: form.technicianPaid,
          technicianPaidDate: form.technicianPaid ? form.technicianPaidDate || null : null,
          notes: form.notes || null,
          ...(form.saleId && form.client.mode === 'existing' ? { nextServiceDate: form.nextServiceDate || null } : {}),
        },
      }));
    } catch (err: any) {
      setBusy(false);
      fail(err.message, err.field);
      return;
    }
    savedId.current = service.id;
    version.current = service.updatedAt;
    if (form.client.mode === 'new') savedClientId.current = service.clientId;
    try {
      await reload();
    } catch {
      setBusy(false);
      setError('El servicio se guardó, pero no se pudo actualizar la pantalla. Revisa tu conexión y toca Guardar otra vez.');
      return;
    }
    leaving.current = true;
    toast(id ? 'Servicio actualizado' : 'Servicio registrado');
    goBack(back.to, { force: true });
  };

  const remove = async () => {
    const ok = await confirm({ title: '¿Borrar este servicio?', message: 'No se puede deshacer.', confirm: 'Borrar servicio', danger: true });
    if (!ok) return;
    try {
      await api(`/services/${id}`, { method: 'DELETE' });
      leaving.current = true;
      await reload();
      toast('Servicio borrado');
      goBack('/servicio', { force: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page title={id ? 'Servicio técnico' : 'Nuevo servicio'} back={back} narrow>
      <form onSubmit={submit} noValidate ref={formRef}>
        <ClientPicker value={form.client} onChange={chooseClient} />

        {clientSales.length > 0 && (
          <Group footer="El equipo del cliente al que se refiere este servicio.">
            <PickerRow
              label="Equipo"
              value={linkedSale ? `${equipmentSummary(linkedSale.equipment)}` : null}
              placeholder="Ninguno en particular"
              onOpen={() => setSalePickerOpen(true)}
            />
          </Group>
        )}
        <Picker
          open={salePickerOpen}
          onClose={() => setSalePickerOpen(false)}
          title="Equipo"
          options={clientSales.map((s) => ({ id: s.id, label: equipmentSummary(s.equipment), sublabel: `Venta del ${dateWithYear(s.saleDate)}` }))}
          value={form.saleId}
          onSelect={(saleId) => {
            const sale = saleId ? data.sales.find((s) => s.id === saleId) : undefined;
            setForm((f) => ({ ...f, saleId, nextServiceDate: sale?.nextServiceDate ?? '' }));
          }}
          allowNone="Ninguno en particular"
        />

        <Group label="Qué pasó">
          <SegmentedRow
            title="Tipo"
            options={(Object.keys(SERVICE_KIND_LABEL) as ServiceKind[]).map((k) => ({ value: k, label: k === 'filters' ? 'Filtros' : SERVICE_KIND_LABEL[k] }))}
            value={form.kind}
            onChange={(v) => set('kind', v)}
          />
          <DateField field="reportedDate" label="Fecha del reporte" value={form.reportedDate} onChange={(v) => set('reportedDate', v || data.today)} />
          <StackField
            field="problem"
            label={form.kind === 'problem' ? 'Problema que reporta' : 'Motivo de la visita'}
            value={form.problem}
            onChange={(v) => set('problem', v)}
            placeholder={form.kind === 'problem' ? 'El agua volvió a oler, gotea el filtro…' : 'Cambio de filtros de la ósmosis…'}
            multiline
            autoFocus={!id && Boolean(form.client)}
          />
        </Group>

        <Group label="Atención">
          <PersonPicker field="technicianId" role="installer" label="Técnico" value={form.technicianId} onChange={(v) => set('technicianId', v)} />
          <DateField field="visitDate" label="Fecha de la visita" value={form.visitDate} onChange={(v) => set('visitDate', v)} quick="future" />
          <StackField field="solution" label="Qué se hizo" value={form.solution} onChange={(v) => set('solution', v)} placeholder="Se cambió el cartucho de sedimento…" multiline />
        </Group>

        <Group label="Cobro">
          <SegmentedRow
            title="¿Garantía o se cobró?"
            options={[
              { value: 'warranty', label: 'Garantía' },
              { value: 'charged', label: 'Se cobró' },
            ]}
            value={form.billing}
            onChange={(v) => set('billing', v)}
          />
          {form.billing === 'charged' && (
            <>
              <MoneyField field="amount" label="Cuánto se cobró" value={form.amount} onChange={(v) => set('amount', v)} />
              <div className="row-block" data-field="paymentMethod">
                <div className="row-title" style={{ marginBottom: 10 }}>
                  ¿Cómo pagó? <span className="muted" style={{ fontSize: 14 }}>· déjalo sin marcar si aún no paga</span>
                </div>
                <div className="pay-methods" role="group" aria-label="Medio de pago">
                  {(Object.keys(SERVICE_PAYMENT_LABEL) as ServicePayment[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`pay-method${form.paymentMethod === k ? ' on' : ''}`}
                      aria-pressed={form.paymentMethod === k}
                      onClick={() => set('paymentMethod', form.paymentMethod === k ? null : k)}
                    >
                      {SERVICE_PAYMENT_LABEL[k]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </Group>

        <Group
          label="Pago al técnico"
          footer={
            form.billing === 'charged' || form.technicianPay
              ? `Ganancia del servicio: ${moneyPlain(money.profit)}${money.technician ? ` (cobrado ${moneyPlain(money.charged)} − técnico ${moneyPlain(money.technician)})` : ''}`
              : 'Lo que le pagas al técnico por este trabajo. Se junta con sus instalaciones en Pagos → Técnicos.'
          }
        >
          <MoneyField field="technicianPay" label="Se le paga al técnico" value={form.technicianPay} onChange={(v) => set('technicianPay', v)} placeholder="Opcional" />
          {(form.technicianPay ?? 0) > 0 && (
            <SwitchRow
              label="Ya se le pagó"
              checked={form.technicianPaid}
              onChange={(v) => setForm((f) => ({ ...f, technicianPaid: v, technicianPaidDate: v && !f.technicianPaidDate ? data.today : f.technicianPaidDate }))}
            />
          )}
          {form.technicianPaid && (form.technicianPay ?? 0) > 0 && (
            <DateField field="technicianPaidDate" label="Fecha del pago" value={form.technicianPaidDate} onChange={(v) => set('technicianPaidDate', v)} />
          )}
        </Group>

        <Group label="Estado">
          <SegmentedRow
            title="Estado"
            options={[
              { value: 'open', label: 'Abierto' },
              { value: 'closed', label: 'Resuelto' },
            ]}
            value={form.status}
            onChange={(status) => setForm((f) => ({ ...f, status, closedDate: status === 'closed' && !f.closedDate ? data.today : f.closedDate }))}
          />
          {form.status === 'closed' && <DateField field="closedDate" label="Fecha de cierre" value={form.closedDate} onChange={(v) => set('closedDate', v)} />}
          {linkedSale && (
            <>
              <DateField field="nextServiceDate" label="Próximo mantenimiento" value={form.nextServiceDate} onChange={(v) => set('nextServiceDate', v)} quick="maintenance" />
            </>
          )}
        </Group>

        <Group label="Notas">
          <StackField label="Notas internas" value={form.notes} onChange={(v) => set('notes', v)} placeholder="Opcional" multiline />
        </Group>

        <div className="form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="btn gray" onClick={cancel}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Guardando…' : id ? 'Guardar cambios' : 'Registrar servicio'}
          </button>
        </div>

        {id && (
          <>
            <div className="group" style={{ marginTop: 20 }}>
              <button type="button" className="row danger" onClick={remove}>
                Borrar servicio
              </button>
            </div>
            <p className="group-foot" style={{ textAlign: 'center' }}>
              Registrado por {existing?.createdBy ?? '—'}
              {existing?.updatedBy && existing.updatedAt !== existing.createdAt ? ` · editado por ${existing.updatedBy}` : ''}
            </p>
          </>
        )}
      </form>
    </Page>
  );
}
