# Template release preparation

`release:prepare` is a maintainer-only, default-dry-run command for the next
Vireo Template release. It takes the planned Template and `create-vireo` version,
the exact public JVM version, and exactly these seven public npm coordinates:
history, infrastructure, localization, query, shell, sqlite, and ui.

## Hosted preparation PR

After the seven npm libraries and JVM modules are publicly available, dispatch
**Prepare Template release** from this repository's `main` branch. Supply the
planned matching Template/CLI version, the JVM version, and exactly these seven
npm package versions as one JSON object:

```json
{
  "@vireocodedev/history": "0.2.3",
  "@vireocodedev/infrastructure": "0.2.3",
  "@vireocodedev/localization": "0.2.3",
  "@vireocodedev/query": "0.2.3",
  "@vireocodedev/shell": "0.2.3",
  "@vireocodedev/sqlite": "0.2.4",
  "@vireocodedev/ui": "0.3.2"
}
```

The workflow checks out one exact `main` commit, invokes the same
`release:prepare --apply` public preflight, accepts only its fixed set of
release-owned file changes, and runs the complete hosted Template qualification
before it can access any write credential. It then refuses a moved `main`, creates
or reuses only `automation/template-release-X.Y.Z`, and opens one App-authored PR.
Retries succeed only when that PR's base, head commit/tree, marker, title/body, and
author exactly match the verified result. It never force-pushes, edits an existing
PR, or enables auto-merge.

One administrator setup is required before the first dispatch. Create a dedicated
GitHub App installed only on `vireocodedev/vireo-template`, with repository
**Contents: read/write** and **Pull requests: read/write** permissions. In the
`template-preparation` environment, set variable
`TEMPLATE_RELEASE_AUTOMATION_APP_ID` and secret
`TEMPLATE_RELEASE_AUTOMATION_APP_PRIVATE_KEY`; configure that environment from
the checked-in desired state to allow exactly `main`, no reviewers, no wait, and no
administrator bypass. The workflow mints a repository-scoped App token only in
its final PR-creation job; it does not use `GITHUB_TOKEN` or a personal token for
writes.

Also set the non-secret repository Actions variable
`TEMPLATE_RELEASE_AUTOMATION_APP_SLUG` to the App's bot slug (without `[bot]`).
The unprotected reconciler inspection uses it to reject a non-App-authored PR
before the protected job is eligible to mint a token; the protected job then
requires the minted token to report the same slug. Until this variable is set,
scheduled reconciliation is a successful no-op with an explicit configuration
notice; an invalid slug fails closed.

The scheduled **Reconcile Template preparation PRs** workflow and its manual
dispatch inspect only marked `automation/template-release-X.Y.Z` PRs. It never
uses persistent auto-merge. Its unprotected inspection first verifies the
configured non-secret App slug, then reconstructs the canonical public input and
independently re-runs `release:prepare --apply` in an isolated detached worktree
at the exact current `main` commit. The resulting temporary-index tree and the
fixed generated-path set are the only accepted expected output; PR artifact
metadata is never trusted as its own expected tree.

A non-draft candidate must remain one exact App-authored commit directly on
current `main`, with that independently regenerated tree, canonical input,
artifact evidence, changed paths, PR body/marker, required checks, and review
threads all intact. Only then does it mint the same scoped App token, immediately
repeat the inspection with GitHub's read-only workflow token and the independently
computed tree, and make one expected-head SHA REST squash-merge request with the
App token. The merge response must explicitly report `merged: true`.
Pending checks, a stale or newly moved base, or unresolved threads are successful
no-ops left for the next run; malformed or modified automation output fails closed.

```bash
corepack npm run release:prepare -- \
  --template-version 0.8.8 \
  --create-vireo-version 0.8.8 \
  --jvm-version 0.3.2 \
  --npm @vireocodedev/history@0.2.3 \
  --npm @vireocodedev/infrastructure@0.2.3 \
  --npm @vireocodedev/localization@0.2.3 \
  --npm @vireocodedev/query@0.2.3 \
  --npm @vireocodedev/shell@0.2.3 \
  --npm @vireocodedev/sqlite@0.2.4 \
  --npm @vireocodedev/ui@0.3.2 \
  --json
```

For hosted-style input, the same command also accepts `--npm-json` instead of the
seven repeated `--npm` arguments. The JSON object must contain exactly the same
seven package names and strict public versions.

The normal command is non-writing. It anonymously queries only
`registry.npmjs.org` and Maven Central's canonical repository, refuses redirects,
bounds retries, response sizes, and request time, and records canonical npm tarball,
integrity, attestation metadata, Maven POM checksum, and detached-signature evidence.
It never sends npm, GitHub, or Maven credentials. `--help` documents the interface
and `--no-preflight` is limited to deterministic offline planning/tests; it cannot
be combined with `--apply`.

For the exact seven package versions, preparation also builds an isolated,
authentication-free temporary consumer, installs the exact coordinates with lifecycle
scripts disabled, and runs `npm@12.0.2 audit signatures --include-attestations --json`.
The resulting attestation-audit
output must contain exactly one nonempty `attestationBundles` record for each exact
package/version; a canonical digest of that package's own bundle array is bound to
its coordinate. An attestation URL alone is not sufficient.

Each Maven POM detached signature is cryptographically checked with the checked-in
[`vireo-release-signing-key.asc`](../contracts/vireo-release-signing-key.asc) and
its pinned fingerprint `C8C362C561046CD11C0F0DE01174796DD298F009`; a changed
key or an unverifiable signature fails preparation.

After reviewing the JSON plan, rerun the same command with `--apply`. Apply refuses
a dirty worktree, regenerates `frontend/package-lock.json` in an isolated temporary
copy with a minimal allowlisted, authentication-free npm environment and temporary
cache, then writes the coordinate files transactionally. Focused release and
compatibility policy checks run after the write; any failure restores every touched
file. It updates generic current/supported project-upgrade metadata and commands.
Only behavioural migration semantics remain application/product decisions.

The resulting `contracts/template-release-artifacts.json` makes the next release
manifest schema 2 bind all seven npm coordinates/tarballs/integrities/attestation
metadata, the canonical `com.vireocode` Maven group and six Maven modules with POM
and signature digests, eight release-owned file digests (including `gradle.properties`), and a recomputed canonical
coordinate digest. Existing schema 1 manifests remain valid historical evidence.

## Durable release reconciliation

Creating the protected annotated `starter-template@X.Y.Z` tag is the durable
release boundary. Before that tag is created, the push workflow refuses a policy
superseded on `main`; after it exists, recovery reads the policy and artifact binding
from that exact tag and never lets a newer `main` policy strand the tagged release.
The normal release, scheduled scanner, and manual **reconcile** dispatch recover an
absent or matching draft Release by requalifying the tagged tree, regenerating its
manifest, publishing with `latest=false`, and then selecting the greatest immutable
non-prerelease Template semver as GitHub's latest release. Repeated scans are no-ops;
tag/release/manifest mismatches fail closed. The scanner reads with no write
permission; its protected final reconciliation runs in the `template-release`
environment because it changes the GitHub `latest` pointer only after every
exact-tag conclusion. That final step compares the newest eligible `0.8.8+`
release's exact tag commit with the public deployment proof and dispatches only
that tag when the proof is missing or differs. Automated durable recovery begins at
`starter-template@0.8.8`, the first release containing this automation. Releases
`0.7.0` through `0.8.7` remain already-published legacy artifacts and are not
checked out by this newer recovery tooling; `starter-template@0.6.0` remains a
separately selected, deliberately bounded historical path.

The scanner supplies eligible tags to the local **Recover durable Template release**
reusable workflow as a sequential matrix and waits for every exact-tag conclusion;
a failed tagged validation fails the parent scan. To run this recovery manually,
dispatch the parent **Template release** workflow with `reconcile=true`; that keeps
the exact-tag recovery, latest reconciliation, proof comparison, and flagship
dispatch in one convergent transaction. The reusable workflow is callable only by
that parent and enforces the shared `0.8.8+` stable predicate before it runs any
tagged-tree release script.

This maintainer script, its tests, this runbook, and its artifact contract are
excluded from generated applications. The adjacent Vireo projection policy owns the
actual exclusion list; record that corresponding change before publishing a release
that relies on this workflow.
