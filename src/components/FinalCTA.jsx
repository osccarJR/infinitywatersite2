import WhatsAppIcon from './ui/WhatsAppIcon';
import { getWhatsAppUrl } from '../constants/contactInfo';
import CallDropdown from './ui/CallDropdown';

export default function FinalCTA() {
  const handleWhatsApp = () => {
    window.open(getWhatsAppUrl('Hola, necesito informacion'), '_blank');
  };

  return (
    <section className="section-padding bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full mb-8 text-base animate-bounce shadow-xl">
            <span>🔥</span>
            <span>Oferta por Tiempo Limitado!</span>
          </div>

          <h2 className="text-5xl md:text-7xl text-white mb-8 leading-tight">
            Obtenga Agua Limpia y Saludable{' '}
            <span className="text-yellow-300">HOY MISMO</span>
          </h2>

          <p className="text-2xl md:text-3xl text-cyan-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Instalación en <strong className="text-white">24 horas</strong> +
            Diagnóstico <strong className="text-yellow-300">GRATIS</strong> +
            Garantía de por vida
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {['Sin costo de diagnóstico', 'Instalación profesional incluida', 'Financiamiento disponible'].map(
              (value) => (
                <div
                  key={value}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30"
                >
                  <div className="text-4xl mb-3">✓</div>
                  <p className="text-xl text-white">{value}</p>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <CallDropdown
              label="Llamar ahora"
              roundedClass="rounded-2xl"
              buttonClassName="w-full sm:w-[360px] justify-between text-slate-900 bg-white shadow-2xl hover:shadow-white/60 border-white/60 px-8 py-6 text-base gap-4 min-h-[90px] items-center"
              textClassName="text-slate-800"
              align="left"
            />

            <button
              onClick={handleWhatsApp}
              className="group flex items-center justify-center gap-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-12 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 text-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <WhatsAppIcon className="w-8 h-8 relative z-10 shrink-0" />
              <div className="text-left relative z-10 leading-tight">
                <div className="text-sm text-green-200">Respuesta Inmediata</div>
                <div className="text-2xl">WhatsApp</div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-cyan-200 text-xl">Lunes a Sábado: 8:00 AM - 6:00 PM</p>
            <p className="text-yellow-300 text-lg animate-pulse">¡Solo quedan 15 cupos esta semana!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
