/**
 * Venta: crear, editar y "cliente anterior" (ponerse al dia).
 *
 * El orden sigue como el dueno cuenta una venta: a quien, que se instalo,
 * cuando y donde, en cuanto y con que financiera, quien vendio y su
 * comision, y los proveedores. Solo el cliente y la fecha son obligatorios;
 * lo demas se puede completar despues.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ChevronDown, ChevronRight, Info, Plus, X } from 'lucide-react';
import type { Equipment, PaymentMethod, Sale, SaleStatus, WaterSource } from '../../../shared/domain.ts';
import { EMPTY_EQUIPMENT, SALE_STATUS_LABEL, equipmentSummary, hasEquipment, saleMissing, saleMoney } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { goBack, navigate, useLeaveGuard } from '../lib/router.tsx';
import { focusField, focusInvalid } from '../lib/focus.ts';
import { api } from '../lib/api.ts';
import { moneyPlain as money, parseMoney, percent } from '../lib/format.ts';
import { Empty, Group, MoneyField, hasInvalidMoney, Page, Row, SegmentedRow, StackField, SwitchRow, TextField } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { BrandPicker, ClientPicker, FinancierPicker, PersonPicker, StateZipRow, clientRef, useCatalogCreate, type ClientChoice } from '../ui/pickers.tsx';
import { AddressField, CityField, lookupZip } from '../ui/address.tsx';
import { Picker, useFeedback } from '../ui/sheet.tsx';

interface SupplierLine {
  key: number;
  supplierId: number | null;
  cost: number | null;
}

interface FormState {
  client: ClientChoice;
  brandId: number | null;
  status: SaleStatus;
  installerPaid: boolean;
  installerPaidDate: string;
  saleDate: string;
  installDate: string;
  installerId: number | null;
  sameAddress: boolean;
  installAddress: string;
  installCity: string;
  installStateCode: string;
  installZip: string;
  waterSource: WaterSource | null;
  equipment: Equipment;
  price: number | null;
  paymentMethod: PaymentMethod | null;
  financierId: number | null;
  cashDownOn: boolean;
  cashDown: number | null;
  fundedAmount: number | null;
  fundedPaid: boolean;
  fundedDate: string;
  sellerId: number | null;
  commission: number | null;
  commissionPaid: boolean;
  commissionPaidDate: string;
  installerPay: number | null;
  suppliers: SupplierLine[];
  nextServiceDate: string;
  notes: string;
  isLegacy: boolean;
}

let lineKey = 0;

interface AddressParts {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

const sameText = (a: string | null | undefined, b: string | null | undefined) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();

function fromSale(sale: Sale, client: AddressParts | undefined): FormState {
  const noCopy = !sale.installAddress && !sale.installCity && !sale.installZip;
  const matchesClient =
    client != null &&
    sameText(sale.installAddress, client.address) &&
    sameText(sale.installCity, client.city) &&
    sameText(sale.installStateCode, client.state) &&
    sameText(sale.installZip, client.zip);
  return {
    client: { mode: 'existing', id: sale.clientId },
    brandId: sale.brandId,
    status: sale.status,
    installerPaid: sale.installerPaid,
    installerPaidDate: sale.installerPaidDate ?? '',
    saleDate: sale.saleDate,
    installDate: sale.installDate ?? '',
    installerId: sale.installerId,
    sameAddress: noCopy || matchesClient,
    installAddress: sale.installAddress ?? '',
    installCity: sale.installCity ?? '',
    installStateCode: sale.installStateCode ?? '',
    installZip: sale.installZip ?? '',
    waterSource: sale.waterSource,
    equipment: sale.equipment,
    price: sale.price,
    paymentMethod: sale.paymentMethod,
    financierId: sale.financierId,
    cashDownOn: (sale.cashDown ?? 0) > 0,
    cashDown: sale.cashDown,
    fundedAmount: sale.fundedAmount,
    fundedPaid: sale.fundedPaid,
    fundedDate: sale.fundedDate ?? '',
    sellerId: sale.sellerId,
    commission: sale.commission,
    commissionPaid: sale.commissionPaid,
    commissionPaidDate: sale.commissionPaidDate ?? '',
    installerPay: sale.installerPay,
    suppliers: sale.suppliers.map((s) => ({ key: ++lineKey, supplierId: s.supplierId, cost: s.cost })),
    nextServiceDate: sale.nextServiceDate ?? '',
    notes: sale.notes ?? '',
    isLegacy: sale.isLegacy,
  };
}

function blank(today: string, clientId: number | null, legacy: boolean, brandId: number | null = null): FormState {
  return {
    client: clientId ? { mode: 'existing', id: clientId } : null,
    brandId,
    status: 'active',
    installerPaid: legacy,
    installerPaidDate: '',
    saleDate: legacy ? '' : today,
    installDate: '',
    installerId: null,
    sameAddress: true,
    installAddress: '',
    installCity: '',
    installStateCode: 'FL',
    installZip: '',
    waterSource: null,
    equipment: { ...EMPTY_EQUIPMENT },
    price: null,
    paymentMethod: null,
    financierId: null,
    cashDownOn: false,
    cashDown: null,
    fundedAmount: null,
    // En una venta anterior lo normal es que la financiera ya pago y la
    // comision ya se pago: asi no infla "Por cobrar" ni "Comisiones".
    fundedPaid: legacy,
    fundedDate: '',
    sellerId: null,
    commission: null,
    commissionPaid: legacy,
    commissionPaidDate: '',
    installerPay: null,
    suppliers: [],
    nextServiceDate: '',
    notes: '',
    isLegacy: legacy,
  };
}

/**
 * Estado del formulario -> cuerpo de la API (sin el cliente). Si se instalo
 * en la direccion del cliente se guarda una COPIA: si el cliente se muda
 * despues, la venta sigue diciendo donde se instalo de verdad.
 */
function toSaleBody(f: FormState, client: AddressParts | undefined) {
  const financed = f.paymentMethod === 'financed';
  const clean = (v: string | null | undefined) => v?.trim() || null;
  const place: AddressParts = f.sameAddress
    ? { address: clean(client?.address), city: clean(client?.city), state: clean(client?.state)?.toUpperCase() ?? null, zip: clean(client?.zip) }
    : { address: clean(f.installAddress), city: clean(f.installCity), state: clean(f.installStateCode)?.toUpperCase() ?? null, zip: clean(f.installZip) };
  return {
    brandId: f.brandId,
    status: f.status,
    installerPaid: f.installerPaid,
    installerPaidDate: f.installerPaid ? f.installerPaidDate || null : null,
    saleDate: f.saleDate,
    installDate: f.installDate || null,
    installerId: f.installerId,
    installAddress: place.address,
    installCity: place.city,
    installStateCode: place.state,
    installZip: place.zip,
    waterSource: f.waterSource,
    equipment: {
      ...f.equipment,
      roType: f.equipment.ro ? f.equipment.roType : null,
      roUv: f.equipment.ro && f.equipment.roUv,
      other: f.equipment.other?.trim() || null,
    },
    price: f.price,
    paymentMethod: f.paymentMethod,
    financierId: financed ? f.financierId : null,
    cashDown: financed ? (f.cashDownOn ? f.cashDown : 0) : f.paymentMethod === 'cash' ? f.cashDown : null,
    fundedAmount: financed ? f.fundedAmount : null,
    fundedPaid: financed && f.fundedPaid,
    fundedDate: financed && f.fundedPaid ? f.fundedDate || null : null,
    sellerId: f.sellerId,
    commission: f.commission,
    commissionPaid: f.commissionPaid,
    commissionPaidDate: f.commissionPaid ? f.commissionPaidDate || null : null,
    installerPay: f.installerPay,
    nextServiceDate: f.nextServiceDate || null,
    notes: f.notes.trim() || null,
    isLegacy: f.isLegacy,
    suppliers: f.suppliers.filter((s) => s.supplierId).map((s) => ({ supplierId: s.supplierId!, cost: s.cost })),
  };
}

export function SaleForm({ id, clientId = null, legacy = false }: { id?: number; clientId?: number | null; legacy?: boolean }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const existing = id ? data.sales.find((s) => s.id === id) : undefined;

  const [form, setForm] = useState<FormState>(() =>
    existing ? fromSale(existing, data.clientById.get(existing.clientId)) : blank(data.today, clientId, legacy, defaultBrand(data.brands))
  );
  const initial = useRef(JSON.stringify(form));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Tras el primer guardado, los siguientes actualizan (nunca duplican).
  const savedId = useRef<number | null>(id ?? null);
  // Cliente creado en el primer guardado: los siguientes lo reutilizan (no lo duplican).
  const savedClientId = useRef<number | null>(null);
  const version = useRef<string | undefined>(existing?.updatedAt);
  const leaving = useRef(false);
  // Venta nueva: solo lo esencial a la vista. Al editar se ve todo.
  const [more, setMore] = useState(Boolean(id));
  const [legacyCount, setLegacyCount] = useState(() => readLegacyCount(data.today));

  useLeaveGuard(
    () => !leaving.current && JSON.stringify(form) !== initial.current,
    () => confirm({ title: '¿Salir sin guardar?', message: 'Los datos que escribiste se perderán.', confirm: 'Salir sin guardar', cancel: 'Seguir editando', danger: true })
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  useEffect(() => setError(null), [form]);
  const setEq = <K extends keyof Equipment>(key: K, value: Equipment[K]) => setForm((f) => ({ ...f, equipment: { ...f.equipment, [key]: value } }));

  const clientAddress: AddressParts | undefined =
    form.client?.mode === 'existing'
      ? data.clientById.get(form.client.id)
      : form.client?.mode === 'new'
        ? { address: form.client.draft.address, city: form.client.draft.city, state: form.client.draft.state, zip: form.client.draft.zip }
        : undefined;
  const body = useMemo(() => toSaleBody(form, clientAddress), [form, clientAddress]);
  const m = saleMoney(body);
  const missing = saleMissing({ ...(body as any), suppliers: body.suppliers, equipment: body.equipment });

  if (id && !existing) {
    return (
      <Page title="Venta" back={{ label: 'Ventas', to: '/ventas' }}>
        <Empty title="Esta venta no existe" />
      </Page>
    );
  }

  const back = id ? { label: 'Venta', to: `/ventas/${id}` } : clientId ? { label: 'Cliente', to: `/clientes/${clientId}` } : { label: 'Inicio', to: '/' };

  // El aviso de cambios sin guardar lo hace useLeaveGuard.
  const cancel = () => goBack(back.to);

  /** Muestra el error y lleva al campo; si esta dentro de "Mas detalles", lo abre. */
  const fail = (message: string, field?: string) => {
    setError(message);
    if (!field) return;
    if (focusField(formRef.current, field)) return;
    setMore(true);
    requestAnimationFrame(() => requestAnimationFrame(() => focusField(formRef.current, field)));
  };

  const submit = async (event?: FormEvent, again = false) => {
    event?.preventDefault();
    setError(null);
    if (!form.client) return fail('Elige el cliente o créalo.', 'client');
    if (form.client.mode === 'new' && !form.client.draft.name.trim()) return fail('Escribe el nombre del cliente nuevo.', 'client.create.name');
    if (!form.saleDate) return fail(form.isLegacy ? 'Pon la fecha de la venta (aproximada está bien).' : 'Pon la fecha de la venta.', 'saleDate');
    if (form.installDate && form.installDate < form.saleDate) return fail('La instalación no puede ser antes de la venta.', 'installDate');
    if (form.equipment.ro && !form.equipment.roType) return fail('Elige el equipo de ósmosis: de 5 pasos o en caja.', 'equipment.roType');
    if (body.commission != null && body.price != null && body.commission > body.price) return fail('La comisión no puede ser mayor que el valor de la venta.', 'commission');
    if (body.fundedAmount != null && body.price != null && body.fundedAmount > body.price) return fail('Lo que pagó la financiera no puede ser mayor que el valor de la venta.', 'fundedAmount');
    if (hasInvalidMoney(formRef.current)) {
      setError('Hay un monto mal escrito (en rojo). Corrígelo para guardar.');
      return void focusInvalid(formRef.current);
    }
    if (body.cashDown != null && body.price != null && body.cashDown > body.price) {
      return fail(form.paymentMethod === 'cash' ? 'Lo cobrado no puede ser mayor que el valor de la venta.' : 'El abono no puede ser mayor que el valor de la venta.', 'cashDown');
    }
    if (form.saleDate > data.today) {
      const ok = await confirm({ title: '¿La venta es de una fecha futura?', message: `Pusiste ${form.saleDate.split('-').reverse().join('/')}. Si fue un error, corrígela.`, confirm: 'Sí, es correcta', cancel: 'Corregir' });
      if (!ok) return;
    }
    if ((body.price ?? 0) > 5_000_000) {
      const ok = await confirm({ title: `¿La venta es de ${money(body.price)}?`, message: 'Es un monto muy alto. Revisa que no sobre un cero.', confirm: 'Sí, es correcto' });
      if (!ok) return;
    }

    setBusy(true);
    let sale: Sale;
    try {
      const saveId = savedId.current;
      ({ sale } = await api<{ sale: Sale }>(saveId ? `/sales/${saveId}` : '/sales', {
        method: saveId ? 'PUT' : 'POST',
        body: { client: savedClientId.current ? { id: savedClientId.current } : clientRef(form.client), ...body, ...(saveId ? { expectedUpdatedAt: version.current } : {}) },
      }));
    } catch (err: any) {
      setBusy(false);
      fail(err.message, err.field);
      return;
    }
    // Ya esta guardada: si se vuelve a tocar Guardar, se actualiza la misma venta.
    savedId.current = sale.id;
    version.current = sale.updatedAt;
    if (form.client.mode === 'new') savedClientId.current = sale.clientId;
    try {
      await reload();
    } catch {
      setBusy(false);
      setError('La venta se guardó, pero no se pudo actualizar la pantalla. Revisa tu conexión y toca Guardar otra vez.');
      return;
    }
    if (form.isLegacy && !id) setLegacyCount(bumpLegacyCount(data.today));
    if (again) {
      // "Guardar y otro": formulario limpio para el siguiente cliente anterior,
      // conservando el mes y el ano (suelen cargarse varios del mismo periodo).
      const fresh = { ...blank(data.today, null, true, form.brandId), saleDate: form.saleDate };
      setForm(fresh);
      initial.current = JSON.stringify(fresh);
      savedId.current = null;
      savedClientId.current = null;
      version.current = undefined;
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast(`Guardado · llevas ${readLegacyCount(data.today)} hoy`);
      return;
    }
    leaving.current = true;
    const left = saleMissing(sale).length;
    toast(left ? `Venta guardada · faltan ${left} ${left === 1 ? 'dato' : 'datos'}` : 'Venta guardada');
    navigate(`/ventas/${sale.id}`, { replace: true, force: true });
  };

  const financed = form.paymentMethod === 'financed';

  return (
    <Page
      title={id ? 'Editar venta' : form.isLegacy ? 'Cliente anterior' : 'Venta nueva'}
      subtitle={
        form.isLegacy && !id
          ? legacyCount
            ? `Llevas ${legacyCount} hoy. Registra lo que sepas; lo demás lo completas después.`
            : 'Registra lo que sepas. Lo que falte lo completas después.'
          : undefined
      }
      back={back}
    >
      <form onSubmit={submit} noValidate ref={formRef}>
        <div className="form-layout">
          <div>
            {form.isLegacy && !id && (
              <div className="banner blue">
                <Info size={20} />
                <div>
                  <div className="banner-title">Ponerse al día</div>
                  <div className="banner-text">
                    Solo el cliente y la fecha son obligatorios. El inicio te muestra qué ventas tienen datos por completar.
                  </div>
                </div>
              </div>
            )}

            <ClientPicker value={form.client} onChange={(client) => set('client', client)} />

            {form.isLegacy && (
              <Group field="saleDate" label="Cuándo fue la venta" footer="Aproximada está bien: el mes y el año bastan.">
                <MonthYearField value={form.saleDate} onChange={(v) => set('saleDate', v)} today={data.today} />
              </Group>
            )}

            {/* ---------------------------- equipo ---------------------------- */}
            <Group label="Lo que instalaste" footer={hasEquipment(form.equipment) ? equipmentSummary(form.equipment) : 'Elige lo que se instaló.'}>
              <BrandPicker value={form.brandId} onChange={(v) => set('brandId', v)} />
              <SegmentedRow
                field="waterSource"
                title="Agua"
                options={[
                  { value: 'city', label: 'Ciudad' },
                  { value: 'well', label: 'Pozo' },
                ]}
                value={form.waterSource}
                onChange={(v) => set('waterSource', v)}
              />
              <SegmentedRow
                field="equipment.outdoorTanks"
                title="Filtros fuera de casa"
                options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: n === 0 ? 'No' : String(n) }))}
                value={form.equipment.outdoorTanks}
                onChange={(n) => setEq('outdoorTanks', n)}
              />
              <SwitchRow label="Aireador" checked={form.equipment.aerator} onChange={(v) => setEq('aerator', v)} />
              <SegmentedRow
                field="equipment.wholeHouseRo"
                title="Ósmosis inversa de toda la casa"
                subtitle="membranas"
                options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: n === 0 ? 'No' : String(n) }))}
                value={form.equipment.wholeHouseRo ?? 0}
                onChange={(n) => setEq('wholeHouseRo', n)}
              />
              <SwitchRow label="Ósmosis inversa en la cocina" checked={form.equipment.ro} onChange={(v) => setEq('ro', v)} />
              {form.equipment.ro && (
                <>
                  <SegmentedRow
                    field="equipment.roType"
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
              <TextField field="equipment.other" label="Otro" value={form.equipment.other ?? ''} onChange={(v) => setEq('other', v)} placeholder="Opcional" maxLength={300} />
            </Group>

            {/* ---------------------------- dinero ---------------------------- */}
            <Group label="Venta y cobro">
              <MoneyField
                field="price"
                label="Valor de la venta"
                value={form.price}
                onChange={(price) =>
                  setForm((f) => ({
                    ...f,
                    price,
                    // En cash, lo cobrado sigue al precio hasta que se cambie a mano.
                    cashDown: f.paymentMethod === 'cash' && (f.cashDown == null || f.cashDown === f.price) ? price : f.cashDown,
                  }))
                }
              />
              <SegmentedRow
                field="paymentMethod"
                title="Forma de pago"
                options={[
                  { value: 'financed', label: 'Financiado' },
                  { value: 'cash', label: 'Cash' },
                ]}
                value={form.paymentMethod}
                onChange={(method) =>
                  setForm((f) => ({
                    ...f,
                    paymentMethod: method,
                    // En cash se asume cobrado completo; se puede corregir.
                    cashDown: method === 'cash' && f.cashDown == null ? f.price : f.cashDown,
                  }))
                }
              />
              {financed && (
                <>
                  <FinancierPicker value={form.financierId} onChange={(v) => set('financierId', v)} />
                  <SwitchRow label="El cliente abonó cash" checked={form.cashDownOn} onChange={(v) => set('cashDownOn', v)} />
                  {form.cashDownOn && <MoneyField field="cashDown" label="Abono en cash" value={form.cashDown} onChange={(v) => set('cashDown', v)} />}
                  <Row title="Se financió" value={form.price == null ? '—' : money(m.financedAmount)} />
                  <MoneyField
                    field="fundedAmount"
                    label="Lo que pagó la financiera"
                    value={form.fundedAmount}
                    onChange={(v) => set('fundedAmount', v)}
                    hint={
                      m.financierFee != null && m.financedAmount > 0
                        ? `La financiera se quedó ${money(m.financierFee)} (${percent(m.financierFee, m.financedAmount)}%).`
                        : undefined
                    }
                  />
                  <SwitchRow
                    label="La financiera ya pagó"
                    checked={form.fundedPaid}
                    onChange={(v) => setForm((f) => ({ ...f, fundedPaid: v, fundedDate: v && !f.fundedDate ? data.today : f.fundedDate }))}
                  />
                  {form.fundedPaid && <DateField field="fundedDate" label="Fecha del pago" value={form.fundedDate} onChange={(v) => set('fundedDate', v)} />}
                </>
              )}
              {form.paymentMethod === 'cash' && (
                <>
                  <MoneyField field="cashDown" label="Cobrado al cliente" value={form.cashDown} onChange={(v) => set('cashDown', v)} />
                  {m.pendingClient > 0 && <Row title="Saldo pendiente" value={<span className="orange">{money(m.pendingClient)}</span>} />}
                </>
              )}
            </Group>

            {/* ------------------------ vendedor y comision ------------------------ */}
            <Group label="Quién vendió">
              <PersonPicker field="sellerId" role="seller" label="Vendedor" value={form.sellerId} onChange={(v) => set('sellerId', v)} />
              <MoneyField
                field="commission"
                label="Comisión"
                value={form.commission}
                onChange={(v) => set('commission', v)}
                hint={form.commission != null && form.price ? `${percent(form.commission, form.price)}% del valor de la venta` : undefined}
              />
              <SwitchRow
                label="Comisión pagada"
                checked={form.commissionPaid}
                onChange={(v) => setForm((f) => ({ ...f, commissionPaid: v, commissionPaidDate: v && !f.commissionPaidDate ? data.today : f.commissionPaidDate }))}
              />
              {form.commissionPaid && <DateField field="commissionPaidDate" label="Fecha de pago" value={form.commissionPaidDate} onChange={(v) => set('commissionPaidDate', v)} />}
            </Group>

            {/* ---------------------------- mas detalles ---------------------------- */}
            {!more && (
              <button type="button" className="more-toggle" onClick={() => setMore(true)}>
                <span>
                  <b>Más detalles</b>
                  <span className="muted">Fecha de instalación, técnico, dirección, proveedores y mantenimiento</span>
                </span>
                <ChevronDown size={20} />
              </button>
            )}
            {more && (
              <>
            {/* -------------------------- instalacion -------------------------- */}
            <Group label="Fechas e instalación" footer="Deja la instalación vacía si todavía no se instala: aparecerá en “Por instalar”.">
              {!form.isLegacy && <DateField field="saleDate" label="Fecha de venta" value={form.saleDate} onChange={(v) => set('saleDate', v)} />}
              <DateField field="installDate" label="Fecha de instalación" value={form.installDate} onChange={(v) => set('installDate', v)} min={form.saleDate || undefined} quick="future" />
              <PersonPicker field="installerId" role="installer" label="Técnico que instaló" value={form.installerId} onChange={(v) => set('installerId', v)} />
              <SwitchRow label="En la dirección del cliente" checked={form.sameAddress} onChange={(v) => set('sameAddress', v)} />
              {!form.sameAddress && (
                <>
                  <AddressField
                    field="installAddress"
                    value={form.installAddress}
                    onChange={(v) => set('installAddress', v)}
                    onPick={(place) =>
                      setForm((f) => ({
                        ...f,
                        installAddress: place.address,
                        installCity: place.city || f.installCity,
                        installStateCode: place.state || f.installStateCode,
                        installZip: place.zip || f.installZip,
                      }))
                    }
                  />
                  <CityField
                    field="installCity"
                    value={form.installCity}
                    onChange={(v) => set('installCity', v)}
                    onPick={(c) => setForm((f) => ({ ...f, installCity: c.city, installStateCode: c.state, installZip: f.installZip || c.zip || '' }))}
                  />
                  <StateZipRow
                    field="installZip"
                    state={form.installStateCode}
                    zip={form.installZip}
                    onState={(v) => set('installStateCode', v)}
                    onZip={(zip) => {
                      set('installZip', zip);
                      if (/^\d{5}$/.test(zip) && !form.installCity.trim()) {
                        lookupZip(zip).then((found) => found && setForm((f) => (f.installCity.trim() ? f : { ...f, installCity: found.city, installStateCode: found.state })));
                      }
                    }}
                  />
                </>
              )}
            </Group>

            {/* ---------------------------- proveedores ---------------------------- */}
            <Group field="suppliers" label="Proveedores y costos" footer="Lo que pagaste por equipos y materiales de esta venta. Con eso se calcula la ganancia real.">
              {form.suppliers.map((line) => (
                <SupplierLineRow
                  key={line.key}
                  line={line}
                  taken={form.suppliers.filter((s) => s.key !== line.key).map((s) => s.supplierId)}
                  onChange={(next) => set('suppliers', form.suppliers.map((s) => (s.key === line.key ? next : s)))}
                  onRemove={() => set('suppliers', form.suppliers.filter((s) => s.key !== line.key))}
                />
              ))}
              <button
                type="button"
                className="row action"
                onClick={() => set('suppliers', [...form.suppliers, { key: ++lineKey, supplierId: null, cost: null }])}
              >
                <Plus size={20} />
                <span className="row-label">Agregar proveedor</span>
              </button>
              <MoneyField field="installerPay" label="Pago al técnico" value={form.installerPay} onChange={(v) => set('installerPay', v)} placeholder="Opcional" />
              {(form.installerPay ?? 0) > 0 && (
                <SwitchRow
                  label="Ya se le pagó al técnico"
                  checked={form.installerPaid}
                  onChange={(v) => setForm((f) => ({ ...f, installerPaid: v, installerPaidDate: v && !f.installerPaidDate ? data.today : f.installerPaidDate }))}
                />
              )}
            </Group>

            {/* ---------------------------- seguimiento ---------------------------- */}
            <Group label="Seguimiento">
              {id && (
                <SegmentedRow
                  field="status"
                  title="Estado de la venta"
                  options={(Object.keys(SALE_STATUS_LABEL) as SaleStatus[]).map((k) => ({ value: k, label: SALE_STATUS_LABEL[k] }))}
                  value={form.status}
                  onChange={(v) => set('status', v)}
                />
              )}
              <DateField field="nextServiceDate" label="Próximo mantenimiento" value={form.nextServiceDate} onChange={(v) => set('nextServiceDate', v)} quick="maintenance" />
              <StackField field="notes" label="Notas" value={form.notes} onChange={(v) => set('notes', v)} placeholder="Algo que convenga recordar de esta venta" multiline />
            </Group>
              </>
            )}

          </div>

          {/* ------------------------------ resumen ------------------------------ */}
          <aside className="form-aside">
            <div className="summary-card">
              <div className="label">Ganancia{m.estimate ? ' estimada' : ''}</div>
              <div className="profit" style={{ color: m.profit < 0 ? 'var(--red)' : undefined }}>
                {form.price == null ? '—' : money(m.profit)}
              </div>
              <div className="money-lines">
                <Line label="Valor de la venta" value={form.price} />
                {financed && m.financierFee != null && m.financierFee !== 0 && <Line label="Descuento financiera" value={-m.financierFee} />}
                {m.supplierCost > 0 && <Line label="Proveedores" value={-m.supplierCost} />}
                {m.commission > 0 && <Line label="Comisión" value={-m.commission} />}
                {m.installerPay > 0 && <Line label="Pago al técnico" value={-m.installerPay} />}
                <div className="money-line total">
                  <span>Te queda</span>
                  <span className="v">{form.price == null ? '—' : money(m.profit)}</span>
                </div>
              </div>
              {missing.length > 0 && (
                <p className="muted" style={{ fontSize: 13.5, marginTop: 14 }}>
                  Falta: {missing.join(', ').toLowerCase()}.
                </p>
              )}
            </div>
          </aside>
        </div>

        <div className="form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          {form.price != null && (
            <p className="form-total">
              Te queda <b>{m.estimate ? '≈ ' : ''}{money(m.profit)}</b>
              {m.noCosts && <span className="muted"> · faltan costos</span>}
            </p>
          )}
          {form.isLegacy && !id ? (
            <button type="button" className="btn gray" onClick={() => submit(undefined, true)} disabled={busy}>
              Guardar y otro
            </button>
          ) : (
            <button type="button" className="btn gray" onClick={cancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Guardando…' : id ? 'Guardar cambios' : form.isLegacy ? 'Guardar' : 'Guardar venta'}
          </button>
        </div>
      </form>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Cliente anterior: fecha por mes y ano, y cuantos van hoy              */
/* ------------------------------------------------------------------ */

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function MonthYearField({ value, onChange, today }: { value: string; onChange: (iso: string) => void; today: string }) {
  const [exact, setExact] = useState(false);
  const year = value.slice(0, 4);
  const month = value.slice(5, 7);
  const thisYear = Number(today.slice(0, 4));
  const years = Array.from({ length: 16 }, (_, i) => String(thisYear - i));
  const update = (y: string, m: string) => onChange(y && m ? `${y}-${m}-01` : '');
  if (exact) {
    return (
      <>
        <DateField label="Fecha exacta" value={value} onChange={onChange} max={today} />
        <button type="button" className="row action" onClick={() => setExact(false)}>
          <span className="row-label">Elegir solo mes y año</span>
        </button>
      </>
    );
  }
  return (
    <>
      <label className="row field-row">
        <span className="row-label">Mes</span>
        <select className="field-input select" value={month} onChange={(e) => update(year || String(thisYear), e.target.value)}>
          <option value="">Elegir</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, '0')}>
              {name[0].toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="row field-row">
        <span className="row-label">Año</span>
        <select className="field-input select" value={year} onChange={(e) => update(e.target.value, month || '01')}>
          <option value="">Elegir</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="row action" onClick={() => setExact(true)}>
        <span className="row-label">Sé el día exacto</span>
      </button>
    </>
  );
}

const legacyKey = (today: string) => `iw-legacy-${today}`;
function readLegacyCount(today: string) {
  try {
    return Number(sessionStorage.getItem(legacyKey(today)) ?? 0);
  } catch {
    return 0;
  }
}
function bumpLegacyCount(today: string) {
  const next = readLegacyCount(today) + 1;
  try {
    sessionStorage.setItem(legacyKey(today), String(next));
  } catch {
    /* almacenamiento bloqueado */
  }
  return next;
}

/** Marca por defecto de una venta nueva: Infinity Water si existe; si no, la primera activa. */
function defaultBrand(brands: { id: number; name: string; active: boolean }[]) {
  return (brands.find((b) => b.active && /infinity/i.test(b.name)) ?? brands.find((b) => b.active))?.id ?? null;
}

function Line({ label, value }: { label: string; value: number | null }) {
  return (
    <div className={`money-line${value != null && value < 0 ? ' minus' : ''}`}>
      <span>{label}</span>
      <span className="v">{value == null ? '—' : value < 0 ? `− ${money(-value)}` : money(value)}</span>
    </div>
  );
}

function SupplierLineRow({
  line,
  taken,
  onChange,
  onRemove,
}: {
  line: SupplierLine;
  taken: (number | null)[];
  onChange: (line: SupplierLine) => void;
  onRemove: () => void;
}) {
  const data = useData();
  const [open, setOpen] = useState(line.supplierId == null);
  const create = useCatalogCreate('suppliers');
  const name = line.supplierId ? data.supplierById.get(line.supplierId)?.name : null;
  return (
    <>
      <div className="row" style={{ gap: 10 }}>
        <button type="button" className="remove-btn" onClick={onRemove} aria-label="Quitar proveedor">
          <X size={14} strokeWidth={3} />
        </button>
        <button type="button" className="row-label" style={{ textAlign: 'left', color: name ? 'var(--text)' : 'var(--accent)' }} onClick={() => setOpen(true)}>
          {name ?? 'Elegir proveedor'}
          <ChevronRight size={15} style={{ verticalAlign: -2, marginLeft: 2, color: 'var(--text-3)' }} />
        </button>
        <span className="money-wrap" style={{ flex: '0 0 130px' }}>
          <span className="prefix">$</span>
          <CostInput value={line.cost} onChange={(cost) => onChange({ ...line, cost })} />
        </span>
      </div>
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title="Proveedor"
        options={data.suppliers.filter((s) => !taken.includes(s.id)).map((s) => ({ id: s.id, label: s.name, inactive: !s.active }))}
        value={line.supplierId}
        onSelect={(supplierId) => onChange({ ...line, supplierId })}
        onCreate={create}
        createLabel="Agregar proveedor"
      />
    </>
  );
}

/** Costo en linea (sin etiqueta) para la fila de proveedor. */
function CostInput({ value, onChange }: { value: number | null; onChange: (cents: number | null) => void }) {
  const [text, setText] = useState(value == null ? '' : value % 100 ? (value / 100).toFixed(2) : String(value / 100));
  return (
    <input
      className="field-input num"
      inputMode="decimal"
      placeholder="Costo"
      aria-label="Costo del proveedor"
      value={text}
      aria-invalid={parseMoney(text) === undefined || undefined}
      onChange={(e) => {
        setText(e.target.value);
        const parsed = parseMoney(e.target.value);
        if (parsed !== undefined) onChange(parsed);
      }}
    />
  );
}
