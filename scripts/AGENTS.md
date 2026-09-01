# Template scripts and policies

Scripts define the supported development, verification, deployment, Template release, and recovery contracts.

- Keep policy checks deterministic and targeted; extend the closest existing policy rather than creating parallel enforcement.
- Keep launcher and Doctor diagnostics safe to run without printing secret values.
- A Template release is not a generated-app release. Do not project Template release policy, provider controls, evidence, or maintainer recovery operations.
- Deployment, registry, GitHub settings, secrets, and production evidence require explicit user authorization.

Use package scripts as the canonical entry points and preserve their profile-aware behavior.
