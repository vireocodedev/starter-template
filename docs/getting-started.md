# Getting started and configuration

## Published Starter mode

Normal development consumes released `@vireocodedev/starter-*` packages and the released JVM BOM. This is the same dependency boundary used by production builds.

1. Create a GitHub token with `read:packages`.
2. Export `GITHUB_ACTOR`, `GITHUB_TOKEN`, and `NODE_AUTH_TOKEN`.
3. Copy `.env.example` to `.env` and choose H2 or PostgreSQL.
4. Run `npm ci` in `frontend`.
5. Start `./gradlew bootRun` and `npm run dev` in separate terminals.

The repository also commits a VS Code **Full stack (published Starter)** launch compound. It compiles JVM classes through Gradle so generated MapStruct implementations are present, launches Spring Boot with the `dev` profile and H2 configuration, and starts the published-package frontend. Run `npm ci` in `frontend` before using it.

The `dev` Spring profile is the only profile that seeds the documented demo accounts. Never activate it in a public deployment.

## Configuration ownership

| Setting                         | Owner                        | Default                                |
| ------------------------------- | ---------------------------- | -------------------------------------- |
| `SPRING_DATASOURCE_*`           | JVM runtime                  | Required                               |
| `GITHUB_ACTOR` / `GITHUB_TOKEN` | Gradle dependency resolution | Required when artifacts are not cached |
| `NODE_AUTH_TOKEN`               | npm dependency resolution    | Required when packages are not cached  |
| `VITE_API_BASE_URL`             | Browser build                | `/api`                                 |
| `VITE_APP_NAME`                 | Browser build                | `Vireo Starter`                        |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## Local Starter development

Use the opt-in workflow in [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a template change is considered complete.
