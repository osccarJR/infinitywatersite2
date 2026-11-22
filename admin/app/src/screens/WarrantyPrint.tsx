/**
 * Garantia de MAGIC WATER lista para imprimir o guardar en PDF (dos paginas
 * tamano carta, igual que el modelo del negocio). Se abre en una pestana
 * aparte y lanza el dialogo de impresion; ahi se elige la impresora o
 * "Guardar como PDF".
 */
import { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useData } from '../lib/store.tsx';
import { installAddress, warrantyDraft } from '../lib/install.ts';

const longEn = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const dateEn = (iso: string) => longEn.format(new Date(`${iso}T12:00:00Z`));

const CLAUSES_1: [string, string][] = [
  [
    '1. Limited operational coverage',
    "MAGIC WATER provides a limited operational warranty for 5 years from the issue/installation date shown above. This warranty covers only verifiable operational defects in equipment installed by authorized MAGIC WATER personnel. The customer's exclusive remedy is, at MAGIC WATER's option, diagnosis, repair, adjustment or replacement of the part MAGIC WATER determines to be defective. This is not a money-back or personal satisfaction guarantee, or a guarantee of taste, odor, color or specific water levels when the source is a well or the water quality changes.",
  ],
  [
    '2. Consumables, filters, prefilters, membranes and lamps',
    "Filters, prefilters, cartridges, UV lamps, resins, minerals, salt, filter media and reverse osmosis membranes are consumables subject to wear, saturation, scaling, iron, hardness, tannins, bacteria, sediment, pressure, temperature, water quality and frequency of use. Except for an initial defect verified by MAGIC WATER, their replacement, maintenance or cleaning is the customer's responsibility. After the warranty period, the customer pays for all replacement membranes, filters, parts and labor.",
  ],
  [
    '3. Well water and source changes',
    'The customer acknowledges that well water may change without notice in PPM/TDS, hardness, iron, manganese, sulfur, odor, color, turbidity, bacteria, tannins and other contaminants. MAGIC WATER is not responsible for natural or chemical variations in the well, or damage or reduced performance caused by such variations. If the well changes, the customer must pay for any required testing, adjustments, maintenance, parts or additional equipment.',
  ],
  [
    '4. Well system, pump and existing components',
    'The well, pump, motor, wiring, breaker, pressure, pressure tank, pressure switch, existing piping, drains, water heater, refrigerator, ice maker and any component not installed or sold by MAGIC WATER are the sole responsibility of the owner/customer. MAGIC WATER does not warrant or repair pre-existing systems unless separately agreed in writing and paid for.',
  ],
  [
    '5. Proper use and required maintenance',
    'The customer must operate the system according to MAGIC WATER instructions, maintain adequate salt where applicable, avoid pool salt or other non-recommended products, allow proper drainage, replace filters and membranes at recommended intervals and promptly report failures. Lack of maintenance or salt, improper use, incorrect bypass settings, tampering, disconnection or third-party service voids the warranty, subject to applicable law.',
  ],
];

const CLAUSES_2: [string, string][] = [
  [
    '6. Electrical, voltage and natural-event exclusions',
    "Damage from low or high voltage, power surges, outages, lightning, generators, short circuits, breaker failure, incorrect connections, lack of a voltage regulator, fire, smoke, flooding, hurricanes, tropical storms, wind, rain, earthquakes, freezing, acts of God, natural disasters, emergencies, government orders or events beyond MAGIC WATER's reasonable control is not covered.",
  ],
  [
    '7. General exclusions',
    'The warranty is voided by customer negligence, abusive use, unauthorized relocation, system modification, additional third-party installation, animal or insect damage, impact, vandalism, external contamination, inadequate water pressure, blocked drains, defective piping, lack of equipment access, unauthorized commercial use or conditions unrelated to the installed work, subject to applicable law.',
  ],
  [
    '8. Leaks, reporting and mitigation',
    'If a leak, noise, odor, failure, alarm or abnormal behavior occurs, the customer must shut off the water, turn off the equipment when safe, protect the property and notify MAGIC WATER in writing within 24 hours. The warranty does not cover secondary damage to furniture, floors, cabinets, walls or appliances, or lost income, hotels, bottled water, food, plants, animals or other consequential losses, especially if the customer failed to mitigate damage.',
  ],
  [
    '9. Service, diagnosis and payment',
    'Visits, diagnosis, maintenance, consumables, non-covered parts and out-of-warranty services may require advance payment before scheduling. If MAGIC WATER determines that the issue is not covered, the customer agrees to pay applicable visit charges, labor, replacement parts, taxes and materials.',
  ],
  [
    '10. Non-transferable warranty',
    "This warranty applies only to the original purchaser and the stated installation address. It does not transfer to new owners, tenants, purchasers, properties or locations without MAGIC WATER's written authorization.",
  ],
  [
    '11. No verbal promises or modifications',
    'No salesperson, technician, representative or third party may expand, change or promise different warranty terms except through a written document signed by authorized MAGIC WATER management. Any verbal promise, informal message or general advertising is superseded by this document and the signed contract.',
  ],
  [
    '12. Limitation of liability',
    "To the maximum extent permitted by applicable law, MAGIC WATER's total liability is limited to the cost of repairing or replacing the part or service MAGIC WATER determines to be covered. MAGIC WATER is not liable for indirect, incidental, special, punitive or consequential damages, loss of use, business or water, property damage or third-party claims.",
  ],
  [
    '13. Governing law and jurisdiction',
    'This document is governed by Florida law and applicable United States federal law. Any dispute relating to this warranty, service or installation must be brought in Lee County, Florida, unless applicable law requires another forum. If any provision is unenforceable, the remaining provisions remain effective to the maximum extent permitted by law.',
  ],
  [
    '14. Non-waivable legal rights',
    'Nothing in this warranty limits consumer rights that cannot be waived under applicable law. Exclusions and limitations apply only to the maximum extent permitted by law.',
  ],
  [
    '15. Customer acceptance',
    'By signing, the customer confirms receipt of this warranty, understands its exclusions, accepts that maintenance is required, acknowledges that well water may change and agrees that MAGIC WATER will first have the right to inspect, diagnose and correct any covered claim before the customer engages third parties.',
  ],
];

function Header() {
  return (
    <header className="wp-header">
      <img src="/admin/logo-magic.webp" alt="MAGIC WATER" />
      <div className="wp-contact">
        3940 Metro Pkwy, Office 109 | Fort Myers, FL 33916
        <br />
        +1 (239) 223-5394 | +1 (475) 685-8464
      </div>
    </header>
  );
}

function Footer({ page }: { page: number }) {
  return (
    <footer className="wp-footer">
      <span>MAGIC WATER | Limited warranty subject to applicable law</span>
      <span>Page {page}</span>
    </footer>
  );
}

function Clauses({ list }: { list: [string, string][] }) {
  return (
    <div className="wp-clauses">
      {list.map(([title, text]) => (
        <section key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}

export function WarrantyPrint({ id }: { id: number }) {
  const data = useData();
  const sale = data.sales.find((s) => s.id === id);

  useEffect(() => {
    document.title = 'Garantía Magic Water';
    if (!sale) return;
    // Espera a que cargue el logo y abre el dialogo de impresion.
    const timer = setTimeout(() => window.print(), 700);
    return () => clearTimeout(timer);
  }, [sale]);

  if (!sale) {
    return (
      <div className="wp-missing">
        <p>Esta venta no existe o no tienes acceso.</p>
        <a href="/admin/ventas">Volver</a>
      </div>
    );
  }

  const client = data.clientById.get(sale.clientId);
  const w = warrantyDraft(sale, data);
  const address = installAddress(sale, client);
  const phones = [client?.phone, client?.phone2].filter(Boolean).join(' / ');
  const rows = [...w.lines];
  while (rows.length < 4) rows.push({ item: '', serial: '' });

  return (
    <div className="wp-root">
      <div className="wp-toolbar no-print">
        <button type="button" onClick={() => (history.length > 1 ? history.back() : window.close())}>
          <ArrowLeft size={18} /> Volver
        </button>
        <span>Garantía de {client?.name}</span>
        <button type="button" className="primary" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir o guardar PDF
        </button>
      </div>

      <div className="wp-page">
        <Header />
        <h1 className="wp-title">LIMITED OPERATIONAL WARRANTY</h1>
        <table className="wp-table">
          <tbody>
            <tr className="wp-label">
              <td>CUSTOMER / PURCHASER</td>
              <td>ISSUE DATE</td>
            </tr>
            <tr>
              <td>{client?.name}</td>
              <td>{dateEn(w.issueDate)}</td>
            </tr>
            <tr className="wp-label">
              <td>INSTALLATION ADDRESS</td>
              <td>TELEPHONE NUMBERS</td>
            </tr>
            <tr>
              <td>
                {address.street}
                {address.cityLine && (
                  <>
                    <br />
                    {address.cityLine}
                  </>
                )}
              </td>
              <td>{phones}</td>
            </tr>
            <tr className="wp-label">
              <td>ISSUED IN / WATER SOURCE</td>
              <td>MAGIC WATER REPRESENTATIVE</td>
            </tr>
            <tr>
              <td>{w.issuedIn}</td>
              <td>{w.representative}</td>
            </tr>
          </tbody>
        </table>

        <table className="wp-table wp-equipment">
          <tbody>
            <tr className="wp-label">
              <td>EQUIPMENT / INCLUDED WORK</td>
              <td>MAGIC WATER ASSIGNED SERIAL</td>
            </tr>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.item || ' '}</td>
                <td>{row.serial || ' '}</td>
              </tr>
            ))}
            <tr>
              <td>Installation materials, transportation and labor</td>
              <td>Included in installation scope</td>
            </tr>
          </tbody>
        </table>

        <Clauses list={CLAUSES_1} />
        <Footer page={1} />
      </div>

      <div className="wp-page">
        <Header />
        <Clauses list={CLAUSES_2} />
        <table className="wp-sign">
          <tbody>
            <tr className="wp-sign-head">
              <td>CUSTOMER / PURCHASER</td>
              <td>FOR MAGIC WATER</td>
            </tr>
            <tr>
              <td>
                <div className="wp-sign-line" />
                {client?.name}
                <div className="wp-sign-note">MAGIC WATER reserves the right to inspect and verify any claim before warranty service is provided.</div>
              </td>
              <td>
                <div className="wp-sign-typed">/s/ {w.representative}</div>
                {w.representative}
                <br />
                Responsible Representative, MAGIC WATER
                <br />
                Date: {dateEn(w.issueDate)}
              </td>
            </tr>
          </tbody>
        </table>
        <Footer page={2} />
      </div>
    </div>
  );
}
