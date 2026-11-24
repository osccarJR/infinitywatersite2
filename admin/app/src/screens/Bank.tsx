/**
 * Caja y bancos: cada cuenta (Caja, un banco...) con su saldo inicial y sus
 * ingresos (+, azul) y egresos (−, rojo), como un estado de cuenta, con el
 * saldo despues de cada movimiento.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus } from 'lucide-react';
import type { BankAccount, BankMovement } from '../../../shared/domain.ts';
import { bankBalance } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { api } from '../lib/api.ts';
import { navigate } from '../lib/router.tsx';
import { dateWithYear, money, monthLabel } from '../lib/format.ts';
import { Empty, Group, MoneyField, Page, Row, SegmentedRow, StackField, SwitchRow, TextField } from '../ui/kit.tsx';
import { DateField } from '../ui/date.tsx';
import { Sheet, useFeedback } from '../ui/sheet.tsx';

type BankData = { bankAccounts: BankAccount[]; bankMovements: BankMovement[] };

const signed = (m: Pick<BankMovement, 'kind' | 'amount'>) => (m.kind === 'in' ? `+ ${money(m.amount)}` : `− ${money(m.amount)}`);

/* ------------------------------------------------------------------ */
/* Lista de cuentas                                                     */
/* ------------------------------------------------------------------ */

export function BankScreen() {
  const data = useData();
  const [editing, setEditing] = useState<BankAccount | 'new' | null>(null);
  const accounts = data.bankAccounts;
  const total = accounts.filter((a) => a.active).reduce((n, a) => n + bankBalance(a, data.bankMovements), 0);
  return (
    <Page
      title="Caja y bancos"
      subtitle={accounts.length ? `Saldo total ${money(total)}` : 'Tu estado de cuenta: lo que entra y lo que sale'}
      headerAction={
        <button type="button" className="btn small" onClick={() => setEditing('new')}>
          <Plus size={18} /> Cuenta
        </button>
      }
    >
      {accounts.length === 0 ? (
        <Empty
          icon={<Landmark size={40} />}
          title="Todavía no hay cuentas"
          text="Crea la caja o tu cuenta de banco con el saldo de hoy (por ejemplo $5,000). Después registras cada ingreso y cada egreso."
          action={
            <button type="button" className="btn" onClick={() => setEditing('new')}>
              <Plus size={18} /> Crear cuenta
            </button>
          }
        />
      ) : (
        <Group>
          {accounts.map((a) => {
            const balance = bankBalance(a, data.bankMovements);
            const last = data.bankMovements.find((m) => m.accountId === a.id);
            return (
              <Row
                key={a.id}
                to={`/caja/${a.id}`}
                leading={<span className="bank-icon"><Landmark size={18} /></span>}
                title={a.name + (a.active ? '' : ' (inactiva)')}
                subtitle={last ? `Último: ${last.description} · ${dateWithYear(last.date)}` : `Saldo inicial del ${dateWithYear(a.openingDate)}`}
                value={<b className={balance < 0 ? 'bank-out' : ''}>{money(balance)}</b>}
              />
            );
          })}
        </Group>
      )}
      <AccountSheet account={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Estado de cuenta                                                     */
/* ------------------------------------------------------------------ */

export function BankAccountScreen({ id }: { id: number }) {
  const data = useData();
  const account = data.bankAccounts.find((a) => a.id === id);
  const [moving, setMoving] = useState<{ kind: 'in' | 'out'; movement?: BankMovement } | null>(null);
  const [editing, setEditing] = useState<BankAccount | null>(null);

  // Movimientos de la cuenta, del mas nuevo al mas viejo, con el saldo despues de cada uno.
  const rows = useMemo(() => {
    if (!account) return [];
    const list = data.bankMovements.filter((m) => m.accountId === id).slice().sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    let running = account.openingBalance;
    const withBalance = list.map((m) => {
      running += m.kind === 'in' ? m.amount : -m.amount;
      return { m, after: running };
    });
    return withBalance.reverse();
  }, [data.bankMovements, account, id]);

  if (!account) {
    return (
      <Page title="Cuenta" back={{ label: 'Caja y bancos', to: '/caja' }}>
        <Empty title="Esta cuenta no existe" />
      </Page>
    );
  }

  const balance = bankBalance(account, data.bankMovements);
  const totals = rows.reduce((t, { m }) => (m.kind === 'in' ? { ...t, in: t.in + m.amount } : { ...t, out: t.out + m.amount }), { in: 0, out: 0 });
  // Agrupados por mes (del mas nuevo al mas viejo).
  const months: [string, typeof rows][] = [];
  for (const r of rows) {
    const key = r.m.date.slice(0, 7);
    const last = months[months.length - 1];
    if (last && last[0] === key) last[1].push(r);
    else months.push([key, [r]]);
  }

  return (
    <Page title={account.name} back={{ label: 'Caja y bancos', to: '/caja' }} narrow>
      <div className="bank-balance">
        <span>Saldo</span>
        <b className={balance < 0 ? 'bank-out' : ''}>{money(balance)}</b>
        <small>
          Inicial {money(account.openingBalance)} · <span className="bank-in">+ {money(totals.in)}</span> · <span className="bank-out">− {money(totals.out)}</span>
        </small>
      </div>
      <div className="bank-actions">
        <button type="button" className="btn bank-btn-in" onClick={() => setMoving({ kind: 'in' })}>
          <ArrowDownLeft size={19} /> Ingreso
        </button>
        <button type="button" className="btn bank-btn-out" onClick={() => setMoving({ kind: 'out' })}>
          <ArrowUpRight size={19} /> Egreso
        </button>
      </div>

      {rows.length === 0 && <Empty title="Sin movimientos todavía" text="Toca Ingreso o Egreso para registrar lo que entra y lo que sale." />}
      {months.map(([month, list]) => (
        <div key={month}>
          <div className="group-label">{monthLabel(`${month}-01`)}</div>
          <Group>
            {list.map(({ m, after }) => (
              <Row
                key={m.id}
                onClick={() => setMoving({ kind: m.kind, movement: m })}
                title={m.description}
                subtitle={`${dateWithYear(m.date)} · saldo ${money(after)}${m.notes ? ` · ${m.notes}` : ''}`}
                value={<b className={m.kind === 'in' ? 'bank-in' : 'bank-out'}>{signed(m)}</b>}
                chevron={false}
              />
            ))}
          </Group>
        </div>
      ))}
      <div className="group-label">Inicio</div>
      <Group>
        <Row title="Saldo inicial" subtitle={dateWithYear(account.openingDate)} value={<b>{money(account.openingBalance)}</b>} onClick={() => setEditing(account)} chevron={false} />
      </Group>
      <Group>
        <Row title="Cambiar nombre o saldo inicial" onClick={() => setEditing(account)} />
      </Group>

      <MovementSheet account={account} state={moving} onClose={() => setMoving(null)} />
      <AccountSheet account={editing} onClose={() => setEditing(null)} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Hojas                                                                */
/* ------------------------------------------------------------------ */

function AccountSheet({ account, onClose }: { account: BankAccount | 'new' | null; onClose: () => void }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const a = useAccess();
  const [form, setForm] = useState({ name: '', openingBalance: null as number | null, openingDate: data.today, notes: '', active: true });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isNew = account === 'new';

  useEffect(() => {
    if (!account) return;
    setError(null);
    setForm(
      account === 'new'
        ? { name: '', openingBalance: null, openingDate: data.today, notes: '', active: true }
        : { name: account.name, openingBalance: account.openingBalance, openingDate: account.openingDate, notes: account.notes ?? '', active: account.active }
    );
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError(null);
    if (!form.name.trim()) return setError('Escribe el nombre de la cuenta (ej. Caja, Bank of America).');
    setBusy(true);
    try {
      const body = { ...form, name: form.name.trim(), openingBalance: form.openingBalance ?? 0, notes: form.notes || null };
      const r = await api<BankData>(isNew ? '/bank-accounts' : `/bank-accounts/${(account as BankAccount).id}`, { method: isNew ? 'POST' : 'PUT', body });
      await reload();
      toast(isNew ? 'Cuenta creada' : 'Guardado');
      onClose();
      if (isNew) {
        const created = r.bankAccounts.find((x) => x.name.toLowerCase() === body.name.toLowerCase());
        if (created) navigate(`/caja/${created.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (account === 'new' || !account) return;
    const count = data.bankMovements.filter((m) => m.accountId === account.id).length;
    if (!(await confirm({ title: `¿Borrar ${account.name}?`, message: `Se borran también sus ${count} movimientos. No se puede deshacer. Si ya no la usas, mejor desactívala.`, confirm: 'Borrar cuenta', danger: true }))) return;
    try {
      await api(`/bank-accounts/${account.id}`, { method: 'DELETE' });
      await reload();
      toast('Cuenta borrada');
      onClose();
      navigate('/caja', { replace: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Sheet open={account != null} onClose={onClose} title={isNew ? 'Nueva cuenta' : 'Cuenta'} onSubmit={save} submitLabel={isNew ? 'Crear cuenta' : 'Guardar'} busy={busy} error={error} guard>
      <Group footer="El saldo con el que empiezas (lo que hay hoy en la caja o el banco). Desde ahí se suman los ingresos y se restan los egresos.">
        <TextField label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Caja, Bank of America…" maxLength={80} autoComplete="off" autoCapitalize="words" />
        <MoneyField label="Saldo inicial" value={form.openingBalance} onChange={(openingBalance) => setForm({ ...form, openingBalance })} />
        <DateField required label="Desde" value={form.openingDate} onChange={(v) => setForm({ ...form, openingDate: v || data.today })} />
      </Group>
      <Group>
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Opcional" multiline />
        {!isNew && <SwitchRow label="Activa" checked={form.active} onChange={(active) => setForm({ ...form, active })} />}
      </Group>
      {!isNew && a.owner && (
        <div className="group" style={{ marginTop: 10 }}>
          <button type="button" className="row danger" onClick={remove}>
            Borrar cuenta
          </button>
        </div>
      )}
    </Sheet>
  );
}

function MovementSheet({ account, state, onClose }: { account: BankAccount; state: { kind: 'in' | 'out'; movement?: BankMovement } | null; onClose: () => void }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const a = useAccess();
  const [form, setForm] = useState({ kind: 'in' as 'in' | 'out', amount: null as number | null, date: data.today, description: '', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = state?.movement;

  useEffect(() => {
    if (!state) return;
    setError(null);
    const m = state.movement;
    setForm(m ? { kind: m.kind, amount: m.amount, date: m.date, description: m.description, notes: m.notes ?? '' } : { kind: state.kind, amount: null, date: data.today, description: '', notes: '' });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setError(null);
    if (!form.amount) return setError('Pon el monto.');
    if (!form.description.trim()) return setError('Escribe de qué es (ej. Depósito venta Juan, Pago tarjeta Visa).');
    setBusy(true);
    try {
      const body = { accountId: account.id, kind: form.kind, amount: form.amount, date: form.date, description: form.description.trim(), notes: form.notes || null };
      await api(editing ? `/bank-movements/${editing.id}` : '/bank-movements', { method: editing ? 'PUT' : 'POST', body });
      await reload();
      toast(form.kind === 'in' ? 'Ingreso registrado' : 'Egreso registrado');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    if (!(await confirm({ title: '¿Borrar este movimiento?', message: `${editing.description} · ${signed(editing)}`, confirm: 'Borrar', danger: true }))) return;
    try {
      await api(`/bank-movements/${editing.id}`, { method: 'DELETE' });
      await reload();
      toast('Movimiento borrado');
      onClose();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const isIn = form.kind === 'in';
  return (
    <Sheet open={state != null} onClose={onClose} title={editing ? 'Movimiento' : isIn ? 'Ingreso' : 'Egreso'} onSubmit={save} submitLabel={isIn ? 'Guardar ingreso' : 'Guardar egreso'} busy={busy} error={error} guard>
      <Group footer={account.name}>
        <SegmentedRow
          title="Tipo"
          options={[
            { value: 'in', label: '+ Ingreso' },
            { value: 'out', label: '− Egreso' },
          ]}
          value={form.kind}
          onChange={(kind) => setForm({ ...form, kind })}
        />
        <MoneyField label={isIn ? 'Cuánto entró' : 'Cuánto salió'} value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
        <DateField required label="Fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v || data.today })} />
        <TextField label="De qué es" value={form.description} onChange={(description) => setForm({ ...form, description })} placeholder={isIn ? 'Depósito venta, cobro…' : 'Pago tarjeta, gasolina…'} maxLength={200} autoComplete="off" />
      </Group>
      <Group>
        <StackField label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder="Opcional: referencia, cheque…" multiline />
      </Group>
      {editing && a.owner && (
        <div className="group" style={{ marginTop: 10 }}>
          <button type="button" className="row danger" onClick={remove}>
            Borrar movimiento
          </button>
        </div>
      )}
    </Sheet>
  );
}
