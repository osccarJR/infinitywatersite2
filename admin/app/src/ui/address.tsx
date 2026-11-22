/**
 * Direccion, ciudad y ZIP con autocompletado.
 *
 * El servidor busca primero en su indice propio (padron oficial de Florida,
 * ciudades y ZIP de todo EE. UU.) y, si hay clave de Google, completa con
 * Google lo que no este en el indice. Sin nada de eso, son campos normales.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Building2, Info, MapPin, Route } from 'lucide-react';
import { api } from '../lib/api.ts';
import { useData } from '../lib/store.tsx';

export interface AddressPick {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface Suggestion {
  id: string;
  kind?: 'address' | 'street';
  main: string;
  secondary: string;
  place?: AddressPick;
}

const newSession = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9-]/g, '');

/* ------------------------------------------------------------------ */
/* Motor comun: pide sugerencias mientras se escribe                    */
/* ------------------------------------------------------------------ */

function useSuggestions<T>(query: string, active: boolean, fetcher: (q: string) => Promise<T[]>, minLength: number) {
  const [items, setItems] = useState<T[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ticket = useRef(0);

  useEffect(() => {
    if (!active || query.trim().length < minLength) {
      setItems([]);
      setSearched(false);
      return;
    }
    const mine = ++ticket.current;
    const timer = setTimeout(async () => {
      try {
        const result = await fetcher(query.trim());
        if (mine === ticket.current) {
          setItems(result);
          setSearched(true);
          setError(null);
        }
      } catch (err: any) {
        if (mine === ticket.current) setError(err.message);
      }
    }, 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, active]);

  return { items, setItems, searched, error };
}

/** Lista desplegable accesible (teclado y lector de pantalla). */
function SuggestionList<T>({
  id,
  items,
  active,
  onPick,
  render,
  footer,
}: {
  id: string;
  items: T[];
  active: number;
  onPick: (item: T) => void;
  render: (item: T) => { icon: ReactNode; main: string; sub?: string };
  footer?: ReactNode;
}) {
  return (
    <div className="suggestions" id={id} role="listbox">
      {items.map((item, index) => {
        const r = render(item);
        return (
          <button
            key={index}
            id={`${id}-${index}`}
            type="button"
            role="option"
            aria-selected={index === active}
            className={`suggestion${index === active ? ' active' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(item)}
          >
            {r.icon}
            <span>
              <span className="suggestion-main">{r.main}</span>
              {r.sub && <span className="suggestion-sub">{r.sub}</span>}
            </span>
          </button>
        );
      })}
      {footer && <div className="powered">{footer}</div>}
    </div>
  );
}

function useListKeys<T>(items: T[], onPick: (item: T) => void, close: () => void) {
  const [active, setActive] = useState(-1);
  useEffect(() => setActive(-1), [items]);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!items.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      onPick(items[active]);
    } else if (event.key === 'Escape') close();
  };
  return { active, onKeyDown };
}

/* ------------------------------------------------------------------ */
/* Direccion                                                            */
/* ------------------------------------------------------------------ */

export function AddressField({
  label = 'Dirección',
  value,
  onChange,
  onPick,
  field,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (pick: AddressPick) => void;
  field?: string;
}) {
  const { features } = useData();
  const id = useId();
  const listId = `${id}-list`;
  const [focused, setFocused] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [needNumber, setNeedNumber] = useState(false);
  const session = useRef(newSession());
  const inputRef = useRef<HTMLInputElement>(null);

  const onlyNumber = /^\s*\d+[a-z]?\s*$/i.test(value);
  const enabled = features.places && focused && value !== picked;
  const { items, setItems, searched, error } = useSuggestions<Suggestion>(
    value,
    enabled && !onlyNumber,
    async (q) => (await api<{ suggestions: Suggestion[] }>(`/places/autocomplete?q=${encodeURIComponent(q)}&s=${session.current}`)).suggestions,
    3
  );

  // Que el teclado del telefono no tape las sugerencias.
  useEffect(() => {
    if (items.length && focused) inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length > 0]);

  const pick = async (item: Suggestion) => {
    let place = item.place;
    if (!place) {
      try {
        place = (await api<{ place: AddressPick }>(`/places/detail?id=${encodeURIComponent(item.id)}&s=${session.current}`)).place;
      } catch {
        return;
      }
      session.current = newSession();
    }
    const address = place.address || item.main;
    setItems([]);
    if (item.kind === 'street') {
      // Eligio la calle: falta el numero. Se deja el cursor al inicio para escribirlo.
      onPick({ ...place, address: ` ${address}` });
      setNeedNumber(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(0, 0);
      });
      return;
    }
    setNeedNumber(false);
    setPicked(address);
    onPick({ ...place, address });
  };
  const { active, onKeyDown } = useListKeys(items, pick, () => setItems([]));

  const fromGoogle = items.some((i) => !i.id.startsWith('fl-'));
  const showList = enabled && items.length > 0;
  const showEmpty = enabled && searched && items.length === 0 && value.trim().length >= 4 && !onlyNumber;
  const numberHint = features.places && focused && onlyNumber && value.trim().length >= 2;

  return (
    <>
      <label className="row field-row" htmlFor={id} data-field={field}>
        <span className="row-label">{label}</span>
        <input
          id={id}
          ref={inputRef}
          className="field-input"
          value={value}
          placeholder={features.places ? 'Número y calle' : 'Calle y número'}
          autoComplete="off"
          maxLength={200}
          role={features.places ? 'combobox' : undefined}
          aria-expanded={features.places ? showList : undefined}
          aria-controls={features.places ? listId : undefined}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setPicked(null);
            if (/^\s*\d/.test(e.target.value)) setNeedNumber(false);
            onChange(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={onKeyDown}
        />
      </label>
      {showList && (
        <SuggestionList
          id={listId}
          items={items}
          active={active}
          onPick={pick}
          render={(item) => ({
            icon: item.kind === 'street' ? <Route size={18} /> : <MapPin size={18} />,
            main: item.main,
            sub: item.kind === 'street' ? `${item.secondary} · calle` : item.secondary,
          })}
          footer={fromGoogle ? 'con tecnología de Google' : 'Direcciones oficiales de Florida'}
        />
      )}
      {showEmpty && (
        <div className="suggest-note">
          <Info size={16} />
          No la encontramos. Si es correcta, escríbela completa y sigue.
        </div>
      )}
      {numberHint && (
        <div className="suggest-note">
          <Info size={16} />
          Sigue con la calle, por ejemplo: {value.trim()} Metro
        </div>
      )}
      {needNumber && focused && !showList && (
        <div className="suggest-note">
          <Info size={16} />
          Escribe el número de la casa al inicio.
        </div>
      )}
      {error && focused && <div className="field-error">{error}</div>}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Ciudad                                                               */
/* ------------------------------------------------------------------ */

interface CityOption {
  city: string;
  state: string;
  zip: string | null;
}

export function CityField({
  value,
  onChange,
  onPick,
  field,
}: {
  value: string;
  onChange: (value: string) => void;
  onPick: (pick: CityOption) => void;
  field?: string;
}) {
  const { features } = useData();
  const id = useId();
  const listId = `${id}-list`;
  const [focused, setFocused] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const enabled = features.places && focused && value !== picked;
  const { items, setItems } = useSuggestions<CityOption>(
    value,
    enabled,
    async (q) => (await api<{ cities: CityOption[] }>(`/places/cities?q=${encodeURIComponent(q)}&s=${newSession()}`)).cities,
    2
  );
  const pick = (item: CityOption) => {
    setPicked(item.city);
    onPick(item);
    setItems([]);
  };
  const { active, onKeyDown } = useListKeys(items, pick, () => setItems([]));
  const showList = enabled && items.length > 0;

  return (
    <>
      <label className="row field-row" htmlFor={id} data-field={field}>
        <span className="row-label">Ciudad</span>
        <input
          id={id}
          className="field-input"
          value={value}
          placeholder="ej. Fort Myers"
          autoComplete="off"
          maxLength={80}
          role={features.places ? 'combobox' : undefined}
          aria-expanded={features.places ? showList : undefined}
          aria-controls={features.places ? listId : undefined}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setPicked(null);
            onChange(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={onKeyDown}
        />
      </label>
      {showList && (
        <SuggestionList
          id={listId}
          items={items}
          active={active}
          onPick={pick}
          render={(c) => ({ icon: <Building2 size={18} />, main: c.city, sub: c.state === 'FL' ? 'Florida' : c.state })}
        />
      )}
    </>
  );
}

/** ZIP -> ciudad y estado (todo EE. UU.). */
export async function lookupZip(zip: string): Promise<{ city: string; state: string } | null> {
  if (!/^\d{5}$/.test(zip.trim())) return null;
  try {
    return (await api<{ place: { city: string; state: string } | null }>(`/places/zip?zip=${zip.trim()}&s=${newSession()}`)).place;
  } catch {
    return null;
  }
}
