import { useMemo, useState } from 'react';
import { Download, Receipt } from 'lucide-react';
import { equipmentSummary, normalize, saleMoney } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { Link } from '../lib/router.tsx';
import { download } from '../lib/api.ts';
import { moneyRound, plural } from '../lib/format.ts';
import { PERIODS, SALE_FILTERS, inRange, periodRange, saleMatches, totals, type PeriodKey, type SaleFilter } from '../lib/stats.ts';
import { AddButton, Chips, Empty, Group, Page, SearchBox, Segmented } from '../ui/kit.tsx';
import { SaleRow } from '../ui/items.tsx';

export function Sales({ initialFilter }: { initialFilter: string | null }) {
  const data = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SaleFilter>(SALE_FILTERS.some((f) => f.key === initialFilter) ? (initialFilter as SaleFilter) : 'all');
  const [period, setPeriod] = useState<PeriodKey>('all');
  const range = periodRange(period, data.today);

  const inPeriod = useMemo(() => data.sales.filter((s) => inRange(s.saleDate, range)), [data.sales, range.from, range.to]);

  const counts = useMemo(
    () => Object.fromEntries(SALE_FILTERS.map((f) => [f.key, inPeriod.filter((s) => saleMatches(s, f.key, data.today)).length])),
    [inPeriod, data.today]
  );

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return inPeriod.filter((sale) => {
      if (!saleMatches(sale, filter, data.today)) return false;
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
      headerAction={
        <AddButton to="/ventas/nueva" label="Venta" />
      }
    >
      <div className="toolbar">
        <div className="toolbar inline" style={{ marginBottom: 0 }}>
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar venta" />
          <div className="period" style={{ minWidth: 0 }}>
            <Segmented options={PERIODS.map((p) => ({ value: p.key, label: p.label }))} value={period} onChange={setPeriod} label="Periodo" />
          </div>
        </div>
        <Chips<SaleFilter> value={filter} onChange={setFilter} options={SALE_FILTERS.map((f) => ({ ...f, count: f.key === 'all' ? undefined : counts[f.key] }))} />
      </div>

      {data.sales.length === 0 ? (
        <Empty
          icon={<Receipt size={40} />}
          title="Aún no hay ventas"
          text="Registra la venta de hoy o ponte al día con tus clientes anteriores."
          action={
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
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
            <span><b>{plural(t.count, 'venta', 'ventas')}</b></span>
            {collect && <span>Te deben <b style={{ color: 'var(--orange)' }}>{moneyRound(owed)}</b></span>}
            {!collect && <span>Vendido <b>{moneyRound(t.sold)}</b></span>}
            {!collect && <span>Ganancia <b>{t.estimates ? '≈ ' : ''}{moneyRound(t.profit)}</b></span>}
            {!collect && t.commission > 0 && <span>Comisiones <b>{moneyRound(t.commission)}</b></span>}
            <button type="button" className="link-btn" style={{ marginLeft: 'auto', padding: 0, fontSize: 14 }} onClick={() => download('/export/sales')}>
              <Download size={14} style={{ verticalAlign: -2 }} /> Excel
            </button>
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
