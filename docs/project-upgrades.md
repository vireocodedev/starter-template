# Project upgrades

Vireo separates library/package upgrades from application-owned Template changes.
The `vireo upgrade` command migrates only the release-pair surfaces named in its
shipped policy. It never replaces domain code, configuration, handwritten Flyway
migrations, deployment files, or an adopted/ejected generated capability.

## Supported path

This Template revision is the target for `create-vireo` 0.3.0. The first supported
source pair is a project created by `create-vireo` 0.2.0 from its pinned Template
commit. Unknown commits, dependency edits, lockfile drift, duplicate migration
versions, and generated/wire-contract drift are refusals rather than guesses.

Start from a clean branch and create a recoverable database backup. Install or invoke
the target CLI version, then review the non-writing plan:

```bash
npx --yes --package=create-vireo@0.3.0 vireo upgrade --to 0.3.0 --dry-run
```

The plan distinguishes Vireo-managed edits from required application-owned work.
After reviewing the target Template diff and all affected changelogs, apply only the
managed migration:

```bash
npx --yes --package=create-vireo@0.3.0 vireo upgrade --to 0.3.0 \
  --apply --accept-application-owned
```

`--accept-application-owned` acknowledges that the CLI cannot decide how upstream
Template changes fit the application's domain and deployment. It does not claim
those changes were merged. Review and port the source-to-target Template diff,
including security, operations, frontend, backend, schema, and deployment changes.

Then refresh dependencies if the printed plan requires it, run `corepack npm run
setup`, `corepack npm run generate:check`, `./scripts/verify.sh`, the deployment
smoke, and the application-owned database/deployment rehearsal. Commit the migration,
lockfiles, and consciously selected Template changes together or in an explicitly
ordered series.

## Rollback

Before production, rollback is the VCS reversal of the reviewed upgrade commits plus
restoration of the prior lockfiles and application artifact. A database migration
must be forward-compatible with that prior artifact or have its own tested recovery
plan. After new-version writes, do not route an older binary to the database unless
that mixed state was explicitly supported and rehearsed. Follow the
[database recovery guide](database-recovery.md) for data rollback boundaries.

The CLI's compatibility result is evidence about its declared release pair, not a
production approval for application-owned code or data.

