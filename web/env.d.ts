/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly VITE_GTM_ID?: string;
  readonly VITE_GA4_ID?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  readonly VITE_ADS_CONVERSION_LABEL_CALL?: string;
  readonly VITE_ADS_CONVERSION_LABEL_WHATSAPP?: string;
  readonly VITE_ADS_CONVERSION_LABEL_FORM?: string;
  readonly VITE_SMS_PHONE_NUMBER?: string;
  readonly VITE_GOOGLE_PLACES_API_KEY?: string;
  readonly VITE_GOOGLE_PLACE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
