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
import { ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, LEGAL_ENTITY_DBA, SUPPORT_PHONE } from '../constants/business';

export const PRIVACY_EFFECTIVE_DATE = { en: 'August 5, 2026', es: '5 de agosto de 2026' };

export const PRIVACY_POLICY = {
  en: {
    title: 'Privacy Policy',
    effectiveLabel: 'Effective date',
    effectiveDate: PRIVACY_EFFECTIVE_DATE.en,
    intro:
      'Global Innovation LLC, doing business as Infinity Water ("Infinity Water," "we," "us," or "our"), respects your privacy. This Privacy Policy explains how we collect, use, disclose, protect, and retain information when you visit infinitywatersite.com, request a water analysis, contact us, schedule an appointment, or consent to receive communications.',
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
    title: 'Politica de Privacidad',
    effectiveLabel: 'Fecha de entrada en vigor',
    effectiveDate: PRIVACY_EFFECTIVE_DATE.es,
    intro:
      'Global Innovation LLC, que opera comercialmente como Infinity Water ("Infinity Water", "nosotros"), respeta tu privacidad. Esta Politica de Privacidad explica como recopilamos, usamos, divulgamos, protegemos y conservamos la informacion cuando visitas infinitywatersite.com, solicitas un analisis de agua, nos contactas, agendas una cita o consientes recibir comunicaciones.',
    sections: [
      {
        heading: 'Informacion que recopilamos',
        paragraphs: ['Podemos recopilar:'],
        items: [
          'nombre y apellido;',
          'numero de telefono movil;',
          'direccion de correo electronico;',
          'direccion del servicio, ciudad, estado y codigo postal;',
          'si la propiedad usa agua de pozo o agua de ciudad;',
          'preferencias de cita e informacion que proporciones en formularios o conversaciones;',
          'selecciones de consentimiento, el texto mostrado cuando se obtuvo el consentimiento, fecha y hora, pagina de origen y registros del envio;',
          'navegador, dispositivo, direccion IP, fuente de referencia e informacion analitica cuando este disponible.',
        ],
      },
      {
        heading: 'Como usamos la informacion',
        paragraphs: ['Usamos la informacion para:'],
        items: [
          'responder a solicitudes de informacion o de un analisis de agua gratuito;',
          'coordinar, confirmar, reprogramar y recordar citas a los clientes;',
          'brindar servicio al cliente y dar seguimiento a los servicios solicitados;',
          'recomendar opciones de tratamiento de agua segun la situacion del cliente;',
          'enviar mensajes promocionales solo cuando la persona haya consentido el marketing por separado;',
          'mantener registros del consentimiento y de las preferencias de comunicacion;',
          'proteger el sitio web, prevenir usos indebidos, medir el rendimiento y cumplir obligaciones legales.',
        ],
      },
      {
        heading: 'SMS e informacion movil',
        paragraphs: [
          'La informacion de telefono movil y los registros o el consentimiento de opt-in de SMS no se comparten con terceros ni con afiliados para sus propios fines de marketing o promocion. No vendemos, alquilamos ni transferimos el consentimiento de SMS a terceros. Informacion limitada puede ser procesada por proveedores de servicios que actuan unicamente en nuestro nombre para entregar comunicaciones, atencion al cliente, agendamiento, alojamiento, analitica u otros servicios operativos. Esos proveedores solo pueden usar la informacion para prestar servicios a Infinity Water.',
          'Si consientes recibir mensajes de texto de Infinity Water, la frecuencia de mensajes varia. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar los mensajes o HELP para obtener ayuda. Optar por no consentir los SMS no te impide enviar el formulario ni comprar un producto o servicio.',
        ],
      },
      {
        heading: 'Cookies, analitica y publicidad',
        paragraphs: [
          'El sitio web puede usar cookies y tecnologias similares para el funcionamiento esencial, la analitica, la atribucion y la medicion publicitaria. Estas tecnologias pueden recopilar informacion de navegador, dispositivo, paginas vistas, referencia o campana. Cuando la ley lo exija, el sitio solicitara consentimiento antes de activar cookies no esenciales.',
        ],
      },
      {
        heading: 'Como se divulga la informacion',
        paragraphs: [
          'Podemos divulgar informacion a proveedores que alojan el sitio web, operan la gestion de relaciones con clientes o prestan servicios de comunicacion, agendamiento, analitica, seguridad o servicios profesionales en nuestro nombre. Tambien podemos divulgar informacion cuando lo exija la ley, para proteger derechos o la seguridad, o en relacion con una transaccion comercial legitima. Los datos de opt-in de SMS y el consentimiento quedan excluidos de cualquier divulgacion para marketing de terceros.',
        ],
      },
      {
        heading: 'Conservacion y seguridad de los datos',
        paragraphs: [
          'Conservamos la informacion solo durante el tiempo razonablemente necesario para los fines descritos en esta politica, para documentar el consentimiento, prestar servicios, resolver disputas o cumplir obligaciones legales. Aplicamos salvaguardas administrativas, tecnicas y organizativas razonables, pero ningun sistema de transmision o almacenamiento por internet puede garantizarse como completamente seguro.',
        ],
      },
      {
        heading: 'Tus opciones',
        paragraphs: [
          'Puedes solicitar el acceso, la correccion o la eliminacion de tu informacion personal, sujeto a limitaciones legales y operativas. Puedes darte de baja del correo electronico mediante el enlace de baja y de los SMS respondiendo STOP. Para ayuda con los SMS, responde HELP.',
        ],
      },
      {
        heading: 'Privacidad de menores',
        paragraphs: [
          'Nuestros servicios estan dirigidos a adultos y a responsables de decisiones sobre la propiedad. No recopilamos de forma consciente informacion personal de menores de 13 anos.',
        ],
      },
      {
        heading: 'Cambios en esta politica',
        paragraphs: [
          'Podemos actualizar esta politica. La version vigente y su fecha de entrada en vigor siempre se publicaran en esta pagina.',
        ],
      },
      {
        heading: 'Contactanos',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Correo: ${EMAIL}`, `Telefono: ${SUPPORT_PHONE.display}`],
        termsLink: { before: 'Para conocer las reglas del programa de SMS, consulta nuestros ', label: 'Terminos y Condiciones', after: '.' },
      },
    ],
  },
};
