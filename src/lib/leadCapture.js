/**
 * Captura de leads y evidencia de consentimiento.
 *
 * La especificacion A2P exige poder demostrar, envio por envio, que la
 * persona consintio: que texto exacto vio, cuando, desde que URL, desde que
 * IP y que casillas marco de forma independiente. Sin esa evidencia
 * exportable la campana no se aprueba, y ante una reclamacion no hay con
 * que responder.
 *
 * El sitio es estatico, asi que el almacenamiento lo hace el receptor:
 * VITE_LEAD_WEBHOOK_URL apunta a un webhook entrante de GoHighLevel (o a
 * cualquier endpoint propio) que crea el contacto y guarda cada campo.
 *
 * IMPORTANTE: la direccion IP no se puede obtener de forma fiable desde el
 * navegador. La registra el receptor del webhook a partir de la peticion.
 * Si el receptor no lo hace, definir VITE_IP_LOOKUP_URL con un servicio que
 * devuelva {"ip": "..."} y se anadira al payload.
 */
import { CONSENT_MARKETING, CONSENT_TRANSACTIONAL } from '../constants/consent';
import { CONSENT_VERSION, SELLERS } from '../constants/business';

const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL;
const IP_LOOKUP_URL = import.meta.env.VITE_IP_LOOKUP_URL;

export const leadCaptureConfigured = Boolean(WEBHOOK_URL);

const ATTRIBUTION_KEY = 'iw-attribution';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Guarda la atribucion de la PRIMERA pagina visitada.
 *
 * Se llama al arrancar la app. Si no se capturase aqui, al navegar de
 * `/?utm_source=google` a `/free-water-test` los parametros se perderian y
 * ningun lead podria atribuirse a su anuncio.
 */
export function initAttribution() {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const stored = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || '{}');

    const incoming = {};
    UTM_PARAMS.forEach((key) => {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });

    const fbclid = params.get('fbclid');
    if (fbclid) incoming.fbclid = fbclid;

    const seller = params.get('seller');
    if (seller && SELLERS.includes(seller)) incoming.seller = seller;

    if (!stored.landing_page) {
      incoming.landing_page = window.location.href;
      incoming.referrer = document.referrer || '';
      incoming.first_seen_at = new Date().toISOString();
    }

    // Primer toque gana: no se pisan los datos de la campana original.
    const merged = { ...incoming, ...stored };
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage puede estar bloqueado (modo privado, cookies off).
    // Se pierde la atribucion, pero el formulario debe seguir funcionando.
  }
}

/**
 * Devuelve SIEMPRE la misma forma, con cadenas vacias cuando no hay dato.
 * El receptor del webhook puede asi mapear columnas fijas sin comprobar si
 * cada clave existe.
 */
function getAttribution() {
  let stored = {};
  if (typeof window !== 'undefined') {
    try {
      stored = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || '{}');
    } catch {
      stored = {};
    }
  }

  const fbp = readCookie('_fbp');
  let fbc = readCookie('_fbc');

  // Si Meta Pixel no ha escrito _fbc todavia pero venimos de un anuncio,
  // se reconstruye con el formato que espera la API de conversiones.
  if (!fbc && stored.fbclid) {
    fbc = `fb.1.${Date.now()}.${stored.fbclid}`;
  }

  return {
    utm_source: stored.utm_source || '',
    utm_medium: stored.utm_medium || '',
    utm_campaign: stored.utm_campaign || '',
    utm_content: stored.utm_content || '',
    utm_term: stored.utm_term || '',
    fbclid: stored.fbclid || '',
    fbc,
    fbp,
    landing_page: stored.landing_page || '',
    referrer: stored.referrer || '',
    seller: stored.seller || '',
  };
}

/**
 * Normaliza a E.164 asumiendo Estados Unidos.
 * Devuelve cadena vacia si no hay digitos suficientes, para no inventar
 * un numero valido a partir de una entrada incompleta.
 */
export function toE164(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return '';
}

function newSubmissionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `iw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function lookupIp() {
  if (!IP_LOOKUP_URL) return '';
  try {
    const response = await fetch(IP_LOOKUP_URL, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return '';
    const data = await response.json();
    return data.ip || data.address || '';
  } catch {
    return '';
  }
}

/**
 * Construye el registro completo del lead con su evidencia.
 *
 * @param {object} form      valores del formulario
 * @param {string} language  idioma en el que se mostro el consentimiento
 */
export function buildLeadPayload(form, language) {
  const now = new Date();
  const lang = language === 'es' ? 'es' : 'en';

  return {
    submission_id: newSubmissionId(),

    // Datos de contacto
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    full_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    phone: toE164(form.phone),
    phone_raw: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    postal_code: form.zip.trim(),
    water_source: form.waterSource,
    best_contact_time: form.bestTime.trim(),
    comments: form.comments.trim(),

    // Consentimiento: estado independiente de cada casilla, mas el texto
    // literal que se mostro y su version.
    sms_consent_transactional: Boolean(form.consentTransactional),
    sms_consent_marketing: Boolean(form.consentMarketing),
    sms_consent_transactional_text: form.consentTransactional ? CONSENT_TRANSACTIONAL[lang] : '',
    sms_consent_marketing_text: form.consentMarketing ? CONSENT_MARKETING[lang] : '',
    consent_version: CONSENT_VERSION,
    consent_language: lang,

    // Contexto de la captura
    consent_timestamp_iso: now.toISOString(),
    consent_timestamp_local: now.toString(),
    consent_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    consent_url: typeof window !== 'undefined' ? window.location.href : '',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',

    // Atribucion
    ...getAttribution(),
  };
}

/**
 * Envia el lead al webhook.
 *
 * Devuelve { ok, payload, error }. Nunca lanza: un fallo de red no puede
 * dejar al usuario sin respuesta despues de rellenar el formulario.
 */
export async function submitLead(form, language) {
  const payload = buildLeadPayload(form, language);

  const ip = await lookupIp();
  if (ip) payload.ip_address = ip;

  if (!WEBHOOK_URL) {
    // Sin webhook no hay donde guardar la evidencia. Se avisa fuerte en
    // desarrollo, y en produccion se trata como error para que el usuario
    // reciba la via alternativa de contacto en vez de un falso "gracias".
    if (import.meta.env.DEV) {
      console.warn(
        '[leads] VITE_LEAD_WEBHOOK_URL no esta configurado. El lead NO se ha guardado.',
        payload
      );
    }
    return { ok: false, payload, error: 'missing-webhook' };
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, payload, error: `http-${response.status}` };
    }

    return { ok: true, payload };
  } catch (error) {
    return { ok: false, payload, error: error.message };
  }
}
