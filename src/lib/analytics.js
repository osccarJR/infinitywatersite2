/**
 * Medicion de conversiones.
 *
 * El sitio recibe trafico de pago de Google Ads y hasta ahora no registraba
 * ni una sola conversion: no habia forma de saber que anuncio generaba que
 * llamada. Cada clic en "Llamar", en WhatsApp y cada envio del formulario
 * pasa por aqui.
 *
 * Los identificadores se leen de variables de entorno (ver .env.example).
 * Si no estan definidas, todo esto queda inerte: no se carga ningun script
 * de terceros y no se rastrea nada. Eso mantiene limpio el entorno de
 * desarrollo y evita contaminar las estadisticas con trafico propio.
 */

const GTM_ID = import.meta.env.VITE_GTM_ID;
const GA4_ID = import.meta.env.VITE_GA4_ID;
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const ADS_CALL_LABEL = import.meta.env.VITE_ADS_CONVERSION_LABEL_CALL;
const ADS_WHATSAPP_LABEL = import.meta.env.VITE_ADS_CONVERSION_LABEL_WHATSAPP;
const ADS_FORM_LABEL = import.meta.env.VITE_ADS_CONVERSION_LABEL_FORM;

export const analyticsEnabled = Boolean(GTM_ID || GA4_ID);

const ADS_LABELS = {
  call: ADS_CALL_LABEL,
  whatsapp: ADS_WHATSAPP_LABEL,
  form: ADS_FORM_LABEL,
};

function pushToDataLayer(payload) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

let initialized = false;

/**
 * Inyecta GTM y/o gtag.js una sola vez. Se llama despues del primer render
 * para no competir con el contenido por el ancho de banda inicial.
 */
export function initAnalytics() {
  if (initialized || typeof window === 'undefined' || !analyticsEnabled) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];

  if (GTM_ID) {
    pushToDataLayer({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`).catch(() => {
      /* bloqueador de anuncios o sin red: el sitio sigue funcionando igual */
    });
  }

  const gtagId = GA4_ID || ADS_ID;
  if (gtagId) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`).catch(() => {});

    // gtag necesita `arguments`, por eso no puede ser una funcion flecha.
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    if (GA4_ID) window.gtag('config', GA4_ID);
    if (ADS_ID) window.gtag('config', ADS_ID);
  }
}

/** Evento generico. Util para navegacion, aperturas de seccion, etc. */
export function trackEvent(name, params = {}) {
  pushToDataLayer({ event: name, ...params });
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

/** Cambio de pagina en una SPA: GA4 no lo detecta solo. */
export function trackPageView(path, title) {
  pushToDataLayer({ event: 'page_view', page_path: path, page_title: title });
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA4_ID) {
    window.gtag('event', 'page_view', { page_path: path, page_title: title });
  }
}

/**
 * Conversion de lead.
 *
 * @param {'call'|'whatsapp'|'form'} type  canal por el que llego el lead
 * @param {object} meta  contexto extra, p.ej. { location: 'hero' }
 */
export function trackConversion(type, meta = {}) {
  trackEvent('generate_lead', { lead_type: type, ...meta });

  const label = ADS_LABELS[type];
  if (ADS_ID && label && typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: `${ADS_ID}/${label}` });
  }
}
