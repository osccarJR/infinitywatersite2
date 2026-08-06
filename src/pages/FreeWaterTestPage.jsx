import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import GhlForm from '../components/GhlForm';
import { LEGAL_ENTITY_DBA, SMS_PHONE_NUMBER, SUPPORT_PHONE } from '../constants/business';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    back: 'Back to home',
    title: 'Request your free home water analysis',
    intro:
      'Tell us whether your home uses well water or city water. Infinity Water will contact you to coordinate the analysis and explain the available options. Submitting this request does not obligate you to purchase anything.',
    badges: ['No cost and no obligation', 'Certified technicians', 'Results explained in plain language'],
    legalHeading: 'Before you send the form',
    legalIntro:
      'Text message consent is optional and is not required to submit this form or to purchase any product or service. Please review:',
    links: {
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      smsPolicy: 'SMS Policy',
    },
    smsLabel: 'Text/SMS',
    phoneLabel: 'Prefer to talk? Call us at',
    operatedBy: `Operated by ${LEGAL_ENTITY_DBA}.`,
    formTitle: 'Free water analysis request form',
  },
  es: {
    back: 'Volver al inicio',
    title: 'Solicita tu analisis de agua gratuito en casa',
    intro:
      'Dinos si tu hogar recibe agua de pozo o agua de ciudad. Infinity Water se comunicara contigo para coordinar el analisis y explicarte las opciones disponibles. Enviar esta solicitud no te obliga a comprar.',
    badges: ['Sin costo y sin compromiso', 'Tecnicos certificados', 'Resultados explicados en lenguaje claro'],
    legalHeading: 'Antes de enviar el formulario',
    legalIntro:
      'El consentimiento de mensajes de texto es opcional y no es necesario para enviar este formulario ni para comprar ningun producto o servicio. Consulta:',
    links: {
      privacy: 'Politica de Privacidad',
      terms: 'Terminos y Condiciones',
      smsPolicy: 'Politica de SMS',
    },
    smsLabel: 'Texto/SMS',
    phoneLabel: '¿Prefieres hablar? Llamanos al',
    operatedBy: `Operado por ${LEGAL_ENTITY_DBA}.`,
    formTitle: 'Formulario de solicitud de analisis de agua gratuito',
  },
};

/**
 * Pagina del formulario de analisis de agua.
 *
 * El formulario lo sirve GoHighLevel (ver GhlForm): ahi viven los campos,
 * las casillas de consentimiento y el registro de la evidencia. Esta pagina
 * aporta el contexto y, sobre todo, los tres enlaces legales visibles que
 * exige la revision de la campana A2P.
 */
export default function FreeWaterTestPage() {
  const { language } = useLanguage();
  const text = copy[language];

  const legalLinks = [
    { key: 'privacy', route: 'privacy', Icon: ShieldCheck },
    { key: 'terms', route: 'terms', Icon: FileText },
    { key: 'smsPolicy', route: 'smsPolicy', Icon: MessageSquare },
  ];

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

          {/* Los enlaces legales van ANTES del formulario, para que se vean
              sin depender de que el iframe haya cargado ni de cuanto mida. */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-2">{text.legalHeading}</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{text.legalIntro}</p>

            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map(({ key, route, Icon }) => (
                <li key={key}>
                  <Link
                    to={localizedPath(route, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 underline underline-offset-4 font-semibold text-sm"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {text.links[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <GhlForm title={text.formTitle} />

          <div className="text-center mt-6 space-y-1 text-sm text-slate-500">
            {SMS_PHONE_NUMBER && (
              <p>
                {text.smsLabel}: <strong className="text-slate-700">{SMS_PHONE_NUMBER}</strong>
              </p>
            )}
            <p>
              {text.phoneLabel}{' '}
              <a href={`tel:${SUPPORT_PHONE.tel}`} className="text-blue-600 font-semibold hover:text-blue-700">
                {SUPPORT_PHONE.display}
              </a>
            </p>
            <p>{text.operatedBy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
