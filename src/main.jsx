import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { LanguageProvider } from './i18n/LanguageProvider.jsx';

const container = document.getElementById('root');

// BrowserRouter va por fuera: LanguageProvider deriva el idioma de la URL.
const tree = (
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);

// El build inyecta el HTML ya renderizado dentro de #root (ver
// scripts/prerender.mjs). Si esta ahi se hidrata, que conserva el marcado y
// evita el parpadeo; si no, se renderiza desde cero. Asi el sitio sigue
// funcionando aunque el prerenderizado falle o se desactive.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
