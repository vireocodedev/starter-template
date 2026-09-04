# Vireo Template

Vireo Template is the production-shaped React PWA and Spring Boot application
baseline used by [`create-vireo`](https://github.com/vireocodedev/vireo). It shows
how the public Vireo packages fit together while generated applications remain
ordinary application code owned by their teams.

Vireo is public `0.x`: its contracts are versioned, but the Template is not a
finished product or a blanket production-readiness claim. Applications still own
their domain rules, authorization, sensitive-data handling, deployment, offline
eligibility, and conflict resolution.

## Create a project

Start from the CLI rather than cloning this maintainer repository:

```bash
npm create vireo@latest operations
```

For a React-only project with mock adapters and no Java or database:

```bash
npm create vireo@latest operations-ui -- --profile frontend
```

Choose a profile before installing: [full stack](https://vireocode.com/docs/getting-started/)
or [frontend only](https://vireocode.com/docs/getting-started/frontend-only/).

## Learn and evaluate

- [Vireo documentation](https://vireocode.com/docs/)
- [Live flagship demo](https://demo.vireocode.com) (`demo` / `demo123`; disposable data)
- [Profile and ownership boundaries](https://vireocode.com/docs/getting-started/choose-your-profile/)
- [Interactive Storybook](https://vireocode.com/storybook/)
- [TypeScript and Java reference](https://vireocode.com/reference/)
- [Current package and Template versions](https://vireocode.com/versions/)

The documentation site is the canonical adopter guide. Template-specific details
remain in [getting started](docs/getting-started.md),
[customization](docs/customizing-the-template.md), and
[deployment](docs/deployment.md).

## Work on this repository

Use Java 21 and Node.js 24 through Corepack. The default development database is
H2, so the first run needs no external service:

```bash
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

Open <http://localhost:3000>, sign in with `demo` / `demo123`, and exercise the
Item workflow. Those credentials and data are development fixtures, not a
production authentication pattern.

Run the same repository-wide gate used by CI before proposing a change:

```bash
corepack npm run verify
```

Focused commands, supported platforms, database modes, and contribution rules are
documented in [CONTRIBUTING.md](CONTRIBUTING.md) and
[getting started](docs/getting-started.md).

## Repository map

- `frontend/` — the React PWA, tests, Storybook, and browser contracts.
- `src/` — the Spring Boot application and integration tests.
- `.vireo/` — project metadata, managed-file provenance, and generator schemas.
- `deploy/` and `compose*.yaml` — production-shaped deployment contracts.
- `scripts/` and `contracts/` — verification, compatibility, and maintainer policy.

Reusable APIs belong in the
[Vireo framework](https://github.com/vireocodedev/vireo); product behavior belongs
in generated applications. Read the
[Template compatibility policy](docs/starter-compatibility.md) before changing
dependencies, schemas, configuration, or projected layout.

## Maintain and contribute

- [Contributing](CONTRIBUTING.md)
- [Support and issue routing](SUPPORT.md)
- [Security reporting](SECURITY.md)
- [Governance](GOVERNANCE.md)
- [Template release preparation](docs/template-release-preparation.md)
- [Flagship demo operations](docs/flagship-demo.md)
