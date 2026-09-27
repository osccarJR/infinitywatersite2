/**
 * Sitemap con alternates hreflang, generado de las mismas rutas que las
 * paginas: no puede quedarse desfasado.
 */
import type { APIRoute } from 'astro';
import { CONTENT_PAGES, NOINDEX_KEYS, STATIC_ROUTES, contentPath, type StaticKey } from '../i18n/routes';
import { SITE_URL } from '../config/business';
import type { Lang } from '../data/types';

const PRIORITY: Partial<Record<string, string>> = {
  home: '1.0',
  freeWaterTest: '0.9',
  'well-water': '0.9',
  'city-water': '0.8',
};

export const GET: APIRoute = () => {
  const entries: { key: string; paths: Record<Lang, string> }[] = [
    ...(Object.keys(STATIC_ROUTES) as StaticKey[])
      .filter((key) => !NOINDEX_KEYS.includes(key))
      .map((key) => ({ key, paths: STATIC_ROUTES[key] })),
    ...CONTENT_PAGES.map((page) => ({ key: page.key, paths: { en: contentPath(page, 'en'), es: contentPath(page, 'es') } })),
  ];

  const urls = entries.flatMap(({ key, paths }) =>
    (['en', 'es'] as Lang[]).map((lang) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${paths[lang]}</loc>`,
        `    <xhtml:link rel="alternate" hreflang="en-US" href="${SITE_URL}${paths.en}" />`,
        `    <xhtml:link rel="alternate" hreflang="es-US" href="${SITE_URL}${paths.es}" />`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${paths.en}" />`,
        `    <priority>${PRIORITY[key] ?? '0.6'}</priority>`,
        '  </url>',
      ].join('\n')
    )
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
