import { Phone, Mail, MapPin, Clock, Cloud } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import {
  PHONE_NUMBERS,
  PRIMARY_PHONE,
  getWhatsAppUrl
} from '../constants/contactInfo';

const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56632.71918687402!2d-81.91605309999999!3d26.602073649999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88db3b4203150575%3A0x68b562b09a393053!2s3940%20Metro%20Pkwy%2C%20Fort%20Myers%2C%20FL%2033916%2C%20EE.%20UU.!5e0!3m2!1ses-419!2sus!4v1700000000000!5m2!1ses-419!2sus';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <img
                src="/images/logo.png"
                alt="Infinity Water"
                className="h-14 mb-6"
              />
              <p className="text-slate-400 mb-4 leading-relaxed">
                Especialistas en tratamiento de agua con más de 10 años sirviendo hogares en Florida.
              </p>
              <div className="inline-flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-xl">
                <Clock className="w-5 h-5 text-cyan-300" />
                <span className="text-slate-200 text-sm">Lunes a Sábado: 8:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div>
              <h3 className="text-white text-xl mb-6">Contacto</h3>
              <div className="space-y-4">
                {PHONE_NUMBERS.map((phone) => (
                  <a
                    key={phone.tel}
                    href={`tel:${phone.tel}`}
                    className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span>{phone.display}</span>
                  </a>
                ))}

                <a
                  href={getWhatsAppUrl('Hola, necesito ayuda con agua', PRIMARY_PHONE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-green-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <span>Escribir por WhatsApp</span>
                </a>

                <a
                  href="mailto:info@infinitywater.com"
                  className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>info@infinitywater.com</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-xl mb-3">¿Dónde estamos?</h3>
              <div className="flex items-start gap-3 text-slate-300 mb-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-cyan-300" />
                <div>
                  <p>3940 Metro Pkwy</p>
                  <p>Fort Myers, FL 33916, EE. UU.</p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <iframe
                  src={MAP_EMBED}
                  height="180"
                  className="w-full"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Infinity Water"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Infinity Water. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Cloud className="w-5 h-5 text-cyan-300" />
              <span>
                Diseñado por{' '}
                <a
                  href="https://www.nivusoftware.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-white"
                >
                  Nivusoftware
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

