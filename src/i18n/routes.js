/**
 * Mapa de rutas por idioma.
 *
 * El idioma vive en la URL, no en localStorage. Antes ambos idiomas
 * compartian la misma direccion, asi que Google solo podia indexar la
 * version en ingles: todo el contenido en espanol era invisible para el
 * buscador. Ahora cada idioma tiene su propia URL indexable con hreflang.
 */

export const LANGUAGES = ['en', 'es'];
export const DEFAULT_LANGUAGE = 'en';

/**
 * Las rutas en ingles de privacy, terms, freeWaterTest y contact son las que
 * se declaran en el registro A2P 10DLC y las que revisa Twilio o la
 * operadora. No renombrarlas sin actualizar el registro: si una devuelve 404
 * o redirige a la portada, la campana se rechaza.
 */
export const ROUTES = {
  home: { en: '/', es: '/es' },
  privacy: { en: '/privacy-policy', es: '/es/politica-de-privacidad' },
  terms: { en: '/terms-and-conditions', es: '/es/terminos-y-condiciones' },
  smsPolicy: { en: '/sms-policy', es: '/es/politica-de-sms' },
  freeWaterTest: { en: '/free-water-test', es: '/es/analisis-de-agua-gratis' },
  contact: { en: '/contact', es: '/es/contacto' },
};

const stripTrailingSlash = (pathname) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

/** Idioma implicito en una URL. `/es` y todo lo que cuelgue de el es espanol. */
export function getLanguageFromPath(pathname) {
  const clean = stripTrailingSlash(pathname);
  return clean === '/es' || clean.startsWith('/es/') ? 'es' : DEFAULT_LANGUAGE;
}

/** Clave logica de la ruta actual, o null si no la conocemos (404). */
export function getRouteKeyFromPath(pathname) {
  const clean = stripTrailingSlash(pathname) || '/';
  const entry = Object.entries(ROUTES).find(([, paths]) =>
    Object.values(paths).includes(clean)
  );
  return entry ? entry[0] : null;
}

/** Ruta de una pagina en un idioma concreto. */
export function localizedPath(routeKey, language) {
  const route = ROUTES[routeKey];
  if (!route) return ROUTES.home[language] ?? ROUTES.home[DEFAULT_LANGUAGE];
  return route[language] ?? route[DEFAULT_LANGUAGE];
}

/** La misma pagina en el otro idioma. Si no la reconocemos, al inicio. */
export function swapLanguageInPath(pathname, targetLanguage) {
  const routeKey = getRouteKeyFromPath(pathname);
  return localizedPath(routeKey ?? 'home', targetLanguage);
}
