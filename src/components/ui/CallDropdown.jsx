import { useEffect, useRef, useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { PHONE_NUMBERS, PRIMARY_PHONE } from '../../constants/contactInfo';
import { useLanguage } from '../../i18n/LanguageProvider';

const copy = {
  en: {
    helper: 'Choose a contact number',
    primary: 'Primary number',
    available: 'Available'
  },
  es: {
    helper: 'Elige el número de contacto',
    primary: 'Número principal',
    available: 'Disponible'
  }
};

export default function CallDropdown({
  label = 'Llamar',
  align = 'left',
  buttonClassName = '',
  textClassName = 'text-slate-800',
  showNumber = false,
  roundedClass = 'rounded-full'
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const callNumber = (tel) => {
    setOpen(false);
    window.location.href = `tel:${tel}`;
  };

  const toggleMenu = () => {
    setOpen((value) => !value);
  };

  const baseButton =
    `inline-flex items-center gap-2 ${roundedClass} px-4 py-2 text-sm font-semibold border shadow-sm bg-white/90 backdrop-blur-sm hover:bg-white transition flex-shrink-0`;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className={`${baseButton} ${buttonClassName}`}
      >
        <Phone className={`w-4 h-4 ${textClassName}`} />
        <div className="text-left leading-tight">
          <div className={textClassName}>{label}</div>
        </div>
        <ChevronDown className={`w-4 h-4 ${textClassName}`} />
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-60 rounded-xl bg-white shadow-2xl border border-slate-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100">
            {text.helper}
          </div>
          <div className="py-1">
            {PHONE_NUMBERS.map((phone) => (
              <button
                key={phone.tel}
                onClick={() => callNumber(phone.tel)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{phone.display}</div>
                  <div className="text-[11px] text-slate-500">{text.available}</div>
                </div>
                <Phone className="w-4 h-4 text-blue-600" />
              </button>
            ))}
            <div className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
              {text.primary}: {PRIMARY_PHONE.display}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
