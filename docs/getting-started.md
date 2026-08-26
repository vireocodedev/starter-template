# Getting started and configuration

## Published Starter mode

Normal development consumes released `@vireocodedev/starter-*` packages and the released JVM BOM. This is the same dependency boundary used by production builds.

1. Create a GitHub token with `read:packages`.
2. Export `GITHUB_ACTOR`, `GITHUB_TOKEN`, and `NODE_AUTH_TOKEN`.
3. Copy `.env.example` to `.env` and choose H2 or PostgreSQL.
4. Run `corepack npm ci` in `frontend`.
5. Start `./gradlew bootRun` and `corepack npm run dev` in separate terminals.

The repository also commits a VS Code **Full stack (published Starter)** launch compound. It compiles JVM classes through Gradle so generated MapStruct implementations are present, launches Spring Boot with the `dev` profile and H2 configuration, and starts the published-package frontend. Run `corepack npm ci` in `frontend` before using it.

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

## GitHub Actions package access

The npm registry supports granular package access. Grant `vireocodedev/starter-template` **Read** access under each npm package's **Manage Actions access** setting so ordinary workflow runs can install frontend dependencies with the built-in `GITHUB_TOKEN`:

Grant access to the npm packages consumed by the frontend:

- `starter-history`
- `starter-infrastructure`
- `starter-localization`
- `starter-queryengine`
- `starter-shell`
- `starter-ui`

GitHub's Maven/Gradle registry is different: its packages are repository-scoped and do not expose the same cross-repository Actions-access grant. The template therefore needs a classic personal access token whose owner can read `vireocodedev/starter` and whose token has `read:packages` access.

Store that token under the same name in both places:

1. **Settings → Secrets and variables → Actions → New repository secret**: `VIREO_PACKAGES_TOKEN`.
2. **Settings → Secrets and variables → Dependabot → New repository secret**: `VIREO_PACKAGES_TOKEN`.

The second copy is required because workflows triggered by Dependabot cannot read ordinary Actions secrets. Never commit the token or expose it through a `VITE_*` variable.

The token resolves these JVM packages through Gradle:

- `com.vireocode.vireo-starter-auth`
- `com.vireocode.vireo-starter-bom`
- `com.vireocode.vireo-starter-core`
- `com.vireocode.vireo-starter-history`
- `com.vireocode.vireo-starter-queryengine`

The verification and CodeQL workflows fail fast with a targeted configuration error when this token is missing, instead of reporting the private JVM artifacts as nonexistent.

## Local Starter development

Use the opt-in workflow in [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a template change is considered complete.
