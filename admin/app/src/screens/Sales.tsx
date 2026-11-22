import { useMemo, useState } from 'react';
import { Download, Receipt } from 'lucide-react';
import { equipmentSummary, isActiveSale, normalize, saleMissing, saleMoney } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { Link } from '../lib/router.tsx';
import { useAccess, visibleMissing } from '../lib/access.ts';
import { exportSales } from '../lib/exports.ts';
import { useFeedback } from '../ui/sheet.tsx';
import { moneyRound, plural } from '../lib/format.ts';
import { PERIODS, SALE_FILTERS, inRange, periodRange, saleMatches, totals, type PeriodKey, type SaleFilter } from '../lib/stats.ts';
import { AddButton, Chips, Empty, Group, Page, SearchBox, Segmented } from '../ui/kit.tsx';
import { SaleRow } from '../ui/items.tsx';

export function Sales({ initialFilter }: { initialFilter: string | null }) {
  const data = useData();
  const a = useAccess();
  const { toast } = useFeedback();
  // Filtros de dinero solo para quien ve esos montos.
  const filters = SALE_FILTERS.filter((f) => (f.key === 'to_collect' ? a.prices && a.can('money.financier') : f.key === 'commission' ? a.can('money.commissions') : true));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SaleFilter>(filters.some((f) => f.key === initialFilter) ? (initialFilter as SaleFilter) : 'all');
  const [period, setPeriod] = useState<PeriodKey>('all');
  const range = periodRange(period, data.today);

  const inPeriod = useMemo(() => data.sales.filter((s) => inRange(s.saleDate, range)), [data.sales, range.from, range.to]);

  const counts = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.key, inPeriod.filter((s) => (f.key === 'incomplete' ? isActiveSale(s) && visibleMissing(saleMissing(s), a).length > 0 : saleMatches(s, f.key, data.today))).length])),
    [inPeriod, data.today, a]
  );

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return inPeriod.filter((sale) => {
      if (filter === 'incomplete' ? !(isActiveSale(sale) && visibleMissing(saleMissing(sale), a).length > 0) : !saleMatches(sale, filter, data.today)) return false;
      if (!q) return true;
      const client = data.clientById.get(sale.clientId);
      const people = [sale.sellerId, sale.installerId].map((id) => (id ? data.personById.get(id)?.name : '')).join(' ');
      const financier = sale.financierId ? data.financierById.get(sale.financierId)?.name : '';
      return normalize(
        `${client?.name} ${client?.phone} ${client?.city} ${sale.installCity ?? ''} ${equipmentSummary(sale.equipment)} ${people} ${financier} #${sale.id}`
      ).includes(q);
    });
  }, [inPeriod, filter, query, data]);

  const collect = filter === 'to_collect';
  // En "Por cobrar", lo mas antiguo primero (lo que lleva mas tiempo esperando).
  const shown = collect ? [...list].sort((a, b) => (a.installDate ?? a.saleDate).localeCompare(b.installDate ?? b.saleDate)) : list;
  const t = totals(list);
  const owed = list.reduce((sum, s) => {
    const m = saleMoney(s);
    return sum + m.pendingFinancier + m.pendingClient;
  }, 0);

  return (
    <Page
      title="Ventas"
      subtitle={plural(data.sales.length, 'venta registrada', 'ventas registradas')}
      headerAction={a.can('sales.create') ? <AddButton to="/ventas/nueva" label="Venta" /> : undefined}
    >
      <div className="toolbar">
        <div className="toolbar inline" style={{ marginBottom: 0 }}>
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar venta" />
          <div className="period" style={{ minWidth: 0 }}>
            <Segmented options={PERIODS.map((p) => ({ value: p.key, label: p.label }))} value={period} onChange={setPeriod} label="Periodo" />
          </div>
        </div>
        <Chips<SaleFilter> value={filter} onChange={setFilter} options={filters.map((f) => ({ ...f, count: f.key === 'all' ? undefined : counts[f.key] }))} />
      </div>

      {data.sales.length === 0 ? (
        <Empty
          icon={<Receipt size={40} />}
          title="Aún no hay ventas"
          text={a.can('sales.create') ? 'Registra la venta de hoy o ponte al día con tus clientes anteriores.' : a.scope === 'own' ? 'Aquí verás tus ventas e instalaciones.' : undefined}
          action={
            !a.can('sales.create') ? undefined : <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/ventas/nueva" className="btn">Venta nueva</Link>
              <Link to="/ventas/nueva?anterior=1" className="btn gray">Cliente anterior</Link>
            </div>
          }
        />
      ) : list.length === 0 ? (
        <Empty title="Ninguna venta coincide" text="Cambia el periodo, el filtro o la búsqueda." />
      ) : (
        <>
          <div className="totals">
            {filter === 'inactive' ? (
              <span>
                <b>{plural(list.length, 'venta', 'ventas')}</b> que no siguieron{a.prices && <> · <b>{moneyRound(list.reduce((n, s) => n + (s.price ?? 0), 0))}</b> (no suman)</>}
              </span>
            ) : (
              <span><b>{plural(t.count, 'venta', 'ventas')}</b></span>
            )}
            {collect && <span>Te deben <b style={{ color: 'var(--orange)' }}>{moneyRound(owed)}</b></span>}
            {a.prices && !collect && filter !== 'inactive' && <span>Vendido <b>{moneyRound(t.sold)}</b></span>}
            {a.costs && !collect && filter !== 'inactive' && <span>Ganancia <b>{t.estimates ? '≈ ' : ''}{moneyRound(t.profit)}</b></span>}
            {a.can('money.commissions') && !collect && filter !== 'inactive' && t.commission > 0 && <span>Comisiones <b>{moneyRound(t.commission)}</b></span>}
            {a.export && (
              <button
                type="button"
                className="link-btn"
                style={{ marginLeft: 'auto', padding: 0, fontSize: 14 }}
                onClick={() => {
                  try {
                    exportSales(shown, data, a);
                    toast('Descargado. Ábrelo con Excel o Google Sheets (está en Descargas).');
                  } catch (err: any) {
                    toast(err.message, 'error');
                  }
                }}
              >
                <Download size={14} style={{ verticalAlign: -2 }} /> Excel
              </button>
            )}
          </div>
          <Group>
            {shown.map((sale) => (
              <SaleRow key={sale.id} sale={sale} data={data} collect={collect} />
            ))}
          </Group>
        </>
      )}
    </Page>
  );
}
