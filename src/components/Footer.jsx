import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Cloud } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  EMAIL,
  GOOGLE_MAPS_EMBED,
  IDENTITY_STATEMENT,
  LEGAL_ENTITY_DBA,
  PHONE_NUMBERS,
  SMS_PHONE_NUMBER,
  STATS,
  SUPPORT_PHONE,
} from '../constants/business';
import { callNumber, openWhatsApp } from '../lib/contactActions';
import { localizedPath } from '../i18n/routes';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Pie global.
 *
 * Un revisor de A2P 10DLC comprueba aqui, en cualquier pagina, que la
 * entidad legal, la marca, la direccion y los enlaces legales existen y son
 * coherentes con lo declarado en el registro de la campana. Por eso el pie
 * lleva la entidad completa y los cuatro enlaces obligatorios, no solo el
 * nombre comercial.
 */
const copy = {
  en: {
    description: `Water treatment specialists with over ${STATS.yearsExperience} years serving homes in Florida.`,
    schedule: 'Open 24 hours, 7 days a week',
    contact: 'Contact',
    where: 'Where are we?',
    writeWhatsApp: 'Message on WhatsApp',
    whatsappMessage: 'Hi, I need help with my water',
    mapTitle: 'Infinity Water location on Google Maps',
    supportLabel: 'Customer support',
    smsLabel: 'Text/SMS',
    rights: `© ${new Date().getFullYear()} Infinity Water.`,
    design: 'Designed by',
    links: {
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      smsPolicy: 'SMS Policy',
      contact: 'Contact',
      freeWaterTest: 'Free Water Test',
    },
  },
  es: {
    description: `Especialistas en tratamiento de agua con mas de ${STATS.yearsExperience} anos sirviendo hogares en Florida.`,
    schedule: 'Abierto 24 horas, los 7 dias de la semana',
    contact: 'Contacto',
    where: '¿Donde estamos?',
    writeWhatsApp: 'Escribir por WhatsApp',
    whatsappMessage: 'Hola, necesito ayuda con el agua de mi casa',
    mapTitle: 'Ubicacion de Infinity Water en Google Maps',
    supportLabel: 'Atencion al cliente',
    smsLabel: 'Texto/SMS',
    rights: `© ${new Date().getFullYear()} Infinity Water.`,
    design: 'Disenado por',
    links: {
      privacy: 'Politica de Privacidad',
      terms: 'Terminos y Condiciones',
      smsPolicy: 'Politica de SMS',
      contact: 'Contacto',
      freeWaterTest: 'Analisis de Agua Gratis',
    },
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const text = copy[language];

  const legalLinks = [
    { key: 'privacy', route: 'privacy' },
    { key: 'terms', route: 'terms' },
    { key: 'smsPolicy', route: 'smsPolicy' },
    { key: 'contact', route: 'contact' },
    { key: 'freeWaterTest', route: 'freeWaterTest' },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <img
                src="/images/logo.webp"
                alt="Infinity Water"
                width="420"
                height="74"
                className="h-12 w-auto mb-6"
                loading="lazy"
                decoding="async"
              />
              <p className="text-slate-400 mb-4 leading-relaxed max-w-md">{text.description}</p>
              <p className="inline-flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-xl">
                <Clock className="w-5 h-5 text-cyan-300 shrink-0" aria-hidden="true" />
                <span className="text-slate-200 text-sm">{text.schedule}</span>
              </p>
            </div>

            <div>
              <h2 className="text-white text-xl mb-6">{text.contact}</h2>
              <ul className="space-y-4">
                {PHONE_NUMBERS.map((phone) => (
                  <li key={phone.tel}>
                    <a
                      href={`tel:${phone.tel}`}
                      onClick={(event) => {
                        event.preventDefault();
                        callNumber(phone.tel, 'footer');
                      }}
                      className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors group"
                    >
                      <span className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors shrink-0">
                        <Phone className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span>
                        {phone.display}
                        {phone.tel === SUPPORT_PHONE.tel && (
                          <span className="block text-[11px] text-slate-500">{text.supportLabel}</span>
                        )}
                      </span>
                    </a>
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(text.whatsappMessage, 'footer')}
                    className="flex items-center gap-3 text-slate-300 hover:text-green-400 transition-colors group text-left"
                  >
                    <span className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors shrink-0">
                      <WhatsAppIcon className="w-5 h-5" />
                    </span>
                    {text.writeWhatsApp}
                  </button>
                </li>

                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors group break-all"
                  >
                    <span className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors shrink-0">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                    </span>
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-white text-xl mb-3">{text.where}</h2>
              <address className="not-italic flex items-start gap-3 text-slate-300 mb-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-cyan-300" aria-hidden="true" />
                <span>
                  <span className="block">{ADDRESS_LINE_1}</span>
                  <span className="block">{ADDRESS_LINE_2}</span>
                </span>
              </address>
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <iframe
                  src={GOOGLE_MAPS_EMBED}
                  height="180"
                  className="w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={text.mapTitle}
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------
              Bloque de identidad legal. Es lo que revisa la operadora:
              entidad + marca + direccion + contacto + enlaces legales,
              visible en todas las paginas y sin ocultarse tras un menu.
              ------------------------------------------------------------ */}
          <div className="border-t border-slate-800 pt-8 space-y-4">
            <div className="text-slate-300 space-y-1">
              <p className="font-semibold text-white">{LEGAL_ENTITY_DBA}</p>
              <p className="text-sm text-slate-400">{IDENTITY_STATEMENT[language]}</p>
              <p className="text-sm">
                {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
              </p>
              <p className="text-sm">
                <a href={`mailto:${EMAIL}`} className="hover:text-cyan-300 break-all">
                  {EMAIL}
                </a>
                {' · '}
                <a href={`tel:${SUPPORT_PHONE.tel}`} className="hover:text-cyan-300">
                  {text.supportLabel}: {SUPPORT_PHONE.display}
                </a>
                {SMS_PHONE_NUMBER && (
                  <>
                    {' · '}
                    <span>
                      {text.smsLabel}: {SMS_PHONE_NUMBER}
                    </span>
                  </>
                )}
              </p>
            </div>

            <nav aria-label={text.links.privacy}>
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                {legalLinks.map((link, index) => (
                  <li key={link.key} className="flex items-center gap-3">
                    <Link
                      to={localizedPath(link.route, language)}
                      className="text-slate-300 hover:text-cyan-300 underline underline-offset-4"
                    >
                      {text.links[link.key]}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">{text.rights}</p>

            <p className="flex items-center gap-3 text-sm text-slate-400">
              <Cloud className="w-5 h-5 text-cyan-300" aria-hidden="true" />
              <span>
                {text.design}{' '}
                <a
                  href="https://www.nivusoftware.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-white"
                >
                  Nivusoftware
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
