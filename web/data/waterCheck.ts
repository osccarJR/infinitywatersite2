/**
 * Datos del "Chequeo de agua" interactivo de la portada.
 *
 * Las cifras de cada ciudad vienen de los reportes oficiales de calidad del
 * agua (CCR) que publica cada proveedor. Si un dato no esta confirmado en
 * una fuente oficial, no se pone: el valor de la herramienta es que es
 * honesta.
 */
import type { Lang } from './types';

type L = Record<Lang, string>;

export type Source = 'well' | 'city';

export type Concern = {
  id: string;
  icon: string;
  label: L;
  /** Causa probable y que hariamos, segun la fuente de agua. */
  result: Record<Source, { cause: L; action: L; serviceKey: string }>;
};

export const CONCERNS: Concern[] = [
  {
    id: 'smell',
    icon: 'Wind',
    label: { en: 'Rotten-egg smell', es: 'Olor a huevo podrido' },
    result: {
      well: {
        cause: {
          en: 'Almost always hydrogen sulfide (“sulfur water”), very common in Southwest Florida wells. Most people notice it from about 0.1 mg/L.',
          es: 'Casi siempre es sulfuro de hidrógeno (“agua con azufre”), muy común en los pozos del suroeste de Florida. La mayoría lo nota desde unos 0.1 mg/L.',
        },
        action: {
          en: 'We measure it on site and size an air-injection / oxidation system so the smell is removed before it reaches your taps.',
          es: 'Lo medimos en tu casa y dimensionamos un sistema de inyección de aire u oxidación para quitar el olor antes de que llegue a tus llaves.',
        },
        serviceKey: 'rotten-egg-smell',
      },
      city: {
        cause: {
          en: 'Unusual on city water. When it happens it is often the water heater (the anode rod reacting) or a drain — not the water itself.',
          es: 'Es raro con agua de ciudad. Cuando pasa, suele ser el calentador (la barra de ánodo reaccionando) o un desagüe, no el agua en sí.',
        },
        action: {
          en: 'We check whether it comes from cold water, hot water or one drain, and tell you honestly if a filter would help at all.',
          es: 'Revisamos si sale del agua fría, de la caliente o de un solo desagüe, y te decimos con honestidad si un filtro serviría de algo.',
        },
        serviceKey: 'rotten-egg-smell',
      },
    },
  },
  {
    id: 'iron',
    icon: 'Shirt',
    label: { en: 'Orange or rusty stains', es: 'Manchas naranjas o de óxido' },
    result: {
      well: {
        cause: {
          en: 'Dissolved iron (sometimes manganese) in the aquifer. It stains laundry, sinks, driveways and walls hit by sprinklers.',
          es: 'Hierro disuelto (a veces manganeso) del acuífero. Mancha la ropa, los lavamanos, la entrada y las paredes donde pega el riego.',
        },
        action: {
          en: 'We measure iron and pH, then recommend oxidation plus an iron filter sized to your home and irrigation.',
          es: 'Medimos el hierro y el pH, y te recomendamos oxidación con un filtro de hierro del tamaño correcto para tu casa y tu riego.',
        },
        serviceKey: 'iron-stains',
      },
      city: {
        cause: {
          en: 'City water in this area is treated and very low in iron. Stains usually come from old pipes in the home or from irrigation fed by a separate well.',
          es: 'El agua de ciudad aquí viene tratada y con muy poco hierro. Las manchas suelen venir de tuberías viejas de la casa o de un riego que usa un pozo aparte.',
        },
        action: {
          en: 'We find the real source first. If it is your irrigation well, we treat that water — not your whole house.',
          es: 'Primero buscamos el origen real. Si es tu pozo de riego, tratamos esa agua y no toda la casa.',
        },
        serviceKey: 'iron-stains',
      },
    },
  },
  {
    id: 'scale',
    icon: 'Bath',
    label: { en: 'White scale, spots on glass', es: 'Sarro blanco o manchas en vidrios' },
    result: {
      well: {
        cause: {
          en: 'Hard water: calcium and magnesium from limestone aquifers. It builds up in the water heater, shower heads and appliances.',
          es: 'Agua dura: calcio y magnesio de los acuíferos de piedra caliza. Se acumula en el calentador, las regaderas y los electrodomésticos.',
        },
        action: {
          en: 'We measure hardness in grains per gallon and size a softener to your family and water use.',
          es: 'Medimos la dureza en granos por galón y dimensionamos un suavizador según tu familia y tu consumo.',
        },
        serviceKey: 'hard-water',
      },
      city: {
        cause: {
          en: 'Honest answer: city water here is mostly soft to moderately hard. Cape Coral itself says you usually do not need a softener on city water.',
          es: 'Respuesta honesta: el agua de ciudad aquí es mayormente blanda o moderada. La propia ciudad de Cape Coral dice que normalmente no necesitas suavizador.',
        },
        action: {
          en: 'We test it and, if a softener is not justified, we tell you so. Spots on glass can often be solved more cheaply.',
          es: 'La medimos y, si un suavizador no se justifica, te lo decimos. Las manchas en vidrios muchas veces se resuelven de forma más barata.',
        },
        serviceKey: 'hard-water',
      },
    },
  },
  {
    id: 'chlorine',
    icon: 'GlassWater',
    label: { en: 'Chlorine or “pool” taste', es: 'Sabor u olor a cloro o piscina' },
    result: {
      well: {
        cause: {
          en: 'Wells are not chlorinated unless your system includes a chlorinator or the well was recently shock-disinfected.',
          es: 'Los pozos no llevan cloro, salvo que tu sistema tenga un clorador o que hayan desinfectado el pozo hace poco.',
        },
        action: {
          en: 'We check your existing equipment and adjust it, or add carbon filtration after the chlorinator.',
          es: 'Revisamos tu equipo actual y lo ajustamos, o añadimos filtración de carbón después del clorador.',
        },
        serviceKey: 'maintenance',
      },
      city: {
        cause: {
          en: 'Utilities disinfect with chlorine or chloramines — that is what keeps it safe. Taste and smell change during the yearly chlorine “flushes”.',
          es: 'Las empresas de agua desinfectan con cloro o cloraminas: es lo que la mantiene segura. El sabor cambia durante las “purgas” anuales de cloro.',
        },
        action: {
          en: 'A whole-house catalytic carbon system removes chlorine and chloramines at every tap (regular carbon is not enough for chloramines).',
          es: 'Un sistema de carbón catalítico para toda la casa quita el cloro y las cloraminas en cada llave (el carbón normal no basta con cloraminas).',
        },
        serviceKey: 'whole-house-filtration',
      },
    },
  },
  {
    id: 'salty',
    icon: 'CookingPot',
    label: { en: 'Salty or odd taste', es: 'Sabor salado o raro' },
    result: {
      well: {
        cause: {
          en: 'Some older or deeper wells in Lee County pull in chlorides and dissolved solids (saltier water).',
          es: 'Algunos pozos viejos o profundos de Lee County arrastran cloruros y sólidos disueltos (agua más salada).',
        },
        action: {
          en: 'We measure dissolved solids. Reverse osmosis at the kitchen sink gives you great drinking water even from a salty well.',
          es: 'Medimos los sólidos disueltos. Una ósmosis inversa en la cocina te da agua excelente para beber, aunque el pozo sea salado.',
        },
        serviceKey: 'reverse-osmosis',
      },
      city: {
        cause: {
          en: 'Sodium varies by utility. Fort Myers reports 114 mg/L — worth knowing if someone at home follows a low-sodium diet.',
          es: 'El sodio varía según la ciudad. Fort Myers reporta 114 mg/L, algo a tener en cuenta si alguien en casa lleva una dieta baja en sodio.',
        },
        action: {
          en: 'A reverse osmosis system for drinking and cooking reduces sodium and dissolved solids.',
          es: 'Una ósmosis inversa para beber y cocinar reduce el sodio y los sólidos disueltos.',
        },
        serviceKey: 'reverse-osmosis',
      },
    },
  },
  {
    id: 'unseen',
    icon: 'Search',
    label: { en: 'Worried about what I can’t see', es: 'Me preocupa lo que no se ve' },
    result: {
      well: {
        cause: {
          en: 'Nobody tests a private well for you. The Florida Department of Health recommends testing for bacteria and chemicals at least once a year.',
          es: 'Nadie analiza un pozo privado por ti. El Departamento de Salud de Florida recomienda analizar bacterias y químicos al menos una vez al año.',
        },
        action: {
          en: 'We test on site and point you to a certified lab for bacteria. If disinfection is needed, UV is the usual answer.',
          es: 'Hacemos el análisis en casa y te orientamos a un laboratorio certificado para bacterias. Si hace falta desinfectar, lo usual es luz UV.',
        },
        serviceKey: 'well-water-systems',
      },
      city: {
        cause: {
          en: 'City water meets federal standards. Disinfection byproducts (TTHM) are regulated but vary: Collier reports 60.4 ppb on a limit of 80.',
          es: 'El agua de ciudad cumple las normas federales. Los subproductos de la desinfección (TTHM) están regulados pero varían: Collier reporta 60.4 ppb con un límite de 80.',
        },
        action: {
          en: 'Carbon filtration for the house and reverse osmosis for drinking give you an extra layer, if you want it.',
          es: 'Filtración de carbón para la casa y ósmosis inversa para beber te dan una capa extra, si la quieres.',
        },
        serviceKey: 'city-water',
      },
    },
  },
];

export type CityFacts = {
  id: string;
  name: string;
  provider: L;
  facts: { label: L; value: L }[];
  note?: L;
  source: string;
  /** Pagina de la ciudad. */
  pageKey: string;
};

export const CITIES: CityFacts[] = [
  {
    id: 'fort-myers',
    name: 'Fort Myers',
    provider: { en: 'City of Fort Myers — reverse osmosis', es: 'Ciudad de Fort Myers — ósmosis inversa' },
    facts: [
      { label: { en: 'Hardness', es: 'Dureza' }, value: { en: '≈1.8 gpg (soft)', es: '≈1.8 gpg (blanda)' } },
      { label: { en: 'Disinfectant', es: 'Desinfectante' }, value: { en: 'Chlorine, avg 1.99 ppm', es: 'Cloro, prom. 1.99 ppm' } },
      { label: { en: 'Sodium', es: 'Sodio' }, value: { en: '114 mg/L', es: '114 mg/L' } },
    ],
    source: 'https://fortmyers.gov/DocumentCenter/View/25656/2025-Annual-Water-Quality-Report-PDF',
    pageKey: 'fort-myers',
  },
  {
    id: 'cape-coral',
    name: 'Cape Coral',
    provider: { en: 'City of Cape Coral — reverse osmosis', es: 'Ciudad de Cape Coral — ósmosis inversa' },
    facts: [
      { label: { en: 'Hardness', es: 'Dureza' }, value: { en: '5.5–6.5 gpg', es: '5.5–6.5 gpg' } },
      { label: { en: 'Disinfectant', es: 'Desinfectante' }, value: { en: 'Chlorine, avg 1.34 ppm', es: 'Cloro, prom. 1.34 ppm' } },
      { label: { en: 'Sodium', es: 'Sodio' }, value: { en: '86 mg/L', es: '86 mg/L' } },
    ],
    note: {
      en: 'Many homes in north Cape Coral are still on private wells.',
      es: 'Muchas casas del norte de Cape Coral siguen con pozo privado.',
    },
    source: 'https://www.capecoral.gov/Documents/Document%20Hub/Water%20Quality%20Report/2024%20Water%20Quality%20Report%205.13.2025.pdf',
    pageKey: 'cape-coral',
  },
  {
    id: 'lehigh-acres',
    name: 'Lehigh Acres',
    provider: { en: 'Lee County Utilities (where connected)', es: 'Lee County Utilities (donde hay red)' },
    facts: [
      { label: { en: 'Disinfectant', es: 'Desinfectante' }, value: { en: 'Chloramines, 3.4 ppm', es: 'Cloraminas, 3.4 ppm' } },
      { label: { en: 'Sodium', es: 'Sodio' }, value: { en: '36.7–67.8 mg/L', es: '36.7–67.8 mg/L' } },
      { label: { en: 'Yearly change', es: 'Cambio anual' }, value: { en: 'Free-chlorine flush', es: 'Purga con cloro libre' } },
    ],
    note: {
      en: 'Much of central, north and east Lehigh Acres runs on private wells.',
      es: 'Buena parte del centro, norte y este de Lehigh Acres usa pozo privado.',
    },
    source: 'https://www.leegov.com/utilities/Documents/WaterQualityReport.pdf',
    pageKey: 'lehigh-acres',
  },
  {
    id: 'naples',
    name: 'Naples / Collier',
    provider: { en: 'Collier County Water-Sewer District', es: 'Collier County Water-Sewer District' },
    facts: [
      { label: { en: 'Hardness', es: 'Dureza' }, value: { en: '2.4–5.5 gpg', es: '2.4–5.5 gpg' } },
      { label: { en: 'Disinfectant', es: 'Desinfectante' }, value: { en: 'Chloramines, 3.4 ppm', es: 'Cloraminas, 3.4 ppm' } },
      { label: { en: 'TTHM', es: 'TTHM' }, value: { en: '60.4 ppb (limit 80)', es: '60.4 ppb (límite 80)' } },
    ],
    note: {
      en: 'Most of Golden Gate Estates is on private wells and septic.',
      es: 'La mayor parte de Golden Gate Estates tiene pozo y séptico.',
    },
    source: 'https://www.collier.gov/files/assets/county/v/1/public-utilities/documents/water-division/2024-collier-county-water-quality-report-5-23-25.pdf',
    pageKey: 'naples',
  },
  {
    id: 'bonita-springs',
    name: 'Bonita Springs',
    provider: { en: 'Bonita Springs Utilities', es: 'Bonita Springs Utilities' },
    facts: [
      { label: { en: 'Disinfectant', es: 'Desinfectante' }, value: { en: 'Chlorine/chloramines, 3.44 ppm', es: 'Cloro/cloraminas, 3.44 ppm' } },
      { label: { en: 'Sodium', es: 'Sodio' }, value: { en: '83.1 mg/L', es: '83.1 mg/L' } },
      { label: { en: 'TTHM', es: 'TTHM' }, value: { en: '45 ppb (limit 80)', es: '45 ppb (límite 80)' } },
    ],
    source: 'https://bsu.us/2025-annual-drinking-water-quality-report/',
    pageKey: 'bonita-springs-estero',
  },
];
