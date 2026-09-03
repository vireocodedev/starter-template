#!/usr/bin/env bash
# Install this root-owned helper as /usr/local/sbin/vireo-flagship-ingress.
# It accepts only a slot name, so the deploy account cannot inject Caddy text.
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { printf 'This ingress helper must run as root.\n' >&2; exit 2; }
[[ ${1:-} =~ ^(legacy|blue|green)$ ]] || { printf 'usage: %s legacy|blue|green\n' "$0" >&2; exit 2; }
port=3000; [[ "$1" == blue ]] && port=3001; [[ "$1" == green ]] && port=3002
site=/etc/caddy/upstreams/vireo-flagship-demo
main=/etc/caddy/Caddyfile
tmp="$(mktemp "${site}.XXXXXX")"
backup="${site}.previous"
trap 'rm -f "$tmp"' EXIT
printf 'reverse_proxy 127.0.0.1:%s\n' "$port" >"$tmp"
[[ -f "$site" ]] && cp --preserve=mode,ownership,timestamps "$site" "$backup"
install -o root -g root -m 0644 "$tmp" "$site"
if ! caddy validate --config "$main"; then
  [[ -f "$backup" ]] && mv -f "$backup" "$site" || rm -f "$site"
  printf 'Caddy validation failed; restored the previous ingress target.\n' >&2
  exit 1
fi
if ! systemctl reload caddy; then
  [[ -f "$backup" ]] && mv -f "$backup" "$site" || rm -f "$site"
  caddy validate --config "$main" >/dev/null && systemctl reload caddy || true
  printf 'Caddy reload failed; restored the previous ingress target.\n' >&2
  exit 1
fi
rm -f "$backup"
