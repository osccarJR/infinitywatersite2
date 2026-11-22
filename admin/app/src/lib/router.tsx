/**
 * Enrutador minimo con la History API. Las rutas de la app se escriben sin
 * el prefijo /admin ("/ventas/12"); aqui se anade y se quita.
 */
import { useEffect, useRef, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';

const BASE = '/admin';
const listeners = new Set<() => void>();
const notifyNow = () => listeners.forEach((fn) => fn());

/** Cambio de pantalla con transicion suave donde el navegador la soporta. */
const notify = () => {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(() => flushSync(notifyNow));
  } else notifyNow();
};
/* ------------------------------------------------------------------ */
/* Aviso de cambios sin guardar                                         */
/* ------------------------------------------------------------------ */

interface LeaveGuard {
  dirty: () => boolean;
  ask: () => Promise<boolean>;
}
let guard: LeaveGuard | null = null;
let bypassPop = false;
let current = { url: location.pathname + location.search, state: history.state };

/** Pregunta antes de salir si hay cambios sin guardar. true = se puede salir. */
async function canLeave() {
  if (!guard || !guard.dirty()) return true;
  const ok = await guard.ask();
  if (ok) guard = null;
  return ok;
}

window.addEventListener('popstate', async () => {
  if (bypassPop) {
    bypassPop = false;
  } else if (guard?.dirty()) {
    // El navegador ya cambio de pagina: se vuelve a la del formulario y se pregunta.
    history.pushState(current.state, '', current.url);
    if (await canLeave()) {
      bypassPop = true;
      history.back();
    }
    return;
  }
  current = { url: location.pathname + location.search, state: history.state };
  notify();
});

window.addEventListener('beforeunload', (event) => {
  if (guard?.dirty()) {
    event.preventDefault();
    event.returnValue = '';
  }
});

/** Activa el aviso mientras el formulario esta montado. */
export function useLeaveGuard(dirty: () => boolean, ask: () => Promise<boolean>) {
  const ref = useRef({ dirty, ask });
  ref.current = { dirty, ask };
  useEffect(() => {
    const mine: LeaveGuard = { dirty: () => ref.current.dirty(), ask: () => ref.current.ask() };
    guard = mine;
    return () => {
      if (guard === mine) guard = null;
    };
  }, []);
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const snapshot = () => location.pathname + location.search;

const toUrl = (to: string) => BASE + (to.startsWith('/') ? to : `/${to}`);

export function currentPath() {
  const path = location.pathname.slice(BASE.length) || '/';
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

export function useLocation() {
  useSyncExternalStore(subscribe, snapshot);
  return { path: currentPath(), query: new URLSearchParams(location.search) };
}

export async function navigate(to: string, options: { replace?: boolean; force?: boolean } = {}) {
  if (!options.force && !(await canLeave())) return;
  const depth = (history.state?.depth ?? 0) as number;
  if (options.replace) history.replaceState({ depth }, '', toUrl(to));
  else history.pushState({ depth: depth + 1 }, '', toUrl(to));
  current = { url: location.pathname + location.search, state: history.state };
  notify();
  if (!options.replace) window.scrollTo(0, 0);
}

/** Atras dentro de la app; si se entro directo a esta pagina, va a `fallback`. */
export async function goBack(fallback: string, options: { force?: boolean } = {}) {
  if (!options.force && !(await canLeave())) return;
  if ((history.state?.depth ?? 0) > 0) {
    bypassPop = true;
    history.back();
  } else navigate(fallback, { replace: true, force: true });
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const keys: string[] = [];
  const regex = new RegExp(
    '^' +
      pattern.replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      }) +
      '$'
  );
  const m = regex.exec(path);
  return m ? Object.fromEntries(keys.map((key, i) => [key, decodeURIComponent(m[i + 1])])) : null;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, ...props }: LinkProps) {
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
  return <a href={toUrl(to)} onClick={handle} {...props} />;
}
