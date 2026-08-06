/**
 * Metadatos por pagina e idioma.
 *
 * Este modulo lo consumen dos sitios a la vez:
 *  1. `src/components/Seo.jsx`, al navegar dentro de la SPA.
 *  2. El plugin de vite.config.js, que en el build genera un HTML estatico
 *     por ruta (dist/es/index.html, etc.).
 *
 * El punto 2 es el importante: WhatsApp, Facebook y X no ejecutan
 * JavaScript, asi que solo leen las etiquetas que ya vienen en el HTML. Sin
 * eso, compartir la version en espanol mostraria la descripcion en ingles.
 *
 * Por eso aqui no puede haber imports de React ni nada de navegador.
 */

export const SITE_URL = 'https://www.infinitywatersite.com';
export const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`;

export const PAGE_META = {
  home: {
    path: { en: '/', es: '/es' },
    en: {
      title: 'Infinity Water | Water Filtration, Reverse Osmosis & Treatment in Florida',
      description:
        'Water filtration systems, reverse osmosis and well water treatment for homes in Naples, Fort Myers and Cape Coral. Free diagnosis, 24-hour installation, WQA certified.',
      ogTitle: 'Infinity Water | Professional Water Filtration & Treatment',
      ogDescription:
        'Free water diagnosis and 24-hour installation. Filtration, reverse osmosis, alkaline water and well treatment across Florida.',
    },
    es: {
      title: 'Infinity Water | Filtracion de Agua, Osmosis Inversa y Tratamiento en Florida',
      description:
        'Sistemas de filtracion de agua, osmosis inversa y tratamiento de pozo para hogares en Naples, Fort Myers y Cape Coral. Diagnostico gratis, instalacion en 24 horas, certificado WQA.',
      ogTitle: 'Infinity Water | Filtracion y Tratamiento de Agua Profesional',
      ogDescription:
        'Diagnostico de agua gratis e instalacion en 24 horas. Filtracion, osmosis inversa, agua alcalina y tratamiento de pozo en toda Florida.',
    },
  },
  privacy: {
    path: { en: '/privacy-policy', es: '/es/politica-de-privacidad' },
    noindex: false,
    en: {
      title: 'Privacy Policy | Infinity Water',
      description:
        'How Infinity Water collects, uses and protects the personal information you share with us through this website, phone calls and WhatsApp.',
    },
    es: {
      title: 'Politica de Privacidad | Infinity Water',
      description:
        'Como Infinity Water recopila, usa y protege la informacion personal que compartes con nosotros a traves de este sitio, llamadas y WhatsApp.',
    },
  },
  terms: {
    path: { en: '/terms-and-conditions', es: '/es/terminos-y-condiciones' },
    en: {
      title: 'Terms & Conditions | Infinity Water',
      description:
        'Terms governing the use of infinitywatersite.com and the Infinity Water SMS program operated by Global Innovation LLC d/b/a Infinity Water.',
    },
    es: {
      title: 'Terminos y Condiciones | Infinity Water',
      description:
        'Terminos que rigen el uso de infinitywatersite.com y el programa de SMS de Infinity Water, operado por Global Innovation LLC d/b/a Infinity Water.',
    },
  },
  freeWaterTest: {
    path: { en: '/free-water-test', es: '/es/analisis-de-agua-gratis' },
    en: {
      title: 'Free Water Test | Infinity Water',
      description:
        'Request your free home water analysis in Florida. Tell us whether your home uses well water or city water and we will coordinate the visit. No obligation to purchase.',
      ogTitle: 'Request your free home water analysis',
      ogDescription:
        'Free water test for homes in Florida. Well water or city water, we will tell you exactly what is in it.',
    },
    es: {
      title: 'Analisis de Agua Gratis | Infinity Water',
      description:
        'Solicita tu analisis de agua gratuito en casa en Florida. Dinos si tu hogar recibe agua de pozo o de ciudad y coordinamos la visita. Sin compromiso de compra.',
      ogTitle: 'Solicita tu analisis de agua gratuito',
      ogDescription:
        'Analisis de agua gratis para hogares en Florida. Agua de pozo o de ciudad, te decimos exactamente que contiene.',
    },
  },
  contact: {
    path: { en: '/contact', es: '/es/contacto' },
    en: {
      title: 'Contact | Infinity Water',
      description:
        'Contact Infinity Water in Fort Myers, Florida. Phone, email and address for water filtration, reverse osmosis and well water treatment.',
    },
    es: {
      title: 'Contacto | Infinity Water',
      description:
        'Contacta con Infinity Water en Fort Myers, Florida. Telefono, correo y direccion para filtracion de agua, osmosis inversa y tratamiento de pozo.',
    },
  },
  notFound: {
    // No entra en el sitemap ni en el build estatico: solo se resuelve en
    // el navegador cuando el router no reconoce la URL.
    path: { en: '/', es: '/es' },
    noindex: true,
    en: { title: 'Page not found | Infinity Water', description: 'The page you are looking for does not exist.' },
    es: { title: 'Pagina no encontrada | Infinity Water', description: 'La pagina que buscas no existe.' },
  },
};

/** Metadatos resueltos de una pagina, con los campos og rellenados. */
export function getPageMeta(routeKey, language) {
  const page = PAGE_META[routeKey] ?? PAGE_META.notFound;
  const lang = page[language] ? language : 'en';
  const meta = page[lang];

  return {
    lang,
    title: meta.title,
    description: meta.description,
    ogTitle: meta.ogTitle ?? meta.title,
    ogDescription: meta.ogDescription ?? meta.description,
    canonical: `${SITE_URL}${page.path[lang] === '/' ? '/' : page.path[lang]}`,
    alternates: Object.entries(page.path).map(([code, path]) => ({
      hrefLang: code,
      href: `${SITE_URL}${path === '/' ? '/' : path}`,
    })),
    noindex: Boolean(page.noindex),
  };
}

/** Todas las combinaciones ruta/idioma. Lo usan el sitemap y el build. */
export function listAllPages() {
  return Object.entries(PAGE_META)
    .filter(([, page]) => !page.noindex)
    .flatMap(([routeKey, page]) =>
      Object.keys(page.path).map((language) => ({
        routeKey,
        language,
        path: page.path[language],
        ...getPageMeta(routeKey, language),
      }))
    );
}
