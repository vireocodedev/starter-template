# Operations and observability baseline

This is the minimum operating contract supplied by the Template. A deployed
application must connect it to its own telemetry, paging, capacity, privacy, and
retention systems.

## Health and lifecycle

- Use `/actuator/health/liveness` only to decide whether the process should restart.
- Use `/actuator/health/readiness` to decide whether it should receive traffic.
- Expose these endpoints only inside the required health-check network. Health
  details are hidden by default; do not publish additional Actuator endpoints
  without authentication, authorization, and data review.
- The server uses graceful shutdown with a 30-second phase timeout. The platform's
  termination grace period must exceed that interval, and traffic removal must
  happen before process termination.
- A readiness failure during startup is a failed release. Repeated liveness failure
  is an incident, not a reason to create an unbounded restart loop.

## Correlation and logs

Every HTTP response includes `X-Request-Id`. A safe incoming identifier is preserved;
otherwise the backend generates one. The same value appears as `requestId` in log
context and is cleared after the request. Include it in edge, frontend-error, job,
and downstream records where possible so one request can be traced without storing
request bodies.

Keep production logs structured at the collection boundary and include timestamp,
severity, service/revision, environment, request ID, route template, status, and
duration. Never log cookies, authorization/CSRF headers, passwords, datasource URLs,
backup contents, offline payloads, or personal/domain data by default. Apply access
controls and a documented retention period, then test deletion and redaction.

## Signals and alerts

Connect a metrics/tracing backend appropriate to the deployment. At minimum observe:

- request rate, latency percentiles, and 4xx/5xx rates by route template;
- readiness/liveness state, restarts, JVM heap/GC/thread pressure, and CPU/memory;
- datasource pool active/pending connections, acquisition time, and exhaustion;
- PostgreSQL connections, locks, slow queries, disk/free space, replication/backup
  age where applicable, and Flyway failures;
- login failures, authorization denials, CSRF failures, and unusual request volume;
- frontend error rate, asset/service-worker failures, and offline replay failures.

Page on symptoms that threaten users or data: sustained readiness loss, elevated
5xx/latency, pool exhaustion, database unavailability/disk pressure, failed backup
or restore rehearsal, and security-signal spikes. Ticket non-urgent trends. Tune
thresholds from normal traffic and require a runbook, owner, and deduplication for
every page; the Template intentionally does not invent universal numeric limits.

## Release and routine checks

Before deployment, run `./scripts/verify.sh` and the production-like deployment
smoke. Confirm configuration/secrets, schema compatibility, backup recency, rollback
boundary, dashboards, and the on-call owner. After deployment, verify readiness,
login, one authorized API path, request-ID correlation, error/latency signals, and
that the previous revision remains recoverable for the agreed window.

Exercise [database recovery](database-recovery.md) and the
[incident-response procedure](incident-response.md) on a schedule. Record the date,
revision, operators, timings, failures, corrective actions, and next due date.
