export const PHONE_NUMBERS = [
  {
    display: '(475) 685-8464',
    tel: '+14756858464',
    whatsapp: '14756858464'
  },
  {
    display: '(239) 223-5394',
    tel: '+12392235394',
    whatsapp: '12392235394'
  }
];

export const PRIMARY_PHONE = PHONE_NUMBERS[0];
export const SECONDARY_PHONE = PHONE_NUMBERS[1];

export const PHONE_DISPLAY_TEXT = `${PRIMARY_PHONE.display} | ${SECONDARY_PHONE.display}`;

export const getWhatsAppUrl = (message, phone = PRIMARY_PHONE) =>
  `https://wa.me/${phone.whatsapp}?text=${encodeURIComponent(message)}`;
