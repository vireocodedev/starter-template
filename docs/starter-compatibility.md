# Starter compatibility, upgrades, and bundle policy

The template's ordinary install, development, test, Storybook, and production-build commands consume released Vireo Starter packages from their public registries. Local Starter source and distribution aliases are explicit development modes and must never become an implicit production dependency.

## Published package line

| Package                        | Supported line |
| ------------------------------ | -------------- |
| `@vireocodedev/ui`             | `^0.2.1`       |
| `@vireocodedev/query`          | `^0.2.1`       |
| `@vireocodedev/shell`          | `^0.2.1`       |
| `@vireocodedev/history`        | `^0.2.1`       |
| `@vireocodedev/infrastructure` | `^0.2.1`       |
| `@vireocodedev/localization`   | `^0.2.1`       |
| Vireo Starter JVM modules      | `0.2.0`        |

The lockfiles are the reproducibility boundary. Updating a supported package range still requires reviewing and committing the resulting lockfile changes and passing the authoritative verification command.

The npm and JVM version numbers are independent and do not need to match. This
repository revision, its declared ranges, `starterVersion`, and committed lockfiles
form the compatibility manifest for the exact combination demonstrated here. The
upstream [Vireo compatibility policy](https://github.com/vireocodedev/starter/blob/main/docs/COMPATIBILITY.md)
defines artifact SemVer, public-contract boundaries, deprecation windows, and
release-line support.

Only the latest Template release and `main` receive fixes and security updates.
Older tags remain reference points, but no backports are promised. A dependency
range permits compatible releases under SemVer; it does not claim that every
possible transitive combination has been tested.

## Application upgrade contract

A cloned application is not kept current automatically. `vireo upgrade` provides a
version-aware migration only for explicitly supported release-pair surfaces; the
Template's file layout is not a stable library API. Application owners selectively
merge or port upstream changes and remain responsible for domain code, database
migrations, configuration, generated code, and deployment order. See the
[project-upgrade contract](project-upgrades.md).

For an upgrade:

1. Run the target CLI's upgrade dry run and resolve every refusal.
2. Compare the current Template revision with the intended tag or commit.
3. Read affected Vireo changelogs and upstream migration or deprecation notes.
4. Update npm ranges, `starterVersion`, and both lockfiles deliberately.
5. Apply application-owned configuration, schema, data, or source migrations.
6. Run `./scripts/verify.sh`, then verify the deployment and rollback sequence in an
   application-owned environment.

A cross-stack change that cannot tolerate mixed frontend/backend versions requires
an explicit deployment order. Do not infer wire, schema, or generated-code
compatibility merely because both halves build independently.

Toolchain and workflow policy are checked inside the authoritative frontend gate.
Recurring Java, browser, and PostgreSQL compatibility evidence is described in
[Platform support evidence](platform-support-evidence.md).

## Local Starter development

Use `corepack npm run dev:local-starter` only when changing Starter and this template together. Use `corepack npm run dev` to prove the published-consumer experience. See [Developing against local Starter libraries](local-starter-development.md) for the complete mode matrix.

`corepack npm run starter:boundary:check` prevents published commands and TypeScript configuration from silently depending on a sibling Starter checkout.

## Bundle budgets

Every production application build enforces two raw JavaScript budgets:

| Measurement              |    Budget |
| ------------------------ | --------: |
| Largest emitted chunk    |   700 KiB |
| Total emitted JavaScript | 2,400 KiB |

These are regression tripwires, not performance targets. If a real feature requires increasing a budget, document the reason and review the loading behavior before changing it. Prefer route-level loading and dependency reduction over merely increasing a limit.
