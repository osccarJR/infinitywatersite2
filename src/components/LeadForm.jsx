import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, MessageSquare, Phone } from 'lucide-react';
import {
  CONSENT_DISCLOSURE,
  CONSENT_MARKETING,
  CONSENT_TRANSACTIONAL,
} from '../constants/consent';
import { EMAIL, SMS_PHONE_NUMBER, SUPPORT_PHONE } from '../constants/business';
import { submitLead } from '../lib/leadCapture';
import { trackConversion } from '../lib/analytics';
import { useLanguage } from '../i18n/LanguageProvider';
import { localizedPath } from '../i18n/routes';

/**
 * Formulario de solicitud de analisis de agua.
 *
 * Es el unico punto del sitio donde se recoge un numero de telefono, y por
 * eso concentra todos los requisitos de consentimiento A2P. Si en el futuro
 * hiciera falta pedir el telefono en otra pagina, debe reutilizarse este
 * componente: la especificacion prohibe expresamente un segundo formulario
 * que omita las casillas.
 *
 * Reglas que este componente garantiza por construccion:
 *  - Las dos casillas nacen desmarcadas y son independientes.
 *  - Ninguna bloquea el envio: `validate()` no las mira.
 *  - Los enlaces legales abren en pestana nueva, para no perder lo escrito.
 *  - Si el envio falla, no se muestra confirmacion: se ofrece telefono y
 *    correo. Un "gracias" falso perderia el lead sin que nadie se entere.
 */

const WATER_SOURCES = ['well', 'city', 'unsure'];

const copy = {
  en: {
    fields: {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Mobile phone',
      email: 'Email',
      address: 'Service address',
      city: 'City',
      state: 'State',
      zip: 'ZIP code',
      waterSource: 'Water source',
      bestTime: 'Best contact time',
      comments: 'Comments',
    },
    optional: 'optional',
    recommended: 'recommended',
    waterSources: {
      well: 'Well',
      city: 'City water',
      unsure: 'Not sure',
    },
    placeholders: {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '(239) 555-0123',
      email: 'you@example.com',
      address: '123 Main St',
      city: 'Naples',
      zip: '34102',
      bestTime: 'Weekday mornings',
      comments: 'My water smells like sulfur and stains the sinks...',
    },
    errors: {
      firstName: 'Please enter your first name',
      lastName: 'Please enter your last name',
      phone: 'Please enter a valid 10-digit US mobile number',
      email: 'Please enter a valid email address',
      city: 'Please enter your city',
      zip: 'Please enter a valid ZIP code',
      waterSource: 'Please choose your water source',
    },
    consentHeading: 'Text message preferences (optional)',
    consentNote: 'Both options are optional. You can submit this form without selecting either one.',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    submit: 'Request My Free Water Analysis',
    submitting: 'Sending...',
    smsLabel: 'Text/SMS',
    successTitle: 'Thank you.',
    success:
      'We received your request for a free water analysis. If you selected text-message consent, Infinity Water may text you to coordinate your appointment. Reply STOP at any time to cancel.',
    errorTitle: 'We could not send your request.',
    error: 'Please call or email us and we will take care of it right away.',
  },
  es: {
    fields: {
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Telefono movil',
      email: 'Correo electronico',
      address: 'Direccion del servicio',
      city: 'Ciudad',
      state: 'Estado',
      zip: 'Codigo postal',
      waterSource: 'Tipo de agua',
      bestTime: 'Mejor horario de contacto',
      comments: 'Comentarios',
    },
    optional: 'opcional',
    recommended: 'recomendado',
    waterSources: {
      well: 'Pozo',
      city: 'Agua de ciudad',
      unsure: 'No estoy seguro',
    },
    placeholders: {
      firstName: 'Juana',
      lastName: 'Perez',
      phone: '(239) 555-0123',
      email: 'tu@ejemplo.com',
      address: 'Calle Principal 123',
      city: 'Naples',
      zip: '34102',
      bestTime: 'Mananas entre semana',
      comments: 'Mi agua huele a azufre y mancha los lavabos...',
    },
    errors: {
      firstName: 'Escribe tu nombre',
      lastName: 'Escribe tu apellido',
      phone: 'Escribe un movil de 10 digitos valido',
      email: 'Escribe un correo electronico valido',
      city: 'Escribe tu ciudad',
      zip: 'Escribe un codigo postal valido',
      waterSource: 'Elige el tipo de agua',
    },
    consentHeading: 'Preferencias de mensajes de texto (opcional)',
    consentNote:
      'Ambas opciones son opcionales. Puedes enviar este formulario sin marcar ninguna.',
    privacy: 'Politica de Privacidad',
    terms: 'Terminos y Condiciones',
    submit: 'Solicitar mi analisis gratuito',
    submitting: 'Enviando...',
    smsLabel: 'Texto/SMS',
    successTitle: 'Gracias.',
    success:
      'Recibimos tu solicitud de analisis de agua gratuito. Si aceptaste mensajes de texto, Infinity Water podra escribirte para coordinar tu cita. Responde STOP en cualquier momento para cancelar.',
    errorTitle: 'No pudimos enviar tu solicitud.',
    error: 'Llamanos o escribenos por correo y lo resolvemos de inmediato.',
  },
};

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'FL',
  zip: '',
  waterSource: '',
  bestTime: '',
  comments: '',
  // Nunca marcadas por defecto. La especificacion A2P lo prohibe y un
  // revisor lo comprueba a mano.
  consentTransactional: false,
  consentMarketing: false,
};

const hasTenDigits = (value) => {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
const isZip = (value) => /^\d{5}(-\d{4})?$/.test(value.trim());

export default function LeadForm({ id = 'water-test-form' }) {
  const { language } = useLanguage();
  const text = copy[language];

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  /** Solo valida datos de contacto. Las casillas SMS nunca bloquean el envio. */
  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = text.errors.firstName;
    if (!form.lastName.trim()) next.lastName = text.errors.lastName;
    if (!hasTenDigits(form.phone)) next.phone = text.errors.phone;
    if (form.email.trim() && !isEmail(form.email)) next.email = text.errors.email;
    if (!form.city.trim()) next.city = text.errors.city;
    if (!isZip(form.zip)) next.zip = text.errors.zip;
    if (!form.waterSource) next.waterSource = text.errors.waterSource;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    if (!validate()) return;

    setStatus('sending');
    const result = await submitLead(form, language);

    if (result.ok) {
      trackConversion('form', {
        location: 'free-water-test',
        water_source: form.waterSource,
        sms_consent_transactional: form.consentTransactional,
        sms_consent_marketing: form.consentMarketing,
      });
      setStatus('success');
      setForm(INITIAL_FORM);
    } else {
      setStatus('error');
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-blue-500/40 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
    }`;

  const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

  const field = (name, { type = 'text', required = false, hint, autoComplete, inputMode } = {}) => (
    <div>
      <label htmlFor={`${id}-${name}`} className={labelClass}>
        {text.fields[name]}
        {required ? (
          <span className="text-red-600" aria-hidden="true"> *</span>
        ) : (
          <span className="font-normal text-slate-400"> ({hint ?? text.optional})</span>
        )}
      </label>
      <input
        id={`${id}-${name}`}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={update(name)}
        placeholder={text.placeholders[name]}
        className={inputClass(name)}
        aria-required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
      />
      {errors[name] && (
        <p id={`${id}-${name}-error`} className="text-sm text-red-600 mt-1.5">
          {errors[name]}
        </p>
      )}
    </div>
  );

  if (status === 'success') {
    return (
      <div
        role="status"
        className="bg-white rounded-3xl border-2 border-green-200 shadow-xl p-8 text-center"
      >
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-2xl text-slate-900 mb-3">{text.successTitle}</h3>
        <p className="text-slate-700 leading-relaxed max-w-xl mx-auto">{text.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        {field('firstName', { required: true, autoComplete: 'given-name' })}
        {field('lastName', { required: true, autoComplete: 'family-name' })}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {field('phone', { type: 'tel', required: true, autoComplete: 'tel', inputMode: 'tel' })}
        {field('email', { type: 'email', autoComplete: 'email', hint: text.recommended })}
      </div>

      {field('address', { autoComplete: 'street-address' })}

      <div className="grid sm:grid-cols-3 gap-5">
        {field('city', { required: true, autoComplete: 'address-level2' })}

        <div>
          <label htmlFor={`${id}-state`} className={labelClass}>
            {text.fields.state}
          </label>
          <input
            id={`${id}-state`}
            name="state"
            type="text"
            autoComplete="address-level1"
            value={form.state}
            onChange={update('state')}
            className={inputClass('state')}
          />
        </div>

        {field('zip', { required: true, autoComplete: 'postal-code', inputMode: 'numeric' })}
      </div>

      <fieldset>
        <legend className={labelClass}>
          {text.fields.waterSource}
          <span className="text-red-600" aria-hidden="true"> *</span>
        </legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {WATER_SOURCES.map((value) => (
            <label
              key={value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                form.waterSource === value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={`${id}-waterSource`}
                value={value}
                checked={form.waterSource === value}
                onChange={() => {
                  setForm((prev) => ({ ...prev, waterSource: value }));
                  setErrors((prev) => ({ ...prev, waterSource: undefined }));
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-slate-800">{text.waterSources[value]}</span>
            </label>
          ))}
        </div>
        {errors.waterSource && <p className="text-sm text-red-600 mt-1.5">{errors.waterSource}</p>}
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-5">
        {field('bestTime')}
        <div>
          <label htmlFor={`${id}-comments`} className={labelClass}>
            {text.fields.comments}
            <span className="font-normal text-slate-400"> ({text.optional})</span>
          </label>
          <textarea
            id={`${id}-comments`}
            name="comments"
            rows={3}
            value={form.comments}
            onChange={update('comments')}
            placeholder={text.placeholders.comments}
            className={`${inputClass('comments')} resize-y`}
          />
        </div>
      </div>

      {/* --------------------------------------------------------------
          Consentimiento SMS. Dos casillas separadas, ambas opcionales y
          desmarcadas. El texto completo se muestra sin recortar.
          -------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-slate-900">{text.consentHeading}</h3>
            <p className="text-sm text-slate-600 mt-1">{text.consentNote}</p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={CONSENT_TRANSACTIONAL.key}
            checked={form.consentTransactional}
            onChange={update('consentTransactional')}
            className="mt-1 w-5 h-5 shrink-0 accent-blue-600"
          />
          <span className="text-sm text-slate-700 leading-relaxed">
            {CONSENT_TRANSACTIONAL[language]}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={CONSENT_MARKETING.key}
            checked={form.consentMarketing}
            onChange={update('consentMarketing')}
            className="mt-1 w-5 h-5 shrink-0 accent-blue-600"
          />
          <span className="text-sm text-slate-700 leading-relaxed">
            {CONSENT_MARKETING[language]}
          </span>
        </label>

        {SMS_PHONE_NUMBER && (
          <p className="text-sm text-slate-600 border-t border-slate-200 pt-3">
            {text.smsLabel}: <strong className="text-slate-900">{SMS_PHONE_NUMBER}</strong>
          </p>
        )}

        <p className="text-sm text-slate-600 border-t border-slate-200 pt-3 leading-relaxed">
          {CONSENT_DISCLOSURE[language]}{' '}
          {/* Pestana nueva a proposito: abrir los textos legales no puede
              borrar lo que el usuario ya escribio. */}
          <Link
            to={localizedPath('privacy', language)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            {text.privacy}
          </Link>{' '}
          ·{' '}
          <Link
            to={localizedPath('terms', language)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold"
          >
            {text.terms}
          </Link>
        </p>
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-red-800">{text.errorTitle}</p>
            <p className="text-red-700 mt-1">{text.error}</p>
            <p className="mt-2 text-red-800">
              <a href={`tel:${SUPPORT_PHONE.tel}`} className="font-semibold underline">
                {SUPPORT_PHONE.display}
              </a>
              {' · '}
              <a href={`mailto:${EMAIL}`} className="font-semibold underline">
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-70 text-white px-8 py-4 rounded-2xl shadow-lg transition-all text-lg font-semibold"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            {text.submitting}
          </>
        ) : (
          <>
            <Phone className="w-5 h-5" aria-hidden="true" />
            {text.submit}
          </>
        )}
      </button>
    </form>
  );
}
