#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

source "$repository_root/scripts/compose-database-contract.sh"

backup_path="${1:-}"
target_database="${2:-}"

if [[ -z "$backup_path" || -z "$target_database" ]]; then
  printf 'Usage: %s BACKUP_FILE NEW_DATABASE_NAME\n' "$0" >&2
  exit 1
fi

if [[ ! -f "$backup_path" || ! -s "$backup_path" ]]; then
  printf 'Backup is missing or empty: %s\n' "$backup_path" >&2
  exit 1
fi

if [[ ! "$target_database" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  printf 'The target database must be a simple PostgreSQL identifier.\n' >&2
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

select_compose_database_environment
if [[ -n "$VIREO_DATABASE_ENV_FILE_RESOLVED" ]]; then
  compose_command+=(--env-file "$VIREO_DATABASE_ENV_FILE_RESOLVED")
fi
if [[ -n "${VIREO_DATABASE_COMPOSE_PROJECT:-${VIREO_DEMO_COMPOSE_PROJECT:-}}" ]]; then
  compose_command+=(--project-name "${VIREO_DATABASE_COMPOSE_PROJECT:-${VIREO_DEMO_COMPOSE_PROJECT}}")
fi

resolve_compose_database_contract
source_database="$VIREO_DATABASE_NAME"
database_user="$VIREO_DATABASE_OWNER_USER"

if [[ "$target_database" == "$source_database" || "$target_database" == "postgres" || "$target_database" == "template0" || "$target_database" == "template1" ]]; then
  printf 'Refusing to restore over a source or system database: %s\n' "$target_database" >&2
  exit 1
fi

if "${compose_command[@]}" exec --no-TTY postgres \
  psql --username "$database_user" --dbname postgres --tuples-only --no-align \
  --command "SELECT 1 FROM pg_database WHERE datname = '$target_database'" | grep --quiet '^1$'; then
  printf 'Refusing to overwrite existing database: %s\n' "$target_database" >&2
  exit 1
fi

created=false
cleanup() {
  if [[ "$created" == true ]]; then
    "${compose_command[@]}" exec --no-TTY postgres \
      dropdb --username "$database_user" --if-exists "$target_database" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

"${compose_command[@]}" exec --no-TTY postgres \
  createdb --username "$database_user" "$target_database"
created=true

"${compose_command[@]}" exec --no-TTY postgres \
  pg_restore --username "$database_user" --dbname "$target_database" \
  --exit-on-error --single-transaction --no-owner --no-privileges <"$backup_path"

created=false
trap - EXIT
printf 'Restored into new database: %s\n' "$target_database"
