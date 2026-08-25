# Contributing to Vireo Starter Template

## Toolchain and packages

Use Java 21, Node.js 24.15 or newer, and npm 12. Configure GitHub Packages as described in the root README, then run `npm ci` in `frontend`.

## Development gate

Run the same repository-wide command used by CI:

```bash
./scripts/verify.sh
```

Use `./scripts/verify.sh silent` when only failures should print command output. During development, narrower commands from `frontend/package.json` and Gradle tasks are encouraged, but the complete gate must pass before merge.

Follow the frontend architecture contract and update tests, stories, localization resources, and documentation with behavior changes. Never make normal production commands depend on a sibling Starter checkout; the local mode is an explicit integration workflow only.

## Pull requests

- Keep commits focused and preserve unrelated worktree changes.
- Explain user-visible behavior and verification performed.
- Do not commit credentials, generated output, local databases, or caches.
- Obtain review before merging to `main`.
