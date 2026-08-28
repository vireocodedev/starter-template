#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repository_root"

environment_file="${VIREO_DEMO_ENV_FILE:-.env}"
deployment_project="${VIREO_DEMO_COMPOSE_PROJECT:-vireo-flagship-demo}"

if [[ ! -f "$environment_file" ]]; then
  printf 'Missing %s. Copy deploy/hetzner/vireo-flagship-demo.env.example and set a dedicated database secret.\n' "$environment_file" >&2
  exit 2
fi
if [[ -n "$(find "$environment_file" -prune -perm /077 -print)" ]]; then
  printf '%s must not be readable or writable by group or other users. Run chmod 600 %s.\n' "$environment_file" "$environment_file" >&2
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

frontend_port="$(sed -n 's/^FRONTEND_PORT=//p' "$environment_file" | tail -n 1)"
frontend_port="${frontend_port:-3000}"
if [[ "$frontend_port" != "3000" ]]; then
  printf 'The audited Caddy integration requires FRONTEND_PORT=3000.\n' >&2
  exit 2
fi
curl --fail --silent --show-error "http://127.0.0.1:${frontend_port}/healthz" >/dev/null
curl --fail --silent --show-error \
  "http://127.0.0.1:${frontend_port}/actuator/health/readiness" | grep --quiet '"status":"UP"'

printf 'Vireo flagship demo is healthy on loopback port %s.\n' "$frontend_port"
