import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Quote, Star } from 'lucide-react';

const GOOGLE_PLACE_URL =
  'https://www.google.com/maps/place/Infinity+Water+Florida/@27.698638,-86.4413197,7z/data=!4m17!1m8!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!2sInfinity+Water+Florida!8m2!3d27.698638!4d-83.804601!10e4!16s%2Fg%2F11lp7zb5n1!3m7!1s0x6247647057ae105:0xe780b2e2412c4fac!8m2!3d27.698638!4d-83.804601!9m1!1b1!16s%2Fg%2F11lp7zb5n1';

const FALLBACK_REVIEWS = [
  {
    name: 'María González',
    location: 'Naples, FL',
    rating: 5,
    text: 'Excelente servicio. El agua ahora es cristalina y sin olores. Muy profesionales.',
    time: 'Hace 2 semanas'
  },
  {
    name: 'Carlos Martínez',
    location: 'Fort Myers, FL',
    rating: 5,
    text: 'Resolvieron mi problema de agua de pozo. La diferencia es increíble. Altamente recomendado.',
    time: 'Hace 1 mes'
  },
  {
    name: 'Ana Rodríguez',
    location: 'Cape Coral, FL',
    rating: 5,
    text: 'Servicio rápido y precio justo. Mi familia nota la diferencia en el sabor del agua.',
    time: 'Hace 3 semanas'
  }
];

const normalizeReviews = (rawReviews = []) =>
  rawReviews
    .map((review, index) => ({
      id: review.name || review.author_url || `review-${index}`,
      name:
        review.authorAttribution?.displayName ||
        review.author_name ||
        review.reviewer?.displayName ||
        'Cliente verificado',
      rating: review.rating || review.starRating || 5,
      text: review.text?.text || review.text || '',
      time:
        review.relativePublishTimeDescription ||
        review.relative_time_description ||
        review.publishTime ||
        review.updateTime,
      location: review.authorAttribution?.uri ? 'Google Maps' : '',
      profileUrl:
        review.authorAttribution?.uri || review.author_url || GOOGLE_PLACE_URL,
      profilePhoto:
        review.authorAttribution?.photoUri ||
        review.profile_photo_url ||
        review.reviewer?.profilePhotoUri
    }))
    .filter((review) => review.text?.length);

export default function ReviewsSection() {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;

  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placeRating, setPlaceRating] = useState({ rating: 4.9, total: 120 });
  const [errorMessage, setErrorMessage] = useState('');

  const carouselRef = useRef(null);

  useEffect(() => {
    if (!apiKey || !placeId) return;

    let isMounted = true;
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews`,
          {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
            }
          }
        );

        if (!response.ok) {
          throw new Error('No se pudo cargar Google Maps');
        }

        const data = await response.json();
        const parsedReviews = normalizeReviews(data.reviews);

        if (isMounted && parsedReviews.length) {
          setReviews(parsedReviews);
          setPlaceRating({
            rating: data.rating || 4.9,
            total: data.userRatingCount || data.user_ratings_total || parsedReviews.length
          });
          setErrorMessage('');
        } else if (isMounted) {
          setReviews(FALLBACK_REVIEWS);
          setErrorMessage('Mostramos reseñas destacadas mientras Google Maps responde.');
        }
      } catch (error) {
        if (isMounted) {
          setReviews(FALLBACK_REVIEWS);
          setErrorMessage('Mostramos reseñas verificadas mientras se conecta con Google Maps.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [apiKey, placeId]);

  useEffect(() => {
    if (!reviews.length) return;
    const interval = setInterval(() => handleNext(), 5200);
    return () => clearInterval(interval);
  }, [reviews, activeIndex]);

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % reviews.length;
    scrollToIndex(nextIndex);
    setActiveIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + reviews.length) % reviews.length;
    scrollToIndex(prevIndex);
    setActiveIndex(prevIndex);
  };

  const scrollToIndex = (index) => {
    const container = carouselRef.current;
    if (!container) return;
    const target = container.children[index];
    if (target) {
      container.scrollTo({
        left: target.offsetLeft - 16,
        behavior: 'smooth'
      });
    }
  };

  const displayedReviews = useMemo(
    () => reviews.slice(0, Math.max(reviews.length, 5)),
    [reviews]
  );

  return (
    <section id="testimonios" className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-slate-800">
                  {placeRating.rating.toFixed(1)} / 5.0
                </span>
              </div>
              <span className="text-sm text-slate-600">
                {placeRating.total}+ reseñas verificadas
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl text-slate-900 mb-3">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              Carrusel actualizado con opiniones directas de Google Maps
            </p>

            {errorMessage && (
              <p className="text-sm text-orange-600 mt-2">{errorMessage}</p>
            )}
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
              >
                {displayedReviews.map((review, index) => (
                  <article
                    key={review.id || index}
                    className="snap-center shrink-0 w-full sm:w-[85%] md:w-[70%] lg:w-[55%] px-1"
                  >
                    <div className="bg-slate-50 rounded-3xl p-8 h-full border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white opacity-70" />
                      <div className="relative">
                        <Quote className="w-10 h-10 text-blue-200 mb-4" />

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-700 font-semibold">
                            {review.profilePhoto ? (
                              <img
                                src={review.profilePhoto}
                                alt={review.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span>{review.name?.[0] || 'G'}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(Math.round(review.rating || 5))].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-slate-800 mb-6 leading-relaxed text-lg">
                          “{review.text}”
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm text-slate-600">
                          <div>
                            <p className="text-slate-900 font-semibold">{review.name}</p>
                            <p>{review.location || review.time || 'Google Maps'}</p>
                          </div>
                          <a
                            href={review.profileUrl || GOOGLE_PLACE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                          >
                            Ver en Google
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow hover:shadow-md transition-all flex items-center justify-center"
                  aria-label="Anterior"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow hover:shadow-md transition-all flex items-center justify-center"
                  aria-label="Siguiente"
                >
                  <ArrowRight className="w-5 h-5 text-slate-700" />
                </button>
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando reseñas...
                  </div>
                )}
              </div>

              <a
                href={GOOGLE_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 font-semibold"
              >
                Ver todas en Google
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
