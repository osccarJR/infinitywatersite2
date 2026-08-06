/**
 * Entrada de prerenderizado.
 *
 * Exporta una funcion que devuelve el HTML de una ruta ya renderizado. La
 * usa scripts/prerender.mjs para inyectarlo en cada index.html del build.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from '../src/App.jsx';
import { LanguageProvider } from '../src/i18n/LanguageProvider.jsx';

export function render(path) {
  return renderToString(
    <StaticRouter location={path}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StaticRouter>
  );
}
