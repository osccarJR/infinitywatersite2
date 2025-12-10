import { useState } from 'react';
import { Phone } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { PRIMARY_PHONE, getWhatsAppUrl } from '../constants/contactInfo';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    call: {
      tooltip: 'Call Now',
      sub: 'Direct line'
    },
    whatsapp: {
      tooltip: 'WhatsApp',
      sub: 'Direct message',
      message: 'Hi, I need information about water treatment'
    }
  },
  es: {
    call: {
      tooltip: 'Llamar Ahora',
      sub: 'Línea directa'
    },
    whatsapp: {
      tooltip: 'WhatsApp',
      sub: 'Mensaje directo',
      message: 'Hola, necesito información sobre tratamiento de agua'
    }
  }
};

export default function FloatingButtons() {
  const { language } = useLanguage();
  const text = copy[language];
  const [callHover, setCallHover] = useState(false);
  const [whatsappHover, setWhatsappHover] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${PRIMARY_PHONE.tel}`;
  };

  const handleWhatsApp = () => {
    window.open(
      getWhatsAppUrl(text.whatsapp.message),
      '_blank'
    );
  };

  return (
    <>
      {/* Call Button - Left */}
      <button
        onClick={handleCall}
        onMouseEnter={() => setCallHover(true)}
        onMouseLeave={() => setCallHover(false)}
        className="fixed left-4 md:left-6 bottom-6 z-50 group"
      >
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none border-4 border-white">
            <Phone className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />

          {/* Tooltip (desktop only) */}
          {callHover && (
            <div className="hidden md:block absolute left-24 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap">
              <div className="text-lg">{text.call.tooltip}</div>
              <div className="text-sm text-blue-300 leading-tight">{PRIMARY_PHONE.display}</div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
            </div>
          )}
        </div>
      </button>

      {/* WhatsApp Button - Right */}
      <button
        onClick={handleWhatsApp}
        onMouseEnter={() => setWhatsappHover(true)}
        onMouseLeave={() => setWhatsappHover(false)}
        className="fixed right-4 md:right-6 bottom-6 z-50 group"
      >
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none border-4 border-white">
            <WhatsAppIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />

          {/* Tooltip (desktop only) */}
          {whatsappHover && (
            <div className="hidden md:block absolute right-24 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap">
              <div className="text-lg">{text.whatsapp.tooltip}</div>
              <div className="text-sm text-green-300">{text.whatsapp.sub}</div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
            </div>
          )}
        </div>
      </button>
    </>
  );
}
