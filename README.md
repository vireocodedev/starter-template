# Vireo Starter Template

A production-shaped React PWA and Spring Boot application for starting a Vireo product. It demonstrates an authenticated, localized, responsive CRUD workflow while keeping reusable contracts in [Vireo](https://github.com/vireocodedev/vireo) and product behavior in this repository.

This is a public `0.x` Template, not a production-readiness claim. Clone it, keep or
replace the handwritten Item slice, or generate an additional scalar/enum capability
from a versioned schema. Vireo provides libraries and explicit integration seams;
the application owns domain rules, authorization policy, sensitive-data decisions,
offline eligibility, and conflict resolution. The generator is publicly available in
the `create-vireo@0.8.6` release line, including frontend-only project and entity
generation for separately owned backend systems.

The canonical current [`starter-template@0.8.6` release contract](contracts/template-release-policy.json)
defines its tag, generator line, and immutable-release prerequisite. Its tag-triggered
workflow validates that exact tag before it can publish a release.

## Evaluate before adopting

Try the maintainer-operated read-only flagship at
<https://demo.vireocode.com> with `demo` / `demo123`. It contains disposable public
synthetic data, resets at least daily, and is offered on a best-effort basis with no
uptime SLA. Continue locally when you want to mutate the Item workflow or evaluate
the source and generator boundaries.

The first-success path is intentionally small: start both processes, sign in with the
development-only `demo` account, and complete one Item create/edit/filter/delete
cycle. That proves the published frontend packages, JVM modules, authentication,
database migration, query contract, and responsive UI are connected.

Choose this Template when you want ordinary React and Spring Boot application code
with reviewed integration boundaries. Do not choose it on the assumption that it is
a hosted platform, a finished production system, an automatic CRUD generator, or a
solution for arbitrary offline conflict resolution. Read the framework's canonical
[getting-started and ownership documentation](https://vireocode.com/docs/)
and [frontend/Spring package guides](https://vireocode.com/reference/)
before committing to individual packages.

## Prerequisites

The authoritative local `corepack npm run verify` promise is currently **Ubuntu 24.04
x86-64** with GNU time/coreutils. macOS, Windows/WSL2, other Linux releases, and
ARM64 may work for development but remain untested and are not release-evidence
hosts. `corepack npm run doctor` reports this boundary before saying the project is ready;
see [platform support evidence](docs/platform-support-evidence.md).

- Java 21 (Java 25 is exercised as a compatibility runtime)
- Node.js 24.15–24.x through Corepack npm 12.0.2; CI uses Node 24.18.1
- PostgreSQL 17 or 18 for a production-like local environment (H2 is also supported for quick development)
- Anonymous access to the public npm registry

The default H2 database needs no service or environment setup. The development
workflow also supports a managed Compose PostgreSQL service and an external
datasource. Copy [`.env.example`](.env.example) to `.env` only when overriding
the defaults; existing datasource credentials are preserved. Copy
[`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` when
the frontend defaults are not suitable.

The JVM libraries resolve anonymously from Maven Central, and the public frontend
packages resolve anonymously from npm. No package-registry credential is
required.

## Run the application

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The root workflow starts the Spring Boot API and React PWA together. A generated
PostgreSQL project defaults to managed Compose and accepts either the Docker
Compose plugin or standalone `docker-compose`. Set `VIREO_DATABASE_MODE` to
`h2`, `compose`, or `external` to choose explicitly. Press Ctrl-C once to stop
the application processes.

Open <http://localhost:3000>. API documentation is available at <http://localhost:8080/swagger-ui.html> only in the `dev` profile.

Sign in with `demo` / `demo123`, then create, edit, filter, and delete an Item. This
development account is test data, not an authentication pattern for deployment.

VS Code users can instead open the repository and launch **Full stack (published Starter)** from Run and Debug after installing dependencies. The committed launch configuration uses the same H2 development database and starts both application processes.

## Verify a change

```bash
./scripts/verify.sh
```

The authoritative local gate validates architecture, formatting, lint, TypeScript, unit/integration tests, Storybook, the production frontend bundle, browser smoke tests, and the JVM build. Individual frontend commands remain available from `frontend/package.json`.
The JVM integration suite also enforces the [semantic OpenAPI compatibility baseline](docs/api-compatibility.md) for paths, statuses, schemas, and security.
The JVM `check` gate enforces the reviewed [JaCoCo non-regression floors](docs/test-coverage-policy.md).

Run `./scripts/verify-deployment.sh` for the disposable production-like Compose
check. It builds the independent frontend/backend images, starts PostgreSQL, and
verifies a real browser login and persisted Item creation through the built Nginx,
backend, and PostgreSQL stack, in addition to the proxy, readiness, header, and
database-privilege contracts.

After evaluating the workflow, use the framework's structured [public-beta evaluation form](https://github.com/vireocodedev/vireo/issues/new?template=public_beta_feedback.yml) or [public Discussions](https://github.com/vireocodedev/vireo/discussions). If you control a non-fixture application and meet the form's qualification statements, use the [independent adopter check-in](https://github.com/vireocodedev/vireo/issues/new?template=adopter_check_in.yml). The form definitions and submitted issues are public; opening or submitting the rendered forms requires GitHub sign-in. Remove credentials, private source, application data, and identifying project information before posting. Suspected vulnerabilities always use the private security-advisory link instead.

## Customize the template

Start with [`docs/customizing-the-template.md`](docs/customizing-the-template.md). Rename the product, replace the sample Item capability, configure real authentication/bootstrap behavior, and provide deployment secrets through the environment.

To review the Phase 3 generator against the included Purchase Order schema:

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json --dry-run
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
corepack npm run generate:check
```

## Developer documentation

The canonical user guides now live on [vireocode.com](https://vireocode.com/docs/).
The repository copies below retain Template-specific operational detail, contributor
context, and offline access; when guidance differs, the matching Vireo version on the
main website is authoritative.

- [Main Vireo documentation](https://vireocode.com/docs/)
- [Getting started](https://vireocode.com/docs/getting-started/)
- [30-minute vertical slice](https://vireocode.com/docs/guides/30-minute-vertical-slice/)
- [Components and Storybook](https://vireocode.com/docs/components/)
- [Deployment](https://vireocode.com/docs/deployment/)
- [Troubleshooting](https://vireocode.com/docs/troubleshooting/)
- [Versions and exact references](https://vireocode.com/versions/)

- [Getting started and configuration](docs/getting-started.md)
- [Working with Codex in the Template and generated apps](docs/codex.md)
- [30-minute vertical slice](docs/tutorials/30-minute-vertical-slice.md)
- [10-minute flagship evaluation](docs/tutorials/evaluate-flagship.md)
- [Flagship experience and proof](docs/flagship.md)
- [Evaluation and comparison boundaries](docs/comparison.md)
- [Doctor diagnostics and remedies](docs/troubleshooting.md)
- [Customizing the template](docs/customizing-the-template.md)
- [Generated capabilities](docs/generated-capabilities.md)
- [Offline behavior and limits](docs/offline.md)
- [Deployment](docs/deployment.md)
- [Flagship demo operations](docs/flagship-demo.md)
- [Security threat model](docs/security-threat-model.md)
- [Production security hardening](docs/security-hardening.md)
- [Operations and observability](docs/operations.md)
- [Database backup, restore, and major upgrades](docs/database-recovery.md)
- [Incident response](docs/incident-response.md)
- [Starter compatibility and bundle policy](docs/starter-compatibility.md)
- [Version-aware project upgrades](docs/project-upgrades.md)
- [Platform support evidence](docs/platform-support-evidence.md)
- [Verification performance budget](docs/verification-performance.md)
- [Developing against local Starter libraries](docs/local-starter-development.md)
- [Entity query-filter standard](docs/entity-query-filters.md)
- [Frontend architecture contract](frontend/docs/architecture/README.md)
- [Command interface visual language](frontend/docs/VISUAL_LANGUAGE.md)
- [Loading-state and skeleton standard](frontend/docs/LOADING_STATES.md)
- [Loading-state and skeleton audit](frontend/docs/LOADING_STATE_AUDIT.md)
- [Accessibility statement and verification](docs/accessibility.md)
- [Manual accessibility and platform checklist](docs/manual-platform-checklist.md)
- [Interactive Storybook and exact references](https://vireocode.com/reference/)
- [Framework evaluation and limitations](https://github.com/vireocodedev/vireo/blob/main/docs/EVALUATION.md)
- [Vireo public API entry points](https://github.com/vireocodedev/vireo/blob/main/docs/PUBLIC_API.md)
- [Canonical temporal values](https://github.com/vireocodedev/vireo/blob/main/docs/TEMPORAL_VALUES.md)

## Community and project policy

- [Support and issue routing](SUPPORT.md)
- [Governance and decision authority](GOVERNANCE.md)
- [Compatibility and application upgrades](docs/starter-compatibility.md)
- [Contributing](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)
