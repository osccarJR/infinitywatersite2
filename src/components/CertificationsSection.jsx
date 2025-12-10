import { Shield, Award, Droplet, CheckCircle, Star, ThumbsUp } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { getWhatsAppUrl } from '../constants/contactInfo';

const certifications = [
  {
    icon: Shield,
    title: 'BBB Accredited Business',
    subtitle: 'Better Business Bureau',
    description:
      'Negocio acreditado con calificación A+ por nuestro compromiso con la excelencia y la transparencia.',
    color: 'from-blue-600 to-blue-700',
    badge: 'A+ Rating',
    image: '/images/BBB Accredited Business.png'
  },
  {
    icon: Award,
    title: 'Water Quality Association',
    subtitle: 'Miembros certificados',
    description:
      'Certificación profesional en tratamiento y calidad de agua reconocida internacionalmente.',
    color: 'from-cyan-600 to-teal-600',
    badge: 'Certified',
    image: '/images/water-quality-association.png'
  },
  {
    icon: Droplet,
    title: 'Make Alkaline Water',
    subtitle: 'Tecnología pH balanceado',
    description:
      'Sistemas que producen agua alcalina para mejorar hidratación y bienestar general.',
    color: 'from-purple-600 to-blue-600',
    badge: 'pH 8-10',
    image: '/images/Make Alkaline Water.png'
  }
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Garantía de satisfacción',
    description: '100% garantizado o devolvemos su dinero'
  },
  {
    icon: Star,
    title: 'Calificación 5 estrellas',
    description: 'Más de 200 reseñas positivas en Google'
  },
  {
    icon: ThumbsUp,
    title: 'Instalación certificada',
    description: 'Técnicos especializados y licenciados'
  }
];

export default function CertificationsSection() {
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
              <span>Certificaciones y Garantías</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-slate-900 mb-6">
              Respaldados por las Mejores Instituciones
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Certificaciones oficiales que garantizan calidad, profesionalismo y confianza
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {certifications.map((cert, index) => {
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

                      <div className="w-20 h-20 p-2 rounded-3xl flex items-center justify-center mb-4 overflow-hidden bg-white/5 backdrop-blur-sm border border-white/15">
                        <img
                          src={cert.image}
                          alt={cert.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          style={{ mixBlendMode: 'multiply' }}
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
              <h3 className="text-3xl md:text-4xl mb-4">¿Por Qué Confiar en Nosotros?</h3>
              <p className="text-blue-100 text-lg">Más de una década de excelencia comprobada</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
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
                onClick={() =>
                  window.open(
                    getWhatsAppUrl('Quiero informacion sobre certificaciones'),
                    '_blank'
                  )
                }
                className="bg-white text-blue-900 px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2 text-lg"
              >
                <WhatsAppIcon className="w-5 h-5 text-blue-900" />
                <span>Verificar Certificaciones</span>
                <span>➜</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}