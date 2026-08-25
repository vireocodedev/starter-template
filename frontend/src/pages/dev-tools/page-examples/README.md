# Dev Tools page examples

Each example in this directory is an isolated, miniature application slice. The example directory itself represents the relevant application source root, without an additional `src/` wrapper.

- The route-level page component sits directly in the example directory.
- `features/` contains domain models, forms, workflows, hooks, and other feature-owned code.
- Only architectural folders actually needed by an example should be created.
- Shared application infrastructure continues to be imported from the template's real `src/app/` tree.

This makes every example useful as an architectural reference without repeating `src/pages/<page-name>` underneath a directory that already identifies the page.

`entity-query-filters/` intentionally stays page-only: it demonstrates the reusable application capability from `src/features/entity-query-filters` rather than duplicating that capability inside the example.
