/**
 * Esquema de las paginas de contenido (servicios, problemas, ciudades,
 * guias y paginas de empresa).
 *
 * Cada pagina es un objeto con su version en ingles y en espanol. El diseno
 * lo pone la plantilla (web/views/ContentView.astro): aqui solo va el texto
 * organizado en bloques, para que cambiar un texto nunca obligue a tocar
 * marcado.
 */

export type Lang = 'en' | 'es';

/**
 * Iconos disponibles (nombres de lucide-static). Si hace falta otro, se
 * anade aqui y en web/components/Icon.astro.
 */
export type IconName =
  | 'Droplet'
  | 'Droplets'
  | 'Waves'
  | 'Home'
  | 'Building2'
  | 'Wrench'
  | 'Filter'
  | 'FlaskConical'
  | 'TestTube'
  | 'ShieldCheck'
  | 'Shield'
  | 'Sparkles'
  | 'Wind'
  | 'CloudRain'
  | 'CloudLightning'
  | 'ThermometerSun'
  | 'Leaf'
  | 'HeartHandshake'
  | 'Users'
  | 'BadgeCheck'
  | 'Clock'
  | 'CalendarCheck'
  | 'ClipboardCheck'
  | 'FileText'
  | 'MessageCircle'
  | 'Phone'
  | 'MapPin'
  | 'Map'
  | 'DollarSign'
  | 'CreditCard'
  | 'Gauge'
  | 'Zap'
  | 'Recycle'
  | 'Shirt'
  | 'Bath'
  | 'CookingPot'
  | 'GlassWater'
  | 'Baby'
  | 'Flag'
  | 'Award'
  | 'Search'
  | 'AlertTriangle'
  | 'CircleCheck'
  | 'CircleX'
  | 'Info'
  | 'Hammer'
  | 'Settings'
  | 'Package'
  | 'Truck'
  | 'Languages'
  | 'Scale';

export type Block =
  /** Texto corrido. */
  | { type: 'prose'; heading?: string; paragraphs: string[] }
  /** Rejilla de tarjetas con icono. 2 a 6 elementos. */
  | {
      type: 'features';
      heading: string;
      intro?: string;
      items: { icon: IconName; title: string; text: string }[];
    }
  /** Pasos numerados de un proceso. 3 a 6 elementos. */
  | { type: 'steps'; heading: string; intro?: string; items: { title: string; text: string }[] }
  /**
   * Datos duros con fuente (p. ej. el reporte oficial de calidad del agua).
   * `source` es obligatorio si las cifras vienen de un tercero.
   */
  | {
      type: 'facts';
      /** Etiqueta sobre el titulo. Por defecto "Datos oficiales". */
      kicker?: string;
      heading: string;
      intro?: string;
      items: { label: string; value: string; detail?: string }[];
      source?: { label: string; url: string };
    }
  /** Lista de senales o sintomas, con check. */
  | { type: 'signs'; heading: string; intro?: string; items: string[] }
  /** Aviso destacado. */
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; title: string; text: string }
  /** Tabla comparativa de dos columnas. */
  | {
      type: 'compare';
      heading: string;
      intro?: string;
      columns: [string, string];
      rows: { label: string; values: [string, string] }[];
    }
  /** Preguntas frecuentes (se renderizan con <details>). */
  | { type: 'faq'; heading: string; items: { q: string; a: string }[] }
  /** Banda intermedia que lleva al analisis gratis. */
  | { type: 'cta'; title: string; text: string };

export type LocalizedContent = {
  /** <title>, maximo ~60 caracteres. */
  metaTitle: string;
  /** Meta description, 140-160 caracteres. */
  metaDescription: string;
  /** Texto pequeno sobre el titulo. */
  eyebrow: string;
  /** H1. */
  title: string;
  /** Entradilla bajo el H1 (1-3 frases). */
  lead: string;
  /** 3 puntos cortos que se muestran en la cabecera. */
  highlights: string[];
  blocks: Block[];
};

export type PageKind = 'service' | 'problem' | 'city' | 'guide' | 'company';

/** Imagenes ilustrativas disponibles (web/assets/photos). */
export type PhotoName = 'family' | 'smell' | 'stains' | 'contaminants';

export type ContentPage = {
  /** Identificador unico, en ingles y kebab-case. */
  key: string;
  kind: PageKind;
  /** Ultimo segmento de la URL en cada idioma, sin barras ni tildes. */
  slug: Record<Lang, string>;
  icon: IconName;
  photo?: PhotoName;
  /** Claves de otras paginas relacionadas (2-4). */
  related: string[];
  en: LocalizedContent;
  es: LocalizedContent;
};
