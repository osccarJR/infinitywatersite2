import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Droplets, FileText, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  EMAIL,
  GOOGLE_MAPS_EMBED,
  LEGAL_ENTITY_DBA,
  PHONE_NUMBERS,
  SMS_PHONE_NUMBER,
  SUPPORT_PHONE,
} from '../constants/business';
import { callNumber } from '../lib/contactActions';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Pagina de contacto.
 *
 * A proposito NO lleva formulario. La especificacion A2P prohibe un segundo
 * formulario que recoja telefono sin las mismas casillas de consentimiento,
 * y duplicar el formulario multiplicaria las probabilidades de que ambos se
 * desincronicen. Quien quiera dejar sus datos va a /free-water-test, que es
 * el unico punto de captura del sitio.
 */
const copy = {
  en: {
    back: 'Back to home',
    title: 'Contact Infinity Water',
    intro:
      'Reach us directly by phone or email. For a free water analysis, use the request form so we can prepare your visit.',
    businessHeading: 'Business information',
    supportLabel: 'Customer support',
    salesLabel: 'Additional line',
    smsLabel: 'Text/SMS',
    emailLabel: 'Email',
    addressHeading: 'Address',
    hoursHeading: 'Hours',
    hours: 'Open 24 hours, 7 days a week',
    linksHeading: 'Related pages',
    links: {
      freeWaterTest: 'Free Water Test',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      smsPolicy: 'SMS Policy',
    },
    ctaTitle: 'Want a free water analysis?',
    ctaText: 'Fill in the request form and we will contact you to coordinate the visit.',
    ctaButton: 'Request my free water analysis',
    mapTitle: 'Infinity Water location on Google Maps',
  },
  es: {
    back: 'Volver al inicio',
    title: 'Contacta con Infinity Water',
    intro:
      'Comunicate con nosotros directamente por telefono o correo. Para un analisis de agua gratuito, usa el formulario de solicitud y asi preparamos tu visita.',
    businessHeading: 'Informacion del negocio',
    supportLabel: 'Atencion al cliente',
    salesLabel: 'Linea adicional',
    smsLabel: 'Texto/SMS',
    emailLabel: 'Correo electronico',
    addressHeading: 'Direccion',
    hoursHeading: 'Horario',
    hours: 'Abierto 24 horas, los 7 dias de la semana',
    linksHeading: 'Paginas relacionadas',
    links: {
      freeWaterTest: 'Analisis de Agua Gratis',
      privacy: 'Politica de Privacidad',
      terms: 'Terminos y Condiciones',
      smsPolicy: 'Politica de SMS',
    },
    ctaTitle: '¿Quieres un analisis de agua gratuito?',
    ctaText: 'Completa el formulario de solicitud y te contactamos para coordinar la visita.',
    ctaButton: 'Solicitar mi analisis gratuito',
    mapTitle: 'Ubicacion de Infinity Water en Google Maps',
  },
};

export default function ContactPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const secondaryPhone = PHONE_NUMBERS[1];

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={localizedPath('home', language)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {text.back}
          </Link>

          <h1 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h1>
          <p className="text-lg text-slate-700 leading-relaxed mb-10 max-w-2xl">{text.intro}</p>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
                {text.businessHeading}
              </h2>

              <p className="font-semibold text-slate-900 mb-4">{LEGAL_ENTITY_DBA}</p>

              <ul className="space-y-3 text-slate-700">
                <li>
                  <span className="block text-xs uppercase tracking-wide text-slate-500">
                    {text.supportLabel}
                  </span>
                  <a
                    href={`tel:${SUPPORT_PHONE.tel}`}
                    onClick={(event) => {
                      event.preventDefault();
                      callNumber(SUPPORT_PHONE.tel, 'contacto');
                    }}
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    {SUPPORT_PHONE.display}
                  </a>
                </li>

                <li>
                  <span className="block text-xs uppercase tracking-wide text-slate-500">
                    {text.salesLabel}
                  </span>
                  <a
                    href={`tel:${secondaryPhone.tel}`}
                    onClick={(event) => {
                      event.preventDefault();
                      callNumber(secondaryPhone.tel, 'contacto');
                    }}
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    {secondaryPhone.display}
                  </a>
                </li>

                {SMS_PHONE_NUMBER && (
                  <li>
                    <span className="block text-xs uppercase tracking-wide text-slate-500">
                      {text.smsLabel}
                    </span>
                    <span className="font-semibold text-slate-900">{SMS_PHONE_NUMBER}</span>
                  </li>
                )}

                <li>
                  <span className="block text-xs uppercase tracking-wide text-slate-500">
                    {text.emailLabel}
                  </span>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800 break-all"
                  >
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                {text.addressHeading}
              </h2>

              <address className="not-italic text-slate-700 mb-5">
                <span className="block">{ADDRESS_LINE_1}</span>
                <span className="block">{ADDRESS_LINE_2}</span>
              </address>

              <h2 className="text-xl text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
                {text.hoursHeading}
              </h2>
              <p className="text-slate-700">{text.hours}</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-10">
            <iframe
              src={GOOGLE_MAPS_EMBED}
              height="320"
              className="w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={text.mapTitle}
            />
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h2 className="text-2xl mb-1">{text.ctaTitle}</h2>
              <p className="text-blue-100">{text.ctaText}</p>
            </div>
            <Link
              to={localizedPath('freeWaterTest', language)}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-50 transition-colors shrink-0"
            >
              <Droplets className="w-5 h-5" aria-hidden="true" />
              {text.ctaButton}
            </Link>
          </div>

          <div>
            <h2 className="text-xl text-slate-900 mb-3">{text.linksHeading}</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-blue-600">
              <li>
                <Link
                  to={localizedPath('freeWaterTest', language)}
                  className="inline-flex items-center gap-2 hover:text-blue-700 underline underline-offset-4"
                >
                  <Droplets className="w-4 h-4" aria-hidden="true" />
                  {text.links.freeWaterTest}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath('privacy', language)}
                  className="inline-flex items-center gap-2 hover:text-blue-700 underline underline-offset-4"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  {text.links.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath('terms', language)}
                  className="inline-flex items-center gap-2 hover:text-blue-700 underline underline-offset-4"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {text.links.terms}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath('smsPolicy', language)}
                  className="inline-flex items-center gap-2 hover:text-blue-700 underline underline-offset-4"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  {text.links.smsPolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
