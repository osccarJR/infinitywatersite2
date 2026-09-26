/**
 * Resenas reales de Google, obtenidas EN EL BUILD.
 *
 * Antes se pedian desde el navegador y la clave de la API quedaba expuesta
 * en el JavaScript publico. Ahora la consulta se hace al compilar: la clave
 * nunca sale del servidor de build y la pagina carga las resenas como HTML.
 * Para refrescarlas basta con volver a compilar (p. ej. un cron diario).
 *
 * Sin VITE_GOOGLE_PLACES_API_KEY + VITE_GOOGLE_PLACE_ID no se muestran
 * resenas. El sitio nunca muestra testimonios inventados.
 */

export type Review = {
  author: string;
  photo?: string;
  rating: number;
  text: string;
  time: string;
  url?: string;
};

export type PlaceReviews = { rating: number | null; total: number | null; reviews: Review[] };

let cache: Promise<PlaceReviews | null> | null = null;

export function getReviews(lang: 'en' | 'es'): Promise<PlaceReviews | null> {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;
  if (!key || !placeId) return Promise.resolve(null);

  // Una sola llamada por build: las resenas son las mismas en ambos idiomas
  // (Google las devuelve en su idioma original).
  cache ??= fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=${lang}`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Places API ${response.status}`);
      const data = await response.json();
      const reviews: Review[] = (data.reviews ?? [])
        .map((r: any) => ({
          author: r.authorAttribution?.displayName ?? '',
          photo: r.authorAttribution?.photoUri,
          url: r.authorAttribution?.uri,
          rating: Number(r.rating) || 0,
          text: r.originalText?.text ?? r.text?.text ?? '',
          time: r.relativePublishTimeDescription ?? '',
        }))
        .filter((r: Review) => r.author && r.text);
      return { rating: Number(data.rating) || null, total: Number(data.userRatingCount) || null, reviews };
    })
    .catch((error) => {
      console.warn(`[reviews] no se pudieron cargar las resenas: ${error.message}`);
      return null;
    });

  return cache;
}
