import { MapPin, MessageCircle, Phone, Plus, Wrench } from 'lucide-react';
import { SOURCE_LABEL, formatAddress, isActiveSale, saleMoney } from '../../../shared/domain.ts';
import { useData, useStore } from '../lib/store.tsx';
import { Link, navigate } from '../lib/router.tsx';
import { api } from '../lib/api.ts';
import { dateWithYear, localDate, mapsHref, money, plural, telHref, whatsappHref } from '../lib/format.ts';
import { Avatar, Empty, Group, Page, Row, Section } from '../ui/kit.tsx';
import { SaleRow, ServiceRow } from '../ui/items.tsx';
import { useFeedback } from '../ui/sheet.tsx';

export function ClientDetail({ id }: { id: number }) {
  const data = useData();
  const { reload } = useStore();
  const { confirm, toast } = useFeedback();
  const client = data.clientById.get(id);

  if (!client) {
    return (
      <Page title="Cliente" back={{ label: 'Clientes', to: '/clientes' }}>
        <Empty title="Este cliente no existe" text="Puede que se haya borrado." />
      </Page>
    );
  }

  const sales = data.salesByClient.get(id) ?? [];
  const services = data.servicesByClient.get(id) ?? [];
  const fullAddress = formatAddress(client);
  const counted = sales.filter(isActiveSale);
  const lifetime = counted.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const profit = counted.reduce((sum, s) => sum + saleMoney(s).profit, 0);
  const estimated = counted.some((s) => saleMoney(s).estimate);

  const remove = async () => {
    const ok = await confirm({
      title: `¿Borrar a ${client.name}?`,
      message:
        sales.length || services.length
          ? `También se borrarán ${plural(sales.length, 'venta', 'ventas')} y ${plural(services.length, 'servicio', 'servicios')}. No se puede deshacer.`
          : 'No se puede deshacer.',
      confirm: 'Borrar cliente',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/clients/${id}`, { method: 'DELETE' });
      await reload();
      toast('Cliente borrado');
      navigate('/clientes', { replace: true });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <Page
      title={client.name}
      hideTitle
      back={{ label: 'Clientes', to: '/clientes' }}
      actions={
        <Link to={`/clientes/${id}/editar`} className="link-btn strong">
          Editar
        </Link>
      }
      narrow
    >
      <div className="hero-head">
        <Avatar name={client.name} size="lg" />
        <h1 className="large-title">{client.name}</h1>
        <p className="muted">
          {[client.city, sales.length ? plural(sales.length, 'venta', 'ventas') : 'Sin venta registrada'].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="quick-actions">
        <a className="quick-action" href={client.phone ? telHref(client.phone) : undefined} aria-disabled={!client.phone}>
          <Phone size={22} />
          Llamar
        </a>
        <a className="quick-action" href={client.phone ? whatsappHref(client.phone) : undefined} target="_blank" rel="noopener" aria-disabled={!client.phone}>
          <MessageCircle size={22} />
          WhatsApp
        </a>
        <a className="quick-action" href={fullAddress ? mapsHref(fullAddress) : undefined} target="_blank" rel="noopener" aria-disabled={!fullAddress}>
          <MapPin size={22} />
          Mapa
        </a>
        <Link className="quick-action" to={`/ventas/nueva?cliente=${id}`}>
          <Plus size={22} />
          Venta
        </Link>
      </div>

      <Group>
        <Row title="Teléfono" value={client.phone ? <a href={telHref(client.phone)}>{client.phone}</a> : <span className="faint">—</span>} />
        {client.phone2 && <Row title="Teléfono 2" value={<a href={telHref(client.phone2)}>{client.phone2}</a>} />}
        {client.email && <Row title="Correo" value={<a href={`mailto:${client.email}`}>{client.email}</a>} />}
        <Row title="Dirección" subtitle={fullAddress || '—'} />
        {client.language && <Row title="Idioma" value={client.language === 'es' ? 'Español' : 'Inglés'} />}
        {client.source && <Row title="Cómo nos conoció" value={SOURCE_LABEL[client.source]} />}
      </Group>

      {client.notes && (
        <Group label="Notas">
          <div className="row-block" style={{ whiteSpace: 'pre-wrap' }}>{client.notes}</div>
        </Group>
      )}

      <Section title="Equipos y ventas">
        <Group footer={sales.length > 0 ? `Total vendido ${money(lifetime)} · ganancia ${estimated ? '≈ ' : ''}${money(profit)}` : undefined}>
          {sales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} data={data} showClient={false} />
          ))}
          <Row
            className="action"
            to={`/ventas/nueva?cliente=${id}`}
            leading={<Plus size={20} />}
            title={sales.length ? 'Otra venta para este cliente' : 'Registrar su venta'}
            chevron={false}
          />
        </Group>
      </Section>

      <Section title="Servicio técnico">
        <Group>
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} data={data} showClient={false} />
          ))}
          <Row
            className="action"
            to={`/servicio/nuevo?cliente=${id}`}
            leading={<Wrench size={19} />}
            title="Reportar un problema o mantenimiento"
            chevron={false}
          />
        </Group>
      </Section>

      <div className="group" style={{ marginTop: 34 }}>
        <button type="button" className="row danger" onClick={remove}>
          Borrar cliente
        </button>
      </div>
      <p className="group-foot" style={{ textAlign: 'center' }}>Registrado el {dateWithYear(localDate(client.createdAt))}</p>
    </Page>
  );
}
