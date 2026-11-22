import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { equipmentSummary, normalize } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { useAccess } from '../lib/access.ts';
import { Link } from '../lib/router.tsx';
import { AddButton, Avatar, Badge, Chips, ContactRow, Empty, Group, Page, SearchBox } from '../ui/kit.tsx';

type Filter = 'all' | 'open' | 'no_sale';

export function Clients() {
  const data = useData();
  const a = useAccess();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const openByClient = useMemo(() => {
    const set = new Set<number>();
    data.services.forEach((s) => s.status === 'open' && set.add(s.clientId));
    return set;
  }, [data.services]);

  const list = useMemo(() => {
    const q = normalize(query.trim());
    const digits = query.replace(/\D/g, '');
    return data.clients.filter((c) => {
      if (filter === 'open' && !openByClient.has(c.id)) return false;
      if (filter === 'no_sale' && data.salesByClient.has(c.id)) return false;
      if (!q) return true;
      const text = normalize(`${c.name} ${c.address ?? ''} ${c.city ?? ''} ${c.zip ?? ''} ${c.email ?? ''}`);
      return text.includes(q) || (digits.length >= 3 && `${c.phone ?? ''}${c.phone2 ?? ''}`.replace(/\D/g, '').includes(digits));
    });
  }, [data, query, filter, openByClient]);

  const noSale = data.clients.filter((c) => !data.salesByClient.has(c.id)).length;

  return (
    <Page
      title="Clientes"
      subtitle={`${data.clients.length} en total`}
      headerAction={a.canEdit('clients') ? <AddButton to="/clientes/nuevo" label="Cliente" /> : undefined}
    >
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Nombre, teléfono o calle" />
        <Chips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'Todos' },
            { key: 'open', label: 'Con servicio abierto', count: openByClient.size },
            ...(a.canSee('sales') ? [{ key: 'no_sale' as const, label: 'Sin venta registrada', count: noSale }] : []),
          ]}
        />
      </div>

      {data.clients.length === 0 ? (
        <Empty
          icon={<Users size={40} />}
          title="Aún no hay clientes"
          text="Se crean solos al registrar una venta o un servicio. También puedes agregar uno suelto."
          action={a.canEdit('clients') ? <Link to="/clientes/nuevo" className="btn">Agregar cliente</Link> : undefined}
        />
      ) : list.length === 0 ? (
        <Empty title="Sin resultados" text="Prueba con otra parte del nombre, el teléfono o la calle." />
      ) : (
        <Group>
          {list.map((client) => {
            const sales = data.salesByClient.get(client.id) ?? [];
            const latest = sales[0];
            return (
              <ContactRow
                key={client.id}
                to={`/clientes/${client.id}`}
                phone={client.phone}
                leading={<Avatar name={client.name} />}
                title={client.name}
                subtitle={
                  <>
                    <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {[client.city, latest ? equipmentSummary(latest.equipment) : a.canSee('sales') ? 'Sin venta registrada' : null].filter(Boolean).join(' · ') || client.phone || '—'}
                    </span>
                    {openByClient.has(client.id) && (
                      <span className="badges">
                        <Badge tone="orange">Servicio abierto</Badge>
                      </span>
                    )}
                  </>
                }
              />
            );
          })}
        </Group>
      )}
    </Page>
  );
}
