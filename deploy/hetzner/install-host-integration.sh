#!/usr/bin/env bash

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  printf 'Run this installer with sudo.\n' >&2
  exit 2
fi

application_root="/opt/apps/vireo-flagship-demo"
caddy_main="/etc/caddy/Caddyfile"
caddy_sites="/etc/caddy/sites"
caddy_upstreams="/etc/caddy/upstreams"
caddy_import='import /etc/caddy/sites/*.caddy'
timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup="${caddy_main}.before-vireo-${timestamp}"
site="$caddy_sites/vireo-flagship-demo.caddy"
upstream="$caddy_upstreams/vireo-flagship-demo"
upstream_backup="${upstream}.before-${timestamp}"
libexec="/usr/local/libexec/vireo-flagship-demo"
site_backup="${site}.before-${timestamp}"

for required in \
  "$application_root/deploy/hetzner/Caddyfile" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.service" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.timer" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.service" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.timer" \
  "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.sh" \
  "$application_root/deploy/hetzner/vireo-flagship-receiver.sh" \
  "$application_root/deploy/hetzner/flagship-host-deploy.sh" \
  "$application_root/deploy/hetzner/flagship-deployment-bundle.mjs" \
  "$application_root/deploy/hetzner/vireo-flagship-ingress.sh" \
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

install -d -o root -g root -m 0755 "$caddy_sites" "$caddy_upstreams" "$libexec"
site_existed=false
if [[ -f "$site" ]]; then
  site_existed=true
  cp --preserve=mode,ownership,timestamps "$site" "$site_backup"
fi
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/Caddyfile" \
  "$site"
if [[ ! -f "$upstream" ]]; then
  # A bootstrap upstream is only a syntactically valid target. The first
  # immutable transaction replaces it after blue has passed loopback health.
  printf 'reverse_proxy 127.0.0.1:3000\n' >"$upstream"
  chmod 0644 "$upstream"
fi
cp --preserve=mode,ownership,timestamps "$upstream" "$upstream_backup"
install -o root -g root -m 0755 "$application_root/deploy/hetzner/vireo-flagship-ingress.sh" /usr/local/sbin/vireo-flagship-ingress
install -o root -g root -m 0755 "$application_root/deploy/hetzner/flagship-host-deploy.sh" "$libexec/flagship-host-deploy.sh"
install -o root -g root -m 0755 "$application_root/deploy/hetzner/vireo-flagship-receiver.sh" "$libexec/vireo-flagship-receiver"
install -o root -g root -m 0644 "$application_root/deploy/hetzner/flagship-deployment-bundle.mjs" "$libexec/flagship-deployment-bundle.mjs"
# The deploy account may select only the two audited slot names. It cannot pass
# a Caddy configuration, database secret, arbitrary command, or target host.
printf 'deploy ALL=(root) NOPASSWD: /usr/local/sbin/vireo-flagship-ingress legacy, /usr/local/sbin/vireo-flagship-ingress blue, /usr/local/sbin/vireo-flagship-ingress green\n' \
  >/etc/sudoers.d/vireo-flagship-ingress
chmod 0440 /etc/sudoers.d/vireo-flagship-ingress

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
  mv -f "$upstream_backup" "$upstream"
  printf 'Caddy validation failed; restored %s.\n' "$backup" >&2
  exit 1
fi

install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.service" \
  /etc/systemd/system/vireo-flagship-demo-reset.service
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-reset.timer" \
  /etc/systemd/system/vireo-flagship-demo-reset.timer
install -o root -g root -m 0755 "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.sh" "$libexec/vireo-flagship-demo-watchdog.sh"
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.service" \
  /etc/systemd/system/vireo-flagship-demo-watchdog.service
install -o root -g root -m 0644 \
  "$application_root/deploy/hetzner/vireo-flagship-demo-watchdog.timer" \
  /etc/systemd/system/vireo-flagship-demo-watchdog.timer

systemctl daemon-reload
systemctl enable --now vireo-flagship-demo-reset.timer
systemctl enable --now vireo-flagship-demo-watchdog.timer
if ! systemctl reload caddy; then
  cp --preserve=mode,ownership,timestamps "$backup" "$caddy_main"
  if $site_existed; then cp --preserve=mode,ownership,timestamps "$site_backup" "$site"; else rm -f "$site"; fi
  mv -f "$upstream_backup" "$upstream"
  caddy validate --config "$caddy_main" >/dev/null && systemctl reload caddy || true
  printf 'Caddy reload failed; restored the prior ingress configuration.\n' >&2
  exit 1
fi
rm -f "$backup" "$site_backup" "$upstream_backup"

printf 'Installed persistent Caddy routing and the daily Vireo demo reset timer.\n'
