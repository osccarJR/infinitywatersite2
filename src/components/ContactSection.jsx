import { Link } from 'react-router-dom';
import { Droplets, ExternalLink } from 'lucide-react';
import LeadForm from './LeadForm';
import { LEGAL_ENTITY_DBA } from '../constants/business';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Bloque de captacion en la portada.
 *
 * Monta el mismo LeadForm que /free-water-test, no una version reducida:
 * la especificacion A2P prohibe recoger un telefono en un formulario que
 * omita las casillas de consentimiento. El unico formulario del sitio es
 * este componente, aqui y en su pagina dedicada.
 */
const copy = {
  en: {
    badge: 'Free water analysis',
    title: 'Tell us about your water',
    subtitle:
      'Fill in your details and we will contact you to coordinate a free water analysis. No cost, no obligation.',
    dedicatedPage: 'Open this form on its own page',
    operatedBy: `Operated by ${LEGAL_ENTITY_DBA}.`,
  },
  es: {
    badge: 'Analisis de agua gratuito',
    title: 'Cuentanos como esta tu agua',
    subtitle:
      'Deja tus datos y te contactamos para coordinar un analisis de agua gratuito. Sin costo y sin compromiso.',
    dedicatedPage: 'Abrir este formulario en su propia pagina',
    operatedBy: `Operado por ${LEGAL_ENTITY_DBA}.`,
  },
};

export default function ContactSection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section id="contacto" className="section-padding bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full mb-5 text-sm border border-blue-200">
              <Droplets className="w-4 h-4" aria-hidden="true" />
              {text.badge}
            </span>
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h2>
            <p className="text-lg text-slate-600">{text.subtitle}</p>
          </div>

          <LeadForm id="home-water-test" />

          <div className="text-center mt-6 space-y-2">
            <Link
              to={localizedPath('freeWaterTest', language)}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {text.dedicatedPage}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
            <p className="text-sm text-slate-500">{text.operatedBy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
