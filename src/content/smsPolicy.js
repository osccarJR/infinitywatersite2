/**
 * Politica de SMS.
 *
 * Deja Vu IA pidio un enlace visible a una "Politica de SMS" separada de
 * los terminos generales. Las operadoras valoran que el programa de
 * mensajeria tenga su propia pagina: describe que mensajes se envian, con
 * que frecuencia, como se cancela y que pasa con los datos del opt-in.
 *
 * Repite deliberadamente clausulas de los Terminos y Condiciones. En textos
 * legales eso no es duplicidad indeseada: cada documento debe sostenerse
 * por si solo, porque el revisor puede llegar a cualquiera de los dos.
 */
import { ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, LEGAL_ENTITY_DBA, SUPPORT_PHONE } from '../constants/business';

export const SMS_POLICY = {
  en: {
    title: 'SMS Policy',
    effectiveLabel: 'Effective date',
    effectiveDate: 'August 5, 2026',
    intro: `This SMS Policy describes the text messaging program operated by ${LEGAL_ENTITY_DBA}. It applies to every text message we send to a mobile number that was given to us through our website, by phone, or in person.`,
    sections: [
      {
        heading: 'How you join the program',
        paragraphs: [
          'You only receive text messages from Infinity Water if you expressly opt in. On our Free Water Test form there are two separate checkboxes, both optional and both unchecked by default:',
        ],
        items: [
          'one for non-marketing messages about your water-analysis request, appointment coordination, reminders, and customer-service follow-up;',
          'one for recurring marketing messages about water-treatment products, special offers, and promotions.',
        ],
      },
      {
        heading: 'Consent is optional',
        paragraphs: [
          'SMS consent is never a condition of purchasing any product or service. You can submit the form, request a free water analysis, and buy from us without checking either box.',
          'Each checkbox applies only to the category you selected and only to the telephone number you provided. Agreeing to appointment messages does not authorize promotional messages.',
        ],
      },
      {
        heading: 'What we send and how often',
        paragraphs: [
          'Message frequency varies according to your request, your appointment activity, your service needs, and whether you opted in to marketing. There is no fixed number of messages per month.',
          'Message and data rates may apply. Contact your wireless carrier for the details of your plan.',
        ],
      },
      {
        heading: 'How to stop receiving messages',
        paragraphs: [
          'Reply STOP to any Infinity Water message to unsubscribe. We may send one confirmation message, and after that you will receive no further messages unless you opt in again or start a new conversation permitted by law.',
          'Reply HELP at any time for assistance. You can also reach us at the phone number or email address at the bottom of this page.',
        ],
      },
      {
        heading: 'Your information',
        paragraphs: [
          'Mobile telephone information and SMS opt-in records or consent are not shared with third parties or affiliates for their own marketing or promotional purposes. We do not sell, rent, or transfer SMS consent to third parties.',
          'We keep a record of which checkbox you selected, the exact wording shown to you, and the date and time, so we can demonstrate how consent was obtained.',
        ],
      },
      {
        heading: 'Carriers and changing numbers',
        paragraphs: [
          'Wireless carriers are not responsible for delayed or undelivered messages. Delivery depends on network availability and carrier processing, and the service may not be available on every device or carrier.',
          'If you change or give up your mobile number, please tell us so we do not send messages to whoever receives that number next.',
        ],
      },
      {
        heading: 'Contact',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Email: ${EMAIL}`, `Phone: ${SUPPORT_PHONE.display}`],
      },
    ],
  },

  es: {
    title: 'Politica de SMS',
    effectiveLabel: 'Fecha de entrada en vigor',
    effectiveDate: '5 de agosto de 2026',
    intro: `Esta Politica de SMS describe el programa de mensajes de texto operado por ${LEGAL_ENTITY_DBA}. Aplica a todos los mensajes de texto que enviamos a un numero movil que nos fue proporcionado a traves de nuestro sitio web, por telefono o en persona.`,
    sections: [
      {
        heading: 'Como te suscribes al programa',
        paragraphs: [
          'Solo recibes mensajes de texto de Infinity Water si te suscribes expresamente. En nuestro formulario de analisis de agua gratuito hay dos casillas separadas, ambas opcionales y ambas desmarcadas por defecto:',
        ],
        items: [
          'una para mensajes no promocionales sobre tu solicitud de analisis de agua, coordinacion de citas, recordatorios y seguimiento de servicio al cliente;',
          'otra para mensajes promocionales recurrentes sobre productos de tratamiento de agua, ofertas especiales y promociones.',
        ],
      },
      {
        heading: 'El consentimiento es opcional',
        paragraphs: [
          'El consentimiento de SMS nunca es condicion para comprar ningun producto o servicio. Puedes enviar el formulario, solicitar un analisis de agua gratuito y comprarnos sin marcar ninguna de las dos casillas.',
          'Cada casilla aplica unicamente a la categoria que seleccionaste y solo al numero de telefono que proporcionaste. Aceptar mensajes de citas no autoriza mensajes promocionales.',
        ],
      },
      {
        heading: 'Que enviamos y con que frecuencia',
        paragraphs: [
          'La frecuencia de los mensajes varia segun tu solicitud, la actividad de tus citas, tus necesidades de servicio y si aceptaste o no recibir marketing. No hay un numero fijo de mensajes al mes.',
          'Pueden aplicarse tarifas de mensajes y datos. Consulta a tu operadora movil los detalles de tu plan.',
        ],
      },
      {
        heading: 'Como dejar de recibir mensajes',
        paragraphs: [
          'Responde STOP a cualquier mensaje de Infinity Water para cancelar la suscripcion. Podemos enviar un mensaje de confirmacion y, despues de eso, no recibiras mas mensajes salvo que vuelvas a suscribirte o inicies una nueva conversacion permitida por la ley.',
          'Responde HELP en cualquier momento para obtener ayuda. Tambien puedes contactarnos en el telefono o el correo que aparecen al final de esta pagina.',
        ],
      },
      {
        heading: 'Tu informacion',
        paragraphs: [
          'La informacion de telefono movil y los registros o el consentimiento de opt-in de SMS no se comparten con terceros ni con afiliados para sus propios fines de marketing o promocion. No vendemos, alquilamos ni transferimos el consentimiento de SMS a terceros.',
          'Guardamos un registro de que casilla seleccionaste, el texto exacto que se te mostro y la fecha y hora, para poder demostrar como se obtuvo el consentimiento.',
        ],
      },
      {
        heading: 'Operadoras y cambio de numero',
        paragraphs: [
          'Las operadoras moviles no son responsables de mensajes retrasados o no entregados. La entrega depende de la disponibilidad de la red y del procesamiento de la operadora, y el servicio puede no estar disponible en todos los dispositivos u operadoras.',
          'Si cambias o cedes tu numero movil, avisanos para no enviar mensajes a quien reciba ese numero despues.',
        ],
      },
      {
        heading: 'Contacto',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Correo: ${EMAIL}`, `Telefono: ${SUPPORT_PHONE.display}`],
      },
    ],
  },
};
