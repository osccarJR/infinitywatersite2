/**
 * Textos de consentimiento SMS.
 *
 * Estan aqui, aislados y no en el componente, por dos razones:
 *
 *  1. El texto exacto que se le mostro al usuario se guarda con cada envio
 *     como evidencia. Si vive en un solo sitio, lo guardado y lo mostrado
 *     no pueden divergir.
 *  2. Cualquier cambio, aunque sea una palabra, obliga a subir
 *     CONSENT_VERSION en business.js. Tenerlo junto lo hace evidente.
 *
 * Reglas que impone la especificacion A2P y que el codigo debe respetar:
 *  - Las dos casillas son independientes y arrancan desmarcadas.
 *  - Ninguna es obligatoria para enviar el formulario.
 *  - Marcar una no puede marcar la otra.
 *  - El boton de enviar no equivale a consentimiento.
 *  - El consentimiento operativo no autoriza promociones.
 */
import { LEGAL_ENTITY_DBA } from './business';

/** Casilla A: mensajes operativos, no promocionales. */
export const CONSENT_TRANSACTIONAL = {
  key: 'sms_consent_transactional',
  en: `I agree to receive non-marketing text messages from ${LEGAL_ENTITY_DBA} about my water-analysis request, appointment coordination and reminders, and customer-service follow-up. Message frequency varies. Message and data rates may apply. Reply HELP for help or STOP to opt out.`,
  es: `Acepto recibir mensajes de texto no promocionales de ${LEGAL_ENTITY_DBA} sobre mi solicitud de analisis de agua, coordinacion y recordatorios de citas, y seguimiento de servicio al cliente. La frecuencia varia. Pueden aplicarse tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar.`,
};

/** Casilla B: mensajes promocionales. */
export const CONSENT_MARKETING = {
  key: 'sms_consent_marketing',
  en: `I agree to receive recurring marketing text messages from ${LEGAL_ENTITY_DBA} about water-treatment products, special offers, and promotions. Message frequency varies. Message and data rates may apply. Consent is not a condition of purchase. Reply HELP for help or STOP to opt out.`,
  es: `Acepto recibir mensajes de texto promocionales recurrentes de ${LEGAL_ENTITY_DBA} sobre productos de tratamiento de agua, ofertas especiales y promociones. La frecuencia varia. Pueden aplicarse tarifas de mensajes y datos. El consentimiento no es condicion de compra. Responde HELP para ayuda o STOP para cancelar.`,
};

/** Aviso obligatorio bajo las casillas, con enlaces a Privacy y Terms. */
export const CONSENT_DISCLOSURE = {
  en: 'By submitting this form, you acknowledge our Privacy Policy and Terms & Conditions. SMS consent is optional and is not required to submit the form.',
  es: 'Al enviar este formulario reconoces nuestra Politica de Privacidad y nuestros Terminos y Condiciones. El consentimiento SMS es opcional y no es necesario para enviar el formulario.',
};
