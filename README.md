# Vireo Starter Template

A production-shaped React PWA and Spring Boot application for starting a Vireo product. It demonstrates an authenticated, localized, responsive CRUD workflow while keeping reusable contracts in [Vireo Starter](https://github.com/vireocodedev/starter) and product behavior in this repository.

This is a public `0.x` Template, not a production-readiness claim or generated
application. Clone it and replace the handwritten Item slice. Vireo provides
libraries and explicit integration seams; the application owns domain rules,
authorization policy, sensitive-data decisions, offline eligibility, and conflict
resolution. A full-stack entity generator does not yet exist.

## Evaluate before adopting

The first-success path is intentionally small: start both processes, sign in with the
development-only `demo` account, and complete one Item create/edit/filter/delete
cycle. That proves the published frontend packages, JVM modules, authentication,
database migration, query contract, and responsive UI are connected.

Choose this Template when you want ordinary React and Spring Boot application code
with reviewed integration boundaries. Do not choose it on the assumption that it is
a hosted platform, a finished production system, an automatic CRUD generator, or a
solution for arbitrary offline conflict resolution. Read the framework's
[evaluation and limitations](https://github.com/vireocodedev/starter/blob/main/docs/EVALUATION.md)
and [public API map](https://github.com/vireocodedev/starter/blob/main/docs/PUBLIC_API.md)
before committing to individual packages.

## Prerequisites

- Java 21 (Java 25 is exercised as a compatibility runtime)
- Node.js 24.15–24.x through Corepack npm 12.0.2; CI uses Node 24.18.1
- PostgreSQL 17 or 18 for a production-like local environment (H2 is also supported for quick development)
- Anonymous access to the public npm registry

The default H2 database needs no service or environment setup. Copy [`.env.example`](.env.example) to `.env` only when overriding it. Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` when the frontend defaults are not suitable.

The JVM libraries resolve anonymously from Maven Central, and the public frontend
packages resolve anonymously from npm. No package-registry credential is
required.

## Run the application

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The root workflow starts the Spring Boot API and React PWA together. A generated PostgreSQL project also starts its Compose database. Press Ctrl-C once to stop the application processes.

Open <http://localhost:3000>. API documentation is available at <http://localhost:8080/swagger-ui.html> only in the `dev` profile.

Sign in with `demo` / `demo123`, then create, edit, filter, and delete an Item. This
development account is test data, not an authentication pattern for deployment.

VS Code users can instead open the repository and launch **Full stack (published Starter)** from Run and Debug after installing dependencies. The committed launch configuration uses the same H2 development database and starts both application processes.

## Verify a change

```bash
./scripts/verify.sh
```

The authoritative local gate validates architecture, formatting, lint, TypeScript, unit/integration tests, Storybook, the production frontend bundle, browser smoke tests, and the JVM build. Individual frontend commands remain available from `frontend/package.json`.

Run `./scripts/verify-deployment.sh` for the disposable production-like Compose
check. It builds the independent frontend/backend images, starts PostgreSQL, and
verifies the PWA shell, API proxy, and backend readiness through the deployed network.

## Customize the template

Start with [`docs/customizing-the-template.md`](docs/customizing-the-template.md). Rename the product, replace the sample Item capability, configure real authentication/bootstrap behavior, and provide deployment secrets through the environment.

## Developer documentation

- [Getting started and configuration](docs/getting-started.md)
- [30-minute vertical slice](docs/tutorials/30-minute-vertical-slice.md)
- [Doctor diagnostics and remedies](docs/troubleshooting.md)
- [Customizing the template](docs/customizing-the-template.md)
- [Deployment](docs/deployment.md)
- [Starter compatibility and bundle policy](docs/starter-compatibility.md)
- [Platform support evidence](docs/platform-support-evidence.md)
- [Verification performance budget](docs/verification-performance.md)
- [Developing against local Starter libraries](docs/local-starter-development.md)
- [Entity query-filter standard](docs/entity-query-filters.md)
- [Frontend architecture contract](frontend/docs/architecture/README.md)
- [Command interface visual language](frontend/docs/VISUAL_LANGUAGE.md)
- [Loading-state and skeleton standard](frontend/docs/LOADING_STATES.md)
- [Loading-state and skeleton audit](frontend/docs/LOADING_STATE_AUDIT.md)
- [Vireo Starter documentation](https://vireocodedev.github.io/starter/docs/)
- [Vireo public API entry points](https://github.com/vireocodedev/starter/blob/main/docs/PUBLIC_API.md)
- [Canonical temporal values](https://github.com/vireocodedev/starter/blob/main/docs/TEMPORAL_VALUES.md)

## Community and project policy

- [Support and issue routing](SUPPORT.md)
- [Governance and decision authority](GOVERNANCE.md)
- [Compatibility and application upgrades](docs/starter-compatibility.md)
- [Contributing](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)
