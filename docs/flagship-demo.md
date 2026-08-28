# Flagship demo operations

The public flagship is live at <https://demo.vireocode.com> with `demo` / `demo123`.
It runs the repository's deterministic synthetic-data profile, a destructive reset
procedure scoped to a dedicated Compose project, and an hourly synthetic read-only
journey. Availability is best effort with no SLA or guaranteed response time.

## Safety boundary

The flagship is a public sandbox, not a production or private test environment. It accepts synthetic public data only. Never connect its database, credentials, object storage, telemetry, or backups to another environment. The `demo` / `demo123` account is intentionally public and must have no access beyond this disposable deployment.

The Compose overlay activates `prod,demo`: production-safe error, documentation, and cookie defaults remain enabled while the deterministic development seed is installed into an otherwise empty dedicated database.

## Deploy

Build the normal production artifacts, create a mode-`600` `.env` from the supplied
host template, then deploy with both Compose descriptors:

```bash
cp deploy/hetzner/vireo-flagship-demo.env.example .env
chmod 600 .env
# Replace the placeholder POSTGRES_PASSWORD before continuing.
./deploy/hetzner/deploy.sh
```

Terminate TLS at the public ingress, retain the frontend security headers and same-origin `/api` proxy, and keep `SESSION_COOKIE_SECURE=true`. Publish only the frontend origin. The database and backend remain private network services.

The audited single-VPS integration for `demo.vireocode.com` is documented in
[`deploy/hetzner/README.md`](../deploy/hetzner/README.md). It binds the frontend to
host loopback, keeps the backend and database on the private Compose network, adds a
Caddy route, and installs a persistent daily reset timer.

## Reset

The reset destroys only the named demo project's volumes, rebuilds the deployment, runs migrations, and restores the deterministic seed. Run it at least every 24 hours and after abuse, unexpected content, or a failed evaluation journey:

```bash
VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo \
  ./scripts/reset-flagship-demo.sh
```

This is intentionally destructive. Do not override `VIREO_DEMO_COMPOSE_PROJECT` with a shared or production Compose project.

## Availability evidence

The repository is configured with:

1. `VIREO_DEMO_BASE_URL=https://demo.vireocode.com` and
   `VIREO_DEMO_USERNAME=demo` repository variables.
2. `VIREO_DEMO_PASSWORD` as an Actions secret.
3. An hourly **Flagship demo** workflow that checks both health boundaries and the
   authenticated read-only journey.
4. A persistent host timer that resets the isolated volume every 24 hours.
5. Retained pre-reset, reset, and post-reset evidence tied to the deployed revision
   in `contracts/flagship-demo-policy.json`.

The hourly journey verifies the public shell, authentication, live overview data,
navigation, and seeded inventory without modifying shared state. Maintainers own the
deployment on a best-effort basis. Report a reproducible outage through the
[Template bug form](https://github.com/vireocodedev/starter-template/issues/new?template=bug_report.yml);
suspected vulnerabilities always use the private security-advisory path.
