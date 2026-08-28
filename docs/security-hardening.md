# Production security hardening

This checklist starts where the Template's safe defaults stop. Complete it against
the application's own data, roles, tenants, integrations, and deployment. See the
[threat model](security-threat-model.md) before changing a control.

## Before exposing an environment

- Use `SPRING_PROFILES_ACTIVE=prod`; prove the `dev` profile and sample accounts
  are absent.
- Terminate TLS at a trusted ingress and preserve `SESSION_COOKIE_SECURE=true`.
  Keep cookies `HttpOnly`, `SameSite=Lax`, path `/`, and cookie-only session
  tracking unless a documented cross-site design requires different controls.
- Configure only known trusted proxy hops. Never trust forwarded headers directly
  from the public internet.
- Store database, identity-provider, encryption, monitoring, and backup secrets in
  the platform secret store. Do not bake them into images, frontend variables, or
  repository files.
- Keep PostgreSQL and the backend private. Expose only the TLS frontend/ingress.
- Apply per-source and per-account login rate limits. Decide lockout, MFA, password
  recovery, concurrent-session, idle/absolute expiry, and termination semantics.
- Replace the demonstration user store when the product requires federation,
  recovery, identity assurance, MFA, or centralized lifecycle management.
- Inventory every endpoint and enforce domain/tenant authorization at the service
  boundary. Add negative tests for wrong role, wrong tenant, missing ownership,
  disabled account, and stale permission.
- Keep CSRF enabled for session-authenticated mutations. Review CORS independently;
  an allowed origin does not replace CSRF protection.
- Classify fields before enabling local persistence, exports, history, analytics,
  or support diagnostics. Define retention, deletion, redaction, and user-switch
  cleanup.

## Browser and content policy

The canonical Nginx deployment emits a same-origin CSP, denies framing, prevents
MIME sniffing, restricts referrer data, disables unused powerful features, and
isolates the top-level browsing context. If the application adds a third-party
origin, add only the narrow directive it requires and test the production response.
Do not replace the CSP with `*` or add `unsafe-eval`.

The default `style-src 'unsafe-inline'` is required by the current CSS-in-JS stack.
Treat removing it through a nonce/hash-compatible styling strategy as defense in
depth, not as an already-met guarantee.

## Data and database

- Give the runtime database role only the privileges it needs. Use a separately
  controlled role for administrative backup/restore operations where practical.
- Require encrypted connections outside a private single-host development setup.
- Run Flyway before accepting traffic; keep Hibernate at `validate` in production.
- Create encrypted, retained, monitored backups and exercise restore into an
  isolated database. A successful `pg_dump` is not recovery evidence until the
  restored application passes integrity and browser checks.
- Before a database or application upgrade, take a verified backup, read both
  release notes, rehearse the exact path, and define the point after which rollback
  means restoring data rather than starting old code against a new schema.

## Logs, metrics, and incidents

- Centralize structured logs over protected transport. Redact cookies,
  authorization/CSRF headers, passwords, datasource URLs, offline command bodies,
  personal data, and backup locations.
- Alert on readiness failure, authentication-failure spikes, authorization denials,
  elevated 5xx/latency, database saturation, migration failure, storage pressure,
  backup failure, and restore-test age.
- Restrict diagnostic endpoints and artifacts. A request/correlation identifier is
  safe to expose; a stack trace or secret is not.
- Follow the incident runbook, preserve evidence, rotate exposed credentials,
  invalidate affected sessions, and use the private vulnerability channel when the
  framework or Template may be affected.

## Release evidence

Run:

```bash
./scripts/verify.sh
POSTGRES_PASSWORD=local-only SESSION_COOKIE_SECURE=false ./scripts/verify-deployment.sh
```

Then review dependency alerts, CodeQL, secret scanning, SBOM/provenance, the manual
accessibility/device checklist, backup freshness, last restore rehearsal, and open
security findings. The local HTTP override above is only for the disposable Compose
smoke; never carry it into a public environment.
