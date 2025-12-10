import { Gift, Clock } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { getWhatsAppUrl } from '../constants/contactInfo';
import CallDropdown from './ui/CallDropdown';

export default function GoogleAdsCTA() {
  return (
    <section className="section-padding bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-white/30 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full mb-4 text-sm animate-bounce">
                  <Gift className="w-4 h-4" />
                  <span>Oferta Especial</span>
                </div>

                <h3 className="text-4xl md:text-5xl mb-4">Diagnóstico GRATIS!</h3>

                <p className="text-2xl text-white/90 mb-6">
                  Análisis completo del agua + Cotización sin costo
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'Prueba profesional de calidad del agua',
                    'Recomendaciones personalizadas',
                    'Sin compromiso de compra'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-500 text-sm">✓</span>
                      </div>
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-yellow-300">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <p>
                    Solo los próximos <strong className="text-yellow-100">20 clientes</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <CallDropdown
                  label="Llamar ahora"
                  buttonClassName="w-full md:w-[380px] justify-between text-slate-900 bg-white shadow-2xl hover:shadow-white/60 border-white/60 px-8 py-5 text-base gap-4 rounded-2xl"
                  textClassName="text-slate-800"
                  align="right"
                />

                <button
                  onClick={() =>
                    window.open(getWhatsAppUrl('Quiero el diagnostico GRATIS'), '_blank')
                  }
                  className="w-full md:w-[380px] group relative bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-6 rounded-2xl shadow-2xl transition-all overflow-hidden flex items-center justify-center min-h-[90px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <WhatsAppIcon className="w-7 h-7 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-sm text-green-100">Respuesta Inmediata</div>
                      <div className="text-2xl font-semibold">WhatsApp</div>
                    </div>
                  </div>
                </button>

                <p className="text-center text-white/80 text-sm md:mt-2">
                  Respuesta en menos de 5 minutos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
