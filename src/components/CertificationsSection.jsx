import { Shield, Award, Droplet, CheckCircle, Star, ThumbsUp } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { STATS } from '../constants/business';
import { openWhatsApp } from '../lib/contactActions';
import { useLanguage } from '../i18n/LanguageProvider';

const copy = {
  en: {
    badge: 'Certifications & Guarantees',
    title: 'Backed by the Best Institutions',
    subtitle: 'Official certifications that guarantee quality, professionalism, and trust.',
    certifications: [
      {
        icon: Shield,
        title: 'BBB Accredited Business',
        subtitle: 'Better Business Bureau',
        description:
          'Accredited with an A+ rating for our commitment to excellence and transparency.',
        color: 'from-blue-600 to-blue-700',
        badge: 'A+ Rating',
        image: '/images/cert-bbb.webp'
      },
      {
        icon: Award,
        title: 'Water Quality Association',
        subtitle: 'Certified members',
        description:
          'Professional certification in water treatment and quality recognized internationally.',
        color: 'from-cyan-600 to-teal-600',
        badge: 'Certified',
        image: '/images/cert-wqa.webp'
      },
      {
        icon: Droplet,
        title: 'Make Alkaline Water',
        subtitle: 'Balanced pH technology',
        description:
          'Systems that produce alkaline water to improve hydration and overall wellness.',
        color: 'from-purple-600 to-blue-600',
        badge: 'pH 8-10',
        image: '/images/cert-alkaline.webp'
      }
    ],
    benefitsTitle: 'Why Trust Us?',
    benefitsSubtitle: `Over ${STATS.yearsExperience} years of proven excellence`,
    benefits: [
      {
        icon: CheckCircle,
        title: 'Satisfaction guarantee',
        description: '100% guaranteed or your money back'
      },
      {
        icon: Star,
        title: 'Reviewed on Google',
        description: 'Read our verified customer reviews'
      },
      {
        icon: ThumbsUp,
        title: 'Certified installation',
        description: 'Highly trained and licensed technicians'
      }
    ],
    verify: 'Verify Certifications',
    verifyMsg: 'I want information about certifications'
  },
  es: {
    badge: 'Certificaciones y Garantías',
    title: 'Respaldados por las Mejores Instituciones',
    subtitle: 'Certificaciones oficiales que garantizan calidad, profesionalismo y confianza.',
    certifications: [
      {
        icon: Shield,
        title: 'BBB Accredited Business',
        subtitle: 'Better Business Bureau',
        description:
          'Negocio acreditado con calificación A+ por nuestro compromiso con la excelencia y la transparencia.',
        color: 'from-blue-600 to-blue-700',
        badge: 'A+ Rating',
        image: '/images/cert-bbb.webp'
      },
      {
        icon: Award,
        title: 'Water Quality Association',
        subtitle: 'Miembros certificados',
        description:
          'Certificación profesional en tratamiento y calidad de agua reconocida internacionalmente.',
        color: 'from-cyan-600 to-teal-600',
        badge: 'Certified',
        image: '/images/cert-wqa.webp'
      },
      {
        icon: Droplet,
        title: 'Make Alkaline Water',
        subtitle: 'Tecnología pH balanceado',
        description:
          'Sistemas que producen agua alcalina para mejorar hidratación y bienestar general.',
        color: 'from-purple-600 to-blue-600',
        badge: 'pH 8-10',
        image: '/images/cert-alkaline.webp'
      }
    ],
    benefitsTitle: '¿Por Qué Confiar en Nosotros?',
    benefitsSubtitle: `Mas de ${STATS.yearsExperience} anos de excelencia comprobada`,
    benefits: [
      {
        icon: CheckCircle,
        title: 'Garantía de satisfacción',
        description: '100% garantizado o devolvemos su dinero'
      },
      {
        icon: Star,
        title: 'Valorados en Google',
        description: 'Lee las resenas verificadas de nuestros clientes'
      },
      {
        icon: ThumbsUp,
        title: 'Instalación certificada',
        description: 'Técnicos especializados y licenciados'
      }
    ],
    verify: 'Verificar Certificaciones',
    verifyMsg: 'Quiero información sobre certificaciones'
  }
};

export default function CertificationsSection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full mb-6 text-sm shadow-sm border border-blue-200">
              <Shield className="w-5 h-5" />
              <span>{text.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-slate-900 mb-6">
              {text.title}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {text.subtitle}
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {text.certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div key={index} className="group relative">
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-slate-200 hover:border-blue-300 h-full">
                    <div className={`bg-gradient-to-br ${cert.color} p-8 text-white relative`}>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs">
                          {cert.badge}
                        </div>
                      </div>

                      <div className="w-20 h-20 p-2 rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-white border border-white/40 shadow-md">
                        <img
                          src={cert.image}
                          alt={cert.title}
                          width="240"
                          height="240"
                          className="w-full h-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl">{cert.title}</h3>
                          <p className="text-white/90 text-sm">{cert.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="text-slate-700 leading-relaxed">
                        {cert.description}
                      </p>
                    </div>

                    <div className={`h-2 bg-gradient-to-r ${cert.color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Benefits */}
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-3xl p-12 text-white shadow-2xl">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl mb-4">{text.benefitsTitle}</h3>
              <p className="text-blue-100 text-lg">{text.benefitsSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {text.benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-cyan-300" />
                    </div>
                    <h4 className="text-xl mb-2">{benefit.title}</h4>
                    <p className="text-blue-200">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <button
                type="button"
                onClick={() => openWhatsApp(text.verifyMsg, 'certificaciones')}
                className="bg-white text-blue-900 px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2 text-lg"
              >
                <WhatsAppIcon className="w-5 h-5 text-blue-900" />
                <span>{text.verify}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
