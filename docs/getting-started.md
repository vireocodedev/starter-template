# Getting started and configuration

## First run

Normal development consumes released `@vireocodedev/*` packages and the released JVM BOM. From the repository root:

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

Open <http://localhost:3000>, sign in with `demo` / `demo123`, then create, edit, filter, and delete an Item. That loop proves the npm packages and JVM modules work across the real HTTP boundary. The `dev` profile alone seeds the public demonstration credentials; never enable it in a public deployment.

The login screen neither pre-fills nor displays credentials by default. Set `VITE_SHOW_DEMO_CREDENTIALS=true` only for an explicitly reviewed local or disposable public-demo build; production builds must leave it false.

The source Template uses H2 for a zero-service first run. `create-vireo` defaults
generated applications to PostgreSQL and the root `dev` command starts its
Compose service. The launcher and Doctor share these database modes:

| `VIREO_DATABASE_MODE` | Behavior                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `h2`                  | Starts the application with a local file-backed H2 default.                                          |
| `compose`             | Starts the managed PostgreSQL service with the Docker Compose plugin or standalone `docker-compose`. |
| `external`            | Starts no database service and requires the caller's complete `SPRING_DATASOURCE_*` configuration.   |

When the variable is omitted, H2 project metadata selects `h2` and PostgreSQL
project metadata selects `compose` for backward compatibility. Export the mode
and datasource variables in your shell or put them in the root `.env` file.
Caller-provided datasource, Flyway, PostgreSQL role, database, and port values
always win over development defaults. Doctor reports only whether external
configuration is complete; it never prints its values.

Run the complete gate before merging:

```bash
corepack npm run verify
```

If a preflight fails, every stable diagnostic code has a remedy in [troubleshooting.md](troubleshooting.md). The VS Code **Full stack (published Starter)** launch compound remains available after setup.

## Configuration ownership

| Setting               | Owner         | Development default |
| --------------------- | ------------- | ------------------- |
| `SPRING_DATASOURCE_*` | JVM runtime   | Root workflow       |
| `VITE_API_BASE_URL`   | Browser build | `/api`              |
| Product identity      | `frontend/pwa-policy.mjs` | `Vireo Starter` |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## Package registry access

Frontend packages resolve anonymously from npm. The JVM BOM and modules resolve anonymously from Maven Central. No registry token, Actions grant, or Dependabot secret is required for consumption.

## Local Starter development

Use [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a Template change is complete.
