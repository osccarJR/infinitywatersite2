#!/usr/bin/env bash
#
# Despliegue a la VPS (s1.nivusoftware.com, servidor compartido con ~100
# sitios: nunca recargar nginx sin `nginx -t` antes).
#
#   npm run deploy            # compila, prueba y publica
#   npm run deploy -- --nginx # ademas sube deploy/infinitywater-common.conf
#
# Requiere el alias SSH `nivusoftware-vps-principal` en ~/.ssh/config.
#
# Pasos:
#  1. build limpio + prueba de humo (si falla, no se publica nada)
#  2. sube dist/ a dist-new/ en el servidor (produccion intacta)
#  3. cambio atomico: dist -> dist-prev, dist-new -> dist
#  4. comprueba en produccion las URL de A2P y la 404
#
# Volver atras: ssh al servidor y
#   cd /var/www/static/infinitywater && mv dist dist-bad && mv dist-prev dist
#
# Ojo: Cloudflare cachea los estaticos (imagenes, favicon) hasta 30 dias.
# Los de /_astro/ llevan hash y no dan problema; si cambias un archivo de
# public/ con el mismo nombre, purga la cache en Cloudflare.

set -euo pipefail

HOST="nivusoftware-vps-principal"
BASE="/var/www/static/infinitywater"
SITE="https://www.infinitywatersite.com"

cd "$(dirname "$0")/.."

echo "> build"
rm -rf dist
npx astro build >/dev/null
node scripts/smoke.mjs | grep -E "Todo correcto|fallidas"

echo "> subiendo a $BASE/dist-new"
ssh "$HOST" "rm -rf $BASE/dist-new && mkdir -p $BASE/dist-new"
rsync -az --delete dist/ "$HOST:$BASE/dist-new/"
ssh "$HOST" "chown -R www-data:www-data $BASE/dist-new"

if [[ "${1:-}" == "--nginx" ]]; then
  echo "> nginx: subiendo snippet (copia en /root/nginx-backups)"
  ssh "$HOST" "mkdir -p /root/nginx-backups && cp -a /etc/nginx/snippets/infinitywater-common.conf /root/nginx-backups/infinitywater-common.conf.\$(date +%Y%m%d%H%M%S)"
  scp -q deploy/infinitywater-common.conf "$HOST:/etc/nginx/snippets/infinitywater-common.conf"
  ssh "$HOST" "nginx -t"
fi

echo "> cambio atomico"
ssh "$HOST" "cd $BASE && rm -rf dist-prev && mv dist dist-prev && mv dist-new dist && nginx -t 2>/dev/null && systemctl reload nginx"

echo "> verificando produccion"
fail=0
for path in / /es /privacy-policy /terms-and-conditions /sms-policy /free-water-test /contact; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$path")
  printf '  %-24s %s\n' "$path" "$code"
  [[ "$code" == "200" ]] || fail=1
done
code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE/ruta-que-no-existe")
printf '  %-24s %s\n' "/ruta-que-no-existe" "$code"
[[ "$code" == "404" ]] || fail=1

if [[ $fail -ne 0 ]]; then
  echo "!! algo no responde como debe. Para volver atras:"
  echo "   ssh $HOST 'cd $BASE && mv dist dist-bad && mv dist-prev dist'"
  exit 1
fi
echo "> listo"
