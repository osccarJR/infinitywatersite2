/**
 * Estado global: todos los datos del negocio en memoria (GET /bootstrap) y
 * accesos rapidos por id. Despues de cada cambio se vuelve a cargar todo,
 * asi nunca hay pantallas desincronizadas.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Bootstrap, CatalogItem, Client, Person, Sale, Service, User } from '../../../shared/domain.ts';
import { todayISO } from '../../../shared/domain.ts';
import { api, ApiError, setUnauthorizedHandler } from './api.ts';
import { previewTarget, setPreviewTarget, type PreviewTarget } from './preview.ts';

export interface Data extends Bootstrap {
  today: string;
  clientById: Map<number, Client>;
  personById: Map<number, Person>;
  financierById: Map<number, CatalogItem>;
  supplierById: Map<number, CatalogItem>;
  salesByClient: Map<number, Sale[]>;
  servicesByClient: Map<number, Service[]>;
  servicesBySale: Map<number, Service[]>;
}

type Status = 'loading' | 'login' | 'ready' | 'error';

interface Store {
  status: Status;
  error: string | null;
  data: Data | null;
  reload: () => Promise<void>;
  signedIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  /** Entra o sale de la vista previa ("Ver como"). */
  setPreview: (target: PreviewTarget | null) => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

function group<T>(items: T[], key: (item: T) => number | null) {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const k = key(item);
    if (k == null) continue;
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

function derive(raw: Bootstrap): Data {
  return {
    ...raw,
    today: todayISO(),
    clientById: new Map(raw.clients.map((c) => [c.id, c])),
    personById: new Map(raw.people.map((p) => [p.id, p])),
    financierById: new Map(raw.financiers.map((f) => [f.id, f])),
    supplierById: new Map(raw.suppliers.map((s) => [s.id, s])),
    salesByClient: group(raw.sales, (s) => s.clientId),
    servicesByClient: group(raw.services, (s) => s.clientId),
    servicesBySale: group(raw.services, (s) => s.saleId),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Bootstrap | null>(null);
  const loading = useRef<Promise<void> | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const load = useCallback((): Promise<void> => {
    loading.current ??= api<Bootstrap>('/bootstrap')
      .then((data) => {
        setRaw(data);
        setStatus('ready');
        setError(null);
      })
      .catch((err: ApiError) => {
        // El usuario de la vista previa ya no existe (o ya no es administrador): se sale de ella.
        if (previewTarget() && (err.status === 403 || err.status === 404)) {
          setPreviewTarget(null);
          loading.current = null;
          return load();
        }
        if (err.status === 401) setStatus('login');
        else {
          setError(err.message);
          setStatus((current) => (current === 'ready' ? current : 'error'));
          throw err;
        }
      })
      .finally(() => {
        loading.current = null;
      });
    return loading.current;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setStatus('login');
      setRaw(null);
    });
    load().catch(() => {});
    // Al volver a la app (p. ej. desde otra pestana) se refrescan los datos.
    const onVisible = () => document.visibilityState === 'visible' && statusRef.current === 'ready' && load().catch(() => {});
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const data = useMemo(() => (raw ? derive(raw) : null), [raw]);

  const store = useMemo<Store>(
    () => ({
      status,
      error,
      data,
      // Tras guardar hay que ver los datos NUEVOS: si habia una carga en curso
      // (empezada antes del guardado), se espera y se pide otra.
      reload: async () => {
        if (loading.current) await loading.current.catch(() => {});
        return load();
      },
      signedIn: async () => {
        setStatus('loading');
        await load();
      },
      signOut: async () => {
        // En la vista previa, "Cerrar sesion" solo sale de la vista previa.
        if (previewTarget()) {
          setPreviewTarget(null);
          await load();
          return;
        }
        await api('/auth/logout', { method: 'POST' }).catch(() => {});
        setRaw(null);
        setStatus('login');
      },
      setPreview: async (target) => {
        setPreviewTarget(target);
        if (loading.current) await loading.current.catch(() => {});
        await load();
      },
    }),
    [status, error, data, load]
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore fuera de StoreProvider');
  return store;
}

/** Datos listos (solo se usa dentro de pantallas con sesion). */
export function useData(): Data {
  const { data } = useStore();
  if (!data) throw new Error('Datos aun no cargados');
  return data;
}
