/**
 * Formulario de GoHighLevel incrustado (iframe).
 *
 * 1. Anade a la URL del iframe la atribucion de campana y el contexto del
 *    "Chequeo de agua" (fuente, sintomas, ciudad).
 * 2. Detecta el envio y registra la conversion.
 *
 * Como se detecta el envio: el script oficial form_embed.js escucha
 * mensajes del iframe con forma de array. Al enviar, el iframe manda
 * ["set-sticky-contacts", "_ud", "<JSON con los datos del contacto>", ...]
 * (verificado leyendo form_embed.js). La version anterior buscaba las
 * palabras "submit"/"success", que ese mensaje no contiene: la conversion
 * del formulario nunca se registraba.
 */
import { getAttributionParams } from './attribution';
import { trackConversion } from './analytics';

const ALLOWED_HOSTS = [/(^|\.)dejavuia\.com$/, /(^|\.)leadconnectorhq\.com$/, /(^|\.)msgsndr\.com$/];
const CONTEXT_PARAMS = ['water_source', 'concerns', 'city'];

export function initGhlForm() {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-ghl-form]');
  if (!iframe) return;

  const params = getAttributionParams();
  const incoming = new URLSearchParams(location.search);
  CONTEXT_PARAMS.forEach((key) => {
    const value = incoming.get(key);
    if (value) params.set(key, value.slice(0, 120));
  });
  const query = params.toString();
  if (query) iframe.src = `${iframe.dataset.src}?${query}`;

  const thanksUrl = iframe.dataset.thanks;
  let sent = false;

  window.addEventListener('message', (event) => {
    let host = '';
    try {
      host = new URL(event.origin).hostname;
    } catch {
      return;
    }
    if (!ALLOWED_HOSTS.some((re) => re.test(host))) return;

    const data = event.data;
    const isSubmit =
      Array.isArray(data) &&
      data[0] === 'set-sticky-contacts' &&
      data[1] === '_ud' &&
      typeof data[2] === 'string' &&
      /email|phone/i.test(data[2]);

    if (!isSubmit || sent) return;
    sent = true;

    // Nunca se envian datos personales a Analytics: solo el hecho del envio.
    trackConversion('form', { location: 'free-water-test', provider: 'gohighlevel' });

    // Pagina de gracias propia: confirma al usuario y da una URL de
    // conversion alternativa por si algun bloqueador impide el evento.
    if (thanksUrl) setTimeout(() => location.assign(thanksUrl), 1500);
  });
}
