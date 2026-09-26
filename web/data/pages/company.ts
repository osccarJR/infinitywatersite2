/**
 * Paginas de empresa: nosotros, financiamiento y preguntas frecuentes.
 * Sin nombres, fechas ni anecdotas inventadas; sin cuotas, tasas, plazos ni
 * nombres de financieras (TILA / Reg Z).
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
      title: 'A Hispanic family business that tells you the truth about your water',
      lead: 'We are a family-owned water treatment company in Fort Myers, led by a founder with more than 25 years of experience. We specialize in well water, we install equipment made in the USA and we serve families in English and Spanish.',
      highlights: [
        'Our founder’s 25+ years in water treatment',
        'Well water specialists',
        'Service in English and Spanish',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Who we are',
          paragraphs: [
            'Infinity Water is a Hispanic family business based in Fort Myers, Florida. Our founder has spent more than 25 years in water treatment, and that experience is the foundation of every recommendation we make.',
            'We know Southwest Florida water: the sulfur and iron in private wells, the chlorine and chloramine in city water and what changes after a hurricane. We serve Fort Myers, Cape Coral, Lehigh Acres, Naples, Bonita Springs, Estero and nearby areas, and other parts of Florida on request.',
          ],
        },
        {
          type: 'features',
          heading: 'What sets us apart',
          items: [
            {
              icon: 'Droplets',
              title: 'Well water specialists',
              text: 'Wells are what we know best. We design each system from your water test, never from a catalog.',
            },
            {
              icon: 'Flag',
              title: 'Equipment made in the USA',
              text: 'We install systems manufactured in the United States, with top-grade media and components.',
            },
            {
              icon: 'Languages',
              title: 'Truly bilingual',
              text: 'We explain everything in English or Spanish, by phone or WhatsApp, 7 days a week.',
            },
            {
              icon: 'HeartHandshake',
              title: 'Family business',
              text: 'You deal with people who care about their name in the community, not a call center.',
            },
            {
              icon: 'BadgeCheck',
              title: 'Water Quality Association member',
              text: 'We follow the industry closely and look for NSF/ANSI-certified equipment for each case.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Lifetime support',
              text: 'Manufacturer warranty on parts, honored through us, plus lifetime support while the system is kept in good standing.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'How we work',
          intro: 'Honesty is our brand. This is what you can expect from us, every time.',
          items: [
            {
              title: 'A free test with no pressure',
              text: 'We test your water at home and explain the results. No commitment to buy anything.',
            },
            {
              title: 'The truth, even if it’s “you don’t need it”',
              text: 'If your water is fine, we tell you. If it needs something, we explain what and why.',
            },
            {
              title: 'Everything clear before you sign',
              text: 'Price, equipment and, if you finance, the terms. You can take your time to decide.',
            },
            {
              title: 'Your right to cancel',
              text: 'Under Florida law, for sales made in your home you can cancel until midnight of the third business day. We explain it up front.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Why we start with a free test',
          text: 'Some companies use “free tests” as a pressure tactic, something the Florida Attorney General has warned about. Ours is different: we show you the results, answer your questions and leave the decision to you.',
        },
        {
          type: 'facts',
          heading: 'Our business information',
          items: [
            { label: 'Legal name', value: 'GLOBAL INNOVATION GROUP INFINITY LLC', detail: 'd/b/a Infinity Water' },
            { label: 'Address', value: '3940 Metro Pkwy., Fort Myers, FL 33916' },
            { label: 'Languages', value: 'English and Spanish' },
            { label: 'Service hours', value: 'Open 7 days a week' },
          ],
        },
        {
          type: 'faq',
          heading: 'Questions about us',
          items: [
            {
              q: 'Is Infinity Water a local company?',
              a: 'Yes. We are based at 3940 Metro Pkwy. in Fort Myers and serve Southwest Florida. Infinity Water is operated by GLOBAL INNOVATION GROUP INFINITY LLC, doing business as Infinity Water.',
            },
            {
              q: 'Do you only work with well water?',
              a: 'Well water is our specialty, but we also install whole-house filtration for city water and reverse osmosis for drinking water.',
            },
            {
              q: 'Can I talk to you in Spanish?',
              a: 'Of course. We serve families in Spanish and English, by phone and WhatsApp, 7 days a week.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Meet us at your kitchen table',
          text: 'Book a free in-home water test. No pressure, no commitment, and an honest answer about your water.',
        },
      ],
    },
    es: {
      metaTitle: 'Nosotros | Infinity Water, empresa familiar hispana',
      metaDescription:
        'Infinity Water es una empresa familiar hispana en Fort Myers, con un fundador con más de 25 años de experiencia. Especialistas en agua de pozo. En español.',
      eyebrow: 'Nosotros',
      title: 'Una empresa familiar hispana que te dice la verdad sobre tu agua',
      lead: 'Somos una empresa familiar de tratamiento de agua en Fort Myers, dirigida por un fundador con más de 25 años de experiencia. Nos especializamos en agua de pozo, instalamos equipos fabricados en EE. UU. y atendemos a las familias en español e inglés.',
      highlights: [
        'Más de 25 años de experiencia de nuestro fundador',
        'Especialistas en agua de pozo',
        'Te atendemos en español e inglés',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Quiénes somos',
          paragraphs: [
            'Infinity Water es una empresa familiar hispana con sede en Fort Myers, Florida. Nuestro fundador lleva más de 25 años en el tratamiento de agua, y esa experiencia es la base de cada recomendación que hacemos.',
            'Conocemos el agua del suroeste de Florida: el azufre y el hierro de los pozos privados, el cloro y las cloraminas del agua de ciudad y lo que cambia después de un huracán. Atendemos Fort Myers, Cape Coral, Lehigh Acres, Naples, Bonita Springs, Estero y zonas cercanas, y otras partes de Florida bajo consulta.',
          ],
        },
        {
          type: 'features',
          heading: 'Lo que nos hace diferentes',
          items: [
            {
              icon: 'Droplets',
              title: 'Especialistas en agua de pozo',
              text: 'Los pozos son lo que mejor conocemos. Diseñamos cada sistema según tu análisis, nunca por catálogo.',
            },
            {
              icon: 'Flag',
              title: 'Equipos fabricados en EE. UU.',
              text: 'Instalamos sistemas fabricados en Estados Unidos, con materiales y componentes de primera.',
            },
            {
              icon: 'Languages',
              title: 'Bilingües de verdad',
              text: 'Te explicamos todo en español o inglés, por teléfono o WhatsApp, los 7 días de la semana.',
            },
            {
              icon: 'HeartHandshake',
              title: 'Empresa familiar',
              text: 'Tratas con personas que cuidan su nombre en la comunidad, no con un centro de llamadas.',
            },
            {
              icon: 'BadgeCheck',
              title: 'Miembro de la Water Quality Association',
              text: 'Seguimos de cerca la industria y buscamos equipos con certificación NSF/ANSI para cada caso.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Soporte de por vida',
              text: 'Garantía del fabricante sobre las piezas, gestionada por nosotros, más soporte de por vida mientras el sistema esté al día.',
            },
          ],
        },
        {
          type: 'steps',
          heading: 'Nuestra forma de trabajar',
          intro: 'La honestidad es nuestra marca. Esto es lo que puedes esperar de nosotros, siempre.',
          items: [
            {
              title: 'Un análisis gratis y sin presión',
              text: 'Analizamos tu agua en casa y te explicamos los resultados. Sin compromiso de comprar nada.',
            },
            {
              title: 'La verdad, aunque sea “no lo necesitas”',
              text: 'Si tu agua está bien, te lo decimos. Si necesita algo, te explicamos qué y por qué.',
            },
            {
              title: 'Todo claro antes de firmar',
              text: 'Precio, equipo y, si financias, las condiciones. Puedes tomarte tu tiempo para decidir.',
            },
            {
              title: 'Tu derecho a cancelar',
              text: 'Por ley de Florida, en las ventas hechas en tu casa puedes cancelar hasta la medianoche del tercer día hábil. Te lo explicamos desde el principio.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Por qué empezamos con un análisis gratis',
          text: 'Algunas empresas usan la “prueba gratis” como táctica de presión, algo sobre lo que ha advertido la Fiscalía de Florida. La nuestra es distinta: te mostramos los resultados, respondemos tus preguntas y la decisión es tuya.',
        },
        {
          type: 'facts',
          heading: 'Datos de nuestra empresa',
          items: [
            { label: 'Razón social', value: 'GLOBAL INNOVATION GROUP INFINITY LLC', detail: 'd/b/a Infinity Water' },
            { label: 'Dirección', value: '3940 Metro Pkwy., Fort Myers, FL 33916' },
            { label: 'Idiomas', value: 'Español e inglés' },
            { label: 'Atención', value: 'Los 7 días de la semana' },
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre nosotros',
          items: [
            {
              q: '¿Infinity Water es una empresa local?',
              a: 'Sí. Estamos en 3940 Metro Pkwy., Fort Myers, y atendemos el suroeste de Florida. Infinity Water es una marca operada por GLOBAL INNOVATION GROUP INFINITY LLC, que opera comercialmente como Infinity Water.',
            },
            {
              q: '¿Solo trabajan con agua de pozo?',
              a: 'El agua de pozo es nuestra especialidad, pero también instalamos filtración para toda la casa con agua de ciudad y ósmosis inversa para el agua de beber.',
            },
            {
              q: '¿Puedo hablar con ustedes en español?',
              a: '¡Claro que sí! Atendemos a las familias en español e inglés, por teléfono y WhatsApp, los 7 días de la semana.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Conozcámonos en la mesa de tu cocina',
          text: 'Pide tu análisis de agua gratis en casa. Sin presión, sin compromiso y con una respuesta honesta sobre tu agua.',
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
      title: 'Financing that’s clear before you sign',
      lead: 'We work with several home improvement lenders so you can pay for your water system over time. Approval depends on your credit, and we go over every detail with you before you sign anything.',
      highlights: [
        'Several home improvement lenders',
        'Everything reviewed before you sign',
        'Your 3-day right to cancel',
      ],
      blocks: [
        {
          type: 'steps',
          heading: 'How financing works',
          items: [
            {
              title: 'Free test and recommendation',
              text: 'First we test your water. If you need a system, we give you a clear price for the equipment and installation.',
            },
            {
              title: 'Credit application',
              text: 'If you choose to finance, you apply with one of the home improvement lenders we work with. Approval is subject to credit.',
            },
            {
              title: 'Review every term with us',
              text: 'Before you sign, we go over the payment, the term, the rate and any conditions the lender sets, line by line, in English or Spanish.',
            },
            {
              title: 'Sign only when you’re sure',
              text: 'No rush. If you have questions, ask them. And even after signing, you still have your right to cancel.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Questions we encourage you to ask (us or any company)',
          intro: 'A good financing offer can answer all of these clearly.',
          items: [
            'What is the total amount I’ll pay, including interest?',
            'Is there a lien or security interest on my home?',
            'Is there a penalty if I pay it off early?',
            'Who is the lender, and who do I pay each month?',
            'What happens if I sell the house?',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Your right to cancel under Florida law',
          text: 'For sales made in your home, Florida law gives you the right to cancel until midnight of the third business day after you sign (Fla. Stat. 501.021–501.055). We explain it before you sign, not after.',
        },
        {
          type: 'features',
          heading: 'Our commitment',
          items: [
            {
              icon: 'FileText',
              title: 'No surprises',
              text: 'What we explain at your table is what appears on the paperwork.',
            },
            {
              icon: 'HeartHandshake',
              title: 'No pressure',
              text: 'You can take the documents, read them calmly and decide another day.',
            },
            {
              icon: 'Languages',
              title: 'In your language',
              text: 'We explain every term in Spanish or English, so the whole family understands.',
            },
            {
              icon: 'DollarSign',
              title: 'Paying in full is fine too',
              text: 'Financing is an option, not a requirement. Choose whatever works best for your family.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Financing and lifetime support',
          paragraphs: [
            'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water. On top of that we offer lifetime support for as long as the system is kept in good standing: scheduled maintenance done on time, payments current and the system used as intended.',
          ],
        },
        {
          type: 'faq',
          heading: 'Financing questions',
          items: [
            {
              q: 'What are your monthly payments or rates?',
              a: 'They depend on the lender, the amount and your credit, so we don’t publish them. Once you know which system you need, we show you the real options and every term before you sign.',
            },
            {
              q: 'Does applying affect my credit?',
              a: 'It depends on the lender and the type of credit check. Ask us and we’ll tell you how it works with each option before you apply.',
            },
            {
              q: 'Can I cancel after signing?',
              a: 'Yes. For sales made in your home, Florida law lets you cancel until midnight of the third business day after signing. We give you the cancellation information in writing.',
            },
            {
              q: 'Do I have to finance?',
              a: 'No. You can pay in full or finance, whichever works best for you.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Start with the free test',
          text: 'Know what your water needs first. Then we talk about options, with every number on the table.',
        },
      ],
    },
    es: {
      metaTitle: 'Financiamiento para sistemas de agua | Infinity Water',
      metaDescription:
        'Financiamiento para tu sistema de agua con financieras de mejoras del hogar. Revisamos todo antes de firmar, sin sorpresas, y con tus 3 días para cancelar.',
      eyebrow: 'Financiamiento',
      title: 'Financiamiento claro antes de firmar',
      lead: 'Trabajamos con varias financieras de mejoras del hogar para que puedas pagar tu sistema de agua poco a poco. La aprobación depende de tu crédito, y revisamos cada detalle contigo antes de que firmes nada.',
      highlights: [
        'Varias financieras de mejoras del hogar',
        'Revisamos todo antes de firmar',
        'Tus 3 días hábiles para cancelar',
      ],
      blocks: [
        {
          type: 'steps',
          heading: 'Cómo funciona el financiamiento',
          items: [
            {
              title: 'Análisis gratis y recomendación',
              text: 'Primero analizamos tu agua. Si necesitas un sistema, te damos un precio claro del equipo y la instalación.',
            },
            {
              title: 'Solicitud de crédito',
              text: 'Si decides financiar, aplicas con una de las financieras de mejoras del hogar con las que trabajamos. La aprobación está sujeta a tu crédito.',
            },
            {
              title: 'Revisamos cada condición contigo',
              text: 'Antes de firmar repasamos el pago, el plazo, la tasa y cualquier condición que ponga la financiera, punto por punto, en español o inglés.',
            },
            {
              title: 'Firmas solo cuando estés seguro',
              text: 'Sin prisa. Si tienes dudas, pregúntalas. Y aun después de firmar, conservas tu derecho a cancelar.',
            },
          ],
        },
        {
          type: 'signs',
          heading: 'Preguntas que te animamos a hacer (a nosotros o a cualquier empresa)',
          intro: 'Una buena oferta de financiamiento puede responderlas todas con claridad.',
          items: [
            '¿Cuánto voy a pagar en total, con intereses?',
            '¿Hay un gravamen (lien) sobre mi casa?',
            '¿Hay penalidad si lo pago antes de tiempo?',
            '¿Quién es la financiera y a quién le pago cada mes?',
            '¿Qué pasa si vendo la casa?',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Tu derecho a cancelar según la ley de Florida',
          text: 'En las ventas hechas en tu casa, la ley de Florida te da derecho a cancelar hasta la medianoche del tercer día hábil después de firmar (Fla. Stat. 501.021–501.055). Te lo explicamos antes de firmar, no después.',
        },
        {
          type: 'features',
          heading: 'Nuestro compromiso',
          items: [
            {
              icon: 'FileText',
              title: 'Sin sorpresas',
              text: 'Lo que te explicamos en tu mesa es lo que aparece en los papeles.',
            },
            {
              icon: 'HeartHandshake',
              title: 'Sin presión',
              text: 'Puedes quedarte con los documentos, leerlos con calma y decidir otro día.',
            },
            {
              icon: 'Languages',
              title: 'En tu idioma',
              text: 'Te explicamos cada condición en español o inglés, para que toda la familia entienda.',
            },
            {
              icon: 'DollarSign',
              title: 'Pagar de contado también vale',
              text: 'El financiamiento es una opción, no una obligación. Elige lo que mejor le funcione a tu familia.',
            },
          ],
        },
        {
          type: 'prose',
          heading: 'Financiamiento y soporte de por vida',
          paragraphs: [
            'Cada sistema lleva la garantía del fabricante sobre sus piezas y la gestionamos nosotros. Además te damos soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo.',
          ],
        },
        {
          type: 'faq',
          heading: 'Preguntas sobre el financiamiento',
          items: [
            {
              q: '¿Cuánto son las cuotas o las tasas?',
              a: 'Dependen de la financiera, del monto y de tu crédito, así que no las publicamos. Cuando sepas qué sistema necesitas, te mostramos las opciones reales y cada condición antes de firmar.',
            },
            {
              q: '¿Aplicar afecta mi crédito?',
              a: 'Depende de la financiera y del tipo de consulta de crédito. Pregúntanos y te explicamos cómo funciona cada opción antes de aplicar.',
            },
            {
              q: '¿Puedo cancelar después de firmar?',
              a: 'Sí. En las ventas hechas en tu casa, la ley de Florida te permite cancelar hasta la medianoche del tercer día hábil después de firmar. Te damos la información de cancelación por escrito.',
            },
            {
              q: '¿Tengo que financiar?',
              a: 'No. Puedes pagar de contado o financiar, lo que mejor te funcione.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Empieza con el análisis gratis',
          text: 'Primero conoce lo que necesita tu agua. Después hablamos de opciones, con todos los números sobre la mesa.',
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
        'Honest answers about the free water test, well water, city water, softeners, reverse osmosis, maintenance, financing and warranty in Southwest Florida.',
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      lead: 'Straight answers to what families in Southwest Florida ask us most. If your question isn’t here, message us on WhatsApp or call, in English or Spanish.',
      highlights: [
        'Honest, specific answers',
        'Well water and city water',
        'Price, financing and warranty',
      ],
      blocks: [
        {
          type: 'faq',
          heading: 'The free water test',
          items: [
            {
              q: 'What does the free test include?',
              a: 'We visit your home, test your water in front of you (for example hardness, iron, chlorine, pH and dissolved solids, depending on your water source) and explain what each result means. There’s no cost and no commitment.',
            },
            {
              q: 'Do I have to buy something?',
              a: 'No. If your water doesn’t need a system, we tell you. If it does, we explain the options and you decide, today, another day or never.',
            },
            {
              q: 'How is your test different from the “free tests” people warn about?',
              a: 'The Florida Attorney General has warned about in-home tests used as a pressure tactic. We explain every result, answer your questions and don’t push you to sign the same day.',
            },
            {
              q: 'Is your in-home test the same as a lab test?',
              a: 'No. The in-home test gives a clear picture of the most common issues. For bacteria and some other contaminants, a certified lab test is the right tool, and we tell you when it makes sense.',
            },
            {
              q: 'Do you speak Spanish? Can I contact you on WhatsApp?',
              a: 'Yes to both. We serve families in Spanish and English, by phone and WhatsApp, 7 days a week.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Well water',
          items: [
            {
              q: 'Why does my well water smell like rotten eggs?',
              a: 'That’s usually hydrogen sulfide, very common in Southwest Florida wells. It can be smelled at around 0.1 mg/L, and around 1 mg/L it can also stain and corrode. Air injection or oxidation systems are designed to treat it.',
            },
            {
              q: 'What causes orange stains on my sink, laundry or walls?',
              a: 'Iron in the well water. It oxidizes on contact with air and leaves orange or brown marks, including on walls hit by sprinklers. It’s treated by oxidizing and filtering the iron before it reaches the house.',
            },
            {
              q: 'How often should I test my well?',
              a: 'The Florida Department of Health recommends testing a private well at least once a year for bacteria and chemicals. As the owner, you’re responsible for its quality; no utility tests it for you.',
            },
            {
              q: 'Is there one system that fixes any well?',
              a: 'No. Every well is different, and the order of the stages matters. That’s why we design the system from your test.',
            },
            {
              q: 'What should I do if my well flooded?',
              a: 'If water covered the well, don’t drink it: use bottled or boiled water. The well needs shock chlorination, filters and membranes must be replaced, and the water re-tested for bacteria before you drink it again.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'City water',
          items: [
            {
              q: 'Do I need a softener with city water?',
              a: 'Usually not. Fort Myers city water is soft (about 1.8 gpg) and Cape Coral itself says a softener isn’t needed on municipal water. What most homes notice is the chlorine or chloramine taste and smell.',
            },
            {
              q: 'What is chloramine?',
              a: 'It’s a disinfectant made by combining chlorine and ammonia. Lee County Utilities and Collier County use it because it lasts longer in the pipes. It needs catalytic carbon to be reduced effectively; regular carbon isn’t enough.',
            },
            {
              q: 'Why does my water taste different a few weeks a year?',
              a: 'Utilities that use chloramine periodically switch to free chlorine for a few weeks to clean the system. Lee County did it May 1–21, 2025, and Collier County July 31 to August 28, 2026. Taste, odor and even color can change during that time.',
            },
            {
              q: 'Is my city water safe?',
              a: 'Public water is treated and must meet federal standards. A filter is about taste, odor, disinfection byproducts and your home’s own plumbing, not about fear. We show you your utility’s official report so you can decide.',
            },
            {
              q: 'Does city water have a lot of sodium?',
              a: 'It varies. Fort Myers reports an average of 114 ppm. If someone at home watches their sodium, reverse osmosis at the kitchen reduces it.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Systems and maintenance',
          items: [
            {
              q: 'How often do I change filters?',
              a: 'It depends on the system and your water. Sediment pre-filters are changed more often; carbon media, membranes and other stages last longer. We set a schedule for your system and send you reminders.',
            },
            {
              q: 'Does reverse osmosis waste water?',
              a: 'It sends part of the water to the drain to rinse the membrane; that’s how it stays clean. The amount depends on the model and water pressure, and it’s only used for drinking and cooking water, not the whole house.',
            },
            {
              q: 'Does alkaline water have health benefits?',
              a: 'We don’t make health claims. Our remineralization stage raises the water’s pH and adds minerals back for better taste.',
            },
            {
              q: 'How much salt does a softener use?',
              a: 'It depends on your hardness, your household size and how the softener is set. Only systems with a softener use salt; we explain the upkeep before you decide.',
            },
            {
              q: 'Do you service systems from other brands?',
              a: 'Yes. We inspect them, tell you what they need and whether they’re worth maintaining.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Price, financing and warranty',
          items: [
            {
              q: 'How much does a system cost?',
              a: 'It depends on your water and your home, so we don’t give a price without testing. After the free test you get a clear price for the equipment and installation, with no hidden costs.',
            },
            {
              q: 'Do you offer financing?',
              a: 'Yes, through several home improvement lenders. Approval is subject to credit, and we review every term with you before you sign, including whether there’s a lien or a prepayment penalty.',
            },
            {
              q: 'Can I cancel after signing?',
              a: 'Yes. For sales made in your home, Florida law gives you until midnight of the third business day after signing to cancel.',
            },
            {
              q: 'What warranty do I get?',
              a: 'Every system carries the manufacturer’s warranty on its parts, honored through Infinity Water, plus lifetime support for as long as the system is kept in good standing: maintenance on time, payments current and the system used as intended.',
            },
            {
              q: 'Is the equipment made in the USA?',
              a: 'Yes. We install systems manufactured in the United States.',
            },
          ],
        },
        {
          type: 'cta',
          title: 'Still have questions?',
          text: 'The best answer comes from your own water. Book a free in-home test, with no pressure and no commitment.',
        },
      ],
    },
    es: {
      metaTitle: 'Preguntas frecuentes | Infinity Water, SW de Florida',
      metaDescription:
        'Respuestas honestas sobre el análisis gratis, el agua de pozo y de ciudad, suavizadores, ósmosis inversa, mantenimiento, financiamiento y garantía en Florida.',
      eyebrow: 'Preguntas frecuentes',
      title: 'Preguntas frecuentes',
      lead: 'Respuestas directas a lo que más nos preguntan las familias del suroeste de Florida. Si tu pregunta no está aquí, escríbenos por WhatsApp o llámanos, en español o inglés.',
      highlights: [
        'Respuestas honestas y concretas',
        'Agua de pozo y de ciudad',
        'Precio, financiamiento y garantía',
      ],
      blocks: [
        {
          type: 'faq',
          heading: 'El análisis gratis',
          items: [
            {
              q: '¿Qué incluye el análisis gratis?',
              a: 'Vamos a tu casa, analizamos tu agua delante de ti (por ejemplo dureza, hierro, cloro, pH y sólidos disueltos, según si es de pozo o de ciudad) y te explicamos qué significa cada resultado. No cuesta nada y no te compromete a nada.',
            },
            {
              q: '¿Tengo que comprar algo?',
              a: 'No. Si tu agua no necesita un sistema, te lo decimos. Si lo necesita, te explicamos las opciones y tú decides: hoy, otro día o nunca.',
            },
            {
              q: '¿En qué se diferencia su análisis de las “pruebas gratis” de las que advierten?',
              a: 'La Fiscalía de Florida ha advertido sobre pruebas en casa usadas como táctica de presión. Nosotros te explicamos cada resultado, respondemos tus preguntas y no te presionamos para firmar el mismo día.',
            },
            {
              q: '¿El análisis en casa es igual que uno de laboratorio?',
              a: 'No. El análisis en casa da una idea clara de los problemas más comunes. Para bacterias y algunos otros contaminantes, lo correcto es un análisis de laboratorio certificado, y te decimos cuándo tiene sentido.',
            },
            {
              q: '¿Atienden en español? ¿Puedo escribirles por WhatsApp?',
              a: 'Sí a las dos. Atendemos a las familias en español e inglés, por teléfono y WhatsApp, los 7 días de la semana.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Agua de pozo',
          items: [
            {
              q: '¿Por qué el agua de mi pozo huele a huevo podrido?',
              a: 'Casi siempre es sulfuro de hidrógeno, muy común en los pozos del suroeste de Florida. Se huele desde unos 0.1 mg/L, y desde 1 mg/L aproximadamente también mancha y corroe. Los sistemas de inyección de aire u oxidación están diseñados para tratarlo.',
            },
            {
              q: '¿Qué causa las manchas naranjas en el lavamanos, la ropa o las paredes?',
              a: 'El hierro del agua de pozo. Se oxida al contacto con el aire y deja marcas naranjas o marrones, también en las paredes que moja el riego. Se trata oxidando y filtrando el hierro antes de que entre a la casa.',
            },
            {
              q: '¿Cada cuánto debo analizar mi pozo?',
              a: 'El Departamento de Salud de Florida recomienda analizar el pozo privado al menos una vez al año (bacterias y químicos). Como dueño, la calidad del pozo es tu responsabilidad: nadie lo analiza por ti.',
            },
            {
              q: '¿Hay un sistema que sirva para cualquier pozo?',
              a: 'No. Cada pozo es distinto y el orden de las etapas importa. Por eso diseñamos el sistema según tu análisis.',
            },
            {
              q: '¿Qué hago si se inundó mi pozo?',
              a: 'Si el agua cubrió el pozo, no la bebas: usa agua embotellada o hervida. Hay que desinfectar el pozo con cloración de choque, cambiar filtros y membranas, y volver a analizar las bacterias antes de beberla de nuevo.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Agua de ciudad',
          items: [
            {
              q: '¿Necesito suavizador con agua de ciudad?',
              a: 'Casi nunca. El agua de la ciudad de Fort Myers es blanda (unos 1.8 gpg) y la propia ciudad de Cape Coral dice que con agua municipal no hace falta suavizador. Lo que más se nota en casa es el sabor y el olor a cloro o cloraminas.',
            },
            {
              q: '¿Qué es la cloramina?',
              a: 'Es un desinfectante que se forma al combinar cloro y amoníaco. Lee County Utilities y Collier County la usan porque dura más en las tuberías. Para reducirla bien hace falta carbón catalítico; el carbón común no basta.',
            },
            {
              q: '¿Por qué mi agua sabe distinta unas semanas al año?',
              a: 'Las compañías que usan cloraminas cambian cada cierto tiempo a cloro libre durante unas semanas para limpiar la red. Lee County lo hizo del 1 al 21 de mayo de 2025 y Collier County del 31 de julio al 28 de agosto de 2026. En esas semanas pueden cambiar el sabor, el olor y hasta el color.',
            },
            {
              q: '¿El agua de mi ciudad es segura?',
              a: 'El agua pública se trata y debe cumplir las normas federales. Un filtro tiene que ver con el sabor, el olor, los subproductos de la desinfección y la plomería de tu casa, no con el miedo. Te mostramos el reporte oficial de tu compañía de agua para que decidas.',
            },
            {
              q: '¿El agua de ciudad tiene mucho sodio?',
              a: 'Depende. Fort Myers reporta un promedio de 114 ppm. Si alguien en casa cuida el sodio, una ósmosis inversa en la cocina lo reduce.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Sistemas y mantenimiento',
          items: [
            {
              q: '¿Cada cuánto cambio los filtros?',
              a: 'Depende del sistema y de tu agua. Los prefiltros de sedimentos se cambian más seguido; el carbón, las membranas y otras etapas duran más. Armamos un calendario para tu sistema y te enviamos recordatorios.',
            },
            {
              q: '¿La ósmosis inversa desperdicia agua?',
              a: 'Manda parte del agua al drenaje para enjuagar la membrana; así se mantiene limpia. La cantidad depende del modelo y de la presión del agua, y solo se usa para el agua de beber y cocinar, no para toda la casa.',
            },
            {
              q: '¿El agua alcalina tiene beneficios para la salud?',
              a: 'No hacemos afirmaciones de salud. Nuestra etapa de remineralización eleva el pH del agua y le devuelve minerales para que sepa mejor.',
            },
            {
              q: '¿Cuánta sal gasta un suavizador?',
              a: 'Depende de la dureza de tu agua, de cuántas personas viven en casa y de cómo esté programado. Solo los sistemas con suavizador usan sal; te explicamos el mantenimiento antes de que decidas.',
            },
            {
              q: '¿Dan servicio a sistemas de otras marcas?',
              a: 'Sí. Los revisamos, te decimos qué necesitan y si vale la pena mantenerlos.',
            },
          ],
        },
        {
          type: 'faq',
          heading: 'Precios, financiamiento y garantía',
          items: [
            {
              q: '¿Cuánto cuesta un sistema?',
              a: 'Depende de tu agua y de tu casa, así que no damos precio sin analizar. Después del análisis gratis recibes un precio claro del equipo y la instalación, sin costos escondidos.',
            },
            {
              q: '¿Tienen financiamiento?',
              a: 'Sí, con varias financieras de mejoras del hogar. La aprobación está sujeta a crédito y revisamos cada condición contigo antes de firmar, incluido si hay gravamen sobre la casa o penalidad por pagar antes.',
            },
            {
              q: '¿Puedo cancelar después de firmar?',
              a: 'Sí. En las ventas hechas en tu casa, la ley de Florida te da hasta la medianoche del tercer día hábil después de firmar para cancelar.',
            },
            {
              q: '¿Qué garantía tengo?',
              a: 'Cada sistema lleva la garantía del fabricante sobre sus piezas, gestionada por nosotros, más soporte de por vida mientras el sistema se mantenga al día: mantenimientos a tiempo, pagos al corriente y un uso correcto del equipo.',
            },
            {
              q: '¿Los equipos son fabricados en EE. UU.?',
              a: 'Sí. Instalamos sistemas fabricados en Estados Unidos.',
            },
          ],
        },
        {
          type: 'cta',
          title: '¿Te quedó alguna duda?',
          text: 'La mejor respuesta sale de tu propia agua. Pide tu análisis gratis en casa, sin presión y sin compromiso.',
        },
      ],
    },
  },
];
