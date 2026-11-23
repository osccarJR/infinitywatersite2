/**
 * Calendario propio (reemplaza el selector nativo, que en cada navegador se
 * ve distinto y en Chrome de escritorio es diminuto). Hoja con el mes en
 * grande, dias redondos faciles de tocar, accesos rapidos y salto de mes/ano.
 */
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDaysISO, addMonthsISO, todayISO } from '../../../shared/domain.ts';
import { dateWithYear } from '../lib/format.ts';
import { Sheet } from './sheet.tsx';

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDay = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
};
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const weekdayOf = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

export function DateField({
  label,
  value,
  onChange,
  max,
  min,
  quick = 'past',
  field,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  /** Accesos rapidos: fecha pasada, proxima o de mantenimiento. */
  quick?: Quick;
  field?: string;
  /** Obligatoria: sin la X de borrar (no se puede dejar vacia). */
  required?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="row field-row" data-field={field}>
        <span className="row-label" id={id}>
          {label}
        </span>
        <button type="button" className="date-button" onClick={() => setOpen(true)} aria-labelledby={id} aria-haspopup="dialog">
          {value ? dateWithYear(value) : <span className="date-placeholder">Elegir fecha</span>}
          <CalendarDays size={18} />
        </button>
        {value && !required && (
          <button type="button" className="date-clear" onClick={() => onChange('')} aria-label={`Borrar ${label}`}>
            <X size={16} />
          </button>
        )}
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        {open && (
          <Calendar
            quick={quick}
            value={value}
            min={min}
            max={max}
            onPick={(v) => {
              onChange(v);
              setOpen(false);
            }}
          />
        )}
      </Sheet>
    </>
  );
}

type Quick = 'past' | 'future' | 'maintenance';

function Calendar({ value, min, max, onPick, quick }: { value: string; min?: string; max?: string; onPick: (iso: string) => void; quick: Quick }) {
  const today = todayISO();
  const start = value || (max && max < today ? max : min && min > today ? min : today);
  const [view, setView] = useState(() => {
    const { y, m } = parse(start);
    return { y, m };
  });
  const [mode, setMode] = useState<'days' | 'months'>('days');
  const [focusDay, setFocusDay] = useState(start);
  const grid = useRef<HTMLDivElement>(null);

  const allowed = (day: string) => (!min || day >= min) && (!max || day <= max);

  // Accesos rapidos segun lo que el campo permite.
  const shortcuts = useMemo(
    () =>
      (quick === 'maintenance'
        ? [
            { label: 'En 3 meses', day: addMonthsISO(today, 3) },
            { label: 'En 6 meses', day: addMonthsISO(today, 6) },
            { label: 'En 1 año', day: addMonthsISO(today, 12) },
          ]
        : quick === 'future'
          ? [
              { label: 'Hoy', day: today },
              { label: 'Mañana', day: addDaysISO(today, 1) },
              { label: 'En una semana', day: addDaysISO(today, 7) },
            ]
          : [
              { label: 'Hoy', day: today },
              { label: 'Ayer', day: addDaysISO(today, -1) },
              { label: 'Hace una semana', day: addDaysISO(today, -7) },
            ]
      ).filter((s) => allowed(s.day)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today, min, max, quick]
  );

  const move = (months: number) =>
    setView((v) => {
      const next = parse(addMonthsISO(iso(v.y, v.m, 1), months));
      return { y: next.y, m: next.m };
    });

  // Teclado: flechas para moverse por los dias, Enter para elegir.
  useEffect(() => {
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus({ preventScroll: true });
  }, [focusDay, view]);
  const onKey = (event: KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const next = addDaysISO(focusDay, steps[event.key]);
    const { y, m } = parse(next);
    setView({ y, m });
    setFocusDay(next);
  };

  const first = weekdayOf(view.y, view.m, 1);
  const total = daysIn(view.y, view.m);
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => iso(view.y, view.m, i + 1))];

  return (
    <div className="calendar">
      {shortcuts.length > 0 && (
        <div className="cal-shortcuts">
          {shortcuts.map((s) => (
            <button key={s.label} type="button" className={`chip${s.day === value ? ' on' : ''}`} aria-pressed={s.day === value} onClick={() => onPick(s.day)}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="cal-head">
        <button type="button" className="cal-title" onClick={() => setMode(mode === 'days' ? 'months' : 'days')} aria-expanded={mode === 'months'}>
          {MONTHS[view.m - 1][0].toUpperCase() + MONTHS[view.m - 1].slice(1)} {view.y}
          <ChevronRight size={18} className={mode === 'months' ? 'rot' : ''} />
        </button>
        <span className="cal-nav">
          <button type="button" className="icon-btn" onClick={() => (mode === 'days' ? move(-1) : setView((v) => ({ ...v, y: v.y - 1 })))} aria-label={mode === 'days' ? 'Mes anterior' : 'Año anterior'}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="icon-btn" onClick={() => (mode === 'days' ? move(1) : setView((v) => ({ ...v, y: v.y + 1 })))} aria-label={mode === 'days' ? 'Mes siguiente' : 'Año siguiente'}>
            <ChevronRight size={22} />
          </button>
        </span>
      </div>

      {mode === 'months' ? (
        <div className="cal-months">
          {MONTHS.map((name, i) => (
            <button
              key={name}
              type="button"
              className={`cal-month${view.m === i + 1 ? ' on' : ''}`}
              onClick={() => {
                setView((v) => ({ ...v, m: i + 1 }));
                setMode('days');
              }}
            >
              {name.slice(0, 3)}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="cal-week" aria-hidden="true">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="cal-grid" role="grid" ref={grid} onKeyDown={onKey}>
            {cells.map((day, i) =>
              day ? (
                <button
                  key={day}
                  type="button"
                  data-day={day}
                  tabIndex={day === focusDay ? 0 : -1}
                  className={`cal-day${day === value ? ' on' : ''}${day === today ? ' today' : ''}`}
                  disabled={!allowed(day)}
                  aria-label={longDay.format(new Date(`${day}T12:00:00Z`))}
                  aria-pressed={day === value}
                  onClick={() => onPick(day)}
                >
                  {Number(day.slice(8))}
                </button>
              ) : (
                <span key={`e${i}`} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Franjas que se le dan al cliente; tambien se puede escribir otra. */
const TIME_SLOTS = ['8:00 am – 10:00 am', '10:00 am – 12:00 pm', '12:00 pm – 2:00 pm', '2:00 pm – 4:00 pm', '4:00 pm – 6:00 pm'];

/** Hora de una cita (instalacion o visita): franjas a un toque o texto libre. */
export function TimeSlotsField({ field, label, value, onChange }: { field: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="row-block" data-field={field}>
      <div className="row-title" style={{ marginBottom: 10 }}>
        {label} <span className="muted" style={{ fontSize: 14 }}>· la que se le dio al cliente</span>
      </div>
      <div className="time-slots" role="group" aria-label={label}>
        {TIME_SLOTS.map((slot) => (
          <button key={slot} type="button" className={`pay-method${value === slot ? ' on' : ''}`} aria-pressed={value === slot} onClick={() => onChange(value === slot ? '' : slot)}>
            {slot.replace(':00', '').replace(':00', '')}
          </button>
        ))}
      </div>
      <input className="field-input time-custom" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Otra hora: 9:30 am, en la tarde…" maxLength={40} aria-label="Otra hora" />
    </div>
  );
}
