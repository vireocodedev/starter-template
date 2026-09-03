# Template release preparation

`release:prepare` is a maintainer-only, default-dry-run command for the next
Vireo Template release. It takes the planned Template and `create-vireo` version,
the exact public JVM version, and exactly these seven public npm coordinates:
history, infrastructure, localization, query, shell, sqlite, and ui.

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

This maintainer script, its tests, this runbook, and its artifact contract are
excluded from generated applications. The adjacent Vireo projection policy owns the
actual exclusion list; record that corresponding change before publishing a release
that relies on this workflow.
