/**
 * Registro de actividad: todo lo que se hace en el sistema, quien, cuando,
 * desde donde y que cambio. Solo lo ve el dueno. Es de solo lectura y esta
 * sellado: si alguien lo altera desde el servidor, aqui sale el aviso.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Boxes,
  CreditCard,
  Download,
  Eye,
  KeyRound,
  LogIn,
  LogOut,
  Printer,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { User } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { navigate } from '../lib/router.tsx';
import { exportRows } from '../lib/exports.ts';
import { useAccess } from '../lib/access.ts';
import { dateWithYear, localDate, longDate, plural } from '../lib/format.ts';
import { Avatar, Chips, Empty, IconBox, Page, SearchBox, Spinner } from '../ui/kit.tsx';
import { useFeedback } from '../ui/sheet.tsx';

interface Change {
  f: string;
  a?: string;
  b?: string;
}

interface Entry {
  id: number;
  at: string;
  userId: number | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: number | null;
  label: string | null;
  ip: string | null;
  device: string | null;
  changes: Change[] | null;
  extra: Record<string, unknown> | null;
}

interface Summary {
  integrity: { ok: boolean; count: number; first: string | null; brokenAt: { id: number; at: string } | null };
  stats: { today: number; deletes7: number; failed7: number; logins7: number };
}

const GROUPS = [
  { key: '', label: 'Todo' },
  { key: 'sales', label: 'Ventas' },
  { key: 'clients', label: 'Clientes' },
  { key: 'services', label: 'Servicio' },
  { key: 'credit', label: 'Créditos' },
  { key: 'bank', label: 'Caja y bancos' },
  { key: 'payments', label: 'Pagos' },
  { key: 'payables', label: 'Cuentas por pagar' },
  { key: 'inventory', label: 'Inventario' },
  { key: 'team', label: 'Equipo y catálogos' },
  { key: 'users', label: 'Usuarios y permisos' },
  { key: 'access', label: 'Accesos' },
  { key: 'downloads', label: 'Descargas' },
  { key: 'deletes', label: 'Borrados' },
];

const PERIODS = [
  { key: 'all', label: 'Todo' },
  { key: 'today', label: 'Hoy' },
  { key: '7', label: '7 días' },
  { key: '30', label: '30 días' },
];

/* ------------------------------------------------------------------ */
/* Frases                                                               */
/* ------------------------------------------------------------------ */

const ENTITY_VERB: Record<string, [create: string, update: string, del: string]> = {
  sale: ['registró', 'editó', 'borró'],
  client: ['agregó', 'editó', 'borró'],
  service: ['registró', 'editó', 'borró'],
  payable: ['registró', 'editó', 'borró'],
  'payable-account': ['creó', 'editó', 'borró'],
  'payable-payment': ['registró', 'editó', 'borró'],
  'inventory-item': ['creó', 'editó', 'borró'],
  'inventory-movement': ['registró', 'editó', 'borró'],
  person: ['agregó', 'editó', 'quitó'],
  financier: ['agregó', 'editó', 'borró'],
  supplier: ['agregó', 'editó', 'borró'],
  brand: ['agregó', 'editó', 'borró'],
  user: ['creó', 'editó', 'borró'],
  database: ['creó', 'editó', 'borró'],
  credit: ['empezó', 'editó', 'borró'],
  'bank-account': ['creó', 'editó', 'borró'],
  'bank-movement': ['registró', 'editó', 'borró'],
};

/** "Adriana editó la venta de María Pérez (#123)". */
function sentence(e: Entry): { who: string; text: string } {
  const who = e.userName ?? (e.device === 'Servidor (terminal)' ? 'Desde el servidor' : 'Alguien');
  const label = e.label ?? '';
  const verbs = ENTITY_VERB[e.entity] ?? ['creó', 'editó', 'borró'];
  switch (e.action) {
    case 'create':
      return { who, text: `${verbs[0]} ${label}` };
    case 'update':
      return { who, text: `${verbs[1]} ${label}` };
    case 'delete':
      return { who, text: `${verbs[2]} ${label}` };
    case 'mark':
      return { who, text: `marcó ${label}` };
    case 'mark-batch':
      return { who, text: `marcó ${label}` };
    case 'tech-payment':
      return { who, text: `registró el pago ${label}` };
    case 'permissions':
      return { who, text: `cambió los permisos de ${label}` };
    case 'password':
      return { who, text: `cambió ${label}` };
    case 'deactivate':
      return { who, text: `le quitó el acceso a ${label}` };
    case 'activate':
      return { who, text: `le devolvió el acceso a ${label}` };
    case 'login':
      return { who, text: 'entró al sistema' };
    case 'warranty':
      return { who, text: `generó ${label}` };
    case 'warranty-update':
      return { who, text: `volvió a generar ${label}` };
    case 'invoice':
      return { who, text: `emitió ${label}` };
    case 'invoice-update':
      return { who, text: `volvió a emitir ${label}` };
    case 'credit-submit':
      return { who, text: `firmó y envió ${label}` };
    case 'credit-approve':
      return { who, text: `aprobó ${label}` };
    case 'credit-decline':
      return { who, text: `negó ${label}` };
    case 'credit-return':
      return { who, text: `devolvió para corregir ${label}` };
    case 'credit-secret':
      return { who, text: `${e.extra?.motivo === 'imprimir' ? 'imprimió con el seguro social completo' : 'vio el seguro social y la licencia de'} ${label}` };
    case 'credit-ids':
      return { who, text: `vio las fotos de las IDs de ${label}` };
    case 'credit-purge':
      return { who: 'El sistema', text: `borró el seguro social, la licencia y las fotos de las IDs de ${label} (ya pasó el tiempo de guardarlos)` };
    case 'goodleap-form':
      return { who, text: `registró el formulario de GoodLeap firmado de ${label}` };
    case 'contract-sign':
      return { who, text: `firmó la autorización de instalación de ${label}` };
    case 'avatar':
      return { who, text: `cambió ${label}` };
    case 'login-failed':
      return { who: 'Intento fallido', text: `de entrar como «${label}»${e.extra?.reason ? ` · ${e.extra.reason}` : ''}` };
    case 'logout':
      return { who, text: 'cerró sesión' };
    case 'preview':
      return { who, text: `vio el sistema como ${label}` };
    case 'export':
      return { who, text: `descargó a Excel ${label}` };
    case 'print':
      return { who, text: `imprimió o guardó en PDF ${label}` };
    case 'backup':
      return { who, text: `descargó ${label}` };
    case 'merge-seller':
      return { who, text: `unió vendedores: pasó las ventas de ${String(e.extra?.name ?? '')} a otro vendedor` };
    default:
      return { who, text: `${e.action} ${e.entity}${label ? ` · ${label}` : ''}` };
  }
}

function look(e: Entry): { icon: ReactNode; color: string; tone?: 'red' | 'orange' | 'violet' } {
  if (e.action === 'delete') return { icon: <Trash2 size={16} />, color: '#e5484d', tone: 'red' };
  if (e.action === 'login-failed') return { icon: <ShieldAlert size={16} />, color: '#f08c00', tone: 'orange' };
  if (e.action === 'permissions' || e.action === 'deactivate' || e.action === 'activate') return { icon: <UserCog size={16} />, color: '#6a3fdc', tone: 'violet' };
  if (e.action === 'password') return { icon: <KeyRound size={16} />, color: '#6a3fdc', tone: 'violet' };
  if (e.action === 'login') return { icon: <LogIn size={16} />, color: '#1d9a46' };
  if (e.action === 'logout') return { icon: <LogOut size={16} />, color: '#8e8e93' };
  if (e.action === 'preview') return { icon: <Eye size={16} />, color: '#3a2d6b' };
  if (e.action === 'export' || e.action === 'backup') return { icon: <Download size={16} />, color: '#1d8a3a' };
  if (e.action === 'print') return { icon: <Printer size={16} />, color: '#1d8a3a' };
  if (e.action === 'mark' || e.action === 'mark-batch' || e.action === 'tech-payment') return { icon: <Wallet size={16} />, color: '#0f7a3c' };
  switch (e.entity) {
    case 'sale':
      return { icon: <Receipt size={16} />, color: '#0a72c2' };
    case 'service':
      return { icon: <Wrench size={16} />, color: '#ff9500' };
    case 'payable':
    case 'payable-account':
    case 'payable-payment':
      return { icon: <CreditCard size={16} />, color: '#e5484d' };
    case 'inventory-item':
    case 'inventory-movement':
      return { icon: <Boxes size={16} />, color: '#5856d6' };
    default:
      return { icon: <Users size={16} />, color: '#636366' };
  }
}

/** Fecha y hora local de Florida desde "AAAA-MM-DD HH:MM:SS" (UTC). */
const at = (sqlite: string) => new Date(sqlite.replace(' ', 'T') + 'Z');
const timeFmt = new Intl.DateTimeFormat('es-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });

/* ------------------------------------------------------------------ */
/* Pantalla                                                             */
/* ------------------------------------------------------------------ */

export function Audit({ initialUser }: { initialUser: number | null }) {
  const data = useData();
  const a = useAccess();
  const { toast } = useFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(initialUser);
  const [group, setGroup] = useState('');
  const [period, setPeriod] = useState('all');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const request = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    api<{ users: User[] }>('/users').then((r) => setUsers(r.users)).catch(() => {});
    api<Summary>('/audit/summary').then(setSummary).catch(() => {});
  }, []);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (userId) p.set('user', String(userId));
    if (group) p.set('group', group);
    if (period !== 'all') p.set('from', period === 'today' ? data.today : addDays(data.today, -Number(period)));
    if (debounced) p.set('q', debounced);
    return p;
  }, [userId, group, period, debounced, data.today]);

  const load = useCallback(
    async (before?: number) => {
      const id = ++request.current;
      setLoading(true);
      setError(null);
      try {
        const p = new URLSearchParams(params);
        if (before) p.set('before', String(before));
        const r = await api<{ entries: Entry[]; more: boolean }>(`/audit?${p}`);
        if (id !== request.current) return;
        setEntries((prev) => (before ? [...prev, ...r.entries] : r.entries));
        setMore(r.more);
      } catch (err: any) {
        if (id === request.current) setError(err.message);
      } finally {
        if (id === request.current) setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!a.owner) {
    return (
      <Page title="Registro de actividad">
        <Empty icon={<ShieldCheck size={40} />} title="Solo el dueño ve el registro de actividad" />
      </Page>
    );
  }

  const days = groupByDay(entries);
  const integrity = summary?.integrity;

  const toExcel = () => {
    try {
      exportRows<Entry>(
        'registro-de-actividad',
        entries,
        [
          { label: 'Fecha', value: (e) => localDate(e.at) },
          { label: 'Hora', value: (e) => timeFmt.format(at(e.at)) },
          { label: 'Quién', value: (e) => sentence(e).who },
          { label: 'Qué hizo', value: (e) => sentence(e).text },
          { label: 'Cambios', value: (e) => (e.changes ?? []).map((c) => (c.a !== undefined ? `${c.f}: ${c.a} → ${c.b}` : `${c.f}: ${c.b}`)).join(' | ') },
          { label: 'Equipo', value: (e) => e.device },
          { label: 'IP', value: (e) => e.ip },
        ],
        a,
        data.today,
        'el registro de actividad'
      );
      toast('Descargado. Ábrelo con Excel o Google Sheets.');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page
      title="Registro de actividad"
      subtitle="Todo lo que se hace en el sistema: quién, cuándo, desde dónde y qué cambió."
      headerAction={
        <button type="button" className="btn small gray" onClick={toExcel} disabled={!entries.length}>
          <Download size={16} /> <span className="add-label">Excel</span>
        </button>
      }
    >
      {integrity && (
        <div className={`integrity ${integrity.ok ? 'ok' : 'bad'}`}>
          <span className="integrity-icon">{integrity.ok ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}</span>
          <span>
            <b>{integrity.ok ? 'Registro íntegro' : 'Atención: el registro fue alterado'}</b>
            <span>
              {integrity.ok
                ? `${integrity.count.toLocaleString('es-US')} movimientos${integrity.first ? ` desde el ${dateWithYear(localDate(integrity.first))}` : ''}. Está sellado: nadie puede borrarlo ni cambiarlo sin que se note.`
                : `Alguien cambió o borró movimientos desde el servidor (a partir del ${integrity.brokenAt ? dateWithYear(localDate(integrity.brokenAt.at)) : '—'}). Avísale a quien administra el servidor.`}
            </span>
          </span>
        </div>
      )}

      {summary && (
        <div className="audit-stats">
          <button type="button" onClick={() => { setPeriod('today'); setGroup(''); }}>
            <b className="num">{summary.stats.today}</b>
            <span>cambios en 24 h</span>
          </button>
          <button type="button" onClick={() => { setPeriod('7'); setGroup('access'); }}>
            <b className="num">{summary.stats.logins7}</b>
            <span>entradas en 7 días</span>
          </button>
          <button type="button" className={summary.stats.failed7 ? 'warn' : ''} onClick={() => { setPeriod('7'); setGroup('access'); setQuery(''); }}>
            <b className="num">{summary.stats.failed7}</b>
            <span>intentos fallidos</span>
          </button>
          <button type="button" className={summary.stats.deletes7 ? 'bad' : ''} onClick={() => { setPeriod('7'); setGroup('deletes'); }}>
            <b className="num">{summary.stats.deletes7}</b>
            <span>borrados en 7 días</span>
          </button>
        </div>
      )}

      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar cliente, venta, IP…" />
        <div className="period-chips" role="group" aria-label="Persona">
          <button type="button" className={`chip${userId == null ? ' on' : ''}`} onClick={() => setUserId(null)}>Todos</button>
          {users.map((u) => (
            <button key={u.id} type="button" className={`chip person-chip${userId === u.id ? ' on' : ''}`} onClick={() => setUserId(userId === u.id ? null : u.id)}>
              <Avatar name={u.name} size="sm" photo={u.avatar} /> {u.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <Chips<string> value={group} onChange={setGroup} options={GROUPS.map((g) => ({ key: g.key, label: g.label }))} />
        <div className="period-chips" role="group" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" className={`chip${period === p.key ? ' on' : ''}`} onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="field-error">{error}</p>}
      {!loading && !entries.length && !error && <Empty icon={<ShieldCheck size={40} />} title="Nada con estos filtros" text="Cambia la persona, el tipo o el periodo." />}

      <div className="audit-days">
        {days.map(([day, list]) => (
          <section key={day} className="audit-day">
            <h3 className="audit-day-title">{dayTitle(day, data.today)}</h3>
            <div className="audit-list">
              {list.map((e) => (
                <AuditRow key={e.id} e={e} onOpen={openTarget(e, data)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
          <Spinner />
        </div>
      )}
      {more && !loading && (
        <div style={{ textAlign: 'center', margin: '18px 0' }}>
          <button type="button" className="btn gray" onClick={() => load(entries[entries.length - 1]?.id)}>
            Ver más antiguos
          </button>
        </div>
      )}
      {!more && entries.length > 0 && <p className="group-foot" style={{ textAlign: 'center' }}>{plural(entries.length, 'movimiento', 'movimientos')} · no hay más</p>}
    </Page>
  );
}

function AuditRow({ e, onOpen }: { e: Entry; onOpen: (() => void) | null }) {
  const [open, setOpen] = useState(false);
  const { who, text } = sentence(e);
  const l = look(e);
  const changes = e.changes ?? [];
  const shown = open ? changes : changes.slice(0, 4);
  return (
    <article className={`audit-row${l.tone ? ' ' + l.tone : ''}`}>
      <IconBox icon={l.icon} color={l.color} />
      <div className="audit-body">
        <p className="audit-text">
          <b>{who}</b> {text}
        </p>
        <p className="audit-meta">
          {timeFmt.format(at(e.at))}
          {e.device && ` · ${e.device}`}
          {e.ip && ` · IP ${e.ip}`}
        </p>
        {changes.length > 0 && (
          <ul className="audit-changes">
            {shown.map((c, i) => (
              <li key={i}>
                <span className="audit-field">{c.f}</span>
                {c.a !== undefined ? (
                  <span className="audit-diff">
                    <s>{c.a}</s>
                    <ArrowRight size={13} />
                    <b>{c.b}</b>
                  </span>
                ) : (
                  <span className="audit-diff">
                    <b>{c.b}</b>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="audit-actions">
          {changes.length > 4 && (
            <button type="button" className="link-btn" onClick={() => setOpen(!open)}>
              {open ? 'Ver menos' : `Ver los ${changes.length} ${changes.some((c) => c.a !== undefined) ? 'cambios' : 'datos'}`}
            </button>
          )}
          {onOpen && (
            <button type="button" className="link-btn" onClick={onOpen}>
              Abrir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** A donde lleva "Abrir" (si el registro todavia existe). */
function openTarget(e: Entry, data: ReturnType<typeof useData>): (() => void) | null {
  if (e.action === 'delete' || e.entityId == null || ['login', 'login-failed', 'logout', 'preview'].includes(e.action)) return null;
  const id = e.entityId;
  const go = (to: string) => () => navigate(to);
  switch (e.entity) {
    case 'sale':
      return data.sales.some((s) => s.id === id) ? go(`/ventas/${id}`) : null;
    case 'client':
      return data.clientById.has(id) ? go(`/clientes/${id}`) : null;
    case 'service':
      return data.services.some((s) => s.id === id) ? go(`/servicio/${id}`) : null;
    case 'payable-account':
      return data.payableAccounts.some((x) => x.id === id) ? go(`/pagar/${id}`) : null;
    case 'payable': {
      const p = data.payables.find((x) => x.id === id);
      return p ? go(`/pagar/${p.accountId}`) : null;
    }
    case 'inventory-item':
      return data.inventoryItems.some((x) => x.id === id) ? go(`/inventario/${id}`) : null;
    case 'user':
      return e.action === 'login-failed' && !e.userId ? null : go(`/ajustes/usuarios/${id}`);
    default:
      return null;
  }
}

function groupByDay(entries: Entry[]): [string, Entry[]][] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const day = localDate(e.at);
    const list = map.get(day);
    if (list) list.push(e);
    else map.set(day, [e]);
  }
  return [...map.entries()];
}

function dayTitle(day: string, today: string) {
  if (day === today) return 'Hoy';
  if (day === addDays(today, -1)) return 'Ayer';
  const text = longDate(day);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
