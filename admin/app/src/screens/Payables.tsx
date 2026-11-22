/**
 * Cuentas por pagar: tarjetas (Visa, Mastercard, las personales), proveedores,
 * prestamos. Cada cuenta tiene cargos (lo que se debe) y pagos (abonos); el
 * saldo, lo vencido y lo proximo a vencer se calculan solos.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CalendarClock, CircleCheck, CreditCard, Landmark, Plus, Receipt, Store, User, Wallet } from 'lucide-react';
import type { ExpenseCategory, Payable, PayableAccount, PayableAccountKind, PayablePayment, ServicePayment } from '../../../shared/domain.ts';
import { EXPENSE_CATEGORY_LABEL, PAYABLE_KIND_LABEL, SERVICE_PAYMENT_LABEL } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { Link, navigate } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { accountStatuses, payablesTotals, type AccountStatus, type PayableStatus } from '../lib/books.ts';
import { date, dateWithYear, money, moneyFit, moneyRound, plural, relativeDay } from '../lib/format.ts';
import { Badge, Empty, Group, IconBox, MoneyField, Page, Row, Section, SegmentedRow, Stat, StackField, SwitchRow, TextField } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { PickerRow } from '../ui/pickers.tsx';
import { Picker, Sheet, useFeedback } from '../ui/sheet.tsx';

/* ------------------------------------------------------------------ */
/* Aspecto de cada cuenta                                               */
/* ------------------------------------------------------------------ */

const KIND_ICON: Record<PayableAccountKind, typeof CreditCard> = { card: CreditCard, supplier: Store, loan: Landmark, person: User, other: Wallet };

/** Degradado de la tarjeta: reconoce Visa, Mastercard, Amex; si no, por tipo. */
export function cardTheme(account: PayableAccount): string {
  const name = account.name.toLowerCase();
  if (/visa/.test(name)) return 'linear-gradient(135deg, #1a1f71 0%, #2b5cd6 100%)';
  if (/master/.test(name)) return 'linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 55%, #eb5f1a 140%)';
  if (/amex|american/.test(name)) return 'linear-gradient(135deg, #0b6e8a 0%, #2fb3c9 100%)';
  if (/discover/.test(name)) return 'linear-gradient(135deg, #2a2a2a 0%, #f58220 160%)';
  if (/personal/.test(name)) return 'linear-gradient(135deg, #5b2bd1 0%, #a35cf0 100%)';
  switch (account.kind) {
    case 'card':
      return 'linear-gradient(135deg, #0a4f8c 0%, #0a72c2 100%)';
    case 'supplier':
      return 'linear-gradient(135deg, #0f5e45 0%, #22a06b 100%)';
    case 'loan':
      return 'linear-gradient(135deg, #3b4252 0%, #69758a 100%)';
    case 'person':
      return 'linear-gradient(135deg, #7a2e8c 0%, #c25bd6 100%)';
    default:
      return 'linear-gradient(135deg, #47505e 0%, #8e97a6 100%)';
  }
}

const SUGGESTED: { name: string; kind: PayableAccountKind }[] = [
  { name: 'Visa', kind: 'card' },
  { name: 'Mastercard', kind: 'card' },
  { name: 'Tarjeta personal Jaime', kind: 'card' },
  { name: 'Tarjeta personal Oscar', kind: 'card' },
];

function dueLabel(iso: string | null, today: string) {
  if (!iso) return null;
  if (iso < today) return `Venció ${relativeDay(iso, today)}`;
  return `Vence ${relativeDay(iso, today)}`;
}

/* ------------------------------------------------------------------ */
/* Pantalla principal                                                   */
/* ------------------------------------------------------------------ */

type Editing =
  | { kind: 'account'; account: PayableAccount | null }
  | { kind: 'charge'; payable: Payable | null; accountId?: number }
  | { kind: 'payment'; accountId?: number; payableId?: number }
  | null;

export function Payables({ action }: { action: string | null }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast } = useFeedback();
  const canEdit = a.canEdit('payables');
  const [editing, setEditing] = useState<Editing>(() => (canEdit && action === 'cargo' ? { kind: 'charge', payable: null } : canEdit && action === 'pago' ? { kind: 'payment' } : null));
  const [creating, setCreating] = useState<string | null>(null);

  const statuses = useMemo(() => accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today), [data]);
  const totals = payablesTotals(statuses);
  const active = statuses.filter((s) => s.account.active || s.balance > 0);
  const upcoming = statuses
    .flatMap((s) => s.items.filter((i) => i.remaining > 0).map((i) => ({ ...i, status: s })))
    .sort((x, y) => (x.payable.dueDate ?? '9999').localeCompare(y.payable.dueDate ?? '9999') || x.payable.date.localeCompare(y.payable.date));
  const month = data.today.slice(0, 7);
  const paidThisMonth = data.payablePayments.filter((p) => p.date.startsWith(month)).reduce((n, p) => n + p.amount, 0);
  const spentThisMonth = data.payables.filter((p) => p.date.startsWith(month)).reduce((n, p) => n + p.amount, 0);

  const quickCreate = async (name: string, kind: PayableAccountKind) => {
    setCreating(name);
    try {
      await api('/payable-accounts', { method: 'POST', body: { name, kind, last4: null, dueDay: null, creditLimit: null, notes: null, active: true } });
      await reload();
      toast(`${name} agregada`);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setCreating(null);
    }
  };
  const missingSuggestions = SUGGESTED.filter((s) => !data.payableAccounts.some((x) => x.name.toLowerCase() === s.name.toLowerCase()));

  return (
    <Page
      title="Cuentas por pagar"
      subtitle={totals.balance ? `Debes ${moneyRound(totals.balance)} en ${plural(totals.accountsWithDebt, 'cuenta', 'cuentas')}` : 'Todo al día'}
      headerAction={
        canEdit && data.payableAccounts.length > 0 ? (
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn small gray" onClick={() => setEditing({ kind: 'payment' })}>
              <CircleCheck size={17} /> <span className="add-label">Pagar</span>
            </button>
            <button type="button" className="btn small add-btn" onClick={() => setEditing({ kind: 'charge', payable: null })} aria-label="Agregar gasto">
              <Plus size={18} strokeWidth={2.5} /> <span className="add-label">Gasto</span>
            </button>
          </span>
        ) : undefined
      }
    >
      {data.payableAccounts.length === 0 ? (
        <div className="card onboarding">
          <span className="onboarding-icon"><CreditCard size={28} /></span>
          <h2>Empieza con tus tarjetas y proveedores</h2>
          <p className="muted">Cada cuenta lleva lo que se debe y lo que se ha pagado. El sistema te avisa lo vencido y lo que vence pronto.</p>
          {canEdit ? (
            <>
              <div className="suggest-chips">
                {SUGGESTED.map((s) => (
                  <button key={s.name} type="button" className="suggest-chip" disabled={creating != null} onClick={() => quickCreate(s.name, s.kind)}>
                    <Plus size={15} strokeWidth={2.6} /> {creating === s.name ? 'Creando…' : s.name}
                  </button>
                ))}
              </div>
              <button type="button" className="btn" onClick={() => setEditing({ kind: 'account', account: null })}>
                Otra cuenta (proveedor, préstamo…)
              </button>
            </>
          ) : (
            <p className="muted">Todavía no hay cuentas registradas.</p>
          )}
        </div>
      ) : (
        <>
          <div className="stats">
            <Stat
              hero
              label="Total por pagar"
              icon={<Wallet size={15} />}
              value={moneyFit(totals.balance)}
              note={`${totals.balance ? `${plural(totals.accountsWithDebt, 'cuenta', 'cuentas')} con saldo` : 'Nada pendiente'} · este mes: gastos ${moneyRound(spentThisMonth)}, pagos ${moneyRound(paidThisMonth)}`}
              privacy
            />
            <Stat
              label="Vencido"
              icon={<AlertTriangle size={15} />}
              iconColor="#e5484d"
              value={moneyFit(totals.overdue)}
              tone={totals.overdue ? 'red' : undefined}
              note={totals.overdue ? 'Págalo cuanto antes' : 'Nada vencido'}
            />
            <Stat
              label="Vence en 7 días"
              icon={<CalendarClock size={15} />}
              iconColor="#f08c00"
              value={moneyFit(totals.dueSoon)}
              tone={totals.dueSoon ? 'orange' : undefined}
              note={upcoming[0]?.payable.dueDate ? `Próximo: ${date(upcoming[0].payable.dueDate, data.today)}` : 'Sin fechas cercanas'}
            />
          </div>

          <Section
            title="Tus cuentas"
            action={canEdit && <button type="button" className="section-link link-btn" onClick={() => setEditing({ kind: 'account', account: null })}>Agregar</button>}
          >
            <div className="card-wallet">
              {active.map((status) => (
                <AccountCard key={status.account.id} status={status} />
              ))}
              {canEdit &&
                missingSuggestions.slice(0, 2).map((s) => (
                  <button key={s.name} type="button" className="wallet-add" disabled={creating != null} onClick={() => quickCreate(s.name, s.kind)}>
                    <Plus size={20} />
                    {creating === s.name ? 'Creando…' : s.name}
                  </button>
                ))}
            </div>
          </Section>

          <div className="grid-2" style={{ marginTop: 10 }}>
            <Section title="Por pagar">
              <Group>
                {upcoming.length === 0 ? (
                  <Empty inGroup icon={<CircleCheck size={28} />} title="Todo pagado" text="Cuando registres un gasto aparecerá aquí hasta que lo pagues." />
                ) : (
                  upcoming.slice(0, 8).map((item) => (
                    <ChargeRow key={item.payable.id} item={item} account={item.status.account} onOpen={() => (canEdit ? setEditing({ kind: 'charge', payable: item.payable }) : navigate(`/pagar/${item.status.account.id}`))} />
                  ))
                )}
              </Group>
            </Section>
            <Section title="Movimientos recientes">
              <RecentMoves />
            </Section>
          </div>
        </>
      )}

      <PayablesSheets editing={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

export function AccountCard({ status, large }: { status: AccountStatus; large?: boolean }) {
  const data = useData();
  const { account } = status;
  const Icon = KIND_ICON[account.kind];
  const content = (
    <>
      <span className="wallet-top">
        <span className="wallet-kind">
          <Icon size={16} /> {PAYABLE_KIND_LABEL[account.kind]}
        </span>
        {!account.active && <span className="wallet-off">Inactiva</span>}
      </span>
      <span className="wallet-name">{account.name}</span>
      <span className="wallet-balance">
        <span className="wallet-label">{status.credit > 0 ? 'A favor' : 'Saldo'}</span>
        <span className="wallet-amount num">{status.credit > 0 ? money(status.credit) : money(status.balance)}</span>
      </span>
      {status.usage != null && (
        <span className="wallet-usage" aria-label={`Uso del cupo ${Math.round(status.usage * 100)}%`}>
          <span style={{ width: `${Math.min(status.usage, 1) * 100}%` }} className={status.usage > 0.9 ? 'hot' : ''} />
        </span>
      )}
      <span className="wallet-foot">
        <span className="num">{account.last4 ? `•••• ${account.last4}` : account.creditLimit ? `Cupo ${moneyRound(account.creditLimit)}` : ' '}</span>
        <span className={status.overdue > 0 ? 'wallet-alert' : ''}>
          {status.overdue > 0 ? `Vencido ${moneyRound(status.overdue)}` : status.nextDue ? dueLabel(status.nextDue, data.today) : status.balance === 0 ? 'Al día' : ''}
        </span>
      </span>
    </>
  );
  if (large) return <div className="wallet-card large" style={{ background: cardTheme(account) }}>{content}</div>;
  return (
    <Link to={`/pagar/${account.id}`} className="wallet-card" style={{ background: cardTheme(account) }}>
      {content}
    </Link>
  );
}

function ChargeRow({ item, account, onOpen, showAccount = true }: { item: PayableStatus; account: PayableAccount; onOpen: () => void; showAccount?: boolean }) {
  const data = useData();
  const p = item.payable;
  return (
    <Row
      onClick={onOpen}
      leading={<IconBox icon={<Receipt size={16} />} color={item.overdue ? '#e5484d' : item.state === 'paid' ? '#1d9a46' : '#8e8e93'} />}
      title={p.description}
      subtitle={
        <>
          <span style={{ display: 'block' }}>
            {[showAccount ? account.name : null, date(p.date, data.today), p.category ? EXPENSE_CATEGORY_LABEL[p.category] : null].filter(Boolean).join(' · ')}
          </span>
          <span className="badges">
            {item.state === 'paid' ? (
              <Badge tone="green">Pagado</Badge>
            ) : item.overdue ? (
              <Badge tone="red">{dueLabel(p.dueDate, data.today)}</Badge>
            ) : p.dueDate ? (
              <Badge tone={item.dueSoon ? 'orange' : 'blue'}>{dueLabel(p.dueDate, data.today)}</Badge>
            ) : null}
            {item.state === 'partial' && <Badge tone="violet">Abonado {money(item.paid)}</Badge>}
          </span>
        </>
      }
      value={
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <b style={{ color: item.state === 'paid' ? 'var(--text-3)' : 'var(--text)' }}>{money(item.state === 'paid' ? p.amount : item.remaining)}</b>
          {item.state === 'partial' && <span className="faint" style={{ fontSize: 12.5 }}>de {money(p.amount)}</span>}
        </span>
      }
    />
  );
}

function RecentMoves() {
  const data = useData();
  const accountName = (id: number) => data.payableAccounts.find((a) => a.id === id)?.name ?? 'Cuenta';
  const moves = [
    ...data.payables.map((p) => ({ key: `c${p.id}`, date: p.date, at: p.createdAt, title: p.description, sub: accountName(p.accountId), amount: p.amount, kind: 'charge' as const, accountId: p.accountId })),
    ...data.payablePayments.map((p) => ({ key: `p${p.id}`, date: p.date, at: p.createdAt, title: `Pago${p.method ? ` · ${SERVICE_PAYMENT_LABEL[p.method]}` : ''}`, sub: accountName(p.accountId), amount: p.amount, kind: 'payment' as const, accountId: p.accountId })),
  ]
    .sort((x, y) => y.date.localeCompare(x.date) || y.at.localeCompare(x.at))
    .slice(0, 8);
  if (!moves.length) return <Group><Empty inGroup title="Sin movimientos" /></Group>;
  return (
    <Group>
      {moves.map((m) => (
        <Row
          key={m.key}
          to={`/pagar/${m.accountId}`}
          leading={<IconBox icon={m.kind === 'payment' ? <CircleCheck size={16} /> : <Receipt size={16} />} color={m.kind === 'payment' ? '#1d9a46' : '#e5484d'} />}
          title={m.title}
          subtitle={`${m.sub} · ${date(m.date, data.today)}`}
          value={<b className="num" style={{ color: m.kind === 'payment' ? 'var(--green)' : 'var(--text)' }}>{m.kind === 'payment' ? '−' : '+'} {money(m.amount)}</b>}
        />
      ))}
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Una cuenta                                                           */
/* ------------------------------------------------------------------ */

export function PayableAccountScreen({ id }: { id: number }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const canEdit = a.canEdit('payables');
  const [editing, setEditing] = useState<Editing>(null);
  const [tab, setTab] = useState<'pending' | 'all' | 'payments'>('pending');
  const status = useMemo(
    () => accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today).find((s) => s.account.id === id),
    [data, id]
  );
  if (!status) {
    return (
      <Page title="Cuenta" back={{ label: 'Por pagar', to: '/pagar' }} narrow>
        <Empty title="Esta cuenta no existe" />
      </Page>
    );
  }
  const { account } = status;
  const items = tab === 'pending' ? status.items.filter((i) => i.remaining > 0) : status.items;

  const removePayment = async (payment: PayablePayment) => {
    if (!(await confirm({ title: `¿Borrar el pago de ${money(payment.amount)}?`, message: `Del ${dateWithYear(payment.date)}. El saldo de la cuenta vuelve a subir.`, confirm: 'Borrar pago', danger: true }))) return;
    try {
      await api(`/payable-payments/${payment.id}`, { method: 'DELETE' });
      await reload();
      toast('Pago borrado');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page
      title={account.name}
      hideTitle
      back={{ label: 'Por pagar', to: '/pagar' }}
      actions={canEdit ? <button type="button" className="link-btn strong" onClick={() => setEditing({ kind: 'account', account })}>Editar</button> : undefined}
      narrow
    >
      <AccountCard status={status} large />

      {canEdit && (
        <div className="quick-actions two">
          <button type="button" className="quick-action" onClick={() => setEditing({ kind: 'payment', accountId: account.id })} disabled={status.balance === 0}>
            <CircleCheck size={22} />
            Registrar pago
          </button>
          <button type="button" className="quick-action" onClick={() => setEditing({ kind: 'charge', payable: null, accountId: account.id })}>
            <Plus size={22} />
            Nuevo gasto
          </button>
        </div>
      )}

      <div className="mini-stats">
        <div><span>Gastado</span><b className="num">{money(status.charged)}</b></div>
        <div><span>Pagado</span><b className="num" style={{ color: 'var(--green)' }}>{money(status.paid)}</b></div>
        <div><span>Vencido</span><b className="num" style={{ color: status.overdue ? 'var(--red)' : undefined }}>{money(status.overdue)}</b></div>
      </div>

      {(account.dueDay || account.notes) && (
        <Group>
          {account.dueDay && <Row title="Día de pago" value={`El ${account.dueDay} de cada mes`} />}
          {account.creditLimit != null && <Row title="Cupo" value={money(account.creditLimit)} />}
          {account.notes && <div className="row-block" style={{ whiteSpace: 'pre-wrap' }}>{account.notes}</div>}
        </Group>
      )}

      <div style={{ margin: '22px 0 12px' }}>
        <SegmentedRowless
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: `Por pagar (${status.items.filter((i) => i.remaining > 0).length})` },
            { value: 'all', label: 'Todos los gastos' },
            { value: 'payments', label: `Pagos (${status.payments.length})` },
          ]}
        />
      </div>

      {tab === 'payments' ? (
        <Group footer={canEdit && status.payments.length ? 'Toca un pago para borrarlo si fue un error.' : undefined}>
          {status.payments.length === 0 ? (
            <Empty inGroup title="Sin pagos todavía" />
          ) : (
            status.payments.map((p) => {
              const target = p.payableId ? data.payables.find((x) => x.id === p.payableId) : null;
              return (
                <Row
                  key={p.id}
                  onClick={canEdit ? () => removePayment(p) : undefined}
                  chevron={false}
                  leading={<IconBox icon={<CircleCheck size={16} />} color="#1d9a46" />}
                  title={`${dateWithYear(p.date)}${p.method ? ` · ${SERVICE_PAYMENT_LABEL[p.method]}` : ''}`}
                  subtitle={[target ? `A: ${target.description}` : 'Abono a la cuenta', p.notes, p.createdBy ? `por ${p.createdBy}` : null].filter(Boolean).join(' · ')}
                  value={<b className="num" style={{ color: 'var(--green)' }}>{money(p.amount)}</b>}
                />
              );
            })
          )}
        </Group>
      ) : (
        <Group>
          {items.length === 0 ? (
            <Empty inGroup icon={<CircleCheck size={28} />} title={tab === 'pending' ? 'Nada por pagar' : 'Sin gastos'} />
          ) : (
            items.map((item) => (
              <ChargeRow key={item.payable.id} item={item} account={account} showAccount={false} onOpen={() => (canEdit ? setEditing({ kind: 'charge', payable: item.payable }) : undefined)} />
            ))
          )}
        </Group>
      )}

      <PayablesSheets editing={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

function SegmentedRowless<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="pill-tabs" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formularios (hojas)                                                  */
/* ------------------------------------------------------------------ */

function PayablesSheets({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  return (
    <>
      <AccountSheet open={editing?.kind === 'account'} account={editing?.kind === 'account' ? editing.account : null} onClose={onClose} />
      <ChargeSheet open={editing?.kind === 'charge'} payable={editing?.kind === 'charge' ? editing.payable : null} accountId={editing?.kind === 'charge' ? editing.accountId : undefined} onClose={onClose} />
      <PaymentSheet open={editing?.kind === 'payment'} accountId={editing?.kind === 'payment' ? editing.accountId : undefined} payableId={editing?.kind === 'payment' ? editing.payableId : undefined} onClose={onClose} />
    </>
  );
}

function AccountSheet({ open, account, onClose }: { open: boolean; account: PayableAccount | null; onClose: () => void }) {
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const a = useAccess();
  const blank = { name: '', kind: 'card' as PayableAccountKind, last4: '', dueDay: '', creditLimit: null as number | null, notes: '', active: true };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      account
        ? { name: account.name, kind: account.kind, last4: account.last4 ?? '', dueDay: account.dueDay ? String(account.dueDay) : '', creditLimit: account.creditLimit, notes: account.notes ?? '', active: account.active }
        : blank
    );
  }, [open, account]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    const dueDay = form.dueDay.trim() ? Number(form.dueDay) : null;
    if (dueDay != null && !(Number.isInteger(dueDay) && dueDay >= 1 && dueDay <= 31)) return setError('El día de pago va del 1 al 31.');
    setBusy(true);
    try {
      const body = { name: form.name, kind: form.kind, last4: form.last4 || null, dueDay, creditLimit: form.creditLimit, notes: form.notes || null, active: form.active };
      const { account: saved } = await api<{ account: PayableAccount }>(account ? `/payable-accounts/${account.id}` : '/payable-accounts', { method: account ? 'PUT' : 'POST', body });
      await reload();
      toast(account ? 'Cuenta guardada' : 'Cuenta agregada');
      onClose();
      if (!account) navigate(`/pagar/${saved.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!account) return;
    if (!(await confirm({ title: `¿Borrar ${account.name}?`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/payable-accounts/${account.id}`, { method: 'DELETE' });
      await reload();
      toast('Cuenta borrada');
      onClose();
      navigate('/pagar', { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isCard = form.kind === 'card';
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={account ? 'Editar cuenta' : 'Nueva cuenta'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={() => save()} disabled={busy}>Guardar</button>}
    >
      <form onSubmit={save}>
        <Group>
          <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder={isCard ? 'Visa, Mastercard, Tarjeta personal…' : 'Nombre'} maxLength={80} autoFocus={!account} />
        </Group>
        <Group>
          <SegmentedRow
            title="Tipo"
            options={(Object.keys(PAYABLE_KIND_LABEL) as PayableAccountKind[]).map((k) => ({ value: k, label: k === 'card' ? 'Tarjeta' : PAYABLE_KIND_LABEL[k] }))}
            value={form.kind}
            onChange={(kind) => setForm({ ...form, kind })}
          />
          {isCard && <TextField label="Últimos 4 dígitos" inputMode="numeric" value={form.last4} onChange={(v) => setForm({ ...form, last4: v.replace(/\D/g, '').slice(0, 4) })} placeholder="Opcional" />}
          {(isCard || form.kind === 'loan') && (
            <TextField label="Día de pago" inputMode="numeric" value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v.replace(/\D/g, '').slice(0, 2) })} placeholder="1 a 31" />
          )}
          {(isCard || form.kind === 'loan') && (
            <MoneyField label={isCard ? 'Cupo' : 'Monto del préstamo'} value={form.creditLimit} onChange={(creditLimit) => setForm({ ...form, creditLimit })} placeholder="Opcional" />
          )}
        </Group>
        <Group>
          <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Banco, a nombre de quién, etc." multiline />
          {account && <SwitchRow label="Activa" subtitle="Inactiva: no aparece al registrar gastos" checked={form.active} onChange={(active) => setForm({ ...form, active })} />}
        </Group>
        {error && <p className="field-error">{error}</p>}
        {account && a.delete && (
          <div className="group" style={{ marginTop: 22 }}>
            <button type="button" className="row danger" onClick={remove}>Borrar cuenta</button>
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

function AccountPicker({ value, onChange, field = 'accountId' }: { value: number | null; onChange: (id: number | null) => void; field?: string }) {
  const data = useData();
  const [open, setOpen] = useState(false);
  const statuses = accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today);
  return (
    <>
      <PickerRow field={field} label="Cuenta" value={value ? data.payableAccounts.find((a) => a.id === value)?.name : null} onOpen={() => setOpen(true)} />
      <Picker
        open={open}
        onClose={() => setOpen(false)}
        title="Cuenta"
        options={statuses.map((s) => ({ id: s.account.id, label: s.account.name, sublabel: `${PAYABLE_KIND_LABEL[s.account.kind]} · saldo ${money(s.balance)}`, inactive: !s.account.active }))}
        value={value}
        onSelect={onChange}
      />
    </>
  );
}

function ChargeSheet({ open, payable, accountId, onClose }: { open: boolean; payable: Payable | null; accountId?: number; onClose: () => void }) {
  const data = useData();
  const a = useAccess();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const [form, setForm] = useState({ accountId: null as number | null, description: '', category: null as ExpenseCategory | null, amount: null as number | null, date: data.today, dueDate: '', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const fallback = accountId ?? (data.payableAccounts.filter((x) => x.active).length === 1 ? data.payableAccounts.find((x) => x.active)!.id : null);
    setForm(
      payable
        ? { accountId: payable.accountId, description: payable.description, category: payable.category, amount: payable.amount, date: payable.date, dueDate: payable.dueDate ?? '', notes: payable.notes ?? '' }
        : { accountId: fallback, description: '', category: null, amount: null, date: data.today, dueDate: '', notes: '' }
    );
  }, [open, payable, accountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError(null);
    if (!form.accountId) return setError('Elige la cuenta (la tarjeta o el proveedor).');
    if (!form.description.trim()) return setError('Escribe qué se compró o qué se debe.');
    if (!form.amount) return setError('Pon el monto.');
    setBusy(true);
    try {
      await api(payable ? `/payables/${payable.id}` : '/payables', {
        method: payable ? 'PUT' : 'POST',
        body: { ...form, dueDate: form.dueDate || null, notes: form.notes || null, ...(payable ? { expectedUpdatedAt: payable.updatedAt } : {}) },
      });
      await reload();
      toast(payable ? 'Gasto guardado' : 'Gasto registrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!payable) return;
    if (!(await confirm({ title: '¿Borrar este gasto?', message: 'Si tenía pagos, quedan como abonos a la cuenta.', confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/payables/${payable.id}`, { method: 'DELETE' });
      await reload();
      toast('Gasto borrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const status = payable ? accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today).flatMap((s) => s.items).find((i) => i.payable.id === payable.id) : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={payable ? 'Gasto' : 'Nuevo gasto'}
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save} disabled={busy}>Guardar</button>}
    >
      {status && status.state !== 'open' && (
        <div className={`banner ${status.state === 'paid' ? 'green' : 'blue'}`}>
          <CircleCheck size={20} />
          <div>
            <div className="banner-title">{status.state === 'paid' ? 'Pagado completo' : `Abonado ${money(status.paid)} · faltan ${money(status.remaining)}`}</div>
          </div>
        </div>
      )}
      <Group>
        <AccountPicker value={form.accountId} onChange={(id) => setForm({ ...form, accountId: id })} />
        <TextField field="description" label="Qué es" value={form.description} onChange={(description) => setForm({ ...form, description })} placeholder="Membranas, gasolina, factura #123…" maxLength={200} />
        <MoneyField field="amount" label="Monto" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
      </Group>
      <div className="group-label">Categoría</div>
      <div className="chip-grid">
        {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map((k) => (
          <button key={k} type="button" className={`chip-choice${form.category === k ? ' on' : ''}`} aria-pressed={form.category === k} onClick={() => setForm({ ...form, category: form.category === k ? null : k })}>
            {EXPENSE_CATEGORY_LABEL[k]}
          </button>
        ))}
      </div>
      <Group footer="El vencimiento es opcional: con él, el sistema te avisa antes de que se pase.">
        <DateField field="date" label="Fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v || data.today })} />
        <DateField field="dueDate" label="Vence" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} min={form.date} quick="future" />
      </Group>
      <Group>
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Opcional" multiline />
      </Group>
      {error && <p className="field-error">{error}</p>}
      {payable && status && status.remaining > 0 && (
        <div style={{ marginTop: 16 }}>
          <PayNowButton payable={payable} remaining={status.remaining} onDone={onClose} />
        </div>
      )}
      {payable && a.delete && (
        <div className="group" style={{ marginTop: 18 }}>
          <button type="button" className="row danger" onClick={remove}>Borrar gasto</button>
        </div>
      )}
      {payable?.createdBy && <p className="group-foot" style={{ textAlign: 'center' }}>Registrado por {payable.createdBy}</p>}
    </Sheet>
  );
}

/** Pagar un gasto completo de un toque (con fecha de hoy). */
function PayNowButton({ payable, remaining, onDone }: { payable: Payable; remaining: number; onDone: () => void }) {
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const data = useData();
  const pay = async () => {
    if (!(await confirm({ title: `¿Pagar ${money(remaining)}?`, message: `${payable.description} · con fecha de hoy`, confirm: 'Registrar pago' }))) return;
    try {
      await api('/payable-payments', { method: 'POST', body: { accountId: payable.accountId, payableId: payable.id, date: data.today, amount: remaining, method: null, notes: null } });
      await reload();
      toast('Pago registrado');
      onDone();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };
  return (
    <button type="button" className="btn success block" onClick={pay}>
      <CircleCheck size={18} /> Marcar pagado · {money(remaining)}
    </button>
  );
}

function PaymentSheet({ open, accountId, payableId, onClose }: { open: boolean; accountId?: number; payableId?: number; onClose: () => void }) {
  const data = useData();
  const { reload } = useStore();
  const { toast } = useFeedback();
  const [form, setForm] = useState({ accountId: null as number | null, payableId: null as number | null, amount: null as number | null, date: data.today, method: null as ServicePayment | null, notes: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const statuses = useMemo(() => accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today), [data]);
  const status = statuses.find((s) => s.account.id === form.accountId);
  const pending = status?.items.filter((i) => i.remaining > 0) ?? [];

  useEffect(() => {
    if (!open) return;
    setError(null);
    const s = statuses.find((x) => x.account.id === accountId);
    const target = payableId ? s?.items.find((i) => i.payable.id === payableId) : undefined;
    setForm({ accountId: accountId ?? null, payableId: payableId ?? null, amount: target ? target.remaining : s ? s.balance || null : null, date: data.today, method: null, notes: '' });
  }, [open, accountId, payableId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError(null);
    if (!form.accountId) return setError('Elige a qué cuenta le pagas.');
    if (!form.amount) return setError('Pon cuánto pagaste.');
    setBusy(true);
    try {
      await api('/payable-payments', { method: 'POST', body: { ...form, notes: form.notes || null } });
      await reload();
      toast('Pago registrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const target = pending.find((i) => i.payable.id === form.payableId);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Registrar pago"
      left={<button type="button" className="link-btn" onClick={onClose}>Cancelar</button>}
      right={<button type="button" className="link-btn strong" onClick={save} disabled={busy}>Guardar</button>}
    >
      <Group footer={status ? `Saldo de ${status.account.name}: ${money(status.balance)}${status.overdue ? ` · vencido ${money(status.overdue)}` : ''}` : undefined}>
        <AccountPicker value={form.accountId} onChange={(id) => { const s = statuses.find((x) => x.account.id === id); setForm({ ...form, accountId: id, payableId: null, amount: s?.balance || null }); }} />
        <MoneyField field="amount" label="Cuánto pagaste" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
      </Group>
      {status && status.balance > 0 && (
        <div className="amount-chips">
          <button type="button" onClick={() => setForm({ ...form, payableId: null, amount: status.balance })}>Todo · {money(status.balance)}</button>
          {status.overdue > 0 && status.overdue !== status.balance && <button type="button" onClick={() => setForm({ ...form, payableId: null, amount: status.overdue })}>Lo vencido · {money(status.overdue)}</button>}
        </div>
      )}
      {pending.length > 0 && (
        <Group footer="Si no eliges un gasto, el pago se aplica a lo más antiguo primero.">
          <PickerRow label="Para" value={target ? `${target.payable.description} (${money(target.remaining)})` : null} placeholder="Saldo de la cuenta" onOpen={() => setChargeOpen(true)} />
        </Group>
      )}
      <Picker
        open={chargeOpen}
        onClose={() => setChargeOpen(false)}
        title="¿Qué gasto pagas?"
        options={pending.map((i) => ({ id: i.payable.id, label: i.payable.description, sublabel: `${money(i.remaining)} · ${date(i.payable.date, data.today)}${i.payable.dueDate ? ` · vence ${date(i.payable.dueDate, data.today)}` : ''}` }))}
        value={form.payableId}
        onSelect={(id) => { const i = pending.find((x) => x.payable.id === id); setForm({ ...form, payableId: id, amount: i ? i.remaining : form.amount }); }}
        allowNone="Saldo de la cuenta"
      />
      <div className="group-label">Cómo pagaste</div>
      <div className="pay-methods" role="group" aria-label="Medio de pago" style={{ marginBottom: 18 }}>
        {(Object.keys(SERVICE_PAYMENT_LABEL) as ServicePayment[]).map((k) => (
          <button key={k} type="button" className={`pay-method${form.method === k ? ' on' : ''}`} aria-pressed={form.method === k} onClick={() => setForm({ ...form, method: form.method === k ? null : k })}>
            {SERVICE_PAYMENT_LABEL[k]}
          </button>
        ))}
      </div>
      <Group>
        <DateField label="Fecha del pago" value={form.date} onChange={(v) => setForm({ ...form, date: v || data.today })} max={data.today} />
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Confirmación, desde qué cuenta…" multiline />
      </Group>
      {error && <p className="field-error">{error}</p>}
    </Sheet>
  );
}
