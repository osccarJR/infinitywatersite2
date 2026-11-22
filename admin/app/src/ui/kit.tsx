/**
 * Componentes basicos del panel (estilo iOS). Ver styles.css.
 */
import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MessageCircle, Phone, Plus, Search as SearchIcon, X } from 'lucide-react';
import { toggleAmounts, useAmountsHidden } from '../lib/privacy.ts';
import { Link, goBack } from '../lib/router.tsx';
import { useStore } from '../lib/store.tsx';
import { avatarStyle, centsToInput, initials, parseMoney } from '../lib/format.ts';

/* ------------------------------------------------------------------ */
/* Pagina                                                               */
/* ------------------------------------------------------------------ */

interface PageProps {
  title: string;
  subtitle?: ReactNode;
  /** Ruta a la que vuelve "atras" si se entro directo a la pagina. */
  back?: { label: string; to: string };
  /** Acciones en la barra superior. */
  actions?: ReactNode;
  /** Accion a la derecha del titulo grande (escritorio y movil). */
  headerAction?: ReactNode;
  narrow?: boolean;
  /** Sin titulo grande (cabecera propia, p. ej. ficha de cliente). */
  hideTitle?: boolean;
  children: ReactNode;
}

export function Page({ title, subtitle, back, actions, headerAction, narrow, hideTitle, children }: PageProps) {
  const [scrolled, setScrolled] = useState(false);
  // El ojito de montos solo tiene sentido para quien ve dinero.
  const seesMoney = Boolean(useStore().data?.me.permissions.flags['money.prices']);
  useEffect(() => {
    document.title = `${title} · Gestión`;
    const onScroll = () => setScrolled(window.scrollY > (hideTitle ? 90 : 44));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [title, hideTitle]);

  return (
    <div className={`page${narrow ? ' narrow' : ''}`}>
      <div className={`topbar${scrolled ? ' scrolled' : ''}`}>
        {back && (
          <button type="button" className="back" onClick={() => goBack(back.to)}>
            <ChevronLeft size={26} strokeWidth={2.2} />
            {back.label}
          </button>
        )}
        <span className="topbar-title">{title}</span>
        <div className="topbar-actions">
          {seesMoney && <PrivacyToggle compact />}
          {actions}
        </div>
      </div>
      {!hideTitle && (
        <header className="header">
          <div className="header-row">
            <div style={{ minWidth: 0 }}>
              <h1 className="large-title">{title}</h1>
              {subtitle && <p className="subtitle">{subtitle}</p>}
            </div>
            {headerAction}
          </div>
        </header>
      )}
      {children}
    </div>
  );
}

export function Section({ title, action, children }: { title?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      {(title || action) && (
        <div className="section-head">
          {title && <h2 className="section-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Ojito para mostrar u ocultar los montos. `compact`: solo icono (barra
 * superior del telefono); si no, boton con texto (barra lateral).
 */
export function PrivacyToggle({ compact, inline }: { compact?: boolean; inline?: boolean }) {
  const hidden = useAmountsHidden();
  const label = hidden ? 'Mostrar montos' : 'Ocultar montos';
  const Icon = hidden ? EyeOff : Eye;
  if (inline) {
    return (
      <button type="button" className="privacy-pill" onClick={toggleAmounts} aria-label={label} aria-pressed={!hidden}>
        {hidden ? <Eye size={17} /> : <EyeOff size={17} />}
        {hidden ? 'Mostrar' : 'Ocultar'}
      </button>
    );
  }
  if (compact) {
    return (
      <button type="button" className={`icon-btn mobile-only privacy-btn${hidden ? '' : ' on'}`} onClick={toggleAmounts} aria-label={label} aria-pressed={!hidden} title={label}>
        <Icon size={22} />
      </button>
    );
  }
  return (
    <button type="button" className={`nav-item privacy-row${hidden ? '' : ' on'}`} onClick={toggleAmounts} aria-pressed={!hidden}>
      <Icon size={19} strokeWidth={2} />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Listas agrupadas                                                     */
/* ------------------------------------------------------------------ */

export function Group({ label, footer, children, field }: { label?: ReactNode; footer?: ReactNode; children: ReactNode; field?: string }) {
  return (
    <>
      {label && <div className="group-label">{label}</div>}
      <div className="group" data-field={field}>{children}</div>
      {footer && <div className="group-foot">{footer}</div>}
    </>
  );
}

interface RowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  strong?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  className?: string;
  clamp?: boolean;
}

export function Row({ title, subtitle, value, strong, leading, trailing, to, href, onClick, chevron, className = '', clamp }: RowProps) {
  const content = (
    <>
      {leading}
      <div className="row-label">
        <div className="row-title">{title}</div>
        {subtitle && <div className={`row-sub${clamp ? ' clamp' : ''}`}>{subtitle}</div>}
      </div>
      {value != null && <div className={`row-value num${strong ? ' strong' : ''}`}>{value}</div>}
      {trailing}
      {(chevron ?? Boolean(to || onClick)) && <ChevronRight className="row-chevron" size={18} strokeWidth={2.4} />}
    </>
  );
  const cls = `row ${className}`;
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  if (href)
    return (
      <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener">
        {content}
      </a>
    );
  if (onClick)
    return (
      <button type="button" className={cls} onClick={onClick}>
        {content}
      </button>
    );
  return <div className={cls}>{content}</div>;
}

/**
 * Fila de persona con acciones a la derecha (llamar, WhatsApp). La parte
 * principal es un enlace; los botones van fuera de el (no se anidan enlaces).
 */
export function ContactRow({
  to,
  leading,
  title,
  subtitle,
  phone,
  whatsappText,
  trailing,
}: {
  to: string;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  phone?: string | null;
  whatsappText?: string;
  trailing?: ReactNode;
}) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const intl = digits.length === 10 ? '1' + digits : digits;
  return (
    <div className="row contact-row">
      <Link to={to} className="contact-main">
        {leading}
        <div className="row-label">
          <div className="row-title">{title}</div>
          {subtitle && <div className="row-sub">{subtitle}</div>}
        </div>
        {trailing}
      </Link>
      {digits.length >= 10 && (
        <span className="contact-actions">
          <a className="icon-btn" href={`tel:+${intl}`} aria-label="Llamar">
            <Phone size={19} />
          </a>
          <a
            className="icon-btn wa"
            href={`https://wa.me/${intl}${whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : ''}`}
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
          >
            <MessageCircle size={19} />
          </a>
        </span>
      )}
    </div>
  );
}

/** Boton "+ Algo" del encabezado; en el telefono se reduce a un "+" redondo. */
export function AddButton({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="btn small add-btn" aria-label={`Agregar ${label.toLowerCase()}`}>
      <Plus size={18} strokeWidth={2.5} />
      <span className="add-label">{label}</span>
    </Link>
  );
}

export function IconBox({ icon, color }: { icon: ReactNode; color: string }) {
  return (
    <span className="row-iconbox" style={{ background: color }}>
      {icon}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Campos de formulario (dentro de un Group)                            */
/* ------------------------------------------------------------------ */

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'tel' | 'email';
  inputMode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal';
  autoComplete?: string;
  list?: string;
  onBlur?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  /** Campo para llevar al usuario aqui si falla la validacion. */
  field?: string;
}

export function TextField({ label, value, onChange, type = 'text', field, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <label className="row field-row" htmlFor={id} data-field={field}>
      <span className="row-label">{label}</span>
      <input
        id={id}
        className="field-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  );
}

export function StackField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  autoFocus,
  maxLength = 4000,
  field,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  field?: string;
}) {
  return (
    <label className="row-block stack-field" data-field={field}>
      <span className="label">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          maxLength={maxLength}
          rows={3}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} maxLength={maxLength} />
      )}
    </label>
  );
}

/**
 * Campo de dinero. Se edita como texto ("1,250.50") y entrega centavos.
 * Mientras se escribe no reformatea, para no mover el cursor.
 */
export function MoneyField({
  label,
  value,
  onChange,
  placeholder = '0',
  hint,
  field,
}: {
  label: ReactNode;
  value: number | null;
  onChange: (cents: number | null) => void;
  placeholder?: string;
  hint?: ReactNode;
  field?: string;
}) {
  const id = useId();
  const [text, setText] = useState(centsToInput(value));
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState(false);

  // Si el valor cambia desde fuera (p. ej. un calculo), se refleja.
  useEffect(() => {
    const parsed = parseMoney(text);
    if (parsed !== value && !(parsed === undefined && invalid)) setText(centsToInput(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <label className="row field-row" htmlFor={id} data-field={field}>
        <span className="row-label">{label}</span>
        <span className="money-wrap">
          <span className="prefix">$</span>
          <input
            id={id}
            className="field-input num"
            inputMode="decimal"
            value={text}
            placeholder={placeholder}
            aria-label={typeof label === 'string' ? label : undefined}
            // El formulario no deja guardar mientras haya un monto invalido.
            aria-invalid={invalid || undefined}
            onFocus={() => setFocused(true)}
            // Ancho segun el contenido, para que el "$" quede junto al numero.
            style={{ width: `${Math.max(text.length, placeholder.length, 1) + 1.5}ch` }}
            onChange={(e) => {
              const next = e.target.value;
              setText(next);
              const parsed = parseMoney(next);
              setInvalid(parsed === undefined);
              if (parsed !== undefined) onChange(parsed);
            }}
            onBlur={() => {
              setFocused(false);
              const parsed = parseMoney(text);
              if (parsed !== undefined) setText(centsToInput(parsed));
            }}
          />
        </span>
      </label>
      {invalid && <div className="field-error">Monto no válido. Escríbelo así: 1500 o 1500.50</div>}
      {focused && !invalid && value != null && value >= 100000 && <div className="money-live num">= {moneyPlainLocal(value)}</div>}
      {hint && !(invalid && !focused) && <div className="row-block" style={{ paddingTop: 0, fontSize: 13, color: 'var(--text-2)' }}>{hint}</div>}
    </>
  );
}

const usdLive = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const moneyPlainLocal = (cents: number) => usdLive.format(cents / 100);

/** true si algun monto del formulario esta mal escrito. */
export const hasInvalidMoney = (form: HTMLFormElement | null) => Boolean(form?.querySelector('[aria-invalid="true"]'));

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}

export function SwitchRow({
  label,
  subtitle,
  checked,
  onChange,
  field,
  disabled,
}: {
  label: string;
  subtitle?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  field?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`row${disabled ? ' is-disabled' : ''}`} data-field={field}>
      <div className="row-label" onClick={() => !disabled && onChange(!checked)}>
        <div className="row-title">{label}</div>
        {subtitle && <div className="row-sub">{subtitle}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
}) {
  const index = options.findIndex((option) => option.value === value);
  return (
    <div className="segmented" role="group" aria-label={label}>
      {index >= 0 && (
        <span
          className="segmented-thumb"
          aria-hidden="true"
          style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
        />
      )}
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SegmentedRow<T extends string | number>(props: {
  title: string;
  subtitle?: ReactNode;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
  field?: string;
}) {
  return (
    <div className="row-block segmented-row" data-field={props.field}>
      <div className="row-title">
        {props.title}
        {props.subtitle && <span className="muted" style={{ fontSize: 14 }}> · {props.subtitle}</span>}
      </div>
      <Segmented options={props.options} value={props.value} onChange={props.onChange} label={props.title} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Varios                                                               */
/* ------------------------------------------------------------------ */

export function Avatar({ name, size, photo }: { name: string; size?: 'xl' | 'lg' | 'sm'; photo?: string | null }) {
  if (photo) {
    return (
      <span className={`avatar photo${size ? ' ' + size : ''}`} aria-hidden="true">
        <img src={photo} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }
  return (
    <span className={`avatar${size ? ' ' + size : ''}`} style={avatarStyle(name)} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export type Tone = 'green' | 'orange' | 'red' | 'blue' | 'violet' | 'gray';

export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge ${tone === 'gray' ? '' : tone}`}>{children}</span>;
}

export function Empty({ icon, title, text, action, inGroup }: { icon?: ReactNode; title: string; text?: ReactNode; action?: ReactNode; inGroup?: boolean }) {
  return (
    <div className={`empty${inGroup ? ' in-group' : ''}`}>
      {icon}
      <div className="empty-title">{title}</div>
      {text && <div style={{ maxWidth: 380 }}>{text}</div>}
      {action}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, autoFocus }: { value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <label className="search">
      <SearchIcon size={17} />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        enterKeyHint="search"
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="clear" onClick={() => onChange('')} aria-label="Borrar búsqueda">
          <X size={16} />
        </button>
      )}
    </label>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="chips" role="group">
      {options.map((option) => (
        <button key={option.key} type="button" className="chip" aria-pressed={value === option.key} onClick={() => onChange(option.key)}>
          {option.label}
          {option.count != null && option.count > 0 && <span className="n">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
  icon,
  iconColor = 'var(--accent)',
  to,
  hero,
  tone,
  spark,
  privacy,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  to?: string;
  hero?: boolean;
  tone?: 'green' | 'orange' | 'red';
  /** Serie para la mini grafica de tendencia (solo la tarjeta principal). */
  spark?: number[];
  /** Ojito para mostrar u ocultar montos junto a la cifra. */
  privacy?: boolean;
}) {
  const content = (
    <>
      <span className="stat-label">
        {icon && (
          <span className="stat-icon" style={{ background: iconColor }}>
            {icon}
          </span>
        )}
        {label}
      </span>
      {privacy ? (
        <span className="stat-value-row">
          <span className={`stat-value${tone ? ' ' + tone : ''}`}>{value}</span>
          <PrivacyToggle inline />
        </span>
      ) : (
        <span className={`stat-value${tone ? ' ' + tone : ''}`}>{value}</span>
      )}
      {note && <span className="stat-note">{note}</span>}
      {spark && <Sparkline values={spark} />}
    </>
  );
  const cls = `stat${hero ? ' hero' : ''}`;
  return to ? <Link to={to} className={cls}>{content}</Link> : <div className={cls}>{content}</div>;
}

/** Linea de tendencia suave con area, en blanco (va sobre el degradado). */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((v) => v === 0)) return null;
  const w = 200;
  const h = 58;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 4 - (v / max) * (h - 10)]);
  // Curva suave (Catmull-Rom a Bezier).
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[Math.max(i - 1, 0)];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = pts[Math.min(i + 2, pts.length - 1)];
    d += ` C${x1 + (x2 - x0) / 6},${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6},${y2 - (y3 - y1) / 6} ${x2},${y2}`;
  }
  const last = pts[pts.length - 1];
  return (
    <svg className="stat-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#spark-fill)" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="#fff" />
    </svg>
  );
}

export function Spinner() {
  return <div className="spinner" role="status" aria-label="Cargando" />;
}
