import { useEffect, useState } from 'react';
import { Shield, Award, Clock, ThumbsUp } from 'lucide-react';
import { STATS } from '../constants/business';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    title: 'Why Choose Us',
    subtitle: `Trusted by more than ${STATS.homesServed.toLocaleString('en-US')} families in Florida`,
    benefits: [
      {
        icon: Award,
        title: `${STATS.yearsExperience}+ Years Experience`,
        description: 'Over a decade serving Florida homes'
      },
      {
        icon: Shield,
        title: 'Certified & Licensed',
        description: 'Professional technicians certified by WQA'
      },
      {
        icon: Clock,
        title: 'Fast Service',
        description: 'Same-day response for emergencies'
      },
      {
        icon: ThumbsUp,
        title: 'Total Guarantee',
        description: '100% satisfaction guaranteed'
      }
    ],
    stats: {
      homes: 'Homes Served',
      years: 'Years of Experience',
      satisfaction: 'Satisfaction'
    }
  },
  es: {
    title: 'Por Qué Elegirnos',
    subtitle: `La confianza de mas de ${STATS.homesServed.toLocaleString('en-US')} familias en Florida`,
    benefits: [
      {
        icon: Award,
        title: `${STATS.yearsExperience}+ Anos de Experiencia`,
        description: 'Más de una década sirviendo hogares en Florida'
      },
      {
        icon: Shield,
        title: 'Certificados y Licenciados',
        description: 'Técnicos profesionales certificados por WQA'
      },
      {
        icon: Clock,
        title: 'Servicio Rápido',
        description: 'Respuesta en el mismo día para urgencias'
      },
      {
        icon: ThumbsUp,
        title: 'Garantía Total',
        description: '100% de satisfacción garantizada'
      }
    ],
    stats: {
      homes: 'Hogares Atendidos',
      years: 'Años de Experiencia',
      satisfaction: 'Satisfacción'
    }
  }
};

export default function BenefitsSection() {
  const { language } = useLanguage();
  const text = copy[language];
  const [homesServed, setHomesServed] = useState(0);

  useEffect(() => {
    const target = STATS.homesServed;
    const duration = 1400;
    let start;
    let frame;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setHomesServed(Math.floor(progress * target));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setHomesServed(target);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const homesDisplay = homesServed.toLocaleString('en-US');

  return (
    <section className="section-padding bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-white mb-4">{text.title}</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {text.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {text.benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl mb-6 border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-xl text-white mb-3">{benefit.title}</h3>
                  <p className="text-blue-200">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-white/10">
            <div className="text-center">
              <p className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                {homesDisplay}+
              </p>
              <p className="text-blue-200">{text.stats.homes}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                {STATS.yearsExperience}+
              </p>
              <p className="text-blue-200">{text.stats.years}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">100%</p>
              <p className="text-blue-200">{text.stats.satisfaction}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
