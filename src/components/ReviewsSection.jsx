import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Quote, Star } from 'lucide-react';
import { GOOGLE_PLACE_URL } from '../constants/business';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Resenas reales de Google. Nada mas.
 *
 * Esta seccion mostraba tres testimonios inventados (nombres, textos y
 * fechas) presentados como "resenas verificadas", con un 4.9/120 fijo en el
 * codigo. Eso es sancionable por la FTC y motivo de rechazo de la landing en
 * Google Ads. Ahora, si no hay resenas reales, la seccion no se renderiza.
 *
 * Dos formas de alimentarla (ver .env.example):
 *
 *  - VITE_REVIEWS_ENDPOINT: recomendado en produccion. Un endpoint propio
 *    que consulta Google y cachea el resultado. La clave se queda en el
 *    servidor.
 *  - VITE_GOOGLE_PLACES_API_KEY + VITE_GOOGLE_PLACE_ID: llamada directa
 *    desde el navegador. Mas rapido de montar, pero la clave queda visible
 *    en el bundle publico: restringirla por referrer y por API en la consola
 *    de Google Cloud.
 */

const REVIEWS_ENDPOINT = import.meta.env.VITE_REVIEWS_ENDPOINT;
const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID;

const reviewsConfigured = Boolean(REVIEWS_ENDPOINT || (PLACES_API_KEY && PLACE_ID));

const AUTOPLAY_MS = 6000;

const copy = {
  en: {
    title: 'What our clients say',
    subtitle: 'Real reviews published on our Google Maps profile',
    seeAll: 'Read all reviews on Google',
    ratingSuffix: 'Google reviews',
    previous: 'Previous review',
    next: 'Next review',
  },
  es: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Resenas reales publicadas en nuestro perfil de Google Maps',
    seeAll: 'Ver todas las resenas en Google',
    ratingSuffix: 'resenas en Google',
    previous: 'Resena anterior',
    next: 'Resena siguiente',
  },
};

/** Acepta tanto el formato v1 de Places como el legacy. */
function normalizeReviews(rawReviews = []) {
  return rawReviews
    .map((review, index) => ({
      id: review.name || review.author_url || `review-${index}`,
      author:
        review.authorAttribution?.displayName ||
        review.author_name ||
        review.reviewer?.displayName ||
        '',
      rating: Number(review.rating || review.starRating) || 5,
      text: (typeof review.text === 'string' ? review.text : review.text?.text) || '',
      time:
        review.relativePublishTimeDescription ||
        review.relative_time_description ||
        '',
      profileUrl: review.authorAttribution?.uri || review.author_url || GOOGLE_PLACE_URL,
      photo:
        review.authorAttribution?.photoUri ||
        review.profile_photo_url ||
        review.reviewer?.profilePhotoUri ||
        '',
    }))
    .filter((review) => review.text.trim().length > 0 && review.author.trim().length > 0);
}

export default function ReviewsSection() {
  const { language } = useLanguage();
  const text = copy[language];

  const [reviews, setReviews] = useState([]);
  const [place, setPlace] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const carouselRef = useRef(null);

  useEffect(() => {
    if (!reviewsConfigured) return undefined;

    const controller = new AbortController();

    const load = async () => {
      try {
        const request = REVIEWS_ENDPOINT
          ? fetch(REVIEWS_ENDPOINT, { signal: controller.signal })
          : fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
              signal: controller.signal,
              headers: {
                'X-Goog-Api-Key': PLACES_API_KEY,
                'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
              },
            });

        const response = await request;
        if (!response.ok) throw new Error(`Google respondio ${response.status}`);

        const data = await response.json();
        const parsed = normalizeReviews(data.reviews);
        if (parsed.length === 0) return;

        setReviews(parsed);
        setPlace({
          rating: Number(data.rating) || null,
          total: Number(data.userRatingCount ?? data.user_ratings_total) || null,
        });
      } catch (error) {
        if (error.name === 'AbortError') return;
        // Sin resenas reales la seccion simplemente no aparece. Preferimos un
        // hueco a inventar prueba social.
        if (import.meta.env.DEV) {
          console.warn('[reviews] no se pudieron cargar las resenas de Google:', error.message);
        }
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const scrollToIndex = useCallback((index) => {
    const container = carouselRef.current;
    const target = container?.children?.[index];
    if (!container || !target) return;
    container.scrollTo({ left: target.offsetLeft - container.offsetLeft, behavior: 'smooth' });
  }, []);

  const goTo = useCallback(
    (index) => {
      if (reviews.length === 0) return;
      const next = ((index % reviews.length) + reviews.length) % reviews.length;
      setActiveIndex(next);
      scrollToIndex(next);
    },
    [reviews.length, scrollToIndex]
  );

  useEffect(() => {
    if (paused || reviews.length < 2) return undefined;

    // El intervalo depende solo de la longitud: el indice se lee del estado
    // dentro del setter, asi no hay que recrear el timer en cada render.
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % reviews.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [paused, reviews.length, scrollToIndex]);

  if (reviews.length === 0) return null;

  return (
    <section id="testimonios" className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {place?.rating && (
              <div className="inline-flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-800">{place.rating.toFixed(1)} / 5.0</span>
                </div>
                {place.total && (
                  <span className="text-sm text-slate-600">
                    {place.total} {text.ratingSuffix}
                  </span>
                )}
              </div>
            )}

            <h2 className="text-3xl md:text-4xl text-slate-900 mb-3">{text.title}</h2>
            <p className="text-lg md:text-xl text-slate-600">{text.subtitle}</p>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
            >
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="snap-center shrink-0 w-full sm:w-[85%] md:w-[70%] lg:w-[55%]"
                >
                  <div className="bg-slate-50 rounded-3xl p-8 h-full border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white opacity-70" />
                    <div className="relative">
                      <Quote className="w-10 h-10 text-blue-200 mb-4" aria-hidden="true" />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-700 font-semibold shrink-0">
                          {review.photo ? (
                            <img
                              src={review.photo}
                              alt=""
                              width="48"
                              height="48"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span aria-hidden="true">{review.author[0]}</span>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-1"
                          aria-label={`${review.rating} / 5`}
                        >
                          {Array.from({ length: Math.round(review.rating) }, (_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-800 mb-6 leading-relaxed text-lg">{review.text}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm text-slate-600">
                        <div>
                          <p className="text-slate-900 font-semibold">{review.author}</p>
                          {review.time && <p>{review.time}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow hover:shadow-md transition-all flex items-center justify-center"
                  aria-label={text.previous}
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow hover:shadow-md transition-all flex items-center justify-center"
                  aria-label={text.next}
                >
                  <ArrowRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              <a
                href={GOOGLE_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800"
              >
                {text.seeAll}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
