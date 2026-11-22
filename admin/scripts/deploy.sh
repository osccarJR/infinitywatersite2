#!/usr/bin/env bash
#
# Despliega el panel /admin a la VPS (servidor compartido: nunca recargar
# nginx sin `nginx -t`).
#
#   npm run deploy            # compila, prueba, sube y reinicia el servicio
#   npm run deploy -- --nginx # ademas sube el snippet de nginx del sitio
#
# En el servidor:
#   /opt/apps/infinitywater-admin/        codigo compilado (dist/) + node_modules
#   /opt/apps/infinitywater-admin/data/   BASE DE DATOS y respaldos diarios (nunca se toca)
#   pm2: infinitywater-admin  ->  127.0.0.1:3042
#
# La base de datos vive en data/ y el rsync la excluye: desplegar nunca borra datos.
# Los secretos (GOOGLE_MAPS_API_KEY) van en $DIR/.env, que tampoco se toca.

set -euo pipefail

HOST="nivusoftware-vps-principal"
DIR="/opt/apps/infinitywater-admin"
PORT=3042
NAME="infinitywater-admin"
SITE="https://www.infinitywatersite.com"

cd "$(dirname "$0")/.."

echo "> compilando y probando"
npm run build >/dev/null
node --test tests/domain.test.ts tests/api.test.mjs 2>&1 | grep -E "^ℹ (pass|fail)"
node --test tests/domain.test.ts tests/api.test.mjs >/dev/null 2>&1 || { echo "!! las pruebas fallan: no se publica"; exit 1; }

echo "> copia de seguridad de la base antes de actualizar"
ssh "$HOST" "if [ -f $DIR/data/admin.db ]; then mkdir -p $DIR/data/backups && sqlite3 $DIR/data/admin.db \".backup '$DIR/data/backups/pre-deploy-\$(date +%Y%m%d%H%M%S).db'\"; fi"

echo "> subiendo a $DIR"
ssh "$HOST" "mkdir -p $DIR/data && chmod 700 $DIR/data"
rsync -az --no-owner --no-group --delete --exclude data --exclude node_modules --exclude .env dist package.json package-lock.json "$HOST:$DIR/"
ssh "$HOST" "mkdir -p $DIR/scripts"
rsync -az --no-owner --no-group scripts/build_geo.py "$HOST:$DIR/scripts/"
# Dependencias en una carpeta aparte; solo se cambian si la instalacion salio bien
# (si npm falla, el servicio sigue con las anteriores).
ssh "$HOST" "cd $DIR && rm -rf .deps && mkdir .deps && cp package.json package-lock.json .deps/ \
  && (cd .deps && npm ci --omit=dev --no-audit --no-fund >/dev/null) \
  && rm -rf node_modules.old && { [ ! -d node_modules ] || mv node_modules node_modules.old; } \
  && mv .deps/node_modules node_modules && rm -rf .deps node_modules.old"

echo "> reiniciando el servicio"
ssh "$HOST" "cd $DIR && if pm2 describe $NAME >/dev/null 2>&1; then pm2 reload $NAME --update-env >/dev/null; else PORT=$PORT HOST=127.0.0.1 NODE_ENV=production DATA_DIR=$DIR/data pm2 start dist/server/index.js --name $NAME --cwd $DIR --max-memory-restart 400M >/dev/null; fi && pm2 save >/dev/null"

if [[ "${1:-}" == "--nginx" ]]; then
  echo "> nginx: subiendo snippet (copia en /root/nginx-backups)"
  ssh "$HOST" "mkdir -p /root/nginx-backups && cp -a /etc/nginx/snippets/infinitywater-common.conf /root/nginx-backups/infinitywater-common.conf.\$(date +%Y%m%d%H%M%S)"
  scp -q ../deploy/infinitywater-common.conf "$HOST:/etc/nginx/snippets/infinitywater-common.conf"
  ssh "$HOST" "nginx -t 2>&1 | tail -1 && systemctl reload nginx"
fi

# Indice de direcciones: se construye la primera vez (luego, una vez al ano).
ssh "$HOST" "cd $DIR && if [ ! -f data/geo.db ] && [ ! -f data/geo.db.building ]; then nohup python3 scripts/build_geo.py > data/geo-build.log 2>&1 & echo '> construyendo el indice de direcciones en segundo plano (unos minutos)'; fi"

echo "> verificando"
sleep 1
ssh "$HOST" "curl -sf http://127.0.0.1:$PORT/healthz >/dev/null" && echo "  servicio local      ok"
for path in /admin /admin/ventas /admin/api/auth/me; do
  printf '  %-22s %s\n' "$path" "$(curl -s -o /dev/null -w '%{http_code}' "$SITE$path")"
done
echo "> listo: $SITE/admin"
