#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

deployment_project="vireo-template-smoke-${GITHUB_RUN_ID:-local}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-deployment-smoke-only}"
export SESSION_COOKIE_SECURE=false

if docker compose version >/dev/null 2>&1; then
  compose_command=(docker compose)
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
  compose_command=(docker-compose)
else
  printf 'Docker Compose is required for the deployment smoke.\n' >&2
  exit 1
fi

cleanup() {
  "${compose_command[@]}" --project-name "$deployment_project" down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

"${compose_command[@]}" --project-name "$deployment_project" up --build --detach --wait

index_document="$(curl --fail --silent --show-error http://127.0.0.1:3000/)"
if [[ "$index_document" != *'<div id="root"></div>'* ]]; then
  printf 'Frontend deployment did not return the application shell.\n' >&2
  exit 1
fi

response_headers="$(curl --fail --silent --show-error --head http://127.0.0.1:3000/)"
for expected_header in \
  "content-security-policy: default-src 'self'" \
  "cross-origin-opener-policy: same-origin" \
  "permissions-policy: camera=(), geolocation=(), microphone=()" \
  "referrer-policy: strict-origin-when-cross-origin" \
  "x-content-type-options: nosniff" \
  "x-frame-options: DENY"; do
  if ! grep --ignore-case --fixed-strings --quiet "$expected_header" <<<"$response_headers"; then
    printf 'Frontend deployment is missing security header: %s\n' "$expected_header" >&2
    exit 1
  fi
done

api_status="$(curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:3000/api/auth/me)"
if [[ "$api_status" != "401" ]]; then
  printf 'Frontend API proxy returned HTTP %s; expected the backend authentication boundary (401).\n' "$api_status" >&2
  exit 1
fi

"${compose_command[@]}" --project-name "$deployment_project" exec --no-TTY frontend \
  wget --quiet --output-document=- http://app:8080/actuator/health/readiness | grep --quiet '"status":"UP"'

printf 'Production-like deployment smoke passed: static PWA, security headers, API proxy, backend readiness, and PostgreSQL health.\n'
