/**
 * Paginas de servicios. Solo texto organizado en bloques; el diseno lo pone
 * la plantilla. Texto condensado (250-400 palabras por idioma).
 * Garantia: version corta de WARRANTY (web/config/business.ts), sin anos.
 */
import type { ContentPage } from '../types';

const WARRANTY_EN =
  'Every system carries the manufacturer’s warranty on its parts, honored through us. Plus lifetime support while the system stays in good standing: maintenance on time, payments current and used as intended.';
const WARRANTY_ES =
  'Cada sistema lleva la garantía del fabricante sobre sus piezas, gestionada por nosotros. Y soporte de por vida mientras esté al día: mantenimientos a tiempo, pagos al corriente y uso correcto.';

export const SERVICE_PAGES: ContentPage[] = [
  /* ---------------------------------------------------------------- */
  /* Filtracion para toda la casa (agua de ciudad)                      */
  /* ---------------------------------------------------------------- */
  {
    key: 'whole-house-filtration',
    kind: 'service',
    slug: { en: 'whole-house-filtration', es: 'filtracion-para-toda-la-casa' },
    icon: 'Home',
    photo: 'family',
    related: ['city-water', 'chlorine-taste', 'reverse-osmosis', 'maintenance'],
    en: {
      metaTitle: 'Whole-House Water Filtration in SW Florida | Infinity Water',
      metaDescription:
        'Whole-house filtration for city water in SW Florida: catalytic carbon for chlorine and chloramine taste and odor. Made in USA. Free in-home water test.',
      eyebrow: 'City water · Whole house',
      title: 'Clean water from every tap.',
      lead: 'Catalytic carbon reduces chlorine and chloramine taste and odor at every faucet and shower in your home.',
      highlights: ['Made for chloramine', 'Every tap and shower', 'Made in the USA'],
      blocks: [
        {
          type: 'features',
          heading: 'What changes at home',
          items: [
            {
              icon: 'GlassWater',
              title: 'No more pool taste',
              text: 'Water tastes and smells clean, even during the yearly chlorine burn.',
            },
            {
              icon: 'Bath',
              title: 'Nicer showers',
              text: 'Less chlorine smell on your skin and hair.',
            },
            {
              icon: 'FlaskConical',
              title: 'Chloramine, handled right',
              text: 'Lee and Collier County use chloramine. Catalytic carbon is made for it.',
            },
            {
              icon: 'Filter',
              title: 'Less sediment',
              text: 'A pre-filter catches sand and rust before they reach faucets and appliances.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How it works',
          items: [
            {
              title: 'Sediment pre-filter',
              text: 'Traps sand, scale and rust so the main media lasts longer.',
            },
            {
              title: 'Catalytic carbon tank',
              text: 'Reduces chlorine, chloramine and the taste and odor they cause.',
            },
            {
              title: 'Only what you need',
              text: 'A softener only if your test calls for it. RO for drinking water.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Softener with city water? Usually not.',
          text: 'Fort Myers city water is soft (about 1.8 gpg), and Cape Coral says a softener isn’t needed on municipal water. We confirm it with your test.',
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [WARRANTY_EN],
        },
        {
          type: 'faq',
          heading: 'Common questions',
          items: [
            {
              q: 'Does it soften my water?',
              a: 'No. Carbon targets chlorine, chloramine, taste and odor. Softening is a separate step, and most local city water doesn’t need it.',
            },
            {
              q: 'How often does it need maintenance?',
              a: 'The pre-filter is usually changed every few months; the carbon lasts much longer. We remind you when it’s due.',
            },
            {
              q: 'Will it lower my water pressure?',
              a: 'Not if it’s sized right. We size it to your plumbing and your household.',
            },
            {
              q: 'Is it a drinking-water system?',
              a: 'It treats all the water in your home. For drinking and cooking, many families add reverse osmosis at the kitchen sink.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'See what’s in your tap water.',
          text: 'Free in-home water test. An honest answer, in English or Spanish.',
        },
      ],
    },
    es: {
      metaTitle: 'Filtración para toda la casa en el SW de Florida',
      metaDescription:
        'Filtración para toda la casa con agua de ciudad: carbón catalítico contra el sabor y olor a cloro y cloraminas. Equipos hechos en EE. UU. Análisis gratis.',
      eyebrow: 'Agua de ciudad',
      title: 'Agua limpia en cada llave.',
      lead: 'El carbón catalítico reduce el sabor y el olor a cloro y cloraminas en cada llave y ducha de tu casa.',
      highlights: ['Hecho para cloraminas', 'Cada llave y ducha', 'Fabricado en EE. UU.'],
      blocks: [
        {
          type: 'features',
          heading: 'Lo que cambia en casa',
          items: [
            {
              icon: 'GlassWater',
              title: 'Sin sabor a piscina',
              text: 'El agua sabe y huele a limpio, incluso durante la purga anual de cloro.',
            },
            {
              icon: 'Bath',
              title: 'Duchas más agradables',
              text: 'Menos olor a cloro en la piel y el cabello.',
            },
            {
              icon: 'FlaskConical',
              title: 'Cloraminas bien tratadas',
              text: 'Lee y Collier County usan cloraminas. El carbón catalítico está hecho para eso.',
            },
            {
              icon: 'Filter',
              title: 'Menos sedimentos',
              text: 'Un prefiltro atrapa arena y óxido antes de que lleguen a llaves y electrodomésticos.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Cómo funciona',
          items: [
            {
              title: 'Prefiltro de sedimentos',
              text: 'Atrapa arena, sarro y óxido para que el material principal dure más.',
            },
            {
              title: 'Tanque de carbón catalítico',
              text: 'Reduce el cloro, las cloraminas y el sabor y olor que causan.',
            },
            {
              title: 'Solo lo que necesitas',
              text: 'Suavizador solo si tu análisis lo pide. Ósmosis inversa para beber.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: '¿Suavizador con agua de ciudad? Casi nunca.',
          text: 'El agua de la ciudad de Fort Myers es blanda (unos 1.8 gpg) y Cape Coral dice que con agua municipal no hace falta suavizador. Lo confirmamos con tu análisis.',
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [WARRANTY_ES],
        },
        {
          type: 'faq',
          heading: 'Preguntas frecuentes',
          items: [
            {
              q: '¿Ablanda el agua?',
              a: 'No. El carbón trata el cloro, las cloraminas, el sabor y el olor. Ablandar es otro paso, y con agua de ciudad casi nunca hace falta.',
            },
            {
              q: '¿Cada cuánto necesita mantenimiento?',
              a: 'El prefiltro suele cambiarse cada pocos meses; el carbón dura mucho más. Te avisamos cuando toca.',
            },
            {
              q: '¿Me va a bajar la presión?',
              a: 'No, si tiene el tamaño correcto. Lo dimensionamos según tu plomería y tu familia.',
            },
            {
              q: '¿Sirve como agua para beber?',
              a: 'Trata toda el agua de la casa. Para beber y cocinar, muchas familias añaden una ósmosis inversa en la cocina.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Descubre qué trae tu agua.',
          text: 'Análisis de agua gratis en tu casa. Respuesta honesta, en español o inglés.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Sistemas para agua de pozo                                         */
  /* ---------------------------------------------------------------- */
  {
    key: 'well-water-systems',
    kind: 'service',
    slug: { en: 'well-water-systems', es: 'sistemas-para-agua-de-pozo' },
    icon: 'Droplets',
    photo: 'stains',
    related: ['well-water', 'rotten-egg-smell', 'iron-stains', 'hurricane-well-care'],
    en: {
      metaTitle: 'Well Water Treatment Systems in SW Florida | Infinity Water',
      metaDescription:
        'Custom well water systems for sulfur smell, iron stains, hardness and bacteria in SW Florida. Designed from your water test. Free in-home test, no pressure.',
      eyebrow: 'Well water · Our specialty',
      title: 'Well water without smell or stains.',
      lead: 'Every well is different. We test first, then design a system for your sulfur, iron, hardness or bacteria.',
      highlights: ['Founder’s 25+ years', 'Designed from your test', 'Made in the USA'],
      blocks: [
        {
          type: 'features',
          heading: 'What we solve',
          items: [
            {
              icon: 'Wind',
              title: 'Rotten-egg smell',
              text: 'That’s hydrogen sulfide. Air injection and oxidation are designed to handle it.',
            },
            {
              icon: 'Shirt',
              title: 'Orange iron stains',
              text: 'We oxidize and filter iron before it reaches laundry, sinks and walls.',
            },
            {
              icon: 'Gauge',
              title: 'Hard water',
              text: 'A softener sized for your water helps prevent scale on fixtures and heater.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Bacteria concerns',
              text: 'UV systems are designed to disinfect water. We confirm it with a lab test.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Private wells in Florida',
          items: [
            {
              label: 'Floridians on private wells',
              value: '2.6 million+',
              detail: 'Florida Department of Environmental Protection.',
            },
            {
              label: 'Responsible for the well',
              value: 'The owner',
              detail: 'No utility tests it for you.',
            },
            {
              label: 'Recommended testing',
              value: 'At least once a year',
              detail: 'For bacteria and chemicals.',
            },
            {
              label: 'Sulfur odor threshold',
              value: '~0.1 mg/L',
              detail: 'Around 1 mg/L it can stain and corrode (UF/IFAS).',
            },
          ],
          source: {
            label: 'Florida Department of Health in Lee County: drinking water',
            url: 'https://lee.floridahealth.gov/programs-and-services/environmental-health/drinking-water/',
          },
        },
        {
          type: 'steps',
          heading: 'Built in the right order',
          items: [
            {
              title: 'Air injection',
              text: 'Turns dissolved sulfur and iron into particles that can be filtered.',
            },
            {
              title: 'Filtration media',
              text: 'Catalytic carbon or iron media traps what oxidation released.',
            },
            {
              title: 'Softener',
              text: 'Handles hardness once iron and sulfur are out of the way.',
            },
            {
              title: 'UV and RO, if needed',
              text: 'UV if your test shows bacteria concerns. RO for drinking water.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [WARRANTY_EN],
        },
        {
          type: 'faq',
          heading: 'Common questions',
          items: [
            {
              q: 'Can one filter fix sulfur, iron and hardness?',
              a: 'Rarely. Each problem needs the right stage in the right order. One tank for everything usually clogs early.',
            },
            {
              q: 'Should I keep testing my well?',
              a: 'Yes. The Department of Health recommends testing at least once a year for bacteria and chemicals. We help you read the results.',
            },
            {
              q: 'Does it use salt?',
              a: 'Only if it includes a softener. Air injection, carbon and UV don’t.',
            },
            {
              q: 'What if my well floods?',
              a: 'Don’t drink the water. The well needs shock chlorination, new filters and a bacteria test before use. We guide you through it.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Let’s test your well first.',
          text: 'Free in-home test. We tell you what it needs, and what it doesn’t.',
        },
      ],
    },
    es: {
      metaTitle: 'Sistemas para agua de pozo en el SW de Florida',
      metaDescription:
        'Sistemas para agua de pozo a tu medida: olor a azufre, manchas de hierro, dureza y bacterias. Diseñados según tu análisis. Análisis gratis, sin presión.',
      eyebrow: 'Pozo · Nuestra especialidad',
      title: 'Agua de pozo sin olor ni manchas.',
      lead: 'Cada pozo es distinto. Primero analizamos y luego diseñamos un sistema para tu azufre, hierro, dureza o bacterias.',
      highlights: ['Fundador con 25+ años', 'Diseño según tu análisis', 'Fabricado en EE. UU.'],
      blocks: [
        {
          type: 'features',
          heading: 'Lo que resolvemos',
          items: [
            {
              icon: 'Wind',
              title: 'Olor a huevo podrido',
              text: 'Es sulfuro de hidrógeno. La inyección de aire y la oxidación están diseñadas para tratarlo.',
            },
            {
              icon: 'Shirt',
              title: 'Manchas naranjas',
              text: 'Oxidamos y filtramos el hierro antes de que llegue a ropa, lavamanos y paredes.',
            },
            {
              icon: 'Gauge',
              title: 'Agua dura',
              text: 'Un suavizador a la medida ayuda a evitar el sarro en llaves y calentador.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Preocupación por bacterias',
              text: 'Los sistemas UV están diseñados para desinfectar el agua. Lo confirmamos en laboratorio.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Pozos privados en Florida',
          items: [
            {
              label: 'Floridanos con pozo privado',
              value: 'Más de 2.6 millones',
              detail: 'Departamento de Protección Ambiental de Florida (FDEP).',
            },
            {
              label: 'Responsable del pozo',
              value: 'El dueño',
              detail: 'Ninguna compañía de agua lo analiza por ti.',
            },
            {
              label: 'Análisis recomendado',
              value: 'Al menos una vez al año',
              detail: 'De bacterias y químicos.',
            },
            {
              label: 'Umbral de olor del azufre',
              value: '~0.1 mg/L',
              detail: 'Desde ~1 mg/L también mancha y corroe (UF/IFAS).',
            },
          ],
          source: {
            label: 'Departamento de Salud de Florida en Lee County: agua potable',
            url: 'https://lee.floridahealth.gov/programs-and-services/environmental-health/drinking-water/',
          },
        },
        {
          type: 'steps',
          heading: 'Cada etapa, en su orden',
          items: [
            {
              title: 'Inyección de aire',
              text: 'Convierte el azufre y el hierro disueltos en partículas filtrables.',
            },
            {
              title: 'Material filtrante',
              text: 'Carbón catalítico o material para hierro atrapa lo que soltó la oxidación.',
            },
            {
              title: 'Suavizador',
              text: 'Controla la dureza cuando el hierro y el azufre ya no están.',
            },
            {
              title: 'UV y ósmosis, si hacen falta',
              text: 'UV si tu análisis muestra bacterias. Ósmosis inversa para beber.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [WARRANTY_ES],
        },
        {
          type: 'faq',
          heading: 'Preguntas frecuentes',
          items: [
            {
              q: '¿Un solo filtro resuelve azufre, hierro y dureza?',
              a: 'Casi nunca. Cada problema necesita su etapa, en el orden correcto. Un solo tanque para todo suele taparse pronto.',
            },
            {
              q: '¿Debo seguir analizando mi pozo?',
              a: 'Sí. El Departamento de Salud recomienda analizarlo al menos una vez al año (bacterias y químicos). Te ayudamos a entender los resultados.',
            },
            {
              q: '¿Usa sal?',
              a: 'Solo si incluye suavizador. La inyección de aire, el carbón y la UV no usan sal.',
            },
            {
              q: '¿Y si se inunda mi pozo?',
              a: 'No bebas el agua. Hay que hacer cloración de choque, cambiar filtros y analizar bacterias antes de usarla. Te guiamos en cada paso.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Primero, analicemos tu pozo.',
          text: 'Análisis gratis en tu casa. Te decimos qué necesita, y qué no.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Osmosis inversa                                                    */
  /* ---------------------------------------------------------------- */
  {
    key: 'reverse-osmosis',
    kind: 'service',
    slug: { en: 'reverse-osmosis', es: 'osmosis-inversa' },
    icon: 'GlassWater',
    photo: 'contaminants',
    related: ['whole-house-filtration', 'well-water-systems', 'city-water', 'maintenance'],
    en: {
      metaTitle: 'Under-Sink Reverse Osmosis in SW Florida | Infinity Water',
      metaDescription:
        'Under-sink reverse osmosis for drinking and cooking water in SW Florida. Reduces sodium and dissolved solids, with an optional remineralization stage.',
      eyebrow: 'Drinking water · Kitchen',
      title: 'Better water for drinking and cooking.',
      lead: 'An under-sink system for drinking, coffee, ice and cooking. It reduces sodium and dissolved salts, with city or well water.',
      highlights: ['Under your kitchen sink', 'Reduces sodium', 'Optional remineralization'],
      blocks: [
        {
          type: 'features',
          heading: 'What you get',
          items: [
            {
              icon: 'GlassWater',
              title: 'Clean taste',
              text: 'Water, coffee and tea taste clean. No more hauling bottled water.',
            },
            {
              icon: 'Scale',
              title: 'Lower sodium',
              text: 'Fort Myers city water averages 114 ppm of sodium. RO reduces it.',
            },
            {
              icon: 'CookingPot',
              title: 'Cooking and ice',
              text: 'Filtered water for rice, soups and ice, from its own faucet.',
            },
            {
              icon: 'FlaskConical',
              title: 'Fewer dissolved solids',
              text: 'The membrane reduces salts and minerals that ordinary filters let through.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How it works',
          items: [
            {
              title: 'Pre-filters',
              text: 'Sediment and carbon stages protect the membrane and reduce chlorine.',
            },
            {
              title: 'RO membrane',
              text: 'A very fine membrane reduces dissolved salts, sodium and more.',
            },
            {
              title: 'Carbon polish',
              text: 'A final touch on taste before your faucet.',
            },
            {
              title: 'Remineralization (optional)',
              text: 'Adds minerals back and raises the water’s pH for a smoother taste.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'About “alkaline water”',
          text: 'Remineralization raises the water’s pH and adds minerals back for better taste. That’s all it does, and all we claim.',
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [WARRANTY_EN],
        },
        {
          type: 'faq',
          heading: 'Common questions',
          items: [
            {
              q: 'Does RO waste water?',
              a: 'It sends some water to the drain to rinse the membrane. How much depends on the model and your pressure. We explain it for your unit.',
            },
            {
              q: 'How often do I change filters?',
              a: 'Pre-filters more often than the membrane. We set the schedule for your water and remind you.',
            },
            {
              q: 'Can it feed my fridge or ice maker?',
              a: 'In many kitchens, yes. We check the layout during the visit.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Taste the difference at home.',
          text: 'Start with a free in-home test. We tell you if RO makes sense.',
        },
      ],
    },
    es: {
      metaTitle: 'Ósmosis inversa bajo el fregadero | Infinity Water',
      metaDescription:
        'Ósmosis inversa bajo el fregadero para el agua que bebes y con la que cocinas. Reduce el sodio y los sólidos disueltos, con remineralización opcional.',
      eyebrow: 'Agua para beber',
      title: 'Mejor agua para beber y cocinar.',
      lead: 'Un sistema bajo el fregadero para beber, hacer café, hielo y cocinar. Reduce el sodio y las sales disueltas.',
      highlights: ['Bajo el fregadero', 'Reduce el sodio', 'Remineralización opcional'],
      blocks: [
        {
          type: 'features',
          heading: 'Lo que ganas',
          items: [
            {
              icon: 'GlassWater',
              title: 'Sabor limpio',
              text: 'Agua, café y té con sabor limpio. Sin cargar botellones.',
            },
            {
              icon: 'Scale',
              title: 'Menos sodio',
              text: 'El agua de Fort Myers promedia 114 ppm de sodio. La ósmosis lo reduce.',
            },
            {
              icon: 'CookingPot',
              title: 'Para cocinar y hielo',
              text: 'Agua filtrada para arroz, sopas y hielo, con su propia llave.',
            },
            {
              icon: 'FlaskConical',
              title: 'Menos sólidos disueltos',
              text: 'La membrana reduce sales y minerales que los filtros comunes dejan pasar.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Cómo funciona',
          items: [
            {
              title: 'Prefiltros',
              text: 'Sedimentos y carbón protegen la membrana y reducen el cloro.',
            },
            {
              title: 'Membrana de ósmosis',
              text: 'Una membrana finísima reduce sales disueltas, sodio y más.',
            },
            {
              title: 'Filtro final de carbón',
              text: 'Un último toque al sabor antes de tu llave.',
            },
            {
              title: 'Remineralización (opcional)',
              text: 'Devuelve minerales y eleva el pH del agua para un sabor más suave.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Sobre el “agua alcalina”',
          text: 'La remineralización eleva el pH del agua y le devuelve minerales para que sepa mejor. Eso es todo lo que hace y lo que afirmamos.',
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [WARRANTY_ES],
        },
        {
          type: 'faq',
          heading: 'Preguntas frecuentes',
          items: [
            {
              q: '¿La ósmosis desperdicia agua?',
              a: 'Manda parte del agua al drenaje para enjuagar la membrana. Cuánta depende del modelo y de la presión. Te lo explicamos para tu equipo.',
            },
            {
              q: '¿Cada cuánto cambio los filtros?',
              a: 'Los prefiltros, más seguido que la membrana. Armamos el calendario según tu agua y te avisamos.',
            },
            {
              q: '¿Se conecta al refrigerador o a la máquina de hielo?',
              a: 'En muchas cocinas, sí. Lo revisamos durante la visita.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Prueba la diferencia en casa.',
          text: 'Empieza con un análisis gratis. Te decimos si la ósmosis tiene sentido.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Mantenimiento y plomeria                                           */
  /* ---------------------------------------------------------------- */
  {
    key: 'maintenance',
    kind: 'service',
    slug: { en: 'maintenance-and-plumbing', es: 'mantenimiento-y-plomeria' },
    icon: 'Wrench',
    related: ['well-water-systems', 'whole-house-filtration', 'reverse-osmosis', 'hurricane-well-care'],
    en: {
      metaTitle: 'Water System Maintenance & Repairs | Infinity Water',
      metaDescription:
        'Scheduled maintenance, filter and membrane changes, service for other brands and system-related plumbing repairs in SW Florida. Service in English and Spanish.',
      eyebrow: 'Service · Maintenance',
      title: 'Your system, working like day one.',
      lead: 'Scheduled maintenance, filter and membrane changes and system-related repairs, for our systems and other brands.',
      highlights: ['Scheduled visits and reminders', 'Other brands welcome', 'Keeps lifetime support active'],
      blocks: [
        {
          type: 'features',
          heading: 'What’s included',
          items: [
            {
              icon: 'CalendarCheck',
              title: 'Scheduled visits',
              text: 'A schedule set for your system and your water.',
            },
            {
              icon: 'Filter',
              title: 'Filters and membranes',
              text: 'Cartridges, RO membranes and mineral stages, replaced on time.',
            },
            {
              icon: 'Search',
              title: 'Other brands, too',
              text: 'Moved into a house with a system? We check it and tell you honestly.',
            },
            {
              icon: 'Wrench',
              title: 'System-related repairs',
              text: 'Leaks, bypass valves and fittings on your treatment setup.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Every visit',
          items: [
            {
              title: 'Test the water',
              text: 'We confirm the system is still doing its job.',
            },
            {
              title: 'Inspect the equipment',
              text: 'Valves, tanks, connections, air injection and UV lamp.',
            },
            {
              title: 'Replace what’s due',
              text: 'Filters, cartridges or membranes, by schedule and condition.',
            },
            {
              title: 'Explain and schedule',
              text: 'What we did, what we found and when we’ll be back.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Time to call us',
          items: [
            'Rotten-egg smell or chlorine taste is back',
            'New orange or brown stains',
            'Lower water pressure than usual',
            'RO water tastes different or flows slowly',
            'A leak near the equipment',
          ],
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [WARRANTY_EN],
        },
        {
          type: 'faq',
          heading: 'Common questions',
          items: [
            {
              q: 'Do you service systems you didn’t install?',
              a: 'Yes. We inspect other brands and tell you what they need. No pressure to replace anything.',
            },
            {
              q: 'Do you do general plumbing?',
              a: 'We do repairs related to your water treatment system: connections, valves and leaks at the equipment.',
            },
            {
              q: 'What if I skip maintenance?',
              a: 'Performance drops, parts wear faster and your lifetime support depends on on-time maintenance. That’s why we remind you.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Schedule your next service.',
          text: 'Message us on WhatsApp or call. No system yet? Start with a free test.',
        },
      ],
    },
    es: {
      metaTitle: 'Mantenimiento de sistemas y plomería | Infinity Water',
      metaDescription:
        'Mantenimiento programado, cambio de filtros y membranas, revisión de otras marcas y reparaciones de plomería del sistema en el SW de Florida. En español.',
      eyebrow: 'Servicio · Mantenimiento',
      title: 'Tu sistema, como el primer día.',
      lead: 'Mantenimiento programado, cambio de filtros y membranas y reparaciones del sistema, también para equipos de otras marcas.',
      highlights: ['Visitas y recordatorios', 'También otras marcas', 'Mantiene tu soporte activo'],
      blocks: [
        {
          type: 'features',
          heading: 'Qué incluye',
          items: [
            {
              icon: 'CalendarCheck',
              title: 'Visitas programadas',
              text: 'Un calendario pensado para tu sistema y tu agua.',
            },
            {
              icon: 'Filter',
              title: 'Filtros y membranas',
              text: 'Cartuchos, membranas y etapas de remineralización, cambiados a tiempo.',
            },
            {
              icon: 'Search',
              title: 'También otras marcas',
              text: '¿Tu casa ya tenía un sistema? Lo revisamos y te decimos cómo está.',
            },
            {
              icon: 'Wrench',
              title: 'Reparaciones del sistema',
              text: 'Fugas, válvulas de bypass y conexiones de tu sistema de tratamiento.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'En cada visita',
          items: [
            {
              title: 'Revisamos el agua',
              text: 'Confirmamos que el sistema sigue haciendo su trabajo.',
            },
            {
              title: 'Inspeccionamos el equipo',
              text: 'Válvulas, tanques, conexiones, inyección de aire y lámpara UV.',
            },
            {
              title: 'Cambiamos lo que toca',
              text: 'Filtros, cartuchos o membranas, según calendario y estado.',
            },
            {
              title: 'Te explicamos y agendamos',
              text: 'Qué hicimos, qué encontramos y cuándo es la próxima visita.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Es hora de llamarnos',
          items: [
            'Vuelve el olor a huevo o a cloro',
            'Manchas naranjas o marrones nuevas',
            'Menos presión de agua que de costumbre',
            'El agua de la ósmosis sabe distinto',
            'Una fuga cerca del equipo',
          ],
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [WARRANTY_ES],
        },
        {
          type: 'faq',
          heading: 'Preguntas frecuentes',
          items: [
            {
              q: '¿Atienden sistemas que no instalaron?',
              a: 'Sí. Revisamos otras marcas y te decimos qué necesitan. Sin presión para cambiar nada.',
            },
            {
              q: '¿Hacen plomería en general?',
              a: 'Hacemos reparaciones relacionadas con tu sistema de tratamiento: conexiones, válvulas y fugas en el equipo.',
            },
            {
              q: '¿Qué pasa si no hago el mantenimiento?',
              a: 'El sistema rinde menos, las piezas se gastan antes y tu soporte de por vida depende del mantenimiento a tiempo. Por eso te avisamos.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Agenda tu próximo servicio.',
          text: 'Escríbenos por WhatsApp o llámanos. ¿Sin sistema? Empieza con un análisis gratis.',
        },
      ],
    },
  },
];
