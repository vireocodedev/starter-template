# Vireo application guidance

This file is copied once when the project is created. It belongs to the application team; adapt it to your product after reviewing it.

- Start by reading `.vireo/project.json` when present. It identifies the generation profile and records the Template/CLI provenance.
- Keep generated capability manifests, contracts, and indexes managed until you intentionally eject the capability. Put domain-specific changes in application-owned code and migrations.
- For full-stack projects, frontend code lives under `frontend/`; for frontend-only projects, it lives at the project root. Inspect the actual package scripts before choosing commands.
- Treat database migrations, deployment configuration, secrets, product identity, authorization, and release approval as application-owned decisions.
- A project upgrade can safely change only declared managed files. Review and port application-owned changes yourself; never accept an upgrade plan as evidence that domain or production work is complete.

The shipped Vireo skills complement this file. They must adapt to older projects that lack current metadata or use legacy package coordinates.
