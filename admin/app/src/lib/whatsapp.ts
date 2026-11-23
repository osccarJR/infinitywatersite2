/**
 * Enlaces de WhatsApp que abren lo que corresponde en cada equipo:
 *  - Telefono: wa.me abre la app (WhatsApp o WhatsApp Business).
 *  - Computadora: se elige una vez y se recuerda en ese navegador:
 *      web -> WhatsApp Web directo (sin la pagina intermedia de wa.me).
 *      app -> la app de WhatsApp instalada en la compu (whatsapp://).
 *    Las dos funcionan con la cuenta Business si se vinculo con su QR.
 */
import { useSyncExternalStore } from 'react';
import { phoneDigits } from './format.ts';

export type WaMode = 'web' | 'app';

const KEY = 'iw-wa-mode';
const listeners = new Set<() => void>();

export const isPhoneDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export function getWaMode(): WaMode {
  try {
    return localStorage.getItem(KEY) === 'app' ? 'app' : 'web';
  } catch {
    return 'web';
  }
}

export function setWaMode(mode: WaMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* sin almacenamiento: queda por defecto */
  }
  listeners.forEach((fn) => fn());
}

export const useWaMode = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getWaMode,
    () => 'web' as WaMode
  );

const intl = (phone?: string | null) => {
  const digits = phone ? phoneDigits(phone) : '';
  return digits.length === 10 ? '1' + digits : digits;
};

/** Propiedades del enlace (<a {...waLink(tel, texto)}>). */
export function waLink(phone?: string | null, text?: string) {
  const to = intl(phone);
  const t = text ? encodeURIComponent(text) : '';
  if (isPhoneDevice()) {
    return { href: `https://wa.me/${to}${t ? `?text=${t}` : ''}`, target: '_blank', rel: 'noopener' };
  }
  const query = [to && `phone=${to}`, t && `text=${t}`].filter(Boolean).join('&');
  if (getWaMode() === 'app') return { href: `whatsapp://send?${query}`, target: undefined, rel: undefined };
  return { href: `https://web.whatsapp.com/send?${query}`, target: 'iw-whatsapp', rel: 'noopener' };
}
