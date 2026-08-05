# Infinity Water

Sitio web de **Infinity Water**: venta, instalación y mantenimiento de sistemas de
filtración de agua, ósmosis inversa y tratamiento de pozo en Florida.

Es una landing page bilingüe (inglés/español) enfocada en generar contactos por
teléfono, WhatsApp y formulario. No tiene backend: todo se sirve como estáticos.

**Producción:** https://infinitywatersite.com

---

## Stack

| Pieza | Qué hace |
|---|---|
| React 19 + Vite 6 | Interfaz y empaquetado |
| React Router 7 | Rutas e idioma por URL (`/` en inglés, `/es` en español) |
| Tailwind CSS 3 | Estilos |
| sharp | Optimización de imágenes (script de un solo uso) |
| nginx (Docker) | Servidor de producción |

---

## Puesta en marcha

Requisitos: **Node.js 20 o superior**.

```bash
npm install
cp .env.example .env    # opcional: analítica y reseñas
npm run dev             # http://localhost:5173
```

### Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila a `dist/` y genera el HTML por ruta y el sitemap |
| `npm run preview` | Sirve `dist/` en local para revisar el build |
| `npm run lint` | ESLint |
| `npm run test:smoke` | Renderiza todas las rutas en Node y valida el contenido |
| `npm run optimize:images` | Regenera las imágenes de `public/images/` |

---

## Variables de entorno

Todas son **opcionales**. Sin ellas el sitio funciona igual: no se carga ningún
script de terceros y la sección de reseñas no aparece.

Ver [`.env.example`](.env.example) para la lista completa y comentada.

> **Ojo:** todo lo que empieza por `VITE_` acaba dentro del JavaScript público.
> Nunca poner ahí un secreto que no pueda ver cualquiera.

### Medición de conversiones

`VITE_GTM_ID`, `VITE_GA4_ID`, `VITE_GOOGLE_ADS_ID` y las tres etiquetas
`VITE_ADS_CONVERSION_LABEL_*`.

Cada clic en *Llamar*, en *WhatsApp* y cada envío del formulario dispara un
evento `generate_lead` y, si hay etiqueta configurada, una conversión de Google
Ads. Toda la lógica vive en [`src/lib/analytics.js`](src/lib/analytics.js) y las
acciones de contacto en [`src/lib/contactActions.js`](src/lib/contactActions.js):
ningún componente llama a `gtag` por su cuenta.

### Reseñas de Google

Dos opciones, excluyentes:

- **`VITE_REVIEWS_ENDPOINT`** (recomendada): un endpoint propio que consulta la
  API de Google, cachea y devuelve el mismo JSON. La clave se queda en el servidor.
- **`VITE_GOOGLE_PLACES_API_KEY` + `VITE_GOOGLE_PLACE_ID`**: llamada directa
  desde el navegador. Más rápido de montar, pero la clave queda visible en el
  bundle; hay que restringirla por referrer HTTP y solo a la Places API.

Si no se configura ninguna, `ReviewsSection` no se renderiza. **El sitio nunca
muestra testimonios inventados.**

---

## Estructura

```
assets/source/          PNG originales en alta (NO se publican)
public/images/          WebP optimizados que sí se sirven
scripts/
  optimize-images.mjs   assets/source -> public/images
  smoke-entry.jsx       prueba de humo de todas las rutas
src/
  constants/business.js Datos del negocio: teléfonos, horario, cifras, cobertura
  i18n/
    routes.js           Mapa de rutas por idioma
    seo.js              Títulos y descripciones por página e idioma
    LanguageProvider    Idioma derivado de la URL
  lib/
    analytics.js        GTM / GA4 / conversiones de Google Ads
    contactActions.js   Llamar y abrir WhatsApp, siempre con seguimiento
  components/           Secciones de la página
  pages/                Home, política de privacidad, 404
index.html              Plantilla con los marcadores <!--seo:start/end-->
vite.config.js          Build + plugin que genera un HTML por ruta y el sitemap
```

### Dos reglas que conviene respetar

1. **Los datos del negocio van en `src/constants/business.js`.** Teléfonos,
   correo, dirección, horario, número de clientes y cobertura. Antes estaban
   repetidos por los componentes y se contradecían entre secciones.

2. **Los textos van en el objeto `copy` de cada componente**, con una clave `en`
   y una `es`. Al añadir texto hay que traducirlo en el mismo sitio.

---

## Imágenes

Los originales viven en `assets/source/` y **no se publican**. `public/images/`
solo contiene los WebP optimizados que sirve el navegador.

```bash
npm run optimize:images
```

Los anchos de salida están en la tabla `IMAGES` de
[`scripts/optimize-images.mjs`](scripts/optimize-images.mjs) y corresponden al
tamaño real de presentación por dos (para pantallas retina). Pasarse de ahí solo
suma bytes que nadie ve: las imágenes pasaron de 32 MB a 412 KB (−98,8 %) sin
pérdida visible.

Al añadir una imagen: dejar el original en `assets/source/`, añadir su fila a
`IMAGES` y ejecutar el script.

---

## SEO

- **Un HTML estático por ruta e idioma.** Durante el build, el plugin de
  `vite.config.js` genera `dist/index.html`, `dist/es/index.html`, etc., cada uno
  con su `<title>`, descripción, canonical, `hreflang` y Open Graph. Hace falta
  porque WhatsApp, Facebook y buena parte de los rastreadores no ejecutan
  JavaScript.
- **El sitemap y el robots.txt se generan solos** a partir de `src/i18n/seo.js`,
  así que no pueden quedarse desfasados.
- **Datos estructurados** `LocalBusiness` en `index.html`, con dirección,
  coordenadas, horario, ambos teléfonos y la cobertura completa.

Al añadir una página: darla de alta en `ROUTES` (`src/i18n/routes.js`) y en
`PAGE_META` (`src/i18n/seo.js`), y añadir su `<Route>` en `src/App.jsx`. El HTML
estático y el sitemap salen solos.

---

## Despliegue

### Docker + nginx (recomendado)

```bash
docker compose --profile prod up --build web    # http://localhost:8080
```

Build multietapa: compila con Node y sirve con nginx (gzip, cabeceras de caché y
de seguridad). Las variables `VITE_*` se hornean en tiempo de build, así que hay
que pasarlas como `--build-arg` o tenerlas en el `.env` que lee compose.

### Panel tipo Pterodactyl

`npm start` ejecuta [`index.js`](index.js): compila y sirve `dist/` en el puerto
de `PORT`. Con `SKIP_BUILD=1` se salta la compilación si `dist/` ya existe.

### Estático puro

`npm run build` y subir `dist/`. El servidor debe reintentar
`$uri/index.html` antes del fallback a `/index.html`, o `/es` acabará devolviendo
la versión en inglés (ver [`nginx.conf`](nginx.conf)).

---

## Pendiente / a revisar

- **Política de privacidad**: [`src/pages/PrivacyPolicyPage.jsx`](src/pages/PrivacyPolicyPage.jsx)
  es una base honesta sobre lo que el sitio realmente hace, pero conviene que la
  revise un abogado en Florida antes de darla por definitiva.
- **Correo de contacto**: se usa `info@infinitywatersite.com` (coincide con el
  dominio). Si el buzón real es otro, cambiarlo en `src/constants/business.js`.
- **Reseñas**: hace falta el Place ID de Google para activar la sección.

---

Diseñado y desarrollado por [Nivusoftware](https://www.nivusoftware.com/).
