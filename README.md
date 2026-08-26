# Vireo Starter Template

A production-shaped React PWA and Spring Boot application for starting a Vireo product. It demonstrates an authenticated, localized, responsive CRUD workflow while keeping reusable contracts in [Vireo Starter](https://github.com/vireocodedev/starter) and product behavior in this repository.

## Prerequisites

- Java 21 (Java 25 is exercised as a compatibility runtime)
- Node.js 24.15–24.x through Corepack npm 12.0.2; CI uses Node 24.18.1
- PostgreSQL 16 or newer for a production-like local environment (H2 is also supported for quick development)
- GitHub Packages read access for the published Vireo Starter artifacts

Copy [`.env.example`](.env.example) to `.env` and export the values before running Gradle. Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` when the frontend defaults are not suitable.

GitHub Packages requires a token with `read:packages` in `GITHUB_TOKEN` (JVM) and `NODE_AUTH_TOKEN` (npm). The token is only consumed by the package clients and must never be committed. For CI, configure a classic personal access token as `VIREO_PACKAGES_TOKEN` in both the repository's Actions secrets and Dependabot secrets. The separate token is required because GitHub's Maven/Gradle registry is repository-scoped, so this repository's built-in `GITHUB_TOKEN` cannot download the private JVM artifacts published by `vireocodedev/starter`.

## Run the application

```bash
# Terminal 1: Spring Boot API (dev profile seeds demo/demo123 and admin/admin123)
set -a && source .env && set +a
./gradlew bootRun

# Terminal 2: React PWA
cd frontend
corepack npm ci
corepack npm run dev
```

Open <http://localhost:3000>. API documentation is available at <http://localhost:8080/swagger-ui.html> only in the `dev` profile.

VS Code users can instead open the repository and launch **Full stack (published Starter)** from Run and Debug after installing dependencies. The committed launch configuration uses the same H2 development database and starts both application processes.

## Verify a change

```bash
./scripts/verify.sh
```

The authoritative local gate validates architecture, formatting, lint, TypeScript, unit/integration tests, Storybook, the production frontend bundle, browser smoke tests, and the JVM build. Individual frontend commands remain available from `frontend/package.json`.

## Customize the template

Start with [`docs/customizing-the-template.md`](docs/customizing-the-template.md). Rename the product, replace the sample Item capability, remove Dev tools before production, configure real authentication/bootstrap behavior, and provide deployment secrets through the environment.

## Developer documentation

- [Getting started and configuration](docs/getting-started.md)
- [Customizing the template](docs/customizing-the-template.md)
- [Deployment](docs/deployment.md)
- [Starter compatibility and bundle policy](docs/starter-compatibility.md)
- [Platform support evidence](docs/platform-support-evidence.md)
- [Developing against local Starter libraries](docs/local-starter-development.md)
- [Entity query-filter standard](docs/entity-query-filters.md)
- [Frontend architecture contract](frontend/docs/architecture/README.md)
- [Command interface visual language](frontend/docs/VISUAL_LANGUAGE.md)
- [Loading-state and skeleton standard](frontend/docs/LOADING_STATES.md)
- [Loading-state and skeleton audit](frontend/docs/LOADING_STATE_AUDIT.md)
- [Vireo Starter documentation](https://vireocodedev.github.io/starter/?path=/docs/documentation-overview--docs)
