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
  "frontend-contract|Frontend contract|${frontend_verify_command}"
  "browser-smoke|Browser smoke tests|cd frontend && corepack npm run test:e2e"
  "jvm-build|JVM build|./gradlew build"
  "container-context|Container context contract|node scripts/container-context-policy.mjs"
)

total=${#steps[@]}
started_at=$(date +%s%3N)
timing_arguments=()

for index in "${!steps[@]}"; do
  IFS='|' read -r step_id label command <<<"${steps[$index]}"
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
  step_duration=$((step_finished_at - step_started_at))
  timing_arguments+=("${step_id}=${step_duration}")
  printf 'PASS: %s (%d ms)\n\n' "$label" "$step_duration"
  rm -f "$output_file"
done

finished_at=$(date +%s%3N)
total_duration=$((finished_at - started_at))
printf 'Template verification passed: %d/%d steps (%d ms total).\n' \
  "$total" "$total" "$total_duration"

node scripts/verification-budget-policy.mjs "${timing_arguments[@]}" "total=${total_duration}"
