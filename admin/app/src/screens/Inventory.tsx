/**
 * Inventario: productos (membranas, cartuchos, tanques...) y sus movimientos.
 * La existencia se calcula de las entradas, salidas y conteos; el sistema
 * avisa cuando algo llega al minimo.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardCheck, Minus, PackagePlus, Plus, Trash2 } from 'lucide-react';
import type { InventoryCategory, InventoryItem, InventoryMovement, MovementKind } from '../../../shared/domain.ts';
import { INVENTORY_CATEGORY_LABEL, equipmentSummary, normalize } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { Link, navigate } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { stockLevels, type ItemStock } from '../lib/books.ts';
import { date, dateWithYear, money, moneyFit, plural } from '../lib/format.ts';
import { Badge, Chips, Empty, Group, IconBox, MoneyField, Page, Row, Section, SearchBox, Stat, StackField, SwitchRow, TextField } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { PickerRow } from '../ui/pickers.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';

const CATEGORY_COLOR: Record<InventoryCategory, string> = {
  tank: '#0a72c2',
  membrane: '#16a3c4',
  filter: '#1d9a46',
  media: '#8a6d3b',
  aerator: '#5856d6',
  uv: '#6a3fdc',
  part: '#ff9500',
  other: '#8e8e93',
};

const SUGGESTED: { name: string; category: InventoryCategory; minStock: number }[] = [
  { name: 'Membrana de ósmosis', category: 'membrane', minStock: 4 },
  { name: 'Cartucho de sedimento', category: 'filter', minStock: 10 },
  { name: 'Cartucho de carbón', category: 'filter', minStock: 10 },
  { name: 'Tanque de filtro', category: 'tank', minStock: 2 },
  { name: 'Lámpara UV', category: 'uv', minStock: 2 },
  { name: 'Aireador', category: 'aerator', minStock: 1 },
];

const MOVE_LABEL: Record<MovementKind, string> = { in: 'Entrada', out: 'Salida', adjust: 'Conteo' };
const MOVE_COLOR: Record<MovementKind, string> = { in: '#1d9a46', out: '#e5484d', adjust: '#8e8e93' };

function StockPill({ s }: { s: ItemStock }) {
  const tone = s.out ? 'red' : s.low ? 'orange' : 'green';
  return <span className={`stock-pill ${tone}`}>{s.stock}</span>;
}

type Editing = { kind: 'item'; item: InventoryItem | null } | { kind: 'move'; itemId?: number; move?: MovementKind } | null;
type Filter = 'all' | 'low' | 'inactive';

export function Inventory({ action }: { action: string | null }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast } = useFeedback();
  const canEdit = a.canEdit('inventory');
  const [editing, setEditing] = useState<Editing>(() => (canEdit && action === 'movimiento' ? { kind: 'move' } : canEdit && action === 'producto' ? { kind: 'item', item: null } : null));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [creating, setCreating] = useState<string | null>(null);

  const levels = useMemo(() => stockLevels(data.inventoryItems, data.inventoryMovements), [data]);
  const low = levels.filter((s) => s.low || s.out);
  const value = levels.reduce((n, s) => n + Math.max(s.value ?? 0, 0), 0);
  const month = data.today.slice(0, 7);
  const outThisMonth = data.inventoryMovements.filter((m) => m.kind === 'out' && m.date.startsWith(month)).reduce((n, m) => n + m.quantity, 0);
  const spentThisMonth = data.inventoryMovements.filter((m) => m.kind === 'in' && m.date.startsWith(month)).reduce((n, m) => n + m.quantity * (m.unitCost ?? 0), 0);

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return levels.filter((s) => {
      if (filter === 'low' && !(s.low || s.out)) return false;
      if (filter === 'inactive' ? s.item.active : !s.item.active) return false;
      return !q || normalize(`${s.item.name} ${s.item.sku ?? ''} ${INVENTORY_CATEGORY_LABEL[s.item.category]}`).includes(q);
    });
  }, [levels, query, filter]);
  const categories = (Object.keys(INVENTORY_CATEGORY_LABEL) as InventoryCategory[]).filter((c) => list.some((s) => s.item.category === c));

  const quickCreate = async (s: (typeof SUGGESTED)[number]) => {
    setCreating(s.name);
    try {
      await api('/inventory-items', { method: 'POST', body: { name: s.name, category: s.category, sku: null, cost: null, minStock: s.minStock, notes: null, active: true } });
      await reload();
      toast(`${s.name} agregado`);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setCreating(null);
    }
  };

  return (
    <Page
      title="Inventario"
      subtitle={data.inventoryItems.length ? `${plural(levels.filter((s) => s.item.active).length, 'producto', 'productos')}${low.length ? ` · ${low.length} por comprar` : ''}` : 'Equipos, repuestos y filtros'}
      headerAction={
        canEdit && data.inventoryItems.length > 0 ? (
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn small gray" onClick={() => setEditing({ kind: 'item', item: null })}>
              <Plus size={17} /> <span className="add-label">Producto</span>
            </button>
            <button type="button" className="btn small add-btn" onClick={() => setEditing({ kind: 'move' })} aria-label="Registrar movimiento">
              <PackagePlus size={18} /> <span className="add-label">Movimiento</span>
            </button>
          </span>
        ) : undefined
      }
    >
      {data.inventoryItems.length === 0 ? (
        <div className="card onboarding">
          <span className="onboarding-icon violet"><Boxes size={28} /></span>
          <h2>Lleva el control de lo que tienes en bodega</h2>
          <p className="muted">Agrega tus productos, registra lo que entra y lo que sale en cada instalación, y el sistema te avisa cuando toca comprar.</p>
          {canEdit ? (
            <>
              <div className="suggest-chips">
                {SUGGESTED.map((s) => (
                  <button key={s.name} type="button" className="suggest-chip" disabled={creating != null} onClick={() => quickCreate(s)}>
                    <Plus size={15} strokeWidth={2.6} /> {creating === s.name ? 'Creando…' : s.name}
                  </button>
                ))}
              </div>
              <button type="button" className="btn" onClick={() => setEditing({ kind: 'item', item: null })}>Otro producto</button>
            </>
          ) : (
            <p className="muted">Todavía no hay productos.</p>
          )}
        </div>
      ) : (
        <>
          <div className="stats">
            <Stat
              hero
              label={a.costs ? 'Valor en bodega' : 'Unidades en bodega'}
              icon={<Boxes size={15} />}
              value={a.costs ? moneyFit(value) : levels.reduce((n, s) => n + Math.max(s.stock, 0), 0)}
              note={`${plural(levels.filter((s) => s.item.active).length, 'producto activo', 'productos activos')}${a.costs && spentThisMonth ? ` · comprado este mes ${moneyFit(spentThisMonth)}` : ''}`}
              privacy={a.costs}
            />
            <Stat
              label="Por comprar"
              icon={<ArrowDownToLine size={15} />}
              iconColor="#f08c00"
              value={low.length}
              tone={low.length ? 'orange' : undefined}
              note={low.length ? low.slice(0, 2).map((s) => s.item.name).join(', ') + (low.length > 2 ? '…' : '') : 'Todo por encima del mínimo'}
            />
            <Stat label="Salió este mes" icon={<ArrowUpFromLine size={15} />} iconColor="#e5484d" value={outThisMonth} note="Unidades usadas o vendidas" />
          </div>

          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder="Buscar producto o código" />
            <Chips<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { key: 'all', label: 'Activos' },
                { key: 'low', label: 'Por comprar', count: low.length },
                { key: 'inactive', label: 'Inactivos' },
              ]}
            />
          </div>

          {list.length === 0 ? (
            <Empty title={filter === 'low' ? 'Nada por comprar' : 'Sin resultados'} />
          ) : (
            categories.map((category) => (
              <Section key={category} title={INVENTORY_CATEGORY_LABEL[category]}>
                <Group>
                  {list
                    .filter((s) => s.item.category === category)
                    .map((s) => (
                      <Row
                        key={s.item.id}
                        to={`/inventario/${s.item.id}`}
                        leading={<IconBox icon={<Boxes size={16} />} color={CATEGORY_COLOR[s.item.category]} />}
                        title={s.item.name}
                        subtitle={
                          <>
                            <span style={{ display: 'block' }}>
                              {[s.item.sku, a.costs && s.item.cost != null ? `${money(s.item.cost)} c/u` : null, s.item.minStock ? `mínimo ${s.item.minStock}` : null].filter(Boolean).join(' · ') || ' '}
                            </span>
                            {(s.low || s.out) && <span className="badges"><Badge tone={s.out ? 'red' : 'orange'}>{s.out ? 'Sin existencia' : 'Por comprar'}</Badge></span>}
                          </>
                        }
                        value={<StockPill s={s} />}
                      />
                    ))}
                </Group>
              </Section>
            ))
          )}

          {data.inventoryMovements.length > 0 && (
            <Section title="Últimos movimientos">
              <Group>
                {data.inventoryMovements.slice(0, 8).map((m) => (
                  <MovementRow key={m.id} m={m} showItem />
                ))}
              </Group>
            </Section>
          )}
        </>
      )}

      <InventorySheets editing={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

function MovementRow({ m, showItem, onDelete }: { m: InventoryMovement; showItem?: boolean; onDelete?: () => void }) {
  const data = useData();
  const a = useAccess();
  const item = data.inventoryItems.find((i) => i.id === m.itemId);
  const sale = m.saleId ? data.sales.find((s) => s.id === m.saleId) : null;
  const service = m.serviceId ? data.services.find((s) => s.id === m.serviceId) : null;
  const client = sale ? data.clientById.get(sale.clientId) : service ? data.clientById.get(service.clientId) : null;
  const supplier = m.supplierId ? data.supplierById.get(m.supplierId)?.name : null;
  const sign = m.kind === 'out' ? '−' : m.quantity >= 0 ? '+' : '−';
  const detail = [
    showItem ? item?.name : MOVE_LABEL[m.kind],
    date(m.date, data.today),
    client ? `${sale ? 'Instalación' : 'Servicio'} de ${client.name}` : null,
    supplier,
    a.costs && m.unitCost != null ? `${money(m.unitCost)} c/u` : null,
    m.notes,
  ].filter(Boolean);
  return (
    <Row
      onClick={onDelete}
      chevron={false}
      leading={<IconBox icon={m.kind === 'in' ? <ArrowDownToLine size={16} /> : m.kind === 'out' ? <ArrowUpFromLine size={16} /> : <ClipboardCheck size={16} />} color={MOVE_COLOR[m.kind]} />}
      title={showItem ? MOVE_LABEL[m.kind] : detail.shift()}
      subtitle={detail.join(' · ')}
      value={<b className="num" style={{ color: MOVE_COLOR[m.kind] }}>{sign}{Math.abs(m.quantity)}</b>}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Un producto                                                          */
/* ------------------------------------------------------------------ */

export function InventoryItemScreen({ id }: { id: number }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const canEdit = a.canEdit('inventory');
  const [editing, setEditing] = useState<Editing>(null);
  const s = useMemo(() => stockLevels(data.inventoryItems, data.inventoryMovements).find((x) => x.item.id === id), [data, id]);
  if (!s) {
    return (
      <Page title="Producto" back={{ label: 'Inventario', to: '/inventario' }} narrow>
        <Empty title="Este producto no existe" />
      </Page>
    );
  }
  const { item } = s;
  const usedLast90 = s.movements.filter((m) => m.kind === 'out' && m.date >= addDays(data.today, -90)).reduce((n, m) => n + m.quantity, 0);
  const perMonth = Math.round((usedLast90 / 3) * 10) / 10;

  const removeMove = async (m: InventoryMovement) => {
    if (!(await confirm({ title: `¿Borrar esta ${MOVE_LABEL[m.kind].toLowerCase()}?`, message: `${Math.abs(m.quantity)} unidades del ${dateWithYear(m.date)}. La existencia se recalcula.`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/inventory-movements/${m.id}`, { method: 'DELETE' });
      await reload();
      toast('Movimiento borrado');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page
      title={item.name}
      back={{ label: 'Inventario', to: '/inventario' }}
      actions={canEdit ? <button type="button" className="link-btn strong" onClick={() => setEditing({ kind: 'item', item })}>Editar</button> : undefined}
      narrow
    >
      <div className={`stock-hero ${s.out ? 'red' : s.low ? 'orange' : 'green'}`}>
        <span className="stock-hero-label">En bodega</span>
        <span className="stock-hero-value num">{s.stock}</span>
        <span className="stock-hero-note">
          {s.out ? 'Sin existencia: toca comprar' : s.low ? `En el mínimo (${item.minStock}): toca comprar` : item.minStock ? `Mínimo ${item.minStock}` : 'Sin mínimo definido'}
          {perMonth > 0 && ` · se usan ~${perMonth} al mes`}
        </span>
      </div>

      {canEdit && (
        <div className="quick-actions three">
          <button type="button" className="quick-action" onClick={() => setEditing({ kind: 'move', itemId: item.id, move: 'in' })}>
            <ArrowDownToLine size={22} />
            Entrada
          </button>
          <button type="button" className="quick-action" onClick={() => setEditing({ kind: 'move', itemId: item.id, move: 'out' })} disabled={s.stock <= 0}>
            <ArrowUpFromLine size={22} />
            Salida
          </button>
          <button type="button" className="quick-action" onClick={() => setEditing({ kind: 'move', itemId: item.id, move: 'adjust' })}>
            <ClipboardCheck size={22} />
            Contar
          </button>
        </div>
      )}

      <Group>
        <Row title="Categoría" value={INVENTORY_CATEGORY_LABEL[item.category]} />
        {item.sku && <Row title="Código" value={item.sku} />}
        {a.costs && <Row title="Costo por unidad" value={item.cost != null ? money(item.cost) : '—'} />}
        {a.costs && s.value != null && <Row title="Valor en bodega" value={money(Math.max(s.value, 0))} />}
        {item.notes && <div className="row-block" style={{ whiteSpace: 'pre-wrap' }}>{item.notes}</div>}
      </Group>

      <Section title="Movimientos">
        <Group footer={canEdit && s.movements.length ? 'Toca un movimiento para borrarlo si fue un error.' : undefined}>
          {s.movements.length === 0 ? (
            <Empty inGroup title="Sin movimientos" text="Registra la primera entrada cuando llegue mercancía." />
          ) : (
            s.movements.map((m) => <MovementRow key={m.id} m={m} onDelete={canEdit ? () => removeMove(m) : undefined} />)
          )}
        </Group>
      </Section>

      <InventorySheets editing={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ------------------------------------------------------------------ */
/* Formularios                                                          */
/* ------------------------------------------------------------------ */

function InventorySheets({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  return (
    <>
      <ItemSheet open={editing?.kind === 'item'} item={editing?.kind === 'item' ? editing.item : null} onClose={onClose} />
      <MoveSheet open={editing?.kind === 'move'} itemId={editing?.kind === 'move' ? editing.itemId : undefined} initialKind={editing?.kind === 'move' ? editing.move : undefined} onClose={onClose} />
    </>
  );
}

function ItemSheet({ open, item, onClose }: { open: boolean; item: InventoryItem | null; onClose: () => void }) {
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const blank = { name: '', category: 'part' as InventoryCategory, sku: '', cost: null as number | null, minStock: '0', notes: '', active: true };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(item ? { name: item.name, category: item.category, sku: item.sku ?? '', cost: item.cost, minStock: String(item.minStock), notes: item.notes ?? '', active: item.active } : blank);
  }, [open, item]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError(null);
    setBusy(true);
    try {
      const body = { name: form.name, category: form.category, sku: form.sku || null, cost: form.cost, minStock: Number(form.minStock) || 0, notes: form.notes || null, active: form.active };
      const { item: saved } = await api<{ item: InventoryItem }>(item ? `/inventory-items/${item.id}` : '/inventory-items', { method: item ? 'PUT' : 'POST', body });
      await reload();
      toast(item ? 'Producto guardado' : 'Producto agregado');
      onClose();
      if (!item) navigate(`/inventario/${saved.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!item) return;
    if (!(await confirm({ title: `¿Borrar ${item.name}?`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/inventory-items/${item.id}`, { method: 'DELETE' });
      await reload();
      toast('Producto borrado');
      onClose();
      navigate('/inventario', { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={item ? 'Editar producto' : 'Nuevo producto'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save} disabled={busy}>Guardar</button>}
    >
      <Group>
        <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Membrana 75 GPD, cartucho 10”…" maxLength={120} autoFocus={!item} />
        <TextField label="Código" value={form.sku} onChange={(sku) => setForm({ ...form, sku })} placeholder="Opcional" maxLength={60} />
      </Group>
      <div className="group-label">Categoría</div>
      <div className="chip-grid">
        {(Object.keys(INVENTORY_CATEGORY_LABEL) as InventoryCategory[]).map((k) => (
          <button key={k} type="button" className={`chip-choice${form.category === k ? ' on' : ''}`} aria-pressed={form.category === k} onClick={() => setForm({ ...form, category: k })}>
            {INVENTORY_CATEGORY_LABEL[k]}
          </button>
        ))}
      </div>
      <Group footer="Con esta cantidad o menos, el sistema avisa que toca comprar. 0 = sin aviso.">
        <TextField label="Mínimo" inputMode="numeric" value={form.minStock} onChange={(v) => setForm({ ...form, minStock: v.replace(/\D/g, '').slice(0, 5) })} />
        {a.costs && <MoneyField label="Costo por unidad" value={form.cost} onChange={(cost) => setForm({ ...form, cost })} placeholder="Opcional" />}
      </Group>
      <Group>
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Proveedor habitual, medidas…" multiline />
        {item && <SwitchRow label="Activo" subtitle="Inactivo: ya no se usa; se conserva su historial" checked={form.active} onChange={(active) => setForm({ ...form, active })} />}
      </Group>
      {error && <p className="field-error">{error}</p>}
      {item && a.delete && (
        <div className="group" style={{ marginTop: 22 }}>
          <button type="button" className="row danger" onClick={remove}><Trash2 size={17} /> Borrar producto</button>
        </div>
      )}
    </Sheet>
  );
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Menos" disabled={value <= min}>
        <Minus size={18} />
      </button>
      <input inputMode="numeric" className="num" value={String(value)} onChange={(e) => onChange(Math.max(min, Number(e.target.value.replace(/\D/g, '')) || 0))} aria-label="Cantidad" />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Más">
        <Plus size={18} />
      </button>
    </div>
  );
}

function MoveSheet({ open, itemId, initialKind, onClose }: { open: boolean; itemId?: number; initialKind?: MovementKind; onClose: () => void }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast } = useFeedback();
  const [kind, setKind] = useState<MovementKind>('in');
  const [form, setForm] = useState({ itemId: null as number | null, quantity: 1, counted: 0, unitCost: null as number | null, supplierId: null as number | null, link: null as string | null, date: data.today, notes: '' });
  const [picker, setPicker] = useState<'item' | 'supplier' | 'link' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const levels = useMemo(() => stockLevels(data.inventoryItems, data.inventoryMovements), [data]);
  const current = levels.find((s) => s.item.id === form.itemId);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setKind(initialKind ?? 'in');
    const s = levels.find((x) => x.item.id === itemId);
    setForm({ itemId: itemId ?? null, quantity: 1, counted: Math.max(s?.stock ?? 0, 0), unitCost: s?.item.cost ?? null, supplierId: null, link: null, date: data.today, notes: '' });
  }, [open, itemId, initialKind]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instalaciones y servicios recientes a los que se puede cargar la salida.
  const links = useMemo(() => {
    const from = addDays(data.today, -45);
    const sales = data.sales
      .filter((s) => (s.installDate ?? s.saleDate) >= from)
      .map((s) => ({ key: `s${s.id}`, label: data.clientById.get(s.clientId)?.name ?? 'Cliente', sublabel: `Instalación · ${date(s.installDate ?? s.saleDate, data.today)} · ${equipmentSummary(s.equipment)}`, at: s.installDate ?? s.saleDate }));
    const services = data.services
      .filter((s) => (s.visitDate ?? s.reportedDate) >= from)
      .map((s) => ({ key: `v${s.id}`, label: data.clientById.get(s.clientId)?.name ?? 'Cliente', sublabel: `Servicio · ${date(s.visitDate ?? s.reportedDate, data.today)} · ${s.problem}`, at: s.visitDate ?? s.reportedDate }));
    return [...sales, ...services].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 60);
  }, [data]);
  const linkOptions = links.map((l, i) => ({ id: i + 1, label: l.label, sublabel: l.sublabel }));
  const linkIndex = form.link ? links.findIndex((l) => l.key === form.link) + 1 : null;
  const chosenLink = form.link ? links.find((l) => l.key === form.link) : null;

  const delta = kind === 'adjust' ? form.counted - (current?.stock ?? 0) : kind === 'out' ? -form.quantity : form.quantity;

  const save = async () => {
    setError(null);
    if (!form.itemId) return setError('Elige el producto.');
    if (kind !== 'adjust' && form.quantity <= 0) return setError('La cantidad debe ser mayor que cero.');
    if (kind === 'adjust' && delta === 0) return setError('El conteo es igual a lo que dice el sistema: no hay nada que ajustar.');
    if (kind === 'out' && current && form.quantity > current.stock) return setError(`Solo hay ${current.stock}. Registra primero la entrada o haz un conteo.`);
    setBusy(true);
    try {
      await api('/inventory-movements', {
        method: 'POST',
        body: {
          itemId: form.itemId,
          date: form.date,
          kind,
          quantity: kind === 'adjust' ? delta : form.quantity,
          unitCost: kind === 'in' ? form.unitCost : null,
          supplierId: kind === 'in' ? form.supplierId : null,
          saleId: kind === 'out' && form.link?.startsWith('s') ? Number(form.link.slice(1)) : null,
          serviceId: kind === 'out' && form.link?.startsWith('v') ? Number(form.link.slice(1)) : null,
          notes: form.notes || null,
        },
      });
      await reload();
      toast(kind === 'in' ? `Entraron ${form.quantity}` : kind === 'out' ? `Salieron ${form.quantity}` : 'Conteo ajustado');
      onClose();
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
      title="Movimiento"
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save} disabled={busy}>Guardar</button>}
    >
      <div className="move-kinds" role="radiogroup" aria-label="Tipo de movimiento">
        {(['in', 'out', 'adjust'] as MovementKind[]).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} className={`move-kind ${k}${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>
            {k === 'in' ? <ArrowDownToLine size={20} /> : k === 'out' ? <ArrowUpFromLine size={20} /> : <ClipboardCheck size={20} />}
            <b>{k === 'in' ? 'Entra' : k === 'out' ? 'Sale' : 'Contar'}</b>
            <span>{k === 'in' ? 'Compra o devolución' : k === 'out' ? 'Instalación o servicio' : 'Corregir existencia'}</span>
          </button>
        ))}
      </div>

      <Group footer={current ? `Hay ${current.stock} en bodega${kind !== 'adjust' ? ` · quedarán ${current.stock + delta}` : ''}` : undefined}>
        <PickerRow field="itemId" label="Producto" value={current?.item.name} onOpen={() => setPicker('item')} />
        {kind === 'adjust' ? (
          <div className="row field-row">
            <span className="row-label">Conté en bodega</span>
            <Stepper value={form.counted} onChange={(counted) => setForm({ ...form, counted })} />
          </div>
        ) : (
          <div className="row field-row">
            <span className="row-label">Cantidad</span>
            <Stepper value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} min={1} />
          </div>
        )}
        {kind === 'adjust' && current && delta !== 0 && (
          <Row title="Diferencia" value={<b style={{ color: delta > 0 ? 'var(--green)' : 'var(--red)' }}>{delta > 0 ? `+${delta}` : delta}</b>} />
        )}
      </Group>

      {kind === 'in' && (
        <Group>
          {a.costs && <MoneyField label="Costo por unidad" value={form.unitCost} onChange={(unitCost) => setForm({ ...form, unitCost })} placeholder="Opcional" hint={form.unitCost && form.quantity > 1 ? `Total ${money(form.unitCost * form.quantity)}` : undefined} />}
          <PickerRow label="Proveedor" value={form.supplierId ? data.supplierById.get(form.supplierId)?.name : null} placeholder="Opcional" onOpen={() => setPicker('supplier')} />
        </Group>
      )}
      {kind === 'out' && (a.canSee('sales') || a.canSee('services')) && (
        <Group footer="Opcional: así sabes en qué instalación o servicio se usó.">
          <PickerRow label="Para" value={chosenLink ? `${chosenLink.label}` : null} placeholder="Elegir instalación o servicio" onOpen={() => setPicker('link')} />
        </Group>
      )}

      <Group>
        <DateField label="Fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v || data.today })} max={data.today} />
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Factura, motivo del ajuste…" multiline />
      </Group>
      {error && <p className="field-error">{error}</p>}

      <Picker
        open={picker === 'item'}
        onClose={() => setPicker(null)}
        title="Producto"
        options={levels.map((s) => ({ id: s.item.id, label: s.item.name, sublabel: `${INVENTORY_CATEGORY_LABEL[s.item.category]} · hay ${s.stock}`, inactive: !s.item.active }))}
        value={form.itemId}
        onSelect={(id) => {
          const s = levels.find((x) => x.item.id === id);
          setForm({ ...form, itemId: id, counted: Math.max(s?.stock ?? 0, 0), unitCost: s?.item.cost ?? form.unitCost });
        }}
        empty={<Link to="/inventario?nuevo=producto" onClick={onClose}>Agrega primero el producto</Link>}
      />
      <Picker
        open={picker === 'supplier'}
        onClose={() => setPicker(null)}
        title="Proveedor"
        options={data.suppliers.map((s) => ({ id: s.id, label: s.name, inactive: !s.active }))}
        value={form.supplierId}
        onSelect={(supplierId) => setForm({ ...form, supplierId })}
        allowNone="Sin proveedor"
      />
      <Picker
        open={picker === 'link'}
        onClose={() => setPicker(null)}
        title="Instalación o servicio"
        options={linkOptions}
        value={linkIndex}
        onSelect={(i) => setForm({ ...form, link: i ? links[i - 1].key : null })}
        allowNone="Ninguno"
        empty="No hay instalaciones ni servicios recientes."
      />
    </Sheet>
  );
}

