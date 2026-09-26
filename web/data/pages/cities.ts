/**
 * Paginas de ciudad (kind: 'city').
 *
 * Cada pagina usa los datos oficiales del reporte de calidad del agua (CCR)
 * de su proveedor. Solo cifras verificadas en el brief de contenido; si un
 * dato no esta confirmado (p. ej. la dureza de la ciudad de Naples), no se
 * publica.
 */

import type { ContentPage } from '../types';

const FORT_MYERS_CCR =
  'https://fortmyers.gov/DocumentCenter/View/25656/2025-Annual-Water-Quality-Report-PDF';
const CAPE_CORAL_CCR =
  'https://www.capecoral.gov/Documents/Document%20Hub/Water%20Quality%20Report/2024%20Water%20Quality%20Report%205.13.2025.pdf';
const LCU_CCR = 'https://www.leegov.com/utilities/Documents/WaterQualityReport.pdf';
const COLLIER_CCR =
  'https://www.collier.gov/files/assets/county/v/1/public-utilities/documents/water-division/2024-collier-county-water-quality-report-5-23-25.pdf';
const NAPLES_CCR = 'https://www.naplesgov.com/utilities/page/annual-water-quality-report';
const BSU_CCR = 'https://bsu.us/2025-annual-drinking-water-quality-report/';

export const CITY_PAGES: ContentPage[] = [
  /* ---------------------------------------------------------------- */
  /* Fort Myers                                                         */
  /* ---------------------------------------------------------------- */
  {
    key: 'fort-myers',
    kind: 'city',
    slug: { en: 'fort-myers', es: 'fort-myers' },
    icon: 'Building2',
    photo: 'family',
    related: ['city-water', 'reverse-osmosis', 'chlorine-taste', 'cape-coral'],
    en: {
      metaTitle: 'Water Treatment in Fort Myers, FL | Infinity Water',
      metaDescription:
        'Fort Myers city water is soft and treated by reverse osmosis. See the official numbers, when a filter makes sense, and book a free, no-pressure water test.',
      eyebrow: 'Fort Myers, FL',
      title: 'Water treatment in Fort Myers: what your home actually needs',
      lead: "We're based on Metro Parkway, so Fort Myers water is the water we know best. City water here is treated by reverse osmosis and is naturally soft, which means the right answer is often simpler than you've been told.",
      highlights: [
        'Local team based in Fort Myers',
        'Free in-home water test, no pressure',
        'Help in English and Spanish, 7 days a week',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Who supplies your water in Fort Myers?',
          paragraphs: [
            'Inside city limits, the City of Fort Myers treats groundwater from the Floridan Aquifer with reverse osmosis and disinfects it with chlorine. That is one of the reasons city water here is so soft.',
            "Not every Fort Myers address is on city water, though. Many homes in south Fort Myers and the unincorporated areas are served by Lee County Utilities, which uses chloramines instead of chlorine. That difference matters when you choose a filter, so the first thing we do is look at your water bill with you. And some homes around the city still run on a private well, which is a completely different conversation.",
          ],
        },
        {
          type: 'facts',
          heading: 'City of Fort Myers water: the official numbers',
          intro: 'Straight from the City’s 2025 Annual Water Quality Report.',
          items: [
            { label: 'Treatment', value: 'Reverse osmosis', detail: 'Source: Floridan Aquifer' },
            {
              label: 'Hardness',
              value: '~30 ppm (≈1.8 gpg)',
              detail: 'Soft water. A softener usually isn’t needed on city water.',
            },
            { label: 'Disinfectant', value: 'Chlorine, 1.99 ppm avg.', detail: 'Range: 0.41–3.1 ppm' },
            {
              label: 'Sodium',
              value: '114 ppm',
              detail: 'Worth knowing if someone at home follows a low-sodium diet.',
            },
            { label: 'TTHM', value: '3.7 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'City of Fort Myers, 2025 Annual Water Quality Report', url: FORT_MYERS_CCR },
        },
        {
          type: 'features',
          heading: 'What Fort Myers homeowners usually bring up',
          intro: 'Soft water doesn’t mean there’s nothing to improve. These are the real, fixable issues we see here.',
          items: [
            {
              icon: 'GlassWater',
              title: 'Chlorine taste and smell',
              text: 'The City keeps chlorine in the water to protect it on the way to your tap. A good carbon filter takes the taste and smell out at home.',
            },
            {
              icon: 'Scale',
              title: 'Sodium in drinking water',
              text: 'At 114 ppm, sodium is higher than in nearby utilities. An under-sink reverse osmosis system reduces it in the water you drink and cook with.',
            },
            {
              icon: 'Wrench',
              title: 'Older plumbing inside the house',
              text: 'The City delivers treated water to your meter. After that, older pipes and fixtures in the home can affect what comes out of the faucet.',
            },
            {
              icon: 'Wind',
              title: 'Well water on the edge of town',
              text: 'Homes on private wells around Fort Myers deal with sulfur smell, iron stains and hardness. That’s where our founder’s 25+ years in well water really count.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'City water vs. a private well in Fort Myers',
          columns: ['City of Fort Myers water', 'Private well'],
          rows: [
            {
              label: 'Who tests it',
              values: ['The City, with a public annual report', 'You. Nobody tests a private well for you'],
            },
            { label: 'Hardness', values: ['Soft (~1.8 gpg)', 'Often hard; depends on the well'] },
            {
              label: 'Typical complaints',
              values: ['Chlorine taste, sodium', 'Rotten-egg smell, orange stains, scale'],
            },
            {
              label: 'What we usually suggest',
              values: [
                'Carbon filtration, plus RO for drinking if you want it',
                'Oxidation for sulfur and iron, softener, UV when the test calls for it',
              ],
            },
            { label: 'Softener', values: ['Usually not needed', 'Often needed, after testing'] },
          ],
        },
        {
          type: 'steps',
          heading: 'How a visit works in Fort Myers',
          items: [
            {
              title: 'We test at your kitchen sink',
              text: 'Free and in person. We check your water and look at your bill so we know who supplies it.',
            },
            {
              title: 'We compare it with the official report',
              text: 'You see your results next to the City’s own numbers, so nothing is left to our word alone.',
            },
            {
              title: 'We tell you honestly what you need',
              text: 'Sometimes that’s a whole-house filter, sometimes only a drinking-water system, and sometimes nothing at all.',
            },
            {
              title: 'Installation and lifetime support',
              text: 'Made in USA equipment, manufacturer warranty handled by us, and support for as long as your system is kept up to date.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Fort Myers water questions',
          items: [
            {
              q: 'Do I need a water softener with Fort Myers city water?',
              a: 'Usually not. The City’s reverse osmosis water comes in around 30 ppm of hardness (about 1.8 gpg), which is soft. If someone tells you city water here is very hard, ask to see the numbers. A softener makes sense on many private wells, not on city water.',
            },
            {
              q: 'Why does Fort Myers water have so much sodium?',
              a: 'The City reports 114 ppm of sodium. It’s within what’s allowed, but if your doctor has you on a low-sodium diet, an under-sink reverse osmosis system reduces sodium in the water you drink and cook with.',
            },
            {
              q: 'Is my water from the City or from Lee County Utilities?',
              a: 'Check the name on your water bill. It matters: the City uses chlorine, while Lee County Utilities uses chloramines, which need catalytic carbon to be filtered well. Regular carbon isn’t enough.',
            },
            {
              q: 'Is the free water test really free?',
              a: 'Yes. No cost, no pressure and no commitment. We explain the results and tell you if you don’t need anything. And under Florida law, if you ever buy in your home, you can cancel until midnight of the third business day.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Find out what your Fort Myers water really needs',
          text: 'Book a free in-home water test. We’re right here on Metro Parkway and we’ll give you a straight answer, in English or Spanish.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua en Fort Myers, FL | Infinity Water',
      metaDescription:
        'El agua de la ciudad de Fort Myers es blanda y tratada por ósmosis inversa. Mira los datos oficiales, cuándo conviene un filtro y pide tu análisis gratis.',
      eyebrow: 'Fort Myers, FL',
      title: 'Tratamiento de agua en Fort Myers: lo que tu casa realmente necesita',
      lead: 'Estamos en Metro Parkway, así que el agua de Fort Myers es la que mejor conocemos. Aquí el agua de la ciudad se trata con ósmosis inversa y es blanda por naturaleza, así que la solución casi siempre es más sencilla de lo que te han dicho.',
      highlights: [
        'Equipo local con base en Fort Myers',
        'Análisis de agua gratis en casa, sin presión',
        'Te atendemos en español e inglés, 7 días a la semana',
      ],
      blocks: [
        {
          type: 'prose',
          heading: '¿Quién te suministra el agua en Fort Myers?',
          paragraphs: [
            'Dentro de los límites de la ciudad, la Ciudad de Fort Myers trata agua subterránea del Acuífero Floridano con ósmosis inversa y la desinfecta con cloro. Por eso el agua de la ciudad aquí es tan blanda.',
            'Pero no todas las direcciones de Fort Myers reciben agua de la ciudad. Muchas casas del sur de Fort Myers y de las zonas no incorporadas las atiende Lee County Utilities, que usa cloraminas en lugar de cloro. Esa diferencia importa a la hora de elegir un filtro, por eso lo primero que hacemos es revisar contigo tu factura de agua. Y algunas casas alrededor de la ciudad todavía usan pozo privado, que es otra historia completamente distinta.',
          ],
        },
        {
          type: 'facts',
          heading: 'Agua de la Ciudad de Fort Myers: los datos oficiales',
          intro: 'Tomados directamente del Reporte Anual de Calidad del Agua 2025 de la ciudad.',
          items: [
            { label: 'Tratamiento', value: 'Ósmosis inversa', detail: 'Fuente: Acuífero Floridano' },
            {
              label: 'Dureza',
              value: '~30 ppm (≈1.8 gpg)',
              detail: 'Agua blanda. Con agua de la ciudad normalmente no necesitas suavizador.',
            },
            { label: 'Desinfectante', value: 'Cloro, 1.99 ppm promedio', detail: 'Rango: 0.41–3.1 ppm' },
            {
              label: 'Sodio',
              value: '114 ppm',
              detail: 'Conviene saberlo si alguien en casa sigue una dieta baja en sodio.',
            },
            { label: 'TTHM', value: '3.7 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Ciudad de Fort Myers, Reporte Anual de Calidad del Agua 2025', url: FORT_MYERS_CCR },
        },
        {
          type: 'features',
          heading: 'Lo que más nos preguntan las familias de Fort Myers',
          intro: 'Que el agua sea blanda no significa que no haya nada que mejorar. Estos son los problemas reales, y con solución, que vemos aquí.',
          items: [
            {
              icon: 'GlassWater',
              title: 'Sabor y olor a cloro',
              text: 'La ciudad mantiene cloro en el agua para protegerla en el camino hasta tu llave. Un buen filtro de carbón le quita ese sabor y olor en casa.',
            },
            {
              icon: 'Scale',
              title: 'Sodio en el agua que tomas',
              text: 'Con 114 ppm, el sodio es más alto que en los servicios vecinos. Una ósmosis inversa bajo el fregadero lo reduce en el agua para tomar y cocinar.',
            },
            {
              icon: 'Wrench',
              title: 'Tuberías viejas dentro de la casa',
              text: 'La ciudad entrega el agua tratada hasta tu medidor. De ahí en adelante, las tuberías y llaves viejas de la casa pueden afectar lo que sale por el grifo.',
            },
            {
              icon: 'Wind',
              title: 'Agua de pozo en las afueras',
              text: 'Las casas con pozo privado alrededor de Fort Myers lidian con olor a azufre, manchas de hierro y sarro. Ahí es donde más cuentan los más de 25 años de experiencia de nuestro fundador en agua de pozo.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Agua de la ciudad vs. pozo privado en Fort Myers',
          columns: ['Agua de la Ciudad de Fort Myers', 'Pozo privado'],
          rows: [
            {
              label: '¿Quién la analiza?',
              values: ['La ciudad, con un reporte anual público', 'Tú. Nadie analiza un pozo privado por ti'],
            },
            { label: 'Dureza', values: ['Blanda (~1.8 gpg)', 'Suele ser dura; depende del pozo'] },
            {
              label: 'Quejas típicas',
              values: ['Sabor a cloro, sodio', 'Olor a huevo podrido, manchas naranjas, sarro'],
            },
            {
              label: 'Lo que solemos recomendar',
              values: [
                'Filtración de carbón y, si quieres, ósmosis inversa para tomar',
                'Oxidación para azufre y hierro, suavizador y UV si el análisis lo indica',
              ],
            },
            { label: 'Suavizador', values: ['Normalmente no hace falta', 'Muchas veces sí, tras el análisis'] },
          ],
        },
        {
          type: 'steps',
          heading: 'Así es una visita en Fort Myers',
          items: [
            {
              title: 'Analizamos el agua en tu cocina',
              text: 'Gratis y en persona. Revisamos tu agua y tu factura para saber quién te la suministra.',
            },
            {
              title: 'La comparamos con el reporte oficial',
              text: 'Ves tus resultados junto a las cifras de la propia ciudad, para que no dependas solo de nuestra palabra.',
            },
            {
              title: 'Te decimos con honestidad qué necesitas',
              text: 'A veces es un filtro para toda la casa, a veces solo un sistema para el agua de tomar, y a veces nada.',
            },
            {
              title: 'Instalación y soporte de por vida',
              text: 'Equipos fabricados en EE. UU., garantía del fabricante gestionada por nosotros y soporte mientras tu sistema esté al día.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el agua en Fort Myers',
          items: [
            {
              q: '¿Necesito suavizador con el agua de la ciudad de Fort Myers?',
              a: 'Normalmente no. El agua de ósmosis inversa de la ciudad llega con unos 30 ppm de dureza (cerca de 1.8 gpg), que es agua blanda. Si alguien te dice que el agua de la ciudad aquí es muy dura, pídele que te enseñe los números. El suavizador tiene sentido en muchos pozos privados, no en el agua de la ciudad.',
            },
            {
              q: '¿Por qué el agua de Fort Myers tiene tanto sodio?',
              a: 'La ciudad reporta 114 ppm de sodio. Está dentro de lo permitido, pero si tu médico te indicó una dieta baja en sodio, una ósmosis inversa bajo el fregadero reduce el sodio del agua que tomas y con la que cocinas.',
            },
            {
              q: '¿Mi agua viene de la ciudad o de Lee County Utilities?',
              a: 'Fíjate en el nombre de tu factura de agua. Importa porque la ciudad usa cloro y Lee County Utilities usa cloraminas, que necesitan carbón catalítico para filtrarse bien. El carbón normal no basta.',
            },
            {
              q: '¿De verdad el análisis es gratis?',
              a: 'Sí. Sin costo, sin presión y sin compromiso. Te explicamos el resultado y te decimos si no necesitas nada. Además, por ley de Florida, si alguna vez compras en tu casa puedes cancelar hasta la medianoche del 3.er día hábil.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Descubre lo que tu agua en Fort Myers realmente necesita',
          text: 'Pide tu análisis de agua gratis en casa. Estamos aquí mismo en Metro Parkway y te damos una respuesta clara, en español o en inglés.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Cape Coral                                                         */
  /* ---------------------------------------------------------------- */
  {
    key: 'cape-coral',
    kind: 'city',
    slug: { en: 'cape-coral', es: 'cape-coral' },
    icon: 'Waves',
    photo: 'stains',
    related: ['well-water-systems', 'hurricane-well-care', 'whole-house-filtration', 'fort-myers'],
    en: {
      metaTitle: 'Cape Coral Water Treatment & Well Water | Infinity Water',
      metaDescription:
        'Cape Coral city water or a north Cape well? See the official numbers, why the City says no softener is needed, and get a free, no-pressure water test.',
      eyebrow: 'Cape Coral, FL',
      title: 'Cape Coral water: city lines, private wells and honest advice',
      lead: 'Cape Coral is really two water stories. Homes on the City’s reverse osmosis water have one set of needs; homes in north Cape still on private wells have another. We’ll tell you which one you are and what actually makes sense.',
      highlights: [
        'City water and well water specialists',
        'Free in-home test, no pressure',
        'We’ll tell you if you don’t need a softener',
      ],
      blocks: [
        {
          type: 'facts',
          heading: 'Cape Coral utility water, by the numbers',
          intro: 'From the City of Cape Coral’s 2024 Water Quality Report.',
          items: [
            { label: 'Treatment', value: 'Reverse osmosis', detail: 'Source: Upper Floridan Aquifer' },
            { label: 'Hardness', value: '5.5–6.5 gpg' },
            { label: 'Disinfectant', value: 'Chlorine, 1.34 ppm avg.', detail: 'Range: 0.21–3.0 ppm' },
            { label: 'Sodium', value: '86 ppm' },
            { label: 'TTHM', value: '33.47 ppb', detail: 'Legal limit: 80 ppb' },
            {
              label: 'Tap temperature',
              value: '~80 °F',
              detail: 'Why your “cold” water feels warm. It’s not your filter.',
            },
          ],
          source: { label: 'City of Cape Coral, 2024 Water Quality Report', url: CAPE_CORAL_CCR },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The City says it, and we agree: no softener on city water',
          text: 'The City of Cape Coral states that homes on municipal water don’t need a water softener, and suggests a carbon filter if you want better taste and odor. If you’re on city water, that’s what we’ll tell you in person too.',
        },
        {
          type: 'prose',
          heading: 'North Cape Coral: where wells and city lines meet',
          paragraphs: [
            'Many homes in north Cape Coral still get their water from a private well. The City’s Utilities Extension Program (UEP) keeps bringing water lines to new neighborhoods, but until your street is connected, the water quality in your home is your responsibility.',
            'In 2024, some wells in northeast Cape Coral went dry as the Mid-Hawthorn aquifer level dropped. A filter can’t fix a dry well; that’s a job for a well contractor. What we can do is check your treatment equipment, and make sure it’s working with the water you have now.',
            'Cape Coral also knows storm surge: Hurricane Ian pushed 6 to 9 feet of water into Cape Coral and Pine Island. If floodwater ever covers your well, don’t drink the water until the well is disinfected and tested again.',
          ],
        },
        {
          type: 'signs',
          heading: 'Signs your Cape Coral well needs attention',
          items: [
            'Rotten-egg smell, especially from hot water',
            'Orange stains on laundry, sinks, the pool deck or walls hit by sprinklers',
            'White scale on faucets, showerheads and glass doors',
            'Yellowish or tea-colored water',
            'Floodwater reached your wellhead after a storm',
            'You haven’t had the well tested in over a year',
          ],
        },
        {
          type: 'compare',
          heading: 'City water or well: what we’d recommend in Cape Coral',
          columns: ['City water (UEP-connected)', 'Private well (north Cape)'],
          rows: [
            { label: 'Softener', values: ['Not needed, per the City', 'Often yes, depending on the test'] },
            {
              label: 'Taste and odor',
              values: ['Carbon filter', 'Air injection or catalytic carbon for sulfur'],
            },
            {
              label: 'Drinking water',
              values: ['Optional under-sink RO', 'Under-sink RO, sized after testing'],
            },
            {
              label: 'Testing',
              values: ['Done by the City every year', 'Up to you, at least once a year'],
            },
            {
              label: 'After a hurricane',
              values: [
                'Follow City notices',
                'Disinfect the well, replace cartridges, retest for bacteria',
              ],
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Cape Coral water questions',
          items: [
            {
              q: 'Do I need a water softener in Cape Coral?',
              a: 'If you’re on city water, normally no. The City itself says a softener isn’t needed on municipal water. If you’re on a private well in north Cape, it depends on your test. Many wells here are hard, but we test before recommending anything.',
            },
            {
              q: 'My street is getting city water through UEP. Should I buy a well system now?',
              a: 'Ask us first. If your connection is coming soon, a full well system may not be worth it. We’ll look at your timeline and your water and tell you honestly whether to wait, or what would still be useful after you connect.',
            },
            {
              q: 'Why does my cold water come out warm?',
              a: 'Cape Coral’s water leaves the plant at around 80 °F, according to the City. It’s normal and has nothing to do with your filter or your water heater.',
            },
            {
              q: 'My neighbor’s well went dry. Can a filter help?',
              a: 'No. A dry well is a water-level problem, and it needs a licensed well contractor. Once water is flowing again, we can test it and check that your treatment equipment still fits.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'City water or well, get a straight answer',
          text: 'We’ll test your water at home for free, show you the numbers and tell you what you need, and what you don’t.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua y pozo en Cape Coral | Infinity Water',
      metaDescription:
        '¿Agua de la ciudad o pozo en el norte de Cape Coral? Mira los datos oficiales, por qué la ciudad dice que no necesitas suavizador y pide tu análisis gratis.',
      eyebrow: 'Cape Coral, FL',
      title: 'El agua en Cape Coral: red de la ciudad, pozos y consejos honestos',
      lead: 'En Cape Coral hay dos realidades de agua. Las casas con agua de ósmosis inversa de la ciudad tienen unas necesidades; las del norte que todavía usan pozo privado, otras. Te decimos en cuál estás y qué tiene sentido de verdad.',
      highlights: [
        'Especialistas en agua de ciudad y de pozo',
        'Análisis gratis en casa, sin presión',
        'Te decimos si no necesitas suavizador',
      ],
      blocks: [
        {
          type: 'facts',
          heading: 'El agua de la ciudad de Cape Coral en cifras',
          intro: 'Del Reporte de Calidad del Agua 2024 de la Ciudad de Cape Coral.',
          items: [
            { label: 'Tratamiento', value: 'Ósmosis inversa', detail: 'Fuente: Acuífero Floridano Superior' },
            { label: 'Dureza', value: '5.5–6.5 gpg' },
            { label: 'Desinfectante', value: 'Cloro, 1.34 ppm promedio', detail: 'Rango: 0.21–3.0 ppm' },
            { label: 'Sodio', value: '86 ppm' },
            { label: 'TTHM', value: '33.47 ppb', detail: 'Límite legal: 80 ppb' },
            {
              label: 'Temperatura en la llave',
              value: '~80 °F',
              detail: 'Por eso el agua “fría” sale tibia. No es culpa de tu filtro.',
            },
          ],
          source: { label: 'Ciudad de Cape Coral, Reporte de Calidad del Agua 2024', url: CAPE_CORAL_CCR },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Lo dice la ciudad y estamos de acuerdo: con agua municipal no hace falta suavizador',
          text: 'La Ciudad de Cape Coral indica que las casas con agua municipal no necesitan suavizador, y sugiere un filtro de carbón si quieres mejorar el sabor y el olor. Si tienes agua de la ciudad, eso mismo te diremos en persona.',
        },
        {
          type: 'prose',
          heading: 'El norte de Cape Coral: donde se juntan los pozos y la red de la ciudad',
          paragraphs: [
            'Muchas casas del norte de Cape Coral todavía reciben el agua de un pozo privado. El programa de extensión de servicios de la ciudad (UEP) sigue llevando tuberías a nuevos vecindarios, pero mientras tu calle no esté conectada, la calidad del agua de tu casa es responsabilidad tuya.',
            'En 2024 se secaron algunos pozos en el noreste de Cape Coral porque bajó el nivel del acuífero Mid-Hawthorn. Un filtro no arregla un pozo seco; eso le toca a un contratista de pozos. Lo que sí hacemos es revisar tu equipo de tratamiento y asegurarnos de que funcione con el agua que tienes ahora.',
            'Cape Coral también conoce la marejada: el huracán Ian metió entre 6 y 9 pies de agua en Cape Coral y Pine Island. Si alguna vez el agua de una inundación cubre tu pozo, no tomes esa agua hasta desinfectar el pozo y volver a analizarlo.',
          ],
        },
        {
          type: 'signs',
          heading: 'Señales de que tu pozo en Cape Coral necesita atención',
          items: [
            'Olor a huevo podrido, sobre todo en el agua caliente',
            'Manchas naranjas en la ropa, los lavamanos, el deck de la piscina o las paredes que moja el riego',
            'Sarro blanco en llaves, regaderas y puertas de vidrio',
            'Agua amarillenta o color té',
            'El agua de una inundación llegó a la boca del pozo después de una tormenta',
            'Hace más de un año que no analizas el pozo',
          ],
        },
        {
          type: 'compare',
          heading: 'Agua de la ciudad o pozo: lo que te recomendaríamos en Cape Coral',
          columns: ['Agua de la ciudad (conectada por UEP)', 'Pozo privado (norte de Cape)'],
          rows: [
            { label: 'Suavizador', values: ['No hace falta, según la ciudad', 'Muchas veces sí, según el análisis'] },
            {
              label: 'Sabor y olor',
              values: ['Filtro de carbón', 'Inyección de aire o carbón catalítico para el azufre'],
            },
            {
              label: 'Agua para tomar',
              values: ['Ósmosis inversa opcional bajo el fregadero', 'Ósmosis inversa bajo el fregadero, según el análisis'],
            },
            {
              label: 'Análisis',
              values: ['Lo hace la ciudad cada año', 'Te toca a ti, al menos una vez al año'],
            },
            {
              label: 'Después de un huracán',
              values: [
                'Sigue los avisos de la ciudad',
                'Desinfectar el pozo, cambiar cartuchos y volver a analizar bacterias',
              ],
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el agua en Cape Coral',
          items: [
            {
              q: '¿Necesito suavizador en Cape Coral?',
              a: 'Si tienes agua de la ciudad, normalmente no. La propia ciudad dice que con agua municipal no hace falta suavizador. Si tienes pozo privado en el norte de Cape, depende de tu análisis. Muchos pozos aquí tienen agua dura, pero analizamos antes de recomendarte nada.',
            },
            {
              q: 'Están llevando agua de la ciudad a mi calle con el UEP. ¿Compro ahora un sistema para pozo?',
              a: 'Pregúntanos primero. Si tu conexión está cerca, puede que un sistema completo para pozo no valga la pena. Revisamos tus plazos y tu agua, y te decimos con honestidad si conviene esperar o qué te seguiría sirviendo después de conectarte.',
            },
            {
              q: '¿Por qué el agua fría me sale tibia?',
              a: 'Según la ciudad, el agua de Cape Coral sale de la planta a unos 80 °F. Es normal y no tiene nada que ver con tu filtro ni con tu calentador.',
            },
            {
              q: 'El pozo de mi vecino se secó. ¿Un filtro ayuda?',
              a: 'No. Un pozo seco es un problema de nivel de agua y lo resuelve un contratista de pozos con licencia. Cuando el agua vuelva a salir, podemos analizarla y comprobar que tu equipo de tratamiento sigue siendo el adecuado.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Agua de la ciudad o de pozo: recibe una respuesta clara',
          text: 'Analizamos tu agua gratis en casa, te enseñamos los números y te decimos lo que necesitas y lo que no.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Lehigh Acres                                                       */
  /* ---------------------------------------------------------------- */
  {
    key: 'lehigh-acres',
    kind: 'city',
    slug: { en: 'lehigh-acres', es: 'lehigh-acres' },
    icon: 'Droplets',
    photo: 'smell',
    related: ['well-water', 'rotten-egg-smell', 'iron-stains', 'maintenance'],
    en: {
      metaTitle: 'Lehigh Acres Well Water Treatment | Infinity Water',
      metaDescription:
        'Many Lehigh Acres homes run on private wells: sulfur smell, iron stains, hard water. See what works, what LCU water needs, and book a free in-home water test.',
      eyebrow: 'Lehigh Acres, FL',
      title: 'Lehigh Acres water: well water done right',
      lead: 'In Lehigh Acres, a lot of homes, especially in the central, north and east parts, still draw water from a private well. Well water is our specialty, and here it’s the rule, not the exception.',
      highlights: [
        'Well water specialists',
        'Free in-home test, no pressure',
        'Maintenance and lifetime support',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'In Lehigh Acres, your well is your water utility',
          paragraphs: [
            'If your home has a private well, nobody tests that water for you. The owner is responsible for its quality, and the Florida Department of Health recommends testing a private well at least once a year for bacteria and chemicals. The DOH office in Lee County has a certified lab for that.',
            'Homes that are connected to the county system get their water from Lee County Utilities, and the needs there are very different. Below we cover both, so you know which advice applies to your house.',
          ],
        },
        {
          type: 'signs',
          heading: 'What Lehigh Acres well water usually looks like',
          intro: 'If any of these sound familiar, your well is telling you something.',
          items: [
            'Rotten-egg smell (hydrogen sulfide, noticeable from about 0.1 mg/L)',
            'Black stains or tarnished fixtures, common once sulfur reaches about 1 mg/L',
            'Orange stains on laundry, toilets and the walls your sprinklers hit',
            'Crusty white scale on faucets and in the water heater',
            'Yellow or tea-colored water from tannins',
            'An old system that nobody has serviced in years',
          ],
        },
        {
          type: 'features',
          heading: 'What actually works on Lehigh Acres wells',
          intro: 'The right combination depends on your test. These are the tools we use most here.',
          items: [
            {
              icon: 'Wind',
              title: 'Air injection / oxidation',
              text: 'Oxidizes sulfur and iron so they can be filtered out, instead of ending up in your laundry and your nose.',
            },
            {
              icon: 'Filter',
              title: 'Catalytic carbon',
              text: 'Handles leftover odor and taste. A strong option when sulfur levels are moderate.',
            },
            {
              icon: 'Droplets',
              title: 'Water softener',
              text: 'Deals with hardness, the scale that shortens the life of your water heater and fixtures.',
            },
            {
              icon: 'ShieldCheck',
              title: 'UV disinfection',
              text: 'UV systems are designed to disinfect water. We confirm the result with a lab test.',
            },
            {
              icon: 'GlassWater',
              title: 'Reverse osmosis for the kitchen',
              text: 'Under-sink drinking water, with an optional remineralization stage that raises pH and adds minerals back for better taste.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'On county water? Here’s what Lee County Utilities reports',
          intro: 'For Lehigh Acres homes connected to Lee County Utilities.',
          items: [
            {
              label: 'Treatment',
              value: 'Blend of methods',
              detail: 'Lime softening, reverse osmosis, nanofiltration and river water',
            },
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 0.6–4.0 ppm' },
            {
              label: 'Yearly chlorine burn',
              value: 'May 1–21, 2025',
              detail: 'The system switches to free chlorine once a year; taste, smell and color can change.',
            },
            { label: 'Sodium', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Water Quality Report', url: LCU_CCR },
        },
        {
          type: 'compare',
          heading: 'Well or county water: what we’d suggest in Lehigh Acres',
          columns: ['Lee County Utilities', 'Private well'],
          rows: [
            {
              label: 'Main concern',
              values: ['Chloramine taste and smell', 'Sulfur, iron, hardness, bacteria'],
            },
            {
              label: 'Filter media',
              values: ['Catalytic carbon (regular carbon isn’t enough)', 'Oxidation plus filtration, based on the test'],
            },
            { label: 'Softener', values: ['Usually not needed', 'Often needed'] },
            {
              label: 'Testing',
              values: ['Done by the utility', 'Your job, at least once a year'],
            },
            {
              label: 'Maintenance',
              values: ['Media changes on schedule', 'Salt, filter changes and yearly service'],
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Lehigh Acres water questions',
          items: [
            {
              q: 'Is Lehigh Acres water hard?',
              a: 'It depends on where it comes from. Many private wells here are hard and also carry sulfur or iron. County water from Lee County Utilities is a different story, and a softener usually isn’t needed there. A free test settles it.',
            },
            {
              q: 'How often should I test my well?',
              a: 'At least once a year, as the Florida Department of Health recommends, and again after any flooding or if the smell, color or taste changes. The DOH lab in Lee County can run a certified bacteria test.',
            },
            {
              q: 'Why does my county water smell like a pool for a few weeks?',
              a: 'Once a year Lee County Utilities switches from chloramines to free chlorine to clean the lines. In 2025 that was May 1 to 21. It’s temporary and expected.',
            },
            {
              q: 'I bought a house with an old well system. Can you service it?',
              a: 'Yes. We service and repair existing systems, including the plumbing connected to them. We’ll tell you honestly whether it’s worth fixing or whether it no longer fits your water.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Know exactly what’s in your Lehigh Acres well',
          text: 'Book a free in-home water test. No pressure, no commitment, and a clear explanation in English or Spanish.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua de pozo en Lehigh Acres | Infinity Water',
      metaDescription:
        'Muchas casas de Lehigh Acres usan pozo: olor a azufre, manchas de hierro, agua dura. Mira qué funciona, qué necesita el agua de LCU y pide tu análisis gratis.',
      eyebrow: 'Lehigh Acres, FL',
      title: 'El agua en Lehigh Acres: agua de pozo bien tratada',
      lead: 'En Lehigh Acres muchas casas, sobre todo en el centro, el norte y el este, todavía sacan el agua de un pozo privado. El agua de pozo es nuestra especialidad, y aquí es la regla, no la excepción.',
      highlights: [
        'Especialistas en agua de pozo',
        'Análisis gratis en casa, sin presión',
        'Mantenimiento y soporte de por vida',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'En Lehigh Acres, tu pozo es tu compañía de agua',
          paragraphs: [
            'Si tu casa tiene pozo privado, nadie analiza esa agua por ti. El dueño es el responsable de su calidad, y el Departamento de Salud de Florida recomienda analizar el pozo al menos una vez al año, para bacterias y químicos. La oficina del Departamento de Salud en Lee County tiene un laboratorio certificado para eso.',
            'Las casas conectadas a la red del condado reciben el agua de Lee County Utilities, y ahí las necesidades son muy distintas. Abajo te explicamos los dos casos para que sepas qué consejo aplica a tu casa.',
          ],
        },
        {
          type: 'signs',
          heading: 'Así suele verse el agua de pozo en Lehigh Acres',
          intro: 'Si reconoces alguna de estas señales, tu pozo te está diciendo algo.',
          items: [
            'Olor a huevo podrido (sulfuro de hidrógeno, se nota desde unos 0.1 mg/L)',
            'Manchas negras o llaves opacas, comunes cuando el azufre llega a 1 mg/L aproximadamente',
            'Manchas naranjas en la ropa, los inodoros y las paredes que moja el riego',
            'Sarro blanco y duro en las llaves y dentro del calentador',
            'Agua amarilla o color té por taninos',
            'Un sistema viejo al que nadie le da mantenimiento desde hace años',
          ],
        },
        {
          type: 'features',
          heading: 'Lo que de verdad funciona en los pozos de Lehigh Acres',
          intro: 'La combinación correcta depende de tu análisis. Estas son las herramientas que más usamos aquí.',
          items: [
            {
              icon: 'Wind',
              title: 'Inyección de aire / oxidación',
              text: 'Oxida el azufre y el hierro para poder filtrarlos, en vez de que terminen en tu ropa y en tu nariz.',
            },
            {
              icon: 'Filter',
              title: 'Carbón catalítico',
              text: 'Se encarga del olor y el sabor que quedan. Una buena opción cuando el azufre es moderado.',
            },
            {
              icon: 'Droplets',
              title: 'Suavizador',
              text: 'Controla la dureza, el sarro que acorta la vida de tu calentador y de tus llaves.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Desinfección UV',
              text: 'Los sistemas UV están diseñados para desinfectar el agua. Lo confirmamos con un análisis de laboratorio.',
            },
            {
              icon: 'GlassWater',
              title: 'Ósmosis inversa en la cocina',
              text: 'Agua para tomar bajo el fregadero, con etapa opcional de remineralización que eleva el pH y le devuelve minerales para mejor sabor.',
            },
          ],
        },
        {
          type: 'facts',
          heading: '¿Tienes agua del condado? Esto reporta Lee County Utilities',
          intro: 'Para las casas de Lehigh Acres conectadas a Lee County Utilities.',
          items: [
            {
              label: 'Tratamiento',
              value: 'Mezcla de métodos',
              detail: 'Ablandamiento con cal, ósmosis inversa, nanofiltración y agua de río',
            },
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 0.6–4.0 ppm' },
            {
              label: 'Purga anual con cloro',
              value: '1–21 de mayo de 2025',
              detail: 'Una vez al año el sistema pasa a cloro libre; pueden cambiar el sabor, el olor y el color.',
            },
            { label: 'Sodio', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Reporte de Calidad del Agua', url: LCU_CCR },
        },
        {
          type: 'compare',
          heading: 'Pozo o agua del condado: lo que te sugerimos en Lehigh Acres',
          columns: ['Lee County Utilities', 'Pozo privado'],
          rows: [
            {
              label: 'Problema principal',
              values: ['Sabor y olor a cloraminas', 'Azufre, hierro, dureza, bacterias'],
            },
            {
              label: 'Medio filtrante',
              values: ['Carbón catalítico (el carbón normal no basta)', 'Oxidación más filtración, según el análisis'],
            },
            { label: 'Suavizador', values: ['Normalmente no hace falta', 'Muchas veces sí'] },
            {
              label: 'Análisis',
              values: ['Lo hace la compañía de agua', 'Te toca a ti, al menos una vez al año'],
            },
            {
              label: 'Mantenimiento',
              values: ['Cambio de medio filtrante a tiempo', 'Sal, cambio de filtros y servicio anual'],
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el agua en Lehigh Acres',
          items: [
            {
              q: '¿El agua de Lehigh Acres es dura?',
              a: 'Depende de dónde venga. Muchos pozos privados aquí tienen agua dura y además azufre o hierro. El agua del condado, de Lee County Utilities, es otra historia, y ahí normalmente no hace falta suavizador. Un análisis gratis lo aclara.',
            },
            {
              q: '¿Cada cuánto debo analizar mi pozo?',
              a: 'Al menos una vez al año, como recomienda el Departamento de Salud de Florida, y otra vez después de una inundación o si cambian el olor, el color o el sabor. El laboratorio del Departamento de Salud en Lee County hace análisis certificados de bacterias.',
            },
            {
              q: '¿Por qué el agua del condado huele a piscina durante unas semanas?',
              a: 'Una vez al año Lee County Utilities cambia de cloraminas a cloro libre para limpiar las tuberías. En 2025 fue del 1 al 21 de mayo. Es temporal y está previsto.',
            },
            {
              q: 'Compré una casa con un sistema de pozo viejo. ¿Le dan servicio?',
              a: 'Sí. Damos mantenimiento y reparamos sistemas existentes, incluida la plomería conectada a ellos. Te decimos con honestidad si vale la pena arreglarlo o si ya no es el adecuado para tu agua.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Conoce exactamente qué tiene tu pozo en Lehigh Acres',
          text: 'Pide tu análisis de agua gratis en casa. Sin presión, sin compromiso y con una explicación clara, en español o en inglés.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Naples, Golden Gate Estates y Collier County                        */
  /* ---------------------------------------------------------------- */
  {
    key: 'naples',
    kind: 'city',
    slug: { en: 'naples', es: 'naples' },
    icon: 'MapPin',
    photo: 'contaminants',
    related: ['well-water-systems', 'whole-house-filtration', 'chlorine-taste', 'bonita-springs-estero'],
    en: {
      metaTitle: 'Naples & Golden Gate Water Treatment | Infinity Water',
      metaDescription:
        'Naples, Collier County or a Golden Gate Estates well? See the official water numbers, chloramines and TTHM facts, and book a free in-home water test.',
      eyebrow: 'Naples, Golden Gate Estates & Collier County',
      title: 'Naples water: three sources, three different answers',
      lead: 'Whether you’re in the City of Naples, on Collier County water or on a well in Golden Gate Estates, your water comes from a different place and needs a different approach. Here’s how to tell them apart.',
      highlights: [
        'City, county and well water covered',
        'Free in-home test, no pressure',
        'Help in English and Spanish',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Which Naples water do you have?',
          paragraphs: [
            'The City of Naples treats water from the Tamiami aquifer with lime softening. Outside city limits, most connected homes get water from the Collier County Water-Sewer District (CCWSD), which combines nanofiltration, reverse osmosis and lime softening, and disinfects with chloramines.',
            'Then there’s Golden Gate Estates, where most homes are on a private well and a septic system. Your water bill, or the lack of one, tells you which group you’re in.',
          ],
        },
        {
          type: 'facts',
          heading: 'Collier County water (CCWSD): the official numbers',
          intro: 'From the 2024 Collier County Water Quality Report.',
          items: [
            {
              label: 'Treatment',
              value: 'Nanofiltration, RO and lime softening',
            },
            { label: 'Hardness', value: '42–94 mg/L (2.4–5.5 gpg)' },
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 1.6–4.1 ppm' },
            {
              label: 'TTHM',
              value: '60.4 ppb avg.',
              detail: 'Range: 34.1–75.4 ppb. Legal limit: 80 ppb.',
            },
            { label: 'PFAS', value: 'Not detected', detail: 'Federal UCMR5 sampling, October 2024' },
            {
              label: 'Temporary switch to free chlorine',
              value: 'July 31 – Aug. 28, 2026',
            },
          ],
          source: { label: 'Collier County, 2024 Water Quality Report', url: COLLIER_CCR },
        },
        {
          type: 'facts',
          heading: 'City of Naples water',
          intro: 'The City publishes its own annual report. We only list what we’ve confirmed.',
          items: [
            { label: 'Treatment', value: 'Lime softening' },
            { label: 'Source', value: 'Tamiami aquifer' },
            {
              label: 'Hardness',
              value: 'Measured at your home',
              detail: 'We don’t publish a number we haven’t verified. We’ll test it for free.',
            },
          ],
          source: { label: 'City of Naples, Annual Water Quality Report', url: NAPLES_CCR },
        },
        {
          type: 'features',
          heading: 'Golden Gate Estates: living on a well and septic',
          intro: 'On a private well, the water is yours to test and treat. These are the issues we look for first.',
          items: [
            {
              icon: 'Wind',
              title: 'Sulfur smell',
              text: 'That rotten-egg smell is hydrogen sulfide. Air injection or catalytic carbon takes care of it.',
            },
            {
              icon: 'Shirt',
              title: 'Iron stains',
              text: 'Orange marks on laundry, sinks and the walls your sprinklers reach. Oxidation and filtration keep iron out.',
            },
            {
              icon: 'Droplets',
              title: 'Hardness and color',
              text: 'Scale on fixtures and tea-colored water from tannins, both common in well water here.',
            },
            {
              icon: 'TestTube',
              title: 'Bacteria testing',
              text: 'The Department of Health recommends testing your well at least once a year. UV systems are designed to disinfect water, and we confirm it with a lab test.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'County water vs. a Golden Gate well',
          columns: ['Collier County water', 'Private well (Golden Gate Estates)'],
          rows: [
            {
              label: 'Main concern',
              values: ['Chloramine taste, disinfection byproducts', 'Sulfur, iron, hardness, bacteria'],
            },
            {
              label: 'What we usually suggest',
              values: [
                'Whole-house catalytic carbon, plus RO for drinking if you want it',
                'Oxidation, softener and UV, based on the test',
              ],
            },
            {
              label: 'Softener',
              values: ['Usually optional', 'Often needed'],
            },
            { label: 'Testing', values: ['Done by the county', 'Your job, at least once a year'] },
          ],
        },
        {
          type: 'faq',
          heading: 'Naples and Collier County water questions',
          items: [
            {
              q: 'Should I worry about TTHM in Collier County water?',
              a: 'The county’s average was 60.4 ppb, within the 80 ppb legal limit but at about three-quarters of it. It isn’t an emergency. If you’d like to reduce disinfection byproducts at home, carbon filtration and reverse osmosis are the usual options, and we look for NSF/ANSI-certified equipment for that.',
            },
            {
              q: 'Why did my water smell like chlorine in August 2026?',
              a: 'Collier County temporarily switched from chloramines to free chlorine from July 31 to August 28, 2026. Taste and smell changes during that period are expected.',
            },
            {
              q: 'Is Naples water hard?',
              a: 'Not very. Collier County reports 2.4 to 5.5 gpg. The City of Naples uses lime softening; we don’t quote a hardness figure we haven’t confirmed, so we’ll measure it at your home. Private wells in Golden Gate Estates are a different story and are often hard.',
            },
            {
              q: 'I live in Golden Gate Estates. What should I test my well for?',
              a: 'At minimum, bacteria once a year, plus sulfur, iron, hardness and color so the system fits your water. Our in-home test covers the basics for free, and the Department of Health can run a certified bacteria test.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Naples, Collier or Golden Gate: let’s test your water',
          text: 'A free in-home test, the official numbers next to yours, and an honest recommendation, even if it’s that you don’t need anything.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua en Naples y Golden Gate | Infinity Water',
      metaDescription:
        '¿Naples, Collier County o pozo en Golden Gate Estates? Mira los datos oficiales del agua, cloraminas y TTHM, y pide tu análisis gratis en casa, sin presión.',
      eyebrow: 'Naples, Golden Gate Estates y Collier County',
      title: 'El agua en Naples: tres fuentes, tres respuestas distintas',
      lead: 'Vivas en la Ciudad de Naples, tengas agua de Collier County o un pozo en Golden Gate Estates, tu agua viene de un lugar distinto y necesita un enfoque distinto. Así puedes distinguirlas.',
      highlights: [
        'Agua de ciudad, de condado y de pozo',
        'Análisis gratis en casa, sin presión',
        'Te atendemos en español e inglés',
      ],
      blocks: [
        {
          type: 'prose',
          heading: '¿Qué agua de Naples tienes tú?',
          paragraphs: [
            'La Ciudad de Naples trata agua del acuífero Tamiami con ablandamiento con cal. Fuera de los límites de la ciudad, la mayoría de las casas conectadas reciben agua del distrito de agua de Collier County (CCWSD), que combina nanofiltración, ósmosis inversa y ablandamiento con cal, y desinfecta con cloraminas.',
            'Y luego está Golden Gate Estates, donde la mayoría de las casas tienen pozo privado y pozo séptico. Tu factura de agua, o no tener ninguna, te dice en qué grupo estás.',
          ],
        },
        {
          type: 'facts',
          heading: 'Agua de Collier County (CCWSD): los datos oficiales',
          intro: 'Del Reporte de Calidad del Agua 2024 de Collier County.',
          items: [
            {
              label: 'Tratamiento',
              value: 'Nanofiltración, ósmosis inversa y cal',
            },
            { label: 'Dureza', value: '42–94 mg/L (2.4–5.5 gpg)' },
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 1.6–4.1 ppm' },
            {
              label: 'TTHM',
              value: '60.4 ppb promedio',
              detail: 'Rango: 34.1–75.4 ppb. Límite legal: 80 ppb.',
            },
            { label: 'PFAS', value: 'No detectados', detail: 'Muestreo federal UCMR5, octubre de 2024' },
            {
              label: 'Cambio temporal a cloro libre',
              value: '31 de julio – 28 de agosto de 2026',
            },
          ],
          source: { label: 'Collier County, Reporte de Calidad del Agua 2024', url: COLLIER_CCR },
        },
        {
          type: 'facts',
          heading: 'Agua de la Ciudad de Naples',
          intro: 'La ciudad publica su propio reporte anual. Solo ponemos lo que hemos confirmado.',
          items: [
            { label: 'Tratamiento', value: 'Ablandamiento con cal' },
            { label: 'Fuente', value: 'Acuífero Tamiami' },
            {
              label: 'Dureza',
              value: 'La medimos en tu casa',
              detail: 'No publicamos una cifra que no hemos verificado. Te la medimos gratis.',
            },
          ],
          source: { label: 'Ciudad de Naples, Reporte Anual de Calidad del Agua', url: NAPLES_CCR },
        },
        {
          type: 'features',
          heading: 'Golden Gate Estates: vivir con pozo y séptico',
          intro: 'Con pozo privado, analizar y tratar el agua te toca a ti. Esto es lo primero que revisamos.',
          items: [
            {
              icon: 'Wind',
              title: 'Olor a azufre',
              text: 'Ese olor a huevo podrido es sulfuro de hidrógeno. La inyección de aire o el carbón catalítico lo resuelven.',
            },
            {
              icon: 'Shirt',
              title: 'Manchas de hierro',
              text: 'Marcas naranjas en la ropa, los lavamanos y las paredes que alcanza el riego. La oxidación y la filtración mantienen el hierro fuera.',
            },
            {
              icon: 'Droplets',
              title: 'Dureza y color',
              text: 'Sarro en las llaves y agua color té por taninos, las dos cosas son comunes en los pozos de aquí.',
            },
            {
              icon: 'TestTube',
              title: 'Análisis de bacterias',
              text: 'El Departamento de Salud recomienda analizar el pozo al menos una vez al año. Los sistemas UV están diseñados para desinfectar el agua, y lo confirmamos con un análisis de laboratorio.',
            },
          ],
        },
        {
          type: 'compare',
          heading: 'Agua del condado vs. pozo en Golden Gate',
          columns: ['Agua de Collier County', 'Pozo privado (Golden Gate Estates)'],
          rows: [
            {
              label: 'Problema principal',
              values: ['Sabor a cloraminas, subproductos de desinfección', 'Azufre, hierro, dureza, bacterias'],
            },
            {
              label: 'Lo que solemos sugerir',
              values: [
                'Carbón catalítico para toda la casa y, si quieres, ósmosis inversa para tomar',
                'Oxidación, suavizador y UV, según el análisis',
              ],
            },
            {
              label: 'Suavizador',
              values: ['Normalmente opcional', 'Muchas veces necesario'],
            },
            { label: 'Análisis', values: ['Lo hace el condado', 'Te toca a ti, al menos una vez al año'] },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el agua en Naples y Collier County',
          items: [
            {
              q: '¿Debo preocuparme por los TTHM del agua de Collier County?',
              a: 'El promedio del condado fue de 60.4 ppb, dentro del límite legal de 80 ppb pero cerca de tres cuartas partes de él. No es una emergencia. Si quieres reducir los subproductos de desinfección en casa, las opciones habituales son la filtración con carbón y la ósmosis inversa, y para eso buscamos equipos con certificación NSF/ANSI.',
            },
            {
              q: '¿Por qué mi agua olía a cloro en agosto de 2026?',
              a: 'Collier County cambió temporalmente de cloraminas a cloro libre del 31 de julio al 28 de agosto de 2026. Es normal notar cambios de sabor y olor durante ese período.',
            },
            {
              q: '¿El agua de Naples es dura?',
              a: 'No mucho. Collier County reporta entre 2.4 y 5.5 gpg. La Ciudad de Naples usa ablandamiento con cal; no damos una cifra de dureza que no hemos confirmado, así que la medimos en tu casa. Los pozos privados de Golden Gate Estates son otra historia y muchas veces tienen agua dura.',
            },
            {
              q: 'Vivo en Golden Gate Estates. ¿Qué le analizo a mi pozo?',
              a: 'Como mínimo, bacterias una vez al año, y además azufre, hierro, dureza y color para que el sistema se ajuste a tu agua. Nuestro análisis en casa cubre lo básico gratis, y el Departamento de Salud puede hacer un análisis certificado de bacterias.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Naples, Collier o Golden Gate: analicemos tu agua',
          text: 'Un análisis gratis en casa, los datos oficiales junto a los tuyos y una recomendación honesta, aunque sea que no necesitas nada.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Bonita Springs y Estero                                            */
  /* ---------------------------------------------------------------- */
  {
    key: 'bonita-springs-estero',
    kind: 'city',
    slug: { en: 'bonita-springs-estero', es: 'bonita-springs-estero' },
    icon: 'Home',
    photo: 'family',
    related: ['whole-house-filtration', 'reverse-osmosis', 'chlorine-taste', 'naples'],
    en: {
      metaTitle: 'Bonita Springs & Estero Water Treatment | Infinity Water',
      metaDescription:
        'Bonita Springs Utilities or Lee County Utilities? Compare the official numbers for Bonita Springs and Estero water, and get a free in-home water test.',
      eyebrow: 'Bonita Springs & Estero, FL',
      title: 'Bonita Springs and Estero water: know your utility first',
      lead: 'Neighbors a few miles apart can have water from two different utilities, treated two different ways. Before anyone recommends a filter, it helps to know which one runs to your house.',
      highlights: [
        'Official numbers from both utilities',
        'Free in-home test, no pressure',
        'Help in English and Spanish, 7 days a week',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Two utilities, one area',
          paragraphs: [
            'Bonita Springs is served by Bonita Springs Utilities (BSU), which treats water with lime softening and reverse osmosis. Much of Estero is served by Lee County Utilities (LCU), and some addresses may be on BSU. The name on your water bill settles it.',
            'Both utilities keep a disinfectant in the water, and both publish their results every year. So the question isn’t whether your water is safe to use; it’s whether you want to change its taste, smell or what you drink, and how.',
          ],
        },
        {
          type: 'facts',
          heading: 'Bonita Springs Utilities: 2025 report',
          items: [
            { label: 'Treatment', value: 'Lime softening + reverse osmosis' },
            {
              label: 'Disinfectant',
              value: 'Chlorine/chloramines, 3.44 ppm avg.',
              detail: 'Range: 0.6–4.9 ppm',
            },
            { label: 'Sodium', value: '83.1 ppm' },
            { label: 'TTHM', value: '45 ppb', detail: 'Legal limit: 80 ppb' },
            { label: 'PFAS', value: 'Not detected', detail: '29 compounds tested' },
          ],
          source: { label: 'Bonita Springs Utilities, 2025 Annual Drinking Water Quality Report', url: BSU_CCR },
        },
        {
          type: 'facts',
          heading: 'Lee County Utilities (much of Estero)',
          items: [
            {
              label: 'Treatment',
              value: 'Blend of methods',
              detail: 'Lime softening, RO, nanofiltration and river water',
            },
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 0.6–4.0 ppm' },
            {
              label: 'Yearly chlorine burn',
              value: 'May 1–21, 2025',
              detail: 'Expect a temporary change in taste, smell or color.',
            },
            { label: 'Sodium', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Water Quality Report', url: LCU_CCR },
        },
        {
          type: 'compare',
          heading: 'What it means for your home',
          intro: 'Same goal, slightly different tools depending on your utility.',
          columns: ['Bonita Springs Utilities', 'Lee County Utilities (Estero)'],
          rows: [
            {
              label: 'Taste and odor',
              values: [
                'Catalytic carbon handles both chlorine and chloramines',
                'Catalytic carbon; regular carbon isn’t enough for chloramines',
              ],
            },
            {
              label: 'Drinking water',
              values: ['Under-sink RO also reduces sodium (83.1 ppm)', 'Under-sink RO if you want it'],
            },
            {
              label: 'Seasonal changes',
              values: ['Follow BSU notices', 'Yearly chlorine burn in spring'],
            },
            { label: 'Softener', values: ['Usually not needed', 'Usually not needed'] },
          ],
        },
        {
          type: 'features',
          heading: 'What we usually install in Bonita Springs and Estero',
          items: [
            {
              icon: 'Home',
              title: 'Whole-house filtration',
              text: 'Catalytic carbon for every tap and shower, sized to your home and your utility’s disinfectant.',
            },
            {
              icon: 'GlassWater',
              title: 'Under-sink reverse osmosis',
              text: 'Drinking and cooking water, with an optional remineralization stage that raises pH and adds minerals back for better taste.',
            },
            {
              icon: 'Droplet',
              title: 'Private well systems',
              text: 'If your property is on a well, we treat sulfur, iron, hardness and bacteria based on a real test. That’s our specialty.',
            },
            {
              icon: 'Settings',
              title: 'Maintenance on schedule',
              text: 'Media and filter changes on time, so your system keeps working and your lifetime support stays active.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Bonita Springs and Estero water questions',
          items: [
            {
              q: 'Do I need a water softener in Bonita Springs or Estero?',
              a: 'On utility water, usually not: both BSU and LCU soften and treat the water before it reaches you. A softener makes sense mostly on private wells. We’ll tell you honestly after testing.',
            },
            {
              q: 'Does Estero get water from Bonita Springs Utilities or Lee County?',
              a: 'Much of Estero is on Lee County Utilities, but it depends on your address. Look at your water bill. It matters because the right filter media depends on the disinfectant.',
            },
            {
              q: 'Should I be concerned about PFAS here?',
              a: 'Bonita Springs Utilities reports that none of the 29 PFAS compounds it tested for were detected. If you still want extra peace of mind, there’s equipment certified under NSF/ANSI 53/58 for PFOA/PFOS, and we can walk you through it.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Start with a free test in Bonita Springs or Estero',
          text: 'We’ll check your water, look at your bill and your utility’s report with you, and tell you what’s worth doing. No pressure, no commitment.',
        },
      ],
    },
    es: {
      metaTitle: 'Agua en Bonita Springs y Estero | Infinity Water',
      metaDescription:
        '¿Bonita Springs Utilities o Lee County Utilities? Compara los datos oficiales del agua en Bonita Springs y Estero y pide tu análisis gratis, sin presión.',
      eyebrow: 'Bonita Springs y Estero, FL',
      title: 'El agua en Bonita Springs y Estero: primero conoce tu proveedor',
      lead: 'Vecinos a pocas millas pueden recibir agua de dos compañías distintas, tratada de dos formas distintas. Antes de que nadie te recomiende un filtro, conviene saber cuál llega a tu casa.',
      highlights: [
        'Datos oficiales de los dos proveedores',
        'Análisis gratis en casa, sin presión',
        'Te atendemos en español e inglés, 7 días a la semana',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Dos proveedores, una misma zona',
          paragraphs: [
            'Bonita Springs recibe el agua de Bonita Springs Utilities (BSU), que la trata con ablandamiento con cal y ósmosis inversa. Gran parte de Estero la atiende Lee County Utilities (LCU), y algunas direcciones pueden estar con BSU. El nombre en tu factura de agua lo aclara.',
            'Las dos compañías mantienen un desinfectante en el agua y publican sus resultados cada año. Así que la pregunta no es si tu agua sirve para usarla, sino si quieres cambiar su sabor, su olor o el agua que tomas, y cómo hacerlo.',
          ],
        },
        {
          type: 'facts',
          heading: 'Bonita Springs Utilities: reporte 2025',
          items: [
            { label: 'Tratamiento', value: 'Ablandamiento con cal + ósmosis inversa' },
            {
              label: 'Desinfectante',
              value: 'Cloro/cloraminas, 3.44 ppm promedio',
              detail: 'Rango: 0.6–4.9 ppm',
            },
            { label: 'Sodio', value: '83.1 ppm' },
            { label: 'TTHM', value: '45 ppb', detail: 'Límite legal: 80 ppb' },
            { label: 'PFAS', value: 'No detectados', detail: '29 compuestos analizados' },
          ],
          source: { label: 'Bonita Springs Utilities, Reporte Anual de Calidad del Agua 2025', url: BSU_CCR },
        },
        {
          type: 'facts',
          heading: 'Lee County Utilities (gran parte de Estero)',
          items: [
            {
              label: 'Tratamiento',
              value: 'Mezcla de métodos',
              detail: 'Ablandamiento con cal, ósmosis inversa, nanofiltración y agua de río',
            },
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 0.6–4.0 ppm' },
            {
              label: 'Purga anual con cloro',
              value: '1–21 de mayo de 2025',
              detail: 'Puedes notar un cambio temporal de sabor, olor o color.',
            },
            { label: 'Sodio', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Reporte de Calidad del Agua', url: LCU_CCR },
        },
        {
          type: 'compare',
          heading: 'Qué significa para tu casa',
          intro: 'El mismo objetivo, con herramientas un poco distintas según tu proveedor.',
          columns: ['Bonita Springs Utilities', 'Lee County Utilities (Estero)'],
          rows: [
            {
              label: 'Sabor y olor',
              values: [
                'El carbón catalítico sirve tanto para cloro como para cloraminas',
                'Carbón catalítico; el carbón normal no basta para las cloraminas',
              ],
            },
            {
              label: 'Agua para tomar',
              values: [
                'La ósmosis inversa bajo el fregadero también reduce el sodio (83.1 ppm)',
                'Ósmosis inversa bajo el fregadero, si la quieres',
              ],
            },
            {
              label: 'Cambios en el año',
              values: ['Sigue los avisos de BSU', 'Purga anual con cloro en primavera'],
            },
            { label: 'Suavizador', values: ['Normalmente no hace falta', 'Normalmente no hace falta'] },
          ],
        },
        {
          type: 'features',
          heading: 'Lo que más instalamos en Bonita Springs y Estero',
          items: [
            {
              icon: 'Home',
              title: 'Filtración para toda la casa',
              text: 'Carbón catalítico para todas las llaves y regaderas, dimensionado para tu casa y para el desinfectante de tu proveedor.',
            },
            {
              icon: 'GlassWater',
              title: 'Ósmosis inversa bajo el fregadero',
              text: 'Agua para tomar y cocinar, con etapa opcional de remineralización que eleva el pH y le devuelve minerales para mejor sabor.',
            },
            {
              icon: 'Droplet',
              title: 'Sistemas para pozo privado',
              text: 'Si tu propiedad usa pozo, tratamos azufre, hierro, dureza y bacterias según un análisis real. Es nuestra especialidad.',
            },
            {
              icon: 'Settings',
              title: 'Mantenimiento a tiempo',
              text: 'Cambios de medio filtrante y filtros cuando tocan, para que tu sistema siga funcionando y tu soporte de por vida siga activo.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el agua en Bonita Springs y Estero',
          items: [
            {
              q: '¿Necesito suavizador en Bonita Springs o Estero?',
              a: 'Con agua de la compañía, normalmente no: tanto BSU como LCU ablandan y tratan el agua antes de que llegue a tu casa. El suavizador tiene sentido sobre todo en pozos privados. Te lo decimos con honestidad después del análisis.',
            },
            {
              q: '¿Estero recibe agua de Bonita Springs Utilities o de Lee County?',
              a: 'Gran parte de Estero está con Lee County Utilities, pero depende de tu dirección. Revisa tu factura de agua. Importa porque el medio filtrante correcto depende del desinfectante.',
            },
            {
              q: '¿Debo preocuparme por los PFAS aquí?',
              a: 'Bonita Springs Utilities reporta que no detectó ninguno de los 29 compuestos PFAS que analizó. Si aun así quieres más tranquilidad, existen equipos certificados NSF/ANSI 53/58 para PFOA/PFOS, y te explicamos las opciones.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Empieza con un análisis gratis en Bonita Springs o Estero',
          text: 'Revisamos tu agua, vemos contigo tu factura y el reporte de tu proveedor, y te decimos qué vale la pena hacer. Sin presión y sin compromiso.',
        },
      ],
    },
  },
];
