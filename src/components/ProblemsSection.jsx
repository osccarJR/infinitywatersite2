import { AlertTriangle, Phone, Droplets, Zap, Shield } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { PRIMARY_PHONE, getWhatsAppUrl } from '../constants/contactInfo';
import CallDropdown from './ui/CallDropdown';

const problems = [
  {
    icon: Droplets,
    title: 'Agua con mal olor o sabor',
    description: 'Olor a azufre, sabor metálico o cloro que incomoda al beber o cocinar.',
    badge: 'Muestra gratis',
    image: '/images/Agua%20con%20mal%20olor%20o%20sabor.png',
    color: 'from-blue-500/15 to-cyan-200/30'
  },
  {
    icon: Zap,
    title: 'Manchas y sarro en la casa',
    description: 'Sarro en grifos, ropa manchada y electrodomésticos dañados por dureza.',
    badge: 'Instalación rápida',
    image: '/images/Manchas%20y%20sarro%20en%20la%20casa.png',
    color: 'from-orange-400/15 to-amber-200/30'
  },
  {
    icon: Shield,
    title: 'Contaminantes invisibles',
    description: 'Metales pesados, bacterias o sedimentos que dañan la salud y tuberías.',
    badge: 'Equipo certificado',
    image: '/images/Contaminantes%20invisibles.png',
    color: 'from-purple-500/15 to-indigo-200/30'
  }
];

export default function ProblemsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full mb-2 text-xs md:text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Problemas comunes</span>
            </div>
            <h2 className="text-2xl md:text-3xl text-slate-900 mb-2">
              ¿Te identificas con alguno de estos problemas de agua?
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Diagnóstico gratuito en sitio para definir la solución ideal, con imágenes claras de cada caso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <article
                  key={problem.title}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative h-28 md:h-32 overflow-hidden">
                    <img
                      src={problem.image}
                      alt={problem.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-transparent" />
                    <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[11px] px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                      {problem.badge}
                    </span>
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-100 border border-slate-200 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className={`hidden md:block w-8 h-8 rounded-full bg-gradient-to-br ${problem.color}`} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base md:text-lg text-slate-900">{problem.title}</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{problem.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 md:p-5 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm md:text-base text-blue-100">Te ayudamos a resolverlo</p>
              <h3 className="text-xl md:text-2xl font-semibold">Agenda tu diagnóstico GRATUITO</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <CallDropdown
                label="Llamar"
                buttonClassName="flex-1 sm:flex-none text-blue-900 border-blue-200 hover:bg-blue-50 justify-center"
                textClassName="text-blue-900"
                align="left"
              />

              <button
                onClick={() =>
                  window.open(
                    getWhatsAppUrl('Hola, necesito un diagnostico gratuito', PRIMARY_PHONE),
                    '_blank'
                  )
                }
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-md hover:-translate-y-0.5 transition-all text-sm font-semibold"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
