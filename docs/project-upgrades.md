# Project upgrades

Vireo separates library/package upgrades from application-owned Template changes.
The `vireo upgrade` command migrates only the release-pair surfaces named in its
shipped policy. It never replaces domain code, configuration, handwritten Flyway
migrations, deployment files, or an adopted/ejected generated capability.

## Supported path

The public graph retains the historical 0.2.0-to-0.3.0, 0.6.0-to-0.7.0,
0.7.0-to-0.8.0, 0.8.0-to-0.8.1, 0.8.1-to-0.8.2, and 0.8.2-to-0.8.3 transforms
and historical 0.8.3-to-0.8.4 transform, then declares the supported
0.8.4-to-0.8.5 adjacent edge. Releases 0.4 and 0.5 are historical/EOL: they
are not retroactively admitted as upgrade sources. The 0.8.5 release is terminal
until a later release declares its own adjacent edge.

Start with a read-only inventory. It reports the recorded CLI and Template revision,
the next declared hop, managed-file drift, pending application-owned work, and
generated capabilities that remain managed or have been ejected:

```bash
npx --yes --package=create-vireo@0.8.5 vireo status --project .
```

For a 0.8.4-created application, use the target CLI and review the non-writing plan:

```bash
npx --yes --package=create-vireo@0.8.5 vireo upgrade --to 0.8.5 --dry-run
```

The CLI updates only the declared managed edge. It refuses unknown Template commits
and managed-file customizations, preserves application-owned files and ejected
generated capabilities, and never fabricates resolved package-lock entries.
Refresh the real lockfile only when the accepted plan changes package declarations
or explicitly requires a lockfile update. For those dependency-changing edges, use
`corepack npm install --package-lock-only --prefix frontend` for full-stack
applications, or `corepack npm install --package-lock-only` at a frontend-only
project root, before verification.

Start from a clean branch and create a recoverable database backup. Install or invoke
the target CLI version, then review the non-writing plan:

```bash
npx --yes --package=create-vireo@0.8.5 vireo upgrade --to 0.8.5 --dry-run
```

The plan distinguishes Vireo-managed edits from required application-owned work.
After reviewing the target Template diff and all affected changelogs, apply only the
managed migration:

```bash
npx --yes --package=create-vireo@0.8.5 vireo upgrade --to 0.8.5 \
  --apply --accept-application-owned
```

`--accept-application-owned` acknowledges that the CLI cannot decide how upstream
Template changes fit the application's domain and deployment. It does not claim
those changes were merged or completed. A managed apply can therefore leave the
application unable to compile until the pending actions below have been completed.
Review and port the source-to-target Template diff, including security, operations,
frontend, backend, schema, and deployment changes.

## Managed 0.8.4 to 0.8.5 migration

This edge transactionally migrates managed `.vireo/example-manifest.json`
provenance and its target Template commit alongside the recorded managed upgrade.
It refuses malformed or customized managed provenance rather than overwriting it.
For a pristine 0.8.4 full-stack
`frontend/tests/e2e/overview.spec.ts`, the transaction adds that exact file digest
to the example manifest. This records the optional sample for later safe
`remove-example` removal. The migration compares the file to the exact pristine
0.8.4 digest and refuses the entire managed upgrade on mismatch or customized bytes;
intentionally restore or adapt the Overview spec before retrying. The sample is not
projected into frontend-only applications.

- No dependency, JVM, schema, Flyway, or lockfile change is required to accept
  this edge. Do not change package versions, database migrations, or lockfiles
  solely for 0.8.5.
- Review the non-writing plan before applying it. The provenance update and Template
  commit migration are one managed transaction, so an interrupted apply recovers
  rather than leaving a partially updated ownership record.
- The Overview spec is a full-stack optional sample. A pristine existing 0.8.4
  sample gains managed provenance for later removal. A mismatched or customized
  sample refuses the entire managed upgrade until the consumer intentionally restores
  or adapts it before retrying. Frontend-only projects do not receive that sample.
- Application test configuration, CI policy, deployment verification, and other
  optional Template changes remain application-owned decisions. Run only the checks
  appropriate to the changes the application chooses to adopt.
- When reviewing those optional changes, include the root `AGENTS.md` and the
  existing managed projected consumer-skill guidance; neither is changed by the
  managed 0.8.4-to-0.8.5 transaction itself.

## Historical application-owned 0.2.0 to 0.3.0 checklist

Complete each item in the application that is being upgraded. These are intentionally
not automated: they require a decision about the application's routes, language
catalogues, component composition, and visual identity.

### `navigation-landmark-and-links`

- Update each `AppShellLayout` use to pass the 0.3 navigation contract.
- In both `en` and `hr`, provide a `navigation.PRIMARY` string appropriate to the
  application's primary navigation and pass its translated value as the
  `navigationLabel` prop.
- Replace placeholder navigation destinations with real `href` values. If a route is
  handled by client-side navigation, keep the real `href` for native link behaviour
  and use `preventDefault` before invoking the application's navigation handler.

### `responsive-table-live-announcements`

- Update every `AppPageItems` use for the 0.3 responsive-table contract.
- Add localized `loadingNextPage` and `loadedNextPage` strings to both the `en` and
  `hr` catalogues. They must describe the page-load state without relying on visual
  table changes alone.

### `accessible-name-contracts`

- Resolve every overlay and frame call site reported by the compiler after upgrading
  `@vireocodedev/ui`.
- Provide a localized `aria-label`, or connect each surface to visible localized
  text with `aria-labelledby`, according to that surface's API.
- Do not rely on a library default name: the application owns names that distinguish
  its dialogs, drawers, frames, and other overlays.

### `surface-palette-ownership`

- Remove any conflicting application `Palette.surface` definition.
- Adopt the UI 0.3 surface contract for canvas and overlay surfaces. Where the
  application's intended palette differs, use the target Template's `appSurface`
  pattern instead of overriding UI-owned surface tokens.
- Review default, elevated, and overlay states in both colour schemes so text,
  separators, focus rings, and scrims retain their intended contrast.

### `full-frontend-verification`

- Refresh the frontend lockfile after the dependency updates in the accepted plan.
- Run the frontend typecheck, then the complete application verification suite.
- Resolve the contract errors above before treating the upgrade as complete; a
  successful managed apply is not a substitute for this verification.

## Historical 0.2.0→0.3.0 minimal and full Template migrations

A historical minimal migration accepts only the CLI-managed release-pair edits, completes the
checklist above, and preserves unrelated application customisations. It is suitable
when the project has intentionally diverged from the Template and the team has
reviewed the corresponding compatibility impact.

A historical full Template migration additionally ports the reviewed 0.2.0-to-0.3.0 Template
diff across the application's chosen frontend, backend, database, operational, and
deployment surfaces. Use it when the project remains close to the Template or when a
target change is needed for security, operational, or product consistency. In either
case, review the resulting diff, rehearse deployment and data recovery, and retain a
rollback path before production.

For the current 0.8.4→0.8.5 edge, use the managed migration guidance above. Its
transactional provenance/commit update does not imply a dependency, JVM, schema,
Flyway, or lockfile migration. Port application-owned test or CI changes only after
review, then run the checks appropriate to those chosen changes.

For the historical checklist, refresh dependencies if the printed plan requires it, run `corepack npm run
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
