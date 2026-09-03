#!/usr/bin/env bash
# Root-owned controller. The forced-command receiver is its sole SSH caller.
set -euo pipefail
root="${VIREO_FLAGSHIP_ROOT:-/opt/apps/vireo-flagship-demo}"
libexec="${VIREO_FLAGSHIP_LIBEXEC:-/usr/local/libexec/vireo-flagship-demo}"
ops="$root/operations"; state_file="$ops/deployment-state.json"; lock_file="$ops/deployment.lock"
env_file="${VIREO_DEMO_ENV_FILE:-$root/.env}"; node_bin="${VIREO_NODE:-node}"
docker_bin="${VIREO_DOCKER:-docker}"; ingress_bin="${VIREO_INGRESS:-/usr/local/sbin/vireo-flagship-ingress}"
sudo_bin="${VIREO_SUDO:-sudo}"
curl_bin="${VIREO_CURL:-curl}"
fail(){ printf '%s\n' "$1" >&2; exit "${2:-1}"; }
tx_ok(){ [[ "$1" =~ ^[0-9a-f]{64}$ ]]; }; gen_ok(){ [[ "$1" =~ ^[0-9]+$ ]]; }
slot_ok(){ [[ "$1" =~ ^(legacy|blue|green)$ ]]; }; transfer_ok(){ [[ "$1" =~ ^[0-9]{1,20}-[0-9]{1,8}$ ]]; }
read_state(){ [[ -s "$state_file" ]] && cat "$state_file" || printf '{"schemaVersion":2,"generation":0,"accepted":{"endpoint":{"kind":"legacy","slot":null,"project":"vireo-flagship-demo","port":3000,"root":null}},"pending":null}\n'; }
value(){ "$node_bin" -e "const s=JSON.parse(process.argv[1]);process.stdout.write(String($2))" "$1"; }
mutate(){ "$node_bin" -e "const s=JSON.parse(process.argv[1]);$2;process.stdout.write(JSON.stringify(s))" "$1"; }
write_state(){ local p="$1" t; t="$(mktemp "$ops/.state.XXXXXX")"; chmod 0600 "$t"; printf '%s\n' "$p" >"$t"; mv -f "$t" "$state_file"; }
lock(){ mkdir -p "$ops" "$ops/bundles" "$root/incoming" "$root/slots"; exec 9>"$lock_file"; flock -x 9; }
port(){ case "$1" in legacy) echo 3000;; blue) echo 3001;; green) echo 3002;; esac; }
next_slot(){ [[ "$1" == blue ]] && echo green || echo blue; }
stop_slot(){ local s="$1"; [[ "$s" =~ ^(blue|green)$ && -d "$root/slots/$s" ]] || return 0; (cd "$root/slots/$s" && "$docker_bin" compose --env-file "$env_file" -f compose.yaml -f compose.demo.yaml --project-name "vireo-flagship-demo-$s" down --volumes --remove-orphans) >&2; }
clean_transaction(){ local transaction="$1" transfer candidate; tx_ok "$transaction" || return 64; [[ -d "$root/incoming" ]] || return 0; for candidate in "$root"/incoming/*/"$transaction"; do [[ -d "$candidate" ]] || continue; rm -rf -- "$candidate"; done; }
assert_generation(){ local s="$1" g="$2"; [[ "$(value "$s" 's.generation')" == "$g" ]] || fail "CAS generation changed." 75; }
stage(){
  local transfer="$1" requested_transaction="$2" expected="$3" reset_mode="${4:-false}" s staged_state pending_phase accepted current target archive manifest transaction tag commit release repo slot_root staging accepted_tag
  transfer_ok "$transfer" && tx_ok "$requested_transaction" && gen_ok "$expected" || fail "Malformed prepare request." 64
  lock; s="$(read_state)"; assert_generation "$s" "$expected"
  pending="$(value "$s" 's.pending?.transaction||""')"
  archive="$root/incoming/$transfer/$requested_transaction/bundle.tar.gz"; manifest="$root/incoming/$transfer/$requested_transaction/manifest.json"
  [[ -f "$archive" && -f "$manifest" && -f "$env_file" && -z "$(find "$env_file" -prune -perm /077 -print)" ]] || fail "Incomplete transfer or unsafe host environment." 65
  transaction="$("$node_bin" "$libexec/flagship-deployment-bundle.mjs" validate "$archive" "$manifest" vireocodedev/vireo-template)"
  tx_ok "$transaction" || fail "Invalid transaction." 65
  [[ "$transaction" == "$requested_transaction" ]] || fail "Transfer transaction does not match its manifest." 65
  if [[ -n "$pending" ]]; then
    [[ "$pending" == "$transaction" ]] || { printf '{"status":"busy","transaction":"%s","generation":%s}\n' "$pending" "$expected"; return; }
    pending_phase="$(value "$s" 's.pending.phase')"
    if [[ "$pending_phase" == staging ]]; then
      target="$(value "$s" 's.pending.target')"; slot_ok "$target" || fail "Malformed staging target." 65
      # A runner/host interruption can leave an inactive slot partly built.
      # It was never accepted, so an exact retry first destroys it and advances
      # the CAS generation; the caller must refresh and prepare again.
      stop_slot "$target" || fail "Could not clean interrupted staging slot." 75
      write_state "$(mutate "$s" 's.generation++;s.pending=null')"
      printf '{"status":"retry","transaction":"%s","target":"%s","generation":%s}\n' "$transaction" "$target" "$((expected+1))"
      return
    fi
    printf '{"status":"%s","transaction":"%s","target":"%s","generation":%s}\n' "$pending_phase" "$transaction" "$(value "$s" 's.pending.target')" "$expected"
    return
  fi
  repo="$(value "$(cat "$manifest")" 's.repository')"; tag="$(value "$(cat "$manifest")" 's.tag')"; commit="$(value "$(cat "$manifest")" 's.commit')"; release="$(value "$(cat "$manifest")" 's.release')"
  accepted="$(value "$s" 'JSON.stringify(s.accepted)')"; current="$(value "$accepted" 's.endpoint.target||s.endpoint.kind')"; slot_ok "$current" || fail "Malformed accepted endpoint." 65
  if [[ "$reset_mode" != true && "$(value "$accepted" 's.transaction||""')" == "$transaction" ]]; then
    clean_transaction "$transaction" >&2 || true
    printf '{"status":"accepted","transaction":"%s","target":"%s","generation":%s}\n' "$transaction" "$current" "$expected"
    return
  fi
  accepted_tag="$(value "$accepted" 's.revision?.tag||""')"
  if [[ -n "$accepted_tag" ]]; then
    "$node_bin" -e 'const p=(v)=>v.replace(/^starter-template@/,"").split(/[+-]/)[0].split(".").map(Number);const[a,b]=process.argv.slice(1).map(p);for(let i=0;i<3;i++)if(a[i]!==b[i])process.exit(a[i]<b[i]?1:0)' "$tag" "$accepted_tag" || fail "Refusing an older release than the accepted public revision." 75
  fi
  target=blue; [[ "$current" == blue ]] && target=green; [[ "$current" == green ]] && target=blue
  cp --preserve=mode,timestamps "$archive" "$ops/bundles/$transaction.tar.gz"; cp --preserve=mode,timestamps "$manifest" "$ops/bundles/$transaction.json"
  # Persist recovery authority before removing/building an inactive slot. This
  # lets watchdog, rollback, and an exact rerun clean an interrupted build.
  staged_state="$("$node_bin" -e 'const s=JSON.parse(process.argv[1]),p=s.accepted;s.generation++;s.pending={phase:"staging",transaction:process.argv[2],target:process.argv[3],prior:p,archive:process.argv[4],manifest:process.argv[5],revision:JSON.parse(process.argv[6]),startedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+50*60*1000).toISOString()};process.stdout.write(JSON.stringify(s))' "$s" "$transaction" "$target" "$ops/bundles/$transaction.tar.gz" "$ops/bundles/$transaction.json" "$(value "$(cat "$manifest")" 'JSON.stringify({tag:s.tag,commit:s.commit,release:s.release})')")"
  write_state "$staged_state"
  slot_root="$root/slots/$target"; staging="$(mktemp -d "$root/slots/.$target.XXXXXX")"; trap 'rm -rf "$staging"' RETURN
  tar -xzf "$archive" -C "$staging" --no-same-owner --no-same-permissions
  mkdir -p "$staging/frontend/dist/.well-known"
  "$node_bin" -e 'const fs=require("fs");fs.writeFileSync(process.argv[1],JSON.stringify({schemaVersion:1,repository:process.argv[2],tag:process.argv[3],commit:process.argv[4],release:process.argv[5],transaction:process.argv[6],dataClassification:"public-synthetic-only"})+"\\n")' "$staging/frontend/dist/.well-known/vireo-deployment.json" "$repo" "$tag" "$commit" "$release" "$transaction"
  rm -rf "$slot_root"; mv "$staging" "$slot_root"; trap - RETURN
  if ! (cd "$slot_root" && env -u POSTGRES_DB -u POSTGRES_OWNER_USER -u POSTGRES_OWNER_PASSWORD -u POSTGRES_RUNTIME_USER -u POSTGRES_RUNTIME_PASSWORD -u SESSION_COOKIE_SECURE FRONTEND_PORT="$(port "$target")" "$docker_bin" compose --env-file "$env_file" -f compose.yaml -f compose.demo.yaml --project-name "vireo-flagship-demo-$target" up --build --detach --wait >&2 && "$curl_bin" --fail --silent --show-error "http://127.0.0.1:$(port "$target")/healthz" >&2 && "$curl_bin" --fail --silent --show-error "http://127.0.0.1:$(port "$target")/actuator/health/readiness" | grep -q '"status":"UP"'); then
    stop_slot "$target" >&2 || true
    write_state "$(mutate "$staged_state" 's.generation++;s.pending=null')"
    clean_transaction "$transaction" >&2 || true
    fail "Inactive slot failed local qualification."
  fi
  write_state "$(mutate "$staged_state" 's.generation++;s.pending.phase="prepared"')"
  printf '{"status":"prepared","transaction":"%s","target":"%s","generation":%s}\n' "$transaction" "$target" "$((expected+2))"
}
activate(){
  local transaction="$1" expected="$2" s target; tx_ok "$transaction" && gen_ok "$expected" || fail "Malformed activate request." 64
  lock; s="$(read_state)"; assert_generation "$s" "$expected"; [[ "$(value "$s" 's.pending?.transaction||""')" == "$transaction" ]] || fail "No matching prepared transaction." 75
  [[ "$(value "$s" 's.pending.phase')" == cutover ]] && { printf '{"status":"cutover","transaction":"%s","generation":%s}\n' "$transaction" "$expected"; return; }
  [[ "$(value "$s" 's.pending.phase')" == prepared ]] || fail "Pending transaction is not prepared." 75
  target="$(value "$s" 's.pending.target')"; slot_ok "$target" || fail "Malformed pending target." 65
  "$sudo_bin" "$ingress_bin" "$target" || fail "Ingress cutover failed; prior endpoint remains active."
  write_state "$(mutate "$s" 's.generation++;s.pending.phase="cutover";s.pending.expiresAt=new Date(Date.now()+50*60*1000).toISOString()')"
  printf '{"status":"cutover","transaction":"%s","generation":%s}\n' "$transaction" "$((expected+1))"
}
accept(){
  local transaction="$1" expected="$2" s target prior; tx_ok "$transaction" && gen_ok "$expected" || fail "Malformed accept request." 64
  lock; s="$(read_state)"
  if [[ "$(value "$s" 's.pending?.transaction||""')" != "$transaction" && "$(value "$s" 's.accepted?.transaction||""')" == "$transaction" ]]; then
    clean_transaction "$transaction" >&2 || true
    printf '{"status":"accepted","transaction":"%s","generation":%s}\n' "$transaction" "$(value "$s" 's.generation')"
    return
  fi
  assert_generation "$s" "$expected"; [[ "$(value "$s" 's.pending?.transaction||""')" == "$transaction" && "$(value "$s" 's.pending.phase')" == cutover ]] || fail "No matching cutover." 75
  target="$(value "$s" 's.pending.target')"; prior="$(value "$s" 's.pending.prior.endpoint.target||s.pending.prior.endpoint.kind')"
  write_state "$(VIREO_FLAGSHIP_ROOT="$root" mutate "$s" 'const p=s.pending,r=process.env.VIREO_FLAGSHIP_ROOT;s.generation++;s.accepted={transaction:p.transaction,bundle:{archive:p.archive,manifest:p.manifest},revision:p.revision,endpoint:{kind:"slot",target:p.target,slot:p.target,project:"vireo-flagship-demo-"+p.target,port:p.target==="blue"?3001:3002,root:r+"/slots/"+p.target},acceptedAt:new Date().toISOString()};s.pending=null')"
  [[ "$prior" == legacy ]] || stop_slot "$prior" || true
  clean_transaction "$transaction" >&2 || true
  printf '{"status":"accepted","transaction":"%s","generation":%s}\n' "$transaction" "$((expected+1))"
}
rollback(){
  local transaction="$1" expected="$2" s target prior; tx_ok "$transaction" && gen_ok "$expected" || fail "Malformed rollback request." 64
  lock; s="$(read_state)"; assert_generation "$s" "$expected"; [[ "$(value "$s" 's.pending?.transaction||""')" == "$transaction" ]] || fail "No matching pending transaction." 75
  target="$(value "$s" 's.pending.target')"; prior="$(value "$s" 's.pending.prior.endpoint.target||s.pending.prior.endpoint.kind')"; slot_ok "$target" && slot_ok "$prior" || fail "Malformed rollback state." 65
  "$sudo_bin" "$ingress_bin" "$prior" || fail "Ingress rollback failed; retaining pending state and both slots."
  stop_slot "$target" || fail "Rollback ingress restored but staged cleanup failed; retaining pending state."
  write_state "$(mutate "$s" 's.generation++;s.accepted=s.pending.prior;s.pending=null')"
  clean_transaction "$transaction" >&2 || true
  printf '{"status":"rolled-back","transaction":"%s","generation":%s}\n' "$transaction" "$((expected+1))"
}
status(){ lock; local s; s="$(read_state)"; "$node_bin" -e 'const s=JSON.parse(process.argv[1]);process.stdout.write(JSON.stringify({generation:s.generation,accepted:{transaction:s.accepted?.transaction||null,tag:s.accepted?.revision?.tag||null,target:s.accepted?.endpoint?.target||s.accepted?.endpoint?.kind},pending:s.pending&&{transaction:s.pending.transaction,phase:s.pending.phase,target:s.pending.target,expiresAt:s.pending.expiresAt}}))' "$s"; }
watchdog(){ local s tx g expired; s="$(read_state)"; tx="$(value "$s" 's.pending?.transaction||""')"; g="$(value "$s" 's.generation')"; expired="$(value "$s" 'String(Date.parse(s.pending?.expiresAt||"")<=Date.now())')"; [[ -n "$tx" && "$expired" == true ]] || exit 0; rollback "$tx" "$g"; }
reset(){
  local s generation archive manifest transaction target transfer result prepared_generation activated_generation commit public_url
  s="$(read_state)"; generation="$(value "$s" 's.generation')"; archive="$(value "$s" 's.accepted?.bundle?.archive||""')"; manifest="$(value "$s" 's.accepted?.bundle?.manifest||""')"; transaction="$(value "$s" 's.accepted?.transaction||""')"; target="$(value "$s" 's.accepted?.endpoint?.target||s.accepted?.endpoint?.kind||""')"; commit="$(value "$s" 's.accepted?.revision?.commit||""')"
  if [[ "$target" == legacy && -z "$transaction" && -z "$archive" && -z "$manifest" ]]; then
    printf '{"status":"skipped","reason":"awaiting-first-immutable-release","target":"legacy","generation":%s}\n' "$generation"
    return
  fi
  [[ -f "$archive" && -f "$manifest" ]] || fail "No accepted immutable bundle exists for reset." 65
  transfer="0-1"; mkdir -p "$root/incoming/$transfer/$transaction"; cp "$archive" "$root/incoming/$transfer/$transaction/bundle.tar.gz"; cp "$manifest" "$root/incoming/$transfer/$transaction/manifest.json"
  result="$(stage "$transfer" "$transaction" "$generation" true)"; prepared_generation="$(printf '%s' "$result" | "$node_bin" -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>process.stdout.write(String(JSON.parse(s).generation)))')"
  result="$(activate "$transaction" "$prepared_generation")"; activated_generation="$(printf '%s' "$result" | "$node_bin" -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>process.stdout.write(String(JSON.parse(s).generation)))')"
  public_url="${VIREO_DEMO_PUBLIC_URL:-https://demo.vireocode.com}"
  if ! "$curl_bin" --fail --silent --show-error "$public_url/healthz" >&2 || ! "$curl_bin" --fail --silent --show-error "$public_url/actuator/health/readiness" | grep -q '"status":"UP"' || ! "$curl_bin" --fail --silent --show-error -D "$ops/reset-headers" "$public_url/.well-known/vireo-deployment.json" | "$node_bin" -e 'const c=[];process.stdin.on("data",x=>c.push(x));process.stdin.on("end",()=>{const p=JSON.parse(Buffer.concat(c));if(p.commit!==process.argv[1]||p.dataClassification!=="public-synthetic-only")process.exit(1)})' "$commit" || ! grep -Eqi '^content-security-policy:' "$ops/reset-headers" || ! grep -Eqi '^x-frame-options:' "$ops/reset-headers"; then
    rollback "$transaction" "$activated_generation" >&2 || true
    fail "Production reset public qualification failed; transaction rolled back when possible."
  fi
  accept "$transaction" "$activated_generation"
}
main(){ case "${1:-}" in prepare) [[ $# -eq 4 ]] || fail "usage: prepare TRANSFER TRANSACTION GENERATION" 64; stage "$2" "$3" "$4";; activate|accept|rollback) [[ $# -eq 3 ]] || fail "usage: $1 TRANSACTION GENERATION" 64; "$1" "$2" "$3";; status) [[ $# -eq 1 ]] || fail "usage: status" 64; status;; watchdog) [[ $# -eq 1 ]] || fail "usage: watchdog" 64; watchdog;; reset) [[ $# -eq 1 ]] || fail "usage: reset" 64; reset;; *) fail "usage: prepare|activate|accept|rollback|status|watchdog|reset" 64;; esac; }
main "$@"
