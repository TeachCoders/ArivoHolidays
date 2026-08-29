#!/usr/bin/env bash
# DB restore. Usage:  Backend/scripts/restore-db.sh <backup.sql>
# WARNING: Overwrites the current database. Run only when you intend to restore.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup.sql>" >&2
  echo "Example: $0 Backend/backups/backup-20260815-120000.sql" >&2
  exit 1
fi

BACKUP_FILE="$1"
if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$BACKEND_DIR/.env"

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2-)"
if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL not found — check $ENV_FILE" >&2
  exit 1
fi

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

echo "Restoring '$BACKUP_FILE' into '$PGDATABASE' at $PGHOST:$PGPORT"
echo "This DROPS the current data. Type 'yes' to continue:"
read -r CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

PGPASSWORD="$PGPASSWORD" psql \
  --host="$PGHOST" \
  --port="$PGPORT" \
  --username="$PGUSER" \
  --dbname="$PGDATABASE" \
  --set=ON_ERROR_STOP=1 \
  -f "$BACKUP_FILE"

echo "Restore complete."
