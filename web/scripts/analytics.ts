/**
 * Medicion de conversiones.
 *
 * Los identificadores llegan por variables de entorno (ver .env.example).
 * Sin ellos todo esto queda inerte: no se carga ningun script de terceros
 * y no se rastrea nada, asi el entorno de desarrollo no ensucia las
 * estadisticas.
 *
 * Los enlaces no llaman a esta API directamente: llevan atributos
 * `data-track` y un unico listener delegado hace el resto. Asi un enlace
 * `tel:` o de WhatsApp funciona aunque JavaScript falle o un bloqueador
 * impida cargar nada.
 */

type LeadType = 'call' | 'whatsapp' | 'form';
type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;

const ADS_LABELS: Record<LeadType, string | undefined> = {
  call: import.meta.env.VITE_ADS_CONVERSION_LABEL_CALL,
  whatsapp: import.meta.env.VITE_ADS_CONVERSION_LABEL_WHATSAPP,
  form: import.meta.env.VITE_ADS_CONVERSION_LABEL_FORM,
};

const enabled = Boolean(GTM_ID || GA4_ID || ADS_ID);

function push(payload: Params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

let initialized = false;

export function initAnalytics() {
  if (initialized || !enabled) return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];

  if (GTM_ID) {
    push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`);
  }

  const gtagId = GA4_ID || ADS_ID;
  if (gtagId) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`);
    // gtag necesita `arguments`: no puede ser una funcion flecha.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    if (GA4_ID) window.gtag('config', GA4_ID);
    if (ADS_ID) window.gtag('config', ADS_ID);
  }
}

export function trackEvent(name: string, params: Params = {}) {
  push({ event: name, ...params });
  window.gtag?.('event', name, params);
}

/** Conversion de lead por canal. `meta.location` dice desde que seccion salio. */
export function trackConversion(type: LeadType, meta: Params = {}) {
  trackEvent('generate_lead', { lead_type: type, page_lang: document.documentElement.lang, ...meta });

  const label = ADS_LABELS[type];
  if (ADS_ID && label) window.gtag?.('event', 'conversion', { send_to: `${ADS_ID}/${label}` });
}

/** Listener delegado para todos los enlaces con data-track. */
export function bindTracking() {
  document.addEventListener(
    'click',
    (event) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!target) return;

      const kind = target.dataset.track;
      const location = target.dataset.location || 'unknown';

      if (kind === 'call' || kind === 'whatsapp') {
        trackConversion(kind, { location });
      } else if (kind) {
        trackEvent(kind, { location });
      }
    },
    { capture: true }
  );
}

/**
 * Los scripts de terceros se cargan cuando el navegador esta libre, para
 * no competir con el contenido por el ancho de banda inicial.
 */
export function scheduleAnalytics() {
  bindTracking();
  if (!enabled) return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(initAnalytics, { timeout: 3000 });
  else setTimeout(initAnalytics, 1500);
}
