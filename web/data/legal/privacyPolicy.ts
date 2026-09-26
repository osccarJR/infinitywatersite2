/**
 * Texto de la Politica de Privacidad.
 *
 * El texto en ingles es el que fija la especificacion A2P del 5 de agosto
 * de 2026 y NO debe reescribirse por estilo. Las operadoras y Twilio buscan
 * clausulas concretas; en particular el parrafo de "SMS and mobile
 * information", que declara que los datos de opt-in no se comparten con
 * terceros para su marketing. Sin esa frase, la campana se rechaza.
 *
 * El espanol es una traduccion de cortesia. La version en ingles se muestra
 * siempre, tambien en la ruta en espanol, porque la revision se hace en
 * Estados Unidos.
 */
import { ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, SUPPORT_PHONE } from '../../config/business';
import { BRAND, LEGAL_ENTITY, LEGAL_ENTITY_DBA } from '../../config/business';

export const PRIVACY_EFFECTIVE_DATE = { en: 'August 5, 2026', es: '5 de agosto de 2026' };

export const PRIVACY_POLICY = {
  en: {
    title: 'Privacy Policy',
    effectiveLabel: 'Effective date',
    effectiveDate: PRIVACY_EFFECTIVE_DATE.en,
    intro:
      `${LEGAL_ENTITY}, doing business as ${BRAND} ("Infinity Water," "we," "us," or "our"), respects your privacy. This Privacy Policy explains how we collect, use, disclose, protect, and retain information when you visit infinitywatersite.com, request a water analysis, contact us, schedule an appointment, or consent to receive communications.`,
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: ['We may collect:'],
        items: [
          'name and last name;',
          'mobile telephone number;',
          'email address;',
          'service address, city, state, and ZIP code;',
          'whether the property uses well water or city water;',
          'appointment preferences and information you provide in forms or conversations;',
          'consent selections, the wording shown when consent was obtained, date and time, source page, and related submission records;',
          'browser, device, IP address, referral source, and analytics information when available.',
        ],
      },
      {
        heading: 'How we use information',
        paragraphs: ['We use information to:'],
        items: [
          'respond to requests for information or a free water analysis;',
          'coordinate, confirm, reschedule, and remind customers about appointments;',
          'provide customer service and follow up on requested services;',
          "recommend water-treatment options based on the customer's situation;",
          'send promotional messages only when the person has separately consented to marketing;',
          'maintain records of consent and communication preferences;',
          'protect the website, prevent misuse, measure performance, and comply with legal obligations.',
        ],
      },
      {
        heading: 'SMS and mobile information',
        paragraphs: [
          'Mobile telephone information and SMS opt-in records or consent are not shared with third parties or affiliates for their own marketing or promotional purposes. We do not sell, rent, or transfer SMS consent to third parties. Limited information may be processed by service providers acting only on our behalf to deliver communications, customer support, scheduling, hosting, analytics, or other operational services. Those providers may use the information only to perform services for Infinity Water.',
          'If you consent to text messages from Infinity Water, message frequency varies. Message and data rates may apply. Reply STOP to cancel messages or HELP for assistance. Choosing not to consent to SMS does not prevent you from submitting the form or purchasing a product or service.',
        ],
      },
      {
        heading: 'Cookies, analytics, and advertising',
        paragraphs: [
          'The website may use cookies and similar technologies for essential operation, analytics, attribution, and advertising measurement. These technologies may collect browser, device, page-view, referral, or campaign information. Where legally required, the site will request consent before activating non-essential cookies.',
        ],
      },
      {
        heading: 'How information is disclosed',
        paragraphs: [
          'We may disclose information to vendors that host the website, operate customer relationship management, provide communications, scheduling, analytics, security, or professional services on our behalf. We may also disclose information when required by law, to protect rights or safety, or in connection with a legitimate business transaction. SMS opt-in data and consent remain excluded from disclosure for third-party marketing.',
        ],
      },
      {
        heading: 'Data retention and security',
        paragraphs: [
          'We retain information only as long as reasonably necessary for the purposes described in this policy, to document consent, provide services, resolve disputes, or meet legal obligations. We use reasonable administrative, technical, and organizational safeguards, but no internet transmission or storage system can be guaranteed to be completely secure.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You may request access, correction, or deletion of personal information, subject to legal and operational limitations. You may unsubscribe from email using an unsubscribe link and from SMS by replying STOP. For help with SMS, reply HELP.',
        ],
      },
      {
        heading: "Children's privacy",
        paragraphs: [
          'Our services are intended for adults and property decision-makers. We do not knowingly collect personal information from children under 13.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'We may update this policy. The current version and effective date will always be posted on this page.',
        ],
      },
      {
        heading: 'Contact us',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Email: ${EMAIL}`, `Phone: ${SUPPORT_PHONE.display}`],
        termsLink: { before: 'For SMS program rules, review our ', label: 'Terms & Conditions', after: '.' },
      },
    ],
  },

  es: {
    title: 'Política de Privacidad',
    effectiveLabel: 'Fecha de entrada en vigor',
    effectiveDate: PRIVACY_EFFECTIVE_DATE.es,
    intro:
      `${LEGAL_ENTITY}, que opera comercialmente como ${BRAND} ("Infinity Water", "nosotros"), respeta tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos, protegemos y conservamos la información cuando visitas infinitywatersite.com, solicitas un análisis de agua, nos contactas, agendas una cita o consientes recibir comunicaciones.`,
    sections: [
      {
        heading: 'Información que recopilamos',
        paragraphs: ['Podemos recopilar:'],
        items: [
          'nombre y apellido;',
          'número de teléfono móvil;',
          'dirección de correo electrónico;',
          'dirección del servicio, ciudad, estado y código postal;',
          'si la propiedad usa agua de pozo o agua de ciudad;',
          'preferencias de cita e información que proporciones en formularios o conversaciones;',
          'selecciones de consentimiento, el texto mostrado cuando se obtuvo el consentimiento, fecha y hora, página de origen y registros del envío;',
          'navegador, dispositivo, dirección IP, fuente de referencia e información analítica cuando esté disponible.',
        ],
      },
      {
        heading: 'Cómo usamos la información',
        paragraphs: ['Usamos la información para:'],
        items: [
          'responder a solicitudes de información o de un análisis de agua gratuito;',
          'coordinar, confirmar, reprogramar y recordar citas a los clientes;',
          'brindar servicio al cliente y dar seguimiento a los servicios solicitados;',
          'recomendar opciones de tratamiento de agua según la situación del cliente;',
          'enviar mensajes promocionales solo cuando la persona haya consentido el marketing por separado;',
          'mantener registros del consentimiento y de las preferencias de comunicación;',
          'proteger el sitio web, prevenir usos indebidos, medir el rendimiento y cumplir obligaciones legales.',
        ],
      },
      {
        heading: 'SMS e información móvil',
        paragraphs: [
          'La información de teléfono móvil y los registros o el consentimiento de opt-in de SMS no se comparten con terceros ni con afiliados para sus propios fines de marketing o promoción. No vendemos, alquilamos ni transferimos el consentimiento de SMS a terceros. Información limitada puede ser procesada por proveedores de servicios que actúan únicamente en nuestro nombre para entregar comunicaciones, atención al cliente, agendamiento, alojamiento, analítica u otros servicios operativos. Esos proveedores solo pueden usar la información para prestar servicios a Infinity Water.',
          'Si consientes recibir mensajes de texto de Infinity Water, la frecuencia de mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar los mensajes o HELP para obtener ayuda. Optar por no consentir los SMS no te impide enviar el formulario ni comprar un producto o servicio.',
        ],
      },
      {
        heading: 'Cookies, analítica y publicidad',
        paragraphs: [
          'El sitio web puede usar cookies y tecnologías similares para el funcionamiento esencial, la analítica, la atribución y la medición publicitaria. Estas tecnologías pueden recopilar información de navegador, dispositivo, páginas vistas, referencia o campaña. Cuando la ley lo exija, el sitio solicitará consentimiento antes de activar cookies no esenciales.',
        ],
      },
      {
        heading: 'Cómo se divulga la información',
        paragraphs: [
          'Podemos divulgar información a proveedores que alojan el sitio web, operan la gestión de relaciones con clientes o prestan servicios de comunicación, agendamiento, analítica, seguridad o servicios profesionales en nuestro nombre. También podemos divulgar información cuando lo exija la ley, para proteger derechos o la seguridad, o en relación con una transacción comercial legítima. Los datos de opt-in de SMS y el consentimiento quedan excluidos de cualquier divulgación para marketing de terceros.',
        ],
      },
      {
        heading: 'Conservación y seguridad de los datos',
        paragraphs: [
          'Conservamos la información solo durante el tiempo razonablemente necesario para los fines descritos en esta política, para documentar el consentimiento, prestar servicios, resolver disputas o cumplir obligaciones legales. Aplicamos salvaguardas administrativas, técnicas y organizativas razonables, pero ningún sistema de transmisión o almacenamiento por internet puede garantizarse como completamente seguro.',
        ],
      },
      {
        heading: 'Tus opciones',
        paragraphs: [
          'Puedes solicitar el acceso, la corrección o la eliminación de tu información personal, sujeto a limitaciones legales y operativas. Puedes darte de baja del correo electrónico mediante el enlace de baja y de los SMS respondiendo STOP. Para ayuda con los SMS, responde HELP.',
        ],
      },
      {
        heading: 'Privacidad de menores',
        paragraphs: [
          'Nuestros servicios están dirigidos a adultos y a responsables de decisiones sobre la propiedad. No recopilamos de forma consciente información personal de menores de 13 años.',
        ],
      },
      {
        heading: 'Cambios en esta política',
        paragraphs: [
          'Podemos actualizar esta política. La versión vigente y su fecha de entrada en vigor siempre se publicarán en esta página.',
        ],
      },
      {
        heading: 'Contáctanos',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Correo: ${EMAIL}`, `Teléfono: ${SUPPORT_PHONE.display}`],
        termsLink: { before: 'Para conocer las reglas del programa de SMS, consulta nuestros ', label: 'Términos y Condiciones', after: '.' },
      },
    ],
  },
};
