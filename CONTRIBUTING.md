# Contributing to Vireo Starter Template

## Toolchain and packages

Use Java 21, Node.js 24.15–24.x, and Corepack npm 12.0.2. Run
`corepack npm ci` in `frontend`; it resolves the public Vireo packages anonymously
from npm. Gradle resolves Vireo JVM artifacts anonymously from Maven Central.

## Development gate

Run the same repository-wide command used by CI:

```bash
./scripts/verify.sh
```

Use `./scripts/verify.sh silent` when only failures should print command output. During development, narrower commands from `frontend/package.json` and Gradle tasks are encouraged, but the complete gate must pass before merge.

Follow the frontend architecture contract and update tests, stories, localization resources, and documentation with behavior changes. Never make normal production commands depend on a sibling Starter checkout; the local mode is an explicit integration workflow only.

Use the structured issue forms and [support routing](SUPPORT.md) before proposing a
substantial change. Dependency, schema, configuration, generated-code, or Template
layout changes must address [the compatibility and upgrade
policy](docs/starter-compatibility.md).

For every new or changed asynchronous visual surface, declare its loading category (`content-preserving`, `skeleton-capable`, `busy-action`, or `boundary`), geometry level (`A`, `B`, or `C`), canonical state coverage, accessibility owner, and reduced-motion behavior. Page loading MUST reuse the real page composition. See `frontend/docs/LOADING_STATES.md` and the Storybook architecture guide before implementation.

## Pull requests

- Keep commits focused and preserve unrelated worktree changes.
- Explain user-visible behavior and verification performed.
- Do not commit credentials, generated output, local databases, or caches.
- Obtain independent review before merging to `main` once a second trusted
  maintainer is available. During the explicitly documented single-maintainer
  interim state, required checks and resolved conversations remain mandatory, but
  an independent approval cannot be enforced without lockout; see the
  [provider-control and backup-owner limitation](docs/provider-controls-2026-08-31.md).

Maintainers make final merge and release decisions under
[GOVERNANCE.md](GOVERNANCE.md). Contributions do not imply a response or delivery
commitment.
