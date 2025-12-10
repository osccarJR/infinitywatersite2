import { Menu, X, Globe2 } from 'lucide-react';
import { useState } from 'react';
import CallDropdown from './ui/CallDropdown';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    navItems: [
      { label: 'Home', id: 'inicio' },
      { label: 'Services', id: 'servicios' },
      { label: 'Process', id: 'proceso' },
      { label: 'Coverage', id: 'cobertura' },
      { label: 'Testimonials', id: 'testimonios' }
    ],
    call: 'Call',
    languageAria: 'Switch to Spanish',
    languageLabel: 'Language'
  },
  es: {
    navItems: [
      { label: 'Inicio', id: 'inicio' },
      { label: 'Servicios', id: 'servicios' },
      { label: 'Proceso', id: 'proceso' },
      { label: 'Cobertura', id: 'cobertura' },
      { label: 'Testimonios', id: 'testimonios' }
    ],
    call: 'Llamar',
    languageAria: 'Cambiar a inglés',
    languageLabel: 'Idioma'
  }
};

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const text = copy[language];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-sm shadow-lg z-50 border-b border-purple-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <img
            src="/images/logo.png"
            alt="Infinity Water"
            className="h-14 md:h-16 cursor-pointer brightness-110"
            onClick={() => scrollToSection('inicio')}
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {text.navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white/90 hover:text-cyan-400 transition-all duration-300 text-[15px] relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Desktop Call Button */}
            <CallDropdown
              label={text.call}
              buttonClassName="hidden sm:inline-flex bg-white text-slate-900 border-white/70 shadow-md hover:bg-slate-100 px-5 py-2 rounded-full"
              textClassName="text-slate-900"
              align="right"
            />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-white/70 text-xs">{text.languageLabel}</span>
              <button
                onClick={toggleLanguage}
                aria-label={text.languageAria}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 transition bg-white/5"
              >
                <Globe2 className="w-4 h-4" />
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <span
                    className={`px-2 py-1 rounded ${
                      language === 'en' ? 'bg-white text-slate-900' : 'text-white/80'
                    }`}
                  >
                    EN
                  </span>
                  <span className="text-white/60">|</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      language === 'es' ? 'bg-white text-slate-900' : 'text-white/80'
                    }`}
                  >
                    ES
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile floating language toggle */}
      {!mobileMenuOpen && (
        <button
          onClick={toggleLanguage}
          aria-label={text.languageAria}
          className="sm:hidden fixed right-3 top-20 z-40 inline-flex items-center gap-1 px-3 py-2 rounded-full border border-white/25 text-white/90 bg-slate-900/80 backdrop-blur-md text-[11px] shadow-lg"
        >
          <Globe2 className="w-4 h-4" />
          <span className="font-semibold">{language === 'en' ? 'EN' : 'ES'}</span>
        </button>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 border-t border-purple-500/30 shadow-lg backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <nav className="flex flex-col gap-2">
              {text.navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-3 px-4 text-white/90 hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-2">
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-center text-white/90 bg-blue-900/60 hover:bg-blue-800/80 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-3"
              >
                <Globe2 className="w-5 h-5" />
                <div className="flex flex-col items-center gap-1 text-sm font-semibold">
                  <span className="text-white/70 text-xs">{text.languageLabel}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        language === 'en' ? 'bg-white text-slate-900' : 'text-white/80'
                      }`}
                    >
                      EN
                    </span>
                    <span className="text-white/60">|</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        language === 'es' ? 'bg-white text-slate-900' : 'text-white/80'
                      }`}
                    >
                      ES
                    </span>
                  </div>
                </div>
              </button>
              <p className="text-xs text-white/60 text-center mt-2">
                {language === 'en' ? 'Tap to change language' : 'Toca para cambiar idioma'}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
