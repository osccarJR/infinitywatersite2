/**
 * Hojas (bottom sheets en movil, dialogo centrado en escritorio), selector
 * con busqueda y "agregar nuevo", confirmaciones y avisos (toasts).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, CircleAlert, CircleCheck, Plus } from 'lucide-react';
import { normalize } from '../../../shared/domain.ts';
import { SearchBox } from './kit.tsx';

/* ------------------------------------------------------------------ */
/* Hoja                                                                 */
/* ------------------------------------------------------------------ */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Boton a la izquierda de la cabecera (por defecto "Cerrar"). */
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, left, right, children }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted || closing) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Enfoca el primer campo, o el panel, para teclado y lectores de pantalla.
    requestAnimationFrame(() => {
      const target = panel.current?.querySelector<HTMLElement>('[autofocus], input, textarea') ?? panel.current;
      if (target && !(target instanceof HTMLInputElement && window.matchMedia('(pointer: coarse)').matches)) target.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [mounted, closing]);

  if (!mounted) return null;
  return createPortal(
    <div className={`overlay${closing ? ' closing' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" ref={panel} tabIndex={-1}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <div>
            {left ?? (
              <button type="button" className="link-btn" onClick={onClose}>
                Cerrar
              </button>
            )}
          </div>
          <div className="title">{title}</div>
          <div>{right}</div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/* Selector                                                             */
/* ------------------------------------------------------------------ */

export interface PickerOption {
  id: number;
  label: string;
  sublabel?: string;
  inactive?: boolean;
}

interface PickerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption[];
  value: number | null;
  onSelect: (id: number | null) => void;
  /** Permite crear uno nuevo escribiendo su nombre. */
  onCreate?: (name: string) => Promise<number>;
  createLabel?: string;
  allowNone?: string;
  searchPlaceholder?: string;
  empty?: ReactNode;
}

export function Picker({ open, onClose, title, options, value, onSelect, onCreate, createLabel = 'Agregar', allowNone, searchPlaceholder = 'Buscar', empty }: PickerProps) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setError(null);
    }
  }, [open]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return options.filter(
      (o) => (!o.inactive || o.id === value) && (!q || normalize(`${o.label} ${o.sublabel ?? ''}`).includes(q))
    );
  }, [options, query, value]);

  const exact = options.some((o) => normalize(o.label) === normalize(query.trim()));

  const create = async () => {
    const name = query.trim();
    if (!onCreate || !name) return;
    setCreating(true);
    setError(null);
    try {
      const id = await onCreate(name);
      onSelect(id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {(options.length > 6 || onCreate) && (
        <div style={{ marginBottom: 14 }}>
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder={onCreate ? `${searchPlaceholder} o escribe uno nuevo` : searchPlaceholder}
          />
        </div>
      )}
      <div className="group">
        {allowNone && (
          <button type="button" className="row" onClick={() => (onSelect(null), onClose())}>
            <span className="row-label muted">{allowNone}</span>
            {value == null && <Check size={20} color="var(--accent)" strokeWidth={2.5} />}
          </button>
        )}
        {visible.map((option) => (
          <button key={option.id} type="button" className="row" onClick={() => (onSelect(option.id), onClose())}>
            <span className="row-label">
              <span className="row-title">{option.label}</span>
              {option.sublabel && <span className="row-sub" style={{ display: 'block' }}>{option.sublabel}</span>}
            </span>
            {option.id === value && <Check size={20} color="var(--accent)" strokeWidth={2.5} />}
          </button>
        ))}
        {onCreate && query.trim() && !exact && (
          <button type="button" className="row action" onClick={create} disabled={creating}>
            <Plus size={20} />
            <span className="row-label">
              {createLabel} “{query.trim()}”
            </span>
          </button>
        )}
        {visible.length === 0 && !allowNone && !(onCreate && query.trim()) && (
          <div className="row-block muted" style={{ textAlign: 'center', padding: 22 }}>
            {empty ?? (query ? 'Sin resultados' : 'Aún no hay ninguno')}
          </div>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
      {onCreate && !query && options.length === 0 && (
        <div className="group-foot">Escribe el nombre arriba para agregarlo.</div>
      )}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmaciones y avisos                                              */
/* ------------------------------------------------------------------ */

interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirm: string;
  /** Texto del boton de quedarse (por defecto "Cancelar"). */
  cancel?: string;
  danger?: boolean;
}

interface Feedback {
  toast: (message: string, kind?: 'ok' | 'error') => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: 'ok' | 'error' }[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [open, setOpen] = useState(false);
  const counter = useRef(0);

  const toast = useCallback((message: string, kind: 'ok' | 'error' = 'ok') => {
    const id = ++counter.current;
    setToasts((list) => [...list.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === 'error' ? 5000 : 3200);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
        setOpen(true);
      }),
    []
  );

  const answer = (ok: boolean) => {
    pending?.resolve(ok);
    setOpen(false);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Sheet open={open} onClose={() => answer(false)} title={pending?.title} left={<span />}>
        {pending?.message && <p className="muted" style={{ textAlign: 'center', margin: '0 8px 20px' }}>{pending.message}</p>}
        <div style={{ display: 'grid', gap: 10 }}>
          <button type="button" className={`btn block ${pending?.danger ? 'danger' : ''}`} onClick={() => answer(true)}>
            {pending?.confirm}
          </button>
          <button type="button" className="btn block gray" onClick={() => answer(false)}>
            {pending?.cancel ?? 'Cancelar'}
          </button>
        </div>
      </Sheet>
      {createPortal(
        <div className="toast-zone" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast${t.kind === 'error' ? ' error' : ''}`}>
              {t.kind === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const feedback = useContext(FeedbackContext);
  if (!feedback) throw new Error('useFeedback fuera de FeedbackProvider');
  return feedback;
}
