import { useState } from 'react';
import { Phone } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { PRIMARY_PHONE } from '../constants/business';
import { callNumber, openWhatsApp } from '../lib/contactActions';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    callTooltip: 'Call now',
    callAria: 'Call Infinity Water now',
    whatsappTooltip: 'WhatsApp',
    whatsappSub: 'Direct message',
    whatsappAria: 'Message Infinity Water on WhatsApp',
    whatsappMessage: 'Hi, I need information about water treatment',
  },
  es: {
    callTooltip: 'Llamar ahora',
    callAria: 'Llamar ahora a Infinity Water',
    whatsappTooltip: 'WhatsApp',
    whatsappSub: 'Mensaje directo',
    whatsappAria: 'Escribir a Infinity Water por WhatsApp',
    whatsappMessage: 'Hola, necesito informacion sobre tratamiento de agua',
  },
};

export default function FloatingButtons() {
  const { language } = useLanguage();
  const text = copy[language];
  const [callHover, setCallHover] = useState(false);
  const [whatsappHover, setWhatsappHover] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => callNumber(PRIMARY_PHONE.tel, 'boton-flotante')}
        onMouseEnter={() => setCallHover(true)}
        onMouseLeave={() => setCallHover(false)}
        onFocus={() => setCallHover(true)}
        onBlur={() => setCallHover(false)}
        aria-label={text.callAria}
        className="fixed left-4 md:left-6 bottom-6 z-40 group"
      >
        <span className="relative block">
          <span className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 border-4 border-white">
            <Phone className="w-8 h-8 md:w-10 md:h-10 text-white" aria-hidden="true" />
          </span>

          {/* motion-safe: el pulso constante marea a quien pide movimiento reducido */}
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 motion-safe:animate-ping pointer-events-none" aria-hidden="true" />

          {callHover && (
            <span className="hidden md:block absolute left-24 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap">
              <span className="block text-lg">{text.callTooltip}</span>
              <span className="block text-sm text-blue-300 leading-tight">{PRIMARY_PHONE.display}</span>
              <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={() => openWhatsApp(text.whatsappMessage, 'boton-flotante')}
        onMouseEnter={() => setWhatsappHover(true)}
        onMouseLeave={() => setWhatsappHover(false)}
        onFocus={() => setWhatsappHover(true)}
        onBlur={() => setWhatsappHover(false)}
        aria-label={text.whatsappAria}
        className="fixed right-4 md:right-6 bottom-6 z-40 group"
      >
        <span className="relative block">
          <span className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 border-4 border-white">
            <WhatsAppIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </span>

          <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 motion-safe:animate-ping pointer-events-none" aria-hidden="true" />

          {whatsappHover && (
            <span className="hidden md:block absolute right-24 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap">
              <span className="block text-lg">{text.whatsappTooltip}</span>
              <span className="block text-sm text-green-300">{text.whatsappSub}</span>
              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
            </span>
          )}
        </span>
      </button>
    </>
  );
}
