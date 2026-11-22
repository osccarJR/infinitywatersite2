/**
 * Inicio: como va el negocio. Arriba los numeros del periodo elegido;
 * debajo, lo que esta pendiente hoy (no depende del periodo).
 */
import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Boxes, CalendarClock, CreditCard, HandCoins, HardHat, History, Landmark, Receipt, TrendingUp, Truck, Wallet, Wrench } from 'lucide-react';
import { addDaysISO, equipmentSummary, isActiveSale, saleMissing } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { useAccess, visibleMissing } from '../lib/access.ts';
import { accountStatuses, payablesTotals, stockLevels } from '../lib/books.ts';
import { useAmountsHidden } from '../lib/privacy.ts';
import { Link, navigate } from '../lib/router.tsx';
import { date, daysBetween, longDate, money, moneyFit, moneyRound, monthAbbr, percent, percentText, plural, relativeDay } from '../lib/format.ts';
import { PERIODS, byFinancier, bySeller, inRange, monthly, pending, periodRange, serviceTotals, technicianDebts, totals, type PeriodKey } from '../lib/stats.ts';
import { Avatar, Badge, ContactRow, Empty, Group, IconBox, Page, Row, Section, Segmented, Stat } from '../ui/kit.tsx';

export function Home() {
  const data = useData();
  const [period, setPeriod] = useState<PeriodKey>('month');
  const range = periodRange(period, data.today);

  const periodSales = useMemo(() => data.sales.filter((s) => inRange(s.saleDate, range)), [data.sales, range.from, range.to]);
  const t = totals(periodSales);
  const p = useMemo(() => pending(data.sales, data.services, data.today), [data]);
  const periodServices = useMemo(() => data.services.filter((s) => inRange(s.reportedDate, range)), [data.services, range.from, range.to]);
  const svc = serviceTotals(periodServices);
  const allSvc = useMemo(() => serviceTotals(data.services), [data.services]);
  const techOwed = useMemo(() => [...technicianDebts(data.sales, data.services).values()].reduce((n, e) => n + e.total, 0), [data]);
  const months = useMemo(() => monthly(data.sales, data.today), [data]);
  const sellers = bySeller(periodSales);
  const financiers = byFinancier(periodSales);

  const a = useAccess();
  const firstName = data.me.name.split(' ')[0];
  const hidden = useAmountsHidden();
  const empty = data.sales.length === 0 && data.clients.length === 0 && data.services.length === 0;
  const incomplete = useMemo(() => data.sales.filter((s) => visibleMissing(saleMissing(s), a).length > 0), [data.sales, a]);
  const complete = data.sales.length - incomplete.length;
  const owe = useMemo(
    () => (a.canSee('payables') ? payablesTotals(accountStatuses(data.payableAccounts, data.payables, data.payablePayments, data.today)) : null),
    [data, a.canSee('payables')]
  );
  const stock = useMemo(() => (a.canSee('inventory') ? stockLevels(data.inventoryItems, data.inventoryMovements) : []), [data, a.canSee('inventory')]);
  const lowStock = stock.filter((x) => x.low || x.out);
  const showSales = a.canSee('sales');
  const showServices = a.canSee('services');
  const periodLabel = PERIODS.find((x) => x.key === period)?.label;

  return (
    <Page
      title={`Hola, ${firstName}`}
      subtitle={capitalize(longDate(data.today))}
      actions={
        <Link to="/ajustes" className="icon-btn mobile-only" aria-label="Ajustes y mi cuenta">
          <Avatar name={data.me.name} size="sm" photo={data.me.avatar} />
        </Link>
      }
    >
      {empty ? (
        <Welcome />
      ) : (
        <>
          <Agenda />

          {(showSales || showServices) && (
            <div style={{ maxWidth: 520, marginBottom: 16 }}>
              <Segmented options={PERIODS.map((x) => ({ value: x.key, label: x.label }))} value={period} onChange={setPeriod} label="Periodo" />
            </div>
          )}

          {showSales && (
            <>
              <div className="stats-head">
                <h2 className="stats-title">{periodLabel}</h2>
              </div>
              <div className="stats">
                {a.prices ? (
                  <Stat
                    hero
                    label="Vendido"
                    icon={<Receipt size={15} />}
                    spark={hidden ? undefined : months.map((x) => x.sold)}
                    value={moneyFit(t.sold)}
                    note={t.count ? `${plural(t.count, 'venta', 'ventas')} · ${moneyRound(t.count ? t.sold / t.count : 0)} en promedio` : 'Sin ventas en este periodo'}
                    privacy
                  />
                ) : (
                  <Stat hero label="Ventas" icon={<Receipt size={15} />} spark={months.map((x) => x.count)} value={t.count} note={t.count ? `${plural(periodSales.filter((x) => x.installDate).length, 'instalada', 'instaladas')} · ${p.toInstall.length} por instalar` : 'Sin ventas en este periodo'} />
                )}
                {a.costs && (
                  <>
                    <Stat
                      label="Ganancia"
                      icon={<TrendingUp size={15} />}
                      iconColor="#1d9a46"
                      value={(t.estimates ? '≈ ' : '') + moneyFit(t.profit)}
                      tone={t.profit < 0 ? 'red' : undefined}
                      note={t.estimates ? `${plural(t.estimates, 'venta estimada', 'ventas estimadas')} (faltan costos)` : t.income ? `Margen ${percentText(t.profit, t.income)}` : '—'}
                    />
                    {a.can('money.financier') && <Stat
                      label="Ya cobrado"
                      icon={<Wallet size={15} />}
                      iconColor="#16a3c4"
                      value={moneyFit(t.received)}
                      note={`de ${moneyRound(t.knownIncome)} esperado${t.unknownPayment ? ` · ${t.unknownPayment} sin forma de pago` : ''}`}
                    />}
                  </>
                )}
                {!a.costs && (
                  <Stat
                    label="Por instalar"
                    icon={<Truck size={15} />}
                    iconColor="#0a72c2"
                    value={p.toInstall.length}
                    tone={p.toInstall.length ? 'orange' : undefined}
                    note={p.toInstall[0]?.installDate ? `Próxima: ${date(p.toInstall[0].installDate, data.today)}` : p.toInstall.length ? 'Sin fecha asignada' : 'Nada pendiente'}
                    to="/ventas?filtro=to_install"
                  />
                )}
              </div>
            </>
          )}

          {showServices && (
            <>
              <div className="stats-head">
                <h2 className="stats-title">Servicio técnico</h2>
                <span className="muted" style={{ fontSize: 13.5 }}>{periodLabel}</span>
              </div>
              <div className="stats">
                {a.prices ? (
                  <Stat
                    label="Cobrado"
                    icon={<Wrench size={15} />}
                    iconColor="#e5484d"
                    value={moneyFit(svc.chargedAmount)}
                    note={svc.count ? `${plural(svc.charged, 'cobrado', 'cobrados')} · ${svc.warranty} de garantía` : 'Sin servicios en el periodo'}
                    to="/servicio"
                  />
                ) : (
                  <Stat label="Servicios" icon={<Wrench size={15} />} iconColor="#e5484d" value={svc.count} note={svc.count ? `${svc.warranty} de garantía` : 'Sin servicios en el periodo'} to="/servicio" />
                )}
                <Stat
                  label="Abiertos"
                  icon={<AlertTriangle size={15} />}
                  iconColor="#f08c00"
                  value={p.openServices.length}
                  tone={p.openServices.length ? 'orange' : undefined}
                  note={p.openServices.length ? 'Sin resolver todavía' : 'Todo resuelto'}
                  to="/servicio"
                />
                {a.can('money.techpay') && <Stat label="Pagado a técnicos" icon={<HardHat size={15} />} iconColor="#8e8e93" value={moneyFit(svc.technician)} note="De los servicios del periodo" />}
                {a.costs && (
                  <>
                    <Stat
                      label="Ganancia de servicio"
                      icon={<TrendingUp size={15} />}
                      iconColor="#1d9a46"
                      value={moneyFit(svc.profit)}
                      tone={svc.profit < 0 ? 'red' : undefined}
                      note="Cobrado menos técnicos"
                    />
                  </>
                )}
                {a.prices && (
                  <Stat
                    label="Servicios por cobrar"
                    icon={<HandCoins size={15} />}
                    iconColor="#f08c00"
                    value={moneyFit(allSvc.pendingClient)}
                    tone={allSvc.pendingClient ? 'orange' : undefined}
                    note={allSvc.pendingClient ? 'Cobrados sin medio de pago' : 'Todo pagado'}
                    to="/servicio"
                  />
                )}
              </div>
            </>
          )}

          {(a.canSee('payments') || owe || lowStock.length > 0 || (showSales && a.costs)) && (
            <>
              <div className="stats-head">
                <h2 className="stats-title">Pendiente ahora</h2>
                <span className="muted" style={{ fontSize: 13.5 }}>No depende del periodo</span>
              </div>
              <div className="stats">
                {a.canSee('payments') && (
                  <>
                    {a.can('money.financier') && <Stat
                      label="Te deben"
                      icon={<HandCoins size={15} />}
                      iconColor="#f08c00"
                      value={moneyFit(p.fromFinanciers + p.fromClients)}
                      tone={p.fromFinanciers + p.fromClients > 0 ? 'orange' : undefined}
                      note={p.toCollect.length ? `Financieras ${moneyRound(p.fromFinanciers)}${p.fromClients ? ` · Clientes ${moneyRound(p.fromClients)}` : ''}` : 'Todo cobrado'}
                      to="/pagos?tab=financieras"
                    />}
                    {a.can('money.commissions') && <Stat
                      label="Comisiones"
                      icon={<Landmark size={15} />}
                      iconColor="#6a3fdc"
                      value={moneyFit(p.commissionsOwed)}
                      note={p.commissionSales.length ? `Por pagar · ${plural(p.commissionSales.length, 'venta', 'ventas')}` : 'Todas pagadas'}
                      to="/pagos?tab=comisiones"
                    />}
                    {a.can('money.techpay') && <Stat
                      label="Técnicos"
                      icon={<HardHat size={15} />}
                      iconColor="#8e8e93"
                      value={moneyFit(techOwed)}
                      note={techOwed ? 'Por pagar: instalaciones y servicios' : 'Todo pagado'}
                      to="/pagos?tab=tecnicos"
                    />}
                  </>
                )}
                {owe && (
                  <Stat
                    label="Cuentas por pagar"
                    icon={<CreditCard size={15} />}
                    iconColor="#e5484d"
                    value={moneyFit(owe.balance)}
                    tone={owe.overdue > 0 ? 'red' : undefined}
                    note={owe.overdue > 0 ? `Vencido ${moneyRound(owe.overdue)}` : owe.dueSoon > 0 ? `Vence esta semana ${moneyRound(owe.dueSoon)}` : owe.balance ? `${plural(owe.accountsWithDebt, 'cuenta', 'cuentas')} con saldo` : 'Nada pendiente'}
                    to="/pagar"
                  />
                )}
                {a.canSee('inventory') && (
                  <Stat
                    label="Inventario"
                    icon={<Boxes size={15} />}
                    iconColor="#6a3fdc"
                    value={lowStock.length}
                    tone={lowStock.length ? 'orange' : undefined}
                    note={lowStock.length ? `${lowStock.length === 1 ? 'Producto' : 'Productos'} por comprar` : stock.length ? 'Todo con existencia' : 'Agrega tus productos'}
                    to="/inventario"
                  />
                )}
                {showSales && a.costs && (
                  <Stat
                    label="Por instalar"
                    icon={<Truck size={15} />}
                    iconColor="#0a72c2"
                    value={p.toInstall.length}
                    tone={p.toInstall.length ? 'orange' : undefined}
                    note={p.toInstall[0]?.installDate ? `Próxima: ${date(p.toInstall[0].installDate, data.today)}` : p.toInstall.length ? 'Sin fecha asignada' : 'Nada pendiente'}
                    to="/ventas?filtro=to_install"
                  />
                )}
              </div>
            </>
          )}

          <div className="grid-2" style={{ marginTop: 30 }}>
            {showSales && <Section title="Por instalar" action={p.toInstall.length > 4 && <Link to="/ventas?filtro=to_install" className="section-link">Ver todas</Link>}>
              <Group>
                {p.toInstall.length === 0 ? (
                  <Empty inGroup title="Nada por instalar" text="Las ventas sin fecha de instalación aparecen aquí." />
                ) : (
                  p.toInstall.slice(0, 4).map((sale) => {
                    const client = data.clientById.get(sale.clientId);
                    return (
                      <Row
                        key={sale.id}
                        to={`/ventas/${sale.id}`}
                        leading={<Avatar name={client?.name ?? '?'} />}
                        title={client?.name}
                        subtitle={equipmentSummary(sale.equipment)}
                        value={sale.installDate ? <Badge tone="blue">{relativeDay(sale.installDate, data.today)}</Badge> : <Badge tone="orange">Sin fecha</Badge>}
                      />
                    );
                  })
                )}
              </Group>
            </Section>}

            {showServices && <Section title="Servicio abierto" action={p.openServices.length > 4 && <Link to="/servicio" className="section-link">Ver todos</Link>}>
              <Group>
                {p.openServices.length === 0 ? (
                  <Empty inGroup title="Ningún servicio abierto" text="Cuando un cliente reporte un problema, lo verás aquí hasta resolverlo." />
                ) : (
                  p.openServices.slice(0, 4).map((service) => (
                    <ContactRow
                      key={service.id}
                      to={`/servicio/${service.id}`}
                      leading={<Avatar name={data.clientById.get(service.clientId)?.name ?? '?'} />}
                      title={data.clientById.get(service.clientId)?.name}
                      subtitle={`${relativeDay(service.reportedDate, data.today)} · ${service.problem}`}
                      phone={data.clientById.get(service.clientId)?.phone}
                    />
                  ))
                )}
              </Group>
            </Section>}

            {showSales && <Section title="Mantenimientos">
              <Group footer="Vencidos y los de los próximos 30 días.">
                {p.maintenance.length === 0 ? (
                  <Empty inGroup icon={<CalendarClock size={28} />} title="Sin mantenimientos cercanos" text="Pon la fecha del próximo mantenimiento en cada venta y te avisamos aquí." />
                ) : (
                  p.maintenance.slice(0, 5).map((sale) => {
                    const overdue = sale.nextServiceDate! < data.today;
                    const client = data.clientById.get(sale.clientId);
                    const name = client?.name.split(' ')[0] ?? '';
                    const text =
                      client?.language === 'en'
                        ? `Hi ${name}, this is Infinity Water. Your water system is due for its maintenance. When would be a good time to visit?`
                        : `Hola ${name}, le saluda Infinity Water. A su equipo de agua ya le toca el mantenimiento. ¿Cuándo le queda bien que pasemos?`;
                    return (
                      <ContactRow
                        key={sale.id}
                        to={`/ventas/${sale.id}`}
                        leading={<Avatar name={client?.name ?? '?'} />}
                        title={client?.name}
                        subtitle={
                          <>
                            <Badge tone={overdue ? 'red' : 'blue'}>
                              {overdue ? `Vencido ${relativeDay(sale.nextServiceDate!, data.today)}` : relativeDay(sale.nextServiceDate!, data.today)}
                            </Badge>{' '}
                            {equipmentSummary(sale.equipment)}
                          </>
                        }
                        phone={client?.phone}
                        whatsappText={text}
                      />
                    );
                  })
                )}
              </Group>
            </Section>}

            {a.can('sales.create') && <Section title="Ponerse al día">
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600 }}>
                    {complete} de {data.sales.length} ventas completas
                  </span>
                  <span className="muted num">{percent(complete, data.sales.length)}%</span>
                </div>
                <div className="meter">
                  <span style={{ width: `${percent(complete, data.sales.length)}%` }} />
                </div>
                <p className="muted" style={{ fontSize: 14.5, marginTop: 12 }}>
                  {incomplete.length
                    ? `A ${plural(incomplete.length, 'venta le faltan', 'ventas les faltan')} datos (${topMissing(incomplete, a)}). Complétalos cuando los tengas.`
                    : 'Todas las ventas tienen sus datos completos.'}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {incomplete.length > 0 && (
                    <Link to="/ventas?filtro=incomplete" className="btn small secondary">Completar datos</Link>
                  )}
                  <Link to="/ventas/nueva?anterior=1" className="btn small gray">
                    <History size={16} /> Cliente anterior
                  </Link>
                </div>
              </div>
            </Section>}

            {!a.can('sales.create') && a.reports && (
              <Section title="Reportes">
                <Link to="/reportes" className="card report-cta">
                  <BarChart3 size={22} />
                  <span>
                    <b>Ver reportes</b>
                    <span className="muted">Ventas, servicios y más, por periodo, con gráficas y Excel.</span>
                  </span>
                </Link>
              </Section>
            )}
          </div>

          {showSales && a.prices && (
          <Section title="Últimos 12 meses" action={a.reports && <Link to="/reportes" className="section-link">Reportes</Link>}>
            <div className="card">
              {hidden ? (
                <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>Montos ocultos. Toca «Mostrar» arriba para ver la gráfica.</p>
              ) : (
                <MonthBars months={months} today={data.today} showProfit={a.costs} />
              )}
            </div>
          </Section>
          )}

          {showSales && a.prices && a.scope === 'all' && (
          <div className="grid-2" style={{ marginTop: 28 }}>
            <Section title="Por vendedor">
              <Group footer={PERIODS.find((x) => x.key === period)?.label}>
                {sellers.length === 0 ? (
                  <Empty inGroup title="Sin ventas en este periodo" />
                ) : (
                  sellers.map((row) => {
                    const name = row.id ? data.personById.get(row.id)?.name ?? '—' : 'Sin vendedor';
                    return (
                      <Row
                        key={row.id ?? 0}
                        leading={<Avatar name={name} />}
                        title={name}
                        subtitle={a.can('money.commissions') ? `${plural(row.count, 'venta', 'ventas')} · comisión ${money(row.commission)}${row.owed ? ` (${money(row.owed)} por pagar)` : ''}` : plural(row.count, 'venta', 'ventas')}
                        value={money(row.sold)}
                        strong
                      />
                    );
                  })
                )}
              </Group>
            </Section>

            {a.can('money.financier') && <Section title="Por financiera">
              <Group footer="El descuento es lo que se queda la financiera: lo financiado menos lo que nos pagó.">
                {financiers.length === 0 ? (
                  <Empty inGroup title="Sin ventas financiadas en este periodo" />
                ) : (
                  financiers.map((row) => (
                    <Row
                      key={row.id ?? 0}
                      leading={<IconBox icon={<Landmark size={17} />} color="#5856d6" />}
                      title={row.id ? data.financierById.get(row.id)?.name ?? '—' : 'Sin financiera'}
                      subtitle={`${plural(row.count, 'venta', 'ventas')}${row.feeKnown ? ` · descuento ${percentText(row.fee, row.feeKnown)} (${money(row.fee)})` : ' · pago aún sin registrar'}`}
                      value={money(row.financed)}
                      strong
                    />
                  ))
                )}
              </Group>
            </Section>}
          </div>
          )}
        </>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Agenda de la semana                                                   */
/* ------------------------------------------------------------------ */

type AgendaItem = {
  key: string;
  day: string;
  kind: 'install' | 'visit' | 'maintenance';
  clientId: number;
  to: string;
  detail: string;
  late?: boolean;
};

const AGENDA_KIND = {
  install: { label: 'Instalación', color: '#0a72c2', icon: <Truck size={17} /> },
  visit: { label: 'Visita técnica', color: '#e5484d', icon: <Wrench size={17} /> },
  maintenance: { label: 'Mantenimiento', color: '#1d9a46', icon: <CalendarClock size={17} /> },
};

function Agenda() {
  const data = useData();
  const end = addDaysISO(data.today, 6);
  const items: AgendaItem[] = [];
  for (const sale of data.sales) {
    if (!isActiveSale(sale)) continue;
    if (sale.installDate && sale.installDate >= data.today && sale.installDate <= end) {
      items.push({ key: `i${sale.id}`, day: sale.installDate, kind: 'install', clientId: sale.clientId, to: `/ventas/${sale.id}`, detail: equipmentSummary(sale.equipment) });
    }
    if (sale.nextServiceDate && sale.nextServiceDate >= data.today && sale.nextServiceDate <= end) {
      items.push({ key: `m${sale.id}`, day: sale.nextServiceDate, kind: 'maintenance', clientId: sale.clientId, to: `/ventas/${sale.id}`, detail: equipmentSummary(sale.equipment) });
    }
  }
  for (const service of data.services) {
    if (service.status !== 'open' || !service.visitDate || service.visitDate > end) continue;
    const late = service.visitDate < data.today;
    items.push({ key: `v${service.id}`, day: late ? data.today : service.visitDate, kind: 'visit', clientId: service.clientId, to: `/servicio/${service.id}`, detail: service.problem, late });
  }
  items.sort((a, b) => a.day.localeCompare(b.day) || Number(b.late ?? 0) - Number(a.late ?? 0));

  const days = [...new Set(items.map((i) => i.day))];
  const dayLabel = (iso: string) => {
    const diff = daysBetween(data.today, iso);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return capitalize(longDate(iso));
  };

  return (
    <Section title="Esta semana">
      {items.length === 0 ? (
        <div className="card agenda-empty">
          <CalendarClock size={22} />
          <span>
            <b>Nada agendado para estos 7 días.</b>
            <br />
            <span className="muted">Pon la fecha de instalación o de visita y aparecerá aquí.</span>
          </span>
        </div>
      ) : (
        days.map((day) => (
          <div key={day} className="agenda-day">
            <div className="group-label">{dayLabel(day)}</div>
            <Group>
              {items
                .filter((i) => i.day === day)
                .map((item) => {
                  const client = data.clientById.get(item.clientId);
                  const kind = AGENDA_KIND[item.kind];
                  return (
                    <ContactRow
                      key={item.key}
                      to={item.to}
                      leading={<IconBox icon={kind.icon} color={kind.color} />}
                      title={client?.name ?? 'Cliente'}
                      subtitle={
                        <>
                          {item.late ? <Badge tone="red">Visita atrasada</Badge> : <b style={{ fontWeight: 600, color: kind.color }}>{kind.label}</b>}
                          {' · '}
                          {item.detail}
                        </>
                      }
                      phone={client?.phone}
                    />
                  );
                })}
            </Group>
          </div>
        ))
      )}
    </Section>
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function topMissing(sales: Parameters<typeof saleMissing>[0][], access: Parameters<typeof visibleMissing>[1]) {
  const counts = new Map<string, number>();
  sales.forEach((s) => visibleMissing(saleMissing(s), access).forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1)));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label.toLowerCase())
    .join(', ');
}

function MonthBars({ months, today, showProfit }: { months: ReturnType<typeof monthly>; today: string; showProfit: boolean }) {
  const max = Math.max(...months.map((m) => m.sold), 1);
  const total = months.reduce((sum, m) => sum + m.sold, 0);
  if (total === 0) return <p className="muted">Cuando registres ventas verás aquí cómo va cada mes.</p>;
  return (
    <>
      <div className="bars" role="img" aria-label="Vendido y ganancia por mes">
        {months.map((m) => (
          <div key={m.month} className={`bar-col${m.month.slice(0, 7) === today.slice(0, 7) ? ' current' : ''}`} title={`${monthAbbr(m.month)}: vendido ${money(m.sold)}${showProfit ? `, ganancia ${money(m.profit)}` : ''}, ${m.count} ventas`}>
            <div className="bar-track">
              <div className="bar" style={{ height: `${(m.sold / max) * 100}%` }}>
                {showProfit && <div className="bar-profit" style={{ height: `${m.sold ? Math.max(0, Math.min(100, (m.profit / m.sold) * 100)) : 0}%` }} />}
              </div>
            </div>
            <span className="bar-label">{monthAbbr(m.month)}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--fill)' }} />Vendido</span>
        {showProfit && <span><i style={{ background: 'var(--accent)' }} />Ganancia</span>}
        <span style={{ marginLeft: 'auto' }} className="num">{money(total)} en 12 meses</span>
      </div>
    </>
  );
}

/** Primer uso: como empezar. */
function Welcome() {
  const steps = [
    {
      icon: <Receipt size={22} />,
      color: 'var(--accent)',
      title: 'Registra la venta de hoy',
      text: 'Cliente, lo que instalaste, en cuánto vendiste, la financiera, quién vendió y su comisión.',
      to: '/ventas/nueva',
    },
    {
      icon: <History size={22} />,
      color: '#6a3fdc',
      title: 'Ponte al día con los anteriores',
      text: 'Agrega a tus clientes de antes con lo que sepas. El sistema te recuerda lo que falta.',
      to: '/ventas/nueva?anterior=1',
    },
    {
      icon: <Wrench size={22} />,
      color: '#ff9500',
      title: 'Anota cada servicio técnico',
      text: 'Qué pasó, quién fue, si fue garantía o se cobró y cuánto.',
      to: '/servicio/nuevo',
    },
  ];
  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 19, fontWeight: 600 }}>Bienvenido al sistema de Infinity Water.</p>
        <p className="muted" style={{ marginTop: 6 }}>
          Aquí llevas el control de cada cliente, cada venta y cada servicio, y sabes cuánto ganas. Empieza por
          cualquiera de estos pasos; las financieras, los proveedores y tu equipo se agregan solos mientras registras.
        </p>
      </div>
      <div className="action-list">
        {steps.map((step) => (
          <button key={step.to} type="button" className="action-card" onClick={() => navigate(step.to)}>
            <IconBox icon={step.icon} color={step.color} />
            <span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 17 }}>{step.title}</span>
              <span className="muted" style={{ fontSize: 14.5 }}>{step.text}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
