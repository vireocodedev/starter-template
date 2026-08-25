# Customizing the template

Use this checklist when creating an application from the repository.

1. Rename the Gradle root, npm package, Spring application, browser title, PWA manifest, Java base package, localization copy, and preference-storage key.
2. Replace the sample Item capability end to end: migration, entity, DTO, mapper, service, API client, schemas, queries, forms, table, history, tests, and stories.
3. Replace `DevBootstrapConfig` with application-owned provisioning. The sample credentials are restricted to the `dev` profile but are intentionally public.
4. Decide whether Dev tools belongs in the product. Remove its routes and navigation entry from release builds when it does not.
5. Configure the production database, trusted proxy behavior, cookie policy, allowed origins, authentication integration, monitoring, backups, and secret manager.
6. Replace the demonstration icon and metadata in `frontend/public`, `index.html`, and `vite.config.ts`.
7. Run `./scripts/verify.sh` from a clean checkout before merging.

Application code follows the mandatory [frontend architecture contract](../frontend/docs/architecture/README.md). Reusable React behavior belongs in Starter UI; application composition stays here.
