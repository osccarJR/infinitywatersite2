/**
 * Prueba de humo: renderiza cada ruta del sitio en Node.
 *
 * Detecta errores reales de ejecucion (imports rotos, componentes
 * indefinidos, hooks mal usados) que el build de Vite no ve, porque solo
 * aparecen al renderizar. Tambien verifica que los datos del negocio que
 * antes se contradecian entre secciones sigan siendo unicos.
 *
 * Se ejecuta con `npm run test:smoke`, que primero lo empaqueta para SSR
 * (asi react-router queda deduplicado en una sola instancia).
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
  { path: '/', expect: ['Pure Water', 'Tell us about your water', 'BBB Accredited Business', 'Privacy Policy'] },
  { path: '/es', expect: ['Agua Pura', 'Cuentanos como esta tu agua', 'Politica de Privacidad'] },
  { path: '/privacy-policy', expect: ['Privacy Policy', 'info@infinitywatersite.com'] },
  { path: '/es/politica-de-privacidad', expect: ['Politica de Privacidad', 'Llamadas, mensajes de texto y WhatsApp'] },
  { path: '/ruta-que-no-existe', expect: ['404', 'Page not found'] },
  { path: '/es/ruta-que-no-existe', expect: ['404', 'Pagina no encontrada'] },
];

let failed = 0;
let home = '';

console.log('\nRutas');
for (const route of routes) {
  try {
    const html = render(route.path);
    if (route.path === '/') home = html;

    const missing = route.expect.filter((needle) => !html.includes(needle));
    if (missing.length) {
      failed++;
      console.log(`  FAIL  ${route.path.padEnd(30)} falta: ${missing.join(' | ')}`);
    } else {
      console.log(`  ok    ${route.path.padEnd(30)} ${String(html.length).padStart(7)} bytes`);
    }
  } catch (error) {
    failed++;
    console.log(`  ERROR ${route.path.padEnd(30)} ${error.message}`);
  }
}

const checks = [
  ['sin la cifra antigua de 5000 clientes', !home.includes('5,000') && !home.includes('5000')],
  ['1,000 hogares en todas las secciones', home.includes('1,000')],
  ['horario 24/7 unificado', home.includes('Open 24 hours')],
  ['sin testimonios inventados', !home.includes('Maria Gonzalez') && !home.includes('Carlos Martinez')],
  ['sin PNG pesados de servicios', !home.includes('.png')],
  ['sin imagenes enlazadas de unsplash', !home.includes('unsplash')],
  ['telefono principal visible', home.includes('(475) 685-8464')],
  ['formulario de contacto presente', home.includes('contact-phone')],
  ['compensacion del header fijo', home.includes('pt-20')],
];

console.log('\nContenido');
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${label}`);
}

console.log(failed ? `\n${failed} comprobacion(es) fallidas\n` : '\nTodo correcto\n');
process.exit(failed ? 1 : 0);
