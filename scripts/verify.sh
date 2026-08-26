#!/usr/bin/env bash

set -u

silent=false
if [[ "${1:-}" == "silent" || "${1:-}" == "--silent" ]]; then
  silent=true
fi

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

frontend_verify_command="cd frontend && corepack npm run verify"
if $silent; then
  frontend_verify_command+=" -- silent"
fi

steps=(
  "Frontend contract|${frontend_verify_command}"
  "Browser smoke tests|cd frontend && corepack npm run test:e2e"
  "JVM build|./gradlew build"
)

total=${#steps[@]}
started_at=$(date +%s%3N)

for index in "${!steps[@]}"; do
  label=${steps[$index]%%|*}
  command=${steps[$index]#*|}
  step_number=$((index + 1))
  output_file=$(mktemp)
  step_started_at=$(date +%s%3N)

  printf '[%d/%d] %s...\n' "$step_number" "$total" "$label"

  if $silent; then
    if ! bash -lc "$command" >"$output_file" 2>&1; then
      printf 'FAILED: %s\n\n' "$label" >&2
      cat "$output_file" >&2
      rm -f "$output_file"
      exit 1
    fi
  else
    if ! bash -lc "$command" 2>&1 | tee "$output_file"; then
      printf 'FAILED: %s\n' "$label" >&2
      rm -f "$output_file"
      exit 1
    fi
  fi

  step_finished_at=$(date +%s%3N)
  printf 'PASS: %s (%d ms)\n\n' "$label" "$((step_finished_at - step_started_at))"
  rm -f "$output_file"
done

finished_at=$(date +%s%3N)
printf 'Template verification passed: %d/%d steps (%d ms total).\n' \
  "$total" "$total" "$((finished_at - started_at))"
