# Template frontend

The frontend is a Vite PWA consumed either as `frontend/` in a full-stack application or as the root of a frontend-only projection.

- Default commands and TypeScript resolution must use published `@vireocodedev/*` packages. Select local Starter mode only for explicit framework integration work.
- Preserve the PWA identity, service-worker, history fallback, API routing, and production header contracts when changing frontend infrastructure.
- Keep accessible names, localization, dark-theme behavior, loading states, and offline semantics as application behavior—not cosmetic follow-up work.
- Avoid editing generated capability boundaries by hand unless the capability was deliberately ejected.

Read `docs/LOADING_STATES.md`, `docs/VISUAL_LANGUAGE.md`, and the nearest test/contract before changing a public UI flow.
