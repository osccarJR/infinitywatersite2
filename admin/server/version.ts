/**
 * Version de los datos, para que GET /bootstrap responda 304 ("sin cambios")
 * y el navegador no vuelva a descargar todo si nada cambio.
 *
 * Cambia cuando: (1) la API guarda algo (contador), (2) otro proceso escribe
 * en la base, p. ej. la CLI (PRAGMA data_version), o (3) se reinicia el servicio.
 */
import type { DB } from './db.ts';

const startedAt = Date.now().toString(36);
let writes = 0;

export const bumpVersion = () => {
  writes++;
};

export const dataVersion = (db: DB) => `${startedAt}-${writes}-${db.pragma('data_version', { simple: true })}`;
