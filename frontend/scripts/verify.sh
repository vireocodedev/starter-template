#!/usr/bin/env bash

set -u

silent=false
starter_mode="published"
for argument in "$@"; do
  if [[ "$argument" == "silent" || "$argument" == "--silent" ]]; then
    silent=true
  elif [[ "$argument" == "local-starter" || "$argument" == "--local-starter" ]]; then
    starter_mode="local-starter"
  fi
done

frontend_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$frontend_root"

if [[ "$starter_mode" == "local-starter" ]]; then
  npm run starter:mode:local >/dev/null
  test_command="npm run test:local-starter"
  storybook_test_command="npm run test:storybook:local-starter"
  application_build_command="npm run build:local-starter"
  storybook_build_command="npm run build-storybook:local-starter"
else
  npm run starter:mode:published >/dev/null
  test_command="npm run test"
  storybook_test_command="npm run test:storybook"
  application_build_command="npm run build"
  storybook_build_command="npm run build-storybook"
fi

steps=(
  "Published Starter boundary|npm run starter:boundary:check"
  "Architecture|npm run architecture:check"
  "Formatting|npm run format:check"
  "Lint|npm run lint"
  "Unit and integration tests|${test_command}"
  "Storybook tests|${storybook_test_command}"
  "Application build|${application_build_command}"
  "Storybook build|${storybook_build_command}"
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
