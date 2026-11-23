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
