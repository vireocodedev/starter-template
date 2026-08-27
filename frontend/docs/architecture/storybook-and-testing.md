# Storybook and testing

The application has its own Storybook; it is not merged into the Starter library Storybook. Stories use deterministic data, application providers, and mocked feature APIs—never a real backend.

Navigation groups are `DOCUMENTATION`, `APPLICATION`, `FEATURES`, and `PAGES`. Reusable and state-rich components receive colocated stories. Route components, providers, API clients, and tiny private fragments do not receive stories automatically.

Async-capable page stories use the applicable canonical names: `Loaded`, `Loading`, `Refreshing`, `Empty`, `Error`, and `AlignmentContract`. Omitted states must be intentional and explained in the page documentation. `Default` may remain as the introductory story but does not replace the canonical state story.

Every story module that exports an asynchronous canonical state MUST declare `parameters.vireo.loading.categories` and `parameters.vireo.loading.geometry`. The architecture gate validates those declarations. Supported categories are `boundary`, `busy-action`, `content-preserving`, and `skeleton-capable`; geometry is `A`, `B`, or `C` as defined by the loading-state standard.

Page skeletons MUST be modes of the real page composition. Standalone `*PageSkeleton` or `*RouteSkeleton` trees and raw MUI `Skeleton` imports are rejected by the architecture gate. Application leaves use the Vireo skeleton primitives, while the owning boundary controls reveal timing and announcements.

Items is the reference data-workflow matrix. In addition to the canonical states, it exposes `RefreshError` to prove that stale rows remain usable when a background request fails. Its alignment contract compares the real loaded and initial-loading page frame, toolbar, table region, and reserved result-count geometry.

Overview is the reference Level A skeleton composition, retained in Storybook even though the static production route is now eager and has no route-code wait. Its alignment matrix renders one shared loaded/loading composition for English and Croatian, light and dark color schemes, and every supported page-width preference (`md`, `lg`, `xl`, and `full`), then compares the real header, frame, title, and card rectangles. Skeleton text uses the loaded copy's real typography and wrapping rather than a separately estimated line layout.

Alignment stories initiate loading programmatically and observe the browser's Layout Instability API so recent user input cannot mask a shift. Exact Level A surfaces use a `0.001` maximum unexpected CLS score; bounded Level B surfaces use `0.01`. The rectangle contract remains alongside CLS because it identifies which anchor broke, while CLS captures movement visible to the user.

Frontend confidence has three pillars:

1. Vitest unit and integration tests for models, services, hooks, and composition.
2. Storybook interaction, accessibility, and visual-state coverage for UI contracts. Every story is smoke-rendered and accessibility violations fail.
3. Playwright E2E tests for boot, authentication/session recovery, shell navigation, Item CRUD, and 403/404 behavior.

`corepack npm run test:storybook` transforms every story into a browser test through Storybook's Vitest addon. Every story is smoke-rendered, every `play` function is executed, and project-level accessibility violations fail through `@storybook/addon-a11y`. The ordinary-motion suite runs in desktop Chromium at 1440 × 900 and mobile Chromium at 390 × 844; the reduced-motion project reruns the contracts with the browser preference forced to `reduce`. Storybook derives shell compactness from the same `md` breakpoint as the application unless a story explicitly overrides it.

`corepack npm run verify` runs architecture checks, formatting, lint, unit/integration tests, browser-based Storybook tests, the production application build, and the production Storybook build with ordered steps and timings. It always exercises published Starter packages and is the release-facing default. E2E remains a separate command.

Local Starter integration is always explicit: use `corepack npm run verify:local-starter` for the equivalent suite against emitted packages from the adjacent Starter checkout, or the other `*:local-starter` commands for focused local work. Both published and local modes must pass before coordinated Starter/template releases, but filesystem layout never changes what a default command resolves.
