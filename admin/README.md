# Panel de gestión de Infinity Water (`/admin`)

Sistema interno del negocio: clientes, ventas, instalaciones, financieras,
comisiones, proveedores y servicio técnico. Vive en
`https://www.infinitywatersite.com/admin`, no está enlazado desde el sitio
público y no se indexa (`X-Robots-Tag: noindex`).

## Qué resuelve

| Lo que pidió el dueño | Dónde está |
|---|---|
| Fecha de venta y de instalación | Venta → *Fechas e instalación* |
| Qué financiera la financió | Venta → *Venta y cobro* |
| Si el cliente abonó cash o no, y cuánto | Venta → *El cliente abonó cash* |
| Quién vendió y cuánto cobra de comisión (se pone a mano) | Venta → *Quién vendió* |
| En cuánto se vendió y cuánto pagó la financiera | Venta → *Venta y cobro* (calcula el descuento de la financiera) |
| Qué técnico instaló y dónde | Venta → *Fechas e instalación* (dirección del cliente u otra) |
| Qué se instaló: ciudad o pozo, filtros fuera de casa (1–4), aireador, ósmosis en la cocina (5 pasos o en caja, con o sin UV) | Venta → *Lo que instalaste* (genérico, sin marcas) |
| Proveedores de la venta (uno o varios) y su costo | Venta → *Proveedores y costos* |
| Registro de clientes | *Clientes* |
| Servicio técnico: fecha del reporte, problema, garantía o cobrado y cuánto | *Servicio técnico* |
| Empezar desde hoy | **+ → Venta nueva** |
| Irse igualando con clientes anteriores | **+ → Cliente anterior** (solo cliente y fecha son obligatorios; el inicio muestra qué falta) y **+ → Servicio técnico** (crea el cliente ahí mismo) |
| Saber cuánto ganamos y cómo está la vuelta | *Inicio*: agenda de la semana, vendido, ganancia, cobrado, lo pendiente (te deben, comisiones, por instalar, servicio), mantenimientos, por vendedor y por financiera |
| Pagar comisiones y registrar pagos de financieras | *Pagos*: por vendedor o por financiera, marcando varias ventas a la vez |

**Ganancia de una venta** = abono cash + lo que pagó la financiera (o el
cobro en cash) − proveedores − comisión − pago al técnico. Si falta el pago
real de la financiera se estima con lo financiado y se marca "≈". La fórmula
está en un solo sitio: `shared/domain.ts` → `saleMoney`.

## Stack

- **Servidor:** Node 20+ sin framework (`node:http`), SQLite con
  `better-sqlite3` (versión 12: la 13 exige Node 22 y la VPS tiene Node 20),
  validación con `zod`. Compilado con esbuild a `dist/server`.
- **App:** React 19 + Vite, CSS propio (estilo iOS "Liquid Glass", siempre en modo claro),
  iconos `lucide-react`. Se instala en el teléfono como app (manifest + iconos).
- **Datos:** un archivo `data/admin.db`. Dinero en centavos enteros.

```
admin/
  shared/domain.ts     modelo, equipos, dinero (servidor y app)
  server/              API, base de datos, acceso, exportación CSV, CLI de usuarios
  app/src/             la app (screens/, ui/, lib/)
  tests/               pruebas de dinero y de la API de punta a punta
  scripts/             dev, build, iconos, deploy
```

## Desarrollo

```bash
cd admin
npm install
DATA_DIR=data PASSWORD=una-clave-de-prueba node --experimental-strip-types server/cli.ts crear demo "Demo"
npm run dev        # API en :3042 + Vite en http://localhost:5173/admin/
npm test           # compila y corre las 32 pruebas
npm run typecheck
```

## Reglas de datos que conviene conocer

- **Montos:** acepta `1500`, `1,500.50` y coma decimal (`2500,50`). `1.500` se
  rechaza por ambiguo. Un monto mal escrito impide guardar.
- **Dirección de instalación:** se guarda una copia; si el cliente se muda, la
  venta conserva dónde se instaló.
- **Cliente anterior:** financiera y comisión entran como ya pagadas (se
  pueden cambiar), para no inflar "Por cobrar".
- **Ediciones simultáneas:** si dos personas editan lo mismo, el segundo
  guardado se rechaza con un aviso en vez de pisar los cambios.
- **Cambios sin guardar:** la app avisa al salir por cualquier vía (atrás,
  pestañas, botón atrás del teléfono, cerrar la pestaña).
- Mover una venta a otro cliente mueve también sus servicios técnicos.

## Seguridad

- Sin registro público: los usuarios se crean con la CLI o desde *Ajustes → Usuarios*.
- Contraseñas con scrypt; la cookie lleva un token aleatorio y la base solo
  guarda su hash. Cookie `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/admin`,
  30 días renovables.
- CSRF: toda escritura exige la cabecera `X-IW-Admin: 1` y el mismo `Origin`.
- Límite de intentos: 6 por usuario desde una misma IP y 20 por IP cada 15
  minutos (un tercero no puede bloquear al dueño fallando a propósito). La IP
  real llega de Cloudflare vía `real_ip_header CF-Connecting-IP` en
  `/etc/nginx/conf.d/cloudflare-ratelimit.conf` del servidor.
- CSP estricta, `frame-ancestors 'none'`, `noindex`. La exportación CSV
  neutraliza fórmulas de Excel.
- Cada cambio queda en la tabla `audit` con el usuario.

## Producción (VPS)

| Pieza | Valor |
|---|---|
| Código | `/opt/apps/infinitywater-admin/` |
| **Datos** | `/opt/apps/infinitywater-admin/data/admin.db` (el deploy nunca lo toca) |
| Respaldos | `data/backups/admin-AAAA-MM-DD.db` diarios (30 días) + `pre-deploy-*.db` (los 10 últimos) |
| Secretos | `/opt/apps/infinitywater-admin/.env` (`GOOGLE_MAPS_API_KEY`) |
| Proceso | pm2 `infinitywater-admin` → `127.0.0.1:3042` |
| nginx | `location ^~ /admin/` en `deploy/infinitywater-common.conf` |

```bash
npm run deploy -- --nginx   # primera vez (sube también el snippet de nginx)
npm run deploy              # siguientes
```

Crear el primer usuario (una sola vez, en el servidor):

```bash
ssh nivusoftware-vps-principal
cd /opt/apps/infinitywater-admin && DATA_DIR=data node dist/server/cli.js crear oscar "Óscar"
# imprime la contraseña generada; cámbiala en Ajustes → Mi cuenta
```

Otros comandos: `cli.js clave <usuario>` (nueva contraseña) y `cli.js lista`.

### Quitar los datos de ejemplo (antes de empezar de verdad)

Producción tiene datos de mentira (27 clientes, 26 ventas, teléfonos 555)
para que el dueño lo pruebe. Cuando autorice empezar:

```bash
ssh nivusoftware-vps-principal
cd /opt/apps/infinitywater-admin && DATA_DIR=data node dist/server/cli.js borrar-datos --confirmar
```

Borra clientes, ventas, servicios, equipo, financieras y proveedores; deja los
usuarios y guarda antes una copia en `data/backups/antes-de-borrar-*.db`.

### Autocompletado de direcciones, ciudades y ZIP

Funciona **sin claves ni Google**, con un índice propio en `data/geo.db`:

- **Direcciones:** padrón oficial de propiedades del Departamento de Hacienda
  de Florida (archivos NAL),
  todo Florida (67 condados): ~9,4 millones de direcciones (~1,3 GB). Se escribe el número y la
  calle ("3940 metro", "1420 8th terrace cape") y se llenan dirección,
  ciudad, estado y ZIP.
- **Ciudades y ZIP de todo EE. UU.:** GeoNames (CC BY 4.0). La ciudad sugiere
  primero Florida; un ZIP completo llena ciudad y estado.

Construir o actualizar el índice (una vez al año, cuando Hacienda publica el
padrón "Final"; todo Florida tarda unos 25 minutos):

```bash
ssh nivusoftware-vps-principal
cd /opt/apps/infinitywater-admin && python3 scripts/build_geo.py            # todo Florida
python3 scripts/build_geo.py Lee Collier Miami-Dade Orange Hillsborough     # otros condados
pm2 reload infinitywater-admin
```

El despliegue lo construye solo la primera vez si no existe.

**Google (opcional):** para direcciones fuera de esos condados. Si hay
`GOOGLE_MAPS_API_KEY` en `/opt/apps/infinitywater-admin/.env` (Places API (New),
clave restringida a la IP 151.245.32.69), se usa cuando el índice no encuentra
nada.

## Reglas de datos que conviene conocer

- **Montos:** acepta `1500`, `1,500.50` y coma decimal (`2500,50`). `1.500` se
  rechaza por ambiguo. Un monto mal escrito impide guardar.
- **Dirección de instalación:** se guarda una copia; si el cliente se muda, la
  venta conserva dónde se instaló.
- **Cliente anterior:** financiera y comisión entran como ya pagadas (se
  pueden cambiar), para no inflar "Por cobrar".
- **Ediciones simultáneas:** si dos personas editan lo mismo, el segundo
  guardado se rechaza con un aviso en vez de pisar los cambios.
- **Cambios sin guardar:** la app avisa al salir por cualquier vía (atrás,
  pestañas, botón atrás del teléfono, cerrar la pestaña).
- Mover una venta a otro cliente mueve también sus servicios técnicos.

## Seguridad

- Sin registro público: los usuarios se crean con la CLI o desde *Ajustes → Usuarios*.
- Contraseñas con scrypt; la cookie lleva un token aleatorio y la base solo
  guarda su hash. Cookie `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/admin`,
  30 días renovables.
- CSRF: toda escritura exige la cabecera `X-IW-Admin: 1` y el mismo `Origin`.
- Límite de intentos: 6 por usuario desde una misma IP y 20 por IP cada 15
  minutos (un tercero no puede bloquear al dueño fallando a propósito). La IP
  real llega de Cloudflare vía `real_ip_header CF-Connecting-IP` en
  `/etc/nginx/conf.d/cloudflare-ratelimit.conf` del servidor.
- CSP estricta, `frame-ancestors 'none'`, `noindex`. La exportación CSV
  neutraliza fórmulas de Excel.
- Cada cambio queda en la tabla `audit` con el usuario.

## Producción (VPS)

| Pieza | Valor |
|---|---|
| Código | `/opt/apps/infinitywater-admin/` |
| **Datos** | `/opt/apps/infinitywater-admin/data/admin.db` (el deploy nunca lo toca) |
| Respaldos | `data/backups/admin-AAAA-MM-DD.db` diarios (30 días) + `pre-deploy-*.db` (los 10 últimos) |
| Secretos | `/opt/apps/infinitywater-admin/.env` (`GOOGLE_MAPS_API_KEY`) |
| Proceso | pm2 `infinitywater-admin` → `127.0.0.1:3042` |
| nginx | `location ^~ /admin/` en `deploy/infinitywater-common.conf` |

```bash
npm run deploy -- --nginx   # primera vez (sube también el snippet de nginx)
npm run deploy              # siguientes
```

Crear el primer usuario (una sola vez, en el servidor):

```bash
ssh nivusoftware-vps-principal
cd /opt/apps/infinitywater-admin && DATA_DIR=data node dist/server/cli.js crear oscar "Óscar"
# imprime la contraseña generada; cámbiala en Ajustes → Mi cuenta
```

Otros comandos: `cli.js clave <usuario>` (nueva contraseña) y `cli.js lista`.

### Quitar los datos de ejemplo (antes de empezar de verdad)

Producción tiene datos de mentira (27 clientes, 26 ventas, teléfonos 555)
para que el dueño lo pruebe. Cuando autorice empezar:

```bash
ssh nivusoftware-vps-principal
cd /opt/apps/infinitywater-admin && DATA_DIR=data node dist/server/cli.js borrar-datos --confirmar
```

Borra clientes, ventas, servicios, equipo, financieras y proveedores; deja los
usuarios y guarda antes una copia en `data/backups/antes-de-borrar-*.db`.

### Autocompletado de direcciones (Google)

Usa Google Places API (New) desde el servidor (la clave nunca llega al
navegador). Sin clave, los campos de dirección funcionan como texto normal.

1. En Google Cloud: crear proyecto, activar facturación (el uso de un negocio
   familiar queda dentro de la cuota gratuita mensual) y habilitar
   **Places API (New)**.
2. Crear una clave de API y restringirla: *Aplicación* → direcciones IP →
   `151.245.32.69`; *API* → solo Places API (New).
3. En el servidor:
   ```bash
   echo 'GOOGLE_MAPS_API_KEY=la-clave' > /opt/apps/infinitywater-admin/.env
   chmod 600 /opt/apps/infinitywater-admin/.env && pm2 reload infinitywater-admin
   ```
   El despliegue nunca toca `.env`.

Las sugerencias priorizan Lee y Collier pero cubren todo EE. UU.; al elegir una
se llenan dirección, ciudad, estado y ZIP.

**Importante:** el snippet de nginx lo comparten el sitio y el panel. Si se
edita, hacerlo en `deploy/infinitywater-common.conf` y subirlo con
`--nginx` (de aquí o del deploy del sitio); nunca editarlo solo en el servidor.

## Pendiente / ideas

- Roles (p. ej. técnicos que no vean dinero). Hoy todos los usuarios ven todo.
- Copia de los respaldos fuera de la VPS (p. ej. a R2 o Google Drive).
- Conectar el formulario del sitio para que cada solicitud entre como cliente
  (base del CRM propio).
