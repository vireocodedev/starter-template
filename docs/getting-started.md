# Getting started and configuration

## Published Starter mode

Normal development consumes released `@vireocodedev/starter-*` packages and the released JVM BOM. This is the same dependency boundary used by production builds.

1. Configure `NODE_AUTH_TOKEN` for the published frontend packages.
2. Use the credential-free Maven Central defaults for the JVM libraries.
3. Copy `.env.example` to `.env` and choose H2 or PostgreSQL.
4. Run `corepack npm ci` in `frontend`.
5. Start `./gradlew bootRun` and `corepack npm run dev` in separate terminals.

The repository also commits a VS Code **Full stack (published Starter)** launch compound. It compiles JVM classes through Gradle so generated MapStruct implementations are present, launches Spring Boot with the `dev` profile and H2 configuration, and starts the published-package frontend. Run `corepack npm ci` in `frontend` before using it.

The `dev` Spring profile is the only profile that seeds the documented demo accounts. Never activate it in a public deployment.

## Configuration ownership

| Setting               | Owner                     | Default                               |
| --------------------- | ------------------------- | ------------------------------------- |
| `SPRING_DATASOURCE_*` | JVM runtime               | Required                              |
| `NODE_AUTH_TOKEN`     | npm dependency resolution | Required when packages are not cached |
| `VITE_API_BASE_URL`   | Browser build             | `/api`                                |
| `VITE_APP_NAME`       | Browser build             | `Vireo Starter`                       |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## GitHub Actions package access

The npm registry supports granular package access. Grant `vireocodedev/starter-template` **Read** access under each npm package's **Manage Actions access** setting so ordinary workflow runs can install frontend dependencies with the built-in `GITHUB_TOKEN`:

Grant access to the npm packages consumed by the frontend:

- `starter-history`
- `starter-infrastructure`
- `starter-localization`
- `starter-queryengine`
- `starter-shell`
- `starter-ui`

No Actions or Dependabot secret is needed for Gradle. Maven Central anonymously resolves:

- `com.vireocode:vireo-auth`
- `com.vireocode:vireo-bom`
- `com.vireocode:vireo-core`
- `com.vireocode:vireo-history`
- `com.vireocode:vireo-query`

If the frontend registry requires a separate token for Dependabot, store only that npm credential as `VIREO_PACKAGES_TOKEN` in Dependabot secrets. Never commit it or expose it through a `VITE_*` variable.

## Local Starter development

Use the opt-in workflow in [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a template change is considered complete.
