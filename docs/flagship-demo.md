# Flagship demo operations

The public flagship is live at <https://demo.vireocode.com> with `demo` / `demo123`.
It runs the repository's deterministic synthetic-data profile, a destructive reset
procedure scoped to a dedicated Compose project, and an hourly synthetic read-only
journey. Availability is best effort with no SLA or guaranteed response time.

## Safety boundary

The flagship is a public sandbox, not a production or private test environment. It accepts synthetic public data only. Never connect its database, credentials, object storage, telemetry, or backups to another environment. The `demo` / `demo123` account is intentionally public and must have no access beyond this disposable deployment.

The Compose overlay activates `prod,demo`: production-safe error, documentation, and cookie defaults remain enabled while the deterministic development seed is installed into an otherwise empty dedicated database.

## Automated immutable deployment

`Template release` dispatches the Flagship workflow only after it has verified an
exact immutable published `starter-template@X.Y.Z` release. That workflow checks out
the annotated tag, rebuilds the production artifacts, creates a deterministic
allowlisted archive and manifest bound to the repository, tag, commit, GitHub
Release, workflow run/attempt and file hashes, and validates it before the host can
mutate. A preflight workflow mode runs that qualification without deployment secrets
or host mutation.

The protected `flagship-demo` environment holds only the native OpenSSH private key.
Its public variables are the exact host, user, port, and pinned known-host line.
Database identities remain only in the host mode-`600` environment file. Native SSH
uses strict host-key checking; no third-party SSH action is used.

The deploy key is a forced-command key restricted to the root-owned receiver with
`restrict,command="/usr/local/libexec/vireo-flagship-demo/vireo-flagship-receiver"`.
It has no interactive shell, forwarding, PTY, arbitrary upload path, or remote
command authority. The receiver accepts only one bounded, hash-checked archive and
manifest per release transaction.

```bash
gh workflow run flagship-demo.yml --ref starter-template@X.Y.Z \
  -f mode=preflight -f tag=starter-template@X.Y.Z -f commit=<tag-commit> \
  -f release=https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%40X.Y.Z
```

Terminate TLS at the public ingress, retain the frontend security headers and same-origin `/api` proxy, and keep `SESSION_COOKIE_SECURE=true`. Publish only the frontend origin. The database and backend remain private network services.

The host uses blue/green Compose slots (`3001`/`3002`) with a shared flock and
atomic JSON transaction state. It validates the inactive slot, changes Caddy through
a root-owned allowlisted helper, exposes a no-cache
`/.well-known/vireo-deployment.json` proof, then retains the previous slot through
post-cutover qualification. Failed public cutovers restore the prior ingress. The
audited single-VPS integration is documented in
[`deploy/hetzner/README.md`](../deploy/hetzner/README.md). It binds the frontend to
host loopback, keeps the backend and database on the private Compose network, adds a
Caddy route, and installs a persistent daily reset timer.

Release ordering is fail-closed: Template publication refuses to mutate a release
that a newer `main` release policy has superseded, while the host refuses any
semantic version lower than its accepted public revision. Source-qualified workflow
concurrency therefore cannot let an older release replace a newer flagship.

## Reset

The reset deploys the same saved current immutable bundle into the alternate slot,
then destroys only the prior flagship slot volume so migrations restore the
deterministic seed. Run it at least every 24 hours and after abuse, unexpected
content, or a failed evaluation journey. It is not a backup mechanism:

During the one-time migration from the legacy port-3000 deployment, the timer exits
successfully without changing that deployment until the first immutable blue/green
release has been accepted. This avoids rebuilding unpublished `main` bytes under a
published release identity. Daily destructive resets begin automatically after that
first acceptance.

```bash
VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo \
VIREO_FLAGSHIP_PRODUCTION_RESET=true \
  ./scripts/reset-flagship-demo.sh
```

This is intentionally destructive. Do not override `VIREO_DEMO_COMPOSE_PROJECT` with a shared or production Compose project.
For a local rehearsal, omit `VIREO_FLAGSHIP_PRODUCTION_RESET=true`; the local
scoped Compose reset remains available and may use an inline environment when no
`.env` exists.

## Availability evidence

The repository is configured with:

1. `VIREO_DEMO_BASE_URL=https://demo.vireocode.com` and
   `VIREO_DEMO_USERNAME=demo` repository variables.
2. `VIREO_DEMO_PASSWORD` as an Actions secret.
3. An hourly **Flagship demo** workflow that checks both health boundaries and the
   authenticated read-only journey.
4. A persistent host timer that resets the isolated volume every 24 hours.
5. The host's atomic `operations/deployment-state.json` release record and the
   reset/watchdog service journals (`journalctl -u vireo-flagship-demo-reset.service`
   and `journalctl -u vireo-flagship-demo-watchdog.service`).

Set repository variable `VIREO_DEMO_REQUIRE_DEPLOYMENT_PROOF=true` immediately
after the first accepted blue/green release. Before migration it remains unset so
the legacy port-3000 service can retain health and journey monitoring without being
asked for the new proof document. Release qualification is always strict.

The hourly journey verifies the public shell, authentication, live overview data,
navigation, and seeded inventory without modifying shared state. Maintainers own the
deployment on a best-effort basis. Report a reproducible outage through the
[Template bug form](https://github.com/vireocodedev/vireo-template/issues/new?template=bug_report.yml);
suspected vulnerabilities always use the private security-advisory path.
