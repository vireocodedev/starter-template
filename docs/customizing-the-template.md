# Customizing the template

Use this checklist when creating an application from the repository.

1. Rename the Gradle root, npm package, Spring application, Java base package, localization copy, and preference-storage key. Update `frontend/pwa-policy.mjs` once for browser title, runtime product name, manifest identity, description, theme, scope, and icon references.
2. Replace the sample Item capability end to end, or generate an additional scalar/enum capability from `.vireo/examples/purchase-order.entity.json` and then customize or eject the ordinary application code.
3. Replace `DevBootstrapConfig` with application-owned provisioning. The sample credentials are restricted to the `dev` profile but are intentionally public.
4. Configure the production database, trusted proxy behavior, cookie policy, allowed origins, authentication integration, monitoring, backups, and secret manager.
5. Replace the demonstration icon files in `frontend/public/icons` and update their references in `frontend/pwa-policy.mjs`.
6. Run `./scripts/verify.sh` from a clean checkout before merging.

Application code follows the mandatory [frontend architecture contract](../frontend/docs/architecture/README.md). Reusable React behavior belongs in Starter UI; application composition stays here.

Generated capability ownership, contract checks, refusal behavior, and the non-destructive ejection path are documented in [generated capabilities](generated-capabilities.md).
