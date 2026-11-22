/** Filas de lista y etiquetas de estado para ventas y servicios. */
import type { Sale, Service } from '../../../shared/domain.ts';
import { SERVICE_KIND_LABEL, equipmentSummary, installState, saleMissing, saleMoney } from '../../../shared/domain.ts';
import type { Data } from '../lib/store.tsx';
import { date, daysBetween, money, moneyRound } from '../lib/format.ts';
import { Avatar, Badge, Row } from './kit.tsx';

export function SaleBadges({ sale, data, hideMissing }: { sale: Sale; data: Data; hideMissing?: boolean }) {
  const m = saleMoney(sale);
  const state = installState(sale, data.today);
  const missing = saleMissing(sale);
  return (
    <span className="badges">
      {state === 'pending' && <Badge tone="orange">Por instalar</Badge>}
      {state === 'scheduled' && <Badge tone="blue">Instala {date(sale.installDate, data.today)}</Badge>}
      {m.pendingFinancier > 0 && <Badge tone="orange">Financiera por pagar</Badge>}
      {m.pendingClient > 0 && <Badge tone="orange">Cliente debe {money(m.pendingClient)}</Badge>}
      {(sale.commission ?? 0) > 0 && !sale.commissionPaid && <Badge tone="violet">Comisión pendiente</Badge>}
      {!hideMissing && missing.length > 0 && <Badge>Faltan {missing.length} {missing.length === 1 ? 'dato' : 'datos'}</Badge>}
    </span>
  );
}

export function SaleRow({ sale, data, showClient = true, collect }: { sale: Sale; data: Data; showClient?: boolean; collect?: boolean }) {
  const client = data.clientById.get(sale.clientId);
  const m = saleMoney(sale);
  if (collect) {
    // Vista "Por cobrar": cuanto se debe y cuanto lleva esperando.
    const owed = m.pendingFinancier + m.pendingClient;
    const days = daysBetween(sale.installDate ?? sale.saleDate, data.today);
    const who = m.pendingFinancier > 0 ? (sale.financierId ? data.financierById.get(sale.financierId)?.name ?? 'Financiera' : 'Financiera') : 'El cliente';
    return (
      <Row
        to={`/ventas/${sale.id}`}
        leading={<Avatar name={client?.name ?? '?'} />}
        title={client?.name ?? 'Cliente'}
        subtitle={
          <>
            <span style={{ display: 'block' }}>{who} · venta del {date(sale.saleDate, data.today)}</span>
            <span className="badges">
              <Badge tone={days > 30 ? 'red' : 'orange'}>{days <= 0 ? 'Desde hoy' : `Esperando ${days} ${days === 1 ? 'día' : 'días'}`}</Badge>
            </span>
          </>
        }
        value={<span style={{ color: 'var(--orange)', fontWeight: 700 }}>{moneyRound(owed)}</span>}
      />
    );
  }
  return (
    <Row
      to={`/ventas/${sale.id}`}
      leading={showClient ? <Avatar name={client?.name ?? '?'} /> : undefined}
      title={showClient ? client?.name ?? 'Cliente' : equipmentSummary(sale.equipment)}
      subtitle={
        <>
          <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {date(sale.saleDate, data.today)}
            {showClient && ` · ${equipmentSummary(sale.equipment)}`}
          </span>
          <SaleBadges sale={sale} data={data} />
        </>
      }
      value={
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{sale.price == null ? '—' : moneyRound(sale.price)}</span>
          {sale.price != null && (
            // Ganancia estimada (faltan costos) en gris: no se presenta como real.
            <span style={{ fontSize: 13, color: m.estimate ? 'var(--text-2)' : m.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {m.estimate ? '≈ ' : ''}
              {moneyRound(m.profit)}
            </span>
          )}
        </span>
      }
    />
  );
}

export function ServiceBadge({ service }: { service: Service }) {
  if (service.billing === 'warranty') return <Badge tone="blue">Garantía</Badge>;
  if (service.billing === 'charged') return <Badge tone="green">Cobrado {money(service.amount)}</Badge>;
  return null;
}

export function ServiceRow({ service, data, showClient = true }: { service: Service; data: Data; showClient?: boolean }) {
  const client = data.clientById.get(service.clientId);
  const technician = service.technicianId ? data.personById.get(service.technicianId)?.name : null;
  return (
    <Row
      to={`/servicio/${service.id}`}
      leading={<span className={`timeline-dot ${service.status}`} style={{ alignSelf: 'flex-start', marginTop: 8 }} />}
      title={showClient ? client?.name ?? 'Cliente' : service.problem}
      clamp
      subtitle={
        <>
          <span style={{ display: 'block' }}>
            {date(service.reportedDate, data.today)} · {SERVICE_KIND_LABEL[service.kind]}
            {technician && ` · ${technician}`}
          </span>
          {showClient && (
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal', color: 'var(--text)' }}>
              {service.problem}
            </span>
          )}
          <span className="badges">
            {service.status === 'open' ? <Badge tone="orange">Abierto</Badge> : <Badge tone="green">Resuelto</Badge>}
            <ServiceBadge service={service} />
          </span>
        </>
      }
    />
  );
}
