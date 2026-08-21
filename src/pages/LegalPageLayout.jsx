import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import LegalDocument from '../components/LegalDocument';
import { LEGAL_ENTITY_DBA } from '../constants/legalEntity';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    back: 'Back to home',
    englishHeading: 'English version',
    englishNote:
      'The English text below is the official version of this document and is provided for review purposes.',
  },
  es: {
    back: 'Volver al inicio',
    englishHeading: 'Version en ingles',
    englishNote:
      'El texto en ingles que aparece a continuacion es la version oficial de este documento y se incluye para efectos de revision.',
  },
};

/**
 * Envoltorio comun de las paginas legales.
 *
 * En la ruta en espanol se muestra primero la traduccion y despues el texto
 * completo en ingles. La revision de la campana A2P se hace en Estados
 * Unidos, asi que el ingles tiene que estar disponible sin depender de que
 * el revisor sepa cambiar de idioma.
 */
export default function LegalPageLayout({ document: doc }) {
  const { language } = useLanguage();

  const text = copy[language];
  const current = doc[language];
  const showEnglishBelow = language !== 'en';

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to={localizedPath('home', language)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {text.back}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </span>
            <p className="text-sm text-slate-500">{LEGAL_ENTITY_DBA}</p>
          </div>

          <LegalDocument doc={current} language={language} />

          {showEnglishBelow && (
            <div className="mt-16 pt-10 border-t-2 border-slate-200">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{text.englishHeading}</h2>
                <p className="text-sm text-slate-600">{text.englishNote}</p>
              </div>

              {/* Los enlaces internos del bloque en ingles apuntan a las
                  rutas en ingles: un revisor que siga uno debe seguir
                  leyendo en ingles. */}
              <LegalDocument doc={doc.en} language="en" linkLanguage="en" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
