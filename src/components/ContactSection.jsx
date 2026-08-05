import { useState } from 'react';
import { Mail, Send, User, MapPin, Phone as PhoneIcon } from 'lucide-react';
import WhatsAppIcon from './ui/WhatsAppIcon';
import { EMAIL, PRIMARY_PHONE, getWhatsAppUrl } from '../constants/business';
import { trackConversion } from '../lib/analytics';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Formulario de captacion de leads.
 *
 * El sitio no tiene backend, asi que en vez de fingir un envio el formulario
 * arma el mensaje y lo abre en WhatsApp (o en el cliente de correo). El
 * usuario ve exactamente lo que se envia y el lead llega al telefono del
 * negocio al instante, sin servidor que mantener.
 *
 * Antes de esto la unica via de contacto era llamar: quien no queria hablar
 * por telefono simplemente se iba sin dejar rastro.
 */

const SERVICE_KEYS = ['filtration', 'well', 'osmosis', 'plumbing', 'other'];

const copy = {
  en: {
    badge: 'Free quote',
    title: 'Tell us about your water',
    subtitle:
      'Fill in your details and we will get back to you with a free diagnosis. No cost, no commitment.',
    fields: {
      name: 'Full name',
      namePlaceholder: 'Jane Smith',
      phone: 'Phone',
      phonePlaceholder: '(239) 555-0123',
      city: 'City or ZIP code',
      cityPlaceholder: 'Naples, FL 34102',
      service: 'What do you need?',
      message: 'Tell us more (optional)',
      messagePlaceholder: 'My water smells like sulfur and stains the sinks...',
    },
    services: {
      filtration: 'Whole-home filtration',
      well: 'Well water treatment',
      osmosis: 'Reverse osmosis',
      plumbing: 'Plumbing and maintenance',
      other: 'Not sure yet',
    },
    errors: {
      name: 'Please enter your name',
      phone: 'Please enter a valid phone number',
      city: 'Please enter your city or ZIP code',
    },
    submit: 'Send via WhatsApp',
    submitEmail: 'Send by email instead',
    note: 'Opens WhatsApp with your message ready to send. We usually reply in under 5 minutes.',
    orCall: 'Prefer to talk? Call us at',
    labels: { name: 'Name', phone: 'Phone', city: 'Area', service: 'Service', message: 'Details' },
    greeting: 'Hi Infinity Water, I would like a free water diagnosis.',
  },
  es: {
    badge: 'Cotizacion gratis',
    title: 'Cuentanos como esta tu agua',
    subtitle:
      'Deja tus datos y te contactamos con un diagnostico gratuito. Sin costo y sin compromiso.',
    fields: {
      name: 'Nombre completo',
      namePlaceholder: 'Juana Perez',
      phone: 'Telefono',
      phonePlaceholder: '(239) 555-0123',
      city: 'Ciudad o codigo postal',
      cityPlaceholder: 'Naples, FL 34102',
      service: '¿Que necesitas?',
      message: 'Cuentanos mas (opcional)',
      messagePlaceholder: 'Mi agua huele a azufre y mancha los lavabos...',
    },
    services: {
      filtration: 'Filtracion para toda la casa',
      well: 'Tratamiento de agua de pozo',
      osmosis: 'Osmosis inversa',
      plumbing: 'Plomeria y mantenimiento',
      other: 'Todavia no lo se',
    },
    errors: {
      name: 'Escribe tu nombre',
      phone: 'Escribe un telefono valido',
      city: 'Escribe tu ciudad o codigo postal',
    },
    submit: 'Enviar por WhatsApp',
    submitEmail: 'Prefiero enviarlo por correo',
    note: 'Abre WhatsApp con tu mensaje listo para enviar. Normalmente respondemos en menos de 5 minutos.',
    orCall: '¿Prefieres hablar? Llamanos al',
    labels: { name: 'Nombre', phone: 'Telefono', city: 'Zona', service: 'Servicio', message: 'Detalles' },
    greeting: 'Hola Infinity Water, quiero un diagnostico de agua gratuito.',
  },
};

const INITIAL_FORM = { name: '', phone: '', city: '', service: 'filtration', message: '' };

/** Un telefono utilizable en EE.UU. tiene al menos 10 digitos. */
const isValidPhone = (value) => value.replace(/\D/g, '').length >= 10;

export default function ContactSection() {
  const { language } = useLanguage();
  const text = copy[language];

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = text.errors.name;
    if (!isValidPhone(form.phone)) next.phone = text.errors.phone;
    if (!form.city.trim()) next.city = text.errors.city;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildMessage = () => {
    const lines = [
      text.greeting,
      '',
      `${text.labels.name}: ${form.name.trim()}`,
      `${text.labels.phone}: ${form.phone.trim()}`,
      `${text.labels.city}: ${form.city.trim()}`,
      `${text.labels.service}: ${text.services[form.service]}`,
    ];
    if (form.message.trim()) {
      lines.push(`${text.labels.message}: ${form.message.trim()}`);
    }
    return lines.join('\n');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    trackConversion('form', { location: 'contacto', channel: 'whatsapp', service: form.service });
    window.open(getWhatsAppUrl(buildMessage(), PRIMARY_PHONE), '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    if (!validate()) return;

    trackConversion('form', { location: 'contacto', channel: 'email', service: form.service });
    const subject = encodeURIComponent(`${text.badge} - ${form.name.trim()}`);
    const body = encodeURIComponent(buildMessage());
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-blue-500/40 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
    }`;

  return (
    <section id="contacto" className="section-padding bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full mb-5 text-sm border border-blue-200">
              <Mail className="w-4 h-4" />
              <span>{text.badge}</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-4">{text.title}</h2>
            <p className="text-lg text-slate-600">{text.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-1.5 text-blue-600" />
                  {text.fields.name}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder={text.fields.namePlaceholder}
                  className={inputClass('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-sm text-red-600 mt-1.5">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1.5 text-blue-600" />
                  {text.fields.phone}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={updateField('phone')}
                  placeholder={text.fields.phonePlaceholder}
                  className={inputClass('phone')}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="contact-phone-error" className="text-sm text-red-600 mt-1.5">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-city" className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1.5 text-blue-600" />
                  {text.fields.city}
                </label>
                <input
                  id="contact-city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={updateField('city')}
                  placeholder={text.fields.cityPlaceholder}
                  className={inputClass('city')}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? 'contact-city-error' : undefined}
                />
                {errors.city && (
                  <p id="contact-city-error" className="text-sm text-red-600 mt-1.5">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-service" className="block text-sm font-semibold text-slate-700 mb-2">
                  {text.fields.service}
                </label>
                <select
                  id="contact-service"
                  name="service"
                  value={form.service}
                  onChange={updateField('service')}
                  className={inputClass('service')}
                >
                  {SERVICE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {text.services[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-2">
                {text.fields.message}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={updateField('message')}
                placeholder={text.fields.messagePlaceholder}
                className={`${inputClass('message')} resize-y`}
              />
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-4 rounded-2xl shadow-lg transition-all text-lg font-semibold"
              >
                <WhatsAppIcon className="w-6 h-6 shrink-0" />
                {text.submit}
              </button>

              <button
                type="button"
                onClick={handleEmail}
                className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-2xl transition-colors text-sm font-semibold"
              >
                <Send className="w-4 h-4" />
                {text.submitEmail}
              </button>

              <p className="text-sm text-slate-500 text-center">{text.note}</p>
              <p className="text-sm text-slate-600 text-center">
                {text.orCall}{' '}
                <a href={`tel:${PRIMARY_PHONE.tel}`} className="text-blue-600 font-semibold hover:text-blue-700">
                  {PRIMARY_PHONE.display}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
