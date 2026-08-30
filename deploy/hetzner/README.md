# Hetzner flagship demo

This directory is the reviewed host integration for the public Vireo sandbox at
`https://demo.vireocode.com`. It assumes Caddy and Docker Compose are already
installed and the deployment account can use Docker.

## Topology

```text
Internet -> Caddy :443 -> 127.0.0.1:3000 -> frontend -> app -> PostgreSQL
```

Only Caddy is public. The frontend port is bound to host loopback; the backend and
PostgreSQL have no published host ports. The Compose project and volume must not be
shared with another deployment.

## Prepare trusted artifacts

Build on a trusted workstation or GitHub-hosted runner with the repository's pinned
toolchain:

```bash
./gradlew clean bootJar
corepack npm ci --prefix frontend
corepack npm --prefix frontend run build
```

Update or clone the repository at `/opt/apps/vireo-flagship-demo`, then transfer
`build/libs/app.jar` and `frontend/dist` to the same relative paths. Do not build
untrusted pull-request revisions on the application host.

## Configure and deploy

On the host:

```bash
cd /opt/apps/vireo-flagship-demo
cp deploy/hetzner/vireo-flagship-demo.env.example .env
chmod 600 .env
# Replace both password placeholders with distinct, dedicated random values.
./deploy/hetzner/deploy.sh
```

The deploy command requires existing production artifacts, builds the narrow runtime
images, waits for every health check, and verifies the loopback frontend health path.

## Install host integration

After the stack is healthy, run the reviewed root installer once:

```bash
sudo /opt/apps/vireo-flagship-demo/deploy/hetzner/install-host-integration.sh
```

The installer copies the Vireo Caddy site into `/etc/caddy/sites`, adds one wildcard
import to the main Caddyfile if necessary, validates the complete configuration,
reloads Caddy, and enables the reset timer. It backs up the main Caddyfile before any
change and restores it if validation fails.

Verify the public boundary and timer:

```bash
curl --fail --show-error https://demo.vireocode.com/healthz
curl --fail --show-error https://demo.vireocode.com/actuator/health/readiness
systemctl list-timers vireo-flagship-demo-reset.timer
```

## Operations

The timer destroys only the dedicated `vireo-flagship-demo` Compose volume and
recreates deterministic synthetic data every 24 hours. Inspect its retained evidence
with:

```bash
journalctl -u vireo-flagship-demo-reset.service
```

The public credentials are intentionally `demo` / `demo123`. Never connect this
deployment to private data, another database, shared object storage, or production
credentials. Availability is best effort and has no SLA.
