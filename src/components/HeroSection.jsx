import { CheckCircle, Star, Award, Clock, Phone } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { PRIMARY_PHONE, STATS } from '../constants/business';
import { callNumber, openWhatsApp } from '../lib/contactActions';
import { useLanguage } from '../i18n/LanguageProvider';

const homes = STATS.homesServed.toLocaleString('en-US');

const copy = {
  en: {
    badges: ['Rated on Google', 'BBB Accredited A+', 'WQA Certified'],
    title: { first: 'Pure Water', connector: 'and', second: 'Healthy', tail: 'For Your Family' },
    subtitle: 'We remove bad odor, discoloration, and contaminants from your home water.',
    offerTitle: 'Limited-Time Offer:',
    bullets: [
      { title: 'FREE Diagnosis', description: 'Complete water analysis' },
      { title: '24h Installation', description: 'Fast, guaranteed service' },
      { title: 'Alkaline Water pH 8-10', description: 'Better hydration' },
      { title: `${STATS.yearsExperience}+ Years Experience`, description: `${homes}+ happy customers` },
    ],
    callNow: 'Call now',
    whatsapp: 'WhatsApp',
    whatsappTag: 'Instant Response',
    promoLead: 'Limited promotion!',
    promoTail: 'Only available this week',
    stats: { homesLabel: 'Happy Homes', yearsLabel: 'Years of Experience' },
    imageAlt: 'Family enjoying clean and healthy water at home',
    whatsappMessage: 'Hi, I need information about water treatment',
  },
  es: {
    badges: ['Valorados en Google', 'BBB Acreditado A+', 'Certificado WQA'],
    title: { first: 'Agua Pura', connector: 'y', second: 'Saludable', tail: 'Para Tu Familia' },
    subtitle: 'Eliminamos mal olor, color extrano y contaminantes del agua de tu hogar.',
    offerTitle: 'Oferta Especial:',
    bullets: [
      { title: 'Diagnostico GRATIS', description: 'Analisis completo del agua' },
      { title: 'Instalacion en 24h', description: 'Servicio rapido garantizado' },
      { title: 'Agua Alcalina pH 8-10', description: 'Mejor hidratacion' },
      { title: `${STATS.yearsExperience}+ Anos de Experiencia`, description: `${homes}+ clientes felices` },
    ],
    callNow: 'Llamar ahora',
    whatsapp: 'WhatsApp',
    whatsappTag: 'Respuesta Inmediata',
    promoLead: 'Promocion limitada!',
    promoTail: 'Solo disponible esta semana',
    stats: { homesLabel: 'Hogares Felices', yearsLabel: 'Anos de Experiencia' },
    imageAlt: 'Familia disfrutando de agua pura y saludable en casa',
    whatsappMessage: 'Hola, necesito informacion sobre tratamiento de agua',
  },
};

export default function HeroSection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section
      id="inicio"
      className="pt-10 md:pt-12 lg:pt-16 pb-12 md:pb-16 bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-5 md:mb-6">
            <span className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-blue-200">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              <span className="text-slate-700 text-sm">{text.badges[0]}</span>
            </span>
            <span className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-green-200">
              <Award className="w-5 h-5 text-green-600" aria-hidden="true" />
              <span className="text-slate-700 text-sm">{text.badges[1]}</span>
            </span>
            <span className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-600" aria-hidden="true" />
              <span className="text-slate-700 text-sm">{text.badges[2]}</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-5 leading-[1.08]">
                <span className="text-blue-600">{text.title.first}</span> {text.title.connector}{' '}
                <span className="text-cyan-600">{text.title.second}</span> {text.title.tail}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-700 mb-5 sm:mb-7 leading-relaxed">
                {text.subtitle}
              </p>

              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
                <h2 className="text-2xl mb-6">{text.offerTitle}</h2>

                <ul className="grid sm:grid-cols-2 gap-4">
                  {text.bullets.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-cyan-200 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="block">
                        <span className="block font-semibold">{item.title}</span>
                        <span className="block text-blue-100 text-sm">{item.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
                <button
                  type="button"
                  onClick={() => callNumber(PRIMARY_PHONE.tel, 'hero')}
                  className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-4 sm:px-10 sm:py-6 rounded-2xl shadow-2xl shadow-blue-500/50 transition-all text-lg relative overflow-hidden w-full sm:w-[320px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" aria-hidden="true" />
                  <Phone className="w-6 h-6 relative z-10" aria-hidden="true" />
                  <span className="relative z-10 text-left leading-tight">
                    <span className="block text-sm font-semibold">{text.callNow}</span>
                    <span className="block text-lg font-semibold">{PRIMARY_PHONE.display}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsApp(text.whatsappMessage, 'hero')}
                  className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-7 py-4 sm:px-10 sm:py-6 rounded-2xl shadow-2xl shadow-green-500/50 transition-all text-lg relative overflow-hidden w-full sm:w-[320px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" aria-hidden="true" />
                  <WhatsAppIcon className="w-6 h-6 relative z-10 shrink-0" />
                  <span className="relative z-10 text-left leading-tight">
                    <span className="block text-xs text-green-200">{text.whatsappTag}</span>
                    <span className="block text-xl font-semibold">{text.whatsapp}</span>
                  </span>
                </button>
              </div>

              <p className="flex items-center gap-2 text-slate-600 text-sm">
                <Clock className="w-5 h-5 text-orange-500 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-orange-600">{text.promoLead}</strong> {text.promoTail}
                </span>
              </p>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                {/* Es el Largest Contentful Paint: sin lazy y con prioridad alta */}
                <img
                  src="/images/hero-familia.webp"
                  alt={text.imageAlt}
                  width="1400"
                  height="933"
                  className="w-full h-[380px] sm:h-[480px] lg:h-[550px] object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

              <div className="hidden sm:block absolute -top-6 -right-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 border-4 border-white text-center">
                <p className="text-4xl text-white mb-1">{homes}+</p>
                <p className="text-green-100 text-sm">{text.stats.homesLabel}</p>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 border-4 border-white text-center">
                <p className="text-4xl text-white mb-1">{STATS.yearsExperience}+</p>
                <p className="text-blue-100 text-sm">{text.stats.yearsLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
