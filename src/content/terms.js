/**
 * Texto de los Terminos y Condiciones.
 *
 * Igual que la politica de privacidad: el ingles lo fija la especificacion
 * A2P y no debe reescribirse. Las clausulas del programa SMS (descripcion,
 * consentimiento opcional, frecuencia, STOP, HELP, aviso de operadoras) son
 * exactamente las que revisa la operadora antes de aprobar la campana.
 */
import { ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, LEGAL_ENTITY_DBA, SUPPORT_PHONE } from '../constants/business';

export const TERMS_EFFECTIVE_DATE = { en: 'August 5, 2026', es: '5 de agosto de 2026' };

export const TERMS = {
  en: {
    title: 'Terms and Conditions',
    effectiveLabel: 'Effective date',
    effectiveDate: TERMS_EFFECTIVE_DATE.en,
    intro:
      'These Terms and Conditions govern use of infinitywatersite.com and the Infinity Water SMS program operated by Global Innovation LLC, doing business as Infinity Water.',
    sections: [
      {
        heading: 'Website and services',
        paragraphs: [
          'Website information is provided for general informational purposes. A water analysis, recommendation, product configuration, pricing, financing availability, installation scope, warranties, and service terms may vary and must be confirmed in a written proposal or agreement. Website content is not a guarantee that a specific system will remove every possible substance or condition from water.',
        ],
      },
      {
        heading: 'SMS program description',
        paragraphs: ['People who expressly opt in may receive recurring messages from Infinity Water concerning:'],
        items: [
          'requests for a water analysis;',
          'appointment coordination, confirmations, reminders, or rescheduling;',
          'customer-service follow-up related to an inquiry or service;',
          'products, special offers, or promotions only when marketing consent was selected separately.',
        ],
      },
      {
        heading: 'Consent and eligibility',
        paragraphs: [
          'SMS consent is optional and is not a condition of purchasing any product or service. A customer may submit the water-test form without selecting either SMS checkbox. Consent applies only to the message category selected and to the telephone number provided.',
        ],
      },
      {
        heading: 'Message frequency and charges',
        paragraphs: [
          "Message frequency varies according to the customer's request, appointment activity, service needs, and marketing preference. Message and data rates may apply. Contact your wireless carrier for plan details.",
        ],
      },
      {
        heading: 'Opt-out',
        paragraphs: [
          'Reply STOP to any Infinity Water message to unsubscribe. After STOP, a confirmation message may be sent and no further messages will be sent unless the person provides new consent or initiates another conversation permitted by law.',
        ],
      },
      {
        heading: 'Help',
        paragraphs: [
          `Reply HELP for assistance. Customers may also contact Infinity Water at ${EMAIL} or ${SUPPORT_PHONE.display}.`,
        ],
      },
      {
        heading: 'Carrier notice',
        paragraphs: [
          'Wireless carriers are not responsible for delayed or undelivered messages. Message delivery is subject to network availability and carrier processing.',
        ],
      },
      {
        heading: 'Supported carriers and changing numbers',
        paragraphs: [
          'Service may not be available on every device or carrier. If a customer changes or relinquishes a mobile number, the customer should update Infinity Water so messages are not sent to a new owner of that number.',
        ],
      },
      {
        heading: 'Privacy',
        privacyLink: {
          before: 'Use of personal and mobile information is described in the ',
          label: 'Infinity Water Privacy Policy',
          after: '. SMS opt-in information and consent are not sold or shared with third parties for their marketing.',
        },
      },
      {
        heading: 'Changes',
        paragraphs: [
          'Infinity Water may update these terms. The current version and effective date will be posted on this page. Material changes to an SMS program will be communicated when required.',
        ],
      },
      {
        heading: 'Contact',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Email: ${EMAIL}`, `Phone: ${SUPPORT_PHONE.display}`],
      },
    ],
  },

  es: {
    title: 'Terminos y Condiciones',
    effectiveLabel: 'Fecha de entrada en vigor',
    effectiveDate: TERMS_EFFECTIVE_DATE.es,
    intro:
      'Estos Terminos y Condiciones rigen el uso de infinitywatersite.com y el programa de SMS de Infinity Water, operado por Global Innovation LLC, que opera comercialmente como Infinity Water.',
    sections: [
      {
        heading: 'Sitio web y servicios',
        paragraphs: [
          'La informacion del sitio web se proporciona con fines informativos generales. El analisis de agua, la recomendacion, la configuracion del producto, los precios, la disponibilidad de financiamiento, el alcance de la instalacion, las garantias y los terminos de servicio pueden variar y deben confirmarse en una propuesta o contrato por escrito. El contenido del sitio no garantiza que un sistema concreto elimine todas las sustancias o condiciones posibles del agua.',
        ],
      },
      {
        heading: 'Descripcion del programa de SMS',
        paragraphs: [
          'Las personas que se suscriben expresamente pueden recibir mensajes recurrentes de Infinity Water sobre:',
        ],
        items: [
          'solicitudes de analisis de agua;',
          'coordinacion, confirmacion, recordatorio o reprogramacion de citas;',
          'seguimiento de servicio al cliente relacionado con una consulta o un servicio;',
          'productos, ofertas especiales o promociones, unicamente cuando se haya seleccionado por separado el consentimiento de marketing.',
        ],
      },
      {
        heading: 'Consentimiento y elegibilidad',
        paragraphs: [
          'El consentimiento de SMS es opcional y no es condicion para comprar ningun producto o servicio. El cliente puede enviar el formulario de analisis de agua sin marcar ninguna de las casillas de SMS. El consentimiento aplica unicamente a la categoria de mensajes seleccionada y al numero de telefono proporcionado.',
        ],
      },
      {
        heading: 'Frecuencia de mensajes y cargos',
        paragraphs: [
          'La frecuencia de los mensajes varia segun la solicitud del cliente, la actividad de citas, las necesidades de servicio y la preferencia de marketing. Pueden aplicarse tarifas de mensajes y datos. Consulta a tu operadora movil los detalles de tu plan.',
        ],
      },
      {
        heading: 'Cancelacion',
        paragraphs: [
          'Responde STOP a cualquier mensaje de Infinity Water para cancelar la suscripcion. Tras STOP puede enviarse un mensaje de confirmacion y no se enviaran mas mensajes salvo que la persona otorgue un nuevo consentimiento o inicie otra conversacion permitida por la ley.',
        ],
      },
      {
        heading: 'Ayuda',
        paragraphs: [
          `Responde HELP para obtener asistencia. Los clientes tambien pueden contactar a Infinity Water en ${EMAIL} o en el ${SUPPORT_PHONE.display}.`,
        ],
      },
      {
        heading: 'Aviso sobre operadoras',
        paragraphs: [
          'Las operadoras moviles no son responsables de mensajes retrasados o no entregados. La entrega de mensajes esta sujeta a la disponibilidad de la red y al procesamiento de la operadora.',
        ],
      },
      {
        heading: 'Operadoras compatibles y cambio de numero',
        paragraphs: [
          'El servicio puede no estar disponible en todos los dispositivos u operadoras. Si un cliente cambia o cede su numero movil, debe actualizarlo con Infinity Water para que no se envien mensajes al nuevo titular de ese numero.',
        ],
      },
      {
        heading: 'Privacidad',
        privacyLink: {
          before: 'El uso de la informacion personal y movil se describe en la ',
          label: 'Politica de Privacidad de Infinity Water',
          after: '. La informacion de opt-in de SMS y el consentimiento no se venden ni se comparten con terceros para su marketing.',
        },
      },
      {
        heading: 'Cambios',
        paragraphs: [
          'Infinity Water puede actualizar estos terminos. La version vigente y su fecha de entrada en vigor se publicaran en esta pagina. Los cambios sustanciales en el programa de SMS se comunicaran cuando sea necesario.',
        ],
      },
      {
        heading: 'Contacto',
        address: [LEGAL_ENTITY_DBA, `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`, `Correo: ${EMAIL}`, `Telefono: ${SUPPORT_PHONE.display}`],
      },
    ],
  },
};
