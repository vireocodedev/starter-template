#!/usr/bin/env bash

set -u

silent=false
for argument in "$@"; do
  if [[ "$argument" == "silent" || "$argument" == "--silent" ]]; then
    silent=true
  fi
done

frontend_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$frontend_root"

if [[ -f "../../starter/packages/ui/dist/index.d.ts" ]]; then
  starter_mode="local-starter"
  application_build_command="npm run build:local-starter"
else
  starter_mode="published"
  application_build_command="npm run build"
fi

steps=(
  "Architecture|npm run architecture:check"
  "Formatting|npm run format:check"
  "Lint|npm run lint"
  "Unit and integration tests|npm run test"
  "Storybook tests|npm run test:storybook"
  "Application build|${application_build_command}"
  "Storybook build|npm run build-storybook"
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
printf 'Verification passed: %d/%d steps (%d ms total, Starter mode: %s).\n' "$total" "$total" "$((finished_at - started_at))" "$starter_mode"
