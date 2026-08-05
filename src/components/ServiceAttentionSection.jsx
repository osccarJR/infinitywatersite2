import { Headphones, Clock, Shield, Award } from 'lucide-react';
import { STATS } from '../constants/business';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    badge: 'Premium Support',
    title: 'Service & Care',
    subtitle: "Total commitment to our customers' satisfaction",
    subtitle2: `Backed by ${STATS.yearsExperience}+ years of excellence`,
    features: [
      {
        icon: Clock,
        title: 'Immediate Response',
        description: 'We answer your call in minutes',
        stat: '< 5min'
      },
      {
        icon: Shield,
        title: 'Total Guarantee',
        description: '100% satisfaction guaranteed',
        stat: '100%'
      },
      {
        icon: Award,
        title: 'Certified Experts',
        description: 'Highly qualified staff',
        stat: 'WQA'
      },
      {
        icon: Headphones,
        title: '24/7 Support',
        description: 'Always available for you',
        stat: '24/7'
      }
    ],
    stats: [
      { value: `${STATS.yearsExperience}+`, label: 'Years of Experience' },
      { value: `${STATS.homesServed.toLocaleString('en-US')}+`, label: 'Satisfied Clients' },
      { value: '100%', label: 'Guarantee' },
      { value: 'A+', label: 'BBB Rating' }
    ]
  },
  es: {
    badge: 'Atención Premium',
    title: 'Servicio y Atención',
    subtitle: 'Compromiso total con la satisfacción de nuestros clientes',
    subtitle2: `Respaldado por mas de ${STATS.yearsExperience} anos de excelencia`,
    features: [
      {
        icon: Clock,
        title: 'Respuesta Inmediata',
        description: 'Atendemos su llamada en minutos',
        stat: '< 5min'
      },
      {
        icon: Shield,
        title: 'Garantía Total',
        description: '100% satisfacción garantizada',
        stat: '100%'
      },
      {
        icon: Award,
        title: 'Expertos Certificados',
        description: 'Personal altamente calificado',
        stat: 'WQA'
      },
      {
        icon: Headphones,
        title: 'Soporte 24/7',
        description: 'Siempre disponibles para usted',
        stat: '24/7'
      }
    ],
    stats: [
      { value: `${STATS.yearsExperience}+`, label: 'Anos de Experiencia' },
      { value: `${STATS.homesServed.toLocaleString('en-US')}+`, label: 'Clientes Satisfechos' },
      { value: '100%', label: 'Garantia' },
      { value: 'A+', label: 'Rating BBB' }
    ]
  }
};

export default function ServiceAttentionSection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full mb-8 border-2 border-white/30 shadow-xl">
              <Headphones className="w-7 h-7" />
              <span className="text-xl">{text.badge}</span>
            </div>

            <h2 className="text-6xl md:text-7xl text-white mb-8 drop-shadow-2xl">{text.title}</h2>

            <p className="text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-4">
              {text.subtitle}
            </p>
            <p className="text-xl text-green-100">{text.subtitle2}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {text.features.map((feature, i) => {
              const Icon = feature.icon;

              return (
                <div
                  key={i}
                  className="bg-white/15 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30 hover:bg-white/25 transition-all duration-300 text-center group hover:scale-105 shadow-xl"
                >
                  <div className="w-20 h-20 bg-white/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <div className="text-3xl text-yellow-300 mb-3">{feature.stat}</div>
                  <h3 className="text-2xl text-white mb-3">{feature.title}</h3>
                  <p className="text-white/90 text-base">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-white/30 shadow-2xl">
            {text.stats.map((stat, idx) => (
              <div className="text-center" key={idx}>
                <p className="text-6xl text-white mb-3">{stat.value}</p>
                <p className="text-white/90 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
