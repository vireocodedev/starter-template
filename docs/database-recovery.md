# Database backup, restore, and major upgrades

The application owns its database recovery plan. The repository supplies guarded
logical-backup helpers and a disposable PostgreSQL 17-to-18 rehearsal; an operator
must still validate storage, encryption, access, retention, timing, and recovery
objectives in each real environment.

## Create and verify a logical backup

With the canonical Compose PostgreSQL service running:

```bash
./scripts/db-backup.sh
# or choose a new path
./scripts/db-backup.sh backups/before-release.dump
```

The helpers resolve the effective `POSTGRES_DB` and `POSTGRES_OWNER_USER` from an
explicit `VIREO_DATABASE_ENV_FILE`, then `VIREO_DEMO_ENV_FILE`, then the canonical
repository `.env`; they parse that file as Compose assignments and never source it.
They pass the selected file to Compose as `--env-file`, so the helper and Compose
resolve the same deployment contract. Without a selected file, the helpers retain
the canonical `starter_template` defaults; supply an environment file for any
deployment using different database or owner names.

The helper creates a custom-format `pg_dump`, uses owner/ACL-independent output,
restricts the file to the current user, and refuses to overwrite an existing path.
Copy the result to access-controlled, encrypted storage outside the deployment's
failure domain. Record its checksum, PostgreSQL source version, application
revision, migration state, creation time, and retention date. Never place a real
backup in Git or CI artifacts.

A backup is not accepted merely because `pg_dump` exited successfully. Restore it
to an isolated database, start the intended application revision against that
database, check readiness, and verify representative domain and authentication data.

## Restore without overwriting the source

The helper deliberately accepts only a **new** database name:

```bash
./scripts/db-restore.sh backups/before-release.dump starter_template_restore_20260828
```

It refuses the configured source database, PostgreSQL system databases, and any
database that already exists. A failed restore removes only the new database it
created. After success:

1. Point a non-public application instance at the restored database.
2. Confirm `/actuator/health/readiness` is `UP` and inspect startup/Flyway logs.
3. Verify high-value counts, recent records, relationships, identities/sequences,
   authentication, and one reversible write/read cycle.
4. Keep the original service and database unchanged until acceptance is recorded.
5. Switch traffic using the deployment platform's reviewed cutover procedure.

## PostgreSQL major-version upgrade

Never mount an older major version's data directory into a newer server. Use a
PostgreSQL-supported logical dump/restore or a separately rehearsed `pg_upgrade`
procedure. The repository's conservative reference path is:

1. Review the PostgreSQL release and upgrade notes plus extension compatibility.
2. Confirm free space, maintenance window, backup retention, rollback owner, and
   the application/database deployment order.
3. Take a logical backup with the **target/newer** PostgreSQL client tools.
4. Restore into a new target-version cluster; do not mutate the source cluster.
5. Start the intended production-profile JAR, let Flyway validate/apply migrations,
   and run the restore acceptance checks above.
6. Cut over traffic, observe errors/latency/pool saturation, and retain the source
   cluster read-only until the rollback window closes.

Run the repository proof with Docker:

```bash
./scripts/verify-database-recovery.sh
```

It creates disposable PostgreSQL 17 and 18 containers, seeds the real application
on 17, backs up with 18 client tools, restores on 18, compares domain/user/migration
counts and a marker record, then starts the production profile and requires
readiness. CI records this evidence on the support schedule.

## Rollback boundary

Before cutover, rollback means routing to the untouched old application and source
database. After writes reach the new database, routing back can lose or fork data;
use an explicitly designed reverse-migration or restore/cut-forward plan. Never
silently run an older binary against a schema unless that exact mixed-version state
was declared compatible and rehearsed. Preserve logs, timestamps, checksums, and
operator decisions for the incident record.

Primary PostgreSQL references: [SQL dump and restore](https://www.postgresql.org/docs/17/backup-dump.html)
and [upgrading a PostgreSQL cluster](https://www.postgresql.org/docs/17/upgrading.html).
