#!/usr/bin/env bash

set -uo pipefail

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
  "verification-pipeline|Verification pipeline contract|node scripts/verification-pipeline-policy.mjs"
  "public-contract|Public contract policy|node scripts/public-contract-policy.mjs"
  "flagship-demo|Flagship demo contract|node scripts/flagship-demo-policy.mjs"
  "flagship-proof|Flagship proof material|node scripts/flagship-proof-policy.mjs"
  "frontend-contract|Frontend contract|${frontend_verify_command}"
  "browser-smoke|Browser smoke tests|cd frontend && corepack npm run test:e2e"
  "jvm-build|JVM build|./gradlew build"
  "container-context|Container context contract|node scripts/container-context-policy.mjs"
)

total=${#steps[@]}
started_at=$(date +%s%3N)
timing_arguments=()
resource_arguments=()

if [[ ! -x /usr/bin/time ]] || ! /usr/bin/time --version 2>&1 | grep -q "GNU Time"; then
  printf 'GNU time is required to record comparable peak-RSS evidence.\n' >&2
  exit 1
fi

for index in "${!steps[@]}"; do
  IFS='|' read -r step_id label command <<<"${steps[$index]}"
  step_number=$((index + 1))
  output_file=$(mktemp)
  resource_file=$(mktemp)
  step_started_at=$(date +%s%3N)

  printf '[%d/%d] %s...\n' "$step_number" "$total" "$label"

  if $silent; then
    /usr/bin/time --quiet --format=%M --output="$resource_file" bash -lc "$command" >"$output_file" 2>&1
    step_exit_code=$?
  else
    /usr/bin/time --quiet --format=%M --output="$resource_file" bash -lc "$command" 2>&1 | tee "$output_file"
    step_exit_code=${PIPESTATUS[0]}
  fi

  if [[ "$step_exit_code" -ne 0 ]]; then
    printf 'FAILED: %s\n\n' "$label" >&2
    if $silent; then cat "$output_file" >&2; fi
    rm -f "$output_file" "$resource_file"
    exit "$step_exit_code"
  fi

  step_finished_at=$(date +%s%3N)
  step_duration=$((step_finished_at - step_started_at))
  step_peak_rss=$(tr -d '[:space:]' <"$resource_file")
  if [[ ! "$step_peak_rss" =~ ^[0-9]+$ ]]; then
    printf 'FAILED: %s produced invalid peak RSS %s\n' "$label" "$step_peak_rss" >&2
    rm -f "$output_file" "$resource_file"
    exit 1
  fi
  timing_arguments+=("duration.${step_id}=${step_duration}")
  resource_arguments+=("rss.${step_id}=${step_peak_rss}")
  printf 'PASS: %s (%d ms, %d KiB peak RSS)\n\n' "$label" "$step_duration" "$step_peak_rss"
  rm -f "$output_file" "$resource_file"
done

finished_at=$(date +%s%3N)
total_duration=$((finished_at - started_at))
printf 'Template verification passed: %d/%d steps (%d ms total).\n' \
  "$total" "$total" "$total_duration"

node scripts/verification-budget-policy.mjs \
  "${timing_arguments[@]}" \
  "${resource_arguments[@]}" \
  "duration.total=${total_duration}"
