# Infinity Water

Sitio web de **Infinity Water** (GLOBAL INNOVATION GROUP INFINITY LLC d/b/a
Infinity Water): tratamiento de agua de pozo y de ciudad en el suroeste de
Florida. Empresa familiar hispana; el público principal son familias
hispanas de Fort Myers, Cape Coral, Lehigh Acres y Naples.

Sitio estático bilingüe (inglés en `/`, español en `/es`), sin backend. El
objetivo es un solo: que la gente pida el **análisis de agua gratis**, por el
formulario, por WhatsApp o por teléfono.

**Producción:** https://www.infinitywatersite.com

---

## Stack

| Pieza | Qué hace |
|---|---|
| Astro 7 | Genera cada página como HTML estático. Solo lleva JavaScript lo interactivo (menú, chequeo de agua, formulario) |
| Tailwind CSS 4 | Estilos. Paleta y tipografía en `web/styles/global.css` |
| Fraunces + Manrope | Tipografías autoalojadas (`@fontsource`) |
| lucide-static | Iconos SVG en línea, sin JS |
| nginx | Servidor de producción (VPS o Docker) |

Requisitos: **Node.js 22.12 o superior**.

```bash
npm install
cp .env.example .env    # opcional: analítica, reseñas, número de SMS
npm run dev             # http://localhost:4321
```

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo con recarga en caliente |
| `npm run build` | Compila a `dist/` (páginas, sitemap, robots, imágenes optimizadas) |
| `npm run preview` | Sirve `dist/` en local |
| `npm run check` | Comprobación de tipos de Astro/TypeScript |
| `npm run test:smoke` | Revisa el HTML compilado: A2P, SEO, enlaces rotos, afirmaciones prohibidas, tildes |
| `npm run optimize:images` | Regenera logo, sellos, imagen OG y favicons desde `assets/source/` |

**Antes de publicar:** `npm run build && npm run test:smoke`.

---

## Estructura

```
web/                          Código del sitio (srcDir de Astro)
  config/business.ts          ÚNICA fuente de datos del negocio (ver abajo)
  data/
    types.ts                  Esquema de las páginas de contenido
    pages/*.ts                Textos de servicios, problemas, ciudades, guías y empresa (EN + ES)
    labels.ts                 Nombres cortos de cada página (menús, tarjetas)
    waterCheck.ts             Datos del "Chequeo de agua" (síntomas y datos oficiales por ciudad)
    legal/*.ts                Textos legales (el inglés lo fija A2P: NO reescribir)
  i18n/routes.ts              Rutas por idioma
  i18n/ui.ts                  Textos compartidos (menú, botones, pie)
  layouts/Base.astro          <head> con SEO, JSON-LD, cabecera, pie, barra móvil
  views/                      Plantilla de cada tipo de página
  components/                 Cabecera, pie, chequeo de agua, cierre, iconos
  scripts/                    JS de cliente: analítica, atribución, formulario GHL
  lib/reviews.ts              Reseñas de Google obtenidas en el build
  pages/[...slug].astro       Enrutador: genera todas las páginas en ambos idiomas
scripts/                      smoke.mjs, optimize-images.mjs
deploy/                       Configuración nginx del VPS
assets/source/                Originales en alta (no se publican)
```

### Reglas

1. **Los datos del negocio van en `web/config/business.ts`**: teléfonos,
   dirección, años de experiencia, garantía, sellos, cobertura, horario.
   Ningún componente escribe un dato a mano.
2. **Todo texto va en inglés y en español en el mismo sitio.** El español
   usa tuteo y tildes; la prueba de humo avisa de palabras frecuentes sin tilde.
3. **Añadir una página de contenido** = añadir un objeto a `web/data/pages/*.ts`
   siguiendo `web/data/types.ts`. La ruta, el menú, el sitemap, el hreflang y
   el JSON-LD salen solos. Si es un servicio, problema o ciudad aparece
   también en menús y pie.
4. **Nada que no se pueda demostrar.** Ver "Afirmaciones" más abajo.

---

## Páginas

| Tipo | Inglés | Español |
|---|---|---|
| Portada | `/` | `/es` |
| Análisis gratis (formulario) | `/free-water-test` | `/es/analisis-de-agua-gratis` |
| Gracias (noindex) | `/thank-you` | `/es/gracias` |
| Contacto | `/contact` | `/es/contacto` |
| Guías | `/well-water`, `/city-water`, `/hurricane-well-care` | `/es/agua-de-pozo`, `/es/agua-de-ciudad`, `/es/pozo-despues-del-huracan` |
| Servicios | `/services`, `/services/*` | `/es/servicios`, `/es/servicios/*` |
| Problemas | `/problems/*` | `/es/problemas/*` |
| Zonas | `/areas`, `/areas/*` | `/es/zonas`, `/es/zonas/*` |
| Empresa | `/about`, `/financing`, `/faq` | `/es/nosotros`, `/es/financiamiento`, `/es/preguntas-frecuentes` |
| Legales | `/privacy-policy`, `/terms-and-conditions`, `/sms-policy` | `/es/politica-de-privacidad`, `/es/terminos-y-condiciones`, `/es/politica-de-sms` |

57 páginas en total, más `sitemap.xml`, `robots.txt` y `404.html`.

### El Chequeo de agua

Herramienta de la portada (`web/components/WaterCheck.astro`). El usuario elige
pozo o ciudad, lo que nota y su zona, y ve:

- la causa probable,
- qué haríamos,
- los datos del reporte oficial de su ciudad, con enlace a la fuente.

**No pide datos personales.** Lleva al formulario con el contexto en la URL
(`water_source`, `concerns`, `city`), que se pasa al iframe de GoHighLevel.
Las cifras de cada ciudad vienen de los reportes oficiales (CCR) y están en
`web/data/waterCheck.ts`. Hay que revisarlas cada año cuando salga el reporte
nuevo.

---

## Variables de entorno

Todas son opcionales y se leen **al compilar**. Ver
[`.env.example`](.env.example).

- **Analítica:** `VITE_GTM_ID`, `VITE_GA4_ID`, `VITE_GOOGLE_ADS_ID` y
  `VITE_ADS_CONVERSION_LABEL_*`. Sin ellas no se carga ningún script de
  terceros.
- **Reseñas:** `VITE_GOOGLE_PLACES_API_KEY` y `VITE_GOOGLE_PLACE_ID`. Se
  consultan en el build, así que la clave no llega al navegador. Sin ellas,
  la portada enlaza al perfil de Google.
- **SMS:** `VITE_SMS_PHONE_NUMBER` es el número aprobado de la campaña A2P.
  Mientras esté vacío no se muestra en ninguna parte.

### Medición de conversiones

Los enlaces llevan `data-track="call" | "whatsapp" | "free_test_cta"` y
`data-location="hero" | "footer"...`. Un único listener en
`web/scripts/analytics.ts` los registra. Los enlaces `tel:` y de WhatsApp
funcionan aunque falle el JavaScript.

**Envío del formulario:** `web/scripts/ghl.ts` escucha el mensaje real que
manda el formulario de GoHighLevel al enviarse:
`["set-sticky-contacts", "_ud", "<json>"]`. Con él registra `generate_lead`
más la conversión de Google Ads, y después lleva al usuario a la página de
gracias. La versión anterior buscaba las palabras "submit" y "success", que
ese mensaje no contiene, así que el envío del formulario nunca se contaba.
**No se envían datos personales a Analytics.**

---

## Afirmaciones: qué se publica y qué no

El sitio anterior publicaba afirmaciones que los registros públicos
contradecían. La regla ahora es publicar solo lo que se puede demostrar.
`npm run test:smoke` falla si vuelve a aparecer cualquiera de estas:

- **Sello BBB:** está en `SEALS` con `enabled: false`. El perfil de BBB,
  consultado el 26-sep-2026, dice *Not BBB Accredited* y calificación F. Se
  activa con `enabled: true` cuando el perfil diga *Accredited*.
- **WQA:** el logo es de miembro, así que se publica "Miembro de la WQA" y
  nunca "WQA Certified".
- **Experiencia:** "más de 25 años" se atribuye siempre **al fundador**,
  porque la LLC es de 2022.
- **Otras afirmaciones que no se publican:**
  - cifras de clientes,
  - urgencia falsa ("solo quedan 15 cupos"),
  - "elimina el 99 %",
  - beneficios de salud del agua alcalina,
  - años de garantía (la garantía es la del fabricante, más soporte de por
    vida con condiciones),
  - cuotas o tasas de financiamiento, porque obligan a publicar APR y
    condiciones (TILA).
- **Made in USA** (`MADE_IN_USA`): lo afirma el negocio. La regla de la FTC
  exige que "todo o prácticamente todo" el producto sea de EE. UU.; si no, hay
  que poner `false`.

---

## Cumplimiento A2P 10DLC

Ver [`docs/ENTREGA-A2P.md`](docs/ENTREGA-A2P.md). Lo esencial:

- **Rutas en inglés:** las de legales, `/free-water-test` y `/contact` están
  registradas y **no se renombran**.
- **Identidad:** la razón social y la dirección (`3940 Metro Pkwy.`) deben
  coincidir letra por letra con el registro. Viven en `web/config/business.ts`.
- **Punto único de captura:** el formulario de GoHighLevel, que mantiene Deja
  Vu IA, está solo en `/free-water-test`. Los tres enlaces legales van antes
  del formulario. No se duplican campos ni textos de consentimiento.
- **Páginas legales en español:** muestran la traducción y, debajo, el texto
  oficial en inglés.
- **Pie legal:** está en todas las páginas.

---

## Despliegue

### VPS con nginx (producción actual)

```bash
npm run deploy            # compila, prueba, publica y verifica
npm run deploy -- --nginx # además sube deploy/infinitywater-common.conf
```

[`scripts/deploy.sh`](scripts/deploy.sh) hace lo siguiente:

1. Compila desde cero y pasa la prueba de humo. Si falla, no publica nada.
2. Sube `dist/` a `dist-new/` en el servidor, sin tocar producción.
3. Hace el cambio atómico `dist → dist-prev` y `dist-new → dist`, y recarga
   nginx solo si `nginx -t` pasa.
4. Comprueba en producción las URL de A2P y la 404.

Necesita el alias SSH `nivusoftware-vps-principal` en `~/.ssh/config`. El
servidor es compartido con otros sitios, así que nunca hay que recargar nginx
sin `nginx -t`.

**Volver atrás:**
`ssh nivusoftware-vps-principal 'cd /var/www/static/infinitywater && mv dist dist-bad && mv dist-prev dist'`

En [`deploy/`](deploy/) está la configuración de nginx:

- `try_files $uri $uri/index.html =404` sirve cada ruta sin redirecciones.
- Las rutas que no existen responden con un **404 real** usando `404.html`.
- El vhost del servidor tiene además los bloques TLS de Certbot, que no están
  en el repo. **No sobrescribirlo:** solo se sube el snippet.

**Cloudflare** está delante del sitio y guarda en caché los estáticos (imágenes,
favicon) hasta 30 días. El HTML no se cachea, y los archivos de `/_astro/`
llevan hash en el nombre. Si cambias un archivo de `public/` que conserva el
nombre, purga la caché en Cloudflare o súbele la versión (`?v=`) en el enlace.

### Docker

```bash
docker compose --profile prod up --build web    # http://localhost:8080
```

### Panel tipo Pterodactyl

`npm start` compila y sirve `dist/` en `PORT`. Con `SKIP_BUILD=1` no recompila.

---

## Pendiente

- **Fotos reales:** equipo, instalaciones, camioneta, antes y después. Las
  actuales son ilustrativas. Las antiguas de equipos eran generadas por IA,
  con logos mal escritos y marca de agua, y se eliminaron.
- **Horario real:** rellenar `HOURS` en `business.ts`. Hoy solo dice "7 días
  a la semana".
- **Reseñas:** faltan la clave de Places y el Place ID. El perfil de Google
  (`GOOGLE_PROFILE_URL`) apunta a un pin en el Golfo de México, así que
  conviene revisar la ficha de Google Business.
- **Datos oficiales:** revisar las cifras de cada ciudad cuando se publiquen
  los reportes CCR de cada año.
- **Textos legales:** conviene que los revise un abogado en Florida.

---

Diseñado y desarrollado por [Nivusoftware](https://www.nivusoftware.com/).
