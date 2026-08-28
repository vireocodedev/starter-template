#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

database_name="${POSTGRES_DB:-starter_template}"
database_user="${POSTGRES_USER:-starter_template}"
backup_path="${1:-backups/${database_name}-$(date -u +%Y%m%dT%H%M%SZ).dump}"

if [[ ! "$database_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  printf 'POSTGRES_DB must be a simple PostgreSQL identifier.\n' >&2
  exit 1
fi

if [[ -e "$backup_path" ]]; then
  printf 'Refusing to overwrite existing backup: %s\n' "$backup_path" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  compose_command=(docker compose)
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
  compose_command=(docker-compose)
else
  printf 'Docker Compose is required.\n' >&2
  exit 1
fi

mkdir -p "$(dirname "$backup_path")"
umask 077

partial_path="${backup_path}.partial"
cleanup() {
  if [[ -f "$partial_path" ]]; then
    rm -- "$partial_path"
  fi
}
trap cleanup EXIT

"${compose_command[@]}" exec --no-TTY postgres \
  pg_dump --username "$database_user" --dbname "$database_name" \
  --format custom --compress 9 --no-owner --no-privileges >"$partial_path"

if [[ ! -s "$partial_path" ]]; then
  printf 'Backup command produced an empty file.\n' >&2
  exit 1
fi

mv "$partial_path" "$backup_path"
trap - EXIT
printf 'Created logical backup: %s\n' "$backup_path"

