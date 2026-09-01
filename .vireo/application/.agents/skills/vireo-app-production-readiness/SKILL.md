---
name: vireo-app-production-readiness
description: Use for production-readiness reviews of Vireo consumer apps; not a substitute for narrow feature tests.
---

# Vireo App Production Readiness

Use this skill for a consumer app deployment or production-readiness review. Do not use it as a substitute for a narrow feature test.

- Discover the actual profile, deployment shape, persistence, identity model, and operational owner before applying a checklist.
- Verify repository-controlled work: production-safe configuration, dependency/security checks, migrations, tests, build artifacts, headers, health/readiness behavior, and documentation.
- Separate human work clearly: secrets and provider configuration, TLS/ingress, domain authorization decisions, data classification/retention, monitoring ownership, backups/restore rehearsal, incident contacts, legal/privacy review, and deployment approval.
- Never print secrets, weaken production settings for convenience, or claim an environment is ready merely because a local Compose check passes.
- Keep a dated evidence record that identifies what was checked, what remains human-owned, and who owns the next decision.
