/**
 * Prueba de humo sobre el sitio YA COMPILADO (dist/).
 *
 * Revisa el HTML real que sirve nginx, que es lo que ven Google, WhatsApp y
 * el revisor de la campana A2P:
 *  - requisitos A2P (identidad, direccion, rutas legales, clausulas, punto
 *    unico de captura),
 *  - SEO basico por pagina (lang, canonical, hreflang, un solo h1),
 *  - enlaces internos rotos,
 *  - afirmaciones que el sitio no debe volver a publicar,
 *  - espanol sin tildes en las paginas /es.
 *
 * Uso: npm run build && npm run test:smoke
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!existsSync(dist)) {
  console.error('No existe dist/. Ejecuta primero `npm run build`.');
  process.exit(1);
}

const LEGAL_ENTITY_DBA = 'GLOBAL INNOVATION GROUP INFINITY LLC d/b/a Infinity Water';
const ADDRESS = '3940 Metro Pkwy.';

/* ------------------------------ utilidades ------------------------------ */

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const htmlFiles = walk(dist).filter((file) => file.endsWith('.html'));
const routeOf = (file) => {
  const rel = '/' + path.relative(dist, file).replace(/\\/g, '/');
  if (rel === '/index.html') return '/';
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
};
const pages = new Map(htmlFiles.map((file) => [routeOf(file), readFileSync(file, 'utf8')]));
const page = (route) => pages.get(route) ?? '';
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

let failed = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${label}${!ok && detail ? `  → ${detail}` : ''}`);
};

/* ------------------------------ rutas A2P ------------------------------ */

console.log(`\n${pages.size} paginas HTML en dist/\n\nRutas declaradas en el registro A2P`);
const a2pRoutes = [
  ['/', ['Clean water.', LEGAL_ENTITY_DBA]],
  ['/es', ['Agua limpia.', LEGAL_ENTITY_DBA]],
  ['/privacy-policy', ['Privacy Policy', 'SMS and mobile information', 'g.innovar@gmail.com']],
  ['/es/politica-de-privacidad', ['Política de Privacidad', 'SMS and mobile information']],
  ['/terms-and-conditions', ['Terms and Conditions', 'SMS program description', 'Reply STOP']],
  ['/es/terminos-y-condiciones', ['Términos y Condiciones', '18 years of age or older']],
  ['/sms-policy', ['SMS Policy', 'Reply STOP', 'Consent is optional']],
  ['/es/politica-de-sms', ['Política de SMS', 'SMS Policy']],
  ['/free-water-test', ['Request your free home water analysis', 'api.dejavuia.com/widget/form/LgLxNfMMaa7apAp6aDB4']],
  ['/es/analisis-de-agua-gratis', ['Solicita tu análisis de agua gratuito', 'api.dejavuia.com/widget/form/LgLxNfMMaa7apAp6aDB4']],
  ['/contact', ['Contact Infinity Water', ADDRESS]],
  ['/es/contacto', ['Contáctanos', ADDRESS]],
];
for (const [route, needles] of a2pRoutes) {
  const html = page(route);
  const missing = needles.filter((needle) => !html.includes(needle));
  check(`${route.padEnd(30)} ${html ? '' : '(no existe)'}`, html && missing.length === 0, missing.join(' | '));
}

/* --------------------------- identidad y captura --------------------------- */

console.log('\nIdentidad y punto unico de captura');
const all = [...pages.entries()];
const content = all.filter(([route]) => route !== '/404');
check('entidad legal y direccion en todas las paginas', content.every(([, html]) => html.includes(LEGAL_ENTITY_DBA) && html.includes(ADDRESS)),
  content.filter(([, html]) => !html.includes(LEGAL_ENTITY_DBA)).map(([r]) => r).join(', '));
check('ningun formulario propio que pida telefono', !all.some(([, html]) => /<input[^>]*type="tel"/.test(html)));
check('el formulario de GoHighLevel solo en las 2 paginas de captura',
  all.filter(([, html]) => html.includes('widget/form/')).map(([r]) => r).sort().join(',') === '/es/analisis-de-agua-gratis,/free-water-test');
check('enlaces legales antes del formulario', ['/free-water-test', '/es/analisis-de-agua-gratis'].every((route) => {
  const html = page(route);
  const iframe = html.indexOf('<iframe');
  const pos = (href) => html.indexOf(`href="${href}"`);
  const legal = route.startsWith('/es')
    ? ['/es/politica-de-privacidad', '/es/terminos-y-condiciones', '/es/politica-de-sms']
    : ['/privacy-policy', '/terms-and-conditions', '/sms-policy'];
  return legal.every((href) => pos(href) > -1 && pos(href) < iframe);
}));
check('aviso de consentimiento SMS opcional', page('/free-water-test').includes('optional and is not required to submit this form'));
check('pie con los cinco enlaces legales en la portada', ['/privacy-policy', '/terms-and-conditions', '/sms-policy', '/contact', '/free-water-test'].every((href) => page('/').includes(`href="${href}"`)));

console.log('\nClausulas que revisa la operadora');
const privacy = page('/privacy-policy');
const terms = page('/terms-and-conditions');
const sms = page('/sms-policy');
check('no se comparte el opt-in de SMS', privacy.includes('are not shared with third parties or affiliates for their own marketing'));
check('no se vende el consentimiento', privacy.includes('We do not sell, rent, or transfer SMS consent to third parties'));
check('STOP y HELP en los terminos', terms.includes('Reply STOP') && terms.includes('Reply HELP'));
check('el consentimiento no condiciona la compra', terms.includes('not a condition of purchasing any product or service'));
check('requisito de edad 18+', terms.includes('available only to individuals who are 18 years of age or older'));
check('la politica de SMS describe las dos casillas', sms.includes('non-marketing messages') && sms.includes('recurring marketing messages'));

/* --------------------------------- SEO --------------------------------- */

console.log('\nSEO por pagina');
const seoProblems = [];
for (const [route, html] of content) {
  const es = route === '/es' || route.startsWith('/es/');
  if (!html.includes(`<html lang="${es ? 'es' : 'en'}"`)) seoProblems.push(`${route}: lang`);
  if (!/<link rel="canonical"/.test(html)) seoProblems.push(`${route}: canonical`);
  if (!html.includes('hreflang="es-US"') || !html.includes('hreflang="en-US"')) seoProblems.push(`${route}: hreflang`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) seoProblems.push(`${route}: ${h1} h1`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  if (!title || title.length > 75) seoProblems.push(`${route}: title de ${title.length} caracteres`);
}
check('lang, canonical, hreflang, un h1 y title en cada pagina', seoProblems.length === 0, seoProblems.slice(0, 8).join('; '));
check('sitemap.xml y robots.txt', existsSync(path.join(dist, 'sitemap.xml')) && existsSync(path.join(dist, 'robots.txt')));
check('404 propia', existsSync(path.join(dist, '404.html')));
check('pagina de gracias fuera de indice', page('/thank-you').includes('noindex') && page('/es/gracias').includes('noindex'));

/* ----------------------------- enlaces rotos ----------------------------- */

console.log('\nEnlaces internos');
const broken = new Set();
for (const [route, html] of all) {
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (href.startsWith('/_astro/')) continue;
    const clean = href.length > 1 ? href.replace(/\/$/, '') : href;
    const exists = pages.has(clean) || existsSync(path.join(dist, clean)) || existsSync(path.join(root, 'public', clean));
    if (!exists) broken.add(`${route} → ${href}`);
  }
}
check('ningun enlace interno roto', broken.size === 0, [...broken].slice(0, 10).join('; '));

/* ------------------------ afirmaciones prohibidas ------------------------ */

console.log('\nAfirmaciones que no deben volver');
const forbidden = [
  ['sello BBB (perfil: no acreditada)', /cert-bbb|BBB Accredited|A\+ Rating|Rating BBB/i],
  ['"10+ anos" / decada de la empresa', /10\+ (years|años)|over a decade|más de una década/i],
  ['cifra de clientes sin respaldo', /1,000\+|5,000|1000\+ (homes|hogares|familias)/i],
  ['urgencia falsa', /only \d+ spots|quedan \d+ cupos|next \d+ customers|próximos \d+ clientes|only this week|solo esta semana/i],
  ['"elimina el 99%"', /99(\.9)?\s?%/],
  ['garantia de por vida / anos de garantia', /lifetime warranty|garantía de por vida|\d+[- ]year warranty|\d+ años de garantía/i],
  ['beneficios de salud del agua alcalina', /better hydration|mejor hidratación|detox|antioxidant/i],
  ['"WQA Certified" (el sello es de miembro)', /WQA Certified|certificad[oa]s? (por la )?WQA/i],
  ['razon social o direccion antiguas', /Global Innovation LLC|3949 Metro/i],
  ['cuotas o tasas de financiamiento', /\$\d+\s?\/\s?(mo|mes)|0\s?% APR/i],
];
for (const [label, re] of forbidden) {
  // El sello BBB se busca en el HTML completo (va en el src de una imagen).
  const hits = all.filter(([, html]) => re.test(label.startsWith('sello') ? html : text(html))).map(([r]) => r);
  check(label, hits.length === 0, hits.slice(0, 5).join(', '));
}

/* ------------------------------- espanol ------------------------------- */

console.log('\nEspanol');
const unaccented = /\b(Analisis|analisis|Politica|politica|Terminos|informacion|telefono|Telefono|mas alla|tambien|Contactanos|anos de experiencia|Diagnostico|instalacion|garantia|Ubicacion)\b/;
const spanishIssues = all
  .filter(([route]) => route === '/es' || route.startsWith('/es/'))
  .flatMap(([route, html]) => {
    // Las paginas legales en /es incluyen el texto oficial en ingles: solo se
    // revisa la parte en espanol (antes de "Versión en inglés").
    const body = text(html).split('Versión en inglés')[0];
    const match = body.match(unaccented);
    return match ? [`${route}: "${match[0]}"`] : [];
  });
check('sin palabras frecuentes sin tilde en /es', spanishIssues.length === 0, spanishIssues.slice(0, 8).join('; '));

/* ------------------------------- resultado ------------------------------- */

console.log(failed ? `\n${failed} comprobacion(es) fallidas\n` : '\nTodo correcto\n');
process.exit(failed ? 1 : 0);
