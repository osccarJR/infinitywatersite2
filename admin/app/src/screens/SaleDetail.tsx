/**
 * Detalle de una venta: que se instalo, donde, el dinero completo y las
 * acciones rapidas (marcar que pago la financiera o la comision).
 */
import type { Sale } from '../../../shared/domain.ts';
import { AlertCircle, CircleCheck, MessageCircle, Phone, Wrench } from 'lucide-react';
import {
  RO_TYPE_LABEL,
  WATER_LABEL,
  SALE_STATUS_LABEL,
  equipmentSummary,
  formatAddress,
  isActiveSale,
  installState,
  saleMissing,
  saleMoney,
} from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { useAccess, visibleMissing } from '../lib/access.ts';
import { Link, navigate } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { dateWithYear, localDate, mapsHref, money, percentText, relativeDay, telHref } from '../lib/format.ts';
import { waLink } from '../lib/whatsapp.ts';
import { Avatar, Badge, Empty, Group, Page, Row, Section } from '../ui/kit.tsx';
import { SaleBadges, ServiceRow } from '../ui/items.tsx';
import { SaleDocs } from '../ui/saledocs.tsx';
import { useFeedback } from '../ui/sheet.tsx';

export function SaleDetail({ id }: { id: number }) {
  const data = useData();
  const { reload } = useStore();
  const { toast, confirm } = useFeedback();
  const a = useAccess();
  const sale = data.sales.find((s) => s.id === id);

  if (!sale) {
    return (
      <Page title="Venta" back={{ label: 'Ventas', to: '/ventas' }}>
        <Empty title="Esta venta no existe" text="Puede que se haya borrado." />
      </Page>
    );
  }

  const client = data.clientById.get(sale.clientId);
  const m = saleMoney(sale);
  const missing = visibleMissing(saleMissing(sale), a);
  // Editar, o corregir el mismo dia lo que el mismo registro (el servidor lo confirma).
  const canEdit = a.can('sales.edit') || (a.can('sales.create') && sale.createdBy === data.me.name && localDate(sale.createdAt) === data.today);
  const state = installState(sale, data.today);
  const services = data.servicesBySale.get(sale.id) ?? [];
  const person = (pid: number | null) => (pid ? data.personById.get(pid)?.name : null);
  const address =
    sale.installAddress || sale.installCity
      ? formatAddress({ address: sale.installAddress, city: sale.installCity, state: sale.installStateCode, zip: sale.installZip })
      : formatAddress(client ?? {});
  const e = sale.equipment;

  const mark = async (field: 'fundedPaid' | 'commissionPaid', paid: boolean) => {
    if (!paid) {
      const what = field === 'fundedPaid' ? 'el pago de la financiera' : 'el pago de la comisión';
      const ok = await confirm({ title: `¿Deshacer ${what}?`, message: 'Vuelve a quedar como pendiente y se borra la fecha del pago.', confirm: 'Deshacer', danger: true });
      if (!ok) return;
    }
    try {
      await api(`/sales/${id}/mark`, { method: 'POST', body: { field, paid, date: paid ? data.today : null } });
      await reload();
      toast(paid ? (field === 'fundedPaid' ? 'Pago de la financiera registrado' : 'Comisión marcada como pagada') : 'Marcado como pendiente');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: '¿Borrar esta venta?',
      message: 'El cliente se queda. Los servicios técnicos de esta venta quedan sin venta asociada. No se puede deshacer.',
      confirm: 'Borrar venta',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/sales/${id}`, { method: 'DELETE' });
      await reload();
      toast('Venta borrada');
      navigate(`/clientes/${sale.clientId}`, { replace: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page
      title={client?.name ?? 'Venta'}
      subtitle={
        <>
          Venta del {dateWithYear(sale.saleDate)}
          {sale.isLegacy && ' · registrada al ponerse al día'}
        </>
      }
      back={{ label: 'Ventas', to: '/ventas' }}
      actions={
        canEdit ? (
          <Link to={`/ventas/${id}/editar`} className="link-btn strong">
            Editar
          </Link>
        ) : undefined
      }
      narrow
    >
      <div style={{ marginTop: -8, marginBottom: 18 }}>
        <SaleBadges sale={sale} data={data} hideMissing />
      </div>

      {canEdit && missing.length > 0 && (
        <Link to={`/ventas/${id}/editar`} className="banner" style={{ display: 'flex' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <div className="banner-title">Faltan {missing.length} {missing.length === 1 ? 'dato' : 'datos'}</div>
            <div className="banner-text">{missing.join(' · ')}</div>
          </div>
          <span className="link-btn" style={{ padding: 0 }}>Completar</span>
        </Link>
      )}

      {client && (
        <Group>
          <Row
            leading={<Avatar name={client.name} />}
            title={
              <Link to={`/clientes/${client.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
                {client.name}
              </Link>
            }
            subtitle={client.phone ?? 'Sin teléfono'}
            chevron={false}
            trailing={
              client.phone ? (
                <span style={{ display: 'flex', gap: 2 }}>
                  <a className="icon-btn" href={telHref(client.phone)} aria-label="Llamar">
                    <Phone size={20} />
                  </a>
                  <a className="icon-btn" {...waLink(client.phone)} aria-label="WhatsApp">
                    <MessageCircle size={20} />
                  </a>
                </span>
              ) : undefined
            }
          />
        </Group>
      )}

      {!isActiveSale(sale) && (
        <div className="banner">
          <AlertCircle size={20} />
          <div>
            <div className="banner-title">Venta {SALE_STATUS_LABEL[sale.status].toLowerCase()}</div>
            <div className="banner-text">No suma en vendido, ganancia, cobros ni comisiones.{canEdit ? ' Se cambia en Editar → Estado de la venta.' : ''}</div>
          </div>
        </div>
      )}

      <Group label="Lo que se instaló" footer={equipmentSummary(e)}>
        <Row title="Marca" value={sale.brandId ? data.brands.find((b) => b.id === sale.brandId)?.name ?? '—' : '—'} />
        <Row title="Agua" value={sale.waterSource ? WATER_LABEL[sale.waterSource] : '—'} />
        <Row title="Filtros fuera de casa" value={e.outdoorTanks || 'No'} />
        <Row title="Aireador" value={e.aerator ? 'Sí' : 'No'} />
        <Row title="Ósmosis de toda la casa" value={e.wholeHouseRo ? `${e.wholeHouseRo} ${e.wholeHouseRo === 1 ? 'membrana' : 'membranas'}` : 'No'} />
        <Row
          title="Ósmosis en la cocina"
          value={e.ro ? [e.roType ? RO_TYPE_LABEL[e.roType] : null, e.roUv ? 'con UV' : 'sin UV'].filter(Boolean).join(' · ') : 'No'}
        />
        {e.other && <Row title="Otro" subtitle={e.other} />}
      </Group>

      <SaleDocs sale={sale} />

      <Group label="Instalación">
        <Row
          title="Fecha"
          value={
            sale.installDate ? (
              <>
                {dateWithYear(sale.installDate)}
                {state === 'scheduled' && <span className="muted"> · {relativeDay(sale.installDate, data.today)}</span>}
              </>
            ) : sale.isLegacy ? (
              <span className="muted">Sin registrar</span>
            ) : (
              <Badge tone="orange">Por instalar</Badge>
            )
          }
        />
        {sale.installTime && <Row title="Hora" value={sale.installTime} />}
        <Row title="Técnico" value={person(sale.installerId) ?? '—'} />
        <Row title="Lugar" subtitle={address || '—'} href={address ? mapsHref(address) : undefined} chevron={Boolean(address)} />
      </Group>

      {!a.costs && <PriceCard sale={sale} />}

      {a.costs && <Section title="Dinero">
        <div className="card">
          <div className="money-lines">
            <MoneyLine label="Valor de la venta" value={sale.price} strong />
            {m.financed ? (
              <>
                <MoneyLine label={`Abono en cash${(sale.cashDown ?? 0) === 0 ? ' (no abonó)' : ''}`} value={sale.cashDown ?? 0} />
                <MoneyLine label="Se financió" value={sale.price == null ? null : m.financedAmount} />
                <MoneyLine
                  label={`${sale.financierId ? data.financierById.get(sale.financierId)?.name ?? 'La financiera' : 'La financiera'} ${sale.fundedPaid ? 'pagó' : 'paga'}`}
                  value={sale.fundedAmount}
                  note={sale.fundedAmount == null ? 'Sin registrar' : undefined}
                />
                {m.financierFee != null && (
                  <MoneyLine label={`Descuento de la financiera (${percentText(m.financierFee, m.financedAmount)})`} value={-m.financierFee} />
                )}
              </>
            ) : sale.paymentMethod === 'cash' ? (
              <>
                <MoneyLine label="Pago en cash" value={sale.cashDown} />
                {m.pendingClient > 0 && <MoneyLine label="El cliente debe" value={m.pendingClient} tone="orange" />}
              </>
            ) : (
              <MoneyLine label="Forma de pago" value={null} note="Sin registrar" />
            )}
            {sale.suppliers.map((row) => (
              <MoneyLine key={row.supplierId} label={`Proveedor: ${data.supplierById.get(row.supplierId)?.name ?? '—'}`} value={row.cost == null ? null : -row.cost} note={row.cost == null ? 'Sin costo' : undefined} />
            ))}
            <MoneyLine label={`Comisión${person(sale.sellerId) ? ` de ${person(sale.sellerId)}` : ''}`} value={sale.commission == null ? null : -sale.commission} note={sale.commission == null ? 'Sin registrar' : undefined} />
            {sale.installerPay != null && (
              <MoneyLine label={`Pago al técnico${sale.installerPay ? (sale.installerPaid ? ' (pagado)' : ' (por pagar)') : ''}`} value={-sale.installerPay} />
            )}
            <div className="money-line total">
              <span>Ganancia{m.estimate ? ' estimada' : ''}</span>
              <span className="v" style={{ color: m.profit < 0 ? 'var(--red)' : m.estimate ? 'var(--text)' : 'var(--green)' }}>
                {m.estimate ? '≈ ' : ''}
                {money(m.profit)}
              </span>
            </div>
            {m.noCosts && (
              <p className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>
                Sin costos de proveedores: la ganancia real será menor. Agrégalos en Editar.
              </p>
            )}
          </div>
        </div>
      </Section>}

      {isActiveSale(sale) && a.canSee('payments') && (a.can('money.financier') || a.can('money.commissions')) && (
        <Group label="Cobros y pagos">
          {m.financed && a.can('money.financier') && (
            <Row
              title="Pago de la financiera"
              subtitle={sale.fundedPaid ? `Recibido el ${dateWithYear(sale.fundedDate)}` : `Pendiente · ${money(m.pendingFinancier)}`}
              trailing={
                a.can('payments.financiers') && <button type="button" className={`btn small ${sale.fundedPaid ? 'gray' : 'success'}`} onClick={() => mark('fundedPaid', !sale.fundedPaid)}>
                  {sale.fundedPaid ? 'Deshacer' : <><CircleCheck size={16} /> Marcar recibido</>}
                </button>
              }
            />
          )}
          <Row
            title={`Comisión${person(sale.sellerId) ? ` · ${person(sale.sellerId)}` : ''}`}
            subtitle={
              sale.commission == null
                ? 'Sin registrar'
                : sale.commissionPaid
                  ? `${money(sale.commission)} pagada el ${dateWithYear(sale.commissionPaidDate)}`
                  : `${money(sale.commission)} por pagar`
            }
            trailing={
              a.can('payments.commissions') && sale.commission != null && sale.commission > 0 ? (
                <button type="button" className={`btn small ${sale.commissionPaid ? 'gray' : 'success'}`} onClick={() => mark('commissionPaid', !sale.commissionPaid)}>
                  {sale.commissionPaid ? 'Deshacer' : <><CircleCheck size={16} /> Marcar pagada</>}
                </button>
              ) : undefined
            }
          />
        </Group>
      )}

      <Group label="Seguimiento">
        <Row
          title="Próximo mantenimiento"
          value={
            sale.nextServiceDate ? (
              <Badge tone={sale.nextServiceDate < data.today ? 'red' : 'blue'}>
                {dateWithYear(sale.nextServiceDate)}
              </Badge>
            ) : (
              '—'
            )
          }
        />
        {sale.notes && <div className="row-block" style={{ whiteSpace: 'pre-wrap' }}>{sale.notes}</div>}
      </Group>

      {a.canSee('services') && <Section title="Servicio técnico de esta venta">
        <Group>
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} data={data} showClient={false} />
          ))}
          {services.length === 0 && !a.can('services.create') && <Empty inGroup title="Sin servicios" />}
          {a.can('services.create') && <Row
            className="action"
            to={`/servicio/nuevo?cliente=${sale.clientId}&venta=${sale.id}`}
            leading={<Wrench size={19} />}
            title="Reportar un problema o mantenimiento"
            chevron={false}
          />}
        </Group>
      </Section>}

      {a.can('sales.delete') && (
        <div className="group" style={{ marginTop: 34 }}>
          <button type="button" className="row danger" onClick={remove}>
            Borrar venta
          </button>
        </div>
      )}
      <p className="group-foot" style={{ textAlign: 'center' }}>
        Venta #{sale.id} · registrada por {sale.createdBy ?? '—'}
        {sale.updatedBy && sale.updatedAt !== sale.createdAt ? ` · editada por ${sale.updatedBy}` : ''}
      </p>
    </Page>
  );
}

/** Dinero para quien no ve las ganancias: solo las lineas de los montos que puede ver. */
function PriceCard({ sale }: { sale: Sale }) {
  const data = useData();
  const a = useAccess();
  const m = saleMoney(sale);
  const financier = sale.financierId ? data.financierById.get(sale.financierId)?.name : null;
  const payment = sale.paymentMethod === 'financed' ? `Financiado${financier ? ` · ${financier}` : ''}` : sale.paymentMethod === 'cash' ? 'Cash' : 'Sin registrar';
  const mine = a.personId != null;
  return (
    <Group label={a.prices ? 'Dinero' : 'Pago del cliente'}>
      <Row title="Forma de pago" value={payment} />
      {a.prices && (
        <>
          <Row title="Valor de la venta" value={<b style={{ color: 'var(--text)' }}>{sale.price == null ? '—' : money(sale.price)}</b>} />
          {sale.paymentMethod === 'financed' && <Row title="Abono en cash" value={money(sale.cashDown ?? 0)} />}
          {sale.paymentMethod === 'cash' && <Row title="Cobrado" value={sale.cashDown == null ? '—' : money(sale.cashDown)} />}
          {m.pendingClient > 0 && <Row title="El cliente debe" value={<span className="orange">{money(m.pendingClient)}</span>} />}
          {a.can('money.financier') && sale.paymentMethod === 'financed' && (
            <>
              <Row title="Pagó la financiera" value={sale.fundedAmount == null ? '—' : money(sale.fundedAmount)} />
              {m.financierFee != null && <Row title="Descuento de la financiera" value={`${money(m.financierFee)} (${percentText(m.financierFee, m.financedAmount)})`} />}
            </>
          )}
        </>
      )}
      {sale.commission != null && (a.can('money.commissions') || (mine && sale.sellerId === a.personId)) && (
        <Row
          title={mine && sale.sellerId === a.personId ? 'Tu comisión' : `Comisión${sale.sellerId ? ` · ${data.personById.get(sale.sellerId)?.name ?? ''}` : ''}`}
          value={<>{money(sale.commission)} {sale.commissionPaid ? <Badge tone="green">Pagada</Badge> : <Badge tone="violet">Pendiente</Badge>}</>}
        />
      )}
      {sale.installerPay != null && (a.can('money.techpay') || (mine && sale.installerId === a.personId)) && (
        <Row
          title={mine && sale.installerId === a.personId ? 'Tu pago por instalar' : 'Pago al técnico'}
          value={<>{money(sale.installerPay)} {sale.installerPaid ? <Badge tone="green">Pagado</Badge> : <Badge tone="orange">Pendiente</Badge>}</>}
        />
      )}
      {a.can('money.costs') &&
        sale.suppliers.map((row) => (
          <Row key={row.supplierId} title={`Proveedor: ${data.supplierById.get(row.supplierId)?.name ?? '—'}`} value={row.cost == null ? 'Sin costo' : money(row.cost)} />
        ))}
    </Group>
  );
}

function MoneyLine({ label, value, note, strong, tone }: { label: string; value: number | null; note?: string; strong?: boolean; tone?: 'orange' }) {
  return (
    <div className={`money-line${value != null && value < 0 ? ' minus' : ''}`} style={strong ? { fontWeight: 600 } : undefined}>
      <span>{label}</span>
      <span className={`v${tone ? ' ' + tone : ''}`}>
        {note ? <span className="muted">{note}</span> : value == null ? '—' : value < 0 ? `− ${money(-value)}` : money(value)}
      </span>
    </div>
  );
}
