/**
 * Atribucion de campana.
 *
 * Los parametros de campana (utm_*, gclid, fbclid, seller) llegan en la URL
 * de entrada y se pierden en cuanto el visitante navega. Se guardan en
 * sessionStorage para pasarlos despues al formulario de GoHighLevel, que es
 * donde se crea el contacto. Gana el primer toque.
 */
import { SELLERS } from '../config/business';

const STORAGE_KEY = 'iw-attribution';
const TRACKED = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

type Stored = Record<string, string>;

function read(): Stored {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    // sessionStorage bloqueado (modo privado, cookies desactivadas).
    return {};
  }
}

export function initAttribution() {
  try {
    const params = new URLSearchParams(location.search);
    const stored = read();
    const incoming: Stored = {};

    TRACKED.forEach((key) => {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });

    const seller = params.get('seller');
    if (seller && SELLERS.includes(seller)) incoming.seller = seller;

    if (!stored.landing_page) {
      incoming.landing_page = location.href;
      incoming.referrer = document.referrer || '';
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...incoming, ...stored }));
  } catch {
    // Sin atribucion el formulario sigue funcionando.
  }
}

/** Parametros de atribucion listos para anexar a la URL del widget. */
export function getAttributionParams(): URLSearchParams {
  const stored = read();
  const params = new URLSearchParams();
  [...TRACKED, 'seller'].forEach((key) => {
    if (stored[key]) params.set(key, stored[key]);
  });
  return params;
}
