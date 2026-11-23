/** Formulario de GoodLeap para leer en la hoja de firmas (texto original + traduccion). */
import { GOODLEAP_DOC } from '../../../shared/goodleap.ts';

export function GoodLeapReading({ start, signer }: { start: string; signer: 'customer' | 'rep' }) {
  return (
    <div className="gl-doc">
      <h3>{GOODLEAP_DOC.title}</h3>
      <div className="gl-addr">{GOODLEAP_DOC.address}</div>
      <h4>{GOODLEAP_DOC.heading}</h4>
      {GOODLEAP_DOC.sections.map((s) => (
        <p key={s.title}>
          <u>{s.title}</u> {s.en}
          <br />
          <span className="gl-es">{s.es}</span>
        </p>
      ))}
      <p>
        <b>{signer === 'customer' ? 'Customer Signature / Firma del cliente' : 'Contractor Signature / Firma del contratista (vendedor)'}</b>
        <br />
        <span className="gl-es">Fecha estimada de inicio y de terminación: {start || '—'}</span>
      </p>
    </div>
  );
}

/** Pagina impresa del formulario, tal cual el de GoodLeap, con las firmas. */
export function GoodLeapPage({
  customerImg,
  repImg,
  customerDate,
  repDate,
  start,
  proofLine,
  draft,
}: {
  customerImg: string | null;
  repImg: string | null;
  customerDate: string;
  repDate: string;
  start: string;
  proofLine?: string;
  draft?: boolean;
}) {
  return (
    <div className="wp-page gl-page">
      {draft && <div className="ct-draft">DRAFT · BORRADOR</div>}
      <h1>{GOODLEAP_DOC.title}</h1>
      <div className="gl-page-addr">{GOODLEAP_DOC.address}</div>
      <h2>{GOODLEAP_DOC.heading}</h2>
      <div className="gl-band">
        {GOODLEAP_DOC.sections.map((x) => (
          <p key={x.title}>
            <u>{x.title}</u> {x.en}
          </p>
        ))}
        <div className="gl-lines">
          <div className="gl-line wide">
            <span>Customer Signature:</span>
            <i>{customerImg && <img src={customerImg} alt="" />}</i>
          </div>
          <div className="gl-line">
            <span>Date:</span>
            <i>{customerDate}</i>
          </div>
          <div className="gl-line wide">
            <span>Contractor Signature:</span>
            <i>{repImg && <img src={repImg} alt="" />}</i>
          </div>
          <div className="gl-line">
            <span>Date:</span>
            <i>{repDate}</i>
          </div>
          <div className="gl-line">
            <span>Estimated Start Date:</span>
            <i>{start}</i>
          </div>
          <div className="gl-line">
            <span>Estimated Completion Date:</span>
            <i>{start}</i>
          </div>
        </div>
        {proofLine && <div className="gl-proof">{proofLine}</div>}
      </div>
    </div>
  );
}
