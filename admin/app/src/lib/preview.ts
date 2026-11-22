/**
 * Vista previa ("Ver como"): el administrador ve el sistema tal cual lo ve
 * otro usuario. Se guarda en la pestana (sessionStorage): sobrevive a una
 * recarga pero no a cerrar la pestana. El servidor recibe la cabecera
 * X-IW-View-As y responde con los datos y permisos de ese usuario; cualquier
 * intento de guardar se rechaza alli.
 */
const KEY = 'iw-view-as';

export interface PreviewTarget {
  id: number;
  name: string;
}

function read(): PreviewTarget | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const value = raw ? JSON.parse(raw) : null;
    return value && Number.isInteger(value.id) && typeof value.name === 'string' ? value : null;
  } catch {
    return null;
  }
}

let target: PreviewTarget | null = read();

export const previewTarget = () => target;

export function setPreviewTarget(next: PreviewTarget | null) {
  target = next;
  try {
    if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento: la vista previa dura hasta recargar */
  }
}

export const previewBlockedMessage = (name: string) =>
  `Estás viendo el sistema como ${name}. En la vista previa no se guarda nada: sal de la vista previa para hacer cambios.`;
