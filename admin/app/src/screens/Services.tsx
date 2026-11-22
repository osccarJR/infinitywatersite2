import { useMemo, useState } from 'react';
import { Download, Wrench } from 'lucide-react';
import { normalize } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { Link } from '../lib/router.tsx';
import { download } from '../lib/api.ts';
import { money, plural } from '../lib/format.ts';
import { serviceTotals } from '../lib/stats.ts';
import { AddButton, Chips, Empty, Group, Page, SearchBox } from '../ui/kit.tsx';
import { ServiceRow } from '../ui/items.tsx';

type Filter = 'open' | 'closed' | 'all';

export function Services({ initialFilter }: { initialFilter: string | null }) {
  const data = useData();
  const openCount = data.services.filter((s) => s.status === 'open').length;
  const [filter, setFilter] = useState<Filter>(
    initialFilter === 'closed' || initialFilter === 'all' ? initialFilter : openCount ? 'open' : 'all'
  );
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return data.services.filter((service) => {
      if (filter !== 'all' && service.status !== filter) return false;
      if (!q) return true;
      const client = data.clientById.get(service.clientId);
      const tech = service.technicianId ? data.personById.get(service.technicianId)?.name : '';
      return normalize(`${client?.name} ${client?.phone} ${client?.city} ${service.problem} ${service.solution ?? ''} ${tech}`).includes(q);
    });
  }, [data, filter, query]);

  const t = serviceTotals(list);

  return (
    <Page
      title="Servicio técnico"
      subtitle={openCount ? plural(openCount, 'servicio abierto', 'servicios abiertos') : 'Todo resuelto'}
      headerAction={
        <AddButton to="/servicio/nuevo" label="Servicio" />
      }
    >
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Cliente, problema o técnico" />
        <Chips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'open', label: 'Abiertos', count: openCount },
            { key: 'closed', label: 'Resueltos' },
            { key: 'all', label: 'Todos' },
          ]}
        />
      </div>

      {data.services.length === 0 ? (
        <Empty
          icon={<Wrench size={40} />}
          title="Sin servicios todavía"
          text="Cuando un cliente reporte un problema, anótalo aquí: qué pasó, quién fue, si fue garantía o se cobró."
          action={<Link to="/servicio/nuevo" className="btn">Registrar servicio</Link>}
        />
      ) : list.length === 0 ? (
        <Empty title={filter === 'open' ? 'Ningún servicio abierto' : 'Sin resultados'} />
      ) : (
        <>
          <div className="totals">
            <span><b>{plural(t.count, 'servicio', 'servicios')}</b></span>
            <span>Garantía <b>{t.warranty}</b></span>
            <span>Cobrado <b>{money(t.chargedAmount)}</b></span>
            {t.technician > 0 && <span>Técnicos <b>{money(t.technician)}</b></span>}
            <span>Ganancia <b>{money(t.profit)}</b></span>
            <button type="button" className="link-btn" style={{ marginLeft: 'auto', padding: 0, fontSize: 14 }} onClick={() => download('/export/services')}>
              <Download size={14} style={{ verticalAlign: -2 }} /> Excel
            </button>
          </div>
          <Group>
            {list.map((service) => (
              <ServiceRow key={service.id} service={service} data={data} />
            ))}
          </Group>
        </>
      )}
    </Page>
  );
}
