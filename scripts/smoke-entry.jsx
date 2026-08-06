/**
 * Prueba de humo: renderiza cada ruta del sitio en Node.
 *
 * Detecta errores reales de ejecucion (imports rotos, componentes
 * indefinidos, hooks mal usados) que el build de Vite no ve, porque solo
 * aparecen al renderizar.
 *
 * Ademas comprueba los requisitos de A2P 10DLC que se pueden verificar
 * sobre el HTML: identidad legal, direccion, punto unico de captura y
 * enlaces legales visibles. Son justo las cosas que se rompen sin que nadie
 * se de cuenta al editar un texto.
 *
 * Se ejecuta con `npm run test:smoke`.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from '../src/App.jsx';
import { LanguageProvider } from '../src/i18n/LanguageProvider.jsx';

const render = (path) =>
  renderToString(
    <StaticRouter location={path}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StaticRouter>
  );

const routes = [
  { path: '/', expect: ['Pure Water', 'Global Innovation LLC'] },
  { path: '/es', expect: ['Agua Pura', 'Global Innovation LLC'] },
  { path: '/privacy-policy', expect: ['Privacy Policy', 'SMS and mobile information', 'g.innovar@gmail.com'] },
  { path: '/es/politica-de-privacidad', expect: ['Politica de Privacidad', 'SMS e informacion movil', 'SMS and mobile information'] },
  { path: '/terms-and-conditions', expect: ['Terms and Conditions', 'SMS program description', 'Reply STOP'] },
  { path: '/es/terminos-y-condiciones', expect: ['Terminos y Condiciones', 'Descripcion del programa de SMS'] },
  { path: '/sms-policy', expect: ['SMS Policy', 'Reply STOP', 'Consent is optional'] },
  { path: '/es/politica-de-sms', expect: ['Politica de SMS', 'El consentimiento es opcional', 'SMS Policy'] },
  { path: '/free-water-test', expect: ['Request your free home water analysis', 'api.dejavuia.com/widget/form/'] },
  { path: '/es/analisis-de-agua-gratis', expect: ['Solicita tu analisis de agua gratuito', 'api.dejavuia.com/widget/form/'] },
  { path: '/contact', expect: ['Contact Infinity Water', '3940 Metro Pkwy.'] },
  { path: '/es/contacto', expect: ['Contacta con Infinity Water', '3940 Metro Pkwy.'] },
  { path: '/ruta-que-no-existe', expect: ['404', 'Page not found'] },
  { path: '/es/ruta-que-no-existe', expect: ['404', 'Pagina no encontrada'] },
];

let failed = 0;
const html = {};

console.log('\nRutas');
for (const route of routes) {
  try {
    const output = render(route.path);
    html[route.path] = output;

    const missing = route.expect.filter((needle) => !output.includes(needle));
    if (missing.length) {
      failed++;
      console.log(`  FAIL  ${route.path.padEnd(32)} falta: ${missing.join(' | ')}`);
    } else {
      console.log(`  ok    ${route.path.padEnd(32)} ${String(output.length).padStart(7)} bytes`);
    }
  } catch (error) {
    failed++;
    console.log(`  ERROR ${route.path.padEnd(32)} ${error.message}`);
  }
}

const home = html['/'] ?? '';
const form = html['/free-water-test'] ?? '';
const privacy = html['/privacy-policy'] ?? '';
const terms = html['/terms-and-conditions'] ?? '';
const sms = html['/sms-policy'] ?? '';
const every = Object.values(html);

const checks = [
  // --- Contenido del negocio ---
  ['sin la cifra antigua de 5000 clientes', !home.includes('5,000') && !home.includes('5000')],
  ['1,000 hogares en todas las secciones', home.includes('1,000')],
  ['horario 24/7 unificado', home.includes('Open 24 hours')],
  ['sin testimonios inventados', !home.includes('Maria Gonzalez') && !home.includes('Carlos Martinez')],
  ['sin PNG pesados de servicios', !home.includes('.png')],
  ['sin imagenes enlazadas de unsplash', !home.includes('unsplash')],
  ['compensacion del header fijo', home.includes('pt-20')],

  // --- Identidad A2P ---
  ['entidad legal en el pie de todas las paginas', [home, form, privacy, terms, sms].every((page) => page.includes('Global Innovation LLC d/b/a Infinity Water'))],
  ['direccion exacta 3940 Metro Pkwy.', home.includes('3940 Metro Pkwy.')],
  ['ninguna referencia al numero de calle antiguo', !every.some((page) => page.includes('3949'))],
  ['correo comercial publicado', home.includes('g.innovar@gmail.com')],
  ['telefono de soporte publicado', home.includes('(475) 685-8464')],
  ['sin numero SMS falso mientras no se asigne', !home.includes('Text/SMS:')],

  // --- Punto unico de captura: el formulario de GoHighLevel ---
  ['formulario de GoHighLevel incrustado', form.includes('api.dejavuia.com/widget/form/LgLxNfMMaa7apAp6aDB4')],
  ['ningun formulario propio que pida telefono', !every.some((page) => /<input[^>]*type="tel"/.test(page))],
  ['sin casillas de consentimiento propias', !every.some((page) => page.includes('sms_consent_'))],
  ['un solo iframe de formulario en todo el sitio', every.filter((page) => page.includes('widget/form/')).length === 2],

  // --- Los tres enlaces legales que pidio Deja Vu IA ---
  ['Privacy, Terms y SMS Policy visibles en el formulario', ['/privacy-policy', '/terms-and-conditions', '/sms-policy'].every((path) => form.includes(path))],
  ['aviso de que el consentimiento SMS es opcional', form.includes('optional and is not required to submit this form')],

  // --- Clausulas que revisa la operadora ---
  ['clausula de no compartir opt-in SMS', privacy.includes('are not shared with third parties or affiliates for their own marketing')],
  ['clausula de no venta de consentimiento', privacy.includes('We do not sell, rent, or transfer SMS consent to third parties')],
  ['STOP y HELP en los terminos', terms.includes('Reply STOP') && terms.includes('Reply HELP')],
  ['consentimiento no condiciona la compra', terms.includes('not a condition of purchasing any product or service')],
  ['la politica de SMS describe las dos casillas', sms.includes('non-marketing messages') && sms.includes('recurring marketing messages')],
  ['ingles disponible en la ruta legal en espanol', (html['/es/politica-de-privacidad'] ?? '').includes('SMS and mobile information')],

  // --- Enlaces legales globales ---
  ['pie con los cinco enlaces legales', ['/privacy-policy', '/terms-and-conditions', '/sms-policy', '/contact', '/free-water-test'].every((path) => home.includes(path))],
];

console.log('\nContenido y cumplimiento A2P');
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${label}`);
}

console.log(failed ? `\n${failed} comprobacion(es) fallidas\n` : '\nTodo correcto\n');
process.exit(failed ? 1 : 0);
