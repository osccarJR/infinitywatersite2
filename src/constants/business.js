/**
 * Fuente unica de verdad para los datos del negocio.
 *
 * Todo lo que sea un dato del negocio se declara aqui y se importa; nada se
 * escribe a mano dentro de un componente.
 *
 * Los valores de identidad legal, direccion y contacto los fija la
 * especificacion A2P 10DLC del 5 de agosto de 2026. Un revisor de Twilio o
 * de las operadoras compara lo que dice la web con lo declarado en el
 * registro de la campana: si no coinciden, la campana se rechaza. No
 * cambiar ninguno de estos valores sin actualizar tambien el registro A2P.
 */

export const SITE_URL = 'https://infinitywatersite.com';

/** Entidad legal registrada. Es la que responde ante las operadoras. */
export const LEGAL_ENTITY = 'Global Innovation LLC';

/** Marca comercial de cara al publico. */
export const BRAND = 'Infinity Water';

/** Relacion marca/entidad. Debe aparecer de forma consistente en el sitio. */
export const LEGAL_ENTITY_DBA = `${LEGAL_ENTITY} d/b/a ${BRAND}`;

export const IDENTITY_STATEMENT = {
  en: `${BRAND} is operated by ${LEGAL_ENTITY}, doing business as ${BRAND}.`,
  es: `${BRAND} es una marca operada por ${LEGAL_ENTITY}, que opera comercialmente como ${BRAND}.`,
};

export const PHONE_NUMBERS = [
  {
    display: '(475) 685-8464',
    tel: '+14756858464',
    whatsapp: '14756858464',
  },
  {
    display: '(239) 223-5394',
    tel: '+12392235394',
    whatsapp: '12392235394',
  },
];

export const PRIMARY_PHONE = PHONE_NUMBERS[0];

/** Telefono de soporte comercial publicado en paginas legales y en el pie. */
export const SUPPORT_PHONE = PHONE_NUMBERS[0];

/**
 * Correo comercial publicado. Lo fija la especificacion A2P.
 *
 * Debe estar operativo: los revisores escriben a esta direccion para
 * comprobar que el negocio existe.
 */
export const EMAIL = 'g.innovar@gmail.com';

/**
 * Direccion legal definitiva. Exactamente asi, con el punto tras "Pkwy".
 * Sustituye a cualquier version anterior del numero de calle y no lleva
 * numero de suite. Debe coincidir letra por letra con lo declarado en el
 * registro A2P.
 */
export const ADDRESS_LINE_1 = '3940 Metro Pkwy.';
export const ADDRESS_LINE_2 = 'Fort Myers, FL 33916';
export const ADDRESS_FULL = `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`;

/**
 * Numero que originara los SMS de la campana A2P.
 *
 * Todavia no esta asignado. Se rellena por variable de entorno para no
 * tener que editar plantillas cuando llegue, y solo se muestra cuando
 * tiene valor: publicar un numero equivocado es peor que no publicar
 * ninguno. La campana A2P no puede presentarse hasta que esto tenga el
 * numero aprobado.
 */
export const SMS_PHONE_NUMBER = import.meta.env.VITE_SMS_PHONE_NUMBER || '';

/**
 * Version del texto de consentimiento mostrado al usuario.
 *
 * Se guarda con cada envio. Si se cambia una sola palabra de cualquiera de
 * las dos casillas hay que crear una version nueva; nunca sobrescribir la
 * evidencia historica, porque es lo que demuestra que consintio.
 */
export const CONSENT_VERSION = 'IW-SMS-CONSENT-v1-2026-08-05';

/** Vendedores validos para el campo oculto `seller`. */
export const SELLERS = ['Angie', 'Carlos'];

export const GOOGLE_MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56632.71918687402!2d-81.91605309999999!3d26.602073649999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88db3b4203150575%3A0x68b562b09a393053!2s3940%20Metro%20Pkwy%2C%20Fort%20Myers%2C%20FL%2033916%2C%20EE.%20UU.!5e0!3m2!1ses-419!2sus!4v1700000000000!5m2!1ses-419!2sus';

export const GOOGLE_PLACE_URL =
  'https://www.google.com/maps/place/Infinity+Water+Florida/@27.698638,-86.4413197,7z/data=!4m17!1m8!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!2sInfinity+Water+Florida!8m2!3d27.698638!4d-83.804601!10e4!16s%2Fg%2F11lp7zb5n1!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!8m2!3d27.698638!4d-83.804601!9m1!1b1!16s%2Fg%2F11lp7zb5n1';

/** Cifras verificables del negocio. Un solo lugar, un solo valor. */
export const STATS = {
  homesServed: 1000,
  yearsExperience: 10,
};

/**
 * Cobertura real. Florida es el mercado principal; el resto son estados
 * donde tambien se instala. Alimenta tanto la seccion de cobertura como
 * el `areaServed` de los datos estructurados.
 */
export const COVERAGE = {
  primaryState: 'Florida',
  floridaCities: ['Naples', 'Fort Myers', 'Cape Coral', 'Bonita Springs', 'Miami', 'Orlando', 'Tampa'],
  states: [
    'Connecticut',
    'New York',
    'New Jersey',
    'Massachusetts',
    'Pennsylvania',
    'Virginia',
    'Washington',
    'Maryland',
    'Arizona',
    'North Carolina',
    'Georgia',
  ],
};

export const getWhatsAppUrl = (message, phone = PRIMARY_PHONE) =>
  `https://wa.me/${phone.whatsapp}?text=${encodeURIComponent(message)}`;
