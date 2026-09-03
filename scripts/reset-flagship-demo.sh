#!/usr/bin/env bash
set -euo pipefail
[[ "${VIREO_DEMO_RESET_CONFIRM:-}" == reset-vireo-demo ]] || { printf 'Refusing destructive demo reset without VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo.\n' >&2; exit 2; }
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ "${VIREO_FLAGSHIP_PRODUCTION_RESET:-}" == true ]]; then
  exec /usr/local/libexec/vireo-flagship-demo/flagship-host-deploy.sh reset
fi
# Local rehearsal remains scoped and intentionally mutable. It never uses the
# production SSH/controller path or claims immutable deployment recovery.
project="${VIREO_DEMO_COMPOSE_PROJECT:-vireo-flagship-demo-local}"
[[ "$project" =~ ^vireo-flagship-demo(-local)?$ ]] || { printf 'Local reset requires a scoped flagship Compose project.\n' >&2; exit 2; }
env_file="${VIREO_DEMO_ENV_FILE:-.env}"
cd "$root"
compose_env=()
[[ -f "$env_file" ]] && compose_env=(--env-file "$env_file")
docker compose "${compose_env[@]}" -f compose.yaml -f compose.demo.yaml --project-name "$project" down --volumes --remove-orphans
docker compose "${compose_env[@]}" -f compose.yaml -f compose.demo.yaml --project-name "$project" up --build --detach --wait
