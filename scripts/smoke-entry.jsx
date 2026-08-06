/**
 * Prueba de humo: renderiza cada ruta del sitio en Node.
 *
 * Detecta errores reales de ejecucion (imports rotos, componentes
 * indefinidos, hooks mal usados) que el build de Vite no ve, porque solo
 * aparecen al renderizar.
 *
 * Ademas comprueba los requisitos de A2P 10DLC que se pueden verificar
 * sobre el HTML: identidad legal, direccion, casillas de consentimiento
 * separadas y desmarcadas, y enlaces legales. Son justo las cosas que se
 * rompen sin que nadie se de cuenta al editar un texto.
 *
 * Se ejecuta con `npm run test:smoke`.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from '../src/App.jsx';
import { LanguageProvider } from '../src/i18n/LanguageProvider.jsx';
import { CONSENT_MARKETING, CONSENT_TRANSACTIONAL } from '../src/constants/consent.js';
import { CONSENT_VERSION } from '../src/constants/business.js';
import { buildLeadPayload } from '../src/lib/leadCapture.js';

const render = (path) =>
  renderToString(
    <StaticRouter location={path}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StaticRouter>
  );

const routes = [
  { path: '/', expect: ['Pure Water', 'Tell us about your water', 'Global Innovation LLC'] },
  { path: '/es', expect: ['Agua Pura', 'Cuentanos como esta tu agua', 'Global Innovation LLC'] },
  { path: '/privacy-policy', expect: ['Privacy Policy', 'SMS and mobile information', 'g.innovar@gmail.com'] },
  { path: '/es/politica-de-privacidad', expect: ['Politica de Privacidad', 'SMS e informacion movil', 'SMS and mobile information'] },
  { path: '/terms-and-conditions', expect: ['Terms and Conditions', 'SMS program description', 'Reply STOP'] },
  { path: '/es/terminos-y-condiciones', expect: ['Terminos y Condiciones', 'Descripcion del programa de SMS'] },
  { path: '/free-water-test', expect: ['Request your free home water analysis', 'Request My Free Water Analysis'] },
  { path: '/es/analisis-de-agua-gratis', expect: ['Solicita tu analisis de agua gratuito', 'Solicitar mi analisis gratuito'] },
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

/** Cuenta los <input type="checkbox"> que llegan marcados en el HTML servido. */
const checkedBoxes = (markup) =>
  (markup.match(/<input[^>]*type="checkbox"[^>]*checked[^>]*>/g) || []).length;

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
  ['entidad legal en el pie de todas las paginas', [home, form, privacy, terms].every((page) => page.includes('Global Innovation LLC d/b/a Infinity Water'))],
  ['direccion exacta 3940 Metro Pkwy.', home.includes('3940 Metro Pkwy.')],
  ['ninguna referencia al numero de calle antiguo', !Object.values(html).some((page) => page.includes('3949'))],
  ['correo comercial publicado', home.includes('g.innovar@gmail.com')],
  ['telefono de soporte publicado', home.includes('(475) 685-8464')],
  ['sin numero SMS falso mientras no se asigne', !home.includes('Text/SMS:')],

  // --- Consentimiento ---
  ['las dos casillas existen en el formulario', form.includes(CONSENT_TRANSACTIONAL.key) && form.includes(CONSENT_MARKETING.key)],
  ['ninguna casilla viene marcada por defecto', checkedBoxes(form) === 0],
  ['texto de consentimiento operativo completo', form.includes('non-marketing text messages')],
  ['texto de consentimiento promocional completo', form.includes('recurring marketing text messages')],
  ['aviso de que el consentimiento es opcional', form.includes('SMS consent is optional and is not required to submit the form')],
  ['enlaces a Privacy y Terms junto al formulario', form.includes('/privacy-policy') && form.includes('/terms-and-conditions')],

  // --- Clausulas que revisa la operadora ---
  ['clausula de no compartir opt-in SMS', privacy.includes('are not shared with third parties or affiliates for their own marketing')],
  ['clausula de no venta de consentimiento', privacy.includes('We do not sell, rent, or transfer SMS consent to third parties')],
  ['STOP y HELP en los terminos', terms.includes('Reply STOP') && terms.includes('Reply HELP')],
  ['consentimiento no condiciona la compra', terms.includes('not a condition of purchasing any product or service')],
  ['ingles disponible en la ruta legal en espanol', (html['/es/politica-de-privacidad'] ?? '').includes('SMS and mobile information')],

  // --- Enlaces legales globales ---
  ['pie con los cuatro enlaces legales', ['/privacy-policy', '/terms-and-conditions', '/contact', '/free-water-test'].every((path) => home.includes(path))],
];

console.log('\nContenido y cumplimiento A2P');
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${label}`);
}

// --- Evidencia que se envia con cada lead ---
const payload = buildLeadPayload(
  {
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '(239) 555-0123',
    email: 'jane@example.com',
    address: '123 Main St',
    city: 'Naples',
    state: 'FL',
    zip: '34102',
    waterSource: 'well',
    bestTime: '',
    comments: '',
    consentTransactional: true,
    consentMarketing: false,
  },
  'en'
);

const evidenceFields = [
  'submission_id',
  'first_name',
  'last_name',
  'phone',
  'email',
  'city',
  'state',
  'postal_code',
  'water_source',
  'sms_consent_transactional',
  'sms_consent_marketing',
  'sms_consent_transactional_text',
  'consent_version',
  'consent_timestamp_iso',
  'consent_timezone',
  'consent_url',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'fbc',
  'fbp',
  'seller',
];

const evidenceChecks = [
  ['payload con todos los campos de evidencia', evidenceFields.every((field) => field in payload)],
  ['telefono normalizado a E.164', payload.phone === '+12395550123'],
  ['consentimientos independientes', payload.sms_consent_transactional === true && payload.sms_consent_marketing === false],
  ['solo se guarda el texto de la casilla marcada', payload.sms_consent_transactional_text.length > 0 && payload.sms_consent_marketing_text === ''],
  ['version de consentimiento correcta', payload.consent_version === CONSENT_VERSION],
];

console.log('\nEvidencia de consentimiento');
for (const [label, ok] of evidenceChecks) {
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${label}`);
}

console.log(failed ? `\n${failed} comprobacion(es) fallidas\n` : '\nTodo correcto\n');
process.exit(failed ? 1 : 0);
