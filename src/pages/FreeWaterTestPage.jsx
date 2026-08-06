import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, ShieldCheck } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    back: 'Back to home',
    title: 'Request your free home water analysis',
    intro:
      'Tell us whether your home uses well water or city water. Infinity Water will contact you to coordinate the analysis and explain the available options. Submitting this request does not obligate you to purchase anything.',
    badges: [
      'No cost and no obligation',
      'Certified technicians',
      'Results explained in plain language',
    ],
    legalNote: 'Operated by Global Innovation LLC d/b/a Infinity Water.',
  },
  es: {
    back: 'Volver al inicio',
    title: 'Solicita tu analisis de agua gratuito en casa',
    intro:
      'Dinos si tu hogar recibe agua de pozo o agua de ciudad. Infinity Water se comunicara contigo para coordinar el analisis y explicarte las opciones disponibles. Enviar esta solicitud no te obliga a comprar.',
    badges: [
      'Sin costo y sin compromiso',
      'Tecnicos certificados',
      'Resultados explicados en lenguaje claro',
    ],
    legalNote: 'Operado por Global Innovation LLC d/b/a Infinity Water.',
  },
};

export default function FreeWaterTestPage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className="section-padding bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to={localizedPath('home', language)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {text.back}
          </Link>

          <div className="text-center mb-10">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 mb-5">
              <Droplets className="w-7 h-7 text-blue-600" aria-hidden="true" />
            </span>

            <h1 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h1>
            <p className="text-lg text-slate-700 leading-relaxed">{text.intro}</p>

            <ul className="flex flex-wrap justify-center gap-3 mt-6">
              {text.badges.map((badge) => (
                <li
                  key={badge}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-green-600" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <LeadForm id="free-water-test" />

          <p className="text-center text-sm text-slate-500 mt-6">{text.legalNote}</p>
        </div>
      </div>
    </section>
  );
}
