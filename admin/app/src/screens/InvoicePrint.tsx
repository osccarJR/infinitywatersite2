/**
 * Factura en ingles emitida por Global Innovations Group, LLC, lista para
 * imprimir o guardar en PDF (tamano carta). Sigue el formato de las facturas
 * de proveedor que usa el negocio: datos del emisor y numero arriba, Sold To /
 * Ship To, lineas con SN# y el pie con vencimiento, condiciones y total.
 */
import { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { invoiceLabel, invoiceTotals } from '../../../shared/domain.ts';
import { useData } from '../lib/store.tsx';
import { INVOICE_COMPANY, INVOICE_LABOR, installAddress } from '../lib/install.ts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-11-10" -> "2026-Nov-10" (como en la factura modelo). */
const ymd = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}-${MONTHS[Number(m) - 1]}-${d}`;
};
const amount = (cents: number, decimals = 2) =>
  (cents / 100).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function InvoicePrint({ id }: { id: number }) {
  const data = useData();
  const sale = data.sales.find((s) => s.id === id);
  const inv = sale?.invoice;

  useEffect(() => {
    if (!inv) return;
    document.title = `Invoice ${invoiceLabel(inv.number)}`;
    // Espera a que cargue el logo y abre el dialogo de impresion.
    const timer = setTimeout(() => window.print(), 700);
    return () => clearTimeout(timer);
  }, [inv]);

  if (!sale || !inv) {
    return (
      <div className="wp-missing">
        <p>{sale ? 'Esta venta todavía no tiene factura. Emítela desde la venta.' : 'Esta venta no existe o no tienes acceso.'}</p>
        <a href={sale ? `/admin/ventas/${id}` : '/admin/ventas'}>Volver</a>
      </div>
    );
  }

  const client = data.clientById.get(sale.clientId);
  const ship = installAddress(sale, client);
  const billCity = [client?.city, [client?.state, client?.zip].filter(Boolean).join(' ')].filter(Boolean).join(' ');
  const phones = [client?.phone, client?.phone2].filter(Boolean).join(' / ');
  const t = invoiceTotals(inv);
  const taxed = inv.taxRate > 0;
  const brandName = inv.brand === 'magic' ? 'Magic Water' : 'Infinity Water';
  const upper = (s: string | null | undefined) => (s ?? '').toUpperCase();

  return (
    <div className="wp-root">
      <div className="wp-toolbar no-print">
        <button type="button" onClick={() => (history.length > 1 ? history.back() : window.close())}>
          <ArrowLeft size={18} /> Volver
        </button>
        <span>
          Factura {invoiceLabel(inv.number)} · {client?.name}
        </span>
        <button type="button" className="primary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir o guardar PDF
        </button>
      </div>

      <div className="wp-page ip-page">
        <div className="ip-top">
          <div className="ip-box ip-issuer">
            <img src={inv.brand === 'magic' ? '/admin/logo-magic.webp' : '/admin/logo-infinity.webp'} alt={brandName} />
            <div>
              {INVOICE_COMPANY.name}
              <br />
              {INVOICE_COMPANY.street}
              <br />
              {INVOICE_COMPANY.cityLine}
              <br />
              Phone: {INVOICE_COMPANY.phone}
            </div>
          </div>
          <div className="ip-box ip-meta">
            <h1>Invoice - {invoiceLabel(inv.number)}</h1>
            <dl>
              <dt>Page No</dt>
              <dd>1</dd>
              <dt>Date</dt>
              <dd>{ymd(inv.issueDate)}</dd>
              <dt>Customer</dt>
              <dd>{sale.clientId}</dd>
              <dt>Brand</dt>
              <dd>{brandName}</dd>
              <dt>Related PO/SO/WO Number</dt>
              <dd>{inv.customerPo}</dd>
              <dt>Order Number</dt>
              <dd>{sale.id} SO</dd>
              <dt>Invoice</dt>
              <dd>{invoiceLabel(inv.number)}</dd>
            </dl>
          </div>
        </div>

        <div className="ip-top">
          <div className="ip-box ip-party">
            <h2>Sold To</h2>
            <p>
              {upper(client?.name)}
              <br />
              {upper(client?.address)}
              {billCity && (
                <>
                  <br />
                  {upper(billCity)}
                </>
              )}
              <br />
              United States
            </p>
          </div>
          <div className="ip-box ip-party">
            <h2>Ship To</h2>
            <p>
              {upper(client?.name)}
              <br />
              {upper(ship.street)}
              {ship.cityLine && (
                <>
                  <br />
                  {upper(ship.cityLine.replace(',', ''))}
                </>
              )}
              <br />
              United States
            </p>
          </div>
        </div>

        <table className="ip-band">
          <tbody>
            <tr>
              <th>Requested</th>
              <th>Customer PO</th>
              <th>Freight</th>
              <th>Delivery Instructions</th>
            </tr>
            <tr>
              <td>{ymd(sale.saleDate)}</td>
              <td>{inv.customerPo}</td>
              <td>Installed on site{sale.installDate ? ` · ${ymd(sale.installDate)}` : ''}</td>
              <td>{phones}</td>
            </tr>
          </tbody>
        </table>

        <table className="ip-lines">
          <thead>
            <tr>
              <th>Line Number</th>
              <th>Description</th>
              <th>Item Number</th>
              <th>UM</th>
              <th className="r">Quantity</th>
              <th className="r">Unit Price</th>
              <th className="r">Extended Price</th>
              <th className="c">Tax</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((line, i) => {
              const included = line.unitPrice === 0 && line.description === INVOICE_LABOR;
              return (
                <tr key={i}>
                  <td>{(i + 1).toFixed(3)}</td>
                  <td>
                    {line.description}
                    {line.serial && <div className="ip-sn">SN#: {line.serial}</div>}
                  </td>
                  <td>{line.itemNumber}</td>
                  <td>EA</td>
                  <td className="r">{line.quantity.toFixed(2)}</td>
                  <td className="r">{included ? 'Included' : amount(line.unitPrice, 4)}</td>
                  <td className="r">{included ? '0.00' : amount(Math.round(line.quantity * line.unitPrice))}</td>
                  <td className="c">{taxed ? 'Y' : 'N'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="ip-foot">
          <div className="ip-total-head">
            <span>Total Order # {sale.id} SO</span>
          </div>
          <div className="ip-foot-row">
            <dl className="ip-terms">
              <dt>Due Date</dt>
              <dd>{ymd(inv.dueDate)}</dd>
              <dt>Tax Rate 1</dt>
              <dd>{inv.taxRate} %</dd>
              <dt>Payment Terms</dt>
              <dd>{inv.terms}</dd>
            </dl>
            <dl className="ip-sums">
              {(taxed || t.total !== t.balance) && (
                <>
                  <dt>Subtotal</dt>
                  <dd>{amount(t.subtotal)} USD</dd>
                </>
              )}
              {taxed && (
                <>
                  <dt>Sales tax ({inv.taxRate} %)</dt>
                  <dd>{amount(t.tax)} USD</dd>
                </>
              )}
              <dt className="strong">Total</dt>
              <dd className="strong">{amount(t.total)} USD</dd>
              {inv.amountPaid > 0 && (
                <>
                  <dt>Paid by customer</dt>
                  <dd>-{amount(inv.amountPaid)} USD</dd>
                </>
              )}
              {inv.financedAmount > 0 && (
                <>
                  <dt>Financed{inv.financedBy ? ` (${inv.financedBy})` : ''}</dt>
                  <dd>-{amount(inv.financedAmount)} USD</dd>
                </>
              )}
              {(inv.amountPaid > 0 || inv.financedAmount > 0) && (
                <>
                  <dt className="strong">Balance Due</dt>
                  <dd className="strong">{amount(t.balance)} USD</dd>
                </>
              )}
            </dl>
          </div>
        </div>

        <footer className="wp-footer ip-page-foot">
          <span>
            {INVOICE_COMPANY.name} | {INVOICE_COMPANY.street}, {INVOICE_COMPANY.cityLine}
          </span>
          <span>Page 1 of 1</span>
        </footer>
      </div>
    </div>
  );
}
