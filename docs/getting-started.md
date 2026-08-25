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

## GitHub Actions package access

The verification and CodeQL workflows prefer the built-in `GITHUB_TOKEN`. Because the Vireo packages are private and are published by the separate `starter` repository, grant `vireocodedev/starter-template` **Read** access under each package's **Manage Actions access** setting. This preserves least privilege and avoids a long-lived personal token.

Grant access to the npm packages consumed by the frontend:

- `starter-history`
- `starter-infrastructure`
- `starter-localization`
- `starter-queryengine`
- `starter-shell`
- `starter-ui`

Grant the same repository access to the JVM packages consumed through Gradle:

- `com.vireocode.vireo-starter-auth`
- `com.vireocode.vireo-starter-bom`
- `com.vireocode.vireo-starter-core`
- `com.vireocode.vireo-starter-history`
- `com.vireocode.vireo-starter-queryengine`

If organization package settings cannot grant repository access, add a repository Actions secret named `VIREO_PACKAGES_TOKEN` containing a token with `read:packages` access. Both workflows use that secret when present and otherwise fall back to `GITHUB_TOKEN`.
| `VITE_API_BASE_URL`             | Browser build                | `/api`                                 |
| `VITE_APP_NAME`                 | Browser build                | `Vireo Starter`                        |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## Local Starter development

Use the opt-in workflow in [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a template change is considered complete.
