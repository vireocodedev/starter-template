# Dependency boundaries

- Code inside one capability uses relative imports.
- Cross-feature consumers import `@/features/<feature>/public`; a feature never imports its own public entry point.
- Pages may import app foundations and feature public APIs. They do not import feature internals or other pages.
- App foundations do not depend on business features. `App.tsx` is the runtime composition boundary; `app.localization.ts` is the explicit compile-time registry allowed to import feature localization resources.
- Only feature `public.ts` files are barrels. Root, page, and component barrels are prohibited.
- Use explicit `import type` for type-only imports.
- `@/*` resolves to `src/*` in TypeScript, Vite, Vitest, Storybook, and Playwright.
- Starter dependencies are imported through their public package entry points. Application wrappers are justified only when they add application policy.

The architecture test rejects legacy roots, forbidden dumping-ground directories, deep cross-feature imports, page-to-page imports, feature dependencies from app foundations, and missing feature public APIs.
