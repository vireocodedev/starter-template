# Getting started and configuration

## Published Starter mode

Normal development consumes released `@vireocodedev/*` packages and the
released JVM BOM. This is the same dependency boundary used by production
builds.

1. Use the credential-free npm and Maven Central defaults for the Vireo libraries.
2. Copy `.env.example` to `.env` and choose H2 or PostgreSQL.
3. Run `corepack npm ci` in `frontend`.
4. Start `./gradlew bootRun` and `corepack npm run dev` in separate terminals.

## First success

Open <http://localhost:3000> and sign in with `demo` / `demo123`. Create an Item,
edit it, apply a filter, and delete it. Completing that loop proves the application is
using the published Vireo npm packages and JVM modules across the real HTTP boundary.
The `dev` profile is the only profile that seeds these credentials; they must never
be enabled in a public deployment.

Then run the complete repository gate from the repository root:

```bash
./scripts/verify.sh
```

The clean hosted workflow executes the same gate and the production-like deployment
smoke every week as well as on every change to `main`.

The repository also commits a VS Code **Full stack (published Starter)** launch compound. It compiles JVM classes through Gradle so generated MapStruct implementations are present, launches Spring Boot with the `dev` profile and H2 configuration, and starts the published-package frontend. Run `corepack npm ci` in `frontend` before using it.

The `dev` Spring profile is the only profile that seeds the documented demo accounts. Never activate it in a public deployment.

## Configuration ownership

| Setting               | Owner         | Default         |
| --------------------- | ------------- | --------------- |
| `SPRING_DATASOURCE_*` | JVM runtime   | Required        |
| `VITE_API_BASE_URL`   | Browser build | `/api`          |
| `VITE_APP_NAME`       | Browser build | `Vireo Starter` |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## Temporal values

Keep calendar dates and local business times separate from event instants. Vireo
temporal fields use canonical timezone-free values such as `2026-08-25`, `14:30:00`,
and `2026-08-25T14:30:00`; audit/event instants use `Z` or an explicit offset. The
[temporal values contract](https://github.com/vireocodedev/starter/blob/main/docs/TEMPORAL_VALUES.md)
contains the tested matrix and application-ownership rules.

## Package registry access

The frontend packages are public on npm, so local development, CI, Dependabot,
and container builds install them anonymously. No npm access token or GitHub
Packages Actions grant is required.

No Actions or Dependabot secret is needed for Gradle. Maven Central anonymously resolves:

- `com.vireocode:vireo-auth`
- `com.vireocode:vireo-bom`
- `com.vireocode:vireo-core`
- `com.vireocode:vireo-history`
- `com.vireocode:vireo-query`

## Local Starter development

Use the opt-in workflow in [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a template change is considered complete.
