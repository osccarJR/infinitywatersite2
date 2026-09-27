/**
 * Fuente unica de verdad del negocio.
 *
 * Todo dato del negocio se declara aqui y se importa; ningun componente
 * escribe a mano un telefono, una cifra o una certificacion.
 *
 * Identidad legal, direccion, correo y rutas legales los fija el registro
 * A2P 10DLC (especificacion del 5 de agosto de 2026). Un revisor compara lo
 * que dice la web con lo declarado: si no coinciden, la campana se rechaza.
 * No cambiarlos sin actualizar tambien el registro.
 */

export const SITE_URL = 'https://www.infinitywatersite.com';

/* ------------------------------------------------------------------ */
/* Identidad legal (A2P): debe coincidir LETRA POR LETRA con el registro */
/* ------------------------------------------------------------------ */

export const LEGAL_ENTITY = 'GLOBAL INNOVATION GROUP INFINITY LLC';
export const BRAND = 'Infinity Water';
export const LEGAL_ENTITY_DBA = `${LEGAL_ENTITY} d/b/a ${BRAND}`;

export const IDENTITY_STATEMENT = {
  en: `${BRAND} is operated by ${LEGAL_ENTITY}, doing business as ${BRAND}.`,
  es: `${BRAND} es una marca operada por ${LEGAL_ENTITY}, que opera comercialmente como ${BRAND}.`,
};

/** Direccion exacta, con el punto tras "Pkwy" y sin suite (A2P). */
export const ADDRESS_LINE_1 = '3940 Metro Pkwy.';
export const ADDRESS_LINE_2 = 'Fort Myers, FL 33916';
export const ADDRESS_FULL = `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`;
export const GEO = { lat: 26.6020736, lng: -81.8608 };

/** Correo comercial publicado. Lo fija A2P y debe estar operativo. */
export const EMAIL = 'g.innovar@gmail.com';

/* ------------------------------------------------------------------ */
/* Contacto                                                             */
/* ------------------------------------------------------------------ */

export type Phone = { display: string; tel: string; whatsapp: string };

/** Linea principal (confirmada por el negocio el 26-sep-2026). */
export const PRIMARY_PHONE: Phone = {
  display: '(475) 685-8464',
  tel: '+14756858464',
  whatsapp: '14756858464',
};

export const SECONDARY_PHONE: Phone = {
  display: '(239) 223-5394',
  tel: '+12392235394',
  whatsapp: '12392235394',
};

export const PHONES = [PRIMARY_PHONE, SECONDARY_PHONE];

/** Telefono de soporte publicado en las paginas legales y en el pie. */
export const SUPPORT_PHONE = PRIMARY_PHONE;

/**
 * Numero que originara los SMS de la campana A2P. Solo se muestra cuando
 * tiene valor: publicar un numero equivocado es peor que no publicar ninguno.
 */
export const SMS_PHONE_NUMBER: string = import.meta.env.VITE_SMS_PHONE_NUMBER || '';

export const WHATSAPP_MESSAGE = {
  en: 'Hi Infinity Water, I would like a free water test at my home.',
  es: 'Hola Infinity Water, quiero el análisis de agua gratis en mi casa.',
};

export const whatsappUrl = (message: string, phone: Phone = PRIMARY_PHONE) =>
  `https://wa.me/${phone.whatsapp}?text=${encodeURIComponent(message)}`;

/**
 * Horario. El negocio atiende los 7 dias pero en un horario concreto que
 * aun no nos han pasado. Mientras `hours` sea null solo se dice "7 dias a
 * la semana" y el JSON-LD no declara horas.
 * TODO(negocio): rellenar, p. ej. { opens: '08:00', closes: '19:00' }.
 */
export const HOURS = null as { opens: string; closes: string } | null;
export const HOURS_LABEL = {
  en: HOURS ? `Every day, ${HOURS.opens}–${HOURS.closes}` : 'Open 7 days a week',
  es: HOURS ? `Todos los días, ${HOURS.opens}–${HOURS.closes}` : 'Atendemos los 7 días de la semana',
};

/* ------------------------------------------------------------------ */
/* Cifras y afirmaciones                                                */
/* ------------------------------------------------------------------ */

/**
 * Experiencia del fundador en tratamiento de agua (confirmada por el
 * negocio). La LLC es de 2022, asi que siempre se atribuye a la persona o
 * al equipo, nunca a "la empresa".
 */
export const FOUNDER_YEARS = 25;

/**
 * Equipos fabricados en EE. UU. Lo afirma el negocio. La regla "Made in USA"
 * de la FTC exige que "todo o practicamente todo" el producto sea de EE. UU.;
 * si algun componente importante no lo es, poner false.
 */
export const MADE_IN_USA = true;

/** Garantia: la del fabricante de cada pieza, mas soporte de por vida condicionado. */
export const WARRANTY = {
  en: {
    short: 'Manufacturer warranty + lifetime support',
    long: 'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water. On top of that we offer lifetime support for as long as the system is kept in good standing: scheduled maintenance done on time, payments current and the system used as intended.',
  },
  es: {
    short: 'Garantía del fabricante + soporte de por vida',
    long: 'Cada sistema lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros. Además te damos soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo.',
  },
};

/**
 * Financiamiento: el negocio trabaja con varias financieras de "home
 * improvement". No se publican cuotas, plazos ni tasas: mencionarlos obliga
 * a mostrar APR y condiciones (TILA / Reg Z).
 */
export const FINANCING_AVAILABLE = true;

/* ------------------------------------------------------------------ */
/* Certificaciones y sellos                                             */
/* ------------------------------------------------------------------ */

export type Seal = {
  id: string;
  image: string;
  enabled: boolean;
  /** Enlace publico donde cualquiera puede comprobarlo. */
  verifyUrl?: string;
  label: { en: string; es: string };
};

/**
 * Sellos que muestra el sitio. Cada uno se puede apagar sin tocar el diseno.
 *
 * BBB esta APAGADO a proposito: el perfil publico de BBB (consultado el
 * 26-sep-2026) dice "Not BBB Accredited" y calificacion F. Mostrar el sello
 * de acreditacion sin estarlo infringe la marca de BBB y es publicidad
 * enganosa ante la FTC y Google Ads. Cuando el perfil diga "Accredited",
 * poner enabled: true y el sello aparece en todo el sitio.
 */
export const SEALS: Seal[] = [
  {
    id: 'wqa',
    image: '/images/cert-wqa.webp',
    enabled: true,
    label: { en: 'Water Quality Association member', es: 'Miembro de la Water Quality Association' },
  },
  {
    id: 'bbb',
    image: '/images/cert-bbb.webp',
    enabled: false,
    verifyUrl: 'https://www.bbb.org/us/fl/fort-myers/profile/water-purification-equipment/infinity-water-0653-90429616',
    label: { en: 'BBB Accredited Business', es: 'Negocio acreditado por BBB' },
  },
];

/* ------------------------------------------------------------------ */
/* Cobertura                                                            */
/* ------------------------------------------------------------------ */

/** Ciudades con pagina propia (datos oficiales en web/data/cities.ts). */
export const CORE_CITIES = ['Fort Myers', 'Cape Coral', 'Lehigh Acres', 'Naples', 'Bonita Springs', 'Estero'];

/** Resto de Florida que tambien se atiende. */
export const OTHER_FLORIDA = ['North Fort Myers', 'Golden Gate Estates', 'Pine Island', 'Miami', 'Orlando', 'Tampa'];

/* ------------------------------------------------------------------ */
/* Enlaces externos                                                     */
/* ------------------------------------------------------------------ */

export const GOOGLE_PROFILE_URL =
  'https://www.google.com/maps/place/Infinity+Water+Florida/@27.698638,-86.4413197,7z/data=!4m17!1m8!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!2sInfinity+Water+Florida!8m2!3d27.698638!4d-83.804601!10e4!16s%2Fg%2F11lp7zb5n1!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!8m2!3d27.698638!4d-83.804601!9m1!1b1!16s%2Fg%2F11lp7zb5n1';

export const GOOGLE_MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56632.71918687402!2d-81.91605309999999!3d26.602073649999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88db3b4203150575%3A0x68b562b09a393053!2s3940%20Metro%20Pkwy%2C%20Fort%20Myers%2C%20FL%2033916%2C%20EE.%20UU.!5e0!3m2!1ses-419!2sus!4v1700000000000!5m2!1ses-419!2sus';

/**
 * Zona de servicio por codigo postal (prefijos de 3 digitos). 339 = Lee
 * County (Fort Myers, Cape Coral, Lehigh Acres, Estero, Bonita), 341 =
 * Collier (Naples, Golden Gate). Fuera de estos prefijos el cuestionario
 * invita a escribir por WhatsApp en vez de prometer la visita.
 */
export const SERVICE_ZIP_PREFIXES = ['339', '341'];

/**
 * Fotos reales del equipo (fundador, tecnicos, furgoneta, instalaciones).
 * Mientras este vacio, la seccion "Conoce a la familia" no muestra fotos:
 * nunca se usan fotos de archivo para representar al equipo.
 * Ejemplo: { src: '/images/team/fundador.webp', alt: { en: '...', es: '...' } }
 */
export const TEAM_PHOTOS: { src: string; alt: { en: string; es: string } }[] = [];

/** Vendedores validos para el parametro `seller` de las campanas. */
export const SELLERS = ['Angie', 'Carlos'];
