# Hosted-demo maintainer recovery rehearsal — 2026-09-01

Status: **maintainer rehearsal passed; independent witness not present**.

This sanitized record covers `synthetic-hosted-demo-maintainer-rehearsal` from
2026-08-31T23:11:06Z through 2026-08-31T23:11:28Z on revision
`a24f9435d3f624fb1962c3d5c4e3457b69f5be28`. It exercises a loopback-only recovery
target and does not establish public uptime, disaster-recovery durability, or the
required independent-witness result.

| Check | Result |
| --- | --- |
| Backup | Guarded logical backup completed in 1 s: 25,048 bytes, mode `0600`, SHA-256 `ed671e99c90f6c8b29c28e1f18e7ce0d0f07e7ac7450e44d1589b8a6932b2a86`; `pg_restore --list` verified it |
| Restore | Restored to a separate temporary database and verified through the application in 11 s; backup age at verification was 11 s |
| Data acceptance | Both source and target contained 8 Items, 1 user, and 4 Flyway migrations |
| Application acceptance | Readiness, demo login, and authenticated Item search passed against the restored target |
| Incident | A synthetic loopback-only recovery app was removed to simulate SEV-3; detection occurred; the reviewed immutable image was recreated against the restored database; readiness/login/search passed after 10 s; no public traffic was involved |
| Cleanup | Temporary recovery app/database count was 0; public readiness remained UP; failed-attempt backups were removed |

The successful backup and JSON evidence are retained with mode `0600` at
`/opt/apps/vireo-flagship-demo/operations/evidence/recovery-20260831T231106Z.{dump,json}`.
They are same-host evidence, not an independent failure-domain copy.

## Counterevidence and recovery preference

An earlier mutable-container restart-only attempt did not regain readiness within
the verifier window. Treat that as counterevidence: for an unavailable recovery app,
prefer recreating the reviewed immutable image against the accepted database or
using the reviewed rollback path. Do not rely on an unbounded restart loop.

`independentWitness` was `false`. A second trusted person must witness the
target-environment backup, restore, application acceptance, and incident outcome
before the public-beta recovery gate passes.
