# Getting started and configuration

## First run

Normal development consumes released `@vireocodedev/*` packages and the released JVM BOM. From the repository root:

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

Open <http://localhost:3000>, sign in with `demo` / `demo123`, then create, edit, filter, and delete an Item. That loop proves the npm packages and JVM modules work across the real HTTP boundary. The `dev` profile alone seeds the public demonstration credentials; never enable it in a public deployment.

The source Template uses H2 for a zero-service first run. `create-vireo` defaults generated applications to PostgreSQL and the root `dev` command starts its Compose service. Select H2 explicitly when creating a project if that is your intended local database.

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
| `VITE_APP_NAME`       | Browser build | `Vireo Starter`     |

Vite values are public build-time configuration. Do not put secrets in variables prefixed with `VITE_`.

## Package registry access

Frontend packages resolve anonymously from npm. The JVM BOM and modules resolve anonymously from Maven Central. No registry token, Actions grant, or Dependabot secret is required for consumption.

## Local Starter development

Use [local-starter-development.md](local-starter-development.md) only while changing Starter itself. Published mode must pass before a Template change is complete.
