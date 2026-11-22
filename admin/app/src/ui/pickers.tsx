/**
 * Selectores del negocio. Todos permiten crear el elemento sin salir del
 * formulario: el primer dia no hace falta configurar nada antes de empezar.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { ChevronRight, UserPlus } from 'lucide-react';
import type { ClientSource } from '../../../shared/domain.ts';
import { SOURCE_LABEL, normalize } from '../../../shared/domain.ts';
import { api } from '../lib/api.ts';
import { useData, useStore } from '../lib/store.tsx';
import { formatPhone } from '../lib/format.ts';
import { Picker, Sheet, type PickerOption } from './sheet.tsx';
import { AddressField, CityField, lookupZip } from './address.tsx';
import { Avatar, Group, SearchBox, Segmented, TextField } from './kit.tsx';

/** Fila que muestra el valor elegido y abre un selector al tocarla. */
export function PickerRow({ label, value, placeholder = 'Elegir', onOpen, field }: { label: string; value: ReactNode; placeholder?: string; onOpen: () => void; field?: string }) {
  return (
    <button type="button" className="row" onClick={onOpen} data-field={field}>
      <span className="row-label" style={{ flex: '0 0 auto' }}>{label}</span>
      <span className="row-value" style={{ flex: 1, color: value ? 'var(--text)' : 'var(--accent)' }}>
        {value || placeholder}
      </span>
      <ChevronRight className="row-chevron" size={18} strokeWidth={2.4} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Equipo (vendedores y tecnicos)                                       */
/* ------------------------------------------------------------------ */

export function PersonPicker({
  role,
  label,
  value,
  onChange,
  field,
}: {
  role: 'seller' | 'installer';
  label: string;
  value: number | null;
  onChange: (id: number | null) => void;
  field?: string;
}) {
  const data = useData();
  const { reload } = useStore();
  const [open, setOpen] = useState(false);

  const options: PickerOption[] = data.people
    .filter((p) => (role === 'seller' ? p.isSeller : p.isInstaller) || p.id === value)
    .map((p) => ({
      id: p.id,
      label: p.name,
      sublabel: [p.isSeller && 'Vende', p.isInstaller && 'Instala'].filter(Boolean).join(' · '),
      inactive: !p.active,
    }));

  const create = async (name: string) => {
    const { person } = await api<{ person: { id: number } }>('/people', {
      method: 'POST',
      body: { name, phone: null, isSeller: role === 'seller', isInstaller: role === 'installer', active: true },
    });
    await reload();
    return person.id;
  };

  return (
    <>
      <PickerRow label={label} value={value ? data.personById.get(value)?.name : null} onOpen={() => setOpen(true)} field={field} />
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        value={value}
        onSelect={onChange}
        onCreate={create}
        createLabel={role === 'seller' ? 'Agregar vendedor' : 'Agregar técnico'}
        allowNone="Sin asignar"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Financieras y proveedores                                            */
/* ------------------------------------------------------------------ */

export function useCatalogCreate(table: 'financiers' | 'suppliers' | 'brands') {
  const { reload } = useStore();
  return async (name: string) => {
    const { item } = await api<{ item: { id: number } }>(`/${table}`, { method: 'POST', body: { name, active: true } });
    await reload();
    return item.id;
  };
}

export function FinancierPicker({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const create = useCatalogCreate('financiers');
  return (
    <>
      <PickerRow label="Financiera" value={value ? data.financierById.get(value)?.name : null} onOpen={() => setOpen(true)} field="financierId" />
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title="Financiera"
        options={data.financiers.map((f) => ({ id: f.id, label: f.name, inactive: !f.active }))}
        value={value}
        onSelect={onChange}
        onCreate={create}
        createLabel="Agregar financiera"
      />
    </>
  );
}

export function BrandPicker({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const create = useCatalogCreate('brands');
  return (
    <>
      <PickerRow label="Marca" value={value ? data.brands.find((b) => b.id === value)?.name : null} onOpen={() => setOpen(true)} field="brandId" />
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title="Marca con la que se instala"
        options={data.brands.map((b) => ({ id: b.id, label: b.name, inactive: !b.active }))}
        value={value}
        onSelect={onChange}
        onCreate={create}
        createLabel="Crear marca"
        allowNone="Sin marca"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cliente: elegir uno existente o crearlo                              */
/* ------------------------------------------------------------------ */

export interface ClientDraft {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  language: 'es' | 'en' | null;
  source: ClientSource | null;
}

/** La mayoria de clientes estan en Florida, pero se atiende en todo EE. UU. */
export const EMPTY_CLIENT: ClientDraft = { name: '', phone: '', email: '', address: '', city: '', state: 'FL', zip: '', language: 'es', source: null };

export type ClientChoice = { mode: 'existing'; id: number } | { mode: 'new'; draft: ClientDraft } | null;

/** Campos de un cliente nuevo (o en edicion). */
export function ClientFields({ draft, onChange, autoFocus, prefix = '' }: { draft: ClientDraft; onChange: (d: ClientDraft) => void; autoFocus?: boolean; prefix?: string }) {
  const set = <K extends keyof ClientDraft>(key: K) => (value: ClientDraft[K]) => onChange({ ...draft, [key]: value });
  return (
    <>
      <TextField label="Nombre" value={draft.name} onChange={set('name')} placeholder="Nombre y apellido" autoComplete="off" autoFocus={autoFocus} maxLength={120} field={`${prefix}name`} />
      <TextField
        field={`${prefix}phone`}
        label="Teléfono"
        type="tel"
        inputMode="tel"
        value={draft.phone}
        onChange={set('phone')}
        onBlur={() => draft.phone && onChange({ ...draft, phone: formatPhone(draft.phone) })}
        placeholder="ej. (239) 555-1234"
        autoComplete="off"
      />
      <AddressField
        field={`${prefix}address`}
        value={draft.address}
        onChange={set('address')}
        onPick={(place) => onChange({ ...draft, address: place.address, city: place.city || draft.city, state: place.state || draft.state, zip: place.zip || draft.zip })}
      />
      <CityField
        field={`${prefix}city`}
        value={draft.city}
        onChange={set('city')}
        onPick={(c) => onChange({ ...draft, city: c.city, state: c.state, zip: draft.zip || c.zip || '' })}
      />
      <StateZipRow
        field={`${prefix}zip`}
        state={draft.state}
        zip={draft.zip}
        onState={set('state')}
        onZip={(zip) => {
          onChange({ ...draft, zip });
          // ZIP completo y sin ciudad: se llenan ciudad y estado solos.
          if (/^\d{5}$/.test(zip) && !draft.city.trim()) {
            lookupZip(zip).then((found) => found && onChange({ ...draft, zip, city: found.city, state: found.state }));
          }
        }}
      />
    </>
  );
}

/** Estado y ZIP en una sola fila (son cortos). */
export function StateZipRow({ state, zip, onState, onZip, field }: { state: string; zip: string; onState: (v: string) => void; onZip: (v: string) => void; field?: string }) {
  return (
    <div className="row field-row" data-field={field}>
      <label className="row-label" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 'none' }}>
        Estado
        <input
          className="field-input left"
          style={{ width: '3.2ch', flex: '0 0 auto', textTransform: 'uppercase' }}
          value={state}
          onChange={(e) => onState(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
          placeholder="FL"
          aria-label="Estado (dos letras)"
          autoComplete="off"
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>ZIP</span>
        <input className="field-input num" style={{ width: '9.5ch' }} value={zip} onChange={(e) => onZip(e.target.value)} placeholder="ej. 33916" inputMode="numeric" maxLength={10} autoComplete="off" aria-label="Código postal" />
      </label>
    </div>
  );
}

/** Mas datos del cliente (correo, idioma, como nos conocio). */
export function ClientExtraFields({ draft, onChange }: { draft: ClientDraft; onChange: (d: ClientDraft) => void }) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const sources = Object.entries(SOURCE_LABEL).map(([key, label], i) => ({ id: i + 1, key: key as ClientSource, label }));
  return (
    <>
      <TextField field="email" label="Correo" type="email" inputMode="email" value={draft.email} onChange={(email) => onChange({ ...draft, email })} placeholder="opcional" autoComplete="off" />
      <div className="row">
        <span className="row-label">Idioma</span>
        <div style={{ width: 180 }}>
          <Segmented
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'Inglés' },
            ]}
            value={draft.language}
            onChange={(language) => onChange({ ...draft, language })}
            label="Idioma"
          />
        </div>
      </div>
      <PickerRow label="Cómo nos conoció" value={draft.source ? SOURCE_LABEL[draft.source] : null} placeholder="Opcional" onOpen={() => setSourceOpen(true)} />
      <Picker
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        title="Cómo nos conoció"
        options={sources.map((s) => ({ id: s.id, label: s.label }))}
        value={sources.find((s) => s.key === draft.source)?.id ?? null}
        onSelect={(id) => onChange({ ...draft, source: sources.find((s) => s.id === id)?.key ?? null })}
        allowNone="No sé"
      />
    </>
  );
}

/**
 * Seccion "Cliente" de una venta o un servicio: buscar uno existente o
 * crearlo ahi mismo.
 */
export function ClientPicker({ value, onChange, label = 'Cliente', locked }: { value: ClientChoice; onChange: (c: ClientChoice) => void; label?: string; locked?: boolean }) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const digits = query.replace(/\D/g, '');
    const list = data.clients.filter((c) => {
      if (!q) return true;
      const text = normalize(`${c.name} ${c.address ?? ''} ${c.city ?? ''}`);
      return text.includes(q) || (digits.length >= 3 && (c.phone ?? '').replace(/\D/g, '').includes(digits));
    });
    return list.slice(0, 60);
  }, [data.clients, query]);

  const startNew = () => {
    const looksLikePhone = /^[\d\s()+-]{7,}$/.test(query.trim());
    onChange({ mode: 'new', draft: { ...EMPTY_CLIENT, name: looksLikePhone ? '' : query.trim(), phone: looksLikePhone ? formatPhone(query) : '' } });
    setOpen(false);
  };

  const sheet = (
      <Sheet open={open} onClose={() => setOpen(false)} title="Elegir cliente">
        <div style={{ marginBottom: 14 }}>
          <SearchBox value={query} onChange={setQuery} placeholder="Nombre, teléfono o dirección" autoFocus />
        </div>
        <div className="group">
          <button type="button" className="row action" onClick={startNew}>
            <UserPlus size={20} />
            <span className="row-label">{query.trim() ? `Cliente nuevo: “${query.trim()}”` : 'Cliente nuevo'}</span>
          </button>
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="row"
              onClick={() => {
                onChange({ mode: 'existing', id: c.id });
                setOpen(false);
              }}
            >
              <Avatar name={c.name} />
              <span className="row-label">
                <span className="row-title">{c.name}</span>
                <span className="row-sub" style={{ display: 'block' }}>
                  {[c.phone, c.city].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                </span>
              </span>
            </button>
          ))}
        </div>
        {data.clients.length > 0 && results.length === 0 && <div className="group-foot">Ningún cliente coincide. Créalo como nuevo.</div>}
      </Sheet>
  );

  if (value?.mode === 'new') {
    // ¿Ya existe? Mismo telefono (ultimos 10 digitos) o mismo nombre.
    const digits = value.draft.phone.replace(/\D/g, '').slice(-10);
    const name = normalize(value.draft.name.trim());
    const twin =
      (digits.length === 10 && data.clients.find((c) => (c.phone ?? '').replace(/\D/g, '').slice(-10) === digits)) ||
      (name.length > 4 && data.clients.find((c) => normalize(c.name) === name)) ||
      null;
    return (
      <Group
        field="client"
        label={
          <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{label} nuevo</span>
            <button type="button" className="link-btn" style={{ padding: 0, fontSize: 13, textTransform: 'none' }} onClick={() => setOpen(true)}>
              Elegir uno existente
            </button>
          </span>
        }
      >
        <ClientFields draft={value.draft} onChange={(draft) => onChange({ mode: 'new', draft })} autoFocus={!value.draft.name} prefix="client.create." />
        {twin && (
          <div className="dup-note">
            <span>
              Ya existe <b>{twin.name}</b>
              {digits.length === 10 && (twin.phone ?? '').replace(/\D/g, '').endsWith(digits) ? ' con ese teléfono' : ' con ese nombre'}.
            </span>
            <button type="button" className="btn small secondary" onClick={() => onChange({ mode: 'existing', id: twin.id })}>
              Usar ese cliente
            </button>
          </div>
        )}
        {sheet}
      </Group>
    );
  }

  const client = value?.mode === 'existing' ? data.clientById.get(value.id) : null;

  return (
    <Group label={label} field="client">
      {client ? (
        <button type="button" className="row" onClick={() => !locked && setOpen(true)} disabled={locked}>
          <Avatar name={client.name} />
          <span className="row-label">
            <span className="row-title" style={{ fontWeight: 600 }}>{client.name}</span>
            <span className="row-sub" style={{ display: 'block' }}>
              {[client.phone, client.address, client.city, client.state && client.state !== 'FL' ? client.state : null].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
            </span>
          </span>
          {!locked && <span className="link-btn" style={{ fontSize: 15 }}>Cambiar</span>}
        </button>
      ) : (
        <>
          <button type="button" className="row action" onClick={() => setOpen(true)}>
            <span className="row-label">Buscar cliente existente</span>
            <ChevronRight className="row-chevron" size={18} />
          </button>
          <button type="button" className="row action" onClick={() => onChange({ mode: 'new', draft: { ...EMPTY_CLIENT } })}>
            <UserPlus size={20} />
            <span className="row-label">Cliente nuevo</span>
          </button>
        </>
      )}
      {sheet}
    </Group>
  );
}

/** Convierte el borrador al formato de la API. */
export function clientDraftToInput(draft: ClientDraft) {
  return {
    name: draft.name.trim(),
    phone: draft.phone.trim() || null,
    phone2: null,
    email: draft.email.trim() || null,
    address: draft.address.trim() || null,
    city: draft.city.trim() || null,
    state: draft.state.trim().toUpperCase() || null,
    zip: draft.zip.trim() || null,
    language: draft.language,
    source: draft.source,
    notes: null,
  };
}

export function clientRef(choice: ClientChoice) {
  if (!choice) return null;
  return choice.mode === 'existing' ? { id: choice.id } : { create: clientDraftToInput(choice.draft) };
}

