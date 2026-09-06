#!/usr/bin/env bash
# deploy-app.sh  ── HAR deploy/badlao ke baad (VPS par, root). Idempotent.
#
# Notebook command:
#   bash /opt/arivo/app/deploy/deploy-app.sh
set -euo pipefail

APP_DIR="/opt/arivo/app"
OWNER_EMAIL="${OWNER_EMAIL:-}"     # certbot ke liye (optional)
DOMAIN="${DOMAIN:-arivoholidays.com}"
API_DOMAIN="${API_DOMAIN:-api.arivoholidays.com}"

log() { echo -e "\n\033[1;32m>> $*\033[0m"; }

if [ "$(id -u)" -ne 0 ]; then echo "ERROR: root se chalao"; exit 1; fi

log "1/5 Pull latest code"
git -C "$APP_DIR" pull

log "2/5 Backend: env check + database migrate"
cd "$APP_DIR/Backend"
set -a; source ./.env; set +a
: "${DATABASE_URL:?ERROR: Backend/.env me DATABASE_URL set karo}"
: "${SESSION_SECRET:?ERROR: Backend/.env me SESSION_SECRET set karo}"
npx prisma migrate deploy
npx prisma generate
pm2 delete arivo-backend >/dev/null 2>&1 || true

log "3/5 Frontend: production build"
cd "$APP_DIR/frontend"
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

log "4/5 PM2 start (backend :5000, frontend :3000)"
cd "$APP_DIR"
pm2 delete arivo-frontend >/dev/null 2>&1 || true
pm2 start "$APP_DIR/deploy/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

log "5/5 Nginx + SSL"
if [ ! -f "/etc/nginx/sites-available/arivoholidays" ]; then
  cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/arivoholidays
  ln -sf /etc/nginx/sites-available/arivoholidays /etc/nginx/sites-enabled/arivoholidays
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi
sleep 2 && pm2 restart all >/dev/null 2>&1 || true

if [ -z "$OWNER_EMAIL" ]; then
  echo
  echo " NOTE: SSL ke liye ek baar chalao (domain DNS point hone ke baad):"
  echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN --redirect --agree-tos -m aap@email.com"
else
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" \
    --redirect --non-interactive --agree-tos -m "$OWNER_EMAIL" || \
    echo "   CERTBOT try hua par fail (shayad DNS point nahi hua). Baad me dobara chalana."
fi

echo
echo "==============================================================="
echo " DONE."
echo "   Backend logs : pm2 logs arivo-backend"
echo "   Health check : curl https://$API_DOMAIN/health"
echo "==============================================================="