/**
 * Documentos de una venta, a un toque desde su detalle:
 *  - Orden de instalacion para el tecnico (WhatsApp o copiar).
 *  - Garantia MAGIC WATER (se revisa, se genera e imprime / guarda en PDF).
 */
import { useEffect, useState } from 'react';
import { ClipboardList, Copy, MessageCircle, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { Sale, WarrantyLine } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { api } from '../lib/api.ts';
import { navigate } from '../lib/router.tsx';
import { dateWithYear } from '../lib/format.ts';
import { installOrderText, warrantyDraft, whatsappWithText } from '../lib/install.ts';
import { Group, TextField } from './kit.tsx';
import { DateField } from './date.tsx';
import { Sheet, useFeedback } from './sheet.tsx';

export function SaleDocs({ sale }: { sale: Sale }) {
  const a = useAccess();
  const [open, setOpen] = useState<'order' | 'warranty' | null>(null);
  const canWarranty = a.can('sales.edit') || a.can('sales.create');
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
      </div>
      <OrderSheet sale={sale} open={open === 'order'} onClose={() => setOpen(null)} />
      {canWarranty && <WarrantySheet sale={sale} open={open === 'warranty'} onClose={() => setOpen(null)} />}
    </>
  );
}

function OrderSheet({ sale, open, onClose }: { sale: Sale; open: boolean; onClose: () => void }) {
  const data = useData();
  const { toast } = useFeedback();
  const text = installOrderText(sale, data);
  const tech = sale.installerId ? data.personById.get(sale.installerId) : undefined;
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
          <a className="btn block whatsapp" href={whatsappWithText(text, tech.phone)} target="_blank" rel="noopener">
            <MessageCircle size={18} /> Enviar a {tech.name.split(' ')[0]} por WhatsApp
          </a>
        )}
        <a className={`btn block ${tech?.phone ? 'gray' : 'whatsapp'}`} href={whatsappWithText(text)} target="_blank" rel="noopener">
          <MessageCircle size={18} /> {tech?.phone ? 'Enviar a otra persona' : 'Enviar por WhatsApp'}
        </a>
        <button type="button" className="btn block gray" onClick={copy}>
          <Copy size={18} /> Copiar texto
        </button>
      </div>
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
