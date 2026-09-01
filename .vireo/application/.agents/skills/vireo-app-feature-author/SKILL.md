---
name: vireo-app-feature-author
description: Use for end-to-end Vireo consumer application features; not Vireo framework or Template source changes.
---

# Vireo App Feature Author

Use this skill for an end-to-end feature in a Vireo consumer app. Do not use it to change the Vireo framework or Template source.

## Discover the project before planning

1. If `.vireo/project.json` exists, read it and use its `profile`, provenance, and generation information. Then inspect the relevant package manifest and available scripts.
2. In a `full-stack` project, frontend work normally lives in `frontend/` and backend/Flyway work at the root. In a `frontend` project, frontend work is at the root. Follow the checked-in layout rather than hard-coding this convention.
3. If metadata is absent or legacy coordinates are installed, inspect dependencies, manifests, and existing code. Do not assume a current generator, package name, or upgrade path.

## Ownership and implementation

- Use Vireo generation only for supported capability shapes. Review its dry-run and generated ownership before writing; generated manifests/contracts/indexes remain managed until ejected.
- Implement product rules, authorization, tenant boundaries, accessible names, localization, validation, migrations, and deployment effects in application-owned code.
- Add an append-only migration for persistent-schema changes. Do not rewrite a migration already used outside a disposable local database.
- Use the project’s own focused tests and scripts. Escalate to its full verification only after feature boundaries are complete.
