import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLanguageFromPath, swapLanguageInPath } from './routes';

const LanguageContext = createContext({
  language: 'en',
  toggleLanguage: () => {},
  setLanguage: () => {},
});

/**
 * El idioma se deriva de la URL (ver routes.js), no de un estado interno.
 * Asi la pagina en espanol es una direccion real que Google puede indexar
 * y que el usuario puede compartir.
 */
export function LanguageProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const language = getLanguageFromPath(location.pathname);

  const setLanguage = useCallback(
    (next) => {
      if (next === language) return;
      navigate(swapLanguageInPath(location.pathname, next) + location.hash);
    },
    [language, location.hash, location.pathname, navigate]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'es' : 'en');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({ language, toggleLanguage, setLanguage }),
    [language, toggleLanguage, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
