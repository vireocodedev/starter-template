#!/usr/bin/env bash

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  printf 'Run this installer with sudo.\n' >&2
  exit 2
fi

application_root="/opt/apps/vireo-flagship-demo"
caddy_main="/etc/caddy/Caddyfile"
caddy_sites="/etc/caddy/sites"
caddy_import='import /etc/caddy/sites/*.caddy'
timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup="${caddy_main}.before-vireo-${timestamp}"
site="$caddy_sites/vireo-flagship-demo.caddy"
site_backup="${site}.before-${timestamp}"

for required in \
  "$application_root/deploy/hetzner/Caddyfile" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.service" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.timer" \
  "$application_root/.env"; do
  if [[ ! -f "$required" ]]; then
    printf 'Required deployment file is missing: %s\n' "$required" >&2
    exit 2
  fi
done

if [[ -n "$(find "$application_root/.env" -prune -perm /077 -print)" ]]; then
  printf '%s must have mode 600 before host integration is installed.\n' "$application_root/.env" >&2
  exit 2
fi

install -d -o root -g root -m 0755 "$caddy_sites"
site_existed=false
if [[ -f "$site" ]]; then
  site_existed=true
  cp --preserve=mode,ownership,timestamps "$site" "$site_backup"
fi
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/Caddyfile" \
  "$site"

cp --preserve=mode,ownership,timestamps "$caddy_main" "$backup"
if ! grep -Fqx "$caddy_import" "$caddy_main"; then
  printf '\n%s\n' "$caddy_import" >>"$caddy_main"
fi

if ! caddy validate --config "$caddy_main"; then
  cp --preserve=mode,ownership,timestamps "$backup" "$caddy_main"
  if $site_existed; then
    cp --preserve=mode,ownership,timestamps "$site_backup" "$site"
  else
    rm -f "$site"
  fi
  printf 'Caddy validation failed; restored %s.\n' "$backup" >&2
  exit 1
fi

install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.service" \
  /etc/systemd/system/vireo-flagship-demo-reset.service
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.timer" \
  /etc/systemd/system/vireo-flagship-demo-reset.timer

systemctl daemon-reload
systemctl enable --now vireo-flagship-demo-reset.timer
systemctl reload caddy

printf 'Installed persistent Caddy routing and the daily Vireo demo reset timer.\n'
