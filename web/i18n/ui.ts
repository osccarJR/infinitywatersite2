/**
 * Textos compartidos de la interfaz (menu, botones, pie).
 *
 * Los textos propios de cada pagina viven en su vista o en web/data/pages.
 * Regla: todo texto nuevo se escribe en los dos idiomas en el mismo sitio.
 */
import type { Lang } from '../data/types';
import { FOUNDER_YEARS } from '../config/business';

export const UI = {
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close menu',
    langSwitch: 'Español',
    langSwitchLabel: 'Ver esta página en español',
    nav: {
      wellWater: 'Well water',
      cityWater: 'City water',
      services: 'Services',
      areas: 'Service areas',
      about: 'About us',
      faq: 'FAQ',
      financing: 'Financing',
      contact: 'Contact',
    },
    menuGroups: {
      services: 'Services',
      problems: 'Common problems',
      areas: 'Where we work',
      company: 'Company',
    },
    cta: {
      freeTest: 'Get my free water test',
      freeTestShort: 'Free water test',
      whatsapp: 'WhatsApp us',
      whatsappShort: 'WhatsApp',
      call: 'Call',
      callNow: 'Call now',
    },
    trust: {
      years: `${FOUNDER_YEARS}+ years of experience`,
      wells: 'Well water specialists',
      usa: 'Made in USA equipment',
      bilingual: 'We speak Spanish & English',
      financing: 'Financing available',
      noPressure: 'No pressure, no obligation',
    },
    footer: {
      tagline:
        'Family-owned water treatment for Southwest Florida homes. We test your water for free, explain it in plain language and only recommend what you really need.',
      explore: 'Explore',
      help: 'Help',
      contact: 'Contact',
      hours: 'Hours',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      smsPolicy: 'SMS Policy',
      support: 'Customer support',
      sms: 'Text/SMS',
      rights: 'All rights reserved.',
      madeBy: 'Designed and built by',
    },
    langBanner: {
      text: '¿Prefieres ver el sitio en español?',
      action: 'Ver en español',
      dismiss: 'Cerrar',
    },
  },
  es: {
    skip: 'Saltar al contenido',
    menu: 'Menú',
    close: 'Cerrar menú',
    langSwitch: 'English',
    langSwitchLabel: 'View this page in English',
    nav: {
      wellWater: 'Agua de pozo',
      cityWater: 'Agua de ciudad',
      services: 'Servicios',
      areas: 'Zonas',
      about: 'Nosotros',
      faq: 'Preguntas',
      financing: 'Financiamiento',
      contact: 'Contacto',
    },
    menuGroups: {
      services: 'Servicios',
      problems: 'Problemas comunes',
      areas: 'Dónde trabajamos',
      company: 'La empresa',
    },
    cta: {
      freeTest: 'Quiero mi análisis gratis',
      freeTestShort: 'Análisis gratis',
      whatsapp: 'Escríbenos por WhatsApp',
      whatsappShort: 'WhatsApp',
      call: 'Llamar',
      callNow: 'Llámanos',
    },
    trust: {
      years: `Más de ${FOUNDER_YEARS} años de experiencia`,
      wells: 'Especialistas en agua de pozo',
      usa: 'Equipos hechos en EE. UU.',
      bilingual: 'Te atendemos en español',
      financing: 'Financiamiento disponible',
      noPressure: 'Sin presión y sin compromiso',
    },
    footer: {
      tagline:
        'Empresa familiar de tratamiento de agua para los hogares del suroeste de Florida. Analizamos tu agua gratis, te la explicamos claro y solo te recomendamos lo que de verdad necesitas.',
      explore: 'Explora',
      help: 'Ayuda',
      contact: 'Contacto',
      hours: 'Horario',
      legal: 'Legal',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones',
      smsPolicy: 'Política de SMS',
      support: 'Atención al cliente',
      sms: 'Texto/SMS',
      rights: 'Todos los derechos reservados.',
      madeBy: 'Diseñado y desarrollado por',
    },
    langBanner: {
      text: 'Prefer to browse in English?',
      action: 'View in English',
      dismiss: 'Close',
    },
  },
} satisfies Record<Lang, unknown>;

export type UiText = (typeof UI)['en'];
export const t = (lang: Lang): UiText => UI[lang];
