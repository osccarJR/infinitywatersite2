/**
 * Nombres cortos de cada pagina para menus, tarjetas y migas de pan.
 * El titulo (H1) de cada pagina es largo a proposito; aqui va el nombre
 * con el que la gente la busca.
 */
import type { ContentPage, Lang } from './types';

const LABELS: Record<string, Record<Lang, string>> = {
  'well-water': { en: 'Well water', es: 'Agua de pozo' },
  'city-water': { en: 'City water', es: 'Agua de ciudad' },
  'hurricane-well-care': { en: 'Well care after a hurricane', es: 'Pozo después del huracán' },
  'rotten-egg-smell': { en: 'Rotten-egg smell', es: 'Olor a huevo podrido' },
  'iron-stains': { en: 'Iron & rust stains', es: 'Manchas de hierro' },
  'chlorine-taste': { en: 'Chlorine taste & smell', es: 'Sabor a cloro' },
  'hard-water': { en: 'Hard water & scale', es: 'Agua dura y sarro' },
  'whole-house-filtration': { en: 'Whole-house filtration', es: 'Filtración para toda la casa' },
  'well-water-systems': { en: 'Well water systems', es: 'Sistemas para agua de pozo' },
  'reverse-osmosis': { en: 'Reverse osmosis', es: 'Ósmosis inversa' },
  maintenance: { en: 'Maintenance & plumbing', es: 'Mantenimiento y plomería' },
  'fort-myers': { en: 'Fort Myers', es: 'Fort Myers' },
  'cape-coral': { en: 'Cape Coral', es: 'Cape Coral' },
  'lehigh-acres': { en: 'Lehigh Acres', es: 'Lehigh Acres' },
  naples: { en: 'Naples & Golden Gate', es: 'Naples y Golden Gate' },
  'bonita-springs-estero': { en: 'Bonita Springs & Estero', es: 'Bonita Springs y Estero' },
  about: { en: 'About us', es: 'Nosotros' },
  financing: { en: 'Financing', es: 'Financiamiento' },
  faq: { en: 'FAQ', es: 'Preguntas frecuentes' },
};

export const labelOf = (page: ContentPage, lang: Lang) => LABELS[page.key]?.[lang] ?? page[lang].eyebrow;
