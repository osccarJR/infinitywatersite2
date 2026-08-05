# Imagen de produccion.
#
# El Dockerfile anterior arrancaba `npm run dev`: servidor de desarrollo,
# sin minificar, con el codigo fuente dentro de la imagen. Esto compila de
# verdad y sirve los estaticos con nginx.

# ---------- build ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# Vite necesita las VITE_* en tiempo de build: se hornean en el bundle.
#   docker build --build-arg VITE_GTM_ID=GTM-XXXX .
ARG VITE_GTM_ID=""
ARG VITE_GA4_ID=""
ARG VITE_GOOGLE_ADS_ID=""
ARG VITE_ADS_CONVERSION_LABEL_CALL=""
ARG VITE_ADS_CONVERSION_LABEL_WHATSAPP=""
ARG VITE_ADS_CONVERSION_LABEL_FORM=""
ARG VITE_REVIEWS_ENDPOINT=""
ARG VITE_GOOGLE_PLACES_API_KEY=""
ARG VITE_GOOGLE_PLACE_ID=""

ENV VITE_GTM_ID=$VITE_GTM_ID \
    VITE_GA4_ID=$VITE_GA4_ID \
    VITE_GOOGLE_ADS_ID=$VITE_GOOGLE_ADS_ID \
    VITE_ADS_CONVERSION_LABEL_CALL=$VITE_ADS_CONVERSION_LABEL_CALL \
    VITE_ADS_CONVERSION_LABEL_WHATSAPP=$VITE_ADS_CONVERSION_LABEL_WHATSAPP \
    VITE_ADS_CONVERSION_LABEL_FORM=$VITE_ADS_CONVERSION_LABEL_FORM \
    VITE_REVIEWS_ENDPOINT=$VITE_REVIEWS_ENDPOINT \
    VITE_GOOGLE_PLACES_API_KEY=$VITE_GOOGLE_PLACES_API_KEY \
    VITE_GOOGLE_PLACE_ID=$VITE_GOOGLE_PLACE_ID

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
