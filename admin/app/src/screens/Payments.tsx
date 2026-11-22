/**
 * Pagos: lo que hay que pagar (comisiones, por vendedor) y lo que hay que
 * cobrar (financieras y clientes). Las financieras pagan varias ventas
 * juntas y las comisiones se pagan por vendedor: aqui se marcan de una vez.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { CircleCheck, HandCoins, Landmark } from 'lucide-react';
import type { Sale, Service } from '../../../shared/domain.ts';
import { isActiveSale, saleMoney } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { date, daysBetween, money, plural, moneyPlain } from '../lib/format.ts';
import { technicianDebts } from '../lib/stats.ts';
import { Avatar, Badge, Empty, Group, IconBox, Page, Row, Chips } from '../ui/kit.tsx';
import { useAccess } from '../lib/access.ts';
import { DateField } from '../ui/date.tsx';
import { useFeedback } from '../ui/sheet.tsx';

type Tab = 'comisiones' | 'tecnicos' | 'financieras' | 'clientes';

export function Payments({ initialTab }: { initialTab: string | null }) {
  const data = useData();
  const a = useAccess();
  // Cada pestana solo con el monto que muestra.
  const tabs = (
    [
      ['comisiones', a.can('money.commissions')],
      ['tecnicos', a.can('money.techpay')],
      ['financieras', a.can('money.financier')],
      ['clientes', a.prices],
    ] as [Tab, boolean][]
  )
    .filter(([, ok]) => ok)
    .map(([t]) => t);
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab as Tab) ? (initialTab as Tab) : tabs[0] ?? 'clientes');
  const [payDate, setPayDate] = useState(data.today);
  const canPay = (tab === 'comisiones' && a.can('payments.commissions')) || (tab === 'tecnicos' && a.can('payments.technicians')) || (tab === 'financieras' && a.can('payments.financiers'));

  const commissionGroups = useMemo(() => {
    const map = new Map<number | null, Sale[]>();
    for (const sale of data.sales.filter(isActiveSale)) {
      if ((sale.commission ?? 0) > 0 && !sale.commissionPaid) {
        const list = map.get(sale.sellerId) ?? [];
        list.push(sale);
        map.set(sale.sellerId, list);
      }
    }
    return [...map.entries()].sort((a, b) => sum(b[1], (s) => s.commission ?? 0) - sum(a[1], (s) => s.commission ?? 0));
  }, [data.sales]);

  const financierGroups = useMemo(() => {
    const map = new Map<number | null, Sale[]>();
    for (const sale of data.sales.filter(isActiveSale)) {
      if (saleMoney(sale).pendingFinancier > 0) {
        const list = map.get(sale.financierId) ?? [];
        list.push(sale);
        map.set(sale.financierId, list);
      }
    }
    for (const list of map.values()) list.sort((a, b) => waitingSince(a).localeCompare(waitingSince(b)));
    return [...map.entries()].sort((a, b) => sum(b[1], (s) => saleMoney(s).pendingFinancier) - sum(a[1], (s) => saleMoney(s).pendingFinancier));
  }, [data.sales]);

  const clientDebts = useMemo(
    () => data.sales.filter((s) => isActiveSale(s) && saleMoney(s).pendingClient > 0).sort((a, b) => a.saleDate.localeCompare(b.saleDate)),
    [data.sales]
  );

  const techGroups = useMemo(() => [...technicianDebts(data.sales, data.services).entries()].sort((a, b) => b[1].total - a[1].total), [data]);

  const counts = {
    tecnicos: techGroups.reduce((n, [, e]) => n + e.sales.length + e.services.length, 0),
    comisiones: commissionGroups.reduce((n, [, list]) => n + list.length, 0),
    financieras: financierGroups.reduce((n, [, list]) => n + list.length, 0),
    clientes: clientDebts.length,
  };

  return (
    <Page title="Pagos" subtitle="Lo que debes pagar y lo que te deben" narrow>
      <div style={{ marginBottom: 16 }}>
        <Chips<Tab>
          options={(
            [
              { key: 'comisiones', label: 'Comisiones', count: counts.comisiones || undefined },
              { key: 'tecnicos', label: 'Técnicos', count: counts.tecnicos || undefined },
              { key: 'financieras', label: 'Financieras', count: counts.financieras || undefined },
              { key: 'clientes', label: 'Clientes', count: counts.clientes || undefined },
            ] as { key: Tab; label: string; count?: number }[]
          ).filter((o) => tabs.includes(o.key))}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab !== 'clientes' && canPay && (
        <Group footer="Se usa al marcar como pagado.">
          <DateField required label="Fecha del pago" value={payDate} onChange={(v) => setPayDate(v || data.today)} max={data.today} />
        </Group>
      )}

      {tab === 'comisiones' &&
        (commissionGroups.length === 0 ? (
          <Empty icon={<CircleCheck size={40} />} title="Todas las comisiones están pagadas" />
        ) : (
          commissionGroups.map(([sellerId, sales]) => (
            <PayGroup
              key={sellerId ?? 0}
              title={sellerId ? data.personById.get(sellerId)?.name ?? 'Vendedor' : 'Sin vendedor'}
              leading={<Avatar name={sellerId ? data.personById.get(sellerId)?.name ?? '?' : '?'} />}
              sales={sales}
              amount={(s) => s.commission ?? 0}
              field="commissionPaid"
              action="Marcar pagadas"
              done="Comisiones marcadas como pagadas"
              payDate={payDate}
            />
          ))
        ))}

      {tab === 'tecnicos' &&
        (techGroups.length === 0 ? (
          <Empty icon={<CircleCheck size={40} />} title="No se le debe nada a los técnicos" text="Aquí aparece lo que se les paga por instalaciones y servicios." />
        ) : (
          techGroups.map(([personId, debt]) => <TechGroup key={personId} personId={personId} debt={debt} payDate={payDate} />)
        ))}

      {tab === 'financieras' &&
        (financierGroups.length === 0 ? (
          <Empty icon={<CircleCheck size={40} />} title="Las financieras ya pagaron todo" />
        ) : (
          financierGroups.map(([financierId, sales]) => (
            <PayGroup
              key={financierId ?? 0}
              title={financierId ? data.financierById.get(financierId)?.name ?? 'Financiera' : 'Sin financiera'}
              leading={<IconBox icon={<Landmark size={17} />} color="#5856d6" />}
              sales={sales}
              amount={(s) => saleMoney(s).pendingFinancier}
              field="fundedPaid"
              action="Marcar recibidos"
              done="Pagos de la financiera registrados"
              payDate={payDate}
              showWaiting
            />
          ))
        ))}

      {tab === 'clientes' &&
        (clientDebts.length === 0 ? (
          <Empty icon={<HandCoins size={40} />} title="Ningún cliente debe" text="Las ventas en cash con saldo pendiente aparecen aquí." />
        ) : (
          <Group footer="Para registrar lo que pagó, abre la venta y actualiza lo cobrado.">
            {clientDebts.map((sale) => {
              const client = data.clientById.get(sale.clientId);
              return (
                <Row
                  key={sale.id}
                  to={`/ventas/${sale.id}`}
                  leading={<Avatar name={client?.name ?? '?'} />}
                  title={client?.name}
                  subtitle={`Venta del ${date(sale.saleDate, data.today)}`}
                  value={<span className="orange">{money(saleMoney(sale).pendingClient)}</span>}
                />
              );
            })}
          </Group>
        ))}
    </Page>
  );
}

const sum = (list: Sale[], fn: (s: Sale) => number) => list.reduce((n, s) => n + fn(s), 0);
const waitingSince = (s: Sale) => s.installDate ?? s.saleDate;

/** Un tecnico: sus instalaciones y servicios sin pagar, con casillas, y un solo pago. */
function TechGroup({ personId, debt, payDate }: { personId: number; debt: { sales: Sale[]; services: Service[] }; payDate: string }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const canPay = useAccess().can('payments.technicians');
  const name = data.personById.get(personId)?.name ?? 'Técnico';
  const items = [
    ...debt.sales.map((s) => ({ key: `s${s.id}`, kind: 'Instalación', clientId: s.clientId, day: s.installDate ?? s.saleDate, amount: s.installerPay ?? 0, saleId: s.id })),
    ...debt.services.map((v) => ({ key: `v${v.id}`, kind: 'Servicio', clientId: v.clientId, day: v.visitDate ?? v.reportedDate, amount: v.technicianPay ?? 0, serviceId: v.id })),
  ].sort((a, b) => a.day.localeCompare(b.day));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map((i) => i.key)));
  const [busy, setBusy] = useState(false);
  const chosen = items.filter((i) => selected.has(i.key));
  const total = chosen.reduce((n, i) => n + i.amount, 0);

  const submit = async () => {
    const ok = await confirm({ title: `¿Pagarle a ${name}?`, message: `${plural(chosen.length, 'trabajo', 'trabajos')} · ${moneyPlain(total)} · fecha ${date(payDate, data.today)}`, confirm: 'Registrar pago' });
    if (!ok) return;
    setBusy(true);
    try {
      await api('/tech-payments', {
        method: 'POST',
        body: {
          saleIds: chosen.flatMap((i) => ('saleId' in i ? [i.saleId] : [])),
          serviceIds: chosen.flatMap((i) => ('serviceId' in i ? [i.serviceId] : [])),
          date: payDate,
        },
      });
      await reload();
      toast(`Pago a ${name} registrado`);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="pay-head">
        <Avatar name={name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pay-title">{name}</div>
          <div className="muted" style={{ fontSize: 14 }}>
            {plural(debt.sales.length, 'instalación', 'instalaciones')} · {plural(debt.services.length, 'servicio', 'servicios')} · {money(items.reduce((n, i) => n + i.amount, 0))}
          </div>
        </div>
      </div>
      <div className="group">
        {items.map((item) => {
          const isOn = selected.has(item.key);
          return (
            <button
              key={item.key}
              type="button"
              className="row"
              role="checkbox"
              aria-checked={isOn}
              onClick={() =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(item.key)) next.delete(item.key);
                  else next.add(item.key);
                  return next;
                })
              }
            >
              <span className={`check${isOn ? ' on' : ''}`} aria-hidden="true">
                {isOn && <CircleCheck size={24} />}
              </span>
              <span className="row-label">
                <span className="row-title" style={{ display: 'block' }}>{data.clientById.get(item.clientId)?.name ?? 'Cliente'}</span>
                <span className="row-sub" style={{ display: 'block' }}>
                  <Badge tone={item.kind === 'Servicio' ? 'red' : 'blue'}>{item.kind}</Badge> {date(item.day, data.today)}
                </span>
              </span>
              <span className="row-value strong num">{money(item.amount)}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }} hidden={!canPay}>
        <button type="button" className="btn block" disabled={!chosen.length || busy} onClick={submit}>
          {busy ? 'Guardando…' : chosen.length ? `Pagarle a ${name.split(' ')[0]} · ${moneyPlain(total)}` : 'Elige al menos uno'}
        </button>
      </div>
    </section>
  );
}

/** Un vendedor o una financiera: sus ventas pendientes con casillas y un boton para marcarlas. */
function PayGroup({
  title,
  leading,
  sales,
  amount,
  field,
  action,
  done,
  payDate,
  showWaiting,
}: {
  title: string;
  leading: ReactNode;
  sales: Sale[];
  amount: (s: Sale) => number;
  field: 'commissionPaid' | 'fundedPaid';
  action: string;
  done: string;
  payDate: string;
  showWaiting?: boolean;
}) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const canPay = useAccess().can(field === 'fundedPaid' ? 'payments.financiers' : 'payments.commissions');
  const [selected, setSelected] = useState<Set<number>>(() => new Set(sales.map((s) => s.id)));
  const [busy, setBusy] = useState(false);
  const chosen = sales.filter((s) => selected.has(s.id));
  const total = sum(chosen, amount);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = async () => {
    const ok = await confirm({
      title: `¿${action} ${plural(chosen.length, 'venta', 'ventas')}?`,
      message: `${title} · ${moneyPlain(total)} · fecha ${date(payDate, data.today)}`,
      confirm: action,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api('/sales/mark-batch', { method: 'POST', body: { ids: chosen.map((s) => s.id), field, paid: true, date: payDate } });
      await reload();
      toast(done);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="pay-head">
        {leading}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pay-title">{title}</div>
          <div className="muted" style={{ fontSize: 14 }}>
            {plural(sales.length, 'venta', 'ventas')} · {money(sum(sales, amount))}
          </div>
        </div>
      </div>
      <div className="group">
        {sales.map((sale) => {
          const client = data.clientById.get(sale.clientId);
          const days = daysBetween(waitingSince(sale), data.today);
          const isOn = selected.has(sale.id);
          return (
            <button key={sale.id} type="button" className="row" role="checkbox" aria-checked={isOn} onClick={() => toggle(sale.id)}>
              <span className={`check${isOn ? ' on' : ''}`} aria-hidden="true">
                {isOn && <CircleCheck size={24} />}
              </span>
              <span className="row-label">
                <span className="row-title" style={{ display: 'block' }}>{client?.name ?? 'Cliente'}</span>
                <span className="row-sub" style={{ display: 'block' }}>
                  Venta del {date(sale.saleDate, data.today)}
                  {showWaiting && days > 0 && (
                    <>
                      {' '}
                      <Badge tone={days > 30 ? 'red' : 'orange'}>{days} días</Badge>
                    </>
                  )}
                  {field === 'fundedPaid' && sale.fundedAmount == null && <span className="faint"> · monto estimado</span>}
                </span>
              </span>
              <span className="row-value strong num">{money(amount(sale))}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }} hidden={!canPay}>
        <button type="button" className="btn block" disabled={!chosen.length || busy} onClick={submit}>
          {busy ? 'Guardando…' : chosen.length ? `${action} · ${moneyPlain(total)}` : 'Elige al menos una'}
        </button>
      </div>
    </section>
  );
}
