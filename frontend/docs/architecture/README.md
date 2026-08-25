# Frontend architecture

This directory is the authoritative contract for application code in the Vireo template. Code, examples, tests, and architecture checks must evolve together with these documents.

## Contracts

- [Source structure](source-structure.md)
- [Dependency boundaries](dependency-boundaries.md)
- [Models, forms, and validation](models-forms-and-validation.md)
- [API, query, and offline](api-query-and-offline.md)
- [Localization](localization.md)
- [Routing and shell](routing-and-shell.md)
- [Styling and assets](styling-and-assets.md)
- [Storybook and testing](storybook-and-testing.md)
- [Authentication and errors](authentication-and-errors.md)

## Governing principles

1. `app` owns global composition and infrastructure, `features` own business capabilities, and `pages` compose routes.
2. Cross-capability imports use an explicit `public.ts`; private implementation stays private.
3. Runtime data is parsed with Zod at trust boundaries.
4. Every production-facing string is localized by its owning capability.
5. Starter packages are consumed only through published entry points.
6. No `shared`, `common`, `helpers`, or generic `utils` dumping grounds are allowed.
