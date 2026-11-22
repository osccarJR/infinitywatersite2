/**
 * Calculos de cuentas por pagar e inventario (en la app, al instante).
 *
 * Cuentas por pagar: cada pago se aplica primero al cargo que se eligio;
 * los abonos generales (p. ej. "pague 500 a la Visa") pagan los cargos mas
 * antiguos primero, como hace el banco.
 */
import type { InventoryItem, InventoryMovement, Payable, PayableAccount, PayablePayment } from '../../../shared/domain.ts';
import { addDaysISO, movementDelta } from '../../../shared/domain.ts';

export interface PayableStatus {
  payable: Payable;
  paid: number;
  remaining: number;
  state: 'paid' | 'partial' | 'open';
  overdue: boolean;
  /** Vence en los proximos 7 dias. */
  dueSoon: boolean;
}

export interface AccountStatus {
  account: PayableAccount;
  charged: number;
  paid: number;
  /** Lo que se debe hoy (nunca negativo: si se pago de mas, queda a favor). */
  balance: number;
  /** Pagado de mas: saldo a favor. */
  credit: number;
  overdue: number;
  dueSoon: number;
  /** Proxima fecha de pago: el cargo pendiente que vence antes o el dia de pago de la tarjeta. */
  nextDue: string | null;
  items: PayableStatus[];
  payments: PayablePayment[];
  /** Uso del cupo (tarjetas): 0..1, o null si no tiene cupo. */
  usage: number | null;
}

/** Siguiente fecha (hoy o despues) con ese dia del mes. */
export function nextDayOfMonth(day: number, today: string): string {
  const [y, m] = today.split('-').map(Number);
  for (let i = 0; i < 3; i++) {
    const year = y + Math.floor((m - 1 + i) / 12);
    const month = ((m - 1 + i) % 12) + 1;
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, last)).padStart(2, '0')}`;
    if (iso >= today) return iso;
  }
  return today;
}

export function accountStatuses(accounts: PayableAccount[], payables: Payable[], payments: PayablePayment[], today: string): AccountStatus[] {
  const soon = addDaysISO(today, 7);
  return accounts.map((account) => {
    const mine = payables.filter((p) => p.accountId === account.id).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    const myPayments = payments.filter((p) => p.accountId === account.id);
    const paidTo = new Map<number, number>(mine.map((p) => [p.id, 0]));
    let pool = 0;
    for (const payment of myPayments) {
      if (payment.payableId != null && paidTo.has(payment.payableId)) {
        const target = mine.find((p) => p.id === payment.payableId)!;
        const room = target.amount - paidTo.get(target.id)!;
        const applied = Math.min(room, payment.amount);
        paidTo.set(target.id, paidTo.get(target.id)! + applied);
        pool += payment.amount - applied;
      } else pool += payment.amount;
    }
    // Abonos generales: a lo que vence antes (o lo mas antiguo).
    const order = [...mine].sort((a, b) => (a.dueDate ?? a.date).localeCompare(b.dueDate ?? b.date) || a.id - b.id);
    for (const p of order) {
      if (pool <= 0) break;
      const room = p.amount - paidTo.get(p.id)!;
      const applied = Math.min(room, pool);
      paidTo.set(p.id, paidTo.get(p.id)! + applied);
      pool -= applied;
    }
    const items: PayableStatus[] = mine
      .map((payable) => {
        const paid = paidTo.get(payable.id)!;
        const remaining = payable.amount - paid;
        return {
          payable,
          paid,
          remaining,
          state: remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'open',
          overdue: remaining > 0 && payable.dueDate != null && payable.dueDate < today,
          dueSoon: remaining > 0 && payable.dueDate != null && payable.dueDate >= today && payable.dueDate <= soon,
        } satisfies PayableStatus;
      })
      .reverse();
    const charged = mine.reduce((n, p) => n + p.amount, 0);
    const paid = myPayments.reduce((n, p) => n + p.amount, 0);
    const balance = Math.max(charged - paid, 0);
    const pendingDues = items.filter((i) => i.remaining > 0 && i.payable.dueDate).map((i) => i.payable.dueDate!).sort();
    const cardDue = account.dueDay && balance > 0 ? nextDayOfMonth(account.dueDay, today) : null;
    const nextDue = [pendingDues[0], cardDue].filter(Boolean).sort()[0] ?? null;
    return {
      account,
      charged,
      paid,
      balance,
      credit: Math.max(paid - charged, 0),
      overdue: items.filter((i) => i.overdue).reduce((n, i) => n + i.remaining, 0),
      dueSoon: items.filter((i) => i.dueSoon).reduce((n, i) => n + i.remaining, 0) + (cardDue && cardDue <= soon && !pendingDues.length ? balance : 0),
      nextDue,
      items,
      payments: myPayments,
      usage: account.creditLimit ? Math.min(balance / account.creditLimit, 1.5) : null,
    };
  });
}

export function payablesTotals(statuses: AccountStatus[]) {
  return {
    balance: statuses.reduce((n, s) => n + s.balance, 0),
    overdue: statuses.reduce((n, s) => n + s.overdue, 0),
    dueSoon: statuses.reduce((n, s) => n + s.dueSoon, 0),
    accountsWithDebt: statuses.filter((s) => s.balance > 0).length,
  };
}

/* ------------------------------------------------------------------ */
/* Inventario                                                           */
/* ------------------------------------------------------------------ */

export interface ItemStock {
  item: InventoryItem;
  stock: number;
  /** Existencia por su costo (null si no se sabe el costo). */
  value: number | null;
  low: boolean;
  out: boolean;
  movements: InventoryMovement[];
  lastMovement: string | null;
}

export function stockLevels(items: InventoryItem[], movements: InventoryMovement[]): ItemStock[] {
  const byItem = new Map<number, InventoryMovement[]>();
  for (const m of movements) {
    const list = byItem.get(m.itemId);
    if (list) list.push(m);
    else byItem.set(m.itemId, [m]);
  }
  return items.map((item) => {
    const list = byItem.get(item.id) ?? [];
    const stock = list.reduce((n, m) => n + movementDelta(m), 0);
    return {
      item,
      stock,
      value: item.cost == null ? null : stock * item.cost,
      low: item.active && stock <= item.minStock && item.minStock > 0,
      out: item.active && stock <= 0,
      movements: list,
      lastMovement: list[0]?.date ?? null,
    };
  });
}
