import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'infinitywater-language';

const LanguageContext = createContext({
  language: 'en',
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'es' ? 'es' : 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'es' : 'en')),
      setLanguage,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
