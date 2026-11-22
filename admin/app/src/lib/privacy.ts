/**
 * Modo privado: tapa todos los montos ("$ ••••") con un ojito, como las apps
 * de banco. Empieza TAPADO cada vez que se abre el panel y se vuelve a tapar
 * si la app pasa mas de un minuto en segundo plano (otra app, telefono
 * bloqueado, otra pestana). No se guarda en el dispositivo a proposito.
 */
import { useSyncExternalStore } from 'react';

const AWAY_MS = 60_000;

let hidden = true;
let awaySince: number | null = null;
const listeners = new Set<() => void>();

export const amountsHidden = () => hidden;

export function setAmountsHidden(value: boolean) {
  if (value === hidden) return;
  hidden = value;
  listeners.forEach((fn) => fn());
}

export const toggleAmounts = () => setAmountsHidden(!hidden);

export function useAmountsHidden() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    amountsHidden
  );
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') awaySince = Date.now();
    else {
      if (awaySince && Date.now() - awaySince > AWAY_MS) setAmountsHidden(true);
      awaySince = null;
    }
  });
}
