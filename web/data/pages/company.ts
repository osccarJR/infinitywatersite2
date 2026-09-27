/**
 * Paginas de empresa: nosotros, financiamiento y preguntas frecuentes.
 * Texto condensado. Sin nombres, fechas ni anecdotas inventadas; sin cuotas,
 * tasas, plazos ni nombres de financieras (TILA / Reg Z).
 */
import type { ContentPage } from '../types';

export const COMPANY_PAGES: ContentPage[] = [
  /* ---------------------------------------------------------------- */
  /* Nosotros                                                           */
  /* ---------------------------------------------------------------- */
  {
    key: 'about',
    kind: 'company',
    slug: { en: 'about', es: 'nosotros' },
    icon: 'Users',
    photo: 'family',
    related: ['well-water-systems', 'financing', 'faq'],
    en: {
      metaTitle: 'About Infinity Water | Family-Owned, Fort Myers FL',
      metaDescription:
        'Infinity Water is a Hispanic family business in Fort Myers, led by a founder with 25+ years in water treatment. Well water specialists. English and Spanish.',
      eyebrow: 'About us',
      title: 'A family business that tells the truth.',
      lead: 'A Hispanic family business in Fort Myers, led by a founder with 25+ years in water treatment.',
      highlights: ['Founder’s 25+ years', 'Well water specialists', 'English and Spanish'],
      blocks: [
        {
          type: 'prose',
          heading: 'Who we are',
          paragraphs: [
            'We know Southwest Florida water: sulfur and iron in wells, chloramine in city water, and what changes after a hurricane. We serve Fort Myers, Cape Coral, Lehigh Acres, Naples, Bonita Springs, Estero and nearby areas.',
          ],
        },
        {
          type: 'features',
          heading: 'What sets us apart',
          items: [
            {
              icon: 'Droplets',
              title: 'Well water specialists',
              text: 'Every system is designed from your water test, never from a catalog.',
            },
            {
              icon: 'Flag',
              title: 'Made in the USA',
              text: 'We install equipment manufactured in the United States.',
            },
            {
              icon: 'Languages',
              title: 'Truly bilingual',
              text: 'English or Spanish, by phone or WhatsApp, 7 days a week.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Lifetime support',
              text: 'Manufacturer warranty honored through us, plus lifetime support while in good standing.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How we work',
          items: [
            {
              title: 'Free test, no pressure',
              text: 'We test at home and explain the results. No obligation to buy.',
            },
            {
              title: 'The honest answer',
              text: 'If your water is fine, we tell you.',
            },
            {
              title: 'Everything clear first',
              text: 'Price, equipment and any financing terms before you sign.',
            },
            {
              title: 'Your right to cancel',
              text: 'Florida law: cancel until midnight of the third business day.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Business information',
          items: [
            { label: 'Legal name', value: 'GLOBAL INNOVATION GROUP INFINITY LLC', detail: 'd/b/a Infinity Water' },
            { label: 'Address', value: '3940 Metro Pkwy., Fort Myers, FL 33916' },
            { label: 'Our founder’s experience', value: '25+ years', detail: 'In water treatment.' },
            { label: 'Languages', value: 'English and Spanish', detail: 'Open 7 days a week.' },
          ],
        },
        {
          type: 'faq',
          heading: 'Questions about us',
          items: [
            {
              q: 'Are you a local company?',
              a: 'Yes. We’re based in Fort Myers and serve Southwest Florida.',
            },
            {
              q: 'Do you only work with well water?',
              a: 'It’s our specialty. We also install whole-house filtration for city water and reverse osmosis.',
            },
            {
              q: 'Can I talk to you in Spanish?',
              a: 'Of course. By phone or WhatsApp, 7 days a week.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Meet us at your kitchen table.',
          text: 'Free in-home water test. No pressure, and an honest answer.',
        },
      ],
    },
    es: {
      metaTitle: 'Nosotros | Infinity Water, empresa familiar hispana',
      metaDescription:
        'Infinity Water es una empresa familiar hispana en Fort Myers, con un fundador con más de 25 años de experiencia. Especialistas en agua de pozo. En español.',
      eyebrow: 'Nosotros',
      title: 'Una familia que te dice la verdad.',
      lead: 'Empresa familiar hispana en Fort Myers, dirigida por un fundador con más de 25 años en tratamiento de agua.',
      highlights: ['Fundador con 25+ años', 'Especialistas en pozo', 'Español e inglés'],
      blocks: [
        {
          type: 'prose',
          heading: 'Quiénes somos',
          paragraphs: [
            'Conocemos el agua del suroeste de Florida: azufre y hierro en los pozos, cloraminas en el agua de ciudad y lo que cambia tras un huracán. Atendemos Fort Myers, Cape Coral, Lehigh Acres, Naples, Bonita Springs, Estero y alrededores.',
          ],
        },
        {
          type: 'features',
          heading: 'Lo que nos hace distintos',
          items: [
            {
              icon: 'Droplets',
              title: 'Especialistas en pozo',
              text: 'Diseñamos cada sistema según tu análisis, nunca por catálogo.',
            },
            {
              icon: 'Flag',
              title: 'Fabricado en EE. UU.',
              text: 'Instalamos equipos fabricados en Estados Unidos.',
            },
            {
              icon: 'Languages',
              title: 'Bilingües de verdad',
              text: 'Español o inglés, por teléfono o WhatsApp, los 7 días.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Soporte de por vida',
              text: 'Garantía del fabricante gestionada por nosotros, más soporte mientras estés al día.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Cómo trabajamos',
          items: [
            {
              title: 'Análisis gratis, sin presión',
              text: 'Analizamos en tu casa y te explicamos. Sin compromiso de compra.',
            },
            {
              title: 'La respuesta honesta',
              text: 'Si tu agua está bien, te lo decimos.',
            },
            {
              title: 'Todo claro antes',
              text: 'Precio, equipo y condiciones de financiamiento antes de firmar.',
            },
            {
              title: 'Tu derecho a cancelar',
              text: 'Por ley de Florida, hasta la medianoche del tercer día hábil.',
            },
          ],
        },
        {
          type: 'facts',
          heading: 'Datos de la empresa',
          items: [
            { label: 'Razón social', value: 'GLOBAL INNOVATION GROUP INFINITY LLC', detail: 'd/b/a Infinity Water' },
            { label: 'Dirección', value: '3940 Metro Pkwy., Fort Myers, FL 33916' },
            { label: 'Experiencia de nuestro fundador', value: 'Más de 25 años', detail: 'En tratamiento de agua.' },
            { label: 'Idiomas', value: 'Español e inglés', detail: 'Los 7 días de la semana.' },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre nosotros',
          items: [
            {
              q: '¿Son una empresa local?',
              a: 'Sí. Estamos en Fort Myers y atendemos el suroeste de Florida.',
            },
            {
              q: '¿Solo trabajan con agua de pozo?',
              a: 'Es nuestra especialidad. También instalamos filtración para toda la casa con agua de ciudad y ósmosis inversa.',
            },
            {
              q: '¿Puedo hablarles en español?',
              a: '¡Claro! Por teléfono o WhatsApp, los 7 días de la semana.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Conozcámonos en tu cocina.',
          text: 'Análisis de agua gratis en casa. Sin presión y con una respuesta honesta.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Financiamiento                                                     */
  /* ---------------------------------------------------------------- */
  {
    key: 'financing',
    kind: 'company',
    slug: { en: 'financing', es: 'financiamiento' },
    icon: 'CreditCard',
    related: ['about', 'faq', 'whole-house-filtration', 'well-water-systems'],
    en: {
      metaTitle: 'Water System Financing in SW Florida | Infinity Water',
      metaDescription:
        'Financing for water treatment systems through home improvement lenders. Everything reviewed before you sign, no surprises, and your 3-day right to cancel.',
      eyebrow: 'Financing',
      title: 'Financing, clear before you sign.',
      lead: 'We work with several home improvement lenders. Approval depends on credit, and we review every term with you first.',
      highlights: ['Several home improvement lenders', 'Reviewed before you sign', '3-day right to cancel'],
      blocks: [
        {
          type: 'steps',
          heading: 'How it works',
          items: [
            {
              title: 'Free test',
              text: 'We test your water and give you a clear price.',
            },
            {
              title: 'Apply if you want',
              text: 'Apply with one of our lenders. Approval is subject to credit.',
            },
            {
              title: 'Review every term',
              text: 'We go over every condition with you, in English or Spanish.',
            },
            {
              title: 'Sign when you’re sure',
              text: 'No rush. Even after signing, you can still cancel.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Questions worth asking',
          intro: 'Ask us, or any company.',
          items: [
            'What’s the total I’ll pay?',
            'Is there a lien on my home?',
            'Is there an early payoff penalty?',
            'Who is the lender?',
            'What happens if I sell the house?',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Your 3-day right to cancel',
          text: 'For sales made in your home, Florida law lets you cancel until midnight of the third business day after signing (Fla. Stat. 501.021–501.055).',
        },
        {
          type: 'features',
          heading: 'Our commitment',
          items: [
            {
              icon: 'FileText',
              title: 'No surprises',
              text: 'What we explain at your table is what’s on the paperwork.',
            },
            {
              icon: 'HeartHandshake',
              title: 'No pressure',
              text: 'Take the documents home and decide another day.',
            },
            {
              icon: 'DollarSign',
              title: 'Paying in full works',
              text: 'Financing is an option, never a requirement.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Financing questions',
          items: [
            {
              q: 'What are the monthly payments?',
              a: 'They depend on the lender, the amount and your credit, so we don’t publish them. We show you the real options before you sign.',
            },
            {
              q: 'Does applying affect my credit?',
              a: 'It depends on the lender and the type of credit check. We tell you before you apply.',
            },
            {
              q: 'Do I have to finance?',
              a: 'No. Pay in full or finance, whatever works for you.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Start with the free test.',
          text: 'Know what your water needs first. Then we talk options.',
        },
      ],
    },
    es: {
      metaTitle: 'Financiamiento para sistemas de agua | Infinity Water',
      metaDescription:
        'Financiamiento para tu sistema de agua con financieras de mejoras del hogar. Revisamos todo antes de firmar, sin sorpresas, y con tus 3 días para cancelar.',
      eyebrow: 'Financiamiento',
      title: 'Financiamiento claro antes de firmar.',
      lead: 'Trabajamos con varias financieras de mejoras del hogar. La aprobación depende de tu crédito y revisamos todo contigo antes.',
      highlights: ['Varias financieras', 'Revisado antes de firmar', '3 días para cancelar'],
      blocks: [
        {
          type: 'steps',
          heading: 'Cómo funciona',
          items: [
            {
              title: 'Análisis gratis',
              text: 'Analizamos tu agua y te damos un precio claro.',
            },
            {
              title: 'Solicitas si quieres',
              text: 'Aplicas con una de nuestras financieras. Aprobación sujeta a crédito.',
            },
            {
              title: 'Revisamos cada condición',
              text: 'Repasamos todo contigo, en español o inglés.',
            },
            {
              title: 'Firmas cuando estés seguro',
              text: 'Sin prisa. Aun después de firmar, puedes cancelar.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Preguntas que vale la pena hacer',
          intro: 'A nosotros o a cualquier empresa.',
          items: [
            '¿Cuánto pagaré en total?',
            '¿Hay un gravamen (lien) sobre mi casa?',
            '¿Hay penalidad por pagar antes?',
            '¿Quién es la financiera?',
            '¿Qué pasa si vendo la casa?',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Tus 3 días hábiles para cancelar',
          text: 'En las ventas hechas en tu casa, la ley de Florida te permite cancelar hasta la medianoche del tercer día hábil tras firmar (Fla. Stat. 501.021–501.055).',
        },
        {
          type: 'features',
          heading: 'Nuestro compromiso',
          items: [
            {
              icon: 'FileText',
              title: 'Sin sorpresas',
              text: 'Lo que te explicamos en tu mesa es lo que dicen los papeles.',
            },
            {
              icon: 'HeartHandshake',
              title: 'Sin presión',
              text: 'Llévate los documentos y decide otro día.',
            },
            {
              icon: 'DollarSign',
              title: 'Pagar de contado vale',
              text: 'Financiar es una opción, nunca una obligación.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el financiamiento',
          items: [
            {
              q: '¿Cuánto son las cuotas?',
              a: 'Dependen de la financiera, del monto y de tu crédito, así que no las publicamos. Te mostramos las opciones reales antes de firmar.',
            },
            {
              q: '¿Aplicar afecta mi crédito?',
              a: 'Depende de la financiera y del tipo de consulta. Te lo explicamos antes de aplicar.',
            },
            {
              q: '¿Tengo que financiar?',
              a: 'No. Puedes pagar de contado o financiar, como mejor te funcione.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Empieza con el análisis gratis.',
          text: 'Primero conoce qué necesita tu agua. Después hablamos de opciones.',
        },
      ],
    },
  },

  /* ---------------------------------------------------------------- */
  /* Preguntas frecuentes                                               */
  /* ---------------------------------------------------------------- */
  {
    key: 'faq',
    kind: 'company',
    slug: { en: 'faq', es: 'preguntas-frecuentes' },
    icon: 'MessageCircle',
    related: ['well-water', 'city-water', 'financing', 'about'],
    en: {
      metaTitle: 'Water Treatment FAQ | Infinity Water, SW Florida',
      metaDescription:
        'Honest answers about the free water test, well water, city water, softeners, chloramine, sodium, price, financing and warranty in Southwest Florida.',
      eyebrow: 'FAQ',
      title: 'Straight answers to real questions.',
      lead: 'What Southwest Florida families ask us most. Don’t see yours? Message us on WhatsApp.',
      highlights: ['Honest, specific answers', 'Well and city water', 'Price and warranty'],
      blocks: [
        {
          type: 'faq',
          heading: 'The free water test',
          items: [
            {
              q: 'What does the free test include?',
              a: 'We test your water at home, in front of you, and explain each result. No cost, no commitment.',
            },
            {
              q: 'Do I have to buy something?',
              a: 'No. If your water doesn’t need a system, we tell you. You decide: today, later or never.',
            },
            {
              q: 'How is it different from “free test” pressure tactics?',
              a: 'The Florida Attorney General has warned about those. We explain every result and never push you to sign the same day.',
            },
            {
              q: 'Is it the same as a lab test?',
              a: 'No. It covers the most common issues. For bacteria, a certified lab test is the right tool.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Well water',
          items: [
            {
              q: 'Why does my well smell like rotten eggs?',
              a: 'Usually hydrogen sulfide. You can smell it from about 0.1 mg/L. Air injection or oxidation systems are designed to treat it.',
            },
            {
              q: 'What causes orange stains?',
              a: 'Iron in the well water. We oxidize and filter it before it reaches the house.',
            },
            {
              q: 'How often should I test my well?',
              a: 'At least once a year for bacteria and chemicals, per the Florida Department of Health. No utility does it for you.',
            },
            {
              q: 'What if my well flooded?',
              a: 'Don’t drink it; use bottled or boiled water. The well needs shock chlorination, new filters and a bacteria test first.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'City water',
          items: [
            {
              q: 'Do I need a softener?',
              a: 'Usually not. Fort Myers city water is soft (about 1.8 gpg), and Cape Coral says a softener isn’t needed on municipal water.',
            },
            {
              q: 'What is chloramine?',
              a: 'Chlorine combined with ammonia, used by Lee County Utilities and Collier County. Reducing it takes catalytic carbon.',
            },
            {
              q: 'Why does my water taste different some weeks?',
              a: 'Utilities using chloramine switch to free chlorine for a few weeks. Lee County did it May 1–21, 2025; Collier County, July 31 to August 28, 2026.',
            },
            {
              q: 'Does city water have a lot of sodium?',
              a: 'It varies. Fort Myers reports an average of 114 ppm. Reverse osmosis at the kitchen sink reduces it.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Price, financing and warranty',
          items: [
            {
              q: 'How much does a system cost?',
              a: 'It depends on your water and home. After the free test, you get a clear price with no hidden costs.',
            },
            {
              q: 'Do you offer financing?',
              a: 'Yes, through several home improvement lenders, subject to credit. We review every term with you before you sign.',
            },
            {
              q: 'Can I cancel after signing?',
              a: 'Yes. For sales made in your home, Florida law gives you until midnight of the third business day.',
            },
            {
              q: 'What warranty do I get?',
              a: 'The manufacturer’s warranty on parts, honored through us, plus lifetime support while the system stays in good standing.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Still have questions?',
          text: 'The best answer comes from your own water. Book a free test.',
        },
      ],
    },
    es: {
      metaTitle: 'Preguntas frecuentes | Infinity Water, SW de Florida',
      metaDescription:
        'Respuestas honestas sobre el análisis gratis, el agua de pozo y de ciudad, suavizadores, cloraminas, sodio, precio, financiamiento y garantía en Florida.',
      eyebrow: 'Preguntas frecuentes',
      title: 'Respuestas claras a tus preguntas.',
      lead: 'Lo que más nos preguntan las familias del suroeste de Florida. ¿No está la tuya? Escríbenos por WhatsApp.',
      highlights: ['Respuestas honestas y concretas', 'Pozo y ciudad', 'Precio y garantía'],
      blocks: [
        {
          type: 'faq',
          heading: 'El análisis gratis',
          items: [
            {
              q: '¿Qué incluye el análisis gratis?',
              a: 'Analizamos tu agua en casa, delante de ti, y te explicamos cada resultado. Sin costo ni compromiso.',
            },
            {
              q: '¿Tengo que comprar algo?',
              a: 'No. Si tu agua no necesita un sistema, te lo decimos. Tú decides: hoy, otro día o nunca.',
            },
            {
              q: '¿En qué se diferencia de las “pruebas gratis” de presión?',
              a: 'La Fiscalía de Florida ha advertido sobre ellas. Nosotros explicamos cada resultado y nunca te presionamos a firmar el mismo día.',
            },
            {
              q: '¿Es igual que un análisis de laboratorio?',
              a: 'No. Cubre los problemas más comunes. Para bacterias, lo correcto es un laboratorio certificado.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Agua de pozo',
          items: [
            {
              q: '¿Por qué mi pozo huele a huevo podrido?',
              a: 'Casi siempre es sulfuro de hidrógeno. Se nota desde unos 0.1 mg/L. La inyección de aire u oxidación está diseñada para tratarlo.',
            },
            {
              q: '¿Qué causa las manchas naranjas?',
              a: 'El hierro del agua de pozo. Lo oxidamos y filtramos antes de que entre a la casa.',
            },
            {
              q: '¿Cada cuánto analizo mi pozo?',
              a: 'Al menos una vez al año (bacterias y químicos), según el Departamento de Salud de Florida. Nadie lo hace por ti.',
            },
            {
              q: '¿Qué hago si se inundó mi pozo?',
              a: 'No bebas esa agua; usa agua embotellada o hervida. Hay que hacer cloración de choque, cambiar filtros y analizar bacterias antes.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Agua de ciudad',
          items: [
            {
              q: '¿Necesito suavizador?',
              a: 'Casi nunca. El agua de la ciudad de Fort Myers es blanda (unos 1.8 gpg) y Cape Coral dice que con agua municipal no hace falta.',
            },
            {
              q: '¿Qué es la cloramina?',
              a: 'Cloro combinado con amoníaco. La usan Lee County Utilities y Collier County. Para reducirla hace falta carbón catalítico.',
            },
            {
              q: '¿Por qué mi agua sabe distinta algunas semanas?',
              a: 'Las compañías con cloraminas pasan unas semanas a cloro libre. Lee County lo hizo del 1 al 21 de mayo de 2025; Collier County, del 31 de julio al 28 de agosto de 2026.',
            },
            {
              q: '¿El agua de ciudad tiene mucho sodio?',
              a: 'Depende. Fort Myers reporta un promedio de 114 ppm. Una ósmosis inversa en la cocina lo reduce.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Precio, financiamiento y garantía',
          items: [
            {
              q: '¿Cuánto cuesta un sistema?',
              a: 'Depende de tu agua y tu casa. Tras el análisis gratis recibes un precio claro, sin costos escondidos.',
            },
            {
              q: '¿Tienen financiamiento?',
              a: 'Sí, con varias financieras de mejoras del hogar, sujeto a crédito. Revisamos cada condición contigo antes de firmar.',
            },
            {
              q: '¿Puedo cancelar después de firmar?',
              a: 'Sí. En las ventas hechas en tu casa, la ley de Florida te da hasta la medianoche del tercer día hábil.',
            },
            {
              q: '¿Qué garantía tengo?',
              a: 'La del fabricante sobre las piezas, gestionada por nosotros, más soporte de por vida mientras el sistema esté al día.',
            },
          ],
        },
        {
          type: 'cta',
          title: '¿Te quedó alguna duda?',
          text: 'La mejor respuesta sale de tu propia agua. Pide tu análisis gratis.',
        },
      ],
    },
  },
];
