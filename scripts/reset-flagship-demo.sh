#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if [[ "${VIREO_DEMO_RESET_CONFIRM:-}" != "reset-vireo-demo" ]]; then
  printf 'Refusing to destroy demo data. Set VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo for the dedicated demo deployment.\n' >&2
  exit 2
fi

deployment_project="${VIREO_DEMO_COMPOSE_PROJECT:-vireo-flagship-demo}"
if [[ ! "$deployment_project" =~ ^[a-z0-9][a-z0-9_-]{2,62}$ ]]; then
  printf 'VIREO_DEMO_COMPOSE_PROJECT must be a scoped Compose project name.\n' >&2
  exit 2
fi

export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?Set the dedicated demo database password}"
export SESSION_COOKIE_SECURE="${SESSION_COOKIE_SECURE:-true}"

if docker compose version >/dev/null 2>&1; then
  compose_command=(docker compose)
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
  compose_command=(docker-compose)
else
  printf 'Docker Compose is required to reset the flagship demo.\n' >&2
  exit 1
fi

compose_files=(-f compose.yaml -f compose.demo.yaml --project-name "$deployment_project")
"${compose_command[@]}" "${compose_files[@]}" down --volumes --remove-orphans
"${compose_command[@]}" "${compose_files[@]}" up --build --detach --wait

printf 'Flagship demo reset complete for Compose project %s.\n' "$deployment_project"
