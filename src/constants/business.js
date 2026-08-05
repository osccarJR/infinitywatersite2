/**
 * Fuente unica de verdad para los datos del negocio.
 *
 * Antes estas cifras estaban repetidas y en conflicto entre componentes
 * (5000 vs 1000 clientes, 24/7 vs Lun-Sab, telefonos distintos en el
 * JSON-LD). Todo lo que sea un dato del negocio se declara aqui y se
 * importa; nada se escribe a mano dentro de un componente.
 */

export const SITE_URL = 'https://infinitywatersite.com';

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

// El dominio es infinitywatersite.com, por eso el buzon vive ahi.
// Si el correo real es otro, cambiarlo SOLO en esta linea.
export const EMAIL = 'info@infinitywatersite.com';

// La direccion completa, con coordenadas, vive tambien en el JSON-LD de
// index.html. Si cambia la sede hay que tocar los dos sitios.
export const ADDRESS_LINE_1 = '3940 Metro Pkwy';
export const ADDRESS_LINE_2 = 'Fort Myers, FL 33916';

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
