#!/usr/bin/env bash

# This wrapper is intentionally maintainer-only. Generated applications receive
# verify.sh, which validates their build without inheriting Vireo's flagship,
# evidence, or repository-governance gates.
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

./scripts/verify.sh "$@"

steps=(
  "template-release|Template release policy|node scripts/template-release-policy.mjs"
  "verification-pipeline|Verification pipeline contract|node scripts/verification-pipeline-policy.mjs"
  "vireo-compatibility|Vireo package compatibility|node scripts/vireo-package-compatibility-policy.mjs"
  "public-contract|Public Template contract|node scripts/public-contract-policy.mjs"
  "flagship-demo|Flagship demo contract|node scripts/flagship-demo-policy.mjs"
  "flagship-proof|Flagship proof material|node scripts/flagship-proof-policy.mjs"
)

for step in "${steps[@]}"; do
  IFS='|' read -r step_id label command <<<"$step"
  printf '%s...\n' "$label"
  bash -lc "$command"
done

printf 'Template-maintainer verification passed: %d additional policy steps.\n' "${#steps[@]}"
