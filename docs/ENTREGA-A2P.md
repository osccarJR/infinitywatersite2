# Entrega del administrador web — A2P 10DLC

Respuesta a la especificación *"Entrega única para el administrador web de
Infinity Water"* del 5 de agosto de 2026.

**Sitio:** https://www.infinitywatersite.com/
**Entidad:** Global Innovation LLC d/b/a Infinity Water
**Dirección publicada:** 3940 Metro Pkwy., Fort Myers, FL 33916
**Versión de consentimiento:** `IW-SMS-CONSENT-v1-2026-08-05`

---

## 1–5. URLs finales

| # | Página | URL | Estado |
|---|---|---|---|
| 1 | Portada | https://www.infinitywatersite.com/ | Publicada |
| 2 | Privacy Policy | https://www.infinitywatersite.com/privacy-policy | Publicada |
| 3 | Terms & Conditions | https://www.infinitywatersite.com/terms-and-conditions | Publicada |
| 4 | Free Water Test | https://www.infinitywatersite.com/free-water-test | Publicada |
| 5 | Contact | https://www.infinitywatersite.com/contact | Publicada |

Versiones en español (no sustituyen a las anteriores; las páginas legales en
español incluyen además el texto completo en inglés):

- https://www.infinitywatersite.com/es
- https://www.infinitywatersite.com/es/politica-de-privacidad
- https://www.infinitywatersite.com/es/terminos-y-condiciones
- https://www.infinitywatersite.com/es/analisis-de-agua-gratis
- https://www.infinitywatersite.com/es/contacto

---

## 6–7. Capturas del formulario

Pendientes de adjuntar por Óscar una vez desplegado: una captura completa en
escritorio y otra en móvil de https://www.infinitywatersite.com/free-water-test,
mostrando los campos, las dos casillas desmarcadas y los enlaces legales.

---

## 8. Las dos casillas son separadas, opcionales y desmarcadas

Confirmado.

- Son dos `<input type="checkbox">` independientes, con nombres
  `sms_consent_transactional` y `sms_consent_marketing`.
- El estado inicial de ambas es `false` en el propio código
  (`INITIAL_FORM` de `src/components/LeadForm.jsx`). Ninguna se marca sola ni
  marca a la otra.
- Ninguna es obligatoria: la función de validación del formulario no las
  consulta en absoluto.

Verificado automáticamente en cada build: la prueba `npm run test:smoke`
falla si algún checkbox llega marcado en el HTML servido.

---

## 9. El formulario se envía sin marcar SMS

Confirmado. Los campos obligatorios son únicamente nombre, apellido, teléfono
móvil, ciudad, código postal y tipo de agua. El consentimiento SMS no entra en
la validación, y el botón de enviar no equivale a consentimiento: el registro
guarda `false` en ambas casillas si el usuario no marca ninguna.

---

## 10. Dónde se almacena la evidencia y cómo se exporta

El sitio es estático, así que el almacenamiento lo hace el receptor. Al enviar,
el formulario hace `POST` de un JSON a la URL configurada en
`VITE_LEAD_WEBHOOK_URL`, pensada para un **webhook entrante de GoHighLevel**
(*Automatización → Webhook*), que crea el contacto y guarda cada campo.

La exportación se hace desde GoHighLevel: *Contacts → Export*, incluyendo los
campos personalizados listados abajo.

> **Pendiente:** esta variable todavía no tiene valor. Mientras esté vacía el
> formulario **no guarda nada**: muestra un error y ofrece teléfono y correo,
> en lugar de fingir un envío correcto y perder el lead. Hace falta que Déjà Vu
> IA facilite la URL del webhook de GHL.

**Dirección IP:** la registra el receptor del webhook a partir de la petición,
que es la forma fiable de obtenerla. El navegador no puede conocer su propia IP
sin depender de un tercero. Si el receptor no la registra, se puede definir
`VITE_IP_LOOKUP_URL` y se añade al payload.

---

## 11. Nombres exactos de los campos

Consentimiento y versión:

| Campo | Tipo | Contenido |
|---|---|---|
| `sms_consent_transactional` | booleano | Casilla A, mensajes no promocionales |
| `sms_consent_marketing` | booleano | Casilla B, mensajes promocionales |
| `sms_consent_transactional_text` | texto | Texto literal mostrado, solo si se marcó |
| `sms_consent_marketing_text` | texto | Texto literal mostrado, solo si se marcó |
| `consent_version` | texto | `IW-SMS-CONSENT-v1-2026-08-05` |
| `consent_language` | texto | `en` o `es`, idioma en que se mostró |

Contexto de la captura:

`consent_timestamp_iso`, `consent_timestamp_local`, `consent_timezone`,
`consent_url`, `page_path`, `user_agent`, `ip_address`, `submission_id`.

Datos de contacto:

`first_name`, `last_name`, `full_name`, `phone` (E.164), `phone_raw`, `email`,
`address`, `city`, `state`, `postal_code`, `water_source`, `best_contact_time`,
`comments`.

Atribución:

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
`fbclid`, `fbc`, `fbp`, `landing_page`, `referrer`, `seller`.

El campo `seller` acepta solo `Angie` o `Carlos`, y se toma del parámetro
`?seller=` de la URL de entrada. La atribución se captura al entrar al sitio y
se conserva durante la sesión, para que no se pierda al navegar entre páginas.

---

## 12. Las cuatro rutas son páginas distintas

Confirmado. Cada una se genera como un fichero HTML independiente durante el
build, con su propio `<title>`, su descripción y su URL canónica. Ninguna
redirige a la portada.

Comprobado sobre el sitio compilado:

```
/                        200  Infinity Water | Water Filtration, Reverse Osmosis & Treatment in Florida
/privacy-policy          200  Privacy Policy | Infinity Water
/terms-and-conditions    200  Terms & Conditions | Infinity Water
/free-water-test         200  Free Water Test | Infinity Water
/contact                 200  Contact | Infinity Water

redirecciones: 0 en las cuatro
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

Privacy Policy · Terms & Conditions · Contact · Free Water Test
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

Dos cosas, ambas fuera del alcance de la web:

1. **URL del webhook de GoHighLevel** → `VITE_LEAD_WEBHOOK_URL`.
   Sin ella no se almacena evidencia de consentimiento y el punto 10 de esta
   entrega queda incompleto.

2. **Número A2P aprobado** → `VITE_SMS_PHONE_NUMBER`.
   Mientras esté vacío no se muestra en ninguna parte, lo cual es deliberado:
   publicar un número equivocado es peor que no publicar ninguno. La campaña no
   puede presentarse hasta que la web muestre el número exacto que originará los
   mensajes.

En cuanto lleguen esos dos valores se configuran, se despliega y la web queda
lista para la revisión.

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
