/**
 * Atribucion de campana.
 *
 * Los parametros de campana (utm_*, fbclid, seller) llegan en la URL de
 * entrada y se pierden en cuanto el visitante navega a otra pagina. Se
 * capturan al arrancar y se guardan en sessionStorage, para poder pasarlos
 * despues al formulario de GoHighLevel, que es donde se crea el contacto.
 *
 * Gana el primer toque: si alguien entra por un anuncio y luego vuelve por
 * otra via dentro de la misma sesion, el lead sigue atribuido a la campana
 * que realmente lo trajo.
 */
const STORAGE_KEY = 'iw-attribution';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** Vendedores validos para el parametro `seller`. */
const SELLERS = ['Angie', 'Carlos'];

function read() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    // sessionStorage bloqueado (modo privado, cookies desactivadas).
    return {};
  }
}

export function initAttribution() {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const stored = read();
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
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...incoming, ...stored }));
  } catch {
    // Sin atribucion el formulario sigue funcionando; solo se pierde el
    // dato de que anuncio trajo el lead.
  }
}

/**
 * Query string con la atribucion, lista para anexar a la URL del widget de
 * GoHighLevel. Cadena vacia si no hay nada que pasar.
 */
export function getAttributionQuery() {
  const stored = read();
  const params = new URLSearchParams();

  [...UTM_PARAMS, 'fbclid', 'seller'].forEach((key) => {
    if (stored[key]) params.set(key, stored[key]);
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}
