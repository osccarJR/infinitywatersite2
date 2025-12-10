import { Phone, ClipboardCheck, Wrench, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    number: '01',
    title: 'Contacto Inicial',
    description: 'Llame o escríbanos. Respondemos en minutos.'
  },
  {
    icon: ClipboardCheck,
    number: '02',
    title: 'Diagnóstico Gratuito',
    description: 'Evaluamos su agua y recomendamos la mejor solución.'
  },
  {
    icon: Wrench,
    number: '03',
    title: 'Instalación Profesional',
    description: 'Técnicos certificados instalan su sistema.'
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Agua Limpia',
    description: 'Disfrute de agua pura y saludable de inmediato.'
  }
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-4">Cómo Funciona</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Proceso simple y transparente de principio a fin
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div
              className="hidden md:block absolute left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200"
              style={{ top: '80px' }}
            ></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative bg-white z-10 mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <Icon className="w-12 h-12 text-blue-900" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg text-sm">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-lg text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
