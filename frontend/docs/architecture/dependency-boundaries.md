# Dependency boundaries

- Code inside one capability uses relative imports.
- Cross-feature consumers import `@/features/<feature>/public`. A narrowly scoped `@/features/<feature>/<area>/public` entry is allowed when measured bundle boundaries would otherwise pull an entire capability into an eager consumer. A feature never imports its own public entry point.
- Pages may import app foundations and feature public APIs. They do not import feature internals or other pages.
- App foundations do not depend on business features. The named files under `app/adapters/` are explicit runtime composition boundaries and may import feature public APIs; `app.localization.ts` is the explicit compile-time registry allowed to import feature localization resources. Other app providers, shell, data, configuration, and UI foundations may not import business features.
- `generated/` is a managed capability registry, not an application foundation or a feature dumping ground. Generated files may import one another; only `app.pages.ts` and `app.localization.ts` consume that registry from handwritten code.
- Only feature public-entry files are barrels. Root, page, and component barrels are prohibited.
- Use explicit `import type` for type-only imports.
- `@/*` resolves to `src/*` in TypeScript, Vite, Vitest, Storybook, and Playwright.
- Starter dependencies are imported through their public package entry points. Application wrappers are justified only when they add application policy.

The architecture test rejects legacy roots, forbidden dumping-ground directories, non-public cross-feature imports, page-to-page imports, undeclared app-to-feature imports, generated-registry imports outside its composition boundary, and missing feature public APIs. The Item query-only public entry keeps the eager overview below the production chunk budget without exposing feature internals.
