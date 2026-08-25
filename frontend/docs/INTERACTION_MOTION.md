# Interaction and motion policy

The application consumes Vireo's shared motion language and owns only shell, route, PWA lifecycle, and feature-specific feedback.

## Application-owned behavior

- The authenticated shell remains mounted while lazy routes load. Route fallback skeletons replace only the page subtree.
- Supported navigations use the browser View Transition API for a short page crossfade; unsupported browsers navigate immediately.
- Browser-history entries restore their own contained page scroll position. New entries start at the top.
- Mobile navigation and full-screen workflows preserve safe areas and use spatial overlay transitions.
- Initial empty data loads use delayed, shape-matched skeletons. Refetches retain stale data and show contextual progress.
- Item update and delete mutations change cached rows optimistically, roll back exactly on failure, then reconcile with the server.
- Confirmation and completion copy identifies the affected record. Empty states provide the relevant create or clear action.
- Offline, PWA update, and query errors appear inline or contextually without replacing usable page content.

## Reduced motion

`APP_THEME_TOKENS` is the application token source and the MUI theme maps it to semantic transition durations and easings. Every application-authored keyframe or transition must include a `prefers-reduced-motion: reduce` path. Reduced motion removes travel, scale, and indeterminate progress animation without removing state or feedback.

## Performance boundaries

- Animate transform and opacity for routes and surfaces; use color only for small local feedback.
- Never use `transition: all`.
- Continuous resize writes a CSS width variable at most once per animation frame.
- Do not animate every row during pagination, sorting, filtering, realtime updates, or large-list hydration.
- Do not replace stale data with skeletons during background work.

## Sensory feedback

Sound is intentionally absent. Haptics are not enabled by default because the starter has no product-level sensory preference and browser support is inconsistent. A derived product may add capability-checked, user-controlled haptics for a rare direct-manipulation or confirmation workflow; visible and assistive feedback remains mandatory.

## Release checks

Verify desktop, coarse pointer, keyboard-only, lower-end mobile, installed PWA, offline/reconnect, back/forward navigation, success and rollback, and `prefers-reduced-motion: reduce`. Watch for focus loss, layout shifts, content flashes, dropped frames, long tasks, and bundle growth.
