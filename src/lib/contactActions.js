/**
 * Acciones de contacto centralizadas.
 *
 * Todos los botones de llamada y de WhatsApp del sitio pasan por aqui, para
 * que ninguno se quede sin registrar la conversion. `location` identifica
 * desde que seccion salio el lead ('hero', 'footer', 'servicios'...), que es
 * justo lo que hace falta para saber que parte de la pagina convierte.
 */
import { PRIMARY_PHONE, getWhatsAppUrl } from '../constants/business';
import { trackConversion } from './analytics';

export function callNumber(tel = PRIMARY_PHONE.tel, location = 'unknown') {
  trackConversion('call', { location, phone: tel });
  window.location.href = `tel:${tel}`;
}

export function openWhatsApp(message, location = 'unknown', phone = PRIMARY_PHONE) {
  trackConversion('whatsapp', { location });
  window.open(getWhatsAppUrl(message, phone), '_blank', 'noopener,noreferrer');
}
