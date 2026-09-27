/**
 * Paginas de ciudad (kind: 'city').
 *
 * Cada pagina usa los datos oficiales del reporte de calidad del agua (CCR)
 * de su proveedor. Solo cifras verificadas en el brief de contenido; si un
 * dato no esta confirmado (p. ej. la dureza de la ciudad de Naples), no se
 * publica.
 *
 * Version condensada: 250-400 palabras visibles por pagina e idioma.
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
      title: 'Soft city water. Simple solutions.',
      lead: 'City water here is soft and treated by reverse osmosis, so the right fix is usually simpler than you’ve been told.',
      highlights: ['Local, on Metro Parkway', 'Free in-home water test', 'Bilingual help, 7 days'],
      blocks: [
        {
          type: 'prose',
          heading: 'City, county or well?',
          paragraphs: [
            'Inside city limits, the City of Fort Myers treats water with reverse osmosis and chlorine. Many homes in south Fort Myers get Lee County Utilities water, which uses chloramines. Some still run on a private well. Your water bill tells us which.',
          ],
        },
        {
          type: 'facts',
          heading: 'The official numbers',
          intro: 'City of Fort Myers: reverse osmosis from the Floridan Aquifer.',
          items: [
            { label: 'Hardness', value: '~30 ppm (≈1.8 gpg)', detail: 'Soft. A softener usually isn’t needed.' },
            { label: 'Disinfectant', value: 'Chlorine, 1.99 ppm avg.', detail: 'Range: 0.41–3.1 ppm' },
            { label: 'Sodium', value: '114 ppm', detail: 'Worth knowing on a low-sodium diet.' },
            { label: 'TTHM', value: '3.7 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'City of Fort Myers, 2025 Annual Water Quality Report', url: FORT_MYERS_CCR },
        },
        {
          type: 'features',
          heading: 'What we actually fix here',
          items: [
            {
              icon: 'GlassWater',
              title: 'Chlorine taste',
              text: 'A carbon filter removes the chlorine taste and smell the City adds for safe delivery.',
            },
            {
              icon: 'Scale',
              title: 'Less sodium',
              text: 'Under-sink reverse osmosis reduces sodium in the water you drink and cook with.',
            },
            {
              icon: 'Wrench',
              title: 'Older home plumbing',
              text: 'The City treats water up to your meter. Old pipes inside can change it.',
            },
            {
              icon: 'Wind',
              title: 'Wells outside town',
              text: 'Sulfur smell, iron stains, hardness. Our founder’s 25+ years in well water count here.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Fort Myers questions',
          items: [
            {
              q: 'Do I need a softener on city water?',
              a: 'Usually not. City water comes in around 30 ppm of hardness (about 1.8 gpg), which is soft. If someone says it’s very hard, ask to see the numbers.',
            },
            {
              q: 'Is my water from the City or Lee County?',
              a: 'Check your water bill. The City uses chlorine; Lee County Utilities uses chloramines, which need catalytic carbon. Regular carbon isn’t enough.',
            },
            {
              q: 'Is the water test really free?',
              a: 'Yes. No cost, no pressure, no commitment. And under Florida law, if you buy in your home, you can cancel until midnight of the third business day.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Get a straight answer, free.',
          text: 'Book a free in-home water test. We’re right here on Metro Parkway.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua en Fort Myers, FL | Infinity Water',
      metaDescription:
        'El agua de la ciudad de Fort Myers es blanda y tratada por ósmosis inversa. Mira los datos oficiales, cuándo conviene un filtro y pide tu análisis gratis.',
      eyebrow: 'Fort Myers, FL',
      title: 'Agua de ciudad blanda. Soluciones simples.',
      lead: 'El agua de la ciudad es blanda y pasa por ósmosis inversa; la solución suele ser más sencilla de lo que crees.',
      highlights: ['Local, en Metro Parkway', 'Análisis gratis en casa', 'Atención bilingüe, 7 días'],
      blocks: [
        {
          type: 'prose',
          heading: '¿Ciudad, condado o pozo?',
          paragraphs: [
            'Dentro de la ciudad, Fort Myers trata el agua con ósmosis inversa y cloro. Muchas casas del sur reciben agua de Lee County Utilities, que usa cloraminas. Otras todavía usan pozo privado. Tu factura de agua nos dice cuál tienes.',
          ],
        },
        {
          type: 'facts',
          heading: 'Los datos oficiales',
          intro: 'Ciudad de Fort Myers: ósmosis inversa desde el Acuífero Floridano.',
          items: [
            { label: 'Dureza', value: '~30 ppm (≈1.8 gpg)', detail: 'Blanda. Normalmente no necesitas suavizador.' },
            { label: 'Desinfectante', value: 'Cloro, 1.99 ppm promedio', detail: 'Rango: 0.41–3.1 ppm' },
            { label: 'Sodio', value: '114 ppm', detail: 'Importa si sigues una dieta baja en sodio.' },
            { label: 'TTHM', value: '3.7 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Ciudad de Fort Myers, Reporte Anual de Calidad del Agua 2025', url: FORT_MYERS_CCR },
        },
        {
          type: 'features',
          heading: 'Lo que de verdad resolvemos',
          items: [
            {
              icon: 'GlassWater',
              title: 'Sabor a cloro',
              text: 'Un filtro de carbón quita el sabor y el olor a cloro que deja la ciudad.',
            },
            {
              icon: 'Scale',
              title: 'Menos sodio',
              text: 'La ósmosis inversa bajo el fregadero reduce el sodio del agua que tomas.',
            },
            {
              icon: 'Wrench',
              title: 'Tuberías viejas',
              text: 'La ciudad trata el agua hasta tu medidor. Las tuberías viejas pueden cambiarla.',
            },
            {
              icon: 'Wind',
              title: 'Pozos en las afueras',
              text: 'Azufre, hierro y sarro: aquí cuentan los más de 25 años de nuestro fundador.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre Fort Myers',
          items: [
            {
              q: '¿Necesito suavizador con agua de la ciudad?',
              a: 'Normalmente no. El agua de la ciudad llega con unos 30 ppm de dureza (cerca de 1.8 gpg): es blanda. Si alguien te dice que es muy dura, pídele los números.',
            },
            {
              q: '¿Mi agua es de la ciudad o de Lee County?',
              a: 'Mira tu factura. La ciudad usa cloro; Lee County Utilities usa cloraminas, que necesitan carbón catalítico. El carbón normal no basta.',
            },
            {
              q: '¿De verdad el análisis es gratis?',
              a: 'Sí. Sin costo, sin presión y sin compromiso. Y por ley de Florida, si compras en tu casa, puedes cancelar hasta la medianoche del 3.er día hábil.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Una respuesta clara, gratis.',
          text: 'Pide tu análisis gratis en casa. Estamos aquí mismo, en Metro Parkway.',
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
      title: 'City water or well? Clear answers.',
      lead: 'Cape Coral has two water stories, city water and north Cape wells, and each needs something different.',
      highlights: ['City and well, covered', 'Free in-home water test', 'Honest softener advice'],
      blocks: [
        {
          type: 'facts',
          heading: 'City water, by the numbers',
          intro: 'City of Cape Coral: reverse osmosis from the Upper Floridan Aquifer.',
          items: [
            { label: 'Hardness', value: '5.5–6.5 gpg' },
            { label: 'Disinfectant', value: 'Chlorine, 1.34 ppm avg.', detail: 'Range: 0.21–3.0 ppm' },
            { label: 'Sodium', value: '86 ppm' },
            { label: 'TTHM', value: '33.47 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'City of Cape Coral, 2024 Water Quality Report', url: CAPE_CORAL_CCR },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The City says it: no softener.',
          text: 'The City of Cape Coral says homes on municipal water don’t need a softener, and suggests a carbon filter for taste and odor. We agree.',
        },
        {
          type: 'prose',
          heading: 'North Cape: wells meet city lines',
          paragraphs: [
            'Many north Cape homes still use a private well. The UEP program keeps extending city lines, but until yours connects, water quality is on you. In 2024, some northeast wells went dry as the Mid-Hawthorn aquifer dropped.',
          ],
        },
        {
          type: 'signs',
          heading: 'Your well is telling you',
          items: [
            'Rotten-egg smell, especially in hot water',
            'Orange stains on laundry and walls',
            'White scale on faucets and glass',
            'Floodwater reached your wellhead',
            'No well test in over a year',
          ],
        },
        {
          type: 'faq',
          heading: 'Cape Coral questions',
          items: [
            {
              q: 'Do I need a softener in Cape Coral?',
              a: 'On city water, normally no; the City says so itself. On a north Cape well, it depends on your test. Many wells here are hard.',
            },
            {
              q: 'UEP is coming to my street. Buy a well system now?',
              a: 'Ask us first. If your connection is close, a full well system may not be worth it. We’ll tell you honestly whether to wait.',
            },
            {
              q: 'Why does my cold water come out warm?',
              a: 'The City’s water leaves the plant at around 80 °F. It’s normal, and it’s not your filter.',
            },
            {
              q: 'My neighbor’s well went dry. Can a filter help?',
              a: 'No. A dry well needs a licensed well contractor. Once water flows again, we test it and check that your equipment still fits.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'City or well: get answers.',
          text: 'Free in-home test. We show you the numbers, and what you don’t need.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua y pozo en Cape Coral | Infinity Water',
      metaDescription:
        '¿Agua de la ciudad o pozo en el norte de Cape Coral? Mira los datos oficiales, por qué la ciudad dice que no necesitas suavizador y pide tu análisis gratis.',
      eyebrow: 'Cape Coral, FL',
      title: '¿Ciudad o pozo? Te lo aclaramos.',
      lead: 'Cape Coral tiene dos realidades, agua de la ciudad y pozos en el norte, y cada una pide algo distinto.',
      highlights: ['Ciudad y pozo, cubiertos', 'Análisis gratis en casa', 'Consejo honesto sobre suavizador'],
      blocks: [
        {
          type: 'facts',
          heading: 'El agua de la ciudad en cifras',
          intro: 'Ciudad de Cape Coral: ósmosis inversa desde el Acuífero Floridano Superior.',
          items: [
            { label: 'Dureza', value: '5.5–6.5 gpg' },
            { label: 'Desinfectante', value: 'Cloro, 1.34 ppm promedio', detail: 'Rango: 0.21–3.0 ppm' },
            { label: 'Sodio', value: '86 ppm' },
            { label: 'TTHM', value: '33.47 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Ciudad de Cape Coral, Reporte de Calidad del Agua 2024', url: CAPE_CORAL_CCR },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Lo dice la ciudad: sin suavizador.',
          text: 'La Ciudad de Cape Coral indica que con agua municipal no necesitas suavizador, y sugiere un filtro de carbón para sabor y olor. Estamos de acuerdo.',
        },
        {
          type: 'prose',
          heading: 'Norte de Cape: pozos y red',
          paragraphs: [
            'Muchas casas del norte todavía usan pozo privado. El programa UEP sigue extendiendo la red de la ciudad, pero hasta que conectes, la calidad del agua es tu responsabilidad. En 2024 se secaron pozos en el noreste por el descenso del acuífero Mid-Hawthorn.',
          ],
        },
        {
          type: 'signs',
          heading: 'Tu pozo te avisa así',
          items: [
            'Olor a huevo podrido en el agua caliente',
            'Manchas naranjas en ropa y paredes',
            'Sarro blanco en llaves y vidrios',
            'Una inundación llegó al pozo',
            'Más de un año sin analizarlo',
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre Cape Coral',
          items: [
            {
              q: '¿Necesito suavizador en Cape Coral?',
              a: 'Con agua de la ciudad, normalmente no; la propia ciudad lo dice. Con pozo en el norte, depende de tu análisis. Muchos pozos aquí tienen agua dura.',
            },
            {
              q: 'El UEP llega a mi calle. ¿Compro ya un sistema para pozo?',
              a: 'Pregúntanos primero. Si tu conexión está cerca, puede que un sistema completo no valga la pena. Te decimos con honestidad si conviene esperar.',
            },
            {
              q: '¿Por qué el agua fría me sale tibia?',
              a: 'Según la ciudad, el agua sale de la planta a unos 80 °F. Es normal y no es culpa de tu filtro.',
            },
            {
              q: 'El pozo de mi vecino se secó. ¿Un filtro ayuda?',
              a: 'No. Un pozo seco lo resuelve un contratista de pozos con licencia. Cuando vuelva el agua, la analizamos y revisamos que tu equipo siga sirviendo.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Ciudad o pozo: respuesta clara.',
          text: 'Análisis gratis en casa. Te mostramos los números y lo que no necesitas.',
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
      title: 'Well water, done right.',
      lead: 'Many Lehigh Acres homes, especially central, north and east, still run on a private well, and well water is our specialty.',
      highlights: ['Well water specialists', 'Free in-home water test', 'Lifetime support'],
      blocks: [
        {
          type: 'prose',
          heading: 'Your well, your responsibility',
          paragraphs: [
            'Nobody tests a private well for you. The Florida Department of Health recommends testing it at least once a year for bacteria and chemicals. Its Lee County office has a certified lab for that.',
          ],
        },
        {
          type: 'signs',
          heading: 'Sound familiar?',
          items: [
            'Rotten-egg smell (sulfur)',
            'Black stains or tarnished fixtures',
            'Orange stains from iron',
            'White scale on faucets and heater',
            'Yellow, tea-colored water',
          ],
        },
        {
          type: 'features',
          heading: 'What works on Lehigh wells',
          items: [
            {
              icon: 'Wind',
              title: 'Air injection',
              text: 'Oxidizes sulfur and iron so they’re filtered out, not left in your laundry.',
            },
            {
              icon: 'Filter',
              title: 'Catalytic carbon',
              text: 'Removes leftover odor and taste when sulfur levels are moderate.',
            },
            {
              icon: 'Droplets',
              title: 'Water softener',
              text: 'Stops the scale that shortens the life of your water heater.',
            },
            {
              icon: 'ShieldCheck',
              title: 'UV disinfection',
              text: 'UV systems are designed to disinfect water. We confirm it with a lab test.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'On county water? LCU’s numbers',
          intro: 'For homes on Lee County Utilities: a blend of lime, RO, nanofiltration and river water.',
          items: [
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 0.6–4.0 ppm' },
            { label: 'Yearly chlorine burn', value: 'May 1–21, 2025', detail: 'Taste, smell and color can change.' },
            { label: 'Sodium', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Water Quality Report', url: LCU_CCR },
        },
        {
          type: 'faq',
          heading: 'Lehigh Acres questions',
          items: [
            {
              q: 'Is Lehigh Acres water hard?',
              a: 'Many private wells here are hard and carry sulfur or iron. County water usually doesn’t need a softener. A free test settles it.',
            },
            {
              q: 'How often should I test my well?',
              a: 'At least once a year, per the Department of Health, and after any flood or change in smell, color or taste.',
            },
            {
              q: 'Why does county water smell like a pool some weeks?',
              a: 'Once a year, Lee County Utilities switches to free chlorine to clean the lines. In 2025 it was May 1–21. It’s temporary.',
            },
            {
              q: 'Can you service my old well system?',
              a: 'Yes. We service and repair existing systems and their plumbing, and tell you honestly if it’s worth fixing.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Know what’s in your well.',
          text: 'Free in-home test. No pressure, no commitment, in English or Spanish.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua de pozo en Lehigh Acres | Infinity Water',
      metaDescription:
        'Muchas casas de Lehigh Acres usan pozo: olor a azufre, manchas de hierro, agua dura. Mira qué funciona, qué necesita el agua de LCU y pide tu análisis gratis.',
      eyebrow: 'Lehigh Acres, FL',
      title: 'Agua de pozo, bien tratada.',
      lead: 'Muchas casas de Lehigh Acres, sobre todo en el centro, norte y este, usan pozo: nuestra especialidad.',
      highlights: ['Expertos en pozos', 'Análisis gratis en casa', 'Soporte de por vida'],
      blocks: [
        {
          type: 'prose',
          heading: 'Tu pozo, tu responsabilidad',
          paragraphs: [
            'Nadie analiza un pozo privado por ti. El Departamento de Salud de Florida recomienda analizarlo al menos una vez al año, para bacterias y químicos. Su oficina en Lee County tiene un laboratorio certificado.',
          ],
        },
        {
          type: 'signs',
          heading: '¿Te suena?',
          items: [
            'Olor a huevo podrido (azufre)',
            'Manchas negras o llaves opacas',
            'Manchas naranjas por hierro',
            'Sarro blanco en llaves y calentador',
            'Agua amarilla o color té',
          ],
        },
        {
          type: 'features',
          heading: 'Lo que funciona en Lehigh',
          items: [
            {
              icon: 'Wind',
              title: 'Inyección de aire',
              text: 'Oxida el azufre y el hierro para filtrarlos, en vez de que manchen tu ropa.',
            },
            {
              icon: 'Filter',
              title: 'Carbón catalítico',
              text: 'Quita el olor y el sabor que quedan cuando el azufre es moderado.',
            },
            {
              icon: 'Droplets',
              title: 'Suavizador',
              text: 'Frena el sarro que acorta la vida de tu calentador.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Desinfección UV',
              text: 'Los sistemas UV están diseñados para desinfectar el agua. Lo confirmamos en laboratorio.',
            },
          ],
        },
        {
          type: 'facts',
          heading: '¿Agua del condado? Los datos de LCU',
          intro: 'Casas con Lee County Utilities: mezcla de cal, ósmosis inversa, nanofiltración y agua de río.',
          items: [
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 0.6–4.0 ppm' },
            {
              label: 'Purga anual con cloro',
              value: '1–21 de mayo de 2025',
              detail: 'Pueden cambiar el sabor, el olor y el color.',
            },
            { label: 'Sodio', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Reporte de Calidad del Agua', url: LCU_CCR },
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre Lehigh Acres',
          items: [
            {
              q: '¿El agua de Lehigh Acres es dura?',
              a: 'Muchos pozos privados aquí tienen agua dura, además de azufre o hierro. Con agua del condado normalmente no hace falta suavizador. Un análisis gratis lo aclara.',
            },
            {
              q: '¿Cada cuánto analizo mi pozo?',
              a: 'Al menos una vez al año, como recomienda el Departamento de Salud, y después de una inundación o si cambian el olor, el color o el sabor.',
            },
            {
              q: '¿Por qué el agua del condado huele a piscina algunas semanas?',
              a: 'Una vez al año, Lee County Utilities pasa a cloro libre para limpiar las tuberías. En 2025 fue del 1 al 21 de mayo. Es temporal.',
            },
            {
              q: '¿Le dan servicio a mi sistema de pozo viejo?',
              a: 'Sí. Damos mantenimiento y reparamos sistemas existentes y su plomería. Te decimos con honestidad si vale la pena arreglarlo.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Conoce lo que tiene tu pozo.',
          text: 'Análisis gratis en casa. Sin presión, sin compromiso, en español o inglés.',
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
      eyebrow: 'Naples & Golden Gate',
      title: 'Three sources. Three different answers.',
      lead: 'City of Naples, Collier County or a Golden Gate Estates well: each water needs a different approach.',
      highlights: ['City, county and well', 'Free in-home water test', 'English and Spanish'],
      blocks: [
        {
          type: 'prose',
          heading: 'Which Naples water is yours?',
          paragraphs: [
            'Inside city limits, the City of Naples supplies your water. Outside, most connected homes get Collier County water, disinfected with chloramines. Most Golden Gate Estates homes use a private well and septic. Your bill tells you which.',
          ],
        },
        {
          type: 'facts',
          heading: 'Collier County water',
          intro: 'Nanofiltration, reverse osmosis and lime softening.',
          items: [
            { label: 'Hardness', value: '42–94 mg/L (2.4–5.5 gpg)' },
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 1.6–4.1 ppm' },
            { label: 'TTHM', value: '60.4 ppb avg.', detail: 'Range: 34.1–75.4 ppb. Legal limit: 80 ppb.' },
            { label: 'PFAS', value: 'Not detected', detail: 'Federal UCMR5 sampling, October 2024' },
          ],
          source: { label: 'Collier County, 2024 Water Quality Report', url: COLLIER_CCR },
        },
        {
          type: 'facts',
          heading: 'City of Naples water',
          intro: 'We only list what we’ve confirmed.',
          items: [
            { label: 'Treatment', value: 'Lime softening' },
            { label: 'Source', value: 'Tamiami aquifer' },
            { label: 'Hardness', value: 'Measured at your home', detail: 'No unverified numbers. We test it free.' },
          ],
          source: { label: 'City of Naples, Annual Water Quality Report', url: NAPLES_CCR },
        },
        {
          type: 'features',
          heading: 'Golden Gate Estates: well and septic',
          items: [
            {
              icon: 'Wind',
              title: 'Sulfur smell',
              text: 'That rotten-egg smell is hydrogen sulfide. Air injection or catalytic carbon fixes it.',
            },
            {
              icon: 'Shirt',
              title: 'Iron stains',
              text: 'Orange marks on laundry and walls. Oxidation and filtration keep iron out.',
            },
            {
              icon: 'TestTube',
              title: 'Bacteria and UV',
              text: 'Test yearly. UV systems are designed to disinfect water; a lab test confirms it.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Naples questions',
          items: [
            {
              q: 'Should I worry about TTHM in Collier water?',
              a: 'The county averaged 60.4 ppb: within the 80 ppb limit, but about three-quarters of it. Not an emergency. To reduce it, we look for NSF/ANSI-certified carbon and reverse osmosis equipment.',
            },
            {
              q: 'Why did my water smell like chlorine in August 2026?',
              a: 'Collier County temporarily switched from chloramines to free chlorine from July 31 to August 28, 2026. Taste and smell changes were expected.',
            },
            {
              q: 'Is Naples water hard?',
              a: 'Collier County reports 2.4 to 5.5 gpg. For City of Naples water, we measure it at your home. Golden Gate wells are often hard.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Let’s test your Naples water.',
          text: 'Free in-home test, your numbers next to the official ones, and an honest answer.',
        },
      ],
    },
    es: {
      metaTitle: 'Tratamiento de agua en Naples y Golden Gate | Infinity Water',
      metaDescription:
        '¿Naples, Collier County o pozo en Golden Gate Estates? Mira los datos oficiales del agua, cloraminas y TTHM, y pide tu análisis gratis en casa, sin presión.',
      eyebrow: 'Naples y Golden Gate',
      title: 'Tres fuentes. Tres respuestas distintas.',
      lead: 'Ciudad de Naples, Collier County o pozo en Golden Gate Estates: cada agua necesita un enfoque distinto.',
      highlights: ['Ciudad, condado y pozo', 'Análisis gratis en casa', 'Español e inglés'],
      blocks: [
        {
          type: 'prose',
          heading: '¿Qué agua de Naples tienes?',
          paragraphs: [
            'Dentro de la ciudad, el agua la suministra la Ciudad de Naples. Fuera, la mayoría de las casas conectadas recibe agua de Collier County, desinfectada con cloraminas. En Golden Gate Estates, la mayoría usa pozo privado y séptico. Tu factura te dice cuál.',
          ],
        },
        {
          type: 'facts',
          heading: 'Agua de Collier County',
          intro: 'Nanofiltración, ósmosis inversa y ablandamiento con cal.',
          items: [
            { label: 'Dureza', value: '42–94 mg/L (2.4–5.5 gpg)' },
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 1.6–4.1 ppm' },
            { label: 'TTHM', value: '60.4 ppb promedio', detail: 'Rango: 34.1–75.4 ppb. Límite legal: 80 ppb.' },
            { label: 'PFAS', value: 'No detectados', detail: 'Muestreo federal UCMR5, octubre de 2024' },
          ],
          source: { label: 'Collier County, Reporte de Calidad del Agua 2024', url: COLLIER_CCR },
        },
        {
          type: 'facts',
          heading: 'Agua de la Ciudad de Naples',
          intro: 'Solo publicamos lo que hemos confirmado.',
          items: [
            { label: 'Tratamiento', value: 'Ablandamiento con cal' },
            { label: 'Fuente', value: 'Acuífero Tamiami' },
            { label: 'Dureza', value: 'La medimos en tu casa', detail: 'No publicamos cifras sin verificar. La medimos gratis.' },
          ],
          source: { label: 'Ciudad de Naples, Reporte Anual de Calidad del Agua', url: NAPLES_CCR },
        },
        {
          type: 'features',
          heading: 'Golden Gate Estates: pozo y séptico',
          items: [
            {
              icon: 'Wind',
              title: 'Olor a azufre',
              text: 'Es sulfuro de hidrógeno. Lo resuelven la inyección de aire o el carbón catalítico.',
            },
            {
              icon: 'Shirt',
              title: 'Manchas de hierro',
              text: 'Marcas naranjas en ropa y paredes. La oxidación y la filtración frenan el hierro.',
            },
            {
              icon: 'TestTube',
              title: 'Bacterias y UV',
              text: 'Analiza cada año. Los sistemas UV están diseñados para desinfectar; un laboratorio lo confirma.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre Naples',
          items: [
            {
              q: '¿Debo preocuparme por los TTHM de Collier County?',
              a: 'El promedio fue 60.4 ppb: dentro del límite de 80 ppb, pero cerca de tres cuartas partes. No es una emergencia. Para reducirlos, buscamos carbón y ósmosis inversa con certificación NSF/ANSI.',
            },
            {
              q: '¿Por qué mi agua olía a cloro en agosto de 2026?',
              a: 'Collier County pasó temporalmente de cloraminas a cloro libre del 31 de julio al 28 de agosto de 2026. Los cambios de sabor y olor eran esperables.',
            },
            {
              q: '¿El agua de Naples es dura?',
              a: 'Collier County reporta de 2.4 a 5.5 gpg. En la Ciudad de Naples la medimos en tu casa. Los pozos de Golden Gate suelen tener agua dura.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Analicemos tu agua en Naples.',
          text: 'Análisis gratis en casa, tus números junto a los oficiales y una respuesta honesta.',
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
      eyebrow: 'Bonita Springs & Estero',
      title: 'First, know your water utility.',
      lead: 'Neighbors a few miles apart can get water from two different utilities, so we check yours before recommending anything.',
      highlights: ['Both utilities’ official numbers', 'Free in-home water test', 'Bilingual help, 7 days'],
      blocks: [
        {
          type: 'prose',
          heading: 'Two utilities, one area',
          paragraphs: [
            'Bonita Springs Utilities (BSU) serves Bonita Springs with lime softening and reverse osmosis. Much of Estero is on Lee County Utilities (LCU); some addresses may be on BSU. Your water bill settles it.',
          ],
        },
        {
          type: 'facts',
          heading: 'Bonita Springs Utilities',
          intro: 'Lime softening plus reverse osmosis. From the 2025 report.',
          items: [
            { label: 'Disinfectant', value: 'Chlorine/chloramines, 3.44 ppm avg.', detail: 'Range: 0.6–4.9 ppm' },
            { label: 'Sodium', value: '83.1 ppm' },
            { label: 'TTHM', value: '45 ppb', detail: 'Legal limit: 80 ppb' },
            { label: 'PFAS', value: 'Not detected', detail: '29 compounds tested' },
          ],
          source: { label: 'Bonita Springs Utilities, 2025 Annual Drinking Water Quality Report', url: BSU_CCR },
        },
        {
          type: 'facts',
          heading: 'Lee County Utilities (much of Estero)',
          intro: 'Lime softening, RO, nanofiltration and river water.',
          items: [
            { label: 'Disinfectant', value: 'Chloramines, 3.4 ppm avg.', detail: 'Range: 0.6–4.0 ppm' },
            {
              label: 'Yearly chlorine burn',
              value: 'May 1–21, 2025',
              detail: 'Temporary change in taste, smell or color.',
            },
            { label: 'Sodium', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Legal limit: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Water Quality Report', url: LCU_CCR },
        },
        {
          type: 'features',
          heading: 'What we usually install',
          items: [
            {
              icon: 'Home',
              title: 'Whole-house filtration',
              text: 'Catalytic carbon for every tap. It handles chlorine and chloramines; regular carbon doesn’t.',
            },
            {
              icon: 'GlassWater',
              title: 'Under-sink reverse osmosis',
              text: 'Drinking water with less sodium. Optional remineralization for better taste.',
            },
            {
              icon: 'Droplet',
              title: 'Private well systems',
              text: 'On a well? We treat sulfur, iron, hardness and bacteria. It’s our specialty.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Bonita Springs and Estero questions',
          items: [
            {
              q: 'Do I need a softener here?',
              a: 'On utility water, usually not. BSU and LCU both treat and soften it first. A softener mostly makes sense on private wells.',
            },
            {
              q: 'Is Estero on BSU or Lee County?',
              a: 'Much of Estero is on Lee County Utilities, but it depends on your address. Check your bill: the right filter media depends on the disinfectant.',
            },
            {
              q: 'Should I worry about PFAS?',
              a: 'BSU detected none of the 29 PFAS compounds it tested. For extra peace of mind, there’s equipment certified under NSF/ANSI 53/58 for PFOA/PFOS.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Start with a free test.',
          text: 'We check your water and your utility’s report, then tell you what’s worth doing.',
        },
      ],
    },
    es: {
      metaTitle: 'Agua en Bonita Springs y Estero | Infinity Water',
      metaDescription:
        '¿Bonita Springs Utilities o Lee County Utilities? Compara los datos oficiales del agua en Bonita Springs y Estero y pide tu análisis gratis, sin presión.',
      eyebrow: 'Bonita Springs y Estero',
      title: 'Primero, conoce a tu proveedor.',
      lead: 'Vecinos a pocas millas pueden recibir agua de dos compañías distintas, así que revisamos la tuya antes de recomendarte nada.',
      highlights: ['Datos oficiales de ambos', 'Análisis gratis en casa', 'Atención bilingüe, 7 días'],
      blocks: [
        {
          type: 'prose',
          heading: 'Dos proveedores, una zona',
          paragraphs: [
            'Bonita Springs Utilities (BSU) atiende Bonita Springs con ablandamiento con cal y ósmosis inversa. Gran parte de Estero está con Lee County Utilities (LCU); algunas direcciones pueden estar con BSU. Tu factura de agua lo aclara.',
          ],
        },
        {
          type: 'facts',
          heading: 'Bonita Springs Utilities',
          intro: 'Cal y ósmosis inversa. Del reporte 2025.',
          items: [
            { label: 'Desinfectante', value: 'Cloro/cloraminas, 3.44 ppm promedio', detail: 'Rango: 0.6–4.9 ppm' },
            { label: 'Sodio', value: '83.1 ppm' },
            { label: 'TTHM', value: '45 ppb', detail: 'Límite legal: 80 ppb' },
            { label: 'PFAS', value: 'No detectados', detail: '29 compuestos analizados' },
          ],
          source: { label: 'Bonita Springs Utilities, Reporte Anual de Calidad del Agua 2025', url: BSU_CCR },
        },
        {
          type: 'facts',
          heading: 'Lee County Utilities (gran parte de Estero)',
          intro: 'Cal, ósmosis inversa, nanofiltración y agua de río.',
          items: [
            { label: 'Desinfectante', value: 'Cloraminas, 3.4 ppm promedio', detail: 'Rango: 0.6–4.0 ppm' },
            {
              label: 'Purga anual con cloro',
              value: '1–21 de mayo de 2025',
              detail: 'Cambio temporal de sabor, olor o color.',
            },
            { label: 'Sodio', value: '36.7–67.8 ppm' },
            { label: 'TTHM', value: '19.5 ppb', detail: 'Límite legal: 80 ppb' },
          ],
          source: { label: 'Lee County Utilities, Reporte de Calidad del Agua', url: LCU_CCR },
        },
        {
          type: 'features',
          heading: 'Lo que más instalamos',
          items: [
            {
              icon: 'Home',
              title: 'Filtración de casa completa',
              text: 'Carbón catalítico en cada llave. Sirve para cloro y cloraminas; el carbón normal no.',
            },
            {
              icon: 'GlassWater',
              title: 'Ósmosis inversa',
              text: 'Agua para tomar, con menos sodio. Remineralización opcional para mejor sabor.',
            },
            {
              icon: 'Droplet',
              title: 'Sistemas para pozo',
              text: '¿Tienes pozo? Tratamos azufre, hierro, dureza y bacterias. Es nuestra especialidad.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre Bonita Springs y Estero',
          items: [
            {
              q: '¿Necesito suavizador aquí?',
              a: 'Con agua de la compañía, normalmente no: BSU y LCU ya la tratan y la ablandan. El suavizador tiene sentido sobre todo en pozos privados.',
            },
            {
              q: '¿Estero recibe agua de BSU o de Lee County?',
              a: 'Gran parte de Estero está con Lee County Utilities, pero depende de tu dirección. Revisa tu factura: el medio filtrante correcto depende del desinfectante.',
            },
            {
              q: '¿Debo preocuparme por los PFAS?',
              a: 'BSU no detectó ninguno de los 29 compuestos PFAS que analizó. Si quieres más tranquilidad, existen equipos certificados NSF/ANSI 53/58 para PFOA/PFOS.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Empieza con un análisis gratis.',
          text: 'Revisamos tu agua y el reporte de tu proveedor. Te decimos qué conviene.',
        },
      ],
    },
  },
];
