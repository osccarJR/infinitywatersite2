import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe2 } from 'lucide-react';
import CallDropdown from './ui/CallDropdown';
import { useLanguage } from '../i18n/LanguageProvider';
import { localizedPath } from '../i18n/routes';

const copy = {
  en: {
    navItems: [
      { label: 'Home', id: 'inicio' },
      { label: 'Services', id: 'servicios' },
      { label: 'Process', id: 'proceso' },
      { label: 'Coverage', id: 'cobertura' },
      { label: 'Free Water Test', id: 'contacto' },
    ],
    call: 'Call',
    languageAria: 'Cambiar a espanol',
    languageLabel: 'Language',
    home: 'Infinity Water - home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    tapToChange: 'Tap to change language',
    navLabel: 'Main navigation',
  },
  es: {
    navItems: [
      { label: 'Inicio', id: 'inicio' },
      { label: 'Servicios', id: 'servicios' },
      { label: 'Proceso', id: 'proceso' },
      { label: 'Cobertura', id: 'cobertura' },
      { label: 'Analisis Gratis', id: 'contacto' },
    ],
    call: 'Llamar',
    languageAria: 'Switch to English',
    languageLabel: 'Idioma',
    home: 'Infinity Water - inicio',
    openMenu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
    tapToChange: 'Toca para cambiar idioma',
    navLabel: 'Navegacion principal',
  },
};

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const text = copy[language];
  const homePath = localizedPath('home', language);

  // Cerrar el menu al navegar evita que se quede abierto sobre la seccion
  // a la que el usuario acaba de saltar.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // El menu movil ocupa toda la pantalla: bloquear el scroll de fondo.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  /**
   * Los enlaces del menu apuntan a `/#seccion`. Asi funcionan igual desde la
   * home y desde cualquier otra pagina: el ScrollManager de App.jsx se
   * encarga del desplazamiento cuando cambia el hash.
   */
  const sectionLink = (id) => `${homePath === '/' ? '/' : homePath}#${id}`;

  const languageToggle = (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={text.languageAria}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400 transition bg-white/5"
    >
      <Globe2 className="w-4 h-4" aria-hidden="true" />
      <span className="flex items-center gap-1 text-xs font-semibold">
        <span className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white text-slate-900' : 'text-white/80'}`}>
          EN
        </span>
        <span className="text-white/60" aria-hidden="true">|</span>
        <span className={`px-2 py-1 rounded ${language === 'es' ? 'bg-white text-slate-900' : 'text-white/80'}`}>
          ES
        </span>
      </span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-sm shadow-lg z-50 border-b border-purple-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Antes era un <img> con onClick: no se podia activar con teclado
              ni lo anunciaba un lector de pantalla. */}
          <Link to={homePath} aria-label={text.home} className="flex-shrink-0">
            <img
              src="/images/logo.webp"
              alt="Infinity Water"
              width="420"
              height="74"
              className="h-12 md:h-14 w-auto brightness-110"
              fetchPriority="high"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8" aria-label={text.navLabel}>
            {text.navItems.map((item) => (
              <Link
                key={item.id}
                to={sectionLink(item.id)}
                className="text-white/90 hover:text-cyan-400 focus-visible:text-cyan-400 transition-all duration-300 text-[15px] relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <CallDropdown
              label={text.call}
              location="header"
              buttonClassName="hidden sm:inline-flex bg-white text-slate-900 border-white/70 shadow-md hover:bg-slate-100 px-5 py-2 rounded-full"
              textClassName="text-slate-900"
              align="right"
            />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-white/70 text-xs">{text.languageLabel}</span>
              {languageToggle}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? text.closeMenu : text.openMenu}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Acceso rapido al idioma en movil, donde el selector del header no cabe */}
      {!mobileMenuOpen && (
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={text.languageAria}
          className="sm:hidden fixed right-3 top-[5.25rem] z-40 inline-flex items-center gap-1 px-3 py-2 rounded-full border border-white/25 text-white/90 bg-slate-900/85 backdrop-blur-md text-[11px] shadow-lg"
        >
          <Globe2 className="w-4 h-4" aria-hidden="true" />
          <span className="font-semibold">{language === 'en' ? 'EN' : 'ES'}</span>
        </button>
      )}

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-slate-900/98 border-t border-purple-500/30 shadow-lg backdrop-blur-md max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <nav className="flex flex-col gap-2" aria-label={text.navLabel}>
              {text.navItems.map((item) => (
                <Link
                  key={item.id}
                  to={sectionLink(item.id)}
                  className="py-3 px-4 text-white/90 hover:bg-blue-900/40 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col items-center gap-2">
              <span className="text-white/70 text-xs">{text.languageLabel}</span>
              {languageToggle}
              <p className="text-xs text-white/60 text-center">{text.tapToChange}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
