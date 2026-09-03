#!/usr/bin/env bash
# Forced-command receiver. SSH_ORIGINAL_COMMAND is parsed as fixed tokens only;
# it never evaluates user input or accepts a path/host/shell command.
set -euo pipefail
umask 077
root="${VIREO_FLAGSHIP_ROOT:-/opt/apps/vireo-flagship-demo}"
libexec="${VIREO_FLAGSHIP_LIBEXEC:-/usr/local/libexec/vireo-flagship-demo}"
max=188743680
bad(){ printf '{"status":"rejected"}\n' >&2; exit "${1:-64}"; }
read -r -a words <<<"${SSH_ORIGINAL_COMMAND:-}"
case "${words[0]:-}" in
  upload)
    [[ ${#words[@]} -eq 6 ]] || bad
    run="${words[1]}"; attempt="${words[2]}"; transaction="${words[3]}"; bytes="${words[4]}"; digest="${words[5]}"
    [[ "$run" =~ ^[0-9]{1,20}$ && "$attempt" =~ ^[0-9]{1,8}$ && "$transaction" =~ ^[0-9a-f]{64}$ && "$bytes" =~ ^[0-9]+$ && "$bytes" -le "$max" && "$digest" =~ ^[0-9a-f]{64}$ ]] || bad
    dir="$root/incoming/$run-$attempt/$transaction"; install -d -m 0700 "$dir"; tmp="$(mktemp "$dir/.bundle.XXXXXX")"
    # Read one byte beyond the declared size.  Unlike a timed read this is
    # deterministic for both SSH pipes and test fixtures: EOF is acceptable,
    # any extra byte is a protocol violation.
    head -c "$((bytes + 1))" >"$tmp"
    [[ "$(wc -c <"$tmp")" == "$bytes" ]] || { rm -f "$tmp"; bad; }
    [[ "$(sha256sum "$tmp" | awk '{print $1}')" == "$digest" ]] || { rm -f "$tmp"; bad; }
    target="$dir/bundle.tar.gz"
    if [[ -f "$target" ]]; then [[ "$(sha256sum "$target" | awk '{print $1}')" == "$digest" ]] || { rm -f "$tmp"; bad 75; }; rm -f "$tmp"; else sync "$tmp"; mv -f "$tmp" "$target"; fi
    printf '{"status":"uploaded","transaction":"%s"}\n' "$transaction"
    ;;
  manifest)
    [[ ${#words[@]} -eq 5 ]] || bad
    run="${words[1]}"; attempt="${words[2]}"; transaction="${words[3]}"; digest="${words[4]}"
    [[ "$run" =~ ^[0-9]{1,20}$ && "$attempt" =~ ^[0-9]{1,8}$ && "$transaction" =~ ^[0-9a-f]{64}$ && "$digest" =~ ^[0-9a-f]{64}$ ]] || bad
    dir="$root/incoming/$run-$attempt/$transaction"; [[ -f "$dir/bundle.tar.gz" ]] || bad 75
    tmp="$(mktemp "$dir/.manifest.XXXXXX")"; head -c 1048577 >"$tmp"
    [[ "$(wc -c <"$tmp")" -le 1048576 ]] || { rm -f "$tmp"; bad; }
    [[ "$(sha256sum "$tmp" | awk '{print $1}')" == "$digest" ]] || { rm -f "$tmp"; bad; }
    sync "$tmp"; mv -f "$tmp" "$dir/manifest.json"
    actual="$(node "$libexec/flagship-deployment-bundle.mjs" validate "$dir/bundle.tar.gz" "$dir/manifest.json" vireocodedev/vireo-template)" || { rm -f "$dir/manifest.json"; bad 65; }
    [[ "$actual" == "$transaction" ]] || { rm -f "$dir/manifest.json"; bad 65; }
    printf '{"status":"manifest","transaction":"%s"}\n' "$transaction"
    ;;
  prepare)
    [[ ${#words[@]} -eq 5 && "${words[1]}" =~ ^[0-9]{1,20}$ && "${words[2]}" =~ ^[0-9]{1,8}$ && "${words[3]}" =~ ^[0-9a-f]{64}$ && "${words[4]}" =~ ^[0-9]+$ ]] || bad
    transfer="${words[1]}-${words[2]}"
    [[ -d "$root/incoming/$transfer/${words[3]}" ]] || bad 75
    exec "$libexec/flagship-host-deploy.sh" prepare "$transfer" "${words[3]}" "${words[4]}"
    ;;
  activate|accept|rollback)
    [[ ${#words[@]} -eq 3 && "${words[1]}" =~ ^[0-9a-f]{64}$ && "${words[2]}" =~ ^[0-9]+$ ]] || bad
    exec "$libexec/flagship-host-deploy.sh" "${words[0]}" "${words[1]}" "${words[2]}"
    ;;
  status)
    [[ ${#words[@]} -eq 1 ]] || bad
    exec "$libexec/flagship-host-deploy.sh" status
    ;;
  *) bad ;;
esac
