import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import { localizedPath } from '../i18n/routes';
import { ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, PRIMARY_PHONE } from '../constants/business';

/**
 * Google Ads exige una politica de privacidad accesible a cualquier
 * anunciante que recoja datos de contacto. Sin ella la cuenta puede quedar
 * suspendida, asi que esta pagina no es opcional.
 *
 * Es una base solida y honesta sobre lo que el sitio realmente hace, pero
 * conviene que un abogado en Florida la revise antes de darla por final.
 */
const LAST_UPDATED = '2026-08-05';

const copy = {
  en: {
    back: 'Back to home',
    title: 'Privacy Policy',
    updated: 'Last updated',
    intro:
      'Infinity Water ("we", "us") respects your privacy. This policy explains what information we collect through this website, why we collect it, and what we do with it.',
    sections: [
      {
        heading: 'Information we collect',
        body: [
          'Information you give us directly: your name, phone number, email address, service address and any message you send through our contact form, by phone or through WhatsApp.',
          'Information collected automatically: pages viewed, approximate location derived from your IP address, device and browser type, and how you arrived at our site. This is gathered through Google Analytics and Google Ads.',
        ],
      },
      {
        heading: 'How we use your information',
        body: [
          'To respond to your request, schedule a free water diagnosis and provide a quote.',
          'To perform the installation, maintenance or repair service you hire us for.',
          'To measure which advertisements and pages generate contacts, so we can improve them.',
          'To send you service-related follow-up about a request you made.',
        ],
      },
      {
        heading: 'Calls, text messages and WhatsApp',
        body: [
          'When you call us or write to us on WhatsApp you are initiating the contact. We may reply to that same number about your request.',
          'Messages you send through WhatsApp are also processed by WhatsApp (Meta Platforms, Inc.) under its own privacy policy.',
          'We do not send promotional automated text messages, and we do not sell your phone number.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        body: [
          'We use Google Analytics and Google Ads cookies to understand how visitors use the site and to measure the results of our advertising campaigns.',
          'You can block or delete cookies from your browser settings. The site keeps working without them; only our measurement becomes less accurate.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'We do not sell or rent your personal information to anyone.',
          'We share it only with providers that help us operate: Google (analytics and advertising), WhatsApp/Meta (messaging), and our hosting provider.',
          'We may disclose information when required by law or to protect our legal rights.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'Contact requests are kept for as long as needed to serve you and to comply with tax and warranty obligations, typically up to five years for installed systems.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may ask us to access, correct or delete the personal information we hold about you, or to stop contacting you. Write to us at the address below and we will respond within a reasonable time.',
        ],
      },
      {
        heading: 'Children',
        body: ['This site is not directed to children under 13 and we do not knowingly collect their information.'],
      },
      {
        heading: 'Changes to this policy',
        body: ['If we make significant changes we will update the date shown at the top of this page.'],
      },
      {
        heading: 'Contact us',
        body: [
          'If you have questions about this policy or about your information, reach us at:',
        ],
      },
    ],
  },
  es: {
    back: 'Volver al inicio',
    title: 'Politica de Privacidad',
    updated: 'Ultima actualizacion',
    intro:
      'Infinity Water ("nosotros") respeta tu privacidad. Esta politica explica que informacion recogemos a traves de este sitio web, por que la recogemos y que hacemos con ella.',
    sections: [
      {
        heading: 'Informacion que recogemos',
        body: [
          'Informacion que nos das directamente: tu nombre, telefono, correo electronico, direccion del servicio y cualquier mensaje que envies por el formulario de contacto, por telefono o por WhatsApp.',
          'Informacion que se recoge automaticamente: paginas visitadas, ubicacion aproximada derivada de tu direccion IP, tipo de dispositivo y navegador, y como llegaste a nuestro sitio. Esto se obtiene mediante Google Analytics y Google Ads.',
        ],
      },
      {
        heading: 'Como usamos tu informacion',
        body: [
          'Para responder tu solicitud, agendar el diagnostico de agua gratuito y darte una cotizacion.',
          'Para realizar el servicio de instalacion, mantenimiento o reparacion que contrates.',
          'Para medir que anuncios y paginas generan contactos, y asi mejorarlos.',
          'Para darte seguimiento sobre una solicitud que ya hiciste.',
        ],
      },
      {
        heading: 'Llamadas, mensajes de texto y WhatsApp',
        body: [
          'Cuando nos llamas o nos escribes por WhatsApp eres tu quien inicia el contacto. Podemos responder a ese mismo numero sobre tu solicitud.',
          'Los mensajes que envias por WhatsApp tambien son procesados por WhatsApp (Meta Platforms, Inc.) bajo su propia politica de privacidad.',
          'No enviamos mensajes de texto promocionales automatizados y no vendemos tu numero de telefono.',
        ],
      },
      {
        heading: 'Cookies y analitica',
        body: [
          'Usamos cookies de Google Analytics y Google Ads para entender como se usa el sitio y medir los resultados de nuestras campanas publicitarias.',
          'Puedes bloquearlas o borrarlas desde la configuracion de tu navegador. El sitio sigue funcionando sin ellas; solo nuestra medicion pierde precision.',
        ],
      },
      {
        heading: 'Con quien la compartimos',
        body: [
          'No vendemos ni alquilamos tu informacion personal a nadie.',
          'Solo la compartimos con proveedores que nos ayudan a operar: Google (analitica y publicidad), WhatsApp/Meta (mensajeria) y nuestro proveedor de hosting.',
          'Podemos divulgar informacion cuando la ley lo exija o para proteger nuestros derechos legales.',
        ],
      },
      {
        heading: 'Cuanto tiempo la conservamos',
        body: [
          'Las solicitudes de contacto se conservan el tiempo necesario para atenderte y para cumplir obligaciones fiscales y de garantia, normalmente hasta cinco anos en el caso de equipos instalados.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes pedirnos acceder, corregir o eliminar la informacion personal que tengamos sobre ti, o pedir que dejemos de contactarte. Escribenos a los datos de abajo y responderemos en un plazo razonable.',
        ],
      },
      {
        heading: 'Menores de edad',
        body: ['Este sitio no esta dirigido a menores de 13 anos y no recogemos su informacion de forma consciente.'],
      },
      {
        heading: 'Cambios en esta politica',
        body: ['Si hacemos cambios importantes actualizaremos la fecha que aparece al inicio de esta pagina.'],
      },
      {
        heading: 'Contactanos',
        body: ['Si tienes dudas sobre esta politica o sobre tu informacion, escribenos a:'],
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const text = copy[language];

  const formattedDate = new Date(LAST_UPDATED).toLocaleDateString(
    language === 'es' ? 'es-US' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to={localizedPath('home', language)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            {text.back}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl text-slate-900">{text.title}</h1>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            {text.updated}: {formattedDate}
          </p>

          <p className="text-lg text-slate-700 leading-relaxed mb-10">{text.intro}</p>

          <div className="space-y-10">
            {text.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl md:text-2xl text-slate-900 mb-3">{section.heading}</h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-slate-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <address className="not-italic mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-1 text-slate-700">
            <p className="font-semibold text-slate-900">Infinity Water</p>
            <p>{ADDRESS_LINE_1}</p>
            <p>{ADDRESS_LINE_2}</p>
            <p>
              <a href={`tel:${PRIMARY_PHONE.tel}`} className="text-blue-600 hover:text-blue-700">
                {PRIMARY_PHONE.display}
              </a>
            </p>
            <p>
              <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:text-blue-700">
                {EMAIL}
              </a>
            </p>
          </address>
        </div>
      </div>
    </section>
  );
}
