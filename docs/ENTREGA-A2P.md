# Entrega del administrador web — A2P 10DLC

Respuesta a la especificación *"Entrega única para el administrador web de
Infinity Water"* del 5 de agosto de 2026.

**Sitio:** https://www.infinitywatersite.com/
**Entidad:** Global Innovation LLC d/b/a Infinity Water
**Dirección publicada:** 3940 Metro Pkwy., Fort Myers, FL 33916
**Versión de consentimiento:** `IW-SMS-CONSENT-v1-2026-08-05`

---

## 1–5. URLs finales

El dominio canónico es **con www**. `infinitywatersite.com` responde 301 a
`www.infinitywatersite.com`, y el canonical, el sitemap, los hreflang y el
JSON-LD apuntan todos a la versión con www.

| # | Página | URL |
|---|---|---|
| 1 | Portada | https://www.infinitywatersite.com/ |
| 2 | Privacy Policy | https://www.infinitywatersite.com/privacy-policy |
| 3 | Terms & Conditions | https://www.infinitywatersite.com/terms-and-conditions |
| 4 | SMS Policy | https://www.infinitywatersite.com/sms-policy |
| 5 | Free Water Test | https://www.infinitywatersite.com/free-water-test |
| 6 | Contact | https://www.infinitywatersite.com/contact |

Versiones en español (no sustituyen a las anteriores; las páginas legales en
español incluyen además el texto completo en inglés):

- https://www.infinitywatersite.com/es
- https://www.infinitywatersite.com/es/politica-de-privacidad
- https://www.infinitywatersite.com/es/terminos-y-condiciones
- https://www.infinitywatersite.com/es/politica-de-sms
- https://www.infinitywatersite.com/es/analisis-de-agua-gratis
- https://www.infinitywatersite.com/es/contacto

### Estado del despliegue

**Publicado y verificado en producción.** Las seis páginas responden 200 por
HTTPS con contenido propio y sin redirecciones. Certificado emitido y con
renovación automática.

El contenido está prerenderizado: el HTML que devuelve el servidor ya incluye
todo el texto, sin depender de JavaScript. Una comprobación automática que no
ejecute scripts ve las páginas completas.

---

## 6–7. Capturas del formulario

Pendientes de adjuntar por Óscar una vez desplegado: una captura completa en
escritorio y otra en móvil de https://www.infinitywatersite.com/free-water-test,
mostrando los campos, las dos casillas desmarcadas y los enlaces legales.

---

## 8–9. El formulario y sus consentimientos

El formulario incrustado en `/free-water-test` es **el de GoHighLevel**
facilitado por Déjà Vu IA:

```
https://api.dejavuia.com/widget/form/LgLxNfMMaa7apAp6aDB4
```

Se integró como iframe embebido, con el script oficial de redimensionado, y
funciona en computadora y en teléfono. **No se modificó ningún campo, texto de
consentimiento ni casilla legal**, conforme al punto 3 de la solicitud.

Las casillas, su estado inicial y el comportamiento de envío los controla
GoHighLevel. Cualquier cambio se pide a Déjà Vu IA.

### Un único punto de captura

El sitio recoge números de teléfono **solo** en ese formulario. La portada y
`/contact` enlazan a `/free-water-test` en lugar de repetirlo. Esto es
deliberado: dos formularios con sus propias casillas generarían dos registros
de consentimiento distintos para la misma persona.

Verificado automáticamente en cada build: la prueba falla si aparece cualquier
campo de teléfono fuera de ese iframe.

---

## 10. Dónde se almacena la evidencia

**En GoHighLevel**, dentro del contacto que crea el propio formulario. El sitio
web no almacena nada y no interviene en el registro del consentimiento.

La exportación se hace desde GoHighLevel: *Contacts → Export*.

### Lo que sí aporta el sitio

Los parámetros de campaña se capturan al entrar y se pasan al formulario para
que GoHighLevel pueda atribuir cada lead:

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
`fbclid` y `seller`.

Se guardan al llegar a cualquier página y se anexan a la URL del widget, porque
de lo contrario se perderían en cuanto el visitante navegara. Gana el primer
toque. El campo `seller` acepta solo `Angie` o `Carlos`, vía `?seller=` en la
URL de entrada.

---

## 11. Enlaces legales visibles

Los tres enlaces aparecen **encima del formulario**, en texto visible y con
iconos, no dentro de menús ni ventanas emergentes:

- Privacy Policy → `/privacy-policy`
- Terms & Conditions → `/terms-and-conditions`
- SMS Policy → `/sms-policy`

Van antes del formulario a propósito, para que se vean sin depender de que el
iframe haya cargado. Sobre ellos se lee: *"Text message consent is optional and
is not required to submit this form or to purchase any product or service."*

Los cinco enlaces legales están además en el pie de todas las páginas.

---

## 12. Cada ruta es una página distinta

Confirmado. Cada una se genera como un fichero HTML independiente durante el
build, con su propio `<title>`, su descripción y su URL canónica. Ninguna
redirige a la portada.

Comprobado sobre el sitio compilado:

```
/                        200  Infinity Water | Water Filtration, Reverse Osmosis & Treatment in Florida
/privacy-policy          200  Privacy Policy | Infinity Water
/terms-and-conditions    200  Terms & Conditions | Infinity Water
/sms-policy              200  SMS Policy | Infinity Water
/free-water-test         200  Free Water Test | Infinity Water
/contact                 200  Contact | Infinity Water

redirecciones: 0 en todas
```

Son accesibles en modo incógnito, sin autenticación y sin CAPTCHA previo a la
lectura. `robots.txt` permite el rastreo completo.

---

## 13. El pie global contiene entidad, marca, dirección y enlaces legales

Confirmado. Visible en todas las páginas, tanto en escritorio como en móvil:

```
Global Innovation LLC d/b/a Infinity Water
Infinity Water is operated by Global Innovation LLC, doing business as Infinity Water.
3940 Metro Pkwy., Fort Myers, FL 33916
g.innovar@gmail.com · Customer support: (475) 685-8464

Privacy Policy · Terms & Conditions · SMS Policy · Contact · Free Water Test
```

Los cuatro enlaces son texto visible, no van dentro de menús desplegables ni
ventanas emergentes. La entidad legal aparece también en las páginas legales y
en los datos estructurados (`legalName`).

---

## 14. No queda ninguna referencia al número de calle anterior

Confirmado. La dirección publicada es exactamente `3940 Metro Pkwy.` en el pie,
en la página de contacto, en ambos documentos legales y en el JSON-LD. No
aparece ningún número de suite.

La prueba automática recorre las doce rutas del sitio y falla si detecta el
número de calle antiguo en cualquiera de ellas.

---

## 15. Respaldo previo a los cambios

Todo el trabajo está versionado en Git. El estado anterior a estos cambios es
el commit `d7be01c`, y el anterior a toda la intervención es `22a1051`.

Repositorio: https://github.com/osccarJR/infinitywatersite2

Para volver atrás: `git revert 7b15818`.

---

## Lo que falta para poder presentar la campaña

**El número A2P aprobado.** En cuanto se compre, se define en la variable
`VITE_SMS_PHONE_NUMBER` y aparece automáticamente en el formulario, en la
página de contacto y en el pie. Mientras esté vacía no se muestra en ninguna
parte: publicar un número equivocado es peor que no publicar ninguno.

Es cuestión de minutos en cuanto llegue el dato.

---

## Observaciones

- **El correo publicado es `g.innovar@gmail.com`**, tal y como fija la
  especificación. Debe estar operativo, porque algunos revisores escriben a esa
  dirección para verificar el negocio. Un correo del propio dominio
  (`info@infinitywatersite.com`) suele dar mejor impresión en la revisión, pero
  esa es una decisión del negocio, no técnica.

- **Los textos legales en inglés se publicaron literalmente** como venían en la
  especificación, sin reescribirlos por estilo. Aun así conviene que un abogado
  en Florida los revise antes de darlos por definitivos.

- **No se ha tocado el DNS** ni se ha creado ningún registro TXT, CNAME o
  archivo de verificación por anticipado, conforme a la sección 12 de la
  especificación. HTTPS está activo en todo el sitio.

- **La sección de reseñas sigue oculta** porque todavía no hay reseñas reales
  conectadas. Es intencionado: mostrar testimonios inventados es motivo de
  rechazo tanto en Google Ads como en la revisión de la campaña.

- **Se añadió una página propia de Política de SMS** (`/sms-policy`), como se
  pidió. Repite deliberadamente cláusulas de los Términos: en textos legales
  cada documento debe sostenerse por sí solo, porque el revisor puede llegar a
  cualquiera de los dos.
