/** Llamadas a la API del panel. Todas llevan la cabecera anti-CSRF. */
import { previewBlockedMessage, previewTarget } from './preview.ts';

export class ApiError extends Error {
  status: number;
  /** Campo que el servidor rechazo, si lo dijo. */
  field?: string;
  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const preview = previewTarget();
  // En la vista previa no se guarda nada (el servidor tambien lo rechaza).
  if (preview && method !== 'GET') throw new ApiError(403, previewBlockedMessage(preview.name));
  let response: Response;
  try {
    response = await fetch(`/admin/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        'X-IW-Admin': '1',
        ...(preview ? { 'X-IW-View-As': String(preview.id) } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Sin conexión. Revisa tu internet e intenta de nuevo.');
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    /* respuesta sin JSON */
  }
  if (response.status === 401 && path !== '/auth/login') onUnauthorized?.();
  if (!response.ok) {
    throw new ApiError(response.status, data?.error || 'No se pudo completar. Intenta de nuevo.', data?.field);
  }
  return data as T;
}

/** Descarga un archivo de la API (CSV o respaldo) con la sesion actual. */
export function download(path: string) {
  const preview = previewTarget();
  if (preview) throw new ApiError(403, previewBlockedMessage(preview.name));
  const link = document.createElement('a');
  link.href = `/admin/api${path}`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Anota en el registro de actividad una descarga o impresion hecha en la app. */
export function logEvent(kind: 'export' | 'print', what: string, rows?: number) {
  if (previewTarget()) return;
  api('/audit/event', { method: 'POST', body: { kind, what, ...(rows != null ? { rows } : {}) } }).catch(() => {});
}

/** Guarda un archivo generado en la app (CSV de un reporte, por ejemplo). */
export function saveFile(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
