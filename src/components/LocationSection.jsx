import { MapPin, Phone, Globe2 } from 'lucide-react';
import { COVERAGE, PRIMARY_PHONE } from '../constants/business';
import { callNumber } from '../lib/contactActions';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Cobertura. Los estados salen de constants/business.js, que es la misma
 * fuente que alimenta el `areaServed` de los datos estructurados: antes la
 * seccion anunciaba quince estados mientras el JSON-LD declaraba cuatro
 * ciudades.
 */
const REGIONS = {
  en: [
    { title: 'Florida', items: COVERAGE.floridaCities },
    { title: 'East Coast', items: ['Connecticut', 'New York', 'New Jersey', 'Massachusetts', 'Pennsylvania'] },
    { title: 'South Atlantic', items: ['Virginia', 'Washington', 'Maryland', 'North Carolina', 'Georgia'] },
    { title: 'Southwest', items: ['Arizona'] },
  ],
  es: [
    { title: 'Florida', items: COVERAGE.floridaCities },
    { title: 'Costa Este', items: ['Connecticut', 'New York', 'New Jersey', 'Massachusetts', 'Pennsylvania'] },
    { title: 'Atlantico Sur', items: ['Virginia', 'Washington', 'Maryland', 'Carolina del Norte', 'Georgia'] },
    { title: 'Suroeste', items: ['Arizona'] },
  ],
};

const copy = {
  en: {
    badge: 'Service area',
    title: 'All of Florida, plus other key states',
    subtitle:
      'Florida is our home base, with same-day service in the southwest. We also install and service systems in the states listed below.',
    cardTitle: 'Multi-state coverage',
    cardSubtitle: `${COVERAGE.floridaCities.length} cities in Florida and ${COVERAGE.states.length} more states`,
    check: 'Not sure if we reach you?',
    callAction: 'Call us',
  },
  es: {
    badge: 'Zona de servicio',
    title: 'Toda Florida, mas otros estados clave',
    subtitle:
      'Florida es nuestra base, con servicio el mismo dia en el suroeste. Tambien instalamos y damos servicio en los estados que aparecen abajo.',
    cardTitle: 'Cobertura multiestatal',
    cardSubtitle: `${COVERAGE.floridaCities.length} ciudades en Florida y ${COVERAGE.states.length} estados mas`,
    check: '¿No sabes si llegamos a tu zona?',
    callAction: 'Llamanos',
  },
};

export default function LocationSection() {
  const { language } = useLanguage();
  const text = copy[language];
  const regions = REGIONS[language];

  return (
    <section id="cobertura" className="section-padding bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full mb-4 text-sm border border-blue-100">
              <Globe2 className="w-4 h-4" aria-hidden="true" />
              {text.badge}
            </span>
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">{text.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {regions.map((region) => (
              <div key={region.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-blue-700 font-semibold mb-3">{region.title}</h3>
                <ul className="space-y-1.5">
                  {region.items.map((city) => (
                    <li key={city} className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
                      <span className="text-sm">{city}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Antes habia aqui una foto enlazada en caliente desde Unsplash:
              una dependencia externa sin control, sin cache y sin licencia
              verificada. Una tarjeta propia comunica lo mismo y no pesa. */}
          <div className="bg-gradient-to-br from-blue-900 to-cyan-800 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <span className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 items-center justify-center shrink-0">
                <Globe2 className="w-8 h-8 text-cyan-200" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl mb-1">{text.cardTitle}</p>
                <p className="text-blue-100">{text.cardSubtitle}</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-blue-100 text-sm mb-2">{text.check}</p>
              <button
                type="button"
                onClick={() => callNumber(PRIMARY_PHONE.tel, 'cobertura')}
                className="inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-50 transition-colors"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                {text.callAction}: {PRIMARY_PHONE.display}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
