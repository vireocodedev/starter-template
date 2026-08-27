#!/bin/sh
set -eu

repository_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
gitleaks_image="ghcr.io/gitleaks/gitleaks@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f"

if ! command -v docker >/dev/null 2>&1; then
  echo "FAILED: Secret scan requires Docker." >&2
  exit 1
fi

echo "Scanning the complete Git history for secrets with Gitleaks v8.30.1..."
docker run --rm \
  --volume "$repository_root:/repo:ro" \
  "$gitleaks_image" \
  git /repo --redact --no-banner
