/**
 * Guia de precios (kind: 'guide').
 *
 * "¿Cuanto cuesta?" es la primera objecion del cliente y la consulta que mas
 * respuestas de IA (AI Overviews, ChatGPT) genera. Los rangos son del
 * MERCADO, no una cotizacion de Infinity Water: consenso de guias de costos
 * leidas el 27-sep-2026 (This Old House, HomeBuddy, Homewyse, Today's
 * Homeowner, contratistas de pozo y un plomero de North Fort Myers) y del
 * Departamento de Salud de Florida.
 *
 * Revisar cada 6-12 meses. Sin cuotas, tasas ni plazos: mencionarlos obliga
 * a publicar APR y condiciones (TILA / Reg Z).
 */
import type { ContentPage } from '../types';

const SRC = {
  homebuddy: 'https://www.homebuddy.com/costs/water-treatment-system/whole-house-water-filter-system-cost',
  toh: 'https://www.thisoldhouse.com/plumbing/water-softener-system-cost',
  fdoh: 'https://www.floridahealth.gov/environmental-health/private-well-testing/index.html',
};

export const PRICE_PAGES: ContentPage[] = [
  {
    key: 'prices',
    kind: 'guide',
    slug: { en: 'water-treatment-cost', es: 'precio-tratamiento-de-agua' },
    icon: 'DollarSign',
    related: ['well-water-systems', 'whole-house-filtration', 'financing'],
    en: {
      metaTitle: 'Water Treatment System Cost in Florida (2026) | Infinity Water',
      metaDescription:
        'How much does a well water system, whole-house filter, softener or reverse osmosis cost in Florida? Typical 2026 installed price ranges and what changes them.',
      eyebrow: 'Price guide 2026',
      title: 'What does water treatment cost?',
      lead: 'Typical installed price ranges in 2026, so you know what to expect before anyone comes to your home.',
      highlights: ['Market ranges, with sources', 'What changes the price', 'Maintenance costs too'],
      blocks: [
        {
          type: 'facts',
          heading: 'Typical installed prices',
          intro: 'Consensus of 2026 cost guides and local contractors. Not a quote.',
          items: [
            { label: 'Well: iron & sulfur system', value: '$1,500–$3,000', detail: 'Single-stage air injection / oxidation' },
            { label: 'Well: complete multi-stage', value: '$3,000–$7,500', detail: 'Iron/sulfur + softener + UV or carbon' },
            { label: 'Whole-house filter (city water)', value: '$1,000–$3,000', detail: 'Carbon or catalytic carbon' },
            { label: 'Water softener', value: '$1,200–$4,000', detail: 'Sized to hardness and household' },
            { label: 'Reverse osmosis (kitchen)', value: '$300–$800', detail: 'Premium models up to ~$1,300' },
            { label: 'UV disinfection (well)', value: '$800–$1,500', detail: 'Plus a pre-filter if needed' },
          ],
          source: { label: 'HomeBuddy, This Old House, Homewyse and local contractors (2026)', url: SRC.homebuddy },
        },
        {
          type: 'features',
          heading: 'What changes the price',
          items: [
            { icon: 'FlaskConical', title: 'Your water', text: 'Sulfur, iron, bacteria or low pH need more stages than city chlorine.' },
            { icon: 'Home', title: 'Home size and flow', text: 'Bathrooms and gallons per minute set the size of the equipment.' },
            { icon: 'Wrench', title: 'Existing plumbing', text: 'A ready loop is cheaper; new lines, drains or outlets add cost.' },
            { icon: 'Package', title: 'Type of equipment', text: 'Catalytic carbon, twin tanks or remineralization cost more.' },
          ],
        },
        {
          type: 'facts',
          heading: 'What it costs to maintain',
          items: [
            { label: 'Typical yearly maintenance', value: '$100–$500', detail: 'Depends on the equipment' },
            { label: 'Softener salt (40 lb bag)', value: '$5–$10', detail: 'Lasts about 6–8 weeks' },
            { label: 'RO membrane', value: '$50–$100', detail: 'Every 3–5 years' },
            { label: 'Lab bacteria test (FL health dept.)', value: '$20–$30', detail: 'Per sample, usually' },
          ],
          source: { label: 'This Old House (2026) and Florida Department of Health', url: SRC.toh },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Your exact price comes after the test',
          text: 'These are market ranges, not our quote. After the free test we give you a written price for your home. Financing is available, subject to credit approval.',
        },
        {
          type: 'faq',
          heading: 'Questions about price',
          items: [
            { q: 'Why don’t you list a fixed price?', a: 'Because two homes rarely need the same system. Selling a “standard” system without testing is how people overpay. We test first, then quote in writing.' },
            { q: 'Does the water test cost anything?', a: 'No. The in-home test is free with no obligation. If you want a certified lab test for bacteria, the county health department usually charges about $20–$30 per sample.' },
            { q: 'Can I pay over time?', a: 'Yes. We work with several home-improvement lenders, subject to credit approval. You review every term — rate, total cost and any lien — before signing.' },
            { q: 'What if I change my mind?', a: 'Under Florida law you can cancel an in-home purchase until midnight of the third business day.' },
          ],
        },
        { type: 'cta', title: 'Get your exact price, free.', text: 'We test your water at home and give you a written quote.' },
      ],
    },
    es: {
      metaTitle: 'Precio de sistemas de tratamiento de agua en Florida | Infinity Water',
      metaDescription:
        '¿Cuánto cuesta un sistema para agua de pozo, un filtro para toda la casa, un suavizador o una ósmosis inversa en Florida? Rangos de precio 2026 y qué los cambia.',
      eyebrow: 'Guía de precios 2026',
      title: '¿Cuánto cuesta tratar el agua?',
      lead: 'Los rangos de precio instalado típicos en 2026, para que sepas qué esperar antes de que nadie vaya a tu casa.',
      highlights: ['Rangos del mercado con fuentes', 'Qué cambia el precio', 'También el mantenimiento'],
      blocks: [
        {
          type: 'facts',
          heading: 'Precios típicos instalados',
          intro: 'Consenso de guías de costos 2026 y contratistas locales. No es una cotización.',
          items: [
            { label: 'Pozo: sistema para hierro y azufre', value: '$1,500–$3,000', detail: 'Una etapa: inyección de aire u oxidación' },
            { label: 'Pozo: sistema completo', value: '$3,000–$7,500', detail: 'Hierro y azufre + suavizador + UV o carbón' },
            { label: 'Filtro para toda la casa (ciudad)', value: '$1,000–$3,000', detail: 'Carbón o carbón catalítico' },
            { label: 'Suavizador', value: '$1,200–$4,000', detail: 'Según la dureza y la familia' },
            { label: 'Ósmosis inversa (cocina)', value: '$300–$800', detail: 'Modelos premium hasta ~$1,300' },
            { label: 'Desinfección UV (pozo)', value: '$800–$1,500', detail: 'Más un prefiltro si hace falta' },
          ],
          source: { label: 'HomeBuddy, This Old House, Homewyse y contratistas locales (2026)', url: SRC.homebuddy },
        },
        {
          type: 'features',
          heading: 'Qué cambia el precio',
          items: [
            { icon: 'FlaskConical', title: 'Tu agua', text: 'Azufre, hierro, bacterias o pH bajo piden más etapas que el cloro de ciudad.' },
            { icon: 'Home', title: 'Tamaño y caudal', text: 'Los baños y los galones por minuto definen el tamaño del equipo.' },
            { icon: 'Wrench', title: 'Tu plomería', text: 'Con conexión lista es más barato; tubería, desagüe o enchufe nuevos suman.' },
            { icon: 'Package', title: 'Tipo de equipo', text: 'Carbón catalítico, doble tanque o remineralización cuestan más.' },
          ],
        },
        {
          type: 'facts',
          heading: 'Lo que cuesta mantenerlo',
          items: [
            { label: 'Mantenimiento anual típico', value: '$100–$500', detail: 'Según el equipo' },
            { label: 'Sal del suavizador (saco de 40 lb)', value: '$5–$10', detail: 'Dura unas 6–8 semanas' },
            { label: 'Membrana de ósmosis', value: '$50–$100', detail: 'Cada 3–5 años' },
            { label: 'Análisis de bacterias (Salud de Florida)', value: '$20–$30', detail: 'Por muestra, normalmente' },
          ],
          source: { label: 'This Old House (2026) y Departamento de Salud de Florida', url: SRC.toh },
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Tu precio exacto llega después del análisis',
          text: 'Estos son rangos del mercado, no nuestra cotización. Después del análisis gratis te damos el precio por escrito para tu casa. Financiamiento disponible, sujeto a aprobación de crédito.',
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el precio',
          items: [
            { q: '¿Por qué no publican un precio fijo?', a: 'Porque casi nunca dos casas necesitan el mismo sistema. Vender un sistema "estándar" sin analizar es como la gente termina pagando de más. Primero medimos y luego cotizamos por escrito.' },
            { q: '¿El análisis tiene costo?', a: 'No. El análisis en tu casa es gratis y sin compromiso. Si quieres un análisis de laboratorio certificado para bacterias, el departamento de salud del condado suele cobrar unos $20–$30 por muestra.' },
            { q: '¿Puedo pagar a plazos?', a: 'Sí. Trabajamos con varias financieras de mejoras del hogar, sujeto a aprobación de crédito. Revisas cada condición (tasa, costo total y si hay gravamen) antes de firmar.' },
            { q: '¿Y si me arrepiento?', a: 'Por ley de Florida puedes cancelar una compra hecha en tu casa hasta la medianoche del 3.er día hábil.' },
          ],
        },
        { type: 'cta', title: 'Conoce tu precio exacto, gratis.', text: 'Analizamos tu agua en casa y te damos una cotización por escrito.' },
      ],
    },
  },
];
