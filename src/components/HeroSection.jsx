import { CheckCircle, Star, Award, Clock, Phone } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { getWhatsAppUrl, PRIMARY_PHONE } from '../constants/contactInfo';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    badges: ['4.9/5 on Google', 'BBB Accredited A+', 'WQA Certified'],
    title: {
      first: 'Pure Water',
      second: 'Healthy',
      tail: 'For Your Family',
      connector: 'and'
    },
    subtitle:
      'We remove bad odor, discoloration, and contaminants from your home water.',
    offerTitle: 'Limited-Time Offer:',
    bullets: [
      { title: 'FREE Diagnosis', description: 'Complete water analysis' },
      { title: '24h Installation', description: 'Fast, guaranteed service' },
      { title: 'Alkaline Water pH 8-10', description: 'Better hydration' },
      { title: '10+ Years Experience', description: '5,000+ happy customers' }
    ],
    callNow: 'Call now',
    whatsapp: 'WhatsApp',
    whatsappTag: 'Instant Response',
    promoLead: 'Limited promotion!',
    promoTail: 'Only available this week',
    stats: {
      homesLabel: 'Happy Homes',
      yearsLabel: 'Years of Experience'
    },
    imageAlt: 'Family enjoying clean and healthy water',
    whatsappMessage: 'Hi, I need information about water treatment'
  },
  es: {
    badges: ['4.9/5 en Google', 'BBB Acreditado A+', 'Certificado WQA'],
    title: {
      first: 'Agua Pura',
      second: 'Saludable',
      tail: 'Para Tu Familia',
      connector: 'y'
    },
    subtitle:
      'Eliminamos mal olor, color extraño y contaminantes del agua de tu hogar.',
    offerTitle: 'Oferta Especial:',
    bullets: [
      { title: 'Diagnóstico GRATIS', description: 'Análisis completo del agua' },
      { title: 'Instalación en 24h', description: 'Servicio rápido garantizado' },
      { title: 'Agua Alcalina pH 8-10', description: 'Mejor hidratación' },
      { title: '10+ Años de Experiencia', description: '5000+ clientes felices' }
    ],
    callNow: 'Llamar ahora',
    whatsapp: 'WhatsApp',
    whatsappTag: 'Respuesta Inmediata',
    promoLead: '¡Promoción limitada!',
    promoTail: 'Solo disponible esta semana',
    stats: {
      homesLabel: 'Hogares Felices',
      yearsLabel: 'Años de Experiencia'
    },
    imageAlt: 'Familia disfrutando de agua pura y saludable',
    whatsappMessage: 'Hola, necesito información sobre tratamiento de agua'
  }
};

export default function HeroSection() {
  const { language } = useLanguage();
  const text = copy[language];

  const handleCall = () => {
    window.location.href = `tel:${PRIMARY_PHONE.tel}`;
  };

  const handleWhatsApp = () => {
    window.open(getWhatsAppUrl(text.whatsappMessage), '_blank');
  };

  return (
    <section
      id="inicio"
      className="pt-10 md:pt-12 lg:pt-16 pb-12 md:pb-16 bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-5 md:mb-6">
            <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-blue-200">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-slate-700 text-sm">{text.badges[0]}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-green-200">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-slate-700 text-sm">{text.badges[1]}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-md border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-slate-700 text-sm">{text.badges[2]}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-5 leading-[1.08]">
                <span className="text-blue-600">{text.title.first}</span> {text.title.connector}{' '}
                <span className="text-cyan-600">{text.title.second}</span>{' '}
                {text.title.tail}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-700 mb-5 sm:mb-7 leading-relaxed">
                {text.subtitle}
              </p>

              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
                <h3 className="text-2xl mb-6">{text.offerTitle}</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {text.bullets.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-cyan-200 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-blue-100 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
                <button
                  onClick={handleCall}
                  className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-4 sm:px-10 sm:py-6 rounded-2xl shadow-2xl shadow-blue-500/50 transition-all text-lg relative overflow-hidden w-full sm:w-[320px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <Phone className="w-6 h-6 relative z-10" />
                  <div className="text-left relative z-10">
                    <div className="text-sm font-semibold text-white">{text.callNow}</div>
                  </div>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-7 py-4 sm:px-10 sm:py-6 rounded-2xl shadow-2xl shadow-green-500/50 transition-all text-lg relative overflow-hidden w-full sm:w-[320px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <WhatsAppIcon className="w-6 h-6 relative z-10 shrink-0" />
                  <div className="text-left relative z-10 leading-tight">
                    <div className="text-xs text-green-200">{text.whatsappTag}</div>
                    <div className="text-xl font-semibold">{text.whatsapp}</div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5 text-orange-500" />
                <p className="text-sm">
                  <strong className="text-orange-600">{text.promoLead}</strong> {text.promoTail}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="/images/imagenfamiliar.png"
                  alt={text.imageAlt}
                  className="w-full h-[380px] sm:h-[480px] lg:h-[550px] object-cover"
                />
              </div>

              <div className="hidden sm:block absolute -top-6 -right-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 border-4 border-white">
                <div className="text-center">
                  <p className="text-4xl text-white mb-1">5000+</p>
                  <p className="text-green-100 text-sm">{text.stats.homesLabel}</p>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 border-4 border-white">
                <div className="text-center">
                  <p className="text-4xl text-white mb-1">10+</p>
                  <p className="text-blue-100 text-sm">{text.stats.yearsLabel}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
