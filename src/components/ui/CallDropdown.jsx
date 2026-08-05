import { useEffect, useRef, useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { PHONE_NUMBERS, PRIMARY_PHONE } from '../../constants/business';
import { callNumber } from '../../lib/contactActions';
import { useLanguage } from '../../i18n/LanguageProvider';

const copy = {
  en: {
    helper: 'Choose a contact number',
    primary: 'Primary number',
    available: 'Available 24/7',
  },
  es: {
    helper: 'Elige el numero de contacto',
    primary: 'Numero principal',
    available: 'Disponible 24/7',
  },
};

export default function CallDropdown({
  label = 'Llamar',
  align = 'left',
  buttonClassName = '',
  textClassName = 'text-slate-800',
  roundedClass = 'rounded-full',
  location = 'unknown',
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleCall = (tel) => {
    setOpen(false);
    callNumber(tel, location);
  };

  const baseButton = `inline-flex items-center gap-2 ${roundedClass} px-4 py-2 text-sm font-semibold border shadow-sm bg-white/90 backdrop-blur-sm hover:bg-white transition flex-shrink-0`;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${baseButton} ${buttonClassName}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Phone className={`w-4 h-4 ${textClassName}`} aria-hidden="true" />
        <span className={`text-left leading-tight ${textClassName}`}>{label}</span>
        <ChevronDown className={`w-4 h-4 ${textClassName}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-60 rounded-xl bg-white shadow-2xl border border-slate-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <p className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100">{text.helper}</p>
          <div className="py-1">
            {PHONE_NUMBERS.map((phone) => (
              <button
                key={phone.tel}
                type="button"
                role="menuitem"
                onClick={() => handleCall(phone.tel)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 focus-visible:bg-slate-50 transition text-left"
              >
                <span className="block">
                  <span className="block text-sm font-semibold text-slate-900">{phone.display}</span>
                  <span className="block text-[11px] text-slate-500">{text.available}</span>
                </span>
                <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </button>
            ))}
            <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
              {text.primary}: {PRIMARY_PHONE.display}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
