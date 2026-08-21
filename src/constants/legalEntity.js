/**
 * Identidad legal del negocio.
 *
 * Vive en su propio modulo, separado de business.js, porque `src/i18n/seo.js`
 * tambien la necesita y a seo.js lo importa vite.config.js en contexto Node,
 * donde `import.meta.env` no existe. Este fichero no lee entorno, asi que
 * puede importarse desde cualquiera de los dos lados.
 *
 * Estos valores deben coincidir LETRA POR LETRA con lo declarado en el
 * registro A2P 10DLC. Un revisor de la operadora compara el nombre que
 * aparece en la web con el de la solicitud; si difieren, la campana se
 * rechaza. Cambiarlos aqui y en el JSON-LD de index.html, que es estatico.
 */

/** Razon social registrada, tal cual figura en la solicitud A2P. */
export const LEGAL_ENTITY = 'GLOBAL INNOVATION GROUP INFINITY LLC';

/** Marca comercial de cara al publico. */
export const BRAND = 'Infinity Water';

/** Relacion marca/entidad. Es la forma que revisa la operadora. */
export const LEGAL_ENTITY_DBA = `${LEGAL_ENTITY} d/b/a ${BRAND}`;

export const IDENTITY_STATEMENT = {
  en: `${BRAND} is operated by ${LEGAL_ENTITY}, doing business as ${BRAND}.`,
  es: `${BRAND} es una marca operada por ${LEGAL_ENTITY}, que opera comercialmente como ${BRAND}.`,
};
