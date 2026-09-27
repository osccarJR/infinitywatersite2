/**
 * Mapa de rutas por idioma.
 *
 * Ingles en la raiz y espanol bajo /es, cada uno con su URL indexable y su
 * hreflang. Las rutas en ingles de privacy, terms, sms-policy,
 * free-water-test y contact estan declaradas en el registro A2P 10DLC: no
 * renombrarlas sin actualizar el registro.
 *
 * Las paginas de contenido (servicios, problemas, ciudades, guias) no se
 * declaran aqui una a una: salen de web/data/pages/*.ts.
 */
import type { ContentPage, Lang, PageKind } from '../data/types';

export const LANGS: Lang[] = ['en', 'es'];
export const DEFAULT_LANG: Lang = 'en';

export const STATIC_ROUTES = {
  home: { en: '/', es: '/es' },
  freeWaterTest: { en: '/free-water-test', es: '/es/analisis-de-agua-gratis' },
  thanks: { en: '/thank-you', es: '/es/gracias' },
  contact: { en: '/contact', es: '/es/contacto' },
  services: { en: '/services', es: '/es/servicios' },
  areas: { en: '/areas', es: '/es/zonas' },
  privacy: { en: '/privacy-policy', es: '/es/politica-de-privacidad' },
  terms: { en: '/terms-and-conditions', es: '/es/terminos-y-condiciones' },
  smsPolicy: { en: '/sms-policy', es: '/es/politica-de-sms' },
  // Paginas de aterrizaje para anuncios: sin menu y noindex (ver LandingView).
  lpSmell: { en: '/l/rotten-egg-smell', es: '/es/l/olor-a-huevo' },
  lpIron: { en: '/l/iron-stains', es: '/es/l/manchas-de-hierro' },
  lpTest: { en: '/l/free-water-test', es: '/es/l/analisis-gratis' },
  // Resenas: pagina para el cliente y tarjeta imprimible con QR (noindex).
  review: { en: '/review', es: '/es/resena' },
  reviewCard: { en: '/review-card', es: '/es/tarjeta-resena' },
} as const satisfies Record<string, Record<Lang, string>>;

export type StaticKey = keyof typeof STATIC_ROUTES;

/** Paginas que no se indexan ni entran en el sitemap. */
export const NOINDEX_KEYS: StaticKey[] = ['thanks', 'lpSmell', 'lpIron', 'lpTest', 'review', 'reviewCard'];
export const LANDING_KEYS = ['lpSmell', 'lpIron', 'lpTest'] as const;
export type LandingKey = (typeof LANDING_KEYS)[number];

const PREFIX: Record<PageKind, Record<Lang, string>> = {
  service: { en: '/services/', es: '/es/servicios/' },
  problem: { en: '/problems/', es: '/es/problemas/' },
  city: { en: '/areas/', es: '/es/zonas/' },
  guide: { en: '/', es: '/es/' },
  company: { en: '/', es: '/es/' },
};

/** Todas las paginas de contenido, recogidas de web/data/pages/*.ts. */
const modules = import.meta.glob<Record<string, unknown>>('../data/pages/*.ts', { eager: true });

export const CONTENT_PAGES: ContentPage[] = Object.values(modules).flatMap((mod) =>
  Object.values(mod).filter(Array.isArray).flat()
) as ContentPage[];

const CONTENT_BY_KEY = new Map(CONTENT_PAGES.map((page) => [page.key, page]));

export const getContentPage = (key: string) => CONTENT_BY_KEY.get(key);

export const pagesOfKind = (kind: PageKind) => CONTENT_PAGES.filter((page) => page.kind === kind);

export function contentPath(page: ContentPage, lang: Lang) {
  return PREFIX[page.kind][lang] + page.slug[lang];
}

/**
 * Ruta de cualquier pagina (estatica o de contenido) en un idioma. Si la
 * clave no existe devuelve la portada: un enlace roto nunca debe romper el
 * build, pero `npm run test:smoke` avisa de los enlaces a paginas que faltan.
 */
export function pathFor(key: string, lang: Lang): string {
  if (key in STATIC_ROUTES) return STATIC_ROUTES[key as StaticKey][lang];
  const page = CONTENT_BY_KEY.get(key);
  return page ? contentPath(page, lang) : STATIC_ROUTES.home[lang];
}

export const hasPage = (key: string) => key in STATIC_ROUTES || CONTENT_BY_KEY.has(key);

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');
