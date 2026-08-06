import { Link } from 'react-router-dom';
import { CheckCircle2, Droplets, Phone } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { LEGAL_ENTITY_DBA, SUPPORT_PHONE } from '../constants/business';
import { callNumber, openWhatsApp } from '../lib/contactActions';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Bloque de captacion de la portada.
 *
 * No lleva formulario: enlaza al de /free-water-test. El sitio tiene un
 * unico punto de captura de telefonos, el formulario de GoHighLevel, y la
 * especificacion A2P prohibe expresamente un segundo formulario con sus
 * propias casillas de consentimiento. Dos formularios significarian dos
 * registros de consentimiento distintos para la misma persona.
 */
const copy = {
  en: {
    badge: 'Free water analysis',
    title: 'Find out what is really in your water',
    subtitle:
      'Request a free analysis and we will contact you to coordinate the visit. No cost, no obligation to purchase.',
    bullets: [
      'Complete on-site water test',
      'Personalized recommendations',
      'Written quote with no commitment',
    ],
    cta: 'Request my free water analysis',
    or: 'or contact us directly',
    call: 'Call now',
    whatsapp: 'WhatsApp',
    whatsappMessage: 'Hi, I would like a free water analysis',
    operatedBy: `Operated by ${LEGAL_ENTITY_DBA}.`,
  },
  es: {
    badge: 'Analisis de agua gratuito',
    title: 'Descubre que contiene realmente tu agua',
    subtitle:
      'Solicita un analisis gratuito y te contactamos para coordinar la visita. Sin costo y sin compromiso de compra.',
    bullets: [
      'Prueba completa del agua en tu casa',
      'Recomendaciones personalizadas',
      'Cotizacion por escrito sin compromiso',
    ],
    cta: 'Solicitar mi analisis gratuito',
    or: 'o contactanos directamente',
    call: 'Llamar ahora',
    whatsapp: 'WhatsApp',
    whatsappMessage: 'Hola, quiero un analisis de agua gratuito',
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
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl text-center">
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-5 py-2.5 rounded-full mb-6 text-sm">
              <Droplets className="w-4 h-4" aria-hidden="true" />
              {text.badge}
            </span>

            <h2 className="text-3xl md:text-4xl mb-4">{text.title}</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">{text.subtitle}</p>

            <ul className="grid sm:grid-cols-3 gap-4 mb-9 text-left">
              {text.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-200 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-white/95">{bullet}</span>
                </li>
              ))}
            </ul>

            <Link
              to={localizedPath('freeWaterTest', language)}
              className="inline-flex items-center justify-center gap-3 bg-white text-blue-700 px-8 py-5 rounded-2xl shadow-xl hover:bg-blue-50 transition-colors text-lg font-semibold w-full sm:w-auto"
            >
              <Droplets className="w-6 h-6" aria-hidden="true" />
              {text.cta}
            </Link>

            <p className="text-blue-100 text-sm mt-8 mb-4">{text.or}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => callNumber(SUPPORT_PHONE.tel, 'portada-contacto')}
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors font-semibold"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                {text.call}
              </button>

              <button
                type="button"
                onClick={() => openWhatsApp(text.whatsappMessage, 'portada-contacto')}
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors font-semibold"
              >
                <WhatsAppIcon className="w-5 h-5" />
                {text.whatsapp}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">{text.operatedBy}</p>
        </div>
      </div>
    </section>
  );
}
