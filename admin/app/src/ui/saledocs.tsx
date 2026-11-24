/**
 * Documentos de una venta, a un toque desde su detalle:
 *  - Orden de instalacion para el tecnico (WhatsApp o copiar).
 *  - Garantia MAGIC WATER (se revisa, se genera e imprime / guarda en PDF).
 */
import { useEffect, useState } from 'react';
import { ClipboardList, Copy, FileText, MessageCircle, Plus, ShieldCheck, Trash2, Wrench } from 'lucide-react';
import type { InvoiceBrand, InvoiceLine, Sale, WarrantyLine } from '../../../shared/domain.ts';
import { INVOICE_PREFIX, invoiceLabel, invoiceTotals } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { api } from '../lib/api.ts';
import { navigate } from '../lib/router.tsx';
import { centsToInput, dateWithYear, moneyPlain, parseMoney } from '../lib/format.ts';
import { addDays, fitToTotal, installOrderText, invoiceDraft, warrantyDraft, type InvoiceForm } from '../lib/install.ts';
import { isPhoneDevice, setWaMode, useWaMode, waLink, type WaMode as WaModeT } from '../lib/whatsapp.ts';
import { Group, MoneyField, Row, Segmented, TextField } from './kit.tsx';
import { DateField } from './date.tsx';
import { Sheet, useFeedback } from './sheet.tsx';

export function SaleDocs({ sale }: { sale: Sale }) {
  const a = useAccess();
  const [open, setOpen] = useState<'order' | 'warranty' | 'invoice' | null>(null);
  const canWarranty = a.can('sales.edit') || a.can('sales.create');
  const canInvoice = canWarranty && a.can('money.prices');
  return (
    <>
      <div className="doc-actions">
        <button type="button" className="doc-action" onClick={() => setOpen('order')}>
          <span className="doc-icon order">
            <ClipboardList size={20} />
          </span>
          <span>
            <b>Orden para el técnico</b>
            <span>Cliente, dirección, equipo, fecha y hora</span>
          </span>
        </button>
        {canWarranty && (
          <button type="button" className="doc-action" onClick={() => setOpen('warranty')}>
            <span className="doc-icon warranty">
              <ShieldCheck size={20} />
            </span>
            <span>
              <b>Garantía Magic Water</b>
              <span>{sale.warranty ? `Generada · ${dateWithYear(sale.warranty.issueDate)}` : 'Imprimir o guardar en PDF'}</span>
            </span>
          </button>
        )}
        {canInvoice && (
          <button type="button" className="doc-action" onClick={() => setOpen('invoice')}>
            <span className="doc-icon invoice">
              <FileText size={20} />
            </span>
            <span>
              <b>Factura</b>
              <span>{sale.invoice ? `Factura ${invoiceLabel(sale.invoice.number)} · ${dateWithYear(sale.invoice.issueDate)}` : 'Emitir factura en inglés (imprimir o PDF)'}</span>
            </span>
          </button>
        )}
        {a.can('services.create') && (
          <button type="button" className="doc-action" onClick={() => navigate(`/servicio/nuevo?cliente=${sale.clientId}&venta=${sale.id}`)}>
            <span className="doc-icon report">
              <Wrench size={20} />
            </span>
            <span>
              <b>Servicio técnico</b>
              <span>Reportar qué pasa y mandarle el reporte al técnico</span>
            </span>
          </button>
        )}
        {sale.goodleapForm && (
          <button type="button" className="doc-action" onClick={() => navigate(`/imprimir/goodleap/${sale.id}`)}>
            <span className="doc-icon invoice">
              <ShieldCheck size={20} />
            </span>
            <span>
              <b>Formulario GoodLeap</b>
              <span>Firmado · {dateWithYear(sale.goodleapForm.customer.at.slice(0, 10))}</span>
            </span>
          </button>
        )}
      </div>
      <OrderSheet sale={sale} open={open === 'order'} onClose={() => setOpen(null)} />
      {canWarranty && <WarrantySheet sale={sale} open={open === 'warranty'} onClose={() => setOpen(null)} />}
      {canInvoice && <InvoiceSheet sale={sale} open={open === 'invoice'} onClose={() => setOpen(null)} />}
    </>
  );
}

function OrderSheet({ sale, open, onClose }: { sale: Sale; open: boolean; onClose: () => void }) {
  const data = useData();
  const { toast } = useFeedback();
  const text = installOrderText(sale, data);
  const tech = sale.installerId ? data.personById.get(sale.installerId) : undefined;
  const waMode = useWaMode();
  const computer = !isPhoneDevice();
  const missing = [!sale.installDate && 'la fecha', !sale.installTime && 'la hora', !sale.installerId && 'el técnico'].filter(Boolean);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copiado. Pégalo en WhatsApp o en un mensaje.');
    } catch {
      toast('No se pudo copiar: mantén presionado el texto y cópialo.', 'error');
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Orden para el técnico">
      {missing.length > 0 && (
        <div className="banner">
          <div>
            <div className="banner-title">Falta {missing.join(', ')}</div>
            <div className="banner-text">Ponlo en Editar → Fechas e instalación para que la orden salga completa.</div>
          </div>
        </div>
      )}
      <pre className="order-text">{text}</pre>
      <div className="order-buttons">
        {tech?.phone && (
          <a key={waMode} className="btn block whatsapp" {...waLink(tech.phone, text)}>
            <MessageCircle size={18} /> Enviar a {tech.name.split(' ')[0]} por WhatsApp
          </a>
        )}
        <a key={`o-${waMode}`} className={`btn block ${tech?.phone ? 'gray' : 'whatsapp'}`} {...waLink(null, text)}>
          <MessageCircle size={18} /> {tech?.phone ? 'Enviar a otra persona' : 'Enviar por WhatsApp'}
        </a>
        <button type="button" className="btn block gray" onClick={copy}>
          <Copy size={18} /> Copiar texto
        </button>
      </div>
      {computer && (
        <div className="wa-mode">
          <span>En esta computadora, abrir con</span>
          <Segmented<WaModeT>
            options={[
              { value: 'web', label: 'WhatsApp Web' },
              { value: 'app', label: 'App de WhatsApp' },
            ]}
            value={waMode}
            onChange={setWaMode}
          />
          <p>
            {waMode === 'web'
              ? 'Si te pide escanear un código, ábrelo con WhatsApp Business en tu teléfono: Ajustes → Dispositivos vinculados → Vincular un dispositivo. Se hace una sola vez.'
              : 'Abre la app de WhatsApp instalada en la computadora. Si nunca la has usado aquí, elige WhatsApp Web.'}
          </p>
        </div>
      )}
      {tech && !tech.phone && <p className="group-foot">Para mandarla directo, agrega el teléfono de {tech.name} en Ajustes → Equipo.</p>}
    </Sheet>
  );
}

function WarrantySheet({ sale, open, onClose }: { sale: Sale; open: boolean; onClose: () => void }) {
  const data = useData();
  const { reload } = useStore();
  const [form, setForm] = useState(() => warrantyDraft(sale, data));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(warrantyDraft(sale, data));
      setError(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setError(null), [form]);

  const setLine = (i: number, patch: Partial<WarrantyLine>) => setForm((f) => ({ ...f, lines: f.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  const generate = async () => {
    if (!form.representative.trim()) return setError('Escribe el nombre del vendedor (representante).');
    const lines = form.lines.filter((l) => l.item.trim());
    if (!lines.length) return setError('Escribe al menos un equipo.');
    setBusy(true);
    try {
      await api(`/sales/${sale.id}/warranty`, { method: 'POST', body: { ...form, lines } });
      await reload();
      onClose();
      navigate(`/imprimir/garantia/${sale.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Garantía Magic Water"
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      onSubmit={generate}
      submitLabel="Generar e imprimir"
      busy={busy}
      error={error}
    >
      <p className="muted" style={{ textAlign: 'center', margin: '0 4px 14px', fontSize: 14.5 }}>
        Revisa los datos. Los del cliente salen de la venta. Al generar se abre lista para imprimir o guardar en PDF.
      </p>
      <Group>
        <DateField required label="Fecha de la garantía" value={form.issueDate} onChange={(v) => setForm({ ...form, issueDate: v || form.issueDate })} />
        <TextField label="Vendedor" value={form.representative} onChange={(representative) => setForm({ ...form, representative })} placeholder="Nombre de quien vendió" maxLength={80} />
        <TextField label="Lugar / agua" value={form.issuedIn} onChange={(issuedIn) => setForm({ ...form, issuedIn })} placeholder="Cape Coral, Florida / Well water" maxLength={120} />
      </Group>
      <div className="group-label">Equipos y número de serie (en inglés, como en la garantía)</div>
      <div className="group">
        {form.lines.map((line, i) => (
          <div key={i} className="warranty-line">
            <input className="field-input" value={line.item} onChange={(e) => setLine(i, { item: e.target.value })} placeholder="Equipo (ej. Reverse osmosis membrane)" maxLength={120} aria-label={`Equipo ${i + 1}`} />
            <input className="field-input num" value={line.serial} onChange={(e) => setLine(i, { serial: e.target.value })} placeholder="Serial" maxLength={60} aria-label={`Serial ${i + 1}`} />
            {form.lines.length > 1 && (
              <button type="button" className="icon-btn danger-icon" onClick={() => setForm({ ...form, lines: form.lines.filter((_, j) => j !== i) })} aria-label="Quitar equipo">
                <Trash2 size={17} />
              </button>
            )}
          </div>
        ))}
        {form.lines.length < 8 && (
          <button type="button" className="row action" onClick={() => setForm({ ...form, lines: [...form.lines, { item: '', serial: '' }] })}>
            <Plus size={20} />
            <span className="row-label">Agregar equipo</span>
          </button>
        )}
      </div>
      <p className="group-foot">Los seriales se proponen solos (MW-código-fecha-venta) y se pueden cambiar. Quedan guardados: si la vuelves a imprimir, salen iguales.</p>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Factura                                                              */
/* ------------------------------------------------------------------ */

const TERMS = ['Paid in full', 'Due upon receipt', 'Net 15', 'Net 30'];

/** Precio dentro de una linea (acepta "1.500" o "1,500.50" como en todo el panel). */
function PriceInput({ value, onChange, label }: { value: number; onChange: (cents: number) => void; label: string }) {
  const [text, setText] = useState(centsToInput(value));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    const parsed = parseMoney(text);
    if (parsed !== value && !(parsed === undefined && invalid)) setText(centsToInput(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span className="inv-price">
      <span>$</span>
      <input
        className="field-input num"
        inputMode="decimal"
        value={text}
        placeholder="0"
        aria-label={label}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = parseMoney(e.target.value);
          setInvalid(parsed === undefined);
          if (parsed !== undefined) onChange(parsed ?? 0);
        }}
        onBlur={() => !invalid && setText(centsToInput(value))}
      />
    </span>
  );
}

function InvoiceSheet({ sale, open, onClose }: { sale: Sale; open: boolean; onClose: () => void }) {
  const data = useData();
  const { reload } = useStore();
  const [form, setForm] = useState<InvoiceForm>(() => invoiceDraft(sale, data, null));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const draft = invoiceDraft(sale, data, null);
    setForm(draft);
    if (draft.number == null) {
      api<{ number: number }>('/invoices/next')
        .then((r) => setForm((f) => (f.number == null ? { ...f, number: r.number } : f)))
        .catch(() => {});
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setError(null), [form]);

  const t = invoiceTotals(form);
  // El % se escribe como texto para poder poner decimales (6.5).
  const [taxText, setTaxText] = useState('');
  useEffect(() => {
    if (open) setTaxText(form.taxRate ? String(form.taxRate) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.taxAmount == null]);
  const clientState = data.clientById.get(sale.clientId)?.state ?? (sale.installStateCode || '');
  const salePrice = sale.price ?? 0;
  const off = salePrice > 0 && t.net !== salePrice;
  const setLine = (i: number, patch: Partial<InvoiceLine>) => setForm((f) => ({ ...f, lines: f.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  const generate = async () => {
    if (!form.number) return setError('Escribe el número de factura.');
    const lines = form.lines.filter((l) => l.description.trim());
    if (!lines.length) return setError('Agrega al menos una línea.');
    if (lines.some((l) => !(l.quantity > 0))) return setError('Cada línea necesita una cantidad mayor que 0.');
    setBusy(true);
    try {
      await api(`/sales/${sale.id}/invoice`, { method: 'POST', body: { ...form, lines } });
      await reload();
      onClose();
      navigate(`/imprimir/factura/${sale.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={sale.invoice ? `Factura ${invoiceLabel(sale.invoice.number)}` : 'Emitir factura'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      onSubmit={generate}
      submitLabel={sale.invoice ? 'Guardar e imprimir' : 'Emitir e imprimir'}
      busy={busy}
      error={error}
    >
      <p className="muted" style={{ textAlign: 'center', margin: '0 4px 14px', fontSize: 14.5 }}>
        Sale en inglés a nombre de Global Innovation Group, LLC, con los datos del cliente y lo que se vendió. Revisa y emite: se abre lista para imprimir o guardar en PDF.
      </p>

      <Group>
        <label className="row field-row" data-field="number">
          <span className="row-label">Número de factura</span>
          <span className="inv-number-prefix">{INVOICE_PREFIX}</span>
          <input
            style={{ maxWidth: '7ch' }}
            className="field-input num"
            inputMode="numeric"
            value={form.number ?? ''}
            placeholder="…"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
              setForm({ ...form, number: digits ? Number(digits) : null });
            }}
          />
        </label>
        <DateField required label="Fecha" value={form.issueDate} onChange={(v) => setForm({ ...form, issueDate: v || form.issueDate })} />
        <div className="row field-row">
          <span className="row-label">Logo</span>
          <div style={{ width: 230 }}>
            <Segmented<InvoiceBrand>
              options={[
                { value: 'magic', label: 'Magic Water' },
                { value: 'infinity', label: 'Infinity Water' },
              ]}
              value={form.brand}
              onChange={(brand) =>
                setForm({
                  ...form,
                  brand,
                  // El prefijo del codigo va con la marca (MW- / IW-).
                  lines: form.lines.map((l) => ({ ...l, itemNumber: l.itemNumber.replace(/^(MW|IW)-/, brand === 'magic' ? 'MW-' : 'IW-') })),
                })
              }
            />
          </div>
        </div>
      </Group>

      <div className="group-label">Lo que se vendió (en inglés)</div>
      <div className="inv-lines">
        {form.lines.map((line, i) => (
          <div key={i} className="inv-line">
            <div className="inv-line-head">
              <span className="inv-line-no">{i + 1}</span>
              <input className="field-input" value={line.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Descripción (ej. Outdoor filter tank)" maxLength={140} aria-label={`Descripción línea ${i + 1}`} />
              {form.lines.length > 1 && (
                <button type="button" className="icon-btn danger-icon" onClick={() => setForm({ ...form, lines: form.lines.filter((_, j) => j !== i) })} aria-label={`Quitar línea ${i + 1}`}>
                  <Trash2 size={17} />
                </button>
              )}
            </div>
            <div className="inv-line-grid">
              <label>
                <span>Código</span>
                <input className="field-input" value={line.itemNumber} onChange={(e) => setLine(i, { itemNumber: e.target.value })} placeholder="MW-FLT-TANK" maxLength={40} />
              </label>
              <label>
                <span>Cant.</span>
                <input
                  className="field-input num"
                  inputMode="numeric"
                  value={line.quantity || ''}
                  onChange={(e) => setLine(i, { quantity: Math.min(9999, Number(e.target.value.replace(/[^\d]/g, '')) || 0) })}
                  placeholder="1"
                />
              </label>
              <label>
                <span>Precio c/u</span>
                <PriceInput value={line.unitPrice} onChange={(unitPrice) => setLine(i, { unitPrice })} label={`Precio línea ${i + 1}`} />
              </label>
            </div>
            <label className="inv-line-sn">
              <span>SN#</span>
              <input className="field-input" value={line.serial} onChange={(e) => setLine(i, { serial: e.target.value })} placeholder="Serial (opcional)" maxLength={200} />
            </label>
            <div className="inv-line-total">{line.unitPrice === 0 ? 'Incluido (Included)' : moneyPlain(Math.round(line.quantity * line.unitPrice))}</div>
          </div>
        ))}
        {form.lines.length < 12 && (
          <button type="button" className="inv-add" onClick={() => setForm({ ...form, lines: [...form.lines, { description: '', itemNumber: '', quantity: 1, unitPrice: 0, serial: '' }] })}>
            <Plus size={18} /> Agregar línea
          </button>
        )}
      </div>

      <Group footer="Pon los precios normales en las líneas y aquí lo que le rebajaste al cliente. Cuadrar reparte las líneas para que, con el descuento, dé el precio de la venta.">
        <MoneyField label="Descuento" value={form.discount || null} onChange={(v) => setForm({ ...form, discount: v ?? 0 })} field="discount" />
      </Group>

      <div className={`inv-check${off ? ' off' : ''}`}>
        <div>
          <b>
            {t.discount ? `Líneas ${moneyPlain(t.subtotal)} − descuento ${moneyPlain(t.discount)} = ${moneyPlain(t.net)}` : `Suma de las líneas: ${moneyPlain(t.subtotal)}`}
          </b>
          <span>{salePrice > 0 ? (off ? `La venta es de ${moneyPlain(salePrice)}: no cuadra por ${moneyPlain(Math.abs(salePrice - t.net))}.` : 'Cuadra con el precio de la venta ✓') : 'La venta no tiene precio registrado.'}</span>
        </div>
        {off && (
          <button type="button" className="btn small" onClick={() => setForm({ ...form, lines: fitToTotal(form.lines, salePrice + form.discount) })}>
            Cuadrar
          </button>
        )}
      </div>

      <div className="group-label">Pagos y condiciones</div>
      <Group>
        <MoneyField label="Pagado por el cliente" value={form.amountPaid} onChange={(v) => setForm({ ...form, amountPaid: v ?? 0 })} />
        <MoneyField label="Financiado" value={form.financedAmount} onChange={(v) => setForm({ ...form, financedAmount: v ?? 0 })} />
        {form.financedAmount > 0 && <TextField label="Financiera" value={form.financedBy} onChange={(financedBy) => setForm({ ...form, financedBy })} placeholder="Nombre de la financiera" maxLength={80} />}
        <Row title="Saldo pendiente" value={<b>{moneyPlain(t.balance)}</b>} />
      </Group>

      <div className="group-label">Impuesto (tax)</div>
      <Group footer={`Según el estado${clientState ? ` del cliente (${clientState})` : ''}. Escríbelo en % y se calcula solo, o pon el monto en dólares que ya calculaste.`}>
        <div className="row field-row">
          <span className="row-label">Cómo</span>
          <div style={{ width: 200 }}>
            <Segmented<'rate' | 'amount'>
              options={[
                { value: 'rate', label: 'Porcentaje' },
                { value: 'amount', label: 'Monto $' },
              ]}
              value={form.taxAmount != null ? 'amount' : 'rate'}
              onChange={(mode) => setForm(mode === 'amount' ? { ...form, taxAmount: t.tax, taxRate: 0 } : { ...form, taxAmount: null, taxRate: t.rate })}
            />
          </div>
        </div>
        {form.taxAmount != null ? (
          <MoneyField label="Impuesto" value={form.taxAmount || null} onChange={(v) => setForm({ ...form, taxAmount: v ?? 0 })} field="tax" hint={t.net && t.tax ? `${t.rate} % de ${moneyPlain(t.net)}` : undefined} />
        ) : (
          <label className="row field-row" data-field="tax">
            <span className="row-label">Impuesto (%)</span>
            <input
              className="field-input num"
              inputMode="decimal"
              value={taxText}
              placeholder="0"
              onChange={(e) => {
                const text = e.target.value.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
                setTaxText(text);
                const v = Number(text);
                setForm({ ...form, taxRate: Number.isFinite(v) ? Math.min(15, v) : 0 });
              }}
            />
          </label>
        )}
        <Row title="Total con impuesto" value={<b>{moneyPlain(t.total)}</b>} />
      </Group>

      <Group>
        <TextField label="Condiciones" value={form.terms} onChange={(terms) => setForm({ ...form, terms })} placeholder="Paid in full" maxLength={80} />
        <div className="row inv-terms">
          {TERMS.map((term) => (
            <button key={term} type="button" className="chip" aria-pressed={form.terms === term} onClick={() => setForm({ ...form, terms: term, dueDate: term === 'Net 15' ? addDays(form.issueDate, 15) : term === 'Net 30' ? addDays(form.issueDate, 30) : form.issueDate })}>
              {term}
            </button>
          ))}
        </div>
        <DateField required quick="future" label="Vence" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v || form.dueDate })} />
        <TextField label="Customer PO" value={form.customerPo} onChange={(customerPo) => setForm({ ...form, customerPo })} placeholder="opcional" maxLength={40} />
      </Group>
      {/paid in full/i.test(form.terms) && t.balance > 0 && (
        <p className="group-foot" style={{ color: 'var(--orange, #c25e00)' }}>
          Dice «Paid in full» pero quedan {moneyPlain(t.balance)} por cobrar: cambia las condiciones o lo pagado.
        </p>
      )}
      <p className="group-foot">El número no se repite entre ventas. Queda guardada: si la vuelves a abrir, sale igual.</p>
    </Sheet>
  );
}
