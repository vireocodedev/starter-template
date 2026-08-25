#!/usr/bin/env bash

set -u

if [[ -n "${VIREO_PACKAGES_TOKEN:-}" ]]; then
  exit 0
fi

cat >&2 <<'EOF'
::error::VIREO_PACKAGES_TOKEN is not configured. Vireo's private Maven/Gradle packages are repository-scoped, so starter-template's built-in GITHUB_TOKEN cannot download artifacts published by the separate starter repository. Add a classic personal access token with read:packages access as VIREO_PACKAGES_TOKEN in both the repository's Actions secrets and Dependabot secrets.
EOF
exit 1
