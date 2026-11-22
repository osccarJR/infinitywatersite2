/** Llamadas a la API del panel. Todas llevan la cabecera anti-CSRF. */

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
  let response: Response;
  try {
    response = await fetch(`/admin/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'X-IW-Admin': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
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
  const link = document.createElement('a');
  link.href = `/admin/api${path}`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
