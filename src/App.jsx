import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import TrustBar from './components/TrustBar';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import Seo from './components/Seo';
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import SmsPolicyPage from './pages/SmsPolicyPage';
import FreeWaterTestPage from './pages/FreeWaterTestPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES, getRouteKeyFromPath } from './i18n/routes';
import { useLanguage } from './i18n/LanguageProvider';
import { initAnalytics } from './lib/analytics';
import { initAttribution } from './lib/attribution';

/**
 * Restaura la posicion de scroll al cambiar de ruta, y respeta el ancla
 * (#servicios) cuando se llega desde otra pagina.
 */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // El destino puede no existir todavia en el primer render.
    const id = hash.slice(1);
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(frame);
    // `key` cambia en cada navegacion: sin el, volver a pulsar el mismo
    // enlace del menu no haria nada tras haber hecho scroll manual.
  }, [pathname, hash, key]);

  return null;
}

export default function App() {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const routeKey = getRouteKeyFromPath(pathname) ?? 'notFound';

  // La atribucion se captura de inmediato: los parametros de campana estan
  // en la URL de entrada y se pierden en cuanto el usuario navega.
  useEffect(() => {
    initAttribution();
  }, []);

  // Los scripts de terceros se cargan despues del primer render para no
  // competir con el contenido por el ancho de banda inicial.
  useEffect(() => {
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(initAnalytics)
      : window.setTimeout(initAnalytics, 1200);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Seo routeKey={routeKey} language={language} />
      <ScrollManager />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-xl"
      >
        {language === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>

      <Header />

      {/* El header es fixed (h-20 = 80px), asi que sale del flujo del
          documento. Sin esta compensacion la TrustBar queda tapada detras. */}
      <div className="pt-20">
        <TrustBar />

        <main id="contenido">
          <Routes>
            <Route path={ROUTES.home.en} element={<HomePage />} />
            <Route path={ROUTES.home.es} element={<HomePage />} />
            <Route path={ROUTES.privacy.en} element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.privacy.es} element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.terms.en} element={<TermsPage />} />
            <Route path={ROUTES.terms.es} element={<TermsPage />} />
            <Route path={ROUTES.smsPolicy.en} element={<SmsPolicyPage />} />
            <Route path={ROUTES.smsPolicy.es} element={<SmsPolicyPage />} />
            <Route path={ROUTES.freeWaterTest.en} element={<FreeWaterTestPage />} />
            <Route path={ROUTES.freeWaterTest.es} element={<FreeWaterTestPage />} />
            <Route path={ROUTES.contact.en} element={<ContactPage />} />
            <Route path={ROUTES.contact.es} element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
