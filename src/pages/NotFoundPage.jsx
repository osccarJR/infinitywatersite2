import { Link } from 'react-router-dom';
import { Home, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { localizedPath } from '../i18n/routes';
import { PRIMARY_PHONE } from '../constants/business';
import { callNumber } from '../lib/contactActions';

const copy = {
  en: {
    title: 'Page not found',
    description:
      'The page you are looking for does not exist or has been moved. We can still help you with your water.',
    home: 'Back to home',
    call: 'Call us',
  },
  es: {
    title: 'Pagina no encontrada',
    description:
      'La pagina que buscas no existe o fue movida. De todas formas podemos ayudarte con el agua de tu hogar.',
    home: 'Volver al inicio',
    call: 'Llamanos',
  },
};

export default function NotFoundPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-7xl md:text-8xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4">
            404
          </p>
          <h1 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h1>
          <p className="text-lg text-slate-600 mb-8">{text.description}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={localizedPath('home', language)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              {text.home}
            </Link>

            <button
              onClick={() => callNumber(PRIMARY_PHONE.tel, '404')}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
              {text.call} {PRIMARY_PHONE.display}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
