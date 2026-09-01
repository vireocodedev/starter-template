---
name: vireo-template-maintainer
description: Use for Vireo Template source and projection maintenance; not work inside an already generated application.
---

# Vireo Template Maintainer

Use this skill when changing the Template source, its profile split, release coordinates, or projection-facing application assets. Do not use it for a feature inside an already generated application.

- Read [generated capabilities](../../../docs/generated-capabilities.md), [project upgrades](../../../docs/project-upgrades.md), and [local Starter development](../../../docs/local-starter-development.md).
- Classify every changed source path for full-stack and frontend projection before changing Template behavior. Keep application-owned decisions reviewable and managed infrastructure upgradeable.
- Keep `.vireo/application/` limited to app-facing Codex guidance. Never place Template release instructions, flagship operations, evidence, or maintainer workflows there.
- Published Starter consumption remains the normal mode. Use local Starter only for explicit cross-repository integration checks.

Run focused source-policy checks and create-vireo fixtures when projection behavior changes.
