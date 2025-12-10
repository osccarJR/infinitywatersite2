import { Home, Droplets, Filter, Wrench, Sparkles } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { PRIMARY_PHONE, getWhatsAppUrl } from '../constants/contactInfo';

const services = [
  {
    icon: Filter,
    title: 'Sistemas de Filtración Completos',
    description:
      'Filtración de alta tecnología para toda la casa. Elimina contaminantes, cloro y sedimentos con certificación WQA.',
    image: '/images/Sistemas de Filtración Completos.png',
    features: [
      'Elimina contaminantes 99%',
      'Protege electrodomésticos',
      'Instalación certificada',
      'Garantía 5 años'
    ],
    gradient: 'from-blue-600 to-cyan-600',
    popular: true
  },
  {
    icon: Droplets,
    title: 'Tratamiento Especializado de Pozo',
    description:
      'Soluciones para hierro, azufre y dureza extrema. Análisis profesional y puesta en marcha rápida.',
    image: '/images/TratamientoEspecializadodePozo.png',
    features: [
      'Elimina hierro y azufre',
      'Reduce TDS y dureza',
      'Análisis de agua GRATIS',
      'Mantenimiento incluido'
    ],
    gradient: 'from-purple-600 to-blue-600',
    popular: false
  },
  {
    icon: Home,
    title: 'Ósmosis Inversa Premium',
    description:
      'Purificación 99.9% bajo counter o para toda la casa. Agua alcalina pH 8-10 lista para beber.',
    image: '/images/Osmosis premium.png',
    features: [
      'Pureza 99.9%',
      'Agua alcalina incluida',
      'Elimina metales pesados',
      '2 modalidades disponibles'
    ],
    gradient: 'from-cyan-600 to-teal-600',
    popular: true
  },
  {
    icon: Wrench,
    title: 'Plomería y Mantenimiento',
    description:
      'Instalación, reparación y mantenimiento de sistemas de agua por técnicos licenciados.',
    image: '/images/Plomería y Mantenimiento.png',
    features: [
      'Técnicos licenciados',
      'Servicio mismo día',
      'Trabajo garantizado',
      'Precios transparentes'
    ],
    gradient: 'from-slate-600 to-gray-700',
    popular: false
  }
];

export default function ServicesSection() {
  return (
    <section
      id="servicios"
      className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-full mb-6 text-sm shadow-md border-2 border-blue-200">
              <Sparkles className="w-5 h-5" />
              <span>Tecnología de Punta</span>
            </div>

            <h2 className="text-4xl md:text-5xl text-slate-900 mb-6">
              Nuestros Servicios Profesionales
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Soluciones integrales sin mostrar precios, para enfocarnos en la asesoría personalizada y el diagnóstico gratuito.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <div key={index} className="group relative">
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm shadow-lg border-2 border-white">
                        ⭐ Más Popular
                      </div>
                    </div>
                  )}

                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-slate-200 hover:border-blue-300 h-full transform hover:-translate-y-2">
                    <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      />

                      <div
                        className={`absolute top-6 left-6 bg-gradient-to-br ${service.gradient} rounded-2xl p-4 shadow-xl`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl text-slate-900 mb-4">
                        {service.title}
                      </h3>

                      <p className="text-slate-600 mb-6 leading-relaxed text-base">
                        {service.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-br ${service.gradient} mt-1.5`}
                            />
                            <span className="text-sm text-slate-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          window.open(
                            getWhatsAppUrl(
                              `Informacion sobre ${service.title}`,
                              PRIMARY_PHONE
                            ),
                            '_blank'
                          )
                        }
                        className={`w-full bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white py-5 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group text-lg`}
                      >
                        <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                        <span>Quiero asesoría</span>
                        <span className="group-hover:translate-x-1 transition-transform">
                          ↗
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl inline-block">
              <p className="text-2xl mb-2">🎯 Todos nuestros equipos incluyen:</p>
              <p className="text-blue-100">
                Instalación profesional + Garantía extendida + Soporte técnico
                de por vida
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
