# Vireo Template Maintainers

This repository is the source Template consumed by `create-vireo`. Work here has two audiences: Template maintainers and generated applications. Keep those contracts separate.

## Routing

- Frontend behavior, PWA, and published/local Starter modes: read `frontend/AGENTS.md`.
- JVM application code, Flyway, and HTTP boundaries: read `src/AGENTS.md`.
- launchers, policies, verification, and Template release logic: read `scripts/AGENTS.md`.
- Creation/projection/upgrade behavior belongs in the adjacent Vireo repository, not in undocumented Template-only conventions.

## Template-maintainer rules

- Preserve published Starter consumption as the default. Local Starter resolution is explicit integration work.
- Before adding, moving, or changing a Template file, classify it in the application projection contract: managed, application-owned, optional, substitution-required, or excluded for both profiles.
- Keep maintainer-only policies, release operations, flagship evidence, and maintainer skills out of generated applications.
- Application-facing Codex guidance is stored under `.vireo/application/`; it is projected to a generated application's root and becomes application-owned.
- Use focused checks while editing. Full verification, deployment, release, and external operations need coordination and explicit authorization.

Read `docs/generated-capabilities.md`, `docs/project-upgrades.md`, and `docs/local-starter-development.md` for the maintained contracts.
