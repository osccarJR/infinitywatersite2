# Infinity Water

Sitio web de **Infinity Water**: venta, instalación y mantenimiento de sistemas de
filtración de agua, ósmosis inversa y tratamiento de pozo en Florida.

Es una landing page bilingüe (inglés/español) enfocada en generar contactos por
teléfono, WhatsApp y formulario. No tiene backend: todo se sirve como estáticos.

**Producción:** https://www.infinitywatersite.com

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

## Cumplimiento A2P 10DLC

El sitio esta preparado para registrar una campana A2P 10DLC con Twilio o
GoHighLevel, segun la especificacion del 5 de agosto de 2026.

### Las cuatro URLs que revisa la operadora

Deben devolver HTTP 200, contenido propio y distinto, y no redirigir:

| URL | Contenido |
|---|---|
| `/privacy-policy` | Politica de privacidad con la clausula de opt-in SMS |
| `/terms-and-conditions` | Terminos del programa de SMS |
| `/free-water-test` | Formulario con los dos consentimientos |
| `/contact` | Identidad, direccion y datos de contacto |

Cada una tiene su equivalente en espanol bajo `/es/`. Las paginas legales en
espanol incluyen ademas el texto completo en ingles, porque la revision se
hace en Estados Unidos.

### Identidad

Se declara **GLOBAL INNOVATION GROUP INFINITY LLC d/b/a Infinity Water** en el
pie de todas las paginas, en las paginas legales y en el JSON-LD. La direccion
publicada es exactamente `3940 Metro Pkwy., Fort Myers, FL 33916`.

La razon social vive en
[`src/constants/legalEntity.js`](src/constants/legalEntity.js), en su propio
modulo porque tambien la necesita `src/i18n/seo.js`, al que carga
`vite.config.js` en contexto Node. Cambiarla ahi la propaga a todo el sitio;
el unico sitio adicional que tocar es el JSON-LD de `index.html`, que es
estatico. Debe coincidir **letra por letra** con el registro A2P.

El resto de datos del negocio (telefonos, correo, direccion, cifras) siguen en
[`src/constants/business.js`](src/constants/business.js).

### El formulario y el consentimiento

El formulario de captacion **no vive en este repositorio**. Lo construye y lo
mantiene Deja Vu IA en GoHighLevel, y se incrusta como iframe desde
`api.dejavuia.com`. Ahi es donde estan los campos, las dos casillas de
consentimiento y el registro de la evidencia (casilla marcada, texto mostrado,
fecha, IP y origen).

Todo eso vive en [`src/components/GhlForm.jsx`](src/components/GhlForm.jsx),
que es un envoltorio de treinta lineas. **No dupliques aqui campos ni textos
de consentimiento:** cualquier cambio se pide a Deja Vu IA y se hace en
GoHighLevel. Un segundo formulario con su propia copia del consentimiento
generaria dos registros distintos para la misma persona, que es exactamente lo
que la especificacion A2P prohibe.

Por la misma razon el sitio tiene **un unico punto de captura**: la pagina
`/free-water-test`. La portada y `/contact` enlazan ahi en vez de repetir el
formulario, y `npm run test:smoke` falla si aparece cualquier `input` de
telefono fuera de ese iframe.

### Atribucion

[`src/lib/attribution.js`](src/lib/attribution.js) guarda los parametros de
campana (`utm_*`, `fbclid`, `seller`) al entrar al sitio y los anexa a la URL
del widget, para que GoHighLevel sepa que anuncio trajo cada lead. Se guardan
en `sessionStorage` porque se pierden en cuanto el visitante navega, y gana el
primer toque.

### Paginas legales

Tres documentos, cada uno con su ruta propia en ingles y en espanol:
`/privacy-policy`, `/terms-and-conditions` y `/sms-policy`. Los textos estan en
[`src/content/`](src/content/) y el ingles lo fija la especificacion A2P: no
debe reescribirse por estilo, porque la operadora busca clausulas concretas.

Los tres enlaces aparecen de forma visible sobre el formulario y en el pie de
todas las paginas.

### Lo que falta para poder presentar la campana

**`VITE_SMS_PHONE_NUMBER`**: mientras este vacio no se muestra en ningun
sitio. La campana no se presenta hasta que la web muestre el numero exacto que
originara los mensajes.

---

## Pendiente / a revisar

- **Textos legales**: el inglés es el que fija la especificación A2P y no debe
  reescribirse por estilo. Aun así conviene que un abogado en Florida los revise
  antes de darlos por definitivos.
- **Correo de contacto**: se publica `g.innovar@gmail.com`, tal y como fija la
  especificación A2P. Debe estar operativo: los revisores escriben a esa
  dirección. Un correo del propio dominio daría mejor impresión en la revisión,
  pero eso es decisión del negocio.
- **Reseñas**: hace falta el Place ID de Google para activar la sección.

---

Diseñado y desarrollado por [Nivusoftware](https://www.nivusoftware.com/).
