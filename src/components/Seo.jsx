import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMeta, OG_IMAGE } from '../i18n/seo';
import { trackPageView } from '../lib/analytics';

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertLink(rel, href, extra = {}) {
  const selectorParts = [`link[rel="${rel}"]`];
  if (extra.hreflang) selectorParts.push(`[hreflang="${extra.hreflang}"]`);

  let element = document.head.querySelector(selectorParts.join(''));
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    Object.entries(extra).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Sincroniza title, description, canonical, hreflang, Open Graph y el
 * atributo lang del <html> con la ruta activa.
 *
 * El HTML que sirve el servidor ya trae estos valores correctos para cada
 * ruta (los genera el plugin de vite.config.js). Esto los mantiene al dia
 * cuando el usuario navega dentro de la SPA, donde no hay recarga.
 */
export default function Seo({ routeKey, language }) {
  const location = useLocation();
  const meta = getPageMeta(routeKey, language);

  useEffect(() => {
    document.documentElement.lang = meta.lang;
    document.title = meta.title;

    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
    upsertLink('canonical', meta.canonical);

    meta.alternates.forEach(({ hrefLang, href }) => {
      upsertLink('alternate', href, { hreflang: hrefLang });
    });
    upsertLink('alternate', meta.alternates[0].href, { hreflang: 'x-default' });

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.ogTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.ogDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: meta.canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: OG_IMAGE });
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: meta.lang === 'es' ? 'es_US' : 'en_US',
    });

    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.ogTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.ogDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: OG_IMAGE });

    if (meta.noindex) {
      upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex,follow' });
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }
  }, [routeKey, language, meta]);

  // GA4 no detecta los cambios de ruta de una SPA por su cuenta.
  useEffect(() => {
    trackPageView(location.pathname, meta.title);
  }, [location.pathname, meta.title]);

  return null;
}
