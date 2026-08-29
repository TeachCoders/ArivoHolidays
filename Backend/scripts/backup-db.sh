#!/usr/bin/env bash
# DB backup — pg_dump based. Run:  Backend/scripts/backup-db.sh
# Backups land in:  Backend/backups/backup-<timestamp>.sql
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$BACKEND_DIR/.env"
BACKUP_DIR="$BACKEND_DIR/backups"
KEEP_LAST=14

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2-)"
if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL not found — check $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# DATABASE_URL = postgresql://user:pass@host:port/dbname
URL="${DATABASE_URL#postgresql://}"
URL="${URL#postgres://}"
PGUSER="${URL%%:*}"
REST="${URL#*:}"
PGPASSWORD="${REST%%@*}"
REST="${REST#*@}"
PGHOST="${REST%%:*}"
REST="${REST#*:}"
PGPORT="${REST%%/*}"
PGDATABASE="${REST#*/}"

if [[ -z "${PGPASSWORD:-}" ]]; then
  PGPASSWORD=""
fi

OUT="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"

PGPASSWORD="$PGPASSWORD" pg_dump \
  --host="$PGHOST" \
  --port="$PGPORT" \
  --username="$PGUSER" \
  --dbname="$PGDATABASE" \
  --format=plain \
  --no-owner \
  --file="$OUT"

echo "Backup OK: $OUT ($(du -h "$OUT" | cut -f1))"

# prune old backups
ls -1t "$BACKUP_DIR"/backup-*.sql 2>/dev/null | tail -n +$((KEEP_LAST + 1)) | while read -r old; do
  echo "Pruning: $old"
  rm -f "$old"
done
