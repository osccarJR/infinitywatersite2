/**
 * Reporte de mantenimiento para el tecnico (una pagina carta): a quien va,
 * donde, cuando y por que, el equipo que tiene el cliente, las visitas
 * anteriores (instalacion y servicios) y espacio para que el tecnico anote
 * lo que hizo y el cliente firme. Se imprime o se guarda en PDF.
 */
import { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { SERVICE_KIND_LABEL, WATER_LABEL, equipmentSummary, formatAddress } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { dateWithYear, formatPhone, longDate } from '../lib/format.ts';
import { INVOICE_COMPANY, installAddress, mapsLink } from '../lib/install.ts';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** Cuantas visitas anteriores caben en la pagina. */
const HISTORY_ROWS = 5;

export function ServicePrint({ id }: { id: number }) {
  const data = useData();
  const service = data.services.find((s) => s.id === id);

  useEffect(() => {
    if (!service) return;
    document.title = `Reporte de mantenimiento #${service.id}`;
    const timer = setTimeout(() => window.print(), 700);
    return () => clearTimeout(timer);
  }, [service]);

  if (!service) {
    return (
      <div className="wp-missing">
        <p>Este servicio no existe o no tienes acceso.</p>
        <a href="/admin/servicio">Volver</a>
      </div>
    );
  }

  const client = data.clientById.get(service.clientId);
  const clientSales = data.salesByClient.get(service.clientId) ?? [];
  const sale = (service.saleId ? data.sales.find((s) => s.id === service.saleId) : undefined) ?? clientSales[0];
  // La direccion donde esta el equipo; si no hay venta, la del cliente.
  const address = sale
    ? installAddress(sale, client)
    : {
        street: client?.address ?? '',
        cityLine: [client?.city, [client?.state, client?.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        full: formatAddress({ address: client?.address, city: client?.city, state: client?.state, zip: client?.zip }),
      };
  const phones = [client?.phone, client?.phone2].filter((x): x is string => Boolean(x)).map(formatPhone).join(' / ');
  const tech = service.technicianId ? data.personById.get(service.technicianId) : undefined;
  const brandName = (sale?.brandId ? data.brands.find((b) => b.id === sale.brandId)?.name : '') ?? '';
  const magic = /magic/i.test(brandName);
  const personName = (pid: number | null) => (pid ? data.personById.get(pid)?.name ?? '' : '');

  // Todas las visitas al cliente en orden: instalaciones y servicios.
  const visits = [
    ...clientSales
      .filter((s) => s.status === 'active' || s.status === 'uninstalled')
      .map((s) => ({ key: `s${s.id}`, day: s.installDate ?? s.saleDate, order: 0, id: s.id, kind: 'Instalación', tech: personName(s.installerId), detail: equipmentSummary(s.equipment), current: false })),
    ...(data.servicesByClient.get(service.clientId) ?? [])
      // Otros servicios que todavia no tienen visita no son visitas pasadas.
      .filter((v) => v.id === service.id || v.visitDate || v.status === 'closed')
      .map((v) => ({
      key: `v${v.id}`,
      day: v.visitDate ?? v.reportedDate,
      order: 1,
      id: v.id,
      kind: `Servicio · ${SERVICE_KIND_LABEL[v.kind]}`,
      tech: personName(v.technicianId),
      detail: v.solution ? `${v.problem} → ${v.solution}` : v.problem,
      current: v.id === service.id,
    })),
  ].sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order || a.id - b.id);
  const visitNumber = visits.findIndex((v) => v.current) + 1;
  const before = visits.slice(0, visitNumber - 1);
  const shown = before.slice(-HISTORY_ROWS);
  const hidden = before.length - shown.length;
  const serviceCount = visits.slice(0, Math.max(visitNumber, 0)).filter((v) => v.order === 1).length;

  const when = service.visitDate ? `${cap(longDate(service.visitDate))} de ${service.visitDate.slice(0, 4)}` : 'Por confirmar';
  const billing = service.billing === 'warranty' ? 'Garantía (sin costo)' : service.billing === 'charged' ? 'Con costo para el cliente' : '';

  return (
    <div className="wp-root">
      <div className="wp-toolbar no-print">
        <button type="button" onClick={() => (history.length > 1 ? history.back() : window.close())}>
          <ArrowLeft size={18} /> Volver
        </button>
        <span>Reporte de mantenimiento · {client?.name}</span>
        <button type="button" className="primary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir o guardar PDF
        </button>
      </div>

      <div className="wp-page sp-page">
        <header className="wp-header">
          <img src={magic ? '/admin/logo-magic.webp' : '/admin/logo-infinity.webp'} alt={magic ? 'Magic Water' : 'Infinity Water'} />
          <div className="wp-contact">
            {INVOICE_COMPANY.street} | {INVOICE_COMPANY.cityLine}
            <br />
            {INVOICE_COMPANY.phone}
          </div>
        </header>

        <div className="sp-title">
          <h1>REPORTE DE MANTENIMIENTO</h1>
          <span>
            Servicio #{service.id}
            {visitNumber > 0 && ` · Visita n.º ${visitNumber} al cliente`}
            {serviceCount > 0 && ` · ${serviceCount}.º servicio`}
          </span>
        </div>

        <table className="wp-table sp-table">
          <tbody>
            <tr className="wp-label">
              <td>CLIENTE</td>
              <td>TELÉFONO</td>
            </tr>
            <tr>
              <td className="sp-big">{client?.name}</td>
              <td className="sp-big">{phones || '—'}</td>
            </tr>
            <tr className="wp-label">
              <td>DIRECCIÓN</td>
              <td>FECHA Y HORA DE LA VISITA</td>
            </tr>
            <tr>
              <td>
                {address.street || '—'}
                {address.cityLine && (
                  <>
                    <br />
                    {address.cityLine}
                  </>
                )}
                {address.full && (
                  <a className="sp-map" href={mapsLink(address.full)}>
                    Ver en Google Maps
                  </a>
                )}
              </td>
              <td>
                <b>{when}</b>
                <br />
                {service.visitTime ? `${service.visitTime} (hora de Florida)` : 'Hora por confirmar'}
              </td>
            </tr>
            <tr className="wp-label">
              <td>TÉCNICO ASIGNADO</td>
              <td>TIPO DE SERVICIO</td>
            </tr>
            <tr>
              <td className="sp-big">{tech?.name ?? 'Por asignar'}</td>
              <td>
                {SERVICE_KIND_LABEL[service.kind]}
                {billing && (
                  <>
                    <br />
                    <span className="sp-muted">{billing}</span>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <section className="sp-box sp-reason">
          <h2>MOTIVO DE LA VISITA</h2>
          <p>{service.problem}</p>
        </section>

        {sale && (
          <section className="sp-box">
            <h2>EQUIPO DEL CLIENTE</h2>
            <p>
              <b>{equipmentSummary(sale.equipment)}</b>
              {brandName && ` · ${brandName}`}
              <br />
              <span className="sp-muted">
                Instalado el {dateWithYear(sale.installDate ?? sale.saleDate)}
                {sale.installerId ? ` por ${personName(sale.installerId)}` : ''}
                {sale.waterSource ? ` · ${WATER_LABEL[sale.waterSource]}` : ''}
              </span>
            </p>
          </section>
        )}

        {before.length > 0 && (
          <section className="sp-history">
            <h2>VISITAS ANTERIORES</h2>
            <table>
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Visita</th>
                  <th>Técnico</th>
                  <th>Qué pasó / qué se hizo</th>
                </tr>
              </thead>
              <tbody>
                {hidden > 0 && (
                  <tr>
                    <td colSpan={5} className="sp-muted">
                      … y {hidden} {hidden === 1 ? 'visita anterior' : 'visitas anteriores'}
                    </td>
                  </tr>
                )}
                {shown.map((v) => (
                  <tr key={v.key}>
                    <td>{visits.indexOf(v) + 1}</td>
                    <td className="sp-nowrap">{dateWithYear(v.day)}</td>
                    <td>{v.kind}</td>
                    <td>{v.tech || '—'}</td>
                    <td className="sp-detail">
                      <div className="sp-clamp">{v.detail}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="sp-box sp-fill">
          <h2>PARA LLENAR EL TÉCNICO</h2>
          <div className="sp-fields">
            <span>Hora de llegada: ________</span>
            <span>Hora de salida: ________</span>
            <span>TDS / PPM antes: ______ después: ______</span>
          </div>
          <div className="sp-label">Trabajo realizado</div>
          {service.solution ? <p className="sp-written">{service.solution}</p> : <div className="sp-lines" style={{ height: '1in' }} />}
          <div className="sp-label">Repuestos o materiales usados</div>
          <div className="sp-lines" style={{ height: '0.5in' }} />
        </section>

        <table className="wp-sign sp-sign">
          <tbody>
            <tr className="wp-sign-head">
              <td>TÉCNICO</td>
              <td>CLIENTE (CONFORME CON EL SERVICIO)</td>
            </tr>
            <tr>
              <td>
                <div className="wp-sign-line" />
                {tech?.name ?? 'Nombre y firma'}
              </td>
              <td>
                <div className="wp-sign-line" />
                {client?.name}
              </td>
            </tr>
          </tbody>
        </table>

        <footer className="wp-footer">
          <span>
            {INVOICE_COMPANY.name} | {INVOICE_COMPANY.street}, {INVOICE_COMPANY.cityLine}
          </span>
          <span>Reporte de mantenimiento · Servicio #{service.id}</span>
        </footer>
      </div>
    </div>
  );
}
