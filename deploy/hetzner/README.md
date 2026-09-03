# Hetzner flagship demo

This directory is the reviewed host integration for the public Vireo sandbox at
`https://demo.vireocode.com`. It assumes Caddy and Docker Compose are already
installed and the deployment account can use Docker.

## Topology

```text
Internet -> Caddy :443 -> active blue/green loopback slot (3001/3002) -> frontend -> app -> PostgreSQL
```

Only Caddy is public. The frontend port is bound to host loopback; the backend and
PostgreSQL have no published host ports. The Compose project and volume must not be
shared with another deployment.

## One-time host installation

The `deploy` account retains `/opt/apps/vireo-flagship-demo/.env` with mode 600;
GitHub Actions never receives database values. Install Docker, Caddy, Node 24, and
the repository at that path, then create the environment file from the supplied
example (do not add `FRONTEND_PORT`: the transaction controller assigns the slot):

```bash
cp deploy/hetzner/vireo-flagship-demo.env.example .env
chmod 600 .env
# Set distinct owner/runtime passwords.
sudo ./deploy/hetzner/install-host-integration.sh
```

The root installer installs an allowlisted ingress selector, its restricted sudoers
entry, and the reset/watchdog timers. The deploy account can select only `blue` or
`green`; it cannot modify Caddy or supply database secrets.

Install the GitHub deployment public key for `deploy` as a forced command, not a
general shell account. The receiver accepts only bounded `upload`, `manifest`,
`prepare`, `activate`, `accept`, `rollback`, and `status` verbs and writes only a
transaction-scoped incoming directory. Use this exact shape in `authorized_keys`
(substitute the real key):

```text
restrict,command="/usr/local/libexec/vireo-flagship-demo/vireo-flagship-receiver" ssh-ed25519 AAAA... github-vireo-flagship
```

On hosts without `restrict`, use all four explicit restrictions:
`no-agent-forwarding,no-port-forwarding,no-X11-forwarding,no-pty,command="...receiver"`.
Do not grant this key `scp`, a shell, arbitrary paths, forwarding, or `sudo`.

## Release deployment

The supported deployment path is the **Flagship demo** workflow dispatched by
`Template release` only after an exact immutable `starter-template@X.Y.Z` GitHub
Release has passed final verification. The workflow builds on a GitHub runner,
creates a deterministic allowlisted archive and manifest, then uses native OpenSSH
with strict pinned known-host verification. It has no database credential.

Run a non-mutating qualification first when rehearsing an existing release:

```bash
gh workflow run flagship-demo.yml --ref starter-template@X.Y.Z \
  -f mode=preflight -f tag=starter-template@X.Y.Z -f commit=<40-hex-tag-commit> \
  -f release=https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%40X.Y.Z
```

Preflight builds and validates the exact immutable tag without deploying or reading
deployment secrets. A release dispatch transfers only the verified bundle. The host
rejects traversal, links, duplicate/unexpected files, malformed identity, member
hash/size drift, non-public-synthetic classification, and archive digest mismatch
before it mutates a slot.

Each release stages the inactive slot, waits for private health checks, atomically
switches Caddy, writes `/.well-known/vireo-deployment.json` with `Cache-Control:
no-store`, and only then removes the prior slot's exact Compose project/volume.
Distinct release attempts coordinate through a host flock and atomic transaction
state; same-release retries resume or no-op. There is no global Docker prune.
When a different immutable release owns the pending transaction, the GitHub deploy
job polls the sanitized host status for up to sixty minutes: this covers the
50-minute pending expiry and watchdog window. It never replaces, rolls back, or
silently skips that release's public-qualification window.

## Install host integration

The Caddy helper validates/reloads the complete configuration and restores its prior
upstream file on validation or reload failure. The watchdog reverses an expired
pending cutover after a runner interruption. `deploy.sh` is intentionally a mutable
local/rehearsal helper; immutable public recovery uses the forced receiver protocol.

The installer preserves the existing legacy `127.0.0.1:3000` upstream. It does not
switch ingress until a first blue transaction has passed private and public
qualification. After that first acceptance, legacy project cleanup remains a
one-time maintainer action; it is intentionally not guessed or deleted automatically.

Verify the public boundary and timer:

```bash
curl --fail --show-error https://demo.vireocode.com/healthz
curl --fail --show-error https://demo.vireocode.com/actuator/health/readiness
systemctl list-timers vireo-flagship-demo-reset.timer
```

## Operations

The timer redeploys the saved current immutable bundle into the alternate slot and
destroys only the prior flagship slot volume. It makes no durable-backup claim and
must never be connected to non-synthetic data. Inspect retained transaction evidence
and the public revision proof with:

Before the first immutable blue/green release is accepted, the timer reports
`awaiting-first-immutable-release` and exits successfully without changing the
legacy service. It never rebuilds the mutable host checkout as a substitute bundle.

```bash
journalctl -u vireo-flagship-demo-reset.service
curl --fail https://demo.vireocode.com/.well-known/vireo-deployment.json
```

The public credentials are intentionally `demo` / `demo123`. Never connect this
deployment to private data, another database, shared object storage, or production
credentials. Availability is best effort and has no SLA.
