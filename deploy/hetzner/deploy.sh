#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"
source "$repository_root/scripts/compose-database-contract.sh"

environment_file="${VIREO_DEMO_ENV_FILE:-.env}"
deployment_project="${VIREO_DEMO_COMPOSE_PROJECT:-vireo-flagship-demo}"

if [[ ! -f "$environment_file" ]]; then
  printf 'Missing %s. Copy deploy/hetzner/vireo-flagship-demo.env.example and set distinct owner and runtime database secrets.\n' "$environment_file" >&2
  exit 2
fi
if [[ -n "$(find "$environment_file" -prune -perm /077 -print)" ]]; then
  printf '%s must not be readable or writable by group or other users. Run chmod 600 %s.\n' "$environment_file" "$environment_file" >&2
  exit 2
fi

for variable in \
  POSTGRES_DB \
  POSTGRES_OWNER_USER \
  POSTGRES_OWNER_PASSWORD \
  POSTGRES_RUNTIME_USER \
  POSTGRES_RUNTIME_PASSWORD \
  SESSION_COOKIE_SECURE \
  FRONTEND_PORT; do
  if [[ -v "$variable" ]]; then
    printf 'Unset inherited %s so the deployment environment file remains authoritative.\n' "$variable" >&2
    exit 2
  fi
done

read_compose_environment_file "$environment_file"
for variable in \
  POSTGRES_DB \
  POSTGRES_OWNER_USER \
  POSTGRES_OWNER_PASSWORD \
  POSTGRES_RUNTIME_USER \
  POSTGRES_RUNTIME_PASSWORD \
  SESSION_COOKIE_SECURE \
  FRONTEND_PORT; do
  validate_compose_environment_literal "$variable" || exit 2
done

require_deployment_value() {
  local variable="$1"
  local value="$2"
  local normalized_value

  normalized_value="${value,,}"
  if [[ -z "$value" || "$normalized_value" == *"replace-with"* || "$normalized_value" == *"change-me"* || "$normalized_value" == *"placeholder"* || "$normalized_value" == *"example"* || "$normalized_value" == *"todo"* ]]; then
    printf '%s must be set to a non-placeholder value before deployment.\n' "$variable" >&2
    exit 2
  fi
}

require_deployment_value POSTGRES_DB "$(compose_environment_value POSTGRES_DB)"
require_deployment_value POSTGRES_OWNER_USER "$(compose_environment_value POSTGRES_OWNER_USER)"
require_deployment_value POSTGRES_OWNER_PASSWORD "$(compose_environment_value POSTGRES_OWNER_PASSWORD)"
require_deployment_value POSTGRES_RUNTIME_USER "$(compose_environment_value POSTGRES_RUNTIME_USER)"
require_deployment_value POSTGRES_RUNTIME_PASSWORD "$(compose_environment_value POSTGRES_RUNTIME_PASSWORD)"

database_name="$(compose_environment_value POSTGRES_DB)"
owner_user="$(compose_environment_value POSTGRES_OWNER_USER)"
owner_password="$(compose_environment_value POSTGRES_OWNER_PASSWORD)"
runtime_user="$(compose_environment_value POSTGRES_RUNTIME_USER)"
runtime_password="$(compose_environment_value POSTGRES_RUNTIME_PASSWORD)"
session_cookie_secure="$(compose_environment_value SESSION_COOKIE_SECURE)"
frontend_port="$(compose_environment_value FRONTEND_PORT)"
frontend_port="${frontend_port:-3000}"

if [[ -v "VIREO_COMPOSE_ENV[POSTGRES_USER]" || -v "VIREO_COMPOSE_ENV[POSTGRES_PASSWORD]" ]]; then
  printf 'Legacy POSTGRES_USER/POSTGRES_PASSWORD is not supported; define distinct owner and runtime database identities.\n' >&2
  exit 2
fi
if [[ ! "$database_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  printf 'POSTGRES_DB must be a simple PostgreSQL identifier.\n' >&2
  exit 2
fi
if [[ ! "$owner_user" =~ ^[A-Za-z_][A-Za-z0-9_]*$ || ! "$runtime_user" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  printf 'Database owner and runtime users must be simple PostgreSQL identifiers.\n' >&2
  exit 2
fi
if [[ "${owner_user,,}" == "${runtime_user,,}" ]]; then
  printf 'POSTGRES_OWNER_USER and POSTGRES_RUNTIME_USER must differ.\n' >&2
  exit 2
fi
if [[ "$owner_password" == "$runtime_password" ]]; then
  printf 'POSTGRES_OWNER_PASSWORD and POSTGRES_RUNTIME_PASSWORD must differ.\n' >&2
  exit 2
fi
if [[ "$session_cookie_secure" != "true" ]]; then
  printf 'SESSION_COOKIE_SECURE must be true for deployment.\n' >&2
  exit 2
fi
if [[ "$frontend_port" != "3000" ]]; then
  printf 'The audited Caddy integration requires FRONTEND_PORT=3000.\n' >&2
  exit 2
fi
if [[ ! -f build/libs/app.jar || ! -f frontend/dist/index.html ]]; then
  printf 'Production artifacts are missing. Build build/libs/app.jar and frontend/dist before deployment.\n' >&2
  exit 2
fi
if [[ ! "$deployment_project" =~ ^[a-z0-9][a-z0-9_-]{2,62}$ ]]; then
  printf 'VIREO_DEMO_COMPOSE_PROJECT must be a scoped Compose project name.\n' >&2
  exit 2
fi

docker compose --env-file "$environment_file" \
  -f compose.yaml -f compose.demo.yaml \
  --project-name "$deployment_project" \
  up --build --detach --wait

curl --fail --silent --show-error "http://127.0.0.1:${frontend_port}/healthz" >/dev/null
curl --fail --silent --show-error \
  "http://127.0.0.1:${frontend_port}/actuator/health/readiness" | grep --quiet '"status":"UP"'

printf 'Vireo flagship demo is healthy on loopback port %s.\n' "$frontend_port"
