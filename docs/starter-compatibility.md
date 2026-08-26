# Starter compatibility and bundle policy

The template's ordinary install, development, test, Storybook, and production-build commands consume released Vireo Starter packages from GitHub Packages. Local Starter source and distribution aliases are explicit development modes and must never become an implicit production dependency.

## Published package line

| Package                                | Supported line |
| -------------------------------------- | -------------- |
| `@vireocodedev/starter-ui`             | `^7.0.0`       |
| `@vireocodedev/starter-queryengine`    | `^5.0.0`       |
| `@vireocodedev/starter-shell`          | `^4.0.0`       |
| `@vireocodedev/starter-history`        | `^3.0.0`       |
| `@vireocodedev/starter-infrastructure` | `^3.0.0`       |
| `@vireocodedev/starter-localization`   | `^3.0.0`       |
| Vireo Starter JVM modules              | `0.2.x`        |

The lockfiles are the reproducibility boundary. Updating a supported package range still requires reviewing and committing the resulting lockfile changes and passing the authoritative verification command.

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
