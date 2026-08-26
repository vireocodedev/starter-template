# Loading-State and Skeleton Audit

**Phase:** 6 — Overview visual and verification refinement

**Status:** Overview Level A contract remediated and verified

**Audited against:** [Vireo Loading-State and Skeleton Standard](LOADING_STATES.md)

**Scope:** Starter Template route boundaries, page compositions, queries, mutations, and loading verification

## Purpose

This document is the Phase 2 compliance baseline for the Starter Template frontend. It records every current loading owner, separates route-code loading from data and action loading, assigns geometry expectations, and establishes the application remediation queue.

This phase does not decide whether a route should remain lazy or become eager. It audits the behavior required whenever a route or its content is pending.

## Rating and priority

| Rating         | Meaning                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Aligned        | The audited behavior follows the applicable standard. Broader verification may still be open.                                          |
| Partial        | The treatment is directionally correct, but ownership, timing, geometry, accessibility, state handling, or verification is incomplete. |
| Non-compliant  | The implementation contradicts a `MUST` or `MUST NOT` requirement.                                                                     |
| Not applicable | The route or component has no independent asynchronous visual state beyond route-code loading.                                         |

| Priority | Meaning                                                                |
| -------- | ---------------------------------------------------------------------- |
| P0       | Application-wide policy or a highly visible reference workflow.        |
| P1       | Material feature, geometry, state, or accessibility gap.               |
| P2       | Narrower consistency, error handling, documentation, or coverage work. |

## Executive baseline

The template already distinguishes initial item loading, retained refresh, incremental pagination, empty results, query errors, and busy mutations in several important paths. Overview also demonstrates the correct structural technique: loaded and loading modes share one page composition and replace only leaves.

The Phase 6 baseline is:

1. Every lazy route now declares its loading presentation policy in the route registry.
2. Unknown route structures use progress-only Level C treatment instead of an invented detailed skeleton.
3. Route, bootstrap, and Overview loading surfaces consume the shared Starter loading boundary and skeleton leaves.
4. Items now applies the shared table and loading-region contracts across initial loading, refresh, empty, initial error, and retained refresh-error states.
5. Overview now verifies exact loaded/loading geometry across English and Croatian, every page-width preference, and real compact/desktop viewports; Items and the shared responsive table retain their alignment contracts.
6. Overlay, mutation, theme, reduced-motion, and broader state-matrix coverage remain for later phases.

## Route-code loading inventory

All route modules in `APP_PAGE_REGISTRY` remain loaded through `React.lazy`. The registry now requires an explicit `retain`, `progress`, `skeleton`, or `none` presentation policy independently of that loading strategy.

| Effective route group                 | Route IDs                                                                           | Current fallback                                                                                                        | Geometry                       | Rating  | Priority |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------- | -------- |
| Application bootstrap and login chunk | `login`, plus authentication recovery before route selection                        | Branded application progress with separate labels, one shared boundary, and delayed visible feedback.                   | C, progress-only               | Aligned | —        |
| Overview route                        | `home`                                                                              | `AppPageHomeView loading`; loaded and loading states share the real header, page body, frame, grid, and card structure. | A                              | Aligned | —        |
| Progress-only authenticated routes    | `items`, `settings`, `devTools`, every `devTools*` example, `forbidden`, `notFound` | Real shell, page layout, width preference, and localized static header with bounded progress-only content.              | C; stable frame/header anchors | Aligned | —        |

The progress-only group contains 20 routes. Its fallback preserves the application shell, `AppPageLayout`, the user's page-width preference, localized static header content, and known back navigation. It deliberately does not speculate about destination actions, tables, forms, cards, canvases, or vertical geometry.

### Required route-policy direction

Every registry entry now declares a policy. A `skeleton` policy remains valid only when the route imports a shared synchronous structure also used by its loaded page; Overview is currently the sole qualifying route.

The later eager-versus-lazy review may remove waits from static routes, but it is deliberately separate from this policy remediation.

## Application surface inventory

| Surface                          | Wait type and category                     | Current treatment                                                                                                                  | Geometry target    | Rating                                      | Priority | Owner                      |
| -------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- | -------- | -------------------------- |
| `AppBootstrapFallback`           | Auth/bootstrap; `boundary`                 | Branded full-screen progress through one shared delayed loading boundary.                                                          | C                  | Aligned                                     | —        | App shell                  |
| `AppRouteFallback` — Overview    | Route code; `boundary`, `skeleton-capable` | Reuses `AppPageHomeView`; skeletonizes leaves in the real page composition through the shared boundary.                            | A                  | Aligned                                     | —        | App shell + Overview       |
| `AppRouteFallback` — progress    | Route code; `boundary`                     | Reuses the page frame, width preference, localized static header, and bounded progress region without invented content.            | C                  | Aligned                                     | —        | App shell + route registry |
| `AppPageHomeView loading`        | Route code; `skeleton-capable`             | Reuses real header, width preference, frame, card grid, typography, and localized text geometry with shared skeleton leaves.       | A                  | Aligned                                     | —        | Overview page              |
| Items initial query              | Initial data; `skeleton-capable`           | Keeps toolbar, reserved result-count slot, table/list frame, headings, and pagination; delegates unknown rows to the shared table. | B; A outer anchors | Aligned                                     | —        | Items feature + Starter UI |
| Items background refresh         | Refresh; `content-preserving`              | Keeps usable rows and controls; one shared delayed boundary owns busy/status semantics and a decorative two-pixel progress line.   | A                  | Aligned                                     | —        | Items feature              |
| Items incremental mobile page    | Pagination; `content-preserving`           | Keeps loaded rows and adds local progress below them.                                                                              | B                  | Aligned                                     | P2       | Items feature + Starter UI |
| Items empty result               | Empty                                      | Keeps table region and renders filtered/first-item/no-data copy with contextual actions.                                           | B                  | Aligned                                     | P2       | Items feature              |
| Items query error                | Error/recovery                             | Renders first-load failure exclusively inside table content; refresh failure retains rows with an overlaid warning and retry.      | B                  | Aligned                                     | —        | Items feature              |
| Item form create/update          | Mutation; `busy-action`                    | Keeps the form and overlay, disables closing, and delegates submit feedback to `VireoFormSubmitButton`.                            | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item delete confirmation         | Mutation; `busy-action`                    | Keeps target context and delegates pending behavior to `VireoConfirmationDialog`.                                                  | A                  | Partial, inherits Starter action contract   | P1       | Item feature + Starter UI  |
| Item history overlay             | Initial data; `skeleton-capable`           | Keeps overlay/header but draws an independent generic skeleton stack for history content. Retains records on refresh failure.      | B                  | Non-compliant                               | P1       | Item feature               |
| Entity-filter definition overlay | Initial data; `boundary`                   | Keeps overlay/header/footer and uses centered progress in a reserved content region.                                               | C                  | Partial                                     | P1       | Query-filter feature       |
| Relation value editor            | Widget query; `content-preserving`         | Keeps the autocomplete control/value and uses MUI local loading behavior.                                                          | A control frame    | Partial                                     | P2       | Query-filter feature       |
| Login submission                 | Mutation; `busy-action`                    | Keeps the login form and delegates pending behavior to `VireoFormSubmitButton`; error remains local.                               | A                  | Partial, inherits Starter action contract   | P1       | Login page + Starter UI    |
| Async data-state example         | Initial data/error; `boundary`             | Demonstrates Suspense success, empty, and error through `VireoQueryBoundary`.                                                      | C by default       | Partial, inherits Starter boundary contract | P2       | Dev tools + Starter UI     |
| Initialization-readiness example | Initialization; `boundary`                 | Keeps the page and card, replaces the card body with step progress, and delegates lifecycle to `VireoInitializationBoundary`.      | B                  | Partial                                     | P2       | Dev tools + Starter UI     |
| Remaining page content           | `static`                                   | No independent data-loading surface was found; only route-code loading applies.                                                    | Not applicable     | Not applicable                              | —        | Owning route               |

## Detailed findings

### T-01 — route policies are explicit and exhaustive

**Rating:** Aligned

**Priority:** Remediated in Phase 4

Every route remains lazy but now declares its presentation policy in `APP_PAGE_REGISTRY`. `AppRouteFallback` exhaustively resolves that metadata without making eager-versus-lazy decisions.

**Remediation record:** The registry requires presentation-only policy metadata and the route boundary resolves it exhaustively. Eager-versus-lazy strategy remains separate.

### T-02 — unknown route structures use progress only

**Rating:** Aligned

**Priority:** Remediated in Phase 4

The generic detailed skeleton has been removed. Progress routes preserve only structure known synchronously: shell, page frame, width preference, localized static header, known back navigation, and a bounded Level C content region.

**Remediation record:** The invented generic skeleton was replaced with page-framed Level C progress. Route-specific skeletons require a synchronously shared loaded structure.

### T-03 — shared loading foundations are adopted at page level

**Rating:** Partial

**Priority:** P1

`AppLoadingSurface`, `AppSkeletonText`, and `AppPageHomeView` now consume `VireoLoadingRegion` and `VireoSkeleton`. `ItemHistoryOverlay` remains on a separate raw skeleton/timing implementation and is deferred to the overlay migration phase.

**Remaining remediation:** Migrate `ItemHistoryOverlay` from raw skeletons and independent timing to the shared foundation during the overlay phase.

### T-04 — Overview proves and verifies the structural pattern

**Rating:** Aligned

**Priority:** Remediated in Phase 6

Overview shares one real page structure across loading and loaded modes. `AppSkeletonText` paints one skeleton fragment per real wrapped line while preserving the same localized typography boxes. Page width flows through `AppPageLayout`, and one shared boundary owns delay, `aria-busy`, and announcement semantics.

**Remediation record:** The browser alignment matrix compares the real loaded and loading anchors for `md`, `lg`, `xl`, and `full` widths in English and Croatian. Storybook runs the matrix at 1440 × 900 and 390 × 844, with its shell navigation context derived from the same `md` breakpoint as the application. Theme and explicit reduced-motion sweeps remain global verification work rather than Overview-specific geometry gaps.

### T-05 — Items initial loading preserves the workflow frame

**Rating:** Aligned

**Priority:** Remediated in Phase 5

Search, filters, page frame, table/list frame, headings, and pagination remain in place. Initial row placeholders are selected only when there is no usable data. The result-count chip remains mounted in a bounded reserved slot, and the shared table owns delayed skeleton timing while deriving desktop and mobile placeholders from real row/cell structures.

**Remediation record:** Focused integration tests cover initial/loading/empty/error/refresh states plus compact mobile loading at small density. Storybook exposes the canonical state matrix and a browser geometry contract for the page, toolbar, data region, table, and desktop count slot.

### T-06 — Items refresh and error ownership are explicit

**Rating:** Aligned

**Priority:** Remediated in Phase 5

`useItemSearchQuery` distinguishes `isLoading`, `isRefreshing`, and `isFetchingNextPage`, retains previous data, and exposes local retry. Initial loading is owned by the shared table; retained refresh is owned by one enclosing `VireoLoadingRegion`; incremental mobile fetching remains table-local. First-load errors replace the table's ordinary empty state, while refresh errors retain rows and provide a warning with retry.

**Remediation record:** Initial loading, retained refresh, incremental pagination, empty, initial error, and retained refresh-error now have mutually coherent ownership and recovery behavior.

### T-07 — Item history duplicates layout in a separate skeleton tree

**Rating:** Non-compliant  
**Priority:** P1

The overlay frame and title remain stable, but the loading content is a hard-coded text bar plus two rectangular blocks rather than the real `VireoHistoryEntry` structure. The skeleton owns its own reveal timing, and its 240 px reservation does not constitute a declared geometry contract.

**Required remediation:** Introduce a loading mode or reusable structure for history entries that shares the loaded frame, skeletonize only unknown leaves, and let the overlay content boundary own timing and announcements.

### T-08 — filter-definition progress lacks complete boundary semantics

**Rating:** Partial  
**Priority:** P1

Because the server determines the filter schema, a progress-only Level C content region is appropriate. The progress control has an accessible label, but the stable content region has no `aria-busy`/status ownership. The error branch also replaces the form whenever `isError` is true, even if usable definition data is available.

**Required remediation:** Put busy and status semantics on the smallest stable overlay content region, keep the indicator decorative within it, and preserve usable form content with a refresh warning when stale definition data exists.

### T-09 — relation-option loading has no visible recovery contract

**Rating:** Partial  
**Priority:** P2

The relation autocomplete correctly preserves its input and selected values during option loading. Query failure currently collapses into an ordinary no-options experience, so a failed request is indistinguishable from a valid empty result.

**Required remediation:** Define local empty, error, retry, and retained-value behavior and verify that the field remains operable and announced without replacing its frame.

### T-10 — bootstrap and login-route ownership are distinct

**Rating:** Aligned

**Priority:** Remediated in Phase 4

Authentication bootstrap and login route-code loading now provide separate labels through the same presentation primitive. Each uses one stable busy region and reveals its progress indicator and polite status through the shared delay contract.

**Remediation record:** Bootstrap and login route loading retain separate labels while sharing the same application-progress presentation primitive and boundary semantics.

### T-11 — verification now includes the Items reference workflow

**Rating:** Partial

**Priority:** P1

Overview and Items have Storybook alignment contracts. Overview exercises both supported locales, all page-width preferences, and real compact/desktop browser viewports. Items additionally exercises loaded, initial loading, refreshing, empty, initial error, retained refresh-error, compact mobile loading, small density, retry, delayed visibility, and announcement uniqueness. Route-policy exhaustiveness and localized header keys also have focused coverage. Overlays, mutations, theme variants, explicit reduced-motion assertions, and the broader announcement matrix remain open.

**Required remediation:** Add tests alongside each remediation. Remaining state transitions, accessibility ownership, themes, reduced motion, and CLS thresholds must become executable contracts without weakening the existing Level A/B, responsive, density, and localization coverage.

## State-transition coverage baseline

| Transition                                    | Best current reference                | Gap                                                                          |
| --------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| Initial loading → content                     | Overview and Items                    | Overview's width/locale/viewport geometry is covered; broader themes remain. |
| Initial loading → empty                       | Items and async-state example         | Items is covered; other query boundaries remain inconsistent.                |
| Initial loading → error                       | Items                                 | Items is exclusive and recoverable; overlays remain inconsistent.            |
| Content → refresh → updated                   | Items                                 | Retention, ownership, and state coverage are aligned.                        |
| Content → refresh error with retained content | Items and item history                | Items is aligned; the pattern is not yet generalized to overlays.            |
| Content → mutation → success/error            | Item form, delete confirmation, login | Shared busy-action semantics remain incomplete.                              |
| Route code → destination                      | Overview and page progress            | Overview is exact; other routes preserve known anchors only.                 |

## Remediation order

1. **Route contract (complete):** typed per-route policies replace the invented generic fallback with a compliant Level C treatment.
2. **Starter foundation adoption (complete for Phase 4 surfaces):** route, bootstrap, and Overview loading use shared boundaries, tokens, and skeleton leaves.
3. **Items pilot (complete):** responsive-table integration, result-count geometry, exclusive error/empty behavior, refresh ownership, recovery, and canonical stories.
4. **Overview return (complete):** refine multiline leaves and verify exact geometry across locale, page width, compact, and desktop scenarios.
5. **Overlay migration:** remediate item history, filter definition, and relation-option states.
6. **Busy-action integration:** adopt the finalized Starter form and confirmation contracts in item and login flows.
7. **Verification sweep:** add the remaining route, state, accessibility, motion, theme, and CLS matrix.
8. **Separate route strategy review:** only after visual contracts are stable, decide which static routes should be eager or lazy.

## Phase 2 exit record

- [x] All 22 lazy routes inventoried.
- [x] Route-code, initial-data, refresh, pagination, mutation, empty, and error states separated.
- [x] Application loading surfaces classified.
- [x] Geometry targets assigned.
- [x] Accessibility and announcement ownership gaps recorded.
- [x] Remediation priorities and repository owners assigned.
- [x] Eager-versus-lazy decisions explicitly deferred.
- [x] Phase 4 route-policy and page-loading convention findings remediated.
- [x] Phase 5 Items data-workflow pilot remediated and verified.
- [x] Phase 6 Overview visual leaves and width/locale/viewport geometry remediated and verified.
- [ ] Remaining overlay, widget, busy-action, and broader verification findings remediated in later phases.
