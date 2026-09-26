/**
 * Paginas de servicios. Solo texto organizado en bloques; el diseno lo pone
 * la plantilla. Garantia: base en WARRANTY (web/config/business.ts), sin anos.
 */
import type { ContentPage } from '../types';

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
      title: 'Whole-house filtration built for Southwest Florida city water',
      lead: 'City water is treated to be safe, but it arrives with chlorine or chloramine you can taste and smell. A whole-house system filters every tap in your home, from the kitchen to the shower, with top-grade media and equipment made in the USA.',
      highlights: [
        'Catalytic carbon for chlorine and chloramine',
        'Filters every tap and shower in the house',
        'Equipment made in the USA',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'What a whole-house filter solves',
          intro: 'We only recommend it when your test shows it makes sense. These are the everyday problems it is designed for.',
          items: [
            {
              icon: 'GlassWater',
              title: 'Chlorine taste and smell',
              text: 'Water from every faucet tastes and smells clean, not like a swimming pool, including during the utilities’ yearly chlorine burn.',
            },
            {
              icon: 'Bath',
              title: 'More comfortable showers',
              text: 'Less chlorine smell on your skin and hair after a shower, because the water is filtered before it reaches the bathroom.',
            },
            {
              icon: 'FlaskConical',
              title: 'Chloramine, done right',
              text: 'Lee County and Collier County use chloramine. Regular carbon struggles with it; we use catalytic carbon, which is made for it.',
            },
            {
              icon: 'Filter',
              title: 'Sediment and particles',
              text: 'A sediment stage catches sand, rust and debris from older pipes before they reach faucets, aerators and appliances.',
            },
            {
              icon: 'Settings',
              title: 'Kinder to appliances',
              text: 'Water heaters, washers, ice makers and fixtures get cleaner water, which helps protect valves and seals over time.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How the system works, stage by stage',
          intro: 'The exact setup depends on your test and your home. A typical city-water system looks like this:',
          items: [
            {
              title: 'Sediment pre-filter',
              text: 'Traps sand, scale flakes and rust so the main media lasts longer and works better.',
            },
            {
              title: 'Catalytic carbon tank',
              text: 'The heart of the system. Reduces chlorine and chloramine, along with the taste and odor they cause.',
            },
            {
              title: 'Optional conditioning',
              text: 'Most local city water is not hard, so we only add a softener or scale control if your test shows you need it.',
            },
            {
              title: 'Drinking water at the kitchen',
              text: 'If you want an extra step for drinking and cooking, a reverse osmosis unit under the sink completes the setup.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Catalytic carbon vs. regular carbon',
          intro: 'Not every carbon filter is the same. This is why the media matters with local city water.',
          columns: ['Regular carbon', 'Catalytic carbon'],
          rows: [
            { label: 'Chlorine', values: ['Reduces it well', 'Reduces it well'] },
            { label: 'Chloramine (Lee and Collier County)', values: ['Struggles; needs much more contact time', 'Designed for it'] },
            { label: 'Taste and odor', values: ['Good with chlorine only', 'Good with chlorine or chloramine'] },
            { label: 'During the yearly chlorine burn', values: ['Works', 'Works'] },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Do you need a softener with city water? Usually not.',
          text: 'Fort Myers city water is soft (about 1.8 gpg) and Cape Coral itself says a softener is not needed on municipal water. We tell you the truth after testing your water, even if the answer is “you don’t need it.”',
        },
        {
          type: 'steps',
          heading: 'From the free test to clean water',
          items: [
            {
              title: 'Free in-home water test',
              text: 'We test your water in front of you and explain what the results mean. No pressure, no commitment.',
            },
            {
              title: 'An honest recommendation',
              text: 'If a system makes sense, we explain which one and why. If it doesn’t, we tell you that too.',
            },
            {
              title: 'Professional installation',
              text: 'We install the system at your main line, check for leaks and walk you through how it works.',
            },
            {
              title: 'Scheduled maintenance',
              text: 'We remind you when the pre-filter or media is due, so the system keeps working the way it should.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [
            'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water. You don’t have to chase the manufacturer: you call us.',
            'On top of that we offer lifetime support for as long as the system is kept in good standing: scheduled maintenance done on time, payments current and the system used as intended.',
          ],
        },
        {
          type: 'faq',
          heading: 'Questions about whole-house filtration',
          items: [
            {
              q: 'Does a whole-house filter make my water softer?',
              a: 'No. Carbon filtration targets chlorine, chloramine, taste and odor. Softening is a separate step, and with most local city water you don’t need it. Your test will tell us.',
            },
            {
              q: 'How often does the system need maintenance?',
              a: 'The sediment pre-filter is usually changed every few months and the carbon media lasts much longer. The exact schedule depends on your water use and your test, and we remind you when it’s time.',
            },
            {
              q: 'Will it lower my water pressure?',
              a: 'A properly sized system for your home should not cause a noticeable pressure drop. That is why we size it based on your plumbing and your household, not a one-size-fits-all model.',
            },
            {
              q: 'Is it the same as a drinking-water system?',
              a: 'No. A whole-house system treats all the water in the home. For drinking and cooking, many families add reverse osmosis at the kitchen sink for an extra level of filtration.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Find out what’s really in your tap water',
          text: 'Book a free in-home water test. We explain the results in English or Spanish and tell you honestly whether you need a system.',
        },
      ],
    },
    es: {
      metaTitle: 'Filtración para toda la casa en el SW de Florida',
      metaDescription:
        'Filtración para toda la casa con agua de ciudad: carbón catalítico contra el sabor y olor a cloro y cloraminas. Equipos hechos en EE. UU. Análisis gratis.',
      eyebrow: 'Agua de ciudad · Toda la casa',
      title: 'Filtración para toda la casa, pensada para el agua de ciudad del suroeste de Florida',
      lead: 'El agua de la ciudad llega tratada para ser segura, pero trae cloro o cloraminas que se notan en el sabor y el olor. Un sistema para toda la casa filtra cada llave, de la cocina a la ducha, con materiales de primera y equipos fabricados en EE. UU.',
      highlights: [
        'Carbón catalítico para cloro y cloraminas',
        'Filtra todas las llaves y duchas de la casa',
        'Equipos fabricados en EE. UU.',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'Lo que resuelve un filtro para toda la casa',
          intro: 'Solo te lo recomendamos si tu análisis muestra que tiene sentido. Estos son los problemas del día a día para los que está diseñado.',
          items: [
            {
              icon: 'GlassWater',
              title: 'Sabor y olor a cloro',
              text: 'El agua de cualquier llave sabe y huele a limpio, no a piscina, incluso durante la purga anual de cloro de la ciudad o el condado.',
            },
            {
              icon: 'Bath',
              title: 'Duchas más agradables',
              text: 'Menos olor a cloro en la piel y el cabello después de bañarte, porque el agua ya llega filtrada al baño.',
            },
            {
              icon: 'FlaskConical',
              title: 'Cloraminas, bien tratadas',
              text: 'Lee County y Collier County usan cloraminas. El carbón común no basta; usamos carbón catalítico, que está hecho para eso.',
            },
            {
              icon: 'Filter',
              title: 'Sedimentos y partículas',
              text: 'Una etapa de sedimentos atrapa arena, óxido y residuos de tuberías viejas antes de que lleguen a las llaves y a los electrodomésticos.',
            },
            {
              icon: 'Settings',
              title: 'Cuida tus electrodomésticos',
              text: 'El calentador, la lavadora, la máquina de hielo y las llaves reciben agua más limpia, lo que ayuda a proteger válvulas y empaques con el tiempo.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Cómo funciona el sistema, etapa por etapa',
          intro: 'La configuración exacta depende de tu análisis y de tu casa. Un sistema típico para agua de ciudad se ve así:',
          items: [
            {
              title: 'Prefiltro de sedimentos',
              text: 'Atrapa arena, escamas de sarro y óxido para que el material principal dure más y trabaje mejor.',
            },
            {
              title: 'Tanque de carbón catalítico',
              text: 'El corazón del sistema. Reduce el cloro y las cloraminas, y con ellos el mal sabor y el olor.',
            },
            {
              title: 'Acondicionamiento opcional',
              text: 'El agua de ciudad de la zona casi nunca es dura, así que solo añadimos suavizador o control de sarro si tu análisis lo indica.',
            },
            {
              title: 'Agua para beber en la cocina',
              text: 'Si quieres un paso extra para beber y cocinar, una ósmosis inversa bajo el fregadero completa el sistema.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Carbón catalítico vs. carbón común',
          intro: 'No todos los filtros de carbón son iguales. Por eso el material importa con el agua de ciudad de la zona.',
          columns: ['Carbón común', 'Carbón catalítico'],
          rows: [
            { label: 'Cloro', values: ['Lo reduce bien', 'Lo reduce bien'] },
            { label: 'Cloraminas (Lee y Collier County)', values: ['Le cuesta; necesita mucho más contacto', 'Diseñado para eso'] },
            { label: 'Sabor y olor', values: ['Bien solo con cloro', 'Bien con cloro o cloraminas'] },
            { label: 'Durante la purga anual de cloro', values: ['Funciona', 'Funciona'] },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: '¿Necesitas suavizador con agua de ciudad? Casi nunca.',
          text: 'El agua de la ciudad de Fort Myers es blanda (unos 1.8 gpg) y la propia ciudad de Cape Coral dice que con agua municipal no hace falta suavizador. Te decimos la verdad después de analizar tu agua, aunque la respuesta sea “no lo necesitas”.',
        },
        {
          type: 'steps',
          heading: 'Del análisis gratis al agua limpia',
          items: [
            {
              title: 'Análisis de agua gratis en tu casa',
              text: 'Analizamos tu agua delante de ti y te explicamos qué significan los resultados. Sin presión y sin compromiso.',
            },
            {
              title: 'Una recomendación honesta',
              text: 'Si un sistema tiene sentido, te explicamos cuál y por qué. Si no lo necesitas, también te lo decimos.',
            },
            {
              title: 'Instalación profesional',
              text: 'Instalamos el sistema en la entrada principal de agua, revisamos que no haya fugas y te enseñamos cómo funciona.',
            },
            {
              title: 'Mantenimiento programado',
              text: 'Te avisamos cuando toca cambiar el prefiltro o el material, para que el sistema siga funcionando como debe.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [
            'Cada sistema lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros. No tienes que pelear con el fabricante: nos llamas a nosotros.',
            'Además te damos soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo.',
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre la filtración para toda la casa',
          items: [
            {
              q: '¿Un filtro para toda la casa ablanda el agua?',
              a: 'No. La filtración con carbón trabaja sobre el cloro, las cloraminas, el sabor y el olor. Ablandar es otro paso, y con la mayoría del agua de ciudad de la zona no lo necesitas. Tu análisis nos lo dirá.',
            },
            {
              q: '¿Cada cuánto necesita mantenimiento?',
              a: 'El prefiltro de sedimentos normalmente se cambia cada pocos meses y el carbón dura mucho más. El calendario exacto depende de tu consumo y de tu análisis, y nosotros te avisamos cuando toca.',
            },
            {
              q: '¿Me va a bajar la presión del agua?',
              a: 'Un sistema del tamaño correcto para tu casa no debería causar una baja de presión notable. Por eso lo dimensionamos según tu plomería y tu familia, no con un modelo único para todos.',
            },
            {
              q: '¿Es lo mismo que un sistema de agua para beber?',
              a: 'No. El sistema para toda la casa trata toda el agua del hogar. Para beber y cocinar, muchas familias añaden una ósmosis inversa en el fregadero de la cocina como filtración extra.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Descubre qué trae de verdad el agua de tu llave',
          text: 'Pide tu análisis de agua gratis en casa. Te explicamos los resultados en español o inglés y te decimos con honestidad si necesitas un sistema.',
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
      title: 'Well water systems designed around your test, not a catalog',
      lead: 'Well water is what we know best. Every well in Southwest Florida is different, so we test first and then design a system for the sulfur, iron, hardness or bacteria your water actually has.',
      highlights: [
        'Our founder’s 25+ years in water treatment',
        'Custom design based on your water test',
        'Equipment made in the USA',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'Well water problems we solve',
          intro: 'These are the most common issues we find in private wells across Lee and Collier County.',
          items: [
            {
              icon: 'Wind',
              title: 'Rotten-egg smell (sulfur)',
              text: 'Hydrogen sulfide can be smelled at very low levels and, at higher levels, stains and corrodes. Air injection and oxidation are designed to handle it.',
            },
            {
              icon: 'Shirt',
              title: 'Orange iron stains',
              text: 'Iron leaves orange marks on laundry, sinks, driveways and walls hit by sprinklers. We oxidize and filter it before it reaches the house.',
            },
            {
              icon: 'Gauge',
              title: 'Hard water and scale',
              text: 'A softener sized for your hardness and your family helps prevent scale on fixtures, glass and the water heater.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Bacteria concerns',
              text: 'UV systems are designed to disinfect water. We confirm the result with a lab test, never with a guess.',
            },
            {
              icon: 'Droplet',
              title: 'Color, tannins and taste',
              text: 'Yellowish or tea-colored water and off tastes call for specific media. The test tells us which one.',
            },
            {
              icon: 'GlassWater',
              title: 'Drinking water',
              text: 'Reverse osmosis at the kitchen sink adds a final step for drinking and cooking, and it also reduces salts and sodium.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Why there is no “one system for every well”',
          text: 'Two neighbors on the same street can have very different wells. A system that ignores sulfur or iron can foul a softener in months. That’s why we test before recommending anything, and why we won’t sell you a box off the shelf.',
        },
        {
          type: 'steps',
          heading: 'How a typical well system is put together',
          intro: 'The order matters. Each stage protects the next one. Your system includes only the stages your test calls for.',
          items: [
            {
              title: 'Air injection / oxidation',
              text: 'Air or an oxidizer turns dissolved sulfur and iron into particles that can be filtered out.',
            },
            {
              title: 'Filtration media',
              text: 'A backwashing filter, often catalytic carbon or iron-specific media, traps what the oxidation step released.',
            },
            {
              title: 'Water softener',
              text: 'Once iron and sulfur are handled, the softener takes care of hardness without being fouled.',
            },
            {
              title: 'UV disinfection',
              text: 'If the test shows bacteria concerns, a UV unit is designed to disinfect the water before it’s used.',
            },
            {
              title: 'Reverse osmosis at the kitchen',
              text: 'An optional final step for the water your family drinks and cooks with.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Private wells in Florida: what to know',
          items: [
            {
              label: 'Floridians on private wells',
              value: '2.6 million+',
              detail: 'According to the Florida Department of Environmental Protection.',
            },
            {
              label: 'Who is responsible for the well',
              value: 'The owner',
              detail: 'No utility tests a private well for you.',
            },
            {
              label: 'Recommended testing',
              value: 'At least once a year',
              detail: 'For bacteria and chemicals, as recommended by the Department of Health.',
            },
            {
              label: 'Sulfur odor threshold',
              value: '~0.1 mg/L',
              detail: 'Around 1 mg/L, hydrogen sulfide can also stain and corrode (UF/IFAS).',
            },
          ],
          source: {
            label: 'Florida Department of Health in Lee County: drinking water',
            url: 'https://lee.floridahealth.gov/programs-and-services/environmental-health/drinking-water/',
          },
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [
            'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water. If something fails, you call us, not the factory.',
            'On top of that we offer lifetime support for as long as the system is kept in good standing: scheduled maintenance done on time, payments current and the system used as intended. With well water, on-time maintenance is what keeps the system performing year after year.',
          ],
        },
        {
          type: 'faq',
          heading: 'Questions about well water systems',
          items: [
            {
              q: 'Can one filter fix sulfur, iron and hardness at once?',
              a: 'Rarely. Each problem needs the right stage in the right order. Trying to do everything with one tank usually means it clogs or stops working early.',
            },
            {
              q: 'Do I still need to test my well after installing a system?',
              a: 'Yes. The Department of Health recommends testing a private well at least once a year for bacteria and chemicals. DOH-Lee has a certified lab, and we can help you understand the results.',
            },
            {
              q: 'Does a well system use salt?',
              a: 'Only if it includes a softener. Air injection, carbon and UV don’t use salt. We explain how much upkeep each stage needs before you decide.',
            },
            {
              q: 'What happens to my system after a flood or hurricane?',
              a: 'If floodwater covered the well, don’t drink the water. The well must be shock-chlorinated, filters and membranes replaced, and the water re-tested for bacteria before use. We can help you through each step.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Let’s test your well first',
          text: 'Book a free in-home water test. We’ll show you what your well water has and tell you honestly what it needs, and what it doesn’t.',
        },
      ],
    },
    es: {
      metaTitle: 'Sistemas para agua de pozo en el SW de Florida',
      metaDescription:
        'Sistemas para agua de pozo a tu medida: olor a azufre, manchas de hierro, dureza y bacterias. Diseñados según tu análisis. Análisis gratis, sin presión.',
      eyebrow: 'Agua de pozo · Nuestra especialidad',
      title: 'Sistemas para agua de pozo diseñados según tu análisis, no por catálogo',
      lead: 'El agua de pozo es lo que mejor conocemos. Cada pozo del suroeste de Florida es distinto, así que primero analizamos y luego diseñamos un sistema para el azufre, el hierro, la dureza o las bacterias que tu agua tiene de verdad.',
      highlights: [
        'Más de 25 años de experiencia de nuestro fundador',
        'Diseño a medida según tu análisis',
        'Equipos fabricados en EE. UU.',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'Problemas del agua de pozo que resolvemos',
          intro: 'Estos son los problemas más comunes que encontramos en pozos privados de Lee y Collier County.',
          items: [
            {
              icon: 'Wind',
              title: 'Olor a huevo podrido (azufre)',
              text: 'El sulfuro de hidrógeno se huele en cantidades muy pequeñas y, en niveles más altos, mancha y corroe. La inyección de aire y la oxidación están diseñadas para tratarlo.',
            },
            {
              icon: 'Shirt',
              title: 'Manchas naranjas de hierro',
              text: 'El hierro deja marcas naranjas en la ropa, los lavamanos, la entrada de la casa y las paredes que moja el riego. Lo oxidamos y filtramos antes de que entre a la casa.',
            },
            {
              icon: 'Gauge',
              title: 'Agua dura y sarro',
              text: 'Un suavizador del tamaño correcto para tu dureza y tu familia ayuda a evitar el sarro en llaves, vidrios y el calentador.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Preocupación por bacterias',
              text: 'Los sistemas UV están diseñados para desinfectar el agua. Confirmamos el resultado con un análisis de laboratorio, nunca a ojo.',
            },
            {
              icon: 'Droplet',
              title: 'Color, taninos y sabor',
              text: 'El agua amarillenta o color té y los sabores raros necesitan un material específico. El análisis nos dice cuál.',
            },
            {
              icon: 'GlassWater',
              title: 'Agua para beber',
              text: 'Una ósmosis inversa en el fregadero de la cocina añade un paso final para beber y cocinar, y además reduce sales y sodio.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Por qué no existe “un sistema para todos los pozos”',
          text: 'Dos vecinos de la misma calle pueden tener pozos muy distintos. Un sistema que ignora el azufre o el hierro puede arruinar un suavizador en pocos meses. Por eso analizamos antes de recomendar nada y no te vendemos una caja de estante.',
        },
        {
          type: 'steps',
          heading: 'Cómo se arma un sistema típico para pozo',
          intro: 'El orden importa: cada etapa protege a la siguiente. Tu sistema incluye solo las etapas que pide tu análisis.',
          items: [
            {
              title: 'Inyección de aire / oxidación',
              text: 'El aire o un oxidante convierte el azufre y el hierro disueltos en partículas que se pueden filtrar.',
            },
            {
              title: 'Material filtrante',
              text: 'Un filtro con retrolavado, a menudo de carbón catalítico o de un material específico para hierro, atrapa lo que soltó la oxidación.',
            },
            {
              title: 'Suavizador',
              text: 'Con el hierro y el azufre ya controlados, el suavizador se encarga de la dureza sin ensuciarse.',
            },
            {
              title: 'Desinfección UV',
              text: 'Si el análisis muestra preocupación por bacterias, una lámpara UV está diseñada para desinfectar el agua antes de usarla.',
            },
            {
              title: 'Ósmosis inversa en la cocina',
              text: 'Un paso final opcional para el agua que tu familia bebe y usa para cocinar.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Pozos privados en Florida: lo que debes saber',
          items: [
            {
              label: 'Floridanos que dependen de pozo privado',
              value: 'Más de 2.6 millones',
              detail: 'Según el Departamento de Protección Ambiental de Florida (FDEP).',
            },
            {
              label: 'Quién responde por el pozo',
              value: 'El dueño',
              detail: 'Ninguna compañía de agua analiza tu pozo privado por ti.',
            },
            {
              label: 'Análisis recomendado',
              value: 'Al menos una vez al año',
              detail: 'De bacterias y químicos, como recomienda el Departamento de Salud.',
            },
            {
              label: 'Umbral de olor del azufre',
              value: '~0.1 mg/L',
              detail: 'Desde ~1 mg/L el sulfuro de hidrógeno también puede manchar y corroer (UF/IFAS).',
            },
          ],
          source: {
            label: 'Departamento de Salud de Florida en Lee County: agua potable',
            url: 'https://lee.floridahealth.gov/programs-and-services/environmental-health/drinking-water/',
          },
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [
            'Cada sistema lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros. Si algo falla, nos llamas a nosotros, no a la fábrica.',
            'Además te damos soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo. Con agua de pozo, el mantenimiento a tiempo es lo que mantiene el sistema rindiendo año tras año.',
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre sistemas para agua de pozo',
          items: [
            {
              q: '¿Un solo filtro puede resolver azufre, hierro y dureza a la vez?',
              a: 'Casi nunca. Cada problema necesita la etapa correcta en el orden correcto. Intentar hacerlo todo con un solo tanque suele terminar en un equipo tapado o que deja de funcionar antes de tiempo.',
            },
            {
              q: '¿Tengo que seguir analizando mi pozo después de instalar un sistema?',
              a: 'Sí. El Departamento de Salud recomienda analizar el pozo privado al menos una vez al año (bacterias y químicos). DOH-Lee tiene un laboratorio certificado y te ayudamos a entender los resultados.',
            },
            {
              q: '¿El sistema para pozo usa sal?',
              a: 'Solo si incluye suavizador. La inyección de aire, el carbón y la UV no usan sal. Te explicamos cuánto mantenimiento necesita cada etapa antes de que decidas.',
            },
            {
              q: '¿Qué pasa con mi sistema después de una inundación o un huracán?',
              a: 'Si el agua cubrió el pozo, no la bebas. Hay que desinfectar el pozo con cloración de choque, cambiar filtros y membranas, y volver a analizar las bacterias antes de usarla. Te acompañamos en cada paso.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Primero, analicemos tu pozo',
          text: 'Pide tu análisis de agua gratis en casa. Te mostramos qué tiene el agua de tu pozo y te decimos con honestidad qué necesita, y qué no.',
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
      title: 'Reverse osmosis for the water you drink and cook with',
      lead: 'A reverse osmosis system under your kitchen sink gives you filtered water on tap for drinking, coffee, ice and cooking. It works with city water or well water, and it’s the step that reduces sodium and dissolved salts.',
      highlights: [
        'Multi-stage filtration under the sink',
        'Reduces sodium and dissolved solids',
        'Optional remineralization for taste',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'What reverse osmosis is good for',
          items: [
            {
              icon: 'GlassWater',
              title: 'Better-tasting drinking water',
              text: 'Clean taste for water, coffee and tea, without buying and hauling bottled water.',
            },
            {
              icon: 'Scale',
              title: 'Lower sodium',
              text: 'Fort Myers city water averages 114 ppm of sodium. RO reduces it, which matters if someone at home watches their salt.',
            },
            {
              icon: 'CookingPot',
              title: 'Cooking and ice',
              text: 'Filtered water for soups, rice, pasta and ice, straight from a dedicated faucet.',
            },
            {
              icon: 'FlaskConical',
              title: 'Dissolved solids',
              text: 'The membrane reduces a wide range of dissolved salts and minerals that ordinary filters let through.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How the stages work',
          intro: 'Configurations vary by model and by your water, but a typical under-sink system has these stages:',
          items: [
            {
              title: 'Sediment pre-filter',
              text: 'Catches sand and particles that would clog the membrane.',
            },
            {
              title: 'Carbon pre-filter',
              text: 'Reduces chlorine and chloramine, which protects the membrane and improves taste.',
            },
            {
              title: 'RO membrane',
              text: 'Water is pushed through a very fine membrane that reduces dissolved salts, sodium and many other substances.',
            },
            {
              title: 'Carbon polishing filter',
              text: 'A final touch on taste before the water reaches your faucet.',
            },
            {
              title: 'Remineralization (optional)',
              text: 'Adds minerals back and raises the water’s pH for a smoother, rounder taste.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Standard RO vs. RO with remineralization',
          intro: 'Both deliver filtered drinking water. The difference is taste.',
          columns: ['Standard RO', 'RO + remineralization'],
          rows: [
            { label: 'Sodium and dissolved solids', values: ['Reduced', 'Reduced'] },
            { label: 'Water pH', values: ['Slightly lower', 'Raised by the mineral stage'] },
            { label: 'Taste', values: ['Very clean, light', 'Smoother, with minerals added back'] },
            { label: 'Extra maintenance', values: ['None', 'One more cartridge to change'] },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'About “alkaline water”',
          text: 'The remineralization stage raises the pH of the water and adds minerals back for better taste. That’s what it does, and that’s all we claim.',
        },
        {
          type: 'prose',
          heading: 'Warranty and lifetime support',
          paragraphs: [
            'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water.',
            'On top of that we offer lifetime support for as long as the system is kept in good standing: scheduled maintenance done on time, payments current and the system used as intended. With RO, on-time filter changes are what protect the membrane.',
          ],
        },
        {
          type: 'faq',
          heading: 'Questions about reverse osmosis',
          items: [
            {
              q: 'Does reverse osmosis waste water?',
              a: 'RO sends part of the water to the drain to rinse the membrane; that’s how it stays clean. How much depends on the model and your water pressure. We explain it for the specific unit we recommend, and it’s only used for drinking and cooking, not for the whole house.',
            },
            {
              q: 'How often do I change the filters?',
              a: 'The pre-filters are changed more often than the membrane, and the exact schedule depends on your water and how much you use. We set it up for your system and remind you when it’s time.',
            },
            {
              q: 'Does alkaline water have health benefits?',
              a: 'We don’t make health claims. The remineralization stage raises the water’s pH and adds minerals back so it tastes better. That’s the honest answer.',
            },
            {
              q: 'Can I connect it to my refrigerator or ice maker?',
              a: 'In many kitchens, yes. We check the distance and layout during the visit and tell you if it’s doable.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Taste the difference at your own sink',
          text: 'Start with a free in-home water test. We’ll tell you whether RO makes sense for your water, in English or Spanish.',
        },
      ],
    },
    es: {
      metaTitle: 'Ósmosis inversa bajo el fregadero | Infinity Water',
      metaDescription:
        'Ósmosis inversa bajo el fregadero para el agua que bebes y con la que cocinas. Reduce el sodio y los sólidos disueltos, con remineralización opcional.',
      eyebrow: 'Agua para beber · Cocina',
      title: 'Ósmosis inversa para el agua que bebes y con la que cocinas',
      lead: 'Un sistema de ósmosis inversa bajo el fregadero te da agua filtrada en la llave para beber, hacer café, hielo y cocinar. Funciona con agua de ciudad o de pozo, y es el paso que reduce el sodio y las sales disueltas.',
      highlights: [
        'Filtración en varias etapas bajo el fregadero',
        'Reduce el sodio y los sólidos disueltos',
        'Remineralización opcional para mejor sabor',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'Para qué sirve la ósmosis inversa',
          items: [
            {
              icon: 'GlassWater',
              title: 'Agua para beber con mejor sabor',
              text: 'Sabor limpio para el agua, el café y el té, sin comprar ni cargar botellones.',
            },
            {
              icon: 'Scale',
              title: 'Menos sodio',
              text: 'El agua de la ciudad de Fort Myers tiene en promedio 114 ppm de sodio. La ósmosis lo reduce, algo importante si alguien en casa cuida la sal.',
            },
            {
              icon: 'CookingPot',
              title: 'Para cocinar y hacer hielo',
              text: 'Agua filtrada para sopas, arroz, pasta y hielo, directo de una llave aparte.',
            },
            {
              icon: 'FlaskConical',
              title: 'Sólidos disueltos',
              text: 'La membrana reduce muchas sales y minerales disueltos que los filtros comunes dejan pasar.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Cómo funcionan las etapas',
          intro: 'La configuración cambia según el modelo y tu agua, pero un sistema típico bajo el fregadero tiene estas etapas:',
          items: [
            {
              title: 'Prefiltro de sedimentos',
              text: 'Atrapa arena y partículas que taparían la membrana.',
            },
            {
              title: 'Prefiltro de carbón',
              text: 'Reduce el cloro y las cloraminas, lo que protege la membrana y mejora el sabor.',
            },
            {
              title: 'Membrana de ósmosis inversa',
              text: 'El agua pasa por una membrana finísima que reduce las sales disueltas, el sodio y muchas otras sustancias.',
            },
            {
              title: 'Filtro final de carbón',
              text: 'Un último toque al sabor antes de que el agua llegue a tu llave.',
            },
            {
              title: 'Remineralización (opcional)',
              text: 'Le devuelve minerales al agua y eleva su pH para un sabor más suave y redondo.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Ósmosis estándar vs. ósmosis con remineralización',
          intro: 'Las dos te dan agua filtrada para beber. La diferencia está en el sabor.',
          columns: ['Ósmosis estándar', 'Ósmosis + remineralización'],
          rows: [
            { label: 'Sodio y sólidos disueltos', values: ['Reducidos', 'Reducidos'] },
            { label: 'pH del agua', values: ['Un poco más bajo', 'Elevado por la etapa mineral'] },
            { label: 'Sabor', values: ['Muy limpio, ligero', 'Más suave, con minerales de vuelta'] },
            { label: 'Mantenimiento extra', values: ['Ninguno', 'Un cartucho más que cambiar'] },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Sobre el “agua alcalina”',
          text: 'La etapa de remineralización eleva el pH del agua y le devuelve minerales para que sepa mejor. Eso es lo que hace, y es todo lo que afirmamos.',
        },
        {
          type: 'prose',
          heading: 'Garantía y soporte de por vida',
          paragraphs: [
            'Cada sistema lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros.',
            'Además te damos soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo. En la ósmosis, cambiar los filtros a tiempo es lo que protege la membrana.',
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre la ósmosis inversa',
          items: [
            {
              q: '¿La ósmosis inversa desperdicia agua?',
              a: 'La ósmosis manda parte del agua al drenaje para enjuagar la membrana; así se mantiene limpia. Cuánta depende del modelo y de la presión de tu agua. Te lo explicamos para el equipo concreto que te recomendamos, y recuerda que solo se usa para beber y cocinar, no para toda la casa.',
            },
            {
              q: '¿Cada cuánto cambio los filtros?',
              a: 'Los prefiltros se cambian con más frecuencia que la membrana, y el calendario exacto depende de tu agua y de tu consumo. Lo armamos para tu sistema y te avisamos cuando toca.',
            },
            {
              q: '¿El agua alcalina tiene beneficios para la salud?',
              a: 'No hacemos afirmaciones de salud. La etapa de remineralización eleva el pH del agua y le devuelve minerales para que sepa mejor. Esa es la respuesta honesta.',
            },
            {
              q: '¿Se puede conectar al refrigerador o a la máquina de hielo?',
              a: 'En muchas cocinas, sí. Revisamos la distancia y la distribución durante la visita y te decimos si se puede.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Prueba la diferencia en tu propio fregadero',
          text: 'Empieza con un análisis de agua gratis en casa. Te decimos si la ósmosis inversa tiene sentido para tu agua, en español o inglés.',
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
      title: 'Maintenance that keeps your water system working like day one',
      lead: 'A water treatment system is only as good as its upkeep. We handle scheduled maintenance, filter and membrane changes and plumbing repairs related to your system, and we can check equipment from other brands too.',
      highlights: [
        'Scheduled visits and reminders',
        'We also check other brands’ systems',
        'Keeps your lifetime support active',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'What our maintenance service covers',
          items: [
            {
              icon: 'CalendarCheck',
              title: 'Scheduled maintenance',
              text: 'Regular visits on a schedule set for your system and your water, so nothing gets forgotten.',
            },
            {
              icon: 'Filter',
              title: 'Filter and membrane changes',
              text: 'Sediment and carbon cartridges, RO membranes and remineralization stages, replaced on time.',
            },
            {
              icon: 'Search',
              title: 'Other brands, too',
              text: 'Bought your system elsewhere or moved into a house that already had one? We inspect it and tell you honestly what shape it’s in.',
            },
            {
              icon: 'Wrench',
              title: 'System-related plumbing repairs',
              text: 'Leaks at the system, bypass valves, fittings and connections that are part of your water treatment setup.',
            },
            {
              icon: 'Settings',
              title: 'Adjustments and settings',
              text: 'Softener regeneration, backwash cycles and air injection checked and tuned to your water and use.',
            },
            {
              icon: 'MessageCircle',
              title: 'Reminders by WhatsApp or phone',
              text: 'We let you know when service is due, in English or Spanish.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'What happens during a maintenance visit',
          items: [
            {
              title: 'Check the water',
              text: 'We test key parameters to confirm the system is still doing its job.',
            },
            {
              title: 'Inspect the equipment',
              text: 'Valves, tanks, connections, air injection and UV lamp, if you have one.',
            },
            {
              title: 'Replace what’s due',
              text: 'Filters, cartridges or membranes according to the schedule and the condition we find.',
            },
            {
              title: 'Explain and schedule',
              text: 'We tell you what we did, what we found and when the next visit is due.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Signs your system needs service now',
          items: [
            'The rotten-egg smell or chlorine taste is coming back',
            'New orange or brown stains on fixtures or laundry',
            'Lower water pressure than usual',
            'The softener isn’t using salt, or salt is bridging in the tank',
            'Your RO water tastes different or flows slowly',
            'A leak or drip near the equipment',
          ],
        },
        {
          type: 'prose',
          heading: 'Maintenance and your lifetime support',
          paragraphs: [
            'Every system we install carries the manufacturer’s warranty on its parts, honored through Infinity Water. On top of that we offer lifetime support for as long as the system is kept in good standing.',
            'Keeping it in good standing means scheduled maintenance done on time, payments current and the system used as intended. On-time maintenance isn’t just a condition: it’s what makes the equipment last.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'After a flood or hurricane',
          text: 'If floodwater reached your well or equipment, don’t drink the water. Filters and membranes must be replaced after the well is disinfected, and softeners and iron filters backwashed. Call us and we’ll walk you through it.',
        },
        {
          type: 'faq',
          heading: 'Questions about maintenance',
          items: [
            {
              q: 'Do you service systems you didn’t install?',
              a: 'Yes. We inspect systems from other brands, tell you what they need and whether they’re worth maintaining. No pressure to replace anything.',
            },
            {
              q: 'How often does my system need maintenance?',
              a: 'It depends on the system and your water. Well systems with sulfur or iron usually need more attention than a city-water filter. We set a schedule based on your test.',
            },
            {
              q: 'Do you do general plumbing?',
              a: 'We do plumbing repairs related to your water treatment system: connections, valves, leaks at the equipment. For other plumbing work in the house, we’ll tell you honestly.',
            },
            {
              q: 'What happens if I skip maintenance?',
              a: 'Performance drops, parts wear faster and your lifetime support depends on maintenance being done on time. That’s why we send reminders.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Schedule your next service',
          text: 'Message us on WhatsApp or call. If you don’t have a system yet, start with a free in-home water test.',
        },
      ],
    },
    es: {
      metaTitle: 'Mantenimiento de sistemas y plomería | Infinity Water',
      metaDescription:
        'Mantenimiento programado, cambio de filtros y membranas, revisión de otras marcas y reparaciones de plomería del sistema en el SW de Florida. En español.',
      eyebrow: 'Servicio · Mantenimiento',
      title: 'Mantenimiento para que tu sistema funcione como el primer día',
      lead: 'Un sistema de tratamiento de agua rinde lo que rinde su mantenimiento. Nos encargamos del mantenimiento programado, del cambio de filtros y membranas y de las reparaciones de plomería relacionadas con tu sistema, y también revisamos equipos de otras marcas.',
      highlights: [
        'Visitas programadas y recordatorios',
        'También revisamos sistemas de otras marcas',
        'Mantiene activo tu soporte de por vida',
      ],
      blocks: [
        {
          type: 'features',
          heading: 'Qué incluye nuestro servicio de mantenimiento',
          items: [
            {
              icon: 'CalendarCheck',
              title: 'Mantenimiento programado',
              text: 'Visitas periódicas con un calendario pensado para tu sistema y tu agua, para que no se te olvide nada.',
            },
            {
              icon: 'Filter',
              title: 'Cambio de filtros y membranas',
              text: 'Cartuchos de sedimentos y carbón, membranas de ósmosis y etapas de remineralización, cambiados a tiempo.',
            },
            {
              icon: 'Search',
              title: 'También otras marcas',
              text: '¿Compraste tu sistema en otro lado o te mudaste a una casa que ya tenía uno? Lo revisamos y te decimos con honestidad cómo está.',
            },
            {
              icon: 'Wrench',
              title: 'Plomería relacionada con el sistema',
              text: 'Fugas en el equipo, válvulas de bypass, conexiones y accesorios que forman parte de tu sistema de tratamiento.',
            },
            {
              icon: 'Settings',
              title: 'Ajustes y programación',
              text: 'Revisamos y ajustamos la regeneración del suavizador, los ciclos de retrolavado y la inyección de aire según tu agua y tu consumo.',
            },
            {
              icon: 'MessageCircle',
              title: 'Recordatorios por WhatsApp o teléfono',
              text: 'Te avisamos cuando toca el servicio, en español o en inglés.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Qué hacemos en una visita de mantenimiento',
          items: [
            {
              title: 'Revisamos el agua',
              text: 'Medimos los parámetros clave para confirmar que el sistema sigue haciendo su trabajo.',
            },
            {
              title: 'Inspeccionamos el equipo',
              text: 'Válvulas, tanques, conexiones, inyección de aire y lámpara UV, si tienes una.',
            },
            {
              title: 'Cambiamos lo que toca',
              text: 'Filtros, cartuchos o membranas según el calendario y el estado en que los encontremos.',
            },
            {
              title: 'Te explicamos y agendamos',
              text: 'Te contamos qué hicimos, qué encontramos y cuándo toca la próxima visita.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Señales de que tu sistema necesita servicio ya',
          items: [
            'Vuelve el olor a huevo podrido o el sabor a cloro',
            'Aparecen manchas naranjas o marrones nuevas en llaves o ropa',
            'La presión del agua está más baja que de costumbre',
            'El suavizador no gasta sal o la sal se hace costra en el tanque',
            'El agua de la ósmosis sabe distinto o sale muy lenta',
            'Hay una fuga o goteo cerca del equipo',
          ],
        },
        {
          type: 'prose',
          heading: 'El mantenimiento y tu soporte de por vida',
          paragraphs: [
            'Cada sistema que instalamos lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros. Además te damos soporte de por vida mientras el sistema se mantenga al día.',
            'Estar al día significa mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo. El mantenimiento a tiempo no es solo una condición: es lo que hace que el equipo dure.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Después de una inundación o un huracán',
          text: 'Si el agua de la inundación llegó a tu pozo o a tu equipo, no bebas esa agua. Después de desinfectar el pozo hay que cambiar filtros y membranas, y retrolavar suavizadores y filtros de hierro. Llámanos y te guiamos paso a paso.',
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el mantenimiento',
          items: [
            {
              q: '¿Dan servicio a sistemas que no instalaron ustedes?',
              a: 'Sí. Revisamos sistemas de otras marcas, te decimos qué necesitan y si vale la pena mantenerlos. Sin presión para cambiar nada.',
            },
            {
              q: '¿Cada cuánto necesita mantenimiento mi sistema?',
              a: 'Depende del sistema y de tu agua. Los sistemas de pozo con azufre o hierro suelen necesitar más atención que un filtro para agua de ciudad. Armamos el calendario según tu análisis.',
            },
            {
              q: '¿Hacen plomería en general?',
              a: 'Hacemos reparaciones de plomería relacionadas con tu sistema de tratamiento: conexiones, válvulas y fugas en el equipo. Si se trata de otro trabajo de plomería en la casa, te lo decimos con honestidad.',
            },
            {
              q: '¿Qué pasa si no hago el mantenimiento?',
              a: 'El sistema rinde menos, las piezas se desgastan más rápido y tu soporte de por vida depende de que el mantenimiento se haga a tiempo. Por eso te enviamos recordatorios.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Agenda tu próximo servicio',
          text: 'Escríbenos por WhatsApp o llámanos. Si todavía no tienes sistema, empieza con un análisis de agua gratis en tu casa.',
        },
      ],
    },
  },
];
