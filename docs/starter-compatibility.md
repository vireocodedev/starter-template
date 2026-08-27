# Starter compatibility and bundle policy

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
