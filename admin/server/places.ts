/**
 * Autocompletado de direcciones con Google Places API (New).
 *
 * La app nunca habla con Google: pregunta a este servidor, que usa la clave
 * GOOGLE_MAPS_API_KEY (restringida en Google Cloud a la IP de la VPS y solo
 * a "Places API (New)"). Sin clave, el autocompletado queda apagado y los
 * campos de direccion funcionan como campos normales.
 *
 * Coste: se usa un "session token" por direccion escrita (todas las
 * sugerencias + el detalle elegido cuentan como una sesion) y solo se piden
 * campos Essentials (addressComponents, formattedAddress). Con el volumen de
 * un negocio familiar queda dentro del uso gratuito mensual de Google.
 */

// Se lee al usarse (no al cargar el modulo): el .env se carga despues.
const key = () => process.env.GOOGLE_MAPS_API_KEY ?? '';
const BASE = 'https://places.googleapis.com/v1';

/** Centro del area de servicio (Lee y Collier) para priorizar resultados. */
const BIAS = { circle: { center: { latitude: 26.52, longitude: -81.78 }, radius: 50000 } };

export const placesEnabled = () => key().length > 0;

export interface Suggestion {
  id: string;
  main: string;
  secondary: string;
}

export interface PlaceAddress {
  address: string;
  city: string;
  zip: string;
  state: string;
  formatted: string;
}

/* Cache corta: la misma busqueda no se paga dos veces. */
const cache = new Map<string, { at: number; value: Suggestion[] }>();
const CACHE_MS = 10 * 60 * 1000;

/* Limite por usuario: 90 consultas por minuto, de sobra para escribir. */
const usage = new Map<number, number[]>();
export function placesAllowed(userId: number) {
  const now = Date.now();
  const list = (usage.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= 90) return false;
  list.push(now);
  usage.set(userId, list);
  return true;
}

async function google(path: string, init: RequestInit & { fieldMask?: string }) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key(),
      ...(init.fieldMask ? { 'X-Goog-FieldMask': init.fieldMask } : {}),
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(`[places] ${response.status} ${detail.slice(0, 300)}`);
    throw new Error('places');
  }
  return response.json() as Promise<any>;
}

export async function autocomplete(input: string, sessionToken: string): Promise<Suggestion[]> {
  const key = input.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const data = await google('/places:autocomplete', {
    method: 'POST',
    body: JSON.stringify({
      input: input.trim(),
      sessionToken,
      languageCode: 'es',
      regionCode: 'us',
      includedRegionCodes: ['us'],
      locationBias: BIAS,
    }),
  });
  const value: Suggestion[] = (data.suggestions ?? [])
    .map((s: any) => s.placePrediction)
    .filter(Boolean)
    .slice(0, 6)
    .map((p: any) => ({
      id: String(p.placeId),
      main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
      secondary: p.structuredFormat?.secondaryText?.text ?? '',
    }));
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function placeAddress(placeId: string, sessionToken: string): Promise<PlaceAddress> {
  const data = await google(`/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}&languageCode=en`, {
    method: 'GET',
    fieldMask: 'addressComponents,formattedAddress',
  });
  return parseAddress(data.addressComponents ?? [], data.formattedAddress ?? '');
}

/**
 * Componentes de Google -> lo que guarda el sistema. Se usan las formas
 * cortas de la calle ("Metro Pkwy") como las escribe el correo de EE. UU.
 */
export function parseAddress(components: { longText?: string; shortText?: string; types?: string[] }[], formatted: string): PlaceAddress {
  const get = (type: string, short = false) => {
    const c = components.find((x) => x.types?.includes(type));
    return (short ? c?.shortText : c?.longText) ?? c?.longText ?? '';
  };
  const street = [get('street_number'), get('route', true)].filter(Boolean).join(' ');
  const unit = get('subpremise');
  return {
    address: (unit ? `${street} #${unit}` : street) || formatted.split(',')[0] || '',
    city: get('locality') || get('sublocality') || get('neighborhood') || get('administrative_area_level_3') || get('postal_town'),
    zip: get('postal_code'),
    state: get('administrative_area_level_1', true),
    formatted,
  };
}
