---
name: vireo-app-upgrader
description: Use for Vireo consumer application upgrades; not framework release execution.
---

# Vireo App Upgrader

Use this skill when updating a generated Vireo application, `create-vireo`, Template provenance, or Vireo package coordinates. Do not use it for a framework release itself.

## Establish what is supported

- Read `.vireo/project.json` if present and run the project’s status command only when its installed/declared CLI supports it.
- For legacy projects without current metadata, inventory installed Vireo packages, Template history, generated manifests, migrations, and current verification scripts before recommending a path.
- Do not invent a release edge. An unsupported or EOL source requires a manual migration plan, not a forced CLI upgrade.

## Safe upgrade workflow

- Start on a clean branch with a recoverable database backup when persistent data is involved.
- Review a non-writing plan first. It may update declared managed files but cannot decide application-owned source, migrations, deployment, or ejected capabilities.
- Refresh the applicable lockfile only after the managed plan is accepted, then resolve application-owned work and run the project’s documented checks.
- Define rollback against both code and schema. Never route an older binary to a newer database unless that mixed state was explicitly designed and rehearsed.
