import { useEffect, useRef, useState } from 'react';
import { getAttributionQuery } from '../lib/attribution';
import { trackConversion } from '../lib/analytics';

/**
 * Formulario de solicitud de analisis de agua, alojado en GoHighLevel.
 *
 * El formulario NO se define aqui: lo construye y lo mantiene Deja Vu IA en
 * GoHighLevel, y ahi es donde queda registrada la evidencia de
 * consentimiento (casillas independientes, texto mostrado, fecha, IP y
 * origen). Este componente solo lo incrusta.
 *
 * Por eso no se deben duplicar aqui campos, textos de consentimiento ni
 * casillas: cualquier cambio se hace en GoHighLevel. Un segundo formulario
 * con su propia copia del consentimiento generaria dos registros distintos
 * para la misma persona, que es justo lo que la especificacion A2P prohibe.
 *
 * Se incrusta en un unico punto del sitio (/free-water-test). El resto de
 * llamadas a la accion enlazan ahi.
 */

const FORM_ID = 'LgLxNfMMaa7apAp6aDB4';
const FORM_ORIGIN = 'https://api.dejavuia.com';
const FORM_SRC = `${FORM_ORIGIN}/widget/form/${FORM_ID}`;
const EMBED_SCRIPT = `${FORM_ORIGIN}/js/form_embed.js`;

/** Alto de reserva mientras el script de GHL mide el formulario real. */
const FALLBACK_HEIGHT = 1180;

export default function GhlForm({ title = 'Free water analysis request' }) {
  const iframeRef = useRef(null);
  const [src, setSrc] = useState(FORM_SRC);

  // La atribucion vive en sessionStorage, que no existe al prerenderizar.
  // Se anade despues del primer render para que el HTML servido siga siendo
  // igual en servidor y en cliente y la hidratacion no se rompa.
  useEffect(() => {
    const query = getAttributionQuery();
    if (query) setSrc(`${FORM_SRC}${query}`);
  }, []);

  // El script de GoHighLevel ajusta el alto del iframe al contenido real.
  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SCRIPT}"]`)) return;
    const script = document.createElement('script');
    script.src = EMBED_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // GoHighLevel avisa por postMessage cuando el formulario se envia. Es la
  // unica forma de contar la conversion, porque el iframe es de otro
  // dominio y su interior no se puede inspeccionar.
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== FORM_ORIGIN) return;

      const payload = typeof event.data === 'string' ? event.data : event.data?.type || '';
      if (/submit|success/i.test(String(payload))) {
        trackConversion('form', { location: 'free-water-test', provider: 'gohighlevel' });
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        id={`inline-${FORM_ID}`}
        title={title}
        loading="lazy"
        style={{ width: '100%', height: `${FALLBACK_HEIGHT}px`, border: 'none' }}
        data-layout='{"id":"INLINE"}'
        data-trigger-type="alwaysShow"
        data-activation-type="alwaysActivated"
        data-deactivation-type="neverDeactivate"
        data-form-id={FORM_ID}
        data-layout-iframe-id={`inline-${FORM_ID}`}
        data-height={FALLBACK_HEIGHT}
      />
    </div>
  );
}
